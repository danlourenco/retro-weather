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
export const getWeatherIcon = (iconUrl: string | null | undefined): string | null => {
	if (!iconUrl) return null;

	// Parse NWS icon URL to detect day/night
	// NWS URLs are like: https://api.weather.gov/icons/land/day/skc or /night/skc
	const isNight = iconUrl.includes('/night/');

	// Extract the condition from the URL
	const condition = iconUrl.split('/').pop()?.split('?')[0] || '';

	// Icon mapping based on NWS condition codes
	// Reference: https://www.weather.gov/forecast-icons
	// Maps to TWC icon filenames in /static/images/weather/

	const basePath = '/images/weather/';

	// Clear sky
	if (condition.startsWith('skc') || condition.startsWith('hot') || condition.startsWith('cold')) {
		return basePath + (isNight ? 'CC_Clear0.gif' : 'Sunny.gif');
	}

	// Haze
	if (condition.startsWith('haze')) {
		return basePath + (isNight ? 'CC_Clear0.gif' : 'Sunny.gif');
	}

	// Few/scattered clouds
	if (condition.startsWith('few') || condition.startsWith('sct')) {
		return basePath + (isNight ? 'CC_PartlyCloudy0.gif' : 'CC_PartlyCloudy1.gif');
	}

	// Broken clouds
	if (condition.startsWith('bkn')) {
		return basePath + (isNight ? 'CC_MostlyCloudy0.gif' : 'CC_MostlyCloudy1.gif');
	}

	// Overcast
	if (condition.startsWith('ovc')) {
		return basePath + 'CC_Cloudy.gif';
	}

	// Fog
	if (condition.startsWith('fog')) {
		return basePath + 'CC_Fog.gif';
	}

	// Smoke
	if (condition.startsWith('smoke')) {
		return basePath + 'CC_Fog.gif'; // Use fog icon for smoke
	}

	// Rain/sleet mix
	if (condition.startsWith('rain_sleet')) {
		return basePath + 'Rain-Sleet.gif';
	}

	// Sleet
	if (condition.startsWith('sleet')) {
		return basePath + 'Sleet.gif';
	}

	// Showers
	if (condition.startsWith('rain_showers')) {
		return basePath + 'CC_Showers.gif';
	}

	// Rain
	if (condition.startsWith('rain') && !condition.includes('_')) {
		return basePath + 'CC_Rain.gif';
	}

	// Snow
	if (condition.startsWith('snow') && !condition.includes('_')) {
		return basePath + 'CC_Snow.gif';
	}

	// Rain/snow mix
	if (condition.startsWith('rain_snow')) {
		return basePath + 'CC_RainSnow.gif';
	}

	// Freezing rain
	if (condition.startsWith('fzra') || condition.startsWith('rain_fzra')) {
		return basePath + 'CC_FreezingRain.gif';
	}

	// Snow/freezing rain
	if (condition.startsWith('snow_fzra')) {
		return basePath + 'Freezing-Rain.gif';
	}

	// Snow/sleet
	if (condition.startsWith('snow_sleet')) {
		return basePath + 'Snow-Sleet.gif';
	}

	// Thunderstorms
	if (condition.startsWith('tsra_sct') || condition.startsWith('tsra')) {
		return basePath + 'CC_TStorm.gif';
	}

	// Severe weather
	if (
		condition.startsWith('tornado') ||
		condition.startsWith('hurricane') ||
		condition.startsWith('tropical_storm')
	) {
		return basePath + 'CC_Thunder.gif';
	}

	// Windy
	if (condition.startsWith('wind_')) {
		return basePath + 'CC_Windy.gif';
	}

	// Blizzard
	if (condition.startsWith('blizzard')) {
		return basePath + 'Blowing-Snow.gif';
	}

	// Default fallback
	return basePath + (isNight ? 'CC_PartlyCloudy0.gif' : 'CC_PartlyCloudy1.gif');
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
