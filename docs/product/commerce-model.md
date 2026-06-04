# Commerce Model

HealthBytes uses a mixed commerce model.

Modes:

- Direct sale: HealthBytes owns checkout, payment, order state, and customer communication.
- External provider: HealthBytes sends the user to a provider or store that owns purchase completion.

Required UI rule:

The app must clearly distinguish direct checkout from external redirection before the user commits to purchase.

Required data rule:

Every product should identify sales mode, provider, availability, price source, and last-known update time when available.

