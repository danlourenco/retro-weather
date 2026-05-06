import { describe, it, expect } from 'vitest';
import { createNwsHttpProvider } from './nws-http-adapter';
import { fakeTransport, POINTS_FIXTURE } from './__fixtures__/nws';

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
