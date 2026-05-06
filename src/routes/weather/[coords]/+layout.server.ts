import type { LayoutServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { weather } from '$lib/server/weather';
import { createValidationError, type LoaderResult } from '$lib/types/errors';
import type { LocationInfo, Hazard, Station, Observation, ForecastDay } from '$lib/types/domain';

export const load: LayoutServerLoad = async ({
	params,
	setHeaders
}): Promise<
	LoaderResult<{
		location: LocationInfo;
		coords: string;
		hazards: Hazard[];
		station: Station | null;
		observation: Observation | null;
		forecast: ForecastDay[];
		pageTitle?: string;
	}>
> => {
	// Validate coordinates format
	const coords = params.coords?.split(',');
	if (!coords || coords.length !== 2) {
		throw error(400, createValidationError('Invalid coordinates format: expected "lat,lon"'));
	}

	const [lat, lon] = coords;

	// Validate coordinate values
	const latNum = parseFloat(lat);
	const lonNum = parseFloat(lon);
	if (isNaN(latNum) || isNaN(lonNum)) {
		throw error(400, createValidationError('Invalid coordinate values: must be valid numbers'));
	}

	// Validate coordinate ranges
	if (latNum < -90 || latNum > 90) {
		throw error(400, createValidationError('Invalid latitude: must be between -90 and 90'));
	}
	if (lonNum < -180 || lonNum > 180) {
		throw error(400, createValidationError('Invalid longitude: must be between -180 and 180'));
	}

	try {
		const snapshot = await weather.snapshot({ lat: latNum, lon: lonNum });

		// Set caching headers for location data (changes rarely)
		setHeaders({
			'Cache-Control': 'public, max-age=300, stale-while-revalidate=600'
		});

		return {
			data: {
				location: snapshot.location,
				coords: params.coords,
				hazards: snapshot.hazards,
				station: snapshot.stations[0] ?? null,
				observation: snapshot.observation,
				forecast: snapshot.forecast
			}
		};
	} catch (err: unknown) {
		console.error('Failed to load location data:', err);
		throw error(502, 'Weather service temporarily unavailable');
	}
};
