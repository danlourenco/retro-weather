/**
 * Weather data transformation utilities for current conditions display
 */

import type { Observation, Station, WeatherDataItem } from '$lib/types/domain';
import { celsiusToFahrenheit, metersToMiles, getWeatherIcon, formatWind } from '$lib';

/**
 * Extract city name from station name
 * Station names are typically formatted as "City, Full Station Name"
 * This function returns just the city portion
 * @param stationName - Full station name (e.g., "Norwood, Norwood Memorial Airport")
 * @returns City name (e.g., "Norwood") or "Unknown Station" if not available
 */
export function extractCityFromStation(stationName: string | null | undefined): string {
	return stationName?.split(',')[0]?.trim() || 'Unknown Station';
}

export interface CurrentConditionsData {
	temperature: number | null;
	textDescription: string;
	humidity: number | string;
	dewpoint: number | string;
	visibility: number | string;
	windChill: number | string;
	stationName: string;
	weatherImage: string | null;
	windDisplay: string;
	hasValidData: boolean;
	weatherDataItems: WeatherDataItem[];
}

/**
 * Transform observation and station data into display-ready format
 */
export function transformCurrentConditions(
	observation: Observation | null | undefined,
	station: Station | null | undefined
): CurrentConditionsData {
	// Log raw data before transformations
	console.log('🌡️ Raw observation data:', observation);
	console.log('📍 Raw station data:', station);

	// Log data freshness
	if (observation?.timestamp) {
		const observationTime = new Date(observation.timestamp);
		const now = new Date();
		const ageMinutes = Math.floor((now.getTime() - observationTime.getTime()) / 60000);
		console.log(`📅 Observation timestamp: ${observation.timestamp}`);
		console.log(`⏰ Data age: ${ageMinutes} minutes old`);
	}

	const hasValidData = observation !== null && observation !== undefined;

	// Transform individual values
	console.log('Temperature (raw Celsius):', observation?.temperatureC);
	const temperature =
		observation?.temperatureC !== undefined
			? Math.round(celsiusToFahrenheit(observation.temperatureC))
			: null;
	console.log('Temperature (converted Fahrenheit):', temperature);

	const textDescription = observation?.textDescription || 'N/A';

	const humidity =
		observation?.relativeHumidity !== undefined
			? Math.round(observation.relativeHumidity)
			: 'N/A';

	const dewpoint =
		observation?.dewpointC !== undefined
			? Math.round(celsiusToFahrenheit(observation.dewpointC))
			: 'N/A';

	const visibility =
		observation?.visibilityM !== undefined ? metersToMiles(observation.visibilityM) : 'N/A';

	const windChill =
		observation?.windChillC !== undefined
			? Math.round(celsiusToFahrenheit(observation.windChillC))
			: 'N/A';

	// Extract city name from station name
	const stationName = extractCityFromStation(station?.name);

	// Get weather icon
	console.log('Icon URL from observation:', observation?.icon);
	const weatherImage = hasValidData ? getWeatherIcon(observation?.icon) : null;
	console.log('Selected weather icon:', weatherImage);

	// Format wind display
	const windDisplay = hasValidData
		? formatWind(observation?.windSpeedKmh, observation?.windDirectionDeg)
		: '';

	// Prepare data grid items
	const weatherDataItems: WeatherDataItem[] = [
		{ label: 'Humidity', value: humidity, unit: '%' },
		{ label: 'Dewpoint', value: dewpoint, unit: '°' },
		{ label: 'Visibility', value: visibility, unit: ' mi.' },
		{ label: 'Wind Chill', value: windChill, unit: '°' }
	];

	return {
		temperature,
		textDescription,
		humidity,
		dewpoint,
		visibility,
		windChill,
		stationName,
		weatherImage,
		windDisplay,
		hasValidData,
		weatherDataItems
	};
}
