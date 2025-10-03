import type { PageServerLoad } from './$types';
import {
	getLocationByPoint,
	getStationsByGridpoint,
	getLatestObservation,
	getForecastByUrl
} from '$lib/services/nws';
import type { LoaderResult } from '$lib/types/errors';
import { ErrorType } from '$lib/types/errors';
import type { LocationInfo, Station, Observation, ForecastDay } from '$lib/types/domain';

interface DemoData {
	location: LocationInfo;
	stations: Station[];
	observation: Observation | null;
	forecast: ForecastDay[];
	coords: string;
}

export const load: PageServerLoad = async (): Promise<LoaderResult<DemoData>> => {
	// Use Boston coordinates for demo
	const lat = 42.3601;
	const lon = -71.0589;
	const coords = `${lat},${lon}`;

	try {
		console.log('🌍 Fetching location data for Boston...');
		const location = await getLocationByPoint(lat, lon);

		console.log('🏢 Fetching weather stations...');
		const stations = await getStationsByGridpoint(location.gridId, location.gridX, location.gridY);

		let observation: Observation | null = null;
		if (stations.length > 0) {
			try {
				console.log(`🌡️ Fetching latest observation from ${stations[0].id}...`);
				observation = await getLatestObservation(stations[0].id);
			} catch (obsError) {
				console.warn('Failed to fetch observation, continuing without it:', obsError);
			}
		}

		console.log('📅 Fetching forecast...');
		const forecast = await getForecastByUrl(location.forecast);

		return {
			data: {
				location,
				stations: stations.slice(0, 5), // Show first 5 stations
				observation,
				forecast: forecast.slice(0, 4), // Show first 4 periods
				coords
			}
		};
	} catch (error: unknown) {
		console.error('Demo page error:', error);
		return {
			data: null,
			error: {
				type: ErrorType.API_ERROR,
				message: error instanceof Error ? error.message : 'Failed to load demo data',
				retryable: true
			}
		};
	}
};
