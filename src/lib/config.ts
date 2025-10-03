import { dev } from '$app/environment';

export const NWS_BASE_URL = 'https://api.weather.gov';

// Configure a descriptive User-Agent per NWS policy.
// Example: retro-weather/1.0 (+https://your-site-or-email)
export const NWS_USER_AGENT = 'retro-weather/0.1 (+https://github.com/danlourenco/retro-weather)';

// Default retry policy used by fetchWithRetry callers (tunable per call)
export const DEFAULT_RETRY = {
	maxRetries: dev ? 1 : 2,
	baseDelayMs: 500,
	maxDelayMs: 4000,
	timeoutMs: 15000
};
