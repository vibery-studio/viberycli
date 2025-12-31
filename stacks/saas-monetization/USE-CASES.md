# SaaS Monetization Kit - Use Cases

## Who This Is For

SaaS founders and developers who need to add payment processing, subscriptions, and billing to their applications. Whether you're launching your first pricing tier or scaling a complex multi-product SaaS, this kit handles Stripe integrations, subscription lifecycle, webhook handling, and usage-based billing.

## Use Case 1: Launch Tiered Pricing (Startup MVP)

**Scenario:** You have a working app and need to add 3 pricing tiers (Free, Pro at $29/mo, Enterprise custom). No subscription management yet—just get paid.

**Prompt:** `@stripe-pro Build a tiered pricing setup with Stripe: Free tier (no payment), Pro ($29/month), Enterprise (custom quote). Create products, prices, and a checkout flow. Include test cards for sandbox.`

**Outcome:** Functional checkout with Stripe products/prices configured, test mode ready, sample checkout URLs.

---

## Use Case 2: Manage Subscription Lifecycle (Recurring Revenue)

**Scenario:** Customers sign up, get 14-day trial, then auto-charge monthly. Some cancel, some upgrade. You need to handle all states: active, paused, canceled, expired trial.

**Prompt:** `@stripe-pro Implement full subscription lifecycle: trial periods (14 days), automatic charging, upgrade/downgrade with proration, cancellation at period end. Use webhooks for payment success/failure. Show customer subscription status portal.`

**Outcome:** Complete subscription state machine, webhook handlers for invoice events, self-service pause/upgrade/cancel endpoints.

---

## Use Case 3: Usage-Based Billing (Per-API-Call Pricing)

**Scenario:** Your API charges per 1000 requests. Customers need real-time usage tracking, billing only for what they use, with overage warnings. Implement metered billing that triggers monthly invoices.

**Prompt:** `@stripe-pro Set up usage-based billing with Stripe meters: track API requests per customer, meter events every hour, monthly invoicing with overage charges at $0.01 per 100 requests. Include usage dashboard for customers.`

**Outcome:** Meter event streaming setup, usage aggregation logic, monthly invoice generation, customer-facing usage dashboard.

---

## Use Case 4: Handle Failed Payments & Dunning (Revenue Protection)

**Scenario:** 2% of payments fail (expired cards, insufficient funds). You lose $5K/month to failed charges. Set up retries and dunning notifications so customers can fix their cards before cancellation.

**Prompt:** `@stripe-pro Implement payment failure recovery: 3 retry attempts over 5 days with exponential backoff, dunning emails after each failure, customer portal to update payment method, auto-retry after update. Track dunning metrics.`

**Outcome:** Retry logic with exponential backoff, email templates, payment method update flow, failure metrics dashboard.

---

## Use Case 5: Automated Benefit Delivery (License Activation)

**Scenario:** When a customer pays for your product, automatically unlock features: GitHub repo access, Discord role, license key, or file download. No manual work.

**Prompt:** `@payment-integration Use Polar's automated benefits: on purchase, automatically grant GitHub repo access, Discord role 'Pro User', and email license key. Revoke on cancellation.`

**Outcome:** Webhook handlers for benefit grant/revoke, integrations with GitHub/Discord/email, permission sync logic.

---

## Quick Start Workflow

1. **Use case 1:** Set up Stripe products/prices → create checkout → test with test cards
2. **Use case 2:** Add subscription creation → implement webhook handlers → build customer portal
3. **Use case 3:** Define meters in Stripe → stream usage events → aggregate for invoicing
4. **Use case 4:** Implement retry logic → configure dunning emails → add payment method update flow
5. **Use case 5:** Connect payment webhooks → add benefit grant logic → test end-to-end

---

## Pro Tips

- **Test thoroughly:** Use Stripe test mode with test cards (4242... always succeeds, 4000... always fails)
- **Webhook reliability:** Implement idempotent handlers—webhooks retry, so process events by `idempotency_key`
- **Proration strategy:** Decide upfront: immediate (credit), end-of-cycle (wait), or none (manual only)
- **Subscription metadata:** Store custom fields (team_id, plan_version, billing_cycle_start) in subscription metadata
- **Monitoring:** Alert on payment failures, failed webhooks, and unusual usage spikes before customers complain
