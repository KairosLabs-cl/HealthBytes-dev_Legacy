import os
import subprocess
from collections import defaultdict

def run_cmd(cmd, cwd=None):
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd=cwd)
    return result.stdout.strip()

# Configuration mapping to consolidate different email/name strings to unique developers
DEVELOPER_MAP = {
    "benjamin zamora": {
        "name": "Benjamin Zamora",
        "github": "nojustbenja",
        "roles": "Liderazgo Técnico, Arquitectura del Sistema (FastAPI/Zustand), Integración de Pagos y Seguridad."
    },
    "benjamín zamora": {
        "name": "Benjamin Zamora",
        "github": "nojustbenja",
        "roles": "Liderazgo Técnico, Arquitectura del Sistema (FastAPI/Zustand), Integración de Pagos y Seguridad."
    },
    "nojustbenja": {
        "name": "Benjamin Zamora",
        "github": "nojustbenja",
        "roles": "Liderazgo Técnico, Arquitectura del Sistema (FastAPI/Zustand), Integración de Pagos y Seguridad."
    },
    "guillermo": {
        "name": "Guillermo Serrano",
        "github": "GuillermoSerrano132",
        "roles": "Desarrollo Frontend, Vistas del E-commerce, Refactorización y Pruebas Unitarias."
    },
    "guillermoserrano132": {
        "name": "Guillermo Serrano",
        "github": "GuillermoSerrano132",
        "roles": "Desarrollo Frontend, Vistas del E-commerce, Refactorización y Pruebas Unitarias."
    },
    "josé": {
        "name": "José",
        "github": "chachoCL",
        "roles": "Rutas de Autenticación, Middleware del Backend y Reforzamiento de Seguridad."
    },
    "jose": {
        "name": "José",
        "github": "chachoCL",
        "roles": "Rutas de Autenticación, Middleware del Backend y Reforzamiento de Seguridad."
    },
    "basty001": {
        "name": "Basty001",
        "github": "Basty001",
        "roles": "Componentes de la Interfaz del Frontend, Limpieza de TypeScript y Validación de Formularios."
    },
    "basty200": {
        "name": "Basty001",
        "github": "Basty001",
        "roles": "Componentes de la Interfaz del Frontend, Limpieza de TypeScript y Validación de Formularios."
    }
}

BOTS = {
    "google-labs-jules[bot]": "Agente de IA para desarrollo, refactorización y resolución de tareas complejas.",
    "dependabot[bot]": "Automatización de actualizaciones de dependencias y parches de seguridad.",
    "coderabbitai[bot]": "Revisiones de código automáticas y optimización de calidad en PRs.",
    "copilot-swe-agent[bot]": "Copiloto de desarrollo para la generación de código y scripts de utilidad."
}

def main():
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
    
    # 1. Read merge commits using git log
    log_output = run_cmd('git log --merges --pretty=format:"%H %P"', cwd=repo_root)
    
    if not log_output:
        print("No merge commits found in this git repository.")
        return
        
    merge_lines = log_output.split('\n')
    branch_merges_by_author = defaultdict(set)
    
    for line in merge_lines:
        if not line.strip():
            continue
        parts = line.split()
        if len(parts) < 3:
            continue
        commit_hash = parts[0]
        p1 = parts[1]
        p2 = parts[2]
        
        # Determine authors of commits on the merged branch
        authors_in_branch = run_cmd(f'git log {p1}..{p2} --pretty=format:"%an"', cwd=repo_root)
        if not authors_in_branch:
            authors_in_branch = run_cmd(f'git show --no-patch --pretty=format:"%an" {p2}', cwd=repo_root)
            
        authors = [a.strip() for a in authors_in_branch.split('\n') if a.strip()]
        if not authors:
            continue
            
        # Count the primary author
        author_counts = defaultdict(int)
        for a in authors:
            author_counts[a] += 1
        primary_author = max(author_counts, key=author_counts.get)
        
        branch_merges_by_author[primary_author].add(p2)

    # 2. Process and consolidate contributors
    humans = defaultdict(int)
    bots = defaultdict(int)
    
    for author_raw, branches in branch_merges_by_author.items():
        count = len(branches)
        author_lower = author_raw.lower()
        
        if author_raw in BOTS or "bot" in author_lower:
            # Try to match bot
            matched_bot = None
            for bot_key in BOTS:
                if bot_key in author_raw or author_raw in bot_key:
                    matched_bot = bot_key
                    break
            if matched_bot:
                bots[matched_bot] += count
            else:
                bots[author_raw] += count
        else:
            # Match or map human
            matched = False
            for key, dev_info in DEVELOPER_MAP.items():
                if key in author_lower or author_lower in key:
                    humans[dev_info["github"]] += count
                    matched = True
                    break
            if not matched:
                # Fallback to raw author
                humans[author_raw] += count

    # 3. Filter contributors with >= 2 merged branches
    qualified_humans = {gh: cnt for gh, cnt in humans.items() if cnt >= 2}
    qualified_bots = {bot: cnt for bot, cnt in bots.items() if cnt >= 2}
    
    # 4. Generate the CONTRIBUTORS.md content
    md_content = []
    md_content.append("# ✨ HealthBytes Contributors\n")
    md_content.append("Este archivo rinde homenaje a todos los desarrolladores y colaboradores que han contribuido activamente al desarrollo de **HealthBytes**, construyendo el e-commerce especializado para el bienestar y la salud alimentaria.\n")
    md_content.append("De acuerdo con nuestras políticas del repositorio, los colaboradores listados aquí han **fusionado (mergeado) al menos 2 ramas de sus Pull Requests** en la rama principal (`master`).\n")
    md_content.append("---\n")
    
    # Human contributors section
    md_content.append("## 👥 Colaboradores Humanos\n")
    md_content.append("| Colaborador | Usuario GitHub | Ramas Fusionadas | Rol / Contribuciones Principales |")
    md_content.append("| :--- | :--- | :---: | :--- |")
    
    sorted_humans = sorted(qualified_humans.items(), key=lambda x: x[1], reverse=True)
    for github, count in sorted_humans:
        # Find info
        name = github
        roles = "Desarrollador y Colaborador de Código."
        
        # Check map
        for dev_info in DEVELOPER_MAP.values():
            if dev_info["github"] == github:
                name = dev_info["name"]
                roles = dev_info["roles"]
                break
                
        md_content.append(f"| **{name}** | [@{github}](https://github/{github}) | **{count}** | {roles} |")
        
    md_content.append("\n---\n")
    
    # Bot contributors section
    md_content.append("## 🤖 Colaboradores de Automatización e IA\n")
    md_content.append("En **HealthBytes** impulsamos el desarrollo ágil utilizando agentes autónomos y herramientas de automatización de vanguardia que cooperan codo con codo con el equipo humano.\n")
    md_content.append("| Agente / Bot | Propósito | Ramas Fusionadas |")
    md_content.append("| :--- | :--- | :---: |")
    
    sorted_bots = sorted(qualified_bots.items(), key=lambda x: x[1], reverse=True)
    for bot, count in sorted_bots:
        desc = BOTS.get(bot, "Agente automatizado de desarrollo.")
        md_content.append(f"| **{bot}** | {desc} | **{count}** |")
        
    md_content.append("\n---\n")
    md_content.append("### 📈 Criterios para unirse al Salón de la Fama")
    md_content.append("Si deseas aparecer en esta lista:")
    md_content.append("1. Revisa las tareas disponibles en [.agents/agents/tasks.json](file:///.agents/agents/tasks.json).")
    md_content.append("2. Crea una rama siguiendo nuestras convenciones: `tipo/descripcion-corta`.")
    md_content.append("3. Envía un Pull Request y asegúrate de que pase todos los checks de CI/CD.")
    md_content.append("4. Una vez que hayas **fusionado al menos 2 ramas**, serás añadido automáticamente a este listado con tu respectivo reconocimiento.\n")
    md_content.append('<div align="center">')
    md_content.append("  <sub>Hecho con ❤️ por la comunidad de HealthBytes</sub>")
    md_content.append("</div>")
    
    output_path = os.path.join(repo_root, "CONTRIBUTORS.md")
    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(md_content))
        
    print(f"Successfully generated and updated {output_path}!")

if __name__ == "__main__":
    main()
