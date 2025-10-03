// NWS API DTOs (on-the-wire shapes)

export interface NWSPointsResponse {
	properties: {
		forecast: string;
		forecastHourly: string;
		observationStations: string;
		gridId: string;
		gridX: number;
		gridY: number;
	};
}

export interface NWSForecastPeriodDTO {
	name: string;
	startTime: string;
	isDaytime: boolean;
	temperature: number;
	shortForecast: string;
	detailedForecast?: string;
	icon?: string | null;
}

export interface NWSForecastResponse {
	properties: {
		periods: NWSForecastPeriodDTO[];
	};
}

export interface NWSStationDTO {
	properties: {
		stationIdentifier: string;
		name?: string;
	};
}

export interface NWSStationsResponse {
	features: NWSStationDTO[];
}

export interface NWSObservationResponse {
	properties: {
		temperature?: {
			value?: number | null;
		};
		textDescription?: string | null;
		relativeHumidity?: {
			value?: number | null;
		};
		dewpoint?: {
			value?: number | null;
		};
		visibility?: {
			value?: number | null;
		};
		windChill?: {
			value?: number | null;
		};
		windDirection?: {
			value?: number | null;
		};
		windSpeed?: {
			value?: number | null;
		};
		icon?: string | null;
	};
}

export interface NWSAlertDTO {
	properties: {
		headline: string;
		description?: string;
		severity?: string;
		urgency?: string;
		certainty?: string;
		areaDesc?: string;
	};
}

export interface NWSAlertsResponse {
	features: NWSAlertDTO[];
}
