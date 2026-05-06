# NWS Gateway Port + Adapter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace 4 shallow NWS files (`services/nws.ts`, `validators/nws.ts`, `mappers/nws.ts`, `types/nws.ts`) with a deep `WeatherProvider` module under `src/lib/server/weather/` that route loaders call as `weather.snapshot(coords)`.

**Architecture:** Define a domain-shaped `WeatherProvider` port. Build an HTTP adapter that owns the entire fetch+validate+map ritual privately. Provide an in-memory adapter for testing. Route loaders depend only on the port, allowing them to be tested without mocking `fetch`. Implements GitHub issue #6.

**Tech Stack:** TypeScript, SvelteKit (Svelte 5, server-only modules via `$lib/server/`), Zod, Vitest with `@vitest/browser` (chromium for client tests, node for server tests).

---

## Module structure (final)

```
src/lib/server/weather/
├── port.ts                       # Public: WeatherProvider, Coords, WeatherSnapshot
├── nws-http-adapter.ts           # Public: createNwsHttpProvider()
├── nws-schemas.ts                # Private: Zod schemas (moved from validators/nws.ts)
├── nws-mappers.ts                # Private: DTO→domain (moved from mappers/nws.ts)
├── in-memory-adapter.ts          # Public: createInMemoryProvider() — test helper
├── index.ts                      # Public: weather singleton + re-exports
└── __fixtures__/
    └── nws.ts                    # Canned NWS JSON for adapter tests
```

Tests:

```
src/lib/server/weather/nws-http-adapter.test.ts   # Boundary tests via fake transport
```

Files deleted at end:

```
src/lib/services/nws.ts
src/lib/validators/nws.ts (+ .test.ts)
src/lib/mappers/nws.ts (+ .test.ts)
src/lib/types/nws.ts
src/lib/generated/nws.ts          # 2234-LOC unused Zodios client
```

## Snapshot semantics (decided in #6)

- `snapshot(coords)` runs `location → stations`, then `observation` / `forecast` / `hazards` in parallel.
- `location` failure → throws `WeatherError`.
- `stations` failure → throws `WeatherError`.
- `observation` / `forecast` / `hazards` failure → captured in `errors` map; field gets a safe default (`null` for observation, `[]` for forecast/hazards).
- Empty `stations` array → no observation request; `observation = null`, `errors.observation` = synthetic API error "No observation stations available for this location".

---

## Pre-flight (before Task 1)

The worktree at `.worktrees/refactor-nws-gateway` should already have dependencies installed and chromium available for vitest. Verify:

```bash
npm run check                                   # type-check baseline
npm run test:unit -- --run 2>&1 | tail -10      # unit baseline
```

Expected: 3 pre-existing failures (2 in `mappers/nws.test.ts`, 1 in `routes/page.svelte.spec.ts`). 44 tests passing. These are tracked outside this plan.

---

## Phase 1 — Set up new module structure (no behavior changes)

### Task 1: Create the port

**Files:**

- Create: `src/lib/server/weather/port.ts`

- [ ] **Step 1: Write the port**

```ts
// src/lib/server/weather/port.ts
import type { LocationInfo, Station, Observation, ForecastDay, Hazard } from '$lib/types/domain';
import type { WeatherError } from '$lib/types/errors';

export interface Coords {
	lat: number;
	lon: number;
}

export interface WeatherSnapshot {
	location: LocationInfo;
	stations: Station[];
	observation: Observation | null;
	forecast: ForecastDay[];
	hazards: Hazard[];
	errors: Partial<Record<'observation' | 'forecast' | 'hazards', WeatherError>>;
}

export interface WeatherProvider {
	snapshot(coords: Coords): Promise<WeatherSnapshot>;
	location(coords: Coords): Promise<LocationInfo>;
	forecast(forecastUrl: string): Promise<ForecastDay[]>;
	hazards(coords: Coords): Promise<Hazard[]>;
}
```

- [ ] **Step 2: Type-check**

Run: `npm run check`
Expected: PASS (no new errors).

- [ ] **Step 3: Commit**

```bash
git add src/lib/server/weather/port.ts
git commit -m "feat(weather): add WeatherProvider port with domain-shaped contract"
```

---

### Task 2: Move Zod schemas to private module

**Files:**

- Create: `src/lib/server/weather/nws-schemas.ts`

- [ ] **Step 1: Copy schemas verbatim from `src/lib/validators/nws.ts` into the new file**

Read `src/lib/validators/nws.ts` (99 LOC). Copy all 5 schemas (`PointsResponseSchema`, `ForecastSchema`, `StationsSchema`, `ObservationSchema`, `AlertsSchema`) plus the file's leading comment and `import { z } from 'zod';` line into the new file unchanged. Do NOT delete the old file yet — both exist in parallel until Phase 6.

- [ ] **Step 2: Type-check**

Run: `npm run check`
Expected: PASS (the new file is unused but valid).

- [ ] **Step 3: Commit**

```bash
git add src/lib/server/weather/nws-schemas.ts
git commit -m "refactor(weather): copy NWS Zod schemas into private adapter module"
```

---

### Task 3: Move DTO→domain mappers to private module

**Files:**

- Create: `src/lib/server/weather/nws-mappers.ts`

- [ ] **Step 1: Copy mappers from `src/lib/mappers/nws.ts` and rewrite imports to derive DTO types from schemas**

Mappers should now use `z.infer` for DTO types (so DTO types stop existing as standalone declarations):

```ts
// src/lib/server/weather/nws-mappers.ts
import type { z } from 'zod';
import type { LocationInfo, Station, Observation, ForecastDay, Hazard } from '$lib/types/domain';
import type {
	PointsResponseSchema,
	ForecastSchema,
	StationsSchema,
	ObservationSchema,
	AlertsSchema
} from './nws-schemas';

type PointsDto = z.infer<typeof PointsResponseSchema>;
type StationsDto = z.infer<typeof StationsSchema>;
type ObservationDto = z.infer<typeof ObservationSchema>;
type ForecastDto = z.infer<typeof ForecastSchema>;
type AlertsDto = z.infer<typeof AlertsSchema>;

export function mapPoints(dto: PointsDto): LocationInfo {
	const p = dto.properties;
	return {
		forecast: p.forecast,
		forecastHourly: p.forecastHourly,
		observationStations: p.observationStations,
		gridId: p.gridId,
		gridX: p.gridX,
		gridY: p.gridY
	};
}

export function mapStations(dto: StationsDto): Station[] {
	return dto.features.map((feature) => ({
		id: feature.properties.stationIdentifier,
		name: feature.properties.name || feature.properties.stationIdentifier
	}));
}

export function mapObservation(dto: ObservationDto): Observation {
	const p = dto.properties;
	return {
		temperatureC: p.temperature?.value ?? undefined,
		textDescription: p.textDescription ?? null,
		relativeHumidity: p.relativeHumidity?.value ?? undefined,
		dewpointC: p.dewpoint?.value ?? undefined,
		visibilityM: p.visibility?.value ?? undefined,
		windChillC: p.windChill?.value ?? undefined,
		windDirectionDeg: p.windDirection?.value ?? undefined,
		windSpeedKmh: p.windSpeed?.value ?? undefined,
		icon: p.icon ?? null,
		timestamp: p.timestamp ?? null
	};
}

export function mapForecast(dto: ForecastDto): ForecastDay[] {
	return dto.properties.periods.map((period) => ({
		dayName: period.name,
		startTime: period.startTime,
		isDaytime: period.isDaytime,
		temperature: period.temperature,
		shortForecast: period.shortForecast,
		detailedForecast: period.detailedForecast,
		icon: period.icon ?? null
	}));
}

export function mapAlerts(dto: AlertsDto): Hazard[] {
	return dto.features.map((feature) => ({
		headline: feature.properties.headline,
		description: feature.properties.description,
		severity: feature.properties.severity,
		urgency: feature.properties.urgency,
		certainty: feature.properties.certainty,
		areas: feature.properties.areaDesc
	}));
}
```

- [ ] **Step 2: Type-check**

Run: `npm run check`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/lib/server/weather/nws-mappers.ts
git commit -m "refactor(weather): move NWS mappers into private adapter module"
```

---

## Phase 2 — Build the HTTP adapter (TDD)

### Task 4: Set up test fixtures and fake-transport helper

**Files:**

- Create: `src/lib/server/weather/__fixtures__/nws.ts`

- [ ] **Step 1: Create representative NWS payload fixtures**

```ts
// src/lib/server/weather/__fixtures__/nws.ts
// Minimal fixtures matching schemas in ../nws-schemas.ts.

export const POINTS_FIXTURE = {
	properties: {
		forecast: 'https://api.weather.gov/gridpoints/OKX/33,35/forecast',
		forecastHourly: 'https://api.weather.gov/gridpoints/OKX/33,35/forecast/hourly',
		observationStations: 'https://api.weather.gov/gridpoints/OKX/33,35/stations',
		gridId: 'OKX',
		gridX: 33,
		gridY: 35
	}
};

export const STATIONS_FIXTURE = {
	features: [
		{ properties: { stationIdentifier: 'KNYC', name: 'New York Central Park' } },
		{ properties: { stationIdentifier: 'KJFK', name: 'JFK Airport' } }
	]
};

export const STATIONS_EMPTY_FIXTURE = { features: [] };

export const OBSERVATION_FIXTURE = {
	properties: {
		temperature: { value: 15.5 },
		textDescription: 'Partly Cloudy',
		relativeHumidity: { value: 65 },
		dewpoint: { value: 8.2 },
		visibility: { value: 16093 },
		windChill: { value: null },
		windDirection: { value: 180 },
		windSpeed: { value: 5.2 },
		icon: 'https://api.weather.gov/icons/land/day/few?size=medium',
		timestamp: '2026-05-06T12:00:00Z'
	}
};

export const FORECAST_FIXTURE = {
	properties: {
		periods: [
			{
				name: 'Today',
				startTime: '2026-05-06T06:00:00-04:00',
				isDaytime: true,
				temperature: 72,
				shortForecast: 'Sunny',
				detailedForecast: 'Sunny, with a high near 72.',
				icon: 'https://api.weather.gov/icons/land/day/few?size=medium'
			},
			{
				name: 'Tonight',
				startTime: '2026-05-06T18:00:00-04:00',
				isDaytime: false,
				temperature: 55,
				shortForecast: 'Clear',
				detailedForecast: 'Clear, with a low around 55.',
				icon: 'https://api.weather.gov/icons/land/night/few?size=medium'
			}
		]
	}
};

export const ALERTS_EMPTY_FIXTURE = { features: [] };

export const ALERTS_FIXTURE = {
	features: [
		{
			properties: {
				headline: 'Severe Thunderstorm Warning',
				description: 'Severe thunderstorms expected.',
				severity: 'Severe',
				urgency: 'Immediate',
				certainty: 'Observed',
				areaDesc: 'New York County, NY'
			}
		}
	]
};

/**
 * Build a fake transport that maps URL substrings to canned JSON responses.
 * Matches the signature of fetchWithRetry from $lib/utils/http.
 */
export type Fetcher = (url: string, options?: RequestInit, retry?: unknown) => Promise<Response>;

export function fakeTransport(routes: Record<string, unknown>, status = 200): Fetcher {
	return async (url) => {
		for (const [pattern, body] of Object.entries(routes)) {
			if (url.includes(pattern)) {
				return new Response(JSON.stringify(body), {
					status,
					headers: { 'Content-Type': 'application/geo+json' }
				});
			}
		}
		return new Response(`Unmocked URL: ${url}`, { status: 404 });
	};
}
```

- [ ] **Step 2: Type-check**

Run: `npm run check`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/lib/server/weather/__fixtures__
git commit -m "test(weather): add NWS fixtures and fake-transport helper"
```

---

### Task 5: Implement adapter `location()` (TDD)

**Files:**

- Create: `src/lib/server/weather/nws-http-adapter.test.ts`
- Create: `src/lib/server/weather/nws-http-adapter.ts`

- [ ] **Step 1: Write failing test for `location()`**

```ts
// src/lib/server/weather/nws-http-adapter.test.ts
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
```

- [ ] **Step 2: Run the test and watch it fail**

Run: `npm run test:unit -- --run src/lib/server/weather/nws-http-adapter.test.ts`
Expected: FAIL with "Cannot find module './nws-http-adapter'".

- [ ] **Step 3: Implement minimal adapter with `location()`**

```ts
// src/lib/server/weather/nws-http-adapter.ts
import type { z } from 'zod';
import { fetchWithRetry, DEFAULT_RETRY, type RetryConfig } from '$lib/utils/http';
import { NWS_BASE_URL } from '$lib/config';
import { createApiError } from '$lib/types/errors';
import type { WeatherProvider, Coords } from './port';
import {
	PointsResponseSchema,
	ForecastSchema,
	StationsSchema,
	ObservationSchema,
	AlertsSchema
} from './nws-schemas';
import { mapPoints, mapStations, mapObservation, mapForecast, mapAlerts } from './nws-mappers';

type Fetcher = (url: string, options?: RequestInit, retry?: RetryConfig) => Promise<Response>;

interface AdapterOpts {
	transport?: Fetcher;
	baseUrl?: string;
}

const HEADERS = { Accept: 'application/geo+json' };

async function getJson<T>(
	transport: Fetcher,
	url: string,
	schema: z.ZodSchema<T>,
	context: string
): Promise<T> {
	const response = await transport(url, { headers: HEADERS }, DEFAULT_RETRY);
	if (!response.ok) {
		throw createApiError(
			`${context} request failed: ${response.status} ${response.statusText}`,
			response.status
		);
	}
	const json = await response.json();
	const result = schema.safeParse(json);
	if (!result.success) {
		throw createApiError(`Invalid ${context} response from NWS API`, undefined, result.error);
	}
	return result.data;
}

export function createNwsHttpProvider(opts: AdapterOpts = {}): WeatherProvider {
	const transport = opts.transport ?? fetchWithRetry;
	const base = opts.baseUrl ?? NWS_BASE_URL;

	async function location(coords: Coords) {
		const url = `${base}/points/${coords.lat.toFixed(4)},${coords.lon.toFixed(4)}`;
		const dto = await getJson(transport, url, PointsResponseSchema, 'Points');
		return mapPoints(dto);
	}

	// Stubs for the rest of the port — implemented in later tasks.
	const notYet = (name: string) => async () => {
		throw new Error(`${name} not implemented`);
	};

	return {
		location,
		snapshot: notYet('snapshot') as WeatherProvider['snapshot'],
		forecast: notYet('forecast') as WeatherProvider['forecast'],
		hazards: notYet('hazards') as WeatherProvider['hazards']
	};
}
```

- [ ] **Step 4: Run the test and watch it pass**

Run: `npm run test:unit -- --run src/lib/server/weather/nws-http-adapter.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/server/weather/nws-http-adapter.ts src/lib/server/weather/nws-http-adapter.test.ts
git commit -m "feat(weather): implement NwsHttpProvider.location with boundary tests"
```

---

### Task 6: Implement `hazards()` (TDD)

**Files:**

- Modify: `src/lib/server/weather/nws-http-adapter.ts`
- Modify: `src/lib/server/weather/nws-http-adapter.test.ts`

- [ ] **Step 1: Add failing tests for `hazards()`**

Append to the test file:

```ts
import { ALERTS_FIXTURE, ALERTS_EMPTY_FIXTURE } from './__fixtures__/nws';

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
```

- [ ] **Step 2: Run tests and watch the new ones fail**

Run: `npm run test:unit -- --run src/lib/server/weather/nws-http-adapter.test.ts`
Expected: 3 hazards tests FAIL with "hazards not implemented". Existing 3 location tests still PASS.

- [ ] **Step 3: Implement `hazards()`**

In `nws-http-adapter.ts`, replace the `hazards: notYet('hazards')` line and add the inner function (place next to `location`):

```ts
async function hazards(coords: Coords) {
	const url = `${base}/alerts/active?point=${coords.lat.toFixed(4)},${coords.lon.toFixed(4)}`;
	const dto = await getJson(transport, url, AlertsSchema, 'Alerts');
	return mapAlerts(dto);
}
```

Update the returned object to wire it in:

```ts
return {
	location,
	hazards,
	snapshot: notYet('snapshot') as WeatherProvider['snapshot'],
	forecast: notYet('forecast') as WeatherProvider['forecast']
};
```

- [ ] **Step 4: Run tests**

Run: `npm run test:unit -- --run src/lib/server/weather/nws-http-adapter.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/server/weather/nws-http-adapter.ts src/lib/server/weather/nws-http-adapter.test.ts
git commit -m "feat(weather): implement NwsHttpProvider.hazards with boundary tests"
```

---

### Task 7: Implement `forecast()` (TDD)

**Files:**

- Modify: `src/lib/server/weather/nws-http-adapter.ts`
- Modify: `src/lib/server/weather/nws-http-adapter.test.ts`

- [ ] **Step 1: Add failing tests for `forecast()`**

Append to the test file:

```ts
import { FORECAST_FIXTURE } from './__fixtures__/nws';

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
```

Add the import for `Fetcher` at the top of the test file:

```ts
import { fakeTransport, type Fetcher, POINTS_FIXTURE } from './__fixtures__/nws';
```

(Replace the existing `fakeTransport, POINTS_FIXTURE` import; merge with prior imports.)

- [ ] **Step 2: Run tests and watch the new ones fail**

Run: `npm run test:unit -- --run src/lib/server/weather/nws-http-adapter.test.ts`
Expected: 3 forecast tests FAIL with "forecast not implemented". 6 prior tests still PASS.

- [ ] **Step 3: Implement `forecast()`**

In `nws-http-adapter.ts`, replace the `forecast: notYet('forecast')` line and add the inner function:

```ts
async function forecast(forecastUrl: string) {
	const dto = await getJson(transport, forecastUrl, ForecastSchema, 'Forecast');
	return mapForecast(dto);
}
```

Update the return:

```ts
return {
	location,
	hazards,
	forecast,
	snapshot: notYet('snapshot') as WeatherProvider['snapshot']
};
```

- [ ] **Step 4: Run tests**

Run: `npm run test:unit -- --run src/lib/server/weather/nws-http-adapter.test.ts`
Expected: PASS (9 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/server/weather/nws-http-adapter.ts src/lib/server/weather/nws-http-adapter.test.ts
git commit -m "feat(weather): implement NwsHttpProvider.forecast with boundary tests"
```

---

### Task 8: Implement `snapshot()` happy path (TDD)

**Files:**

- Modify: `src/lib/server/weather/nws-http-adapter.ts`
- Modify: `src/lib/server/weather/nws-http-adapter.test.ts`

- [ ] **Step 1: Add failing test for the all-success snapshot**

Append to the test file:

```ts
import { STATIONS_FIXTURE, OBSERVATION_FIXTURE, STATIONS_EMPTY_FIXTURE } from './__fixtures__/nws';

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
});
```

**URL routing note:** the fakeTransport helper checks substrings in insertion order; first match wins. Order matters because some URLs match multiple patterns. The observation URL `/stations/KNYC/observations/latest` contains both `/stations` and `/observations/latest`. The forecast URL `/gridpoints/OKX/33,35/forecast` contains `/gridpoints/` only. The stations endpoint URL `/gridpoints/OKX/33,35/stations` contains both `/gridpoints/` and `/stations`. The correct order — most specific first — is: `/observations/latest`, `/alerts/active`, `/stations`, `/gridpoints/`, `/points/`. Use this order in every `fakeTransport({ ... })` call and every chained `url.includes(...)` check throughout the test file.

- [ ] **Step 2: Run test and watch it fail**

Run: `npm run test:unit -- --run src/lib/server/weather/nws-http-adapter.test.ts`
Expected: snapshot test FAILs with "snapshot not implemented". 9 prior tests still PASS.

- [ ] **Step 3: Implement `snapshot()` and the private `stations`/`observation` helpers**

In `nws-http-adapter.ts`, add private helpers and replace `snapshot: notYet(...)`:

```ts
async function getStations(gridId: string, x: number, y: number) {
	const url = `${base}/gridpoints/${gridId}/${x},${y}/stations`;
	const dto = await getJson(transport, url, StationsSchema, 'Stations');
	return mapStations(dto);
}

async function getObservation(stationId: string) {
	const url = `${base}/stations/${stationId}/observations/latest`;
	const dto = await getJson(transport, url, ObservationSchema, 'Observation');
	return mapObservation(dto);
}

async function snapshot(coords: Coords) {
	const loc = await location(coords);
	const stations = await getStations(loc.gridId, loc.gridX, loc.gridY);

	const errors: WeatherSnapshot['errors'] = {};

	const observationPromise =
		stations.length === 0
			? Promise.reject(createApiError('No observation stations available for this location'))
			: getObservation(stations[0].id);

	const [obsResult, forecastResult, hazardsResult] = await Promise.allSettled([
		observationPromise,
		forecast(loc.forecast),
		hazards(coords)
	]);

	let observation: WeatherSnapshot['observation'] = null;
	if (obsResult.status === 'fulfilled') {
		observation = obsResult.value;
	} else {
		errors.observation = obsResult.reason;
	}

	let forecastDays: WeatherSnapshot['forecast'] = [];
	if (forecastResult.status === 'fulfilled') {
		forecastDays = forecastResult.value;
	} else {
		errors.forecast = forecastResult.reason;
	}

	let hazardsList: WeatherSnapshot['hazards'] = [];
	if (hazardsResult.status === 'fulfilled') {
		hazardsList = hazardsResult.value;
	} else {
		errors.hazards = hazardsResult.reason;
	}

	return {
		location: loc,
		stations,
		observation,
		forecast: forecastDays,
		hazards: hazardsList,
		errors
	};
}
```

Add the missing import at the top of the file:

```ts
import type { WeatherProvider, Coords, WeatherSnapshot } from './port';
```

(Merge with the existing port import.)

Update the return value:

```ts
return { location, hazards, forecast, snapshot };
```

Remove the now-unused `notYet` helper.

- [ ] **Step 4: Run tests**

Run: `npm run test:unit -- --run src/lib/server/weather/nws-http-adapter.test.ts`
Expected: PASS (10 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/server/weather/nws-http-adapter.ts src/lib/server/weather/nws-http-adapter.test.ts
git commit -m "feat(weather): implement NwsHttpProvider.snapshot happy path"
```

---

### Task 9: Snapshot partial-failure handling (TDD)

**Files:**

- Modify: `src/lib/server/weather/nws-http-adapter.test.ts`
- (No source change expected — `snapshot()` already implements this; the tests verify it.)

- [ ] **Step 1: Add tests for each partial-failure mode**

Append to `describe('NwsHttpProvider.snapshot', ...)`:

```ts
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

it('throws when stations call fails', async () => {
	const transport: Fetcher = async (url) => {
		if (url.includes('/stations')) return new Response('boom', { status: 500 });
		if (url.includes('/points/')) return new Response(JSON.stringify(POINTS_FIXTURE));
		return new Response('unmocked', { status: 404 });
	};
	const provider = createNwsHttpProvider({ transport });

	await expect(provider.snapshot({ lat: 40, lon: -74 })).rejects.toMatchObject({
		type: 'API_ERROR',
		statusCode: 500
	});
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
```

- [ ] **Step 2: Run tests**

Run: `npm run test:unit -- --run src/lib/server/weather/nws-http-adapter.test.ts`
Expected: PASS (16 tests).

- [ ] **Step 3: Commit**

```bash
git add src/lib/server/weather/nws-http-adapter.test.ts
git commit -m "test(weather): cover snapshot partial-failure modes and unrecoverable errors"
```

---

## Phase 3 — In-memory adapter

### Task 10: Implement `createInMemoryProvider`

**Files:**

- Create: `src/lib/server/weather/in-memory-adapter.ts`

- [ ] **Step 1: Implement the adapter**

```ts
// src/lib/server/weather/in-memory-adapter.ts
import type { WeatherProvider, WeatherSnapshot } from './port';
import type { LocationInfo, ForecastDay, Hazard } from '$lib/types/domain';

const DEFAULT_LOCATION: LocationInfo = {
	forecast: 'https://api.weather.gov/gridpoints/TEST/0,0/forecast',
	forecastHourly: 'https://api.weather.gov/gridpoints/TEST/0,0/forecast/hourly',
	observationStations: 'https://api.weather.gov/gridpoints/TEST/0,0/stations',
	gridId: 'TEST',
	gridX: 0,
	gridY: 0
};

const DEFAULT_SNAPSHOT: WeatherSnapshot = {
	location: DEFAULT_LOCATION,
	stations: [],
	observation: null,
	forecast: [],
	hazards: [],
	errors: {}
};

/**
 * Test-only adapter that returns canned data. Production code should not import this.
 *
 * Usage:
 *   const weather = createInMemoryProvider({
 *     observation: { temperatureC: 20, ... }
 *   });
 */
export function createInMemoryProvider(canned: Partial<WeatherSnapshot> = {}): WeatherProvider {
	const merged: WeatherSnapshot = { ...DEFAULT_SNAPSHOT, ...canned };

	return {
		async snapshot() {
			return merged;
		},
		async location() {
			return merged.location;
		},
		async forecast(): Promise<ForecastDay[]> {
			return merged.forecast;
		},
		async hazards(): Promise<Hazard[]> {
			return merged.hazards;
		}
	};
}
```

- [ ] **Step 2: Type-check**

Run: `npm run check`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/lib/server/weather/in-memory-adapter.ts
git commit -m "feat(weather): add in-memory adapter for test isolation"
```

---

## Phase 4 — Public surface

### Task 11: Create `index.ts` with singleton + re-exports

**Files:**

- Create: `src/lib/server/weather/index.ts`

- [ ] **Step 1: Create the public entry point**

```ts
// src/lib/server/weather/index.ts
import { createNwsHttpProvider } from './nws-http-adapter';

export type { WeatherProvider, WeatherSnapshot, Coords } from './port';
export { createNwsHttpProvider } from './nws-http-adapter';
export { createInMemoryProvider } from './in-memory-adapter';

/** Default singleton: a production NWS HTTP provider with default transport. */
export const weather = createNwsHttpProvider();
```

- [ ] **Step 2: Type-check**

Run: `npm run check`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/lib/server/weather/index.ts
git commit -m "feat(weather): export public surface and default singleton"
```

---

## Phase 5 — Migrate route loaders

Treat `+layout.server.ts` and `+page.server.ts` as **thin controllers**: parse params, call the deep module, return the result.

### Task 12: Migrate `weather/[coords]/+layout.server.ts` to use `weather.snapshot()`

**Files:**

- Modify: `src/routes/weather/[coords]/+layout.server.ts`

- [ ] **Step 1: Read the current loader**

Read `src/routes/weather/[coords]/+layout.server.ts`. Note the existing coord-parsing logic and validation (lines 25–37 from prior exploration). Preserve param parsing exactly.

- [ ] **Step 2: Replace the body to call `weather.snapshot()`**

Rewrite the file (preserve any imports unrelated to the deleted services):

```ts
// src/routes/weather/[coords]/+layout.server.ts
import { error } from '@sveltejs/kit';
import { weather } from '$lib/server/weather';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ params }) => {
	const parts = params.coords?.split(',') ?? [];
	if (parts.length !== 2) {
		throw error(400, 'Invalid coordinates');
	}
	const lat = Number(parts[0]);
	const lon = Number(parts[1]);
	if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
		throw error(400, 'Invalid coordinates');
	}

	return weather.snapshot({ lat, lon });
};
```

If the existing file used additional imports (city/state lookup, etc.), retain those. Confirm the original loader returned ONLY weather-shaped data; if it returned additional shapes, merge them after the snapshot:

```ts
const snap = await weather.snapshot({ lat, lon });
return { ...snap /* other props */ };
```

- [ ] **Step 3: Type-check**

Run: `npm run check`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/routes/weather/[coords]/+layout.server.ts
git commit -m "refactor(weather): use snapshot() in [coords] layout loader"
```

---

### Task 13: Migrate `current-conditions/+page.server.ts` to consume parent

**Files:**

- Modify: `src/routes/weather/[coords]/current-conditions/+page.server.ts`

- [ ] **Step 1: Read current loader and identify what fields it returns**

Read the file and note which snapshot fields downstream UI uses (likely `location`, `stations`, `observation`).

- [ ] **Step 2: Rewrite to consume `parent()` instead of refetching**

```ts
// src/routes/weather/[coords]/current-conditions/+page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { location, stations, observation, hazards, errors } = await parent();
	return {
		location,
		stations,
		observation,
		hazards,
		observationError: errors.observation,
		hazardsError: errors.hazards
	};
};
```

If the current `+page.svelte` uses different prop names (e.g., a single error union), adjust the return shape to match. The goal: zero new fetches; everything comes from the layout's snapshot.

- [ ] **Step 3: Verify the page renders the same data**

Run: `npm run dev`
Visit `/weather/40.7,-74.0/current-conditions` in a browser.
Expected: page renders without runtime errors. Stop the dev server when verified.

- [ ] **Step 4: Type-check**

Run: `npm run check`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/routes/weather/[coords]/current-conditions/+page.server.ts
git commit -m "refactor(weather): consume parent snapshot in current-conditions loader"
```

---

### Task 14: Migrate `extended-forecast/+page.server.ts`

**Files:**

- Modify: `src/routes/weather/[coords]/extended-forecast/+page.server.ts`

- [ ] **Step 1: Read the current loader**

Note: this file inlines `parseExtendedForecast()` and `shortenForecastText()` helpers. Those are display transforms tracked in a separate refactor (Candidate 2 from issue #6's "Out of scope") — leave them in place for now, but switch the data fetch to use the deep module.

- [ ] **Step 2: Rewrite to use parent snapshot for forecast**

The forecast is now part of the snapshot, so use `parent()`. If the current `+page.server.ts` was fetching `getForecastByUrl(location.forecast)` separately, replace with parent destructuring:

```ts
// src/routes/weather/[coords]/extended-forecast/+page.server.ts
import type { PageServerLoad } from './$types';
// keep the existing parseExtendedForecast / shortenForecastText helpers as-is

export const load: PageServerLoad = async ({ parent }) => {
	const { location, forecast, errors } = await parent();
	return {
		location,
		forecast: parseExtendedForecast(forecast),
		forecastError: errors.forecast
	};
};

// (parseExtendedForecast and shortenForecastText definitions remain unchanged below)
```

If the existing helpers operate on the raw NWS DTO shape rather than `ForecastDay[]`, update the helpers' input type to `ForecastDay[]` and adjust property accesses (e.g., `period.shortForecast` already maps cleanly from `mapForecast`).

- [ ] **Step 3: Type-check**

Run: `npm run check`
Expected: PASS.

- [ ] **Step 4: Verify in browser**

Run: `npm run dev`
Visit `/weather/40.7,-74.0/extended-forecast`.
Expected: forecast renders. Stop the dev server when verified.

- [ ] **Step 5: Commit**

```bash
git add src/routes/weather/[coords]/extended-forecast/+page.server.ts
git commit -m "refactor(weather): consume parent snapshot in extended-forecast loader"
```

---

### Task 15: Migrate `local-forecast/+page.server.ts`

**Files:**

- Modify: `src/routes/weather/[coords]/local-forecast/+page.server.ts`

- [ ] **Step 1: Read and identify dependencies**

Read the file. Identify which fields the page's UI consumes.

- [ ] **Step 2: Rewrite to use parent snapshot**

```ts
// src/routes/weather/[coords]/local-forecast/+page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { location, forecast, errors } = await parent();
	return {
		location,
		forecast,
		forecastError: errors.forecast
	};
};
```

Adjust returned shape to match what the existing `+page.svelte` expects.

- [ ] **Step 3: Type-check**

Run: `npm run check`
Expected: PASS.

- [ ] **Step 4: Verify in browser**

Run: `npm run dev`
Visit `/weather/40.7,-74.0/local-forecast`.
Expected: forecast renders. Stop the dev server when verified.

- [ ] **Step 5: Commit**

```bash
git add src/routes/weather/[coords]/local-forecast/+page.server.ts
git commit -m "refactor(weather): consume parent snapshot in local-forecast loader"
```

---

## Phase 6 — Delete old code

### Task 16: Delete the four shallow NWS files and their tests

**Files:**

- Delete: `src/lib/services/nws.ts`
- Delete: `src/lib/validators/nws.ts`
- Delete: `src/lib/validators/nws.test.ts`
- Delete: `src/lib/mappers/nws.ts`
- Delete: `src/lib/mappers/nws.test.ts`
- Delete: `src/lib/types/nws.ts`

- [ ] **Step 1: Confirm nothing outside the new module imports these files**

Run:

```bash
grep -rn "lib/services/nws\|lib/validators/nws\|lib/mappers/nws\|lib/types/nws" src/ 2>&1 | grep -v "src/lib/server/weather"
```

Expected: empty output (no callers left). If any remain, fix those callers BEFORE deleting.

- [ ] **Step 2: Delete the files**

```bash
git rm src/lib/services/nws.ts \
       src/lib/validators/nws.ts src/lib/validators/nws.test.ts \
       src/lib/mappers/nws.ts src/lib/mappers/nws.test.ts \
       src/lib/types/nws.ts
```

If `src/lib/validators/` or `src/lib/mappers/` or `src/lib/types/` is now empty, leave the directory — git tracks files, not directories, and other types may live alongside `types/nws.ts` (e.g., `types/domain.ts`, `types/errors.ts`). Run `ls src/lib/validators src/lib/mappers` to confirm; only delete a directory if it is now empty.

- [ ] **Step 3: Type-check + test**

Run: `npm run check`
Expected: PASS.

Run: `npm run test:unit -- --run`
Expected: PASS (the 2 pre-existing mapper-test failures are gone because the file is deleted; only the 1 unrelated `page.svelte.spec.ts` failure remains, plus the new adapter boundary tests).

- [ ] **Step 4: Commit**

```bash
git commit -m "refactor(weather): remove shallow NWS service/validators/mappers/types"
```

---

### Task 17: Delete unused generated NWS Zodios client

**Files:**

- Delete: `src/lib/generated/nws.ts`

- [ ] **Step 1: Confirm zero imports**

Run:

```bash
grep -rn "lib/generated/nws" src/ 2>&1
```

Expected: empty output. If anything imports it, abort and report.

- [ ] **Step 2: Check for an `npm run generate:nws` script**

Run:

```bash
grep -A1 "\"generate:nws\"" package.json 2>/dev/null || echo "no generate:nws script"
```

If the script exists, leave it in `package.json` for now — the generator can be re-run if anyone ever wants the Zodios client back. Just delete the generated file.

- [ ] **Step 3: Delete the file**

```bash
git rm src/lib/generated/nws.ts
```

If `src/lib/generated/` is now empty, delete the directory:

```bash
rmdir src/lib/generated 2>/dev/null || true
```

- [ ] **Step 4: Type-check + test**

Run: `npm run check && npm run test:unit -- --run`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git commit -m "chore(weather): remove unused generated Zodios NWS client (2234 LOC)"
```

---

### Task 18: Final verification

**Files:** none

- [ ] **Step 1: Format**

Run: `npm run format`
Expected: completes with no errors.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: PASS or only warnings in unrelated files.

- [ ] **Step 3: Type-check**

Run: `npm run check`
Expected: PASS.

- [ ] **Step 4: Full unit test suite**

Run: `npm run test:unit -- --run`
Expected: all tests in `src/lib/server/weather/nws-http-adapter.test.ts` PASS (16 tests). Existing utility tests still PASS. Only the 1 pre-existing failure remains (`page.svelte.spec.ts` — out of scope).

- [ ] **Step 5: Smoke-test in dev**

Run: `npm run dev` and visit:

- `/weather/40.7,-74.0`
- `/weather/40.7,-74.0/current-conditions`
- `/weather/40.7,-74.0/extended-forecast`
- `/weather/40.7,-74.0/local-forecast`

Expected: each route renders without runtime errors. Stop the dev server when verified.

- [ ] **Step 6: Commit any format-only changes**

If `npm run format` produced changes:

```bash
git add -A
git commit -m "style: format after NWS refactor"
```

Otherwise skip.

- [ ] **Step 7: Done — summary**

The deepening is complete:

- 530+ LOC across 4 shallow files collapsed into one deep module under `src/lib/server/weather/`.
- The choreography (fetch → validate → map → assemble) is now testable at the boundary via `nws-http-adapter.test.ts` (16 tests covering happy path + every partial-failure mode).
- Route loaders are 5–10 line thin controllers.
- 2234-LOC unused generated client deleted.
- In-memory adapter ready for future route-loader tests (separate, future work).

Closes #6.

---

## Self-review

**Spec coverage** (issue #6 requirements):

| Requirement                                                                                       | Task                |
| ------------------------------------------------------------------------------------------------- | ------------------- |
| `WeatherProvider` port in domain terms                                                            | Task 1              |
| HTTP adapter contains fetch ritual privately                                                      | Tasks 5–9           |
| In-memory adapter for tests                                                                       | Task 10             |
| Default singleton                                                                                 | Task 11             |
| `snapshot()` is the primary entry                                                                 | Task 8              |
| Snapshot escape hatches: `location`, `forecast`, `hazards`                                        | Tasks 5, 6, 7       |
| Partial-failure semantics with `errors` map                                                       | Task 9              |
| Empty-stations handling                                                                           | Task 9              |
| Migrate `+layout.server.ts`                                                                       | Task 12             |
| Migrate `current-conditions/+page.server.ts`                                                      | Task 13             |
| Migrate `extended-forecast/+page.server.ts`                                                       | Task 14             |
| Migrate `local-forecast/+page.server.ts`                                                          | Task 15             |
| Delete `services/nws.ts`, `validators/nws.ts`, `mappers/nws.ts`, `types/nws.ts` (and their tests) | Task 16             |
| Delete unused `generated/nws.ts`                                                                  | Task 17             |
| Boundary tests cover validation failure, non-2xx, schema mismatch                                 | Tasks 5, 6, 7, 8, 9 |
| Forecast URL round-trip integrity                                                                 | Task 7              |

All requirements mapped to tasks.

**Out of scope** (per issue):

- Display transforms (`utils/weather.ts` + inline route helpers) — Candidate 2.
- Server-side request caching beyond what `parent()` provides.
- Geolocation consolidation — Candidate 3.
- Fixing the unrelated pre-existing `page.svelte.spec.ts` failure.

**Type consistency check:** `WeatherProvider` interface methods (`snapshot`, `location`, `forecast`, `hazards`) match across port.ts (Task 1), nws-http-adapter.ts (Tasks 5–9), in-memory-adapter.ts (Task 10), and index.ts (Task 11). `WeatherSnapshot` shape (`location`, `stations`, `observation`, `forecast`, `hazards`, `errors`) consistent across port.ts, snapshot implementation (Task 8), partial-failure tests (Task 9), and in-memory defaults (Task 10). `Coords` (`lat`, `lon`) consistent throughout.
