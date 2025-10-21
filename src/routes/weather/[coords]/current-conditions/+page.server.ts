import type { PageServerLoad } from './$types';
import { getStationsByGridpoint, getLatestObservation, getAlertsByPoint } from '$lib/services/nws';
import { ErrorType, type LoaderResult } from '$lib/types/errors';
import { withErrorHandling, withGracefulFallback } from '$lib/utils/loader';
import type { Station, Observation, Hazard } from '$lib/types/domain';

interface CurrentConditionsData {
	station: Station | null;
	observation: Observation | null;
	hazards: Hazard[];
	coords: string;
	pageTitle: string;
}

export const load: PageServerLoad = async ({
	parent
}): Promise<LoaderResult<CurrentConditionsData>> => {
	const parentData = await parent();

	if (!parentData.data?.location?.observationStations) {
		return {
			data: null,
			error: {
				type: ErrorType.API_ERROR,
				message: 'No observation stations available for this location',
				retryable: false
			}
		};
	}

	const { location, coords } = parentData.data;

	// Fetch hazards/alerts for this location (gracefully fail)
	const [lat, lon] = coords.split(',').map(Number);
	const hazards = await withGracefulFallback(
		() => getAlertsByPoint(lat, lon),
		[],
		'Failed to fetch hazards'
	);

	// Get stations and observations with consistent error handling
	return withErrorHandling(async () => {
		// Get stations for this grid point
		const stations = await getStationsByGridpoint(location.gridId, location.gridX, location.gridY);

		if (stations.length === 0) {
			return {
				station: null,
				observation: null,
				hazards,
				coords,
				pageTitle: 'Current Conditions'
			};
		}

		// Get observation from the first available station
		const station = stations[0];

		// Gracefully handle observation fetch failure
		const observation = await withGracefulFallback(
			() => getLatestObservation(station.id),
			null,
			`Failed to get observation for station ${station.id}`
		);

		return {
			station,
			observation,
			hazards,
			coords,
			pageTitle: 'CURRENT CONDITIONS'
		};
	}, 'Failed to load current weather conditions');
};
