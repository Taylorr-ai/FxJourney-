# FX Journey

A responsive Forex journal with trade logging, reflections, rule checklists, performance analytics, account settings, risk-limit tracking, and optional AI-powered journal reviews.

## Run locally

Requires Node.js 20+ and a Vercel account/tooling for the API route.

```bash
npm install
npx vercel dev
```

Open the local URL printed by Vercel. The static journal works without an AI key; the AI review endpoint requires `OPENAI_API_KEY`.

## Deploy with a real AI backend

GitHub Pages only serves static files and **cannot run** the `/api/analyze` function. Deploy this repository to Vercel (import the GitHub repository and select the `build/fxjourney-trading-journal` branch), then add these server-side environment variables in the Vercel project settings:

- `OPENAI_API_KEY` — secret API key from your OpenAI account. Never put this in browser code or commit it to Git.
- `OPENAI_MODEL` — optional model override; defaults to `gpt-4o-mini`.

After setting variables, redeploy. The app calls `/api/analyze` only when a user presses **Analyze trades**. The API validates and limits payload size, calls OpenAI server-side, and never returns or exposes the secret key. Keep provider billing limits enabled and review the provider's data-retention/privacy terms before sending journal reflections.

## Data and analytics

Trades and settings are stored in browser `localStorage` on the current device; this version does not synchronize accounts across browsers or devices. Account/risk controls are tracking aids, not broker-enforced limits. Use **Export journal JSON** for a local backup. **Clear local journal** is irreversible.

Dashboard analytics include an equity curve with date ranges, pair and monthly P&L, win rate, profit factor, drawdown, expectancy, average win/loss, and checklist adherence. AI output is a journal review for educational purposes, not a financial recommendation or guaranteed trading edge.
