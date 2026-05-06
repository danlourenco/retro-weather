import type { PageServerLoad } from './$types';
import { ErrorType, type LoaderResult } from '$lib/types/errors';
import type { ForecastDay } from '$lib/types/domain';

interface LocalForecastData {
	forecasts: ForecastDay[];
	coords: string;
	pageTitle: string;
}

export const load: PageServerLoad = async ({
	parent
}): Promise<LoaderResult<LocalForecastData>> => {
	const parentData = await parent();

	if (!parentData.data?.location?.forecast) {
		return {
			data: null,
			error: {
				type: ErrorType.API_ERROR,
				message: 'No forecast data available for this location',
				retryable: false
			}
		};
	}

	const { forecast, coords } = parentData.data;

	return {
		data: {
			forecasts: forecast,
			coords,
			pageTitle: 'Local Forecast'
		}
	};
};
