# Release Readiness

Release-readiness source for beta or public launch work.

Last updated: 2026-06-04.

## Backend

| Priority | Item | Current note |
| --- | --- | --- |
| P1 | Push-token registration | `NotificationService` exists, but the client still needs a backend registration path such as `PATCH /users/me/push-token` plus tests. |
| P1 | Reviews edge cases | Product review endpoints exist; validate coverage for duplicate reviews, unauthenticated flows, and purchase-required behavior. |
| P1 | Orders coverage | Existing order tests are uneven; audit gaps around paid/unpaid queries, validation, and state transitions. |
| P1 | Deep links | `healthbytes://` is referenced by notifications; validate opening from push and external URLs on Android and iOS. |

## Frontend

| Priority | Item | Current note |
| --- | --- | --- |
| P1 | Accessibility audit | Check labels, contrast, touch targets, and screen-reader basics without redesigning screens. |
| P1 | Push notifications client | Register Expo push token after login and connect with the Expo Go warning guard. |
| P1 | Recommendations UI | `GET /products/recommended` exists; expose a visible recommendations section only with clear criteria and uncertainty language. |

## Infra And Distribution

| Priority | Item | Current note |
| --- | --- | --- |
| P1 | Staging | AWS scripts exist, but staging is not confirmed live. Evaluate simpler staging before committing operational cost. |
| P1 | Android store prep | Play Store checklist exists under infra; pending EAS project ID, screenshots, feature graphic, and privacy-policy URL. |
| P1 | iOS store prep | Requires Apple Developer account, provisioning, TestFlight path, screenshots, and privacy-policy URL. |

## Verification Rule

Treat legacy roadmap claims as inputs, not proof. Each release-readiness item needs current code review, focused tests, or runtime smoke evidence before it becomes "done".
