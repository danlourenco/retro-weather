import type { PageServerLoad } from './$types';
import { ErrorType, type LoaderResult } from '$lib/types/errors';
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

	const { coords, hazards, station, observation } = parentData.data;

	return {
		data: {
			station,
			observation,
			hazards,
			coords,
			pageTitle: 'CURRENT CONDITIONS'
		}
	};
};
