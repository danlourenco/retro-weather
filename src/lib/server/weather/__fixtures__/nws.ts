import type {
	PointsResponseSchema,
	StationsSchema,
	ObservationSchema,
	ForecastSchema,
	AlertsSchema
} from '../nws-schemas';
import type { z } from 'zod';

export const POINTS_FIXTURE: z.infer<typeof PointsResponseSchema> = {
	properties: {
		forecast: 'https://api.weather.gov/gridpoints/OKX/33,35/forecast',
		forecastHourly: 'https://api.weather.gov/gridpoints/OKX/33,35/forecast/hourly',
		observationStations: 'https://api.weather.gov/gridpoints/OKX/33,35/stations',
		gridId: 'OKX',
		gridX: 33,
		gridY: 35
	}
};

export const STATIONS_FIXTURE: z.infer<typeof StationsSchema> = {
	features: [
		{ properties: { stationIdentifier: 'KNYC', name: 'New York Central Park' } },
		{ properties: { stationIdentifier: 'KJFK', name: 'JFK Airport' } }
	]
};

export const STATIONS_EMPTY_FIXTURE: z.infer<typeof StationsSchema> = { features: [] };

export const OBSERVATION_FIXTURE: z.infer<typeof ObservationSchema> = {
	properties: {
		temperature: { value: 15.5 },
		textDescription: 'Partly Cloudy',
		relativeHumidity: { value: 65 },
		dewpoint: { value: 8.2 },
		visibility: { value: 16093 },
		windChill: { value: null },
		windDirection: { value: 180 },
		windSpeed: { value: 5.2 },
		icon: 'https://api.weather.gov/icons/land/day/few?size=medium',
		timestamp: '2026-05-06T12:00:00Z'
	}
};

export const FORECAST_FIXTURE: z.infer<typeof ForecastSchema> = {
	properties: {
		periods: [
			{
				name: 'Today',
				startTime: '2026-05-06T06:00:00-04:00',
				isDaytime: true,
				temperature: 72,
				shortForecast: 'Sunny',
				detailedForecast: 'Sunny, with a high near 72.',
				icon: 'https://api.weather.gov/icons/land/day/few?size=medium'
			},
			{
				name: 'Tonight',
				startTime: '2026-05-06T18:00:00-04:00',
				isDaytime: false,
				temperature: 55,
				shortForecast: 'Clear',
				detailedForecast: 'Clear, with a low around 55.',
				icon: 'https://api.weather.gov/icons/land/night/few?size=medium'
			}
		]
	}
};

export const ALERTS_EMPTY_FIXTURE: z.infer<typeof AlertsSchema> = { features: [] };

export const ALERTS_FIXTURE: z.infer<typeof AlertsSchema> = {
	features: [
		{
			properties: {
				headline: 'Severe Thunderstorm Warning',
				description: 'Severe thunderstorms expected.',
				severity: 'Severe',
				urgency: 'Immediate',
				certainty: 'Observed',
				areaDesc: 'New York County, NY'
			}
		}
	]
};

/**
 * Build a fake transport that maps URL substrings to canned JSON responses.
 * Matches the signature of fetchWithRetry from $lib/utils/http.
 */
export type Fetcher = (url: string, options?: RequestInit, retry?: unknown) => Promise<Response>;

export function fakeTransport(routes: Record<string, unknown>, status = 200): Fetcher {
	return async (url) => {
		for (const [pattern, body] of Object.entries(routes)) {
			if (url.includes(pattern)) {
				return new Response(JSON.stringify(body), {
					status,
					headers: { 'Content-Type': 'application/geo+json' }
				});
			}
		}
		return new Response(`Unmocked URL: ${url}`, { status: 404 });
	};
}
