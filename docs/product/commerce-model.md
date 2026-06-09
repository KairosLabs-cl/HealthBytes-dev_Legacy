# Commerce Model

HealthBytes currently uses a store-discovery model while direct marketplace
checkout is disabled.

Modes:

- Store discovery: HealthBytes shows product information and where to find the product in physical stores.
- Direct sale: HealthBytes owns checkout, payment, order state, and customer communication. This is disabled during validation.
- External provider: HealthBytes sends the user to a provider or store that owns purchase completion.

Required UI rule:

The app must route disabled purchase actions toward store discovery, not payment
or order creation.

Required data rule:

Every product should identify sales mode, provider, availability, price source, and last-known update time when available.
