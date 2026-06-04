# Frontend Architecture

Frontend stack:

- React Native.
- Expo Router.
- TypeScript.
- NativeWind.
- Zustand.
- React Query.
- Gluestack UI pieces.

Placement rules:

- Screens live in `frontend/app/`.
- Reusable UI lives in `frontend/components/`.
- API clients live in `frontend/api/`.
- Global state lives in `frontend/store/`.
- Shared types live in `frontend/types/`.

Condition-aware UI must keep recommendation state, uncertainty, and restriction signals visible.

