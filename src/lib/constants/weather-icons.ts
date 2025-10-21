/**
 * Weather icon constants and mappings
 * Maps NWS weather condition codes to retro Weather Channel icon filenames
 */

export const WEATHER_ICONS_BASE_PATH = '/images/weather/';

/**
 * Weather icon filenames
 * These correspond to actual files in /static/images/weather/
 */
export const WeatherIcons = {
	// Clear
	SUNNY: 'Sunny.gif',
	CLEAR_NIGHT: 'CC_Clear0.gif',

	// Clouds
	PARTLY_CLOUDY_DAY: 'CC_PartlyCloudy1.gif',
	PARTLY_CLOUDY_NIGHT: 'CC_PartlyCloudy0.gif',
	MOSTLY_CLOUDY_DAY: 'CC_MostlyCloudy1.gif',
	MOSTLY_CLOUDY_NIGHT: 'CC_MostlyCloudy0.gif',
	CLOUDY: 'CC_Cloudy.gif',

	// Fog/Haze
	FOG: 'CC_Fog.gif',

	// Rain
	RAIN: 'CC_Rain.gif',
	SHOWERS: 'CC_Showers.gif',
	FREEZING_RAIN: 'CC_FreezingRain.gif',
	FREEZING_RAIN_ALT: 'Freezing-Rain.gif',

	// Snow
	SNOW: 'CC_Snow.gif',
	BLOWING_SNOW: 'Blowing-Snow.gif',

	// Mixed precipitation
	RAIN_SNOW: 'CC_RainSnow.gif',
	RAIN_SLEET: 'Rain-Sleet.gif',
	SLEET: 'Sleet.gif',
	SNOW_SLEET: 'Snow-Sleet.gif',

	// Thunderstorms
	THUNDERSTORM: 'CC_TStorm.gif',
	THUNDER: 'CC_Thunder.gif',

	// Wind
	WINDY: 'CC_Windy.gif',

	// Default fallback
	DEFAULT_DAY: 'CC_PartlyCloudy1.gif',
	DEFAULT_NIGHT: 'CC_PartlyCloudy0.gif'
} as const;

export type WeatherIconKey = keyof typeof WeatherIcons;
export type WeatherIconValue = (typeof WeatherIcons)[WeatherIconKey];

/**
 * Get full path to a weather icon
 */
export function getIconPath(iconName: WeatherIconValue): string {
	return `${WEATHER_ICONS_BASE_PATH}${iconName}`;
}

/**
 * NWS condition code mapping
 * Maps NWS weather condition codes to our icon keys
 */
export interface NWSConditionMapping {
	pattern: string | RegExp;
	dayIcon: WeatherIconValue;
	nightIcon: WeatherIconValue;
}

export const NWS_CONDITION_MAPPINGS: NWSConditionMapping[] = [
	// Clear sky
	{
		pattern: /^(skc|hot|cold)/,
		dayIcon: WeatherIcons.SUNNY,
		nightIcon: WeatherIcons.CLEAR_NIGHT
	},
	// Haze
	{
		pattern: /^haze/,
		dayIcon: WeatherIcons.SUNNY,
		nightIcon: WeatherIcons.CLEAR_NIGHT
	},
	// Few/scattered clouds
	{
		pattern: /^(few|sct)/,
		dayIcon: WeatherIcons.PARTLY_CLOUDY_DAY,
		nightIcon: WeatherIcons.PARTLY_CLOUDY_NIGHT
	},
	// Broken clouds
	{
		pattern: /^bkn/,
		dayIcon: WeatherIcons.MOSTLY_CLOUDY_DAY,
		nightIcon: WeatherIcons.MOSTLY_CLOUDY_NIGHT
	},
	// Overcast
	{
		pattern: /^ovc/,
		dayIcon: WeatherIcons.CLOUDY,
		nightIcon: WeatherIcons.CLOUDY
	},
	// Fog
	{
		pattern: /^fog/,
		dayIcon: WeatherIcons.FOG,
		nightIcon: WeatherIcons.FOG
	},
	// Smoke (use fog icon)
	{
		pattern: /^smoke/,
		dayIcon: WeatherIcons.FOG,
		nightIcon: WeatherIcons.FOG
	},
	// Rain/sleet mix
	{
		pattern: /^rain_sleet/,
		dayIcon: WeatherIcons.RAIN_SLEET,
		nightIcon: WeatherIcons.RAIN_SLEET
	},
	// Sleet
	{
		pattern: /^sleet/,
		dayIcon: WeatherIcons.SLEET,
		nightIcon: WeatherIcons.SLEET
	},
	// Showers
	{
		pattern: /^rain_showers/,
		dayIcon: WeatherIcons.SHOWERS,
		nightIcon: WeatherIcons.SHOWERS
	},
	// Rain (no underscore)
	{
		pattern: /^rain(?!_)/,
		dayIcon: WeatherIcons.RAIN,
		nightIcon: WeatherIcons.RAIN
	},
	// Snow (no underscore)
	{
		pattern: /^snow(?!_)/,
		dayIcon: WeatherIcons.SNOW,
		nightIcon: WeatherIcons.SNOW
	},
	// Rain/snow mix
	{
		pattern: /^rain_snow/,
		dayIcon: WeatherIcons.RAIN_SNOW,
		nightIcon: WeatherIcons.RAIN_SNOW
	},
	// Freezing rain
	{
		pattern: /^(fzra|rain_fzra)/,
		dayIcon: WeatherIcons.FREEZING_RAIN,
		nightIcon: WeatherIcons.FREEZING_RAIN
	},
	// Snow/freezing rain
	{
		pattern: /^snow_fzra/,
		dayIcon: WeatherIcons.FREEZING_RAIN_ALT,
		nightIcon: WeatherIcons.FREEZING_RAIN_ALT
	},
	// Snow/sleet
	{
		pattern: /^snow_sleet/,
		dayIcon: WeatherIcons.SNOW_SLEET,
		nightIcon: WeatherIcons.SNOW_SLEET
	},
	// Thunderstorms
	{
		pattern: /^(tsra_sct|tsra)/,
		dayIcon: WeatherIcons.THUNDERSTORM,
		nightIcon: WeatherIcons.THUNDERSTORM
	},
	// Severe weather
	{
		pattern: /^(tornado|hurricane|tropical_storm)/,
		dayIcon: WeatherIcons.THUNDER,
		nightIcon: WeatherIcons.THUNDER
	},
	// Windy
	{
		pattern: /^wind_/,
		dayIcon: WeatherIcons.WINDY,
		nightIcon: WeatherIcons.WINDY
	},
	// Blizzard
	{
		pattern: /^blizzard/,
		dayIcon: WeatherIcons.BLOWING_SNOW,
		nightIcon: WeatherIcons.BLOWING_SNOW
	}
];
