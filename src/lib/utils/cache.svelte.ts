/**
 * Client-side cache utility with TTL (Time To Live) support
 * Uses Svelte 5 runes for reactivity
 */

interface CacheEntry<T> {
	data: T;
	timestamp: number;
	expiresAt: number;
}

interface CacheOptions {
	/** Time to live in milliseconds */
	ttl: number;
	/** Optional key prefix for localStorage */
	storagePrefix?: string;
}

/**
 * Create a cache store with TTL support
 * @param options - Cache configuration options
 */
export function createCache<T>(options: CacheOptions) {
	const { ttl, storagePrefix = 'cache' } = options;

	// State to track cache entries
	let entries = $state<Map<string, CacheEntry<T>>>(new Map());

	/**
	 * Get cached data if still valid
	 * @param key - Cache key
	 * @returns Cached data or null if expired/missing
	 */
	function get(key: string): T | null {
		const entry = entries.get(key);

		if (!entry) {
			return null;
		}

		const now = Date.now();

		// Check if expired
		if (now > entry.expiresAt) {
			// Remove expired entry
			entries.delete(key);
			return null;
		}

		return entry.data;
	}

	/**
	 * Set data in cache with TTL
	 * @param key - Cache key
	 * @param data - Data to cache
	 */
	function set(key: string, data: T): void {
		const now = Date.now();
		const entry: CacheEntry<T> = {
			data,
			timestamp: now,
			expiresAt: now + ttl
		};

		entries.set(key, entry);
	}

	/**
	 * Get cache metadata (age, remaining time)
	 * @param key - Cache key
	 * @returns Cache metadata or null
	 */
	function getMetadata(key: string): { age: number; remaining: number; isExpired: boolean } | null {
		const entry = entries.get(key);

		if (!entry) {
			return null;
		}

		const now = Date.now();
		const age = now - entry.timestamp;
		const remaining = entry.expiresAt - now;
		const isExpired = remaining <= 0;

		return {
			age,
			remaining,
			isExpired
		};
	}

	/**
	 * Check if cache has valid data for key
	 * @param key - Cache key
	 * @returns True if cache has valid (non-expired) data
	 */
	function has(key: string): boolean {
		return get(key) !== null;
	}

	/**
	 * Invalidate (clear) a specific cache entry
	 * @param key - Cache key to invalidate
	 */
	function invalidate(key: string): void {
		entries.delete(key);
	}

	/**
	 * Clear all cache entries
	 */
	function clear(): void {
		entries.clear();
	}

	/**
	 * Get all cache keys
	 * @returns Array of cache keys
	 */
	function keys(): string[] {
		return Array.from(entries.keys());
	}

	/**
	 * Get number of cached entries
	 */
	function size(): number {
		return entries.size;
	}

	/**
	 * Clean up expired entries
	 * @returns Number of entries removed
	 */
	function cleanup(): number {
		const now = Date.now();
		let removed = 0;

		for (const [key, entry] of entries) {
			if (now > entry.expiresAt) {
				entries.delete(key);
				removed++;
			}
		}

		return removed;
	}

	return {
		get,
		set,
		has,
		invalidate,
		clear,
		keys,
		size,
		cleanup,
		getMetadata,
		get entries() {
			return entries;
		}
	};
}

/**
 * Format cache age for display
 * @param ageMs - Age in milliseconds
 * @returns Formatted string (e.g., "2m 30s ago")
 */
export function formatCacheAge(ageMs: number): string {
	const seconds = Math.floor(ageMs / 1000);
	const minutes = Math.floor(seconds / 60);

	if (minutes > 0) {
		const remainingSeconds = seconds % 60;
		return `${minutes}m ${remainingSeconds}s ago`;
	}

	return `${seconds}s ago`;
}

/**
 * Format remaining cache time
 * @param remainingMs - Remaining time in milliseconds
 * @returns Formatted string (e.g., "2m 30s remaining")
 */
export function formatCacheRemaining(remainingMs: number): string {
	const seconds = Math.floor(remainingMs / 1000);
	const minutes = Math.floor(seconds / 60);

	if (minutes > 0) {
		const remainingSeconds = seconds % 60;
		return `${minutes}m ${remainingSeconds}s`;
	}

	return `${seconds}s`;
}
