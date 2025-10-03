// Utility functions for the weather app

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
export const getWeatherIcon = (iconUrl: string | null | undefined): string => {
	if (!iconUrl) return '❓';

	// Simple icon mapping based on NWS icon URLs
	if (iconUrl.includes('clear') || iconUrl.includes('sunny')) return '☀️';
	if (iconUrl.includes('cloud')) return '☁️';
	if (iconUrl.includes('rain')) return '🌧️';
	if (iconUrl.includes('snow')) return '❄️';
	if (iconUrl.includes('storm') || iconUrl.includes('thunder')) return '⛈️';
	if (iconUrl.includes('fog')) return '🌫️';

	return '🌤️'; // Default partly cloudy
};

/* Wind Speed Formatting */
export const formatWind = (
	speedKmh: number | undefined,
	directionDeg: number | undefined
): string => {
	if (speedKmh === undefined) return 'Calm';

	const speedMph = Math.round(speedKmh * 0.621371);
	const direction = directionToNSEW(directionDeg);

	return direction ? `${direction} ${speedMph} mph` : `${speedMph} mph`;
};
