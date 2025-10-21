// Internal domain models used by the app

export interface LocationInfo {
	// Keep existing property names to avoid breaking current route usage
	forecast: string; // URL
	forecastHourly: string; // URL
	observationStations: string; // URL
	gridId: string;
	gridX: number;
	gridY: number;
}

export interface Station {
	id: string;
	name: string;
}

export interface Observation {
	temperatureC?: number;
	textDescription?: string | null;
	relativeHumidity?: number;
	dewpointC?: number;
	visibilityM?: number;
	windChillC?: number;
	windDirectionDeg?: number;
	windSpeedKmh?: number;
	icon?: string | null;
	timestamp?: string | null;
}

export interface ForecastDay {
	dayName: string;
	startTime: string;
	isDaytime: boolean;
	temperature: number;
	shortForecast: string;
	detailedForecast?: string;
	icon?: string | null;
}

export interface Hazard {
	headline: string;
	description?: string;
	severity?: string;
	urgency?: string;
	certainty?: string;
	areas?: string;
}

export interface WeatherDataItem {
	label: string;
	value: string | number;
	unit?: string;
}
