import { describe, it, expect } from 'vitest';
import { createNwsHttpProvider } from './nws-http-adapter';
import {
	fakeTransport,
	type Fetcher,
	POINTS_FIXTURE,
	ALERTS_FIXTURE,
	ALERTS_EMPTY_FIXTURE,
	FORECAST_FIXTURE
} from './__fixtures__/nws';

describe('NwsHttpProvider.location', () => {
	it('returns mapped LocationInfo for valid coords', async () => {
		const transport = fakeTransport({ '/points/': POINTS_FIXTURE });
		const provider = createNwsHttpProvider({ transport });

		const result = await provider.location({ lat: 40.7128, lon: -74.006 });

		expect(result).toEqual({
			forecast: 'https://api.weather.gov/gridpoints/OKX/33,35/forecast',
			forecastHourly: 'https://api.weather.gov/gridpoints/OKX/33,35/forecast/hourly',
			observationStations: 'https://api.weather.gov/gridpoints/OKX/33,35/stations',
			gridId: 'OKX',
			gridX: 33,
			gridY: 35
		});
	});

	it('throws WeatherError on non-2xx response', async () => {
		const transport = fakeTransport({ '/points/': {} }, 503);
		const provider = createNwsHttpProvider({ transport });

		await expect(provider.location({ lat: 40, lon: -74 })).rejects.toMatchObject({
			type: 'API_ERROR',
			statusCode: 503
		});
	});

	it('throws WeatherError on schema mismatch', async () => {
		const transport = fakeTransport({ '/points/': { properties: { wrong: 'shape' } } });
		const provider = createNwsHttpProvider({ transport });

		await expect(provider.location({ lat: 40, lon: -74 })).rejects.toMatchObject({
			type: 'API_ERROR',
			message: expect.stringContaining('Invalid')
		});
	});
});

describe('NwsHttpProvider.hazards', () => {
	it('returns mapped Hazard[] when alerts exist', async () => {
		const transport = fakeTransport({ '/alerts/active': ALERTS_FIXTURE });
		const provider = createNwsHttpProvider({ transport });

		const result = await provider.hazards({ lat: 40, lon: -74 });

		expect(result).toEqual([
			{
				headline: 'Severe Thunderstorm Warning',
				description: 'Severe thunderstorms expected.',
				severity: 'Severe',
				urgency: 'Immediate',
				certainty: 'Observed',
				areas: 'New York County, NY'
			}
		]);
	});

	it('returns empty array when no alerts active', async () => {
		const transport = fakeTransport({ '/alerts/active': ALERTS_EMPTY_FIXTURE });
		const provider = createNwsHttpProvider({ transport });

		expect(await provider.hazards({ lat: 40, lon: -74 })).toEqual([]);
	});

	it('throws WeatherError on non-2xx response', async () => {
		const transport = fakeTransport({ '/alerts/active': {} }, 500);
		const provider = createNwsHttpProvider({ transport });

		await expect(provider.hazards({ lat: 40, lon: -74 })).rejects.toMatchObject({
			type: 'API_ERROR',
			statusCode: 500
		});
	});
});

describe('NwsHttpProvider.forecast', () => {
	it('returns mapped ForecastDay[] for the given URL', async () => {
		const transport = fakeTransport({ '/gridpoints/': FORECAST_FIXTURE });
		const provider = createNwsHttpProvider({ transport });

		const result = await provider.forecast(
			'https://api.weather.gov/gridpoints/OKX/33,35/forecast'
		);

		expect(result).toHaveLength(2);
		expect(result[0]).toEqual({
			dayName: 'Today',
			startTime: '2026-05-06T06:00:00-04:00',
			isDaytime: true,
			temperature: 72,
			shortForecast: 'Sunny',
			detailedForecast: 'Sunny, with a high near 72.',
			icon: 'https://api.weather.gov/icons/land/day/few?size=medium'
		});
	});

	it('passes the forecast URL through unchanged (round-trip)', async () => {
		const seen: string[] = [];
		const transport: Fetcher = async (url) => {
			seen.push(url);
			return new Response(JSON.stringify(FORECAST_FIXTURE), { status: 200 });
		};
		const provider = createNwsHttpProvider({ transport });

		await provider.forecast('https://example.test/some/forecast/url');

		expect(seen).toEqual(['https://example.test/some/forecast/url']);
	});

	it('throws WeatherError on non-2xx response', async () => {
		const transport = fakeTransport({ '/forecast': {} }, 502);
		const provider = createNwsHttpProvider({ transport });

		await expect(
			provider.forecast('https://api.weather.gov/gridpoints/OKX/33,35/forecast')
		).rejects.toMatchObject({ type: 'API_ERROR', statusCode: 502 });
	});
});
