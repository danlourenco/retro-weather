import { dev } from '$app/environment';

/**
 * External API Configuration
 * Centralized configuration for all external service endpoints
 */

// National Weather Service API
export const NWS_BASE_URL = dev
	? 'https://api.weather.gov' // Could point to mock server in dev
	: 'https://api.weather.gov';

// Configure a descriptive User-Agent per NWS policy
// Example: retro-weather/1.0 (+https://your-site-or-email)
export const NWS_USER_AGENT = 'retro-weather/0.1 (+https://github.com/danlourenco/retro-weather)';

// Zippopotam.us Geocoding API
export const ZIPCODE_API_BASE_URL = dev
	? 'https://api.zippopotam.us' // Could point to mock server in dev
	: 'https://api.zippopotam.us';

/**
 * Retry Configuration
 * Default retry policy used by fetchWithRetry callers (tunable per call)
 */
export const DEFAULT_RETRY = {
	maxRetries: dev ? 1 : 2, // Fewer retries in dev for faster feedback
	baseDelayMs: 500,
	maxDelayMs: 4000,
	timeoutMs: 15000
};

/**
 * Geolocation Configuration
 */
export const GEOLOCATION_OPTIONS = {
	timeout: 10000,
	enableHighAccuracy: true,
	maximumAge: 0
};
