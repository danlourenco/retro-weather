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
		async forecast() {
			return merged.forecast;
		},
		async hazards() {
			return merged.hazards;
		}
	};
}
