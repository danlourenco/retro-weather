/**
 * Loader utility functions for consistent error handling in SvelteKit loaders
 */

import type { LoaderResult, WeatherError } from '$lib/types/errors';
import { createApiError } from '$lib/types/errors';

/**
 * Wraps a loader function with consistent error handling
 * @param fn - The async function to execute
 * @param errorMessage - The error message to use if the function throws
 * @returns A LoaderResult with either data or error
 */
export async function withErrorHandling<T>(
	fn: () => Promise<T>,
	errorMessage: string
): Promise<LoaderResult<T>> {
	try {
		const data = await fn();
		return { data };
	} catch (err: unknown) {
		console.error(errorMessage, err);

		// If it's already a WeatherError, use it
		if (isWeatherError(err)) {
			return { data: null, error: err };
		}

		// Otherwise create a generic API error
		return {
			data: null,
			error: createApiError(errorMessage, undefined, err)
		};
	}
}

/**
 * Wraps a loader function with graceful error handling (logs but doesn't fail)
 * @param fn - The async function to execute
 * @param fallback - The fallback value to return on error
 * @param warningMessage - The warning message to log if the function throws
 * @returns The result of fn() or the fallback value
 */
export async function withGracefulFallback<T>(
	fn: () => Promise<T>,
	fallback: T,
	warningMessage: string
): Promise<T> {
	try {
		return await fn();
	} catch (err: unknown) {
		console.warn(warningMessage, err);
		return fallback;
	}
}

/**
 * Type guard to check if an error is a WeatherError
 */
function isWeatherError(err: unknown): err is WeatherError {
	return (
		typeof err === 'object' &&
		err !== null &&
		'type' in err &&
		'message' in err &&
		'retryable' in err
	);
}
