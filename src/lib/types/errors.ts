// Typed error system for weather application

export enum ErrorType {
	VALIDATION = 'VALIDATION',
	API_ERROR = 'API_ERROR',
	NETWORK_ERROR = 'NETWORK_ERROR',
	TIMEOUT = 'TIMEOUT',
	UNKNOWN = 'UNKNOWN'
}

export interface WeatherError {
	type: ErrorType;
	message: string;
	retryable: boolean;
	statusCode?: number;
	details?: unknown;
}

export interface LoaderResult<T> {
	data: T | null;
	error?: WeatherError;
}

export function createApiError(
	message: string,
	statusCode?: number,
	details?: unknown
): WeatherError {
	return {
		type: ErrorType.API_ERROR,
		message,
		retryable: isRetryableStatusCode(statusCode),
		statusCode,
		details
	};
}

export function createNetworkError(message: string, details?: unknown): WeatherError {
	return {
		type: ErrorType.NETWORK_ERROR,
		message,
		retryable: true,
		details
	};
}

export function createValidationError(message: string, details?: unknown): WeatherError {
	return {
		type: ErrorType.VALIDATION,
		message,
		retryable: false,
		details
	};
}

export function createTimeoutError(message: string): WeatherError {
	return {
		type: ErrorType.TIMEOUT,
		message,
		retryable: true
	};
}

function isRetryableStatusCode(statusCode?: number): boolean {
	if (!statusCode) return true;

	// Client errors (4xx) are generally not retryable, except for rate limiting
	if (statusCode >= 400 && statusCode < 500) {
		return statusCode === 429; // Too Many Requests
	}

	// Server errors (5xx) are retryable
	return statusCode >= 500;
}
