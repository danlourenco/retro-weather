import type { PageServerLoad } from './$types';
import type { LoaderResult } from '$lib/types/errors';

interface WeatherOverviewData {
	pageTitle: string;
}

export const load: PageServerLoad = async (): Promise<LoaderResult<WeatherOverviewData>> => {
	return {
		data: {
			pageTitle: 'WEATHER MENU'
		}
	};
};
