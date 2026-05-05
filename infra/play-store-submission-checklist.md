# Google Play Store — Submission Checklist

## Prerequisites

- [ ] EAS account linked: `npx eas whoami`
- [ ] Replace `REPLACE_WITH_YOUR_EAS_PROJECT_ID` in `app.json` with actual EAS project ID
- [ ] `google-service-account.json` downloaded from Google Play Console (do NOT commit this file)
- [ ] `EXPO_TOKEN` set as GitHub secret
- [ ] `GOOGLE_SERVICE_ACCOUNT_KEY_JSON` set as GitHub secret (contents of service account file)

## App Metadata Required by Play Store

### Listing (required before first submission)

- [ ] **App name**: HealthBytes (30 chars max)
- [ ] **Short description**: Compra alimentos especializados según tus restricciones dietéticas (80 chars max)
- [ ] **Full description**: (4000 chars max) — describe the app's value for users with celiac disease, diabetes, food allergies
- [ ] **Category**: Shopping (or Health & Fitness)
- [ ] **Privacy Policy URL**: Required — host at `https://healthbytes.cl/privacy` before submission

### Graphical Assets

- [ ] **App icon**: 512×512 PNG (already at `frontend/assets/icon.png` — verify 512×512)
- [ ] **Feature graphic**: 1024×500 PNG (create banner)
- [ ] **Phone screenshots**: Minimum 2, maximum 8 (1080×1920 or 1080×2340)
  - Home screen with products
  - Product detail with dietary badges
  - Cart / checkout flow
  - Order confirmation

### Content Rating

- [ ] Complete content rating questionnaire in Play Console
- [ ] Expected rating: Everyone (no violence, no adult content)

### Target Audience

- [ ] Primary country: Chile (CL)
- [ ] Language: Spanish (es)

## Build & Submit Commands

```bash
# 1. Build Android AAB (production)
npx eas build --platform android --profile production

# 2. Submit to Play Store (internal track)
npx eas submit --platform android --profile production

# 3. Or combined (build + submit)
npx eas build --platform android --profile production --auto-submit
```

## Automated via GitHub Actions

The `deploy.yml` workflow runs `eas build` + `eas submit` automatically on deployment.

Required GitHub secrets:
- `EXPO_TOKEN`
- `GOOGLE_SERVICE_ACCOUNT_KEY_JSON`

## Version Management

Current: `version: "1.0.0"`, `android.versionCode: 1`

To release an update, increment `versionCode` in `frontend/app.json`:
```json
"versionCode": 2
```

## Notes

- `track: "internal"` in `eas.json` means the build goes to Internal Testing before being promoted to production
- Promote from Internal → Production in Google Play Console after QA approval
- `google-service-account.json` is gitignored — each developer must download it from Play Console
