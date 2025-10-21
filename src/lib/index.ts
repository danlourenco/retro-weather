// Utility functions for the weather app

import {
	getIconPath,
	WeatherIcons,
	NWS_CONDITION_MAPPINGS
} from '$lib/constants/weather-icons';

/* Unit Conversions */
export const celsiusToFahrenheit = (celsius: number) => (celsius * 9) / 5 + 32;

export const kilometersToMiles = (km: number) => Math.round(km / 1.609_34);

export const metersToMiles = (m: number) => Math.round(m * 0.00062137);

/* Wind Direction Conversion */
export const directionToNSEW = (direction: number | null | undefined): string => {
	if (direction === null || direction === undefined || isNaN(direction)) {
		return '';
	}
	const val = Math.floor(direction / 22.5 + 0.5);
	const arr = [
		'N',
		'NNE',
		'NE',
		'ENE',
		'E',
		'ESE',
		'SE',
		'SSE',
		'S',
		'SSW',
		'SW',
		'WSW',
		'W',
		'WNW',
		'NW',
		'NNW'
	];
	return arr[val % 16];
};

/* Weather Icon Utilities */
/**
 * Get weather icon path from NWS icon URL
 * @param iconUrl - NWS icon URL (e.g., "https://api.weather.gov/icons/land/day/skc")
 * @returns Full path to local weather icon, or null if iconUrl is invalid
 *
 * Reference: https://www.weather.gov/forecast-icons
 * Maps NWS condition codes to retro Weather Channel icon filenames
 */
export const getWeatherIcon = (iconUrl: string | null | undefined): string | null => {
	if (!iconUrl) return null;

	// Parse NWS icon URL to detect day/night
	// NWS URLs are like: https://api.weather.gov/icons/land/day/skc or /night/skc
	const isNight = iconUrl.includes('/night/');

	// Extract the condition from the URL
	const condition = iconUrl.split('/').pop()?.split('?')[0] || '';

	// Find matching condition in mappings
	for (const mapping of NWS_CONDITION_MAPPINGS) {
		const pattern =
			typeof mapping.pattern === 'string'
				? new RegExp(`^${mapping.pattern}`)
				: mapping.pattern;

		if (pattern.test(condition)) {
			const iconName = isNight ? mapping.nightIcon : mapping.dayIcon;
			return getIconPath(iconName);
		}
	}

	// Default fallback for unknown conditions
	const fallbackIcon = isNight ? WeatherIcons.DEFAULT_NIGHT : WeatherIcons.DEFAULT_DAY;
	return getIconPath(fallbackIcon);
};

/* Wind Speed Formatting */
export const formatWind = (
	speedKmh: number | undefined,
	directionDeg: number | undefined
): string => {
	// Check for undefined or 0 speed (calm conditions)
	if (speedKmh === undefined || speedKmh === 0) return 'Calm';

	const speedMph = Math.round(speedKmh * 0.621371);
	const direction = directionToNSEW(directionDeg);

	return direction ? `${direction} ${speedMph} mph` : `${speedMph} mph`;
};
