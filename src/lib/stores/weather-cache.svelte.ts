/**
 * Weather data cache store
 * Caches weather observations for 5 minutes to reduce API calls
 */

import { createCache, formatCacheAge, formatCacheRemaining } from '$lib/utils/cache.svelte';
import type { Observation, Station } from '$lib/types/domain';

interface WeatherCacheData {
	observation: Observation | null;
	station: Station | null;
}

// Cache for 5 minutes (300,000 ms)
const CACHE_TTL = 5 * 60 * 1000;

// Create cache instance
const weatherCache = createCache<WeatherCacheData>({
	ttl: CACHE_TTL,
	storagePrefix: 'weather'
});

/**
 * Create cache key from coordinates
 */
function createCacheKey(coords: string): string {
	return `weather:${coords}`;
}

/**
 * Get cached weather data
 * @param coords - Coordinates in "lat,lon" format
 * @returns Cached data or null if not found/expired
 */
export function getCachedWeather(coords: string): WeatherCacheData | null {
	const key = createCacheKey(coords);
	const data = weatherCache.get(key);

	if (data) {
		const metadata = weatherCache.getMetadata(key);
		if (metadata) {
			console.log(`📦 Cache HIT for ${coords}`);
			console.log(`   Age: ${formatCacheAge(metadata.age)}`);
			console.log(`   Remaining: ${formatCacheRemaining(metadata.remaining)}`);
		}
	} else {
		console.log(`📦 Cache MISS for ${coords}`);
	}

	return data;
}

/**
 * Set weather data in cache
 * @param coords - Coordinates in "lat,lon" format
 * @param data - Weather data to cache
 */
export function setCachedWeather(coords: string, data: WeatherCacheData): void {
	const key = createCacheKey(coords);
	weatherCache.set(key, data);
	console.log(`📦 Cache SET for ${coords} (TTL: 5 minutes)`);
}

/**
 * Check if cache has valid data for coordinates
 * @param coords - Coordinates in "lat,lon" format
 * @returns True if cache has valid data
 */
export function hasCachedWeather(coords: string): boolean {
	const key = createCacheKey(coords);
	return weatherCache.has(key);
}

/**
 * Invalidate cached weather data
 * @param coords - Coordinates in "lat,lon" format
 */
export function invalidateWeatherCache(coords: string): void {
	const key = createCacheKey(coords);
	weatherCache.invalidate(key);
	console.log(`📦 Cache INVALIDATED for ${coords}`);
}

/**
 * Clear all cached weather data
 */
export function clearWeatherCache(): void {
	weatherCache.clear();
	console.log('📦 Cache CLEARED (all entries removed)');
}

/**
 * Get cache metadata for debugging
 * @param coords - Coordinates in "lat,lon" format
 * @returns Cache metadata or null
 */
export function getWeatherCacheMetadata(coords: string) {
	const key = createCacheKey(coords);
	return weatherCache.getMetadata(key);
}

/**
 * Clean up expired entries
 * @returns Number of entries removed
 */
export function cleanupWeatherCache(): number {
	const removed = weatherCache.cleanup();
	if (removed > 0) {
		console.log(`📦 Cache cleanup: removed ${removed} expired entries`);
	}
	return removed;
}

// Auto-cleanup every minute
if (typeof window !== 'undefined') {
	setInterval(() => {
		cleanupWeatherCache();
	}, 60 * 1000);
}

// Export cache instance for advanced usage
export { weatherCache };
