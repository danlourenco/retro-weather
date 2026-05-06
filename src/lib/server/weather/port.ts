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
