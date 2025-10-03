import { z } from 'zod';

// Minimal schemas that cover only the fields we use

export const PointsResponseSchema = z.object({
	properties: z.object({
		forecast: z.string().url(),
		forecastHourly: z.string().url(),
		observationStations: z.string().url(),
		gridId: z.string(),
		gridX: z.number(),
		gridY: z.number()
	})
});

export const ForecastSchema = z.object({
	properties: z.object({
		periods: z.array(
			z.object({
				name: z.string(),
				startTime: z.string(),
				isDaytime: z.boolean(),
				temperature: z.number(),
				shortForecast: z.string(),
				detailedForecast: z.string().optional(),
				icon: z.string().nullable().optional()
			})
		)
	})
});

export const StationsSchema = z.object({
	features: z.array(
		z.object({
			properties: z.object({
				stationIdentifier: z.string(),
				name: z.string().optional()
			})
		})
	)
});

export const ObservationSchema = z.object({
	properties: z.object({
		temperature: z
			.object({
				value: z.number().nullable().optional()
			})
			.optional(),
		textDescription: z.string().nullable().optional(),
		relativeHumidity: z
			.object({
				value: z.number().nullable().optional()
			})
			.optional(),
		dewpoint: z
			.object({
				value: z.number().nullable().optional()
			})
			.optional(),
		visibility: z
			.object({
				value: z.number().nullable().optional()
			})
			.optional(),
		windChill: z
			.object({
				value: z.number().nullable().optional()
			})
			.optional(),
		windDirection: z
			.object({
				value: z.number().nullable().optional()
			})
			.optional(),
		windSpeed: z
			.object({
				value: z.number().nullable().optional()
			})
			.optional(),
		icon: z.string().nullable().optional()
	})
});

export const AlertsSchema = z.object({
	features: z.array(
		z.object({
			properties: z.object({
				headline: z.string(),
				description: z.string().optional(),
				severity: z.string().optional(),
				urgency: z.string().optional(),
				certainty: z.string().optional(),
				areaDesc: z.string().optional()
			})
		})
	)
});
