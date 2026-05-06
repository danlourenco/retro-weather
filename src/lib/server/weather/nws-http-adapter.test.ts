import { describe, it, expect } from 'vitest';
import { createNwsHttpProvider } from './nws-http-adapter';
import {
	fakeTransport,
	type Fetcher,
	POINTS_FIXTURE,
	ALERTS_FIXTURE,
	ALERTS_EMPTY_FIXTURE,
	FORECAST_FIXTURE,
	STATIONS_FIXTURE,
	OBSERVATION_FIXTURE,
	STATIONS_EMPTY_FIXTURE
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

		const result = await provider.forecast('https://api.weather.gov/gridpoints/OKX/33,35/forecast');

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

describe('NwsHttpProvider.snapshot', () => {
	it('returns full snapshot when all calls succeed', async () => {
		const transport = fakeTransport({
			'/observations/latest': OBSERVATION_FIXTURE,
			'/alerts/active': ALERTS_FIXTURE,
			'/stations': STATIONS_FIXTURE,
			'/gridpoints/': FORECAST_FIXTURE,
			'/points/': POINTS_FIXTURE
		});
		const provider = createNwsHttpProvider({ transport });

		const snap = await provider.snapshot({ lat: 40.7, lon: -74 });

		expect(snap.location.gridId).toBe('OKX');
		expect(snap.stations).toHaveLength(2);
		expect(snap.observation).not.toBeNull();
		expect(snap.observation?.temperatureC).toBe(15.5);
		expect(snap.forecast).toHaveLength(2);
		expect(snap.hazards).toHaveLength(1);
		expect(snap.errors).toEqual({});
	});

	it('captures observation error and sets observation=null when observation fails', async () => {
		const transport: Fetcher = async (url) => {
			if (url.includes('/observations/latest')) return new Response('boom', { status: 500 });
			if (url.includes('/alerts/active')) return new Response(JSON.stringify(ALERTS_EMPTY_FIXTURE));
			if (url.includes('/stations')) return new Response(JSON.stringify(STATIONS_FIXTURE));
			if (url.includes('/gridpoints/')) return new Response(JSON.stringify(FORECAST_FIXTURE));
			if (url.includes('/points/')) return new Response(JSON.stringify(POINTS_FIXTURE));
			return new Response('unmocked', { status: 404 });
		};
		const provider = createNwsHttpProvider({ transport });

		const snap = await provider.snapshot({ lat: 40, lon: -74 });

		expect(snap.observation).toBeNull();
		expect(snap.errors.observation).toMatchObject({ type: 'API_ERROR', statusCode: 500 });
		expect(snap.forecast).toHaveLength(2);
		expect(snap.errors.forecast).toBeUndefined();
	});

	it('captures forecast error and sets forecast=[] when forecast fails', async () => {
		const transport: Fetcher = async (url) => {
			if (url.includes('/observations/latest'))
				return new Response(JSON.stringify(OBSERVATION_FIXTURE));
			if (url.includes('/alerts/active')) return new Response(JSON.stringify(ALERTS_EMPTY_FIXTURE));
			if (url.includes('/stations')) return new Response(JSON.stringify(STATIONS_FIXTURE));
			if (url.includes('/gridpoints/') && url.endsWith('/forecast'))
				return new Response('nope', { status: 502 });
			if (url.includes('/points/')) return new Response(JSON.stringify(POINTS_FIXTURE));
			return new Response('unmocked', { status: 404 });
		};
		const provider = createNwsHttpProvider({ transport });

		const snap = await provider.snapshot({ lat: 40, lon: -74 });

		expect(snap.forecast).toEqual([]);
		expect(snap.errors.forecast).toMatchObject({ type: 'API_ERROR', statusCode: 502 });
		expect(snap.observation).not.toBeNull();
	});

	it('captures hazards error and sets hazards=[] when hazards fail', async () => {
		const transport: Fetcher = async (url) => {
			if (url.includes('/observations/latest'))
				return new Response(JSON.stringify(OBSERVATION_FIXTURE));
			if (url.includes('/alerts/active')) return new Response('nope', { status: 503 });
			if (url.includes('/stations')) return new Response(JSON.stringify(STATIONS_FIXTURE));
			if (url.includes('/gridpoints/')) return new Response(JSON.stringify(FORECAST_FIXTURE));
			if (url.includes('/points/')) return new Response(JSON.stringify(POINTS_FIXTURE));
			return new Response('unmocked', { status: 404 });
		};
		const provider = createNwsHttpProvider({ transport });

		const snap = await provider.snapshot({ lat: 40, lon: -74 });

		expect(snap.hazards).toEqual([]);
		expect(snap.errors.hazards).toMatchObject({ type: 'API_ERROR', statusCode: 503 });
	});

	it('throws when location call fails', async () => {
		const transport = fakeTransport({ '/points/': {} }, 500);
		const provider = createNwsHttpProvider({ transport });

		await expect(provider.snapshot({ lat: 40, lon: -74 })).rejects.toMatchObject({
			type: 'API_ERROR',
			statusCode: 500
		});
	});

	it('captures stations error and lets forecast/hazards still resolve when stations fails', async () => {
		const transport: Fetcher = async (url) => {
			if (url.includes('/alerts/active'))
				return new Response(JSON.stringify(ALERTS_EMPTY_FIXTURE));
			if (url.includes('/stations')) return new Response('boom', { status: 500 });
			if (url.includes('/gridpoints/')) return new Response(JSON.stringify(FORECAST_FIXTURE));
			if (url.includes('/points/')) return new Response(JSON.stringify(POINTS_FIXTURE));
			return new Response('unmocked', { status: 404 });
		};
		const provider = createNwsHttpProvider({ transport });

		const snap = await provider.snapshot({ lat: 40, lon: -74 });

		expect(snap.stations).toEqual([]);
		expect(snap.errors.stations).toMatchObject({ type: 'API_ERROR', statusCode: 500 });
		expect(snap.observation).toBeNull();
		expect(snap.errors.observation).toBeUndefined();
		expect(snap.forecast).toHaveLength(2);
		expect(snap.hazards).toEqual([]);
	});

	it('returns observation=null with synthetic error when stations is empty', async () => {
		const transport = fakeTransport({
			'/alerts/active': ALERTS_EMPTY_FIXTURE,
			'/stations': STATIONS_EMPTY_FIXTURE,
			'/gridpoints/': FORECAST_FIXTURE,
			'/points/': POINTS_FIXTURE
		});
		const provider = createNwsHttpProvider({ transport });

		const snap = await provider.snapshot({ lat: 40, lon: -74 });

		expect(snap.observation).toBeNull();
		expect(snap.errors.observation).toMatchObject({
			type: 'API_ERROR',
			message: expect.stringContaining('No observation stations')
		});
		expect(snap.forecast).toHaveLength(2);
	});
});
