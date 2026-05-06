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
