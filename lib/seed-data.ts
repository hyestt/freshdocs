// lib/seed-data.ts — realistic sample help articles for a fictional product
// ("Pulseboard", a product-analytics SaaS) so the demo has something to show.

export interface SeedArticle {
  title: string;
  markdown: string;
}

export const SEED_ARTICLES: SeedArticle[] = [
  {
    title: "Getting started with Pulseboard",
    markdown: `# Getting started with Pulseboard

Welcome to Pulseboard! This guide walks you through creating your account, installing the tracking snippet, and viewing your first dashboard. Most teams are up and running in under 15 minutes.

## 1. Create your workspace

Sign up at pulseboard.example.com with your work email. You'll be asked to name your workspace — pick your company name. Each workspace starts with a 14-day Pro trial; no credit card required.

## 2. Install the tracking snippet

Paste the snippet below just before the closing \`</body>\` tag on every page you want to track:

\`\`\`
<script src="https://cdn.pulseboard.example.com/p.js"
  data-key="pb_live_YOUR_KEY"></script>
\`\`\`

You can find your key under **Settings → Tracking**. The snippet is 8 KB, loads asynchronously, and never blocks page rendering.

## 3. Verify events are flowing

Open **Live view** in the sidebar. Visit your site in another tab — you should see your pageview appear within 5 seconds. If nothing shows up, check that ad blockers are disabled and that the \`data-key\` starts with \`pb_live_\`.

## 4. Build your first dashboard

Go to **Dashboards → New dashboard** and add a **Pageviews** card. Pick a date range, then click **Save**. Dashboards refresh every 5 minutes on the Starter plan and every 60 seconds on Pro.

## Next steps

- Connect a data source to blend product data with web analytics.
- Invite teammates under **Settings → Team** (Pro supports unlimited seats).
- Set up a weekly email digest so metrics land in your inbox every Monday.`,
  },
  {
    title: "Connecting a data source",
    markdown: `# Connecting a data source

Pulseboard can blend your website analytics with data from Postgres, Snowflake, or a CSV upload. Connected sources refresh automatically and can be joined with web events in dashboards.

## Postgres

1. Go to **Sources → Add source → Postgres**.
2. Enter host, port (default 5432), database, username, and password.
3. Allowlist Pulseboard's IPs: \`34.120.10.4\` and \`34.120.10.5\`.
4. Click **Test connection**. A green check means we can read your schema.

We only request \`SELECT\` privileges. Create a read-only role for best security:

\`\`\`
CREATE ROLE pulseboard_reader WITH LOGIN PASSWORD 'strong-password';
GRANT CONNECT ON DATABASE analytics TO pulseboard_reader;
GRANT USAGE ON SCHEMA public TO pulseboard_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO pulseboard_reader;
\`\`\`

## Snowflake

1. Go to **Sources → Add source → Snowflake**.
2. Provide your account identifier (e.g. \`xy12345.us-east-1\`), warehouse, database, and schema.
3. We recommend a dedicated \`PULSEBOARD_WH\` warehouse sized X-Small.

## CSV upload

1. Go to **Sources → Add source → CSV**.
2. Upload a file up to 500 MB. The first row must contain column headers.
3. Map each column to a type (text, number, date, boolean) and click **Import**.

## Refresh schedules

- Postgres and Snowflake sync every 6 hours on Starter, hourly on Pro.
- CSV uploads are one-time snapshots; re-upload to refresh.

If a sync fails three times in a row, we email the workspace owner and pause the schedule until you re-authenticate.`,
  },
  {
    title: "Billing, plans, and invoices",
    markdown: `# Billing, plans, and invoices

Pulseboard has three plans. You can switch plans or cancel at any time from **Settings → Billing**; changes take effect immediately and we prorate the difference.

## Plans

- **Starter — $19/month.** 100K events/month, 3 seats, 5-minute dashboard refresh, 6-hour source sync.
- **Pro — $79/month.** 2M events/month, unlimited seats, 60-second refresh, hourly source sync, webhooks.
- **Scale — custom.** Unlimited events, SSO/SAML, dedicated support engineer, custom data retention.

All prices are in USD. Annual billing saves 20% on Starter and Pro.

## Seats and roles

- **Admins** can manage billing, sources, and team members.
- **Editors** can create dashboards and sources but can't touch billing.
- **Viewers** can only view dashboards shared with them.

There is no per-seat charge on any plan — seats are unlimited on Pro and Scale, and capped at 3 on Starter.

## Invoices and receipts

Invoices are emailed to the billing contact on the 1st of each month and are always available under **Settings → Billing → Invoices**. We accept Visa, Mastercard, Amex, and ACH (annual plans only).

## Event overages

If you exceed your monthly event quota, we keep tracking and bill overages at $8 per additional 100K events on Starter and $3 per additional 100K on Pro. You'll get a warning email at 80% and 100% of quota.`,
  },
  {
    title: "Webhooks and API authentication",
    markdown: `# Webhooks and API authentication

Use the Pulseboard API to pull analytics into your own tools, and webhooks to get notified when something happens in your workspace.

## Creating an API key

1. Go to **Settings → API keys → New key**.
2. Give it a name like "ETL pipeline" and choose **Read** or **Read/Write** scope.
3. Copy the key — it starts with \`pb_sk_\` and is shown only once.

Authenticate with HTTP Basic Auth using the key as the username and an empty password, or pass \`Authorization: Bearer pb_sk_...\`.

## Rate limits

- 600 requests per minute per key on Pro, 120 on Starter.
- Exceeding the limit returns \`429\` with a \`Retry-After\` header.

## Webhook events

Register a webhook under **Settings → Webhooks**. We POST JSON to your URL for these events:

- \`dashboard.shared\` — a dashboard is shared with a new person.
- \`source.sync_failed\` — a data source sync failed 3 times.
- \`quota.warning\` — usage hit 80% of the monthly quota.
- \`quota.exceeded\` — usage hit 100% of the monthly quota.

## Verifying webhook signatures

Each POST includes an \`X-Pulseboard-Signature\` header: the hex HMAC-SHA256 of the raw body using your webhook secret. Reject any request whose signature doesn't match.

## Retries

We retry failed webhook deliveries 5 times with exponential backoff (1, 5, 25, 125, 625 seconds). After the 5th failure the event is dropped and logged under **Settings → Webhooks → Delivery log**.`,
  },
];
