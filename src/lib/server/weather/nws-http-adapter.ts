import type { z } from 'zod';
import { fetchWithRetry, DEFAULT_RETRY, type RetryConfig } from '$lib/utils/http';
import { NWS_BASE_URL } from '$lib/config';
import { createApiError } from '$lib/types/errors';
import type { WeatherProvider, Coords } from './port';
import {
	PointsResponseSchema,
	ForecastSchema,
	StationsSchema,
	ObservationSchema,
	AlertsSchema
} from './nws-schemas';
import { mapPoints, mapStations, mapObservation, mapForecast, mapAlerts } from './nws-mappers';

type Fetcher = (url: string, options?: RequestInit, retry?: RetryConfig) => Promise<Response>;

interface AdapterOpts {
	transport?: Fetcher;
	baseUrl?: string;
}

const HEADERS = { Accept: 'application/geo+json' };

async function getJson<T>(
	transport: Fetcher,
	url: string,
	schema: z.ZodSchema<T>,
	context: string
): Promise<T> {
	const response = await transport(url, { headers: HEADERS }, DEFAULT_RETRY);
	if (!response.ok) {
		throw createApiError(
			`${context} request failed: ${response.status} ${response.statusText}`,
			response.status
		);
	}
	const json = await response.json();
	const result = schema.safeParse(json);
	if (!result.success) {
		throw createApiError(`Invalid ${context} response from NWS API`, undefined, result.error);
	}
	return result.data;
}

export function createNwsHttpProvider(opts: AdapterOpts = {}): WeatherProvider {
	const transport = opts.transport ?? fetchWithRetry;
	const base = opts.baseUrl ?? NWS_BASE_URL;

	async function location(coords: Coords) {
		const url = `${base}/points/${coords.lat.toFixed(4)},${coords.lon.toFixed(4)}`;
		const dto = await getJson(transport, url, PointsResponseSchema, 'Points');
		return mapPoints(dto);
	}

	// Stubs for the rest of the port — implemented in later tasks.
	const notYet = (name: string) => async () => {
		throw new Error(`${name} not implemented`);
	};

	return {
		location,
		snapshot: notYet('snapshot') as WeatherProvider['snapshot'],
		forecast: notYet('forecast') as WeatherProvider['forecast'],
		hazards: notYet('hazards') as WeatherProvider['hazards']
	};
}
