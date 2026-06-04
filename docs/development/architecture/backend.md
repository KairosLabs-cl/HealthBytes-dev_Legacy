# Backend Architecture

Backend stack:

- FastAPI.
- SQLAlchemy 2.x async.
- PostgreSQL.
- Redis.
- Pydantic.
- JWT and Clerk-related auth flows.

Placement rules:

- Routers live in `backend/app/api/v1/`.
- Business logic lives in `backend/app/services/`.
- Pydantic schemas live in `backend/app/schemas/`.
- DB models live in `backend/app/db/`.

Routers should call services. Product and recommendation logic must not live directly in routers.

