// HTTP utilities with retry logic and proper error handling

import { createNetworkError, createTimeoutError } from '$lib/types/errors';

export interface RetryConfig {
	maxRetries: number;
	baseDelayMs: number;
	maxDelayMs: number;
	timeoutMs: number;
}

export const DEFAULT_RETRY: RetryConfig = {
	maxRetries: 2,
	baseDelayMs: 500,
	maxDelayMs: 4000,
	timeoutMs: 15000
};

export async function fetchWithRetry(
	url: string,
	options: RequestInit = {},
	retryConfig: RetryConfig = DEFAULT_RETRY
): Promise<Response> {
	let lastError: Error | undefined;

	for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
		try {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), retryConfig.timeoutMs);

			const response = await fetch(url, {
				...options,
				signal: controller.signal,
				headers: {
					'User-Agent': 'retro-weather/0.1 (+https://github.com/danlourenco/retro-weather)',
					...options.headers
				}
			});

			clearTimeout(timeoutId);

			// Return successful responses or non-retryable errors immediately
			if (response.ok || !isRetryableStatus(response.status)) {
				return response;
			}

			// Treat as server error for retry logic
			lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
		} catch (error) {
			lastError = error as Error;

			// Don't retry if it's an abort (timeout)
			if (lastError.name === 'AbortError') {
				throw createTimeoutError(`Request timed out after ${retryConfig.timeoutMs}ms`);
			}

			// Don't retry on the last attempt
			if (attempt === retryConfig.maxRetries) {
				break;
			}
		}

		// Wait before retrying (exponential backoff with jitter)
		if (attempt < retryConfig.maxRetries) {
			const delay = Math.min(
				retryConfig.baseDelayMs * Math.pow(2, attempt) * (0.5 + Math.random() * 0.5),
				retryConfig.maxDelayMs
			);
			await sleep(delay);
		}
	}

	// All retries exhausted
	throw createNetworkError(
		`Failed after ${retryConfig.maxRetries + 1} attempts: ${lastError?.message || 'Unknown error'}`,
		lastError
	);
}

function isRetryableStatus(status: number): boolean {
	// Retry on server errors and rate limiting
	return status >= 500 || status === 429;
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
