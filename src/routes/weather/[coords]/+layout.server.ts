import type { LayoutServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getLocationByPoint, getAlertsByPoint } from '$lib/services/nws';
import { createValidationError, type LoaderResult } from '$lib/types/errors';
import type { LocationInfo, Hazard } from '$lib/types/domain';

export const load: LayoutServerLoad = async ({
	params,
	setHeaders
}): Promise<
	LoaderResult<{ location: LocationInfo; coords: string; hazards: Hazard[]; pageTitle?: string }>
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
		const location = await getLocationByPoint(latNum, lonNum);

		// Fetch hazards/alerts for this location
		let hazards: Hazard[] = [];
		try {
			hazards = await getAlertsByPoint(latNum, lonNum);
		} catch (hazardError) {
			console.warn('Failed to fetch hazards:', hazardError);
			// Don't fail the whole request if hazards fail
		}

		// Set caching headers for location data (changes rarely)
		// Note: hazards change more frequently, but we'll cache conservatively
		setHeaders({
			'Cache-Control': 'public, max-age=300, stale-while-revalidate=600'
		});

		return {
			data: {
				location,
				coords: params.coords,
				hazards
			}
		};
	} catch (err: unknown) {
		console.error('Failed to load location data:', err);
		throw error(502, 'Weather service temporarily unavailable');
	}
};
