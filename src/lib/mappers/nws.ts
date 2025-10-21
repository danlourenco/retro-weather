// Mappers to convert NWS DTOs to domain models
import type { LocationInfo, Station, Observation, ForecastDay, Hazard } from '$lib/types/domain';
import type {
	NWSPointsResponse,
	NWSForecastResponse,
	NWSStationsResponse,
	NWSObservationResponse,
	NWSAlertsResponse
} from '$lib/types/nws';

export function mapPoints(dto: NWSPointsResponse): LocationInfo {
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

export function mapStations(dto: NWSStationsResponse): Station[] {
	return dto.features.map((feature) => ({
		id: feature.properties.stationIdentifier,
		name: feature.properties.name || feature.properties.stationIdentifier
	}));
}

export function mapObservation(dto: NWSObservationResponse): Observation {
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

export function mapForecast(dto: NWSForecastResponse): ForecastDay[] {
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

export function mapAlerts(dto: NWSAlertsResponse): Hazard[] {
	return dto.features.map((feature) => ({
		headline: feature.properties.headline,
		description: feature.properties.description,
		severity: feature.properties.severity,
		urgency: feature.properties.urgency,
		certainty: feature.properties.certainty,
		areas: feature.properties.areaDesc
	}));
}
