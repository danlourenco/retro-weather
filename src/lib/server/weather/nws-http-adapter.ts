import type { z } from 'zod';
import { fetchWithRetry, DEFAULT_RETRY, type RetryConfig } from '$lib/utils/http';
import { NWS_BASE_URL } from '$lib/config';
import { createApiError } from '$lib/types/errors';
import type { WeatherProvider, Coords, WeatherSnapshot } from './port';
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

	async function hazards(coords: Coords) {
		const url = `${base}/alerts/active?point=${coords.lat.toFixed(4)},${coords.lon.toFixed(4)}`;
		const dto = await getJson(transport, url, AlertsSchema, 'Alerts');
		return mapAlerts(dto);
	}

	async function forecast(forecastUrl: string) {
		const dto = await getJson(transport, forecastUrl, ForecastSchema, 'Forecast');
		return mapForecast(dto);
	}

	async function getStations(gridId: string, x: number, y: number) {
		const url = `${base}/gridpoints/${gridId}/${x},${y}/stations`;
		const dto = await getJson(transport, url, StationsSchema, 'Stations');
		return mapStations(dto);
	}

	async function getObservation(stationId: string) {
		const url = `${base}/stations/${stationId}/observations/latest`;
		const dto = await getJson(transport, url, ObservationSchema, 'Observation');
		return mapObservation(dto);
	}

	async function snapshot(coords: Coords) {
		const loc = await location(coords);
		const stations = await getStations(loc.gridId, loc.gridX, loc.gridY);

		const errors: WeatherSnapshot['errors'] = {};

		const observationPromise =
			stations.length === 0
				? Promise.reject(createApiError('No observation stations available for this location'))
				: getObservation(stations[0].id);

		const [obsResult, forecastResult, hazardsResult] = await Promise.allSettled([
			observationPromise,
			forecast(loc.forecast),
			hazards(coords)
		]);

		let observation: WeatherSnapshot['observation'] = null;
		if (obsResult.status === 'fulfilled') {
			observation = obsResult.value;
		} else {
			errors.observation = obsResult.reason;
		}

		let forecastDays: WeatherSnapshot['forecast'] = [];
		if (forecastResult.status === 'fulfilled') {
			forecastDays = forecastResult.value;
		} else {
			errors.forecast = forecastResult.reason;
		}

		let hazardsList: WeatherSnapshot['hazards'] = [];
		if (hazardsResult.status === 'fulfilled') {
			hazardsList = hazardsResult.value;
		} else {
			errors.hazards = hazardsResult.reason;
		}

		return {
			location: loc,
			stations,
			observation,
			forecast: forecastDays,
			hazards: hazardsList,
			errors
		};
	}

	return { location, hazards, forecast, snapshot };
}
