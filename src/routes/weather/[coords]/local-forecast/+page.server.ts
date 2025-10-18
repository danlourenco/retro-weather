import type { PageServerLoad } from './$types';
import { getForecastByUrl } from '$lib/services/nws';
import { ErrorType, type LoaderResult } from '$lib/types/errors';
import type { ForecastDay } from '$lib/types/domain';

interface LocalForecastData {
	forecasts: ForecastDay[];
	coords: string;
	pageTitle: string;
}

export const load: PageServerLoad = async ({ parent }): Promise<LoaderResult<LocalForecastData>> => {
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

	const { location, coords } = parentData.data;

	try {
		const forecasts = await getForecastByUrl(location.forecast);

		return {
			data: {
				forecasts,
				coords,
				pageTitle: 'Local Forecast'
			}
		};
	} catch (err: unknown) {
		console.error('Failed to load forecast data:', err);
		return {
			data: null,
			error: {
				type: ErrorType.API_ERROR,
				message: 'Failed to load forecast data',
				retryable: true
			}
		};
	}
};
