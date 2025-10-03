import { describe, it, expect } from 'vitest';
import { mapPoints, mapStations, mapObservation, mapForecast, mapAlerts } from './nws';
import type { 
  NWSPointsResponse, 
  NWSStationsResponse, 
  NWSObservationResponse, 
  NWSForecastResponse,
  NWSAlertsResponse 
} from '$lib/types/nws';

describe('NWS Mappers', () => {
  describe('mapPoints', () => {
    it('maps NWS points DTO to LocationInfo', () => {
      const dto: NWSPointsResponse = {
        properties: {
          forecast: 'https://api.weather.gov/gridpoints/BOX/64,77/forecast',
          forecastHourly: 'https://api.weather.gov/gridpoints/BOX/64,77/forecast/hourly',
          observationStations: 'https://api.weather.gov/gridpoints/BOX/64,77/stations',
          gridId: 'BOX',
          gridX: 64,
          gridY: 77
        }
      };

      const result = mapPoints(dto);

      expect(result).toEqual({
        forecast: 'https://api.weather.gov/gridpoints/BOX/64,77/forecast',
        forecastHourly: 'https://api.weather.gov/gridpoints/BOX/64,77/forecast/hourly',
        observationStations: 'https://api.weather.gov/gridpoints/BOX/64,77/stations',
        gridId: 'BOX',
        gridX: 64,
        gridY: 77
      });
    });
  });

  describe('mapStations', () => {
    it('maps NWS stations DTO to Station array', () => {
      const dto: NWSStationsResponse = {
        features: [
          {
            properties: {
              stationIdentifier: 'KBOS',
              name: 'Boston Logan International Airport'
            }
          },
          {
            properties: {
              stationIdentifier: 'KPWM'
              // name is optional
            }
          }
        ]
      };

      const result = mapStations(dto);

      expect(result).toEqual([
        {
          id: 'KBOS',
          name: 'Boston Logan International Airport'
        },
        {
          id: 'KPWM',
          name: 'KPWM' // falls back to ID when name is missing
        }
      ]);
    });
  });

  describe('mapObservation', () => {
    it('maps NWS observation DTO to Observation', () => {
      const dto: NWSObservationResponse = {
        properties: {
          temperature: { value: 15.5 },
          textDescription: 'Partly Cloudy',
          relativeHumidity: { value: 65 },
          windSpeed: { value: 5.2 },
          windDirection: { value: 180 },
          icon: 'https://api.weather.gov/icons/land/day/few?size=medium'
        }
      };

      const result = mapObservation(dto);

      expect(result).toEqual({
        temperatureC: 15.5,
        textDescription: 'Partly Cloudy',
        relativeHumidity: 65,
        dewpointC: undefined,
        visibilityM: undefined,
        windChillC: undefined,
        windDirectionDeg: 180,
        windSpeedKmh: 5.2,
        icon: 'https://api.weather.gov/icons/land/day/few?size=medium'
      });
    });

    it('handles null and missing values gracefully', () => {
      const dto: NWSObservationResponse = {
        properties: {
          temperature: { value: null },
          textDescription: null,
          // other fields missing
        }
      };

      const result = mapObservation(dto);

      expect(result).toEqual({
        temperatureC: undefined,
        textDescription: null,
        relativeHumidity: undefined,
        dewpointC: undefined,
        visibilityM: undefined,
        windChillC: undefined,
        windDirectionDeg: undefined,
        windSpeedKmh: undefined,
        icon: null
      });
    });
  });

  describe('mapForecast', () => {
    it('maps NWS forecast DTO to ForecastDay array', () => {
      const dto: NWSForecastResponse = {
        properties: {
          periods: [
            {
              name: 'Today',
              startTime: '2025-10-02T12:00:00-04:00',
              isDaytime: true,
              temperature: 72,
              shortForecast: 'Partly Cloudy',
              detailedForecast: 'Partly cloudy with a high near 72.',
              icon: 'https://api.weather.gov/icons/land/day/few?size=medium'
            },
            {
              name: 'Tonight',
              startTime: '2025-10-02T18:00:00-04:00',
              isDaytime: false,
              temperature: 55,
              shortForecast: 'Clear',
              icon: null
            }
          ]
        }
      };

      const result = mapForecast(dto);

      expect(result).toEqual([
        {
          dayName: 'Today',
          startTime: '2025-10-02T12:00:00-04:00',
          isDaytime: true,
          temperature: 72,
          shortForecast: 'Partly Cloudy',
          detailedForecast: 'Partly cloudy with a high near 72.',
          icon: 'https://api.weather.gov/icons/land/day/few?size=medium'
        },
        {
          dayName: 'Tonight',
          startTime: '2025-10-02T18:00:00-04:00',
          isDaytime: false,
          temperature: 55,
          shortForecast: 'Clear',
          detailedForecast: undefined,
          icon: null
        }
      ]);
    });
  });

  describe('mapAlerts', () => {
    it('maps NWS alerts DTO to Hazard array', () => {
      const dto: NWSAlertsResponse = {
        features: [
          {
            properties: {
              headline: 'Winter Storm Warning',
              description: 'Heavy snow expected.',
              severity: 'Moderate',
              urgency: 'Expected',
              certainty: 'Likely',
              areaDesc: 'Boston Metro Area'
            }
          }
        ]
      };

      const result = mapAlerts(dto);

      expect(result).toEqual([
        {
          headline: 'Winter Storm Warning',
          description: 'Heavy snow expected.',
          severity: 'Moderate',
          urgency: 'Expected',
          certainty: 'Likely',
          areas: 'Boston Metro Area'
        }
      ]);
    });
  });
});