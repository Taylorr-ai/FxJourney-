const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_RANGE_DAYS = 14;

function validDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Use GET to load the economic calendar.' });
  }

  const token = process.env.FINNHUB_API_KEY;
  if (!token) {
    return res.status(503).json({ error: 'Economic calendar is not configured. Add FINNHUB_API_KEY to the server environment.' });
  }

  const today = new Date().toISOString().slice(0, 10);
  const from = req.query?.from || today;
  const fallbackTo = new Date(Date.now() + 7 * DAY_MS).toISOString().slice(0, 10);
  const to = req.query?.to || fallbackTo;
  if (!validDate(from) || !validDate(to) || Date.parse(`${to}T00:00:00Z`) < Date.parse(`${from}T00:00:00Z`)) {
    return res.status(400).json({ error: 'Use valid from/to dates in YYYY-MM-DD format.' });
  }
  if ((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY_MS > MAX_RANGE_DAYS) {
    return res.status(400).json({ error: `Date range cannot exceed ${MAX_RANGE_DAYS} days.` });
  }

  try {
    const url = new URL('https://finnhub.io/api/v1/calendar/economic');
    url.searchParams.set('from', from);
    url.searchParams.set('to', to);
    const upstream = await fetch(url, {
      headers: { 'X-Finnhub-Token': token, Accept: 'application/json' },
      signal: AbortSignal.timeout(10000),
    });
    if (!upstream.ok) {
      console.error('Finnhub economic calendar returned status', upstream.status);
      if (upstream.status === 429) return res.status(503).json({ error: 'Calendar provider rate limit reached. Please try again in a minute.' });
      return res.status(502).json({ error: 'Calendar provider is temporarily unavailable.' });
    }
    const payload = await upstream.json();
    const events = Array.isArray(payload.economicCalendar) ? payload.economicCalendar : [];
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    return res.status(200).json({ events, from, to, source: 'Finnhub' });
  } catch (error) {
    console.error('Economic calendar request failed:', error?.name || 'unknown error');
    return res.status(502).json({ error: 'Unable to load the calendar right now. Please try again shortly.' });
  }
}
