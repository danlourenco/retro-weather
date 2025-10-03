import { describe, it, expect } from 'vitest';
import { 
  PointsResponseSchema, 
  ForecastSchema, 
  StationsSchema, 
  ObservationSchema,
  AlertsSchema 
} from './nws';

describe('NWS Zod Validators', () => {
  describe('PointsResponseSchema', () => {
    it('validates a valid points response', () => {
      const validResponse = {
        properties: {
          forecast: 'https://api.weather.gov/gridpoints/BOX/64,77/forecast',
          forecastHourly: 'https://api.weather.gov/gridpoints/BOX/64,77/forecast/hourly',
          observationStations: 'https://api.weather.gov/gridpoints/BOX/64,77/stations',
          gridId: 'BOX',
          gridX: 64,
          gridY: 77
        }
      };

      const result = PointsResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });

    it('rejects invalid URL formats', () => {
      const invalidResponse = {
        properties: {
          forecast: 'not-a-url',
          forecastHourly: 'https://api.weather.gov/forecast/hourly',
          observationStations: 'https://api.weather.gov/stations',
          gridId: 'BOX',
          gridX: 64,
          gridY: 77
        }
      };

      const result = PointsResponseSchema.safeParse(invalidResponse);
      expect(result.success).toBe(false);
    });
  });

  describe('ForecastSchema', () => {
    it('validates a minimal valid forecast payload', () => {
      const sample = {
        properties: {
          periods: [
            {
              name: 'Today',
              startTime: '2025-10-02T12:00:00Z',
              isDaytime: true,
              temperature: 72,
              shortForecast: 'Partly Cloudy'
            }
          ]
        }
      };

      const result = ForecastSchema.safeParse(sample);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.properties.periods[0].name).toBe('Today');
      }
    });

    it('rejects forecast when periods missing', () => {
      const sample = { properties: {} };
      const result = ForecastSchema.safeParse(sample);
      expect(result.success).toBe(false);
    });
  });

  describe('StationsSchema', () => {
    it('validates a valid stations response', () => {
      const validResponse = {
        features: [
          {
            properties: {
              stationIdentifier: 'KBOS',
              name: 'Boston Logan International Airport'
            }
          }
        ]
      };

      const result = StationsSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });

    it('handles optional name field', () => {
      const validResponse = {
        features: [
          {
            properties: {
              stationIdentifier: 'KPWM'
              // name is optional
            }
          }
        ]
      };

      const result = StationsSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });
  });

  describe('ObservationSchema', () => {
    it('validates a valid observation response', () => {
      const validResponse = {
        properties: {
          temperature: { value: 15.5 },
          textDescription: 'Partly Cloudy',
          relativeHumidity: { value: 65 }
        }
      };

      const result = ObservationSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });

    it('handles null values', () => {
      const validResponse = {
        properties: {
          temperature: { value: null },
          textDescription: null
        }
      };

      const result = ObservationSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });
  });

  describe('AlertsSchema', () => {
    it('validates a valid alerts response', () => {
      const validResponse = {
        features: [
          {
            properties: {
              headline: 'Winter Storm Warning',
              description: 'Heavy snow expected.',
              severity: 'Moderate'
            }
          }
        ]
      };

      const result = AlertsSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });

    it('handles empty alerts array', () => {
      const validResponse = {
        features: []
      };

      const result = AlertsSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });
  });
});