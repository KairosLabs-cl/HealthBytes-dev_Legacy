# Reporte de Auditoría de Infraestructura — `01_infra.md`

**Fecha:** 2026-04-02
**Auditor:** Principal Software Architect / DevOps Engineer (AI)
**Scope:** Docker Compose · Dockerfiles · GitHub Actions CI/CD · ECS/ECR · SSM/Secrets · pyproject.toml · FastAPI middleware stack
**Severidad:** 🔴 Crítico · 🟠 Alto · 🟡 Medio · 🟢 Bajo / Bien hecho

---

## Índice

1. [Executive Summary](#1-executive-summary)
2. [Docker Compose](#2-docker-compose)
3. [Dockerfiles](#3-dockerfiles)
4. [GitHub Actions — CI (`ci.yml`)](#4-github-actions--ci-ciyml)
5. [GitHub Actions — Deploy (`deploy.yml`)](#5-github-actions--deploy-deployyml)
6. [AWS ECS Fargate + ECR](#6-aws-ecs-fargate--ecr)
7. [Gestión de Secretos (SSM / GitHub Secrets)](#7-gestión-de-secretos-ssm--github-secrets)
8. [Cobertura de Tests — `pyproject.toml`](#8-cobertura-de-tests--pyprojecttoml)
9. [FastAPI Middleware Stack](#9-fastapi-middleware-stack)
10. [Topología de API Gateway](#10-topología-de-api-gateway)
11. [Resumen de Hallazgos](#11-resumen-de-hallazgos)
12. [Plan de Acción Priorizado](#12-plan-de-acción-priorizado)

---

## 1. Executive Summary

El proyecto tiene una base de seguridad **sólida** para un MVP: multi-stage builds, healthchecks en todos los servicios, lint + SAST (Bandit) + secret-scanning (Gitleaks) en CI, y un middleware stack de FastAPI bien razonado. Sin embargo existen **siete problemas** que deben corregirse antes de un despliegue en producción real, dos de ellos críticos.

| ID | Área | Severidad | Título |
|----|------|-----------|--------|
| I-01 | Docker Compose | 🔴 | Secretos por defecto hardcodeados en compose |
| I-02 | Docker Compose | 🟠 | Redis expuesto en host sin autenticación |
| I-03 | Docker Compose | 🟠 | Hot-reload vía bind-mount en producción |
| I-04 | Dockerfile backend | 🟡 | Imagen corre como `root` |
| I-05 | CI `ci.yml` | 🟠 | `safety check` no falla el pipeline |
| I-06 | CI `ci.yml` | 🟡 | `frontend-test` no enforce cobertura |
| I-07 | CI / deploy | 🟡 | AWS credentials vía long-lived IAM keys |
| I-08 | deploy.yml | 🔴 | Tarea ECS como JSON en GitHub Secret |
| I-09 | deploy.yml | 🟠 | Migraciones sin rollback gate |
| I-10 | Secretos | 🟠 | `storage_uri=memory://` en rate limiter en producción |
| I-11 | FastAPI middleware | 🟡 | Orden de registro de middlewares en Starlette |
| I-12 | FastAPI auth | 🟡 | `verify_seller` devuelve 401 en vez de 403 |
| I-13 | Config | 🟢 | `ACCESS_TOKEN_EXPIRE_MINUTES = 43200` (30 días) |

---

## 2. Docker Compose

### I-01 🔴 Secretos por defecto hardcodeados

**Archivo:** `docker-compose.yml` líneas 8-9

```yaml
# ACTUAL — PROBLEMÁTICO
POSTGRES_PASSWORD: ${DB_PASSWORD:-healthbytes_dev}
```

**El problema:** El operador `:-` es un fallback que se activa si la variable no está definida. Si alguien corre `docker-compose up` sin un `.env`, el password de Postgres será `healthbytes_dev` y funcionará silenciosamente. Esto crea **ambigüedad peligrosa**: en un servidor mal configurado, la DB queda expuesta con credenciales predecibles.

**Trade-off del error:** La comodidad de desarrollo en frío (zero-config) vs. el riesgo de que un ambiente de staging/CI levante la DB con credenciales conocidas públicamente. El contrato correcto es: "si falta la variable, falla rápido y ruidoso".

**Configuración óptima:**

```yaml
# docker-compose.yml — postgres service
environment:
  POSTGRES_USER: ${DB_USER:?DB_USER must be set in .env}
  POSTGRES_PASSWORD: ${DB_PASSWORD:?DB_PASSWORD must be set in .env}
  POSTGRES_DB: ${DB_NAME:?DB_NAME must be set in .env}
  PGDATA: /var/lib/postgresql/data/pgdata
```

El operador `:?` abortará `docker-compose up` con un mensaje de error explícito si la variable no está definida, forzando al desarrollador a crear su `.env` desde `.env.example`.

Adicionalmente, proveer un `.env.example` con instrucciones:

```bash
# .env.example
DB_USER=healthbytes
DB_PASSWORD=CHANGE_ME_generate_with_openssl_rand_hex_32
DB_NAME=healthbytes
JWT_SECRET=CHANGE_ME_generate_with_openssl_rand_hex_64
```

---

### I-02 🟠 Redis expuesto en host sin autenticación ni password

**Archivo:** `docker-compose.yml` líneas 106-119

```yaml
redis:
  image: redis:7-alpine
  ports:
    - "6379:6379"   # ← expuesto al host
```

**El problema:** Redis 7 sin `requirepass` escucha en `0.0.0.0` dentro del contenedor. Mapeado al host, cualquier proceso local —o un atacante con acceso a la red del desarrollador— puede conectarse, leer/escribir el store de rate limiting, y potencialmente vaciar los contadores para bypass de límites.

**Trade-off del error:** Comodidad de debugging local (conectarse con `redis-cli` sin password) vs. superficie de ataque abierta. El daño en producción sería crítico porque el rate limiter usa `storage_uri=memory://` allí (ver I-10), pero en staging sí usa Redis.

**Configuración óptima:**

```yaml
redis:
  image: redis:7-alpine
  command: >
    redis-server
    --requirepass ${REDIS_PASSWORD:?REDIS_PASSWORD must be set}
    --bind 127.0.0.1
    --protected-mode yes
  ports:
    - "127.0.0.1:6379:6379"   # bind solo a loopback
  environment:
    REDIS_PASSWORD: ${REDIS_PASSWORD}
```

Y en el backend:

```bash
# .env
REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379/0
```

---

### I-03 🟠 Bind-mounts de código fuente activos (hot-reload implícito)

**Archivo:** `docker-compose.yml` líneas 47-48, 82-88

```yaml
# backend
volumes:
  - ./backend/app:/app/app   # ← sobrescribe lo que el Dockerfile copió

# frontend
volumes:
  - ./frontend/app:/app/app
  - ./frontend/components:/app/components
  # ...
```

**El problema:** Estos mounts sobreescriben el filesystem construido en la imagen con el código del host. Son excelentes para desarrollo pero el mismo `docker-compose.yml` no tiene un perfil de `profiles:` que los separe de un uso en staging.

**Trade-off del error:** Un ingeniero que ejecute `docker-compose up` en un servidor de staging obtendrá una imagen que ejecuta el código del directorio de trabajo del CI runner —no el código auditado que fue buildeado en la imagen. Esto rompe la inmutabilidad y la trazabilidad del artefacto.

**Configuración óptima:** Usar `profiles` de Docker Compose para aislar la configuración de desarrollo:

```yaml
# docker-compose.yml  — sin volumes en el servicio raíz
services:
  backend:
    build: ...
    # SIN volumes de código aquí

# docker-compose.override.yml  — solo para desarrollo local
# Docker Compose lo carga automáticamente si existe
services:
  backend:
    volumes:
      - ./backend/app:/app/app
    environment:
      ENVIRONMENT: dev
```

Así, `docker-compose up` en CI/staging no tiene bind-mounts y ejecuta el código de la imagen.

---

## 3. Dockerfiles

### I-04 🟡 Imagen corre como `root`

**Archivo:** `backend/Dockerfile`

```dockerfile
# ACTUAL — corre como root (no hay USER)
CMD ["python", "-m", "uvicorn", "app.main:app", ...]
```

**El problema:** Si Uvicorn o cualquier dependencia tiene una vulnerabilidad de ejecución de código, el proceso comprometido tiene acceso root al contenedor. En Fargate esto es contenido por el sandbox de ECS, pero es una violación del principio de menor privilegio y puede fallar compliance checks (CIS Docker Benchmark, AWS Security Hub).

**Trade-off del error:** Añadir un usuario no-root es 3 líneas y cero costo operativo. El único "trade-off" es que hay que ajustar los permisos del directorio `/app` — lo cual es trivial.

**Configuración óptima:**

```dockerfile
# Stage 2: Runtime — agregar al final, antes del CMD
RUN groupadd --gid 1001 appgroup && \
    useradd --uid 1001 --gid appgroup --shell /bin/sh --create-home appuser

# Dar ownership al directorio de trabajo
RUN chown -R appuser:appgroup /app /root/.local

USER appuser

EXPOSE 3001
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "3001"]
```

**Nota adicional:** El `frontend/Dockerfile` tiene el mismo problema: corre `pnpm start` como root. Aplicar el mismo patrón.

---

## 4. GitHub Actions — CI (`ci.yml`)

### ✅ Lo que está bien

- `permissions: contents: read` a nivel workflow limita el blast radius del GITHUB_TOKEN.
- Gitleaks con `fetch-depth: 0` (historia completa) es la configuración correcta.
- Bandit con `-ll` (solo severidad media/alta) evita el ruido de falsos positivos.
- `pnpm install --frozen-lockfile` garantiza reproducibilidad.
- `docker-build` depende de `backend-test + backend-lint + frontend-test`: la imagen no se construye si los tests fallan.

---

### I-05 🟠 `safety check` no falla el pipeline

**Archivo:** `ci.yml` línea 90

```yaml
- name: Audit Python dependencies
  run: safety check -r requirements.txt --continue-on-error
  continue-on-error: true    # ← siempre verde
```

**El problema:** Un CVE crítico en cualquier dependencia Python pasará completamente inadvertido. `continue-on-error: true` convierte este step en decoración: genera output en los logs que nadie leerá, pero nunca bloquea el merge.

**Trade-off del error:** La razón por la que se pone `continue-on-error` es que `safety` a veces falla por CVEs en dependencias transitivas que no se pueden actualizar sin romper compatibilidad. Pero ese trade-off debe ser explícito y controlado, no silenciado.

**Configuración óptima:**

```yaml
- name: Audit Python dependencies
  run: |
    pip install safety
    # Falla solo por severidades crítica/alta; permite medium/low
    safety check -r requirements.txt --severity critical,high
  # Sin continue-on-error: el pipeline falla si hay CVEs críticos/altos
```

Si algún CVE conocido debe ignorarse temporalmente (e.g., no hay fix upstream), documentarlo explícitamente:

```yaml
- name: Audit Python dependencies
  run: |
    safety check -r requirements.txt \
      --ignore 12345 \   # CVE-YYYY-XXXXX: no fix available, mitigated by WAF rule
      --severity critical,high
```

---

### I-06 🟡 Frontend tests no tienen cobertura mínima

**Archivo:** `ci.yml` línea 146

```yaml
- name: Run tests
  run: pnpm exec jest --ci --forceExit
```

**El problema:** Jest corre sin `--coverage` ni umbral mínimo. El backend tiene `--cov-fail-under=80` (ver sección 8), pero el frontend puede tener 0% de cobertura y el pipeline queda verde.

**Configuración óptima:**

```yaml
- name: Run tests
  run: pnpm exec jest --ci --forceExit --coverage --coverageThreshold='{"global":{"lines":70}}'
```

O bien configurar el umbral en `jest.config.js`:

```js
// jest.config.js
module.exports = {
  coverageThreshold: {
    global: {
      lines: 70,
      branches: 60,
    },
  },
};
```

El umbral del frontend puede ser menor (70% vs 80% del backend) dado que las pantallas de React Native son más difíciles de testear unitariamente, pero debe existir.

---

### I-07 🟡 AWS credentials vía IAM long-lived keys

**Archivo:** `deploy.yml` líneas 72-74

```yaml
with:
  aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
  aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

**El problema:** Las claves de acceso de IAM son credenciales estáticas de larga duración. Si el repositorio de GitHub es comprometido, o si hay una filtración de secrets, el atacante tiene acceso indefinido a AWS hasta que las claves se roten manualmente.

**Trade-off del error:** Configurar OIDC requiere ~30 minutos de configuración en AWS IAM una vez. La ganancia es credenciales efímeras que duran solo la duración del job (sin secret que pueda filtrarse).

**Configuración óptima — OIDC con IAM Roles Anywhere:**

En AWS IAM, crear un Identity Provider de GitHub OIDC y un rol:

```json
{
  "Effect": "Allow",
  "Principal": {
    "Federated": "arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
  },
  "Action": "sts:AssumeRoleWithWebIdentity",
  "Condition": {
    "StringEquals": {
      "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
      "token.actions.githubusercontent.com:sub": "repo:ORG/REPO:environment:production"
    }
  }
}
```

En el workflow:

```yaml
permissions:
  id-token: write   # ← necesario para OIDC
  contents: read

- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: arn:aws:iam::ACCOUNT_ID:role/github-actions-deploy
    aws-region: us-east-1
    # SIN aws-access-key-id ni aws-secret-access-key
```

---

## 5. GitHub Actions — Deploy (`deploy.yml`)

### I-08 🔴 Task Definition de ECS como JSON en GitHub Secret

**Archivo:** `deploy.yml` líneas 132-133

```yaml
- name: Deploy backend to ECS
  uses: aws-actions/amazon-ecs-deploy-task-definition@v2
  with:
    task-definition: ${{ secrets.STAGING_BACKEND_TASK_DEFINITION }}  # ← JSON crudo
```

**El problema:** `aws-actions/amazon-ecs-deploy-task-definition@v2` espera un **archivo JSON** en disco, no una string JSON. La acción fallará en runtime. Pero el problema más grave es conceptual: la Task Definition es un artefacto de infraestructura versionado que debe vivir en el repositorio (o en Terraform/CDK), no codificado como un secret opaco en GitHub.

Guardar una task definition como secret significa:
1. No hay historial de cambios (quién cambió qué, cuándo).
2. No se puede hacer code review de cambios en la definición de tarea.
3. Rompe el principio de Infrastructure as Code.
4. Si el secret se corrompe, no hay forma de reconstruirlo sin acceder directamente a AWS.

**Trade-off del error:** "Es más fácil editar un secret en GitHub UI que commitear un JSON". El costo real es que la infraestructura se vuelve opaca y no reproducible.

**Configuración óptima:**

Opción A — Task Definition como archivo en el repo:

```
infra/
├── ecs/
│   ├── task-definition-staging.json
│   └── task-definition-production.json
```

```yaml
- name: Render ECS task definition with new image
  id: render-task-def
  uses: aws-actions/amazon-ecs-render-task-definition@v1
  with:
    task-definition: infra/ecs/task-definition-staging.json
    container-name: backend
    image: ${{ needs.build-backend.outputs.image }}

- name: Deploy to ECS
  uses: aws-actions/amazon-ecs-deploy-task-definition@v2
  with:
    task-definition: ${{ steps.render-task-def.outputs.task-definition }}
    service: ${{ vars.STAGING_ECS_SERVICE }}
    cluster: ${{ vars.STAGING_ECS_CLUSTER }}
    wait-for-service-stability: true
```

Opción B (ideal) — Terraform / AWS CDK para gestionar toda la infraestructura ECS.

---

### I-09 🟠 Migraciones sin rollback gate

**Archivo:** `deploy.yml` líneas 120-127

```yaml
- name: Run DB migrations
  run: |
    pip install alembic psycopg ...
    python -m alembic upgrade head
```

**El problema:** Las migraciones corren **antes** del deploy de la nueva imagen ECS, pero no hay ningún mecanismo de rollback si la migración tiene éxito pero la imagen falla en salud. El resultado puede ser: schema nuevo + imagen vieja = producción rota.

**Trade-off del error:** Una migración hacia adelante es generalmente segura. El peligro real es cuando la migración es destructiva (elimina una columna que la versión anterior del código todavía necesita). Sin rollback automático, la recuperación es manual y lenta.

**Configuración óptima — Blue/Green con migraciones aditivas:**

1. **Política de migraciones compatibles hacia atrás:** Nunca eliminar una columna en la misma migración que la deja de usar. Separarlo en dos deploys.

2. **Gate de rollback automático:**

```yaml
- name: Run DB migrations
  id: migrations
  run: python -m alembic upgrade head

- name: Deploy to ECS
  id: ecs-deploy
  uses: aws-actions/amazon-ecs-deploy-task-definition@v2
  with:
    wait-for-service-stability: true

- name: Rollback migrations on deploy failure
  if: failure() && steps.migrations.outcome == 'success'
  run: |
    echo "ECS deploy failed after migration — rolling back schema"
    python -m alembic downgrade -1
    exit 1   # Falla el job explícitamente para bloquear el pipeline
```

---

## 6. AWS ECS Fargate + ECR

**Observación:** No existe una definición de tarea en el repositorio (ver I-08), por lo que el análisis se basa en las variables de entorno que se inyectan en el workflow.

### Hallazgos inferidos

| Elemento | Estado | Observación |
|----------|--------|-------------|
| Imagen taggeada por `github.sha` | ✅ | Trazabilidad correcta |
| `latest` tag también pusheado | 🟡 | Ambiguo para rollbacks |
| ECR scan on push | No verificable | Debe habilitarse en ECR settings |
| Task Definition versionada | 🔴 | No existe en repo (ver I-08) |
| Logs a CloudWatch | No verificable | Recomendado con log driver `awslogs` |

**Recomendación ECR:** Habilitar "Scan on push" en el repositorio ECR para detectar CVEs en la imagen antes del deploy:

```bash
aws ecr put-image-scanning-configuration \
  --repository-name healthbytes-backend \
  --image-scanning-configuration scanOnPush=true
```

**Recomendación `latest` tag:** El tag `latest` hace que sea imposible saber qué código está corriendo actualmente si se hace un rollback y `latest` apunta a la versión anterior. Considerar solo pushear el tag del SHA y un tag de ambiente (`staging`, `production`):

```bash
docker tag $IMAGE $ECR_REGISTRY/$BACKEND_IMAGE_NAME:staging
docker push $ECR_REGISTRY/$BACKEND_IMAGE_NAME:staging
# No pushear :latest
```

---

## 7. Gestión de Secretos (SSM / GitHub Secrets)

### Situación actual

Los secretos del pipeline viven en **GitHub Secrets** (variables de entorno de CI). No hay evidencia de integración con AWS SSM Parameter Store ni AWS Secrets Manager en el código del repositorio. En runtime, los secretos llegan a ECS a través de variables de entorno en la Task Definition (que está almacenada como un secret opaco — ver I-08).

### I-10 🟠 Rate limiter usa `storage_uri=memory://` — no persistente entre instancias

**Archivo:** `backend/app/core/limiter.py` línea 56

```python
limiter = Limiter(
    key_func=get_identifier,
    default_limits=["300/minute"],
    storage_uri="memory://",    # ← en memoria del proceso
)
```

**El problema:** Con `memory://`, cada instancia de Fargate mantiene su propio contador independiente. Si ECS tiene 2 tasks, un cliente puede hacer 600 req/min (300 por task) antes de ser limitado. Esto anula completamente la eficacia del rate limiting contra ataques de fuerza bruta o DDoS.

Redis está configurado en el stack (`REDIS_URL` en docker-compose y en el deploy), pero el limiter no lo usa.

**Trade-off del error:** `memory://` es perfectamente válido para desarrollo con una sola instancia. El peligro es olvidar actualizarlo al escalar horizontalmente.

**Configuración óptima:**

```python
# backend/app/core/limiter.py
from app.config import settings

_storage_uri = settings.REDIS_URL if settings.REDIS_URL else "memory://"

limiter = Limiter(
    key_func=get_identifier,
    default_limits=["300/minute"],
    storage_uri=_storage_uri,
)
```

Y añadir al `_validate_production_config` en `config.py`:

```python
if not s.REDIS_URL:
    raise RuntimeError("Production environment requires REDIS_URL for distributed rate limiting")
```

---

### Arquitectura de secretos recomendada para producción

```
GitHub Secrets (CI)          AWS SSM Parameter Store (Runtime)
─────────────────────        ─────────────────────────────────
AWS_ROLE_ARN (OIDC)          /healthbytes/production/JWT_SECRET
EXPO_TOKEN                   /healthbytes/production/DATABASE_URL
GOOGLE_SERVICE_ACCOUNT_JSON  /healthbytes/production/CLERK_SECRET_KEY
                             /healthbytes/production/REDIS_URL
                             /healthbytes/production/MERCADO_PAGO_ACCESS_TOKEN
```

La Task Definition referencia SSM con `valueFrom` en lugar de pasar el valor directamente:

```json
{
  "secrets": [
    {
      "name": "JWT_SECRET",
      "valueFrom": "arn:aws:ssm:us-east-1:ACCOUNT:parameter/healthbytes/production/JWT_SECRET"
    }
  ]
}
```

Esto significa que el valor del secreto **nunca aparece en ningún log de CI, en ningún plan de Terraform, ni en la definición de tarea versionada en el repo**. Solo el ARN del parámetro es visible.

---

## 8. Cobertura de Tests — `pyproject.toml`

### ✅ Backend: cobertura mínima correctamente enforced

**Archivo:** `pyproject.toml` líneas 43-51 y `ci.yml` línea 81

```toml
[tool.pytest.ini_options]
addopts = """
    --cov=app
    --cov-report=html
    --cov-report=term-missing:skip-covered
    --cov-fail-under=80
"""
```

```yaml
# ci.yml
- name: Run tests
  run: pytest --tb=short --cov=app --cov-fail-under=80 -q
```

**Análisis:** El umbral del 80% está definido en **dos lugares** (pyproject.toml y ci.yml). Si alguno se modifica, el otro puede quedar desincronizado. El punto de verdad debe ser uno solo.

**Recomendación:** Eliminar `--cov-fail-under=80` del `ci.yml` y dejar solo el de `pyproject.toml`. `pytest` lee la configuración de `pyproject.toml` automáticamente:

```yaml
# ci.yml — simplificado
- name: Run tests
  run: pytest --tb=short -q
  # pytest leerá pyproject.toml para --cov=app, --cov-fail-under=80, etc.
```

**Cobertura de exclusiones correcta:** Las exclusiones en `[tool.coverage.report]` son apropiadas:
- `pragma: no cover` — uso legítimo para código no testeable
- `if TYPE_CHECKING:` — imports solo para type hints
- `raise NotImplementedError` — stubs abstractos

**Un punto a revisar:** `omit = ["*/migrations/*"]` es correcto — las migraciones de Alembic no deben contar en la cobertura.

---

## 9. FastAPI Middleware Stack

### El orden de ejecución en Starlette (FastAPI)

En Starlette, los middlewares se apilan en **orden inverso al de registro**. El primer middleware registrado es el **último en ejecutar la petición hacia adentro** y el **primero en procesar la respuesta hacia afuera**.

```
Orden de registro en main.py:
  1. attach_user_for_rate_limiting  (@app.middleware)
  2. SlowAPIMiddleware               (add_middleware)
  3. add_security_headers            (@app.middleware)
  4. limit_request_body_size         (@app.middleware)
  5. CORSMiddleware                  (add_middleware)
```

**Orden real de ejecución (request entra → respuesta sale):**

```
Request →
  [5] CORS preflight check
  [4] Body size check (limit_request_body_size)
  [3] Security headers (add_security_headers) — ejecuta call_next primero
  [2] SlowAPIMiddleware (rate limit)
  [1] attach_user_for_rate_limiting (extrae user para el limiter)
    → Route handler
  [1] ← (response)
  [2] ← (response)
  [3] ← agrega headers aquí
  [4] ← (response)
  [5] ← agrega CORS headers
← Response
```

### I-11 🟡 Orden de middlewares: body size se ejecuta DESPUÉS del rate limiter

**El problema:** El order real que resulta del registro es:

```
CORS → Body Size → Security Headers → SlowAPI → attach_user → handler
```

Esto significa que una request enorme (atacante enviando 500 MB) llega al **rate limiter antes que al body size check**. El rate limiter intentará evaluar la key (por IP) antes de rechazar el body grande, lo que añade latencia innecesaria y potencialmente carga la memoria.

**El orden óptimo para seguridad y eficiencia debe ser:**

```
CORS → Body Size → Rate Limit → Auth → Security Headers → handler
```

**Configuración óptima:** Reordenar el registro de middlewares. En Starlette, `add_middleware` se evalúa de abajo hacia arriba:

```python
# main.py — orden correcto (de último en registrar a primero en registrar)

# 1. El último en ejecutarse sobre la request (innermost):
app.add_middleware(SlowAPIMiddleware)
# attach_user debe ir ANTES de SlowAPI, entonces registrarlo con add_middleware también
# para tener control del orden preciso.

# 2. Body size:
# Mover limit_request_body_size a un add_middleware explícito con
# starlette.middleware.base.BaseHTTPMiddleware para controlarlo.

# 3. CORS (siempre primero en ver la request):
app.add_middleware(CORSMiddleware, ...)
```

O usar una solución más explícita con `Starlette`'s `Middleware` list:

```python
from starlette.middleware import Middleware

app = FastAPI(
    middleware=[
        Middleware(CORSMiddleware, ...),
        Middleware(BaseHTTPMiddleware, dispatch=limit_request_body_size),
        Middleware(SlowAPIMiddleware),
        Middleware(BaseHTTPMiddleware, dispatch=add_security_headers),
    ]
)
```

Con `Middleware` list, el orden es explícito: el primero de la lista es el más externo (primer en procesar request, último en procesar response).

---

### I-12 🟡 `verify_seller` y `verify_admin` devuelven 401 en vez de 403

**Archivo:** `backend/app/middleware/auth.py` líneas 239, 249

```python
async def verify_seller(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "seller":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, ...)

async def verify_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, ...)
```

**El problema:** HTTP 401 significa "no autenticado" (falta o token inválido). HTTP 403 significa "autenticado pero sin permiso". Un usuario autenticado con rol `customer` que intenta acceder a un endpoint de seller **sí está autenticado**, pero no tiene autorización — el código correcto es 403.

Devolver 401 le dice al cliente que intente autenticarse de nuevo, lo que genera UX confusa y dificulta el debugging.

**Configuración óptima:**

```python
async def verify_seller(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "seller":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions: seller role required",
        )
    return current_user

async def verify_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions: admin role required",
        )
    return current_user
```

---

### I-13 🟢 Token de larga duración (30 días)

**Archivo:** `backend/app/config.py` línea 22

```python
ACCESS_TOKEN_EXPIRE_MINUTES: int = 43200  # 30 días
```

**Contexto:** El comentario indica que esto replica el comportamiento del servidor Node.js anterior. No es un error, es una decisión de compatibilidad.

**Trade-off:** Los JWT de 30 días sin refresh token dan mejor UX (el usuario no necesita re-loguearse frecuentemente), pero si un token se filtra, el atacante tiene 30 días de acceso sin posibilidad de revocación (los JWT son stateless).

**Recomendación para la siguiente iteración:**

```python
ACCESS_TOKEN_EXPIRE_MINUTES: int = 60       # 1 hora — access token
REFRESH_TOKEN_EXPIRE_DAYS: int = 30         # 30 días — refresh token
```

Implementar un endpoint `POST /auth/refresh` que acepte el refresh token y emita un nuevo access token. Si el refresh token es robado, se puede revocar en base de datos. Si el access token es robado, expira en 1 hora.

**Nota:** Con Clerk como proveedor de identidad principal, esta discusión aplica solo al flujo JWT legacy. Clerk gestiona su propio ciclo de vida de tokens con rotación automática.

---

## 10. Topología de API Gateway

### Análisis del flujo end-to-end (producción inferida)

```
Internet
    │
    ▼
[AWS ALB / API Gateway]
    │  TLS termination, WAF (recomendado)
    ▼
[ECS Fargate — Task: backend]
    │  Puerto 3001 (interno)
    ▼
[FastAPI + Uvicorn]
    │
    ├── [CORS Middleware]
    ├── [Body Size Middleware]          ← I-11: orden subóptimo
    ├── [Security Headers Middleware]
    ├── [SlowAPI Rate Limiter]          ← I-10: memory:// en prod
    ├── [attach_user Middleware]        ← DB query en cada request
    │
    ▼
[Route Handler]
    ├── [Depends(get_current_user)]     ← segundo DB query (duplicado)
    └── [Business Logic Service]
         └── [PostgreSQL / Redis]
```

### Cuello de botella identificado: DB query en middleware de rate limiting

**Archivo:** `backend/app/main.py` líneas 125-131

```python
async for db in get_db():
    result = await db.execute(
        select(User).where(User.clerk_id == clerk_user_id)
    )
    user = result.scalar_one_or_none()
    if user:
        request.state.user = user
    break
```

**El problema:** `attach_user_for_rate_limiting` hace una query a PostgreSQL en **cada request** para obtener el user object y poder identificar el rate limit por `user_id`. Luego, `get_current_user` (en el route handler) hace **la misma query de nuevo** para validar la autenticación.

En un endpoint con tráfico alto (e.g., `GET /products` con paginación), esto son 2 queries de DB por request de usuario autenticado: una en el middleware, otra en el handler. A 300 req/min por usuario, son 600 queries/min solo para identificar al usuario.

**Configuración óptima:**

Opcíon A — Cachear el user en `request.state` y reutilizarlo en `get_current_user`:

```python
# middleware en main.py — attach_user_for_rate_limiting
# ... (código existente que ya cachea en request.state.user)

# middleware/auth.py — get_current_user
async def get_current_user(...) -> User:
    # Si el middleware ya resolvió el user, reutilizarlo
    if hasattr(request.state, "user") and request.state.user is not None:
        return request.state.user
    
    # Solo si no está en state, hacer la query
    # ... (lógica existente)
```

Opción B — Eliminar el middleware `attach_user_for_rate_limiting` y usar el JWT `sub` claim directamente como key del rate limiter, sin query a DB:

```python
def get_identifier(request: Request) -> str:
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header[7:]
        try:
            # Solo decodificar sin verificar firma (para rate limit key, no para auth)
            # La verificación real ocurre en get_current_user
            import jwt as pyjwt
            payload = pyjwt.decode(token, options={"verify_signature": False})
            sub = payload.get("sub") or payload.get("userId")
            if sub:
                return f"user:{sub}"
        except Exception:
            pass
    # fallback a IP
    ...
```

La Opción A es la más segura y eficiente porque evita la duplicación sin cambiar el modelo de seguridad.

---

### Recomendación: WAF en el ALB

Con la topología actual, si un atacante satura el rate limiter con requests vacías (sin body, sin auth), los contadores solo se protegen por IP. Agregar AWS WAF con reglas de managed rule groups (especialmente `AWSManagedRulesCommonRuleSet`) proporciona una capa de protección antes de que el tráfico llegue al container.

---

## 11. Resumen de Hallazgos

| ID | Severidad | Área | Descripción | Esfuerzo |
|----|-----------|------|-------------|---------|
| I-08 | 🔴 Crítico | Deploy | Task definition ECS como JSON en secret | M (2-4h) |
| I-01 | 🔴 Crítico | Compose | Secrets con fallback hardcodeado (`:-`) | XS (30min) |
| I-09 | 🟠 Alto | Deploy | Sin rollback gate de migraciones | M (2-4h) |
| I-05 | 🟠 Alto | CI | `safety check` no falla el pipeline | XS (15min) |
| I-02 | 🟠 Alto | Compose | Redis expuesto sin auth ni bind de loopback | S (1h) |
| I-10 | 🟠 Alto | Config | Rate limiter usa `memory://` en producción | S (1h) |
| I-03 | 🟠 Alto | Compose | Bind-mounts sin separación dev/staging | S (1h) |
| I-07 | 🟡 Medio | CI/CD | IAM long-lived keys en lugar de OIDC | M (3h) |
| I-04 | 🟡 Medio | Docker | Proceso corre como root | XS (30min) |
| I-11 | 🟡 Medio | FastAPI | Orden de middlewares subóptimo | S (1h) |
| I-12 | 🟡 Medio | Auth | 401 vs 403 en verificación de roles | XS (15min) |
| I-06 | 🟡 Medio | CI | Sin cobertura mínima en frontend | S (1h) |
| I-13 | 🟢 Bajo | Config | JWT de 30 días (sin refresh token) | L (future) |

---

## 12. Plan de Acción Priorizado

### Sprint inmediato (antes del próximo deploy a producción)

```bash
# 1. Críticos — no deployar sin estos fixes
[ ] I-01  docker-compose.yml: :? en vez de :-  para todos los secrets
[ ] I-08  Mover task definitions a infra/ecs/*.json y usar render-task-definition action
[ ] I-10  Rate limiter: storage_uri desde settings.REDIS_URL con guard en producción

# 2. Altos — bloquean seguridad real
[ ] I-05  safety check: remover continue-on-error, agregar --severity critical,high
[ ] I-02  Redis: requirepass + bind loopback en docker-compose
[ ] I-09  Deploy: agregar rollback step de migraciones con alembic downgrade -1
[ ] I-03  docker-compose.override.yml: separar bind-mounts de dev
```

### Sprint siguiente (hardening)

```bash
[ ] I-04  Dockerfiles: agregar USER non-root en backend y frontend
[ ] I-07  CI/CD: migrar a OIDC (IAM Role + trust policy de GitHub)
[ ] I-12  auth.py: cambiar 401 → 403 en verify_seller y verify_admin
[ ] I-11  main.py: reordenar middlewares; reutilizar request.state.user en get_current_user
[ ] I-06  jest.config.js: agregar coverageThreshold para frontend
```

### Backlog futuro

```bash
[ ] I-13  Implementar refresh token pattern (access: 1h, refresh: 30d)
[ ] ECR   Habilitar scan-on-push en repositorio ECR
[ ] AWS   WAF managed rules en el ALB
[ ] SSM   Migrar secretos de runtime a SSM Parameter Store con valueFrom en Task Definition
```

---

*Reporte generado por auditoría estática — ningún comando fue ejecutado contra infraestructura viva.*
*Para ejecutar la solución, iniciar por I-01 e I-08: ambos son cambios de configuración de bajo riesgo y alto impacto.*
