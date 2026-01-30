# Payment Gateways Setup

Wallet deposits and admin funding support **three payment options**:

- **Card** (Stripe)
- **PayPal**
- **Crypto** (Coinbase Commerce)

You can enable one, two, or all three. Add the corresponding env vars to your `.env` (project root or `backend/`). If a provider is not configured, that option will show an error when selected; others still work.

---

## 1. Stripe (Card)

| Variable | Description |
|----------|-------------|
| `STRIPE_SECRET_KEY` | Secret key from [Stripe Dashboard → API keys](https://dashboard.stripe.com/apikeys) (e.g. `sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret (e.g. `whsec_...`) |

**Webhook:** Stripe Dashboard → Webhooks → Add endpoint → URL: `https://your-domain/api/payments/webhook` → Event: **checkout.session.completed**.  
For local testing: `stripe listen --forward-to localhost:3000/api/payments/webhook` and use the printed secret.

---

## 2. PayPal

| Variable | Description |
|----------|-------------|
| `PAYPAL_CLIENT_ID` | Client ID from [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/) |
| `PAYPAL_CLIENT_SECRET` | Secret from the same app |
| `PAYPAL_MODE` | `sandbox` (testing) or `live` (production) |

No webhook needed for basic flow: the app captures the payment when the user returns from PayPal using the order token.

---

## 3. Crypto (Coinbase Commerce)

| Variable | Description |
|----------|-------------|
| `COINBASE_COMMERCE_API_KEY` | API key from [Coinbase Commerce](https://commerce.coinbase.com/) |
| `COINBASE_COMMERCE_WEBHOOK_SECRET` | Webhook shared secret from Commerce dashboard |

**Webhook:** In Coinbase Commerce, add webhook URL: `https://your-domain/api/payments/webhook/crypto` and subscribe to **charge:confirmed**. Put the shared secret in `COINBASE_COMMERCE_WEBHOOK_SECRET`.

---

## Flows

- **User app (Wallet → Deposit):** Choose Card, PayPal, or Crypto → enter amount (USD, min 1) → redirect to provider → after payment, wallet is credited in USD (PayPal is captured on return; Stripe/Crypto via webhook).
- **Admin app (Wallets → Fund):** Same three options; admin pays and the selected user’s wallet is credited in USD.

All amounts are in **USD**; the wallet balance credited is in USD.
