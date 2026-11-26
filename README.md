# FX Journey

A responsive Forex journal with trade logging, reflections, rule checklists, performance analytics, account settings, risk-limit tracking, a floating multi-tool calculator, and optional AI-powered journal reviews.

## Run locally

Requires Node.js 20+ and Vercel tooling for the API routes.

```bash
npm install
npx vercel dev
```

Open the local URL printed by Vercel. The journal and calculators work without API keys. AI review requires `OPENAI_API_KEY`; the live economic calendar requires `FINNHUB_API_KEY`.

## Deploy with the API backend

GitHub Pages only serves static files and **cannot run** the `/api/*` functions. Deploy this repository to Vercel (import the GitHub repository and select the `build/fxjourney-trading-journal` branch), then add these server-side environment variables in the Vercel project settings:

- `OPENAI_API_KEY` — secret key for AI journal reviews. Never put it in browser code or commit it to Git.
- `OPENAI_MODEL` — optional model override; defaults to `gpt-4o-mini`.
- `FINNHUB_API_KEY` — Finnhub API token for the live economic calendar. It is sent only from the server to Finnhub and is never exposed in browser JavaScript.

Redeploy after setting environment variables. The AI endpoint is called only when a user requests analysis. The calendar page at `/economic-calendar.html` retrieves provider data from `/api/economic-calendar`; its backend limits requests to a maximum 14-day range and briefly caches responses.

## Economic calendar and alerts

Open `/economic-calendar.html` on the deployed Vercel site. It shows scheduled events with local-time display, high/medium/low impact filters, country/currency filters, actual/forecast/previous values, and automatic refresh every five minutes. Users can opt in to browser notifications for high-impact events scheduled in the next 15 minutes. Notifications require browser permission and the calendar page to remain open; background delivery is not guaranteed. Calendar timing and impact are provider-supplied and informational, not trading advice.

## Data and analytics

Trades, settings, calculator inputs, and a short-lived calendar copy are stored in browser `localStorage`; this version does not sync accounts across devices. Account/risk controls are tracking aids, not broker-enforced limits. Use the journal's export feature for backups. The lot-size tool uses user-entered contract/pip assumptions; verify broker specifications. AI and news content are educational/informational and are not financial advice or guaranteed trading edges.

Dashboard analytics include equity curve, pair and monthly P&L, win rate, profit factor, drawdown, expectancy, average win/loss, and checklist adherence. The calculator includes position size, pip/tick value, margin, P/L, risk/reward, overnight swap, and sessions.
