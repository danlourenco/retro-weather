// Type-safe NWS API service with runtime validation
import { fetchWithRetry, DEFAULT_RETRY } from '$lib/utils/http';
import { NWS_BASE_URL } from '$lib/config';
import { createApiError } from '$lib/types/errors';
import { mapPoints, mapStations, mapObservation, mapForecast, mapAlerts } from '$lib/mappers/nws';
import { 
  PointsResponseSchema, 
  ForecastSchema, 
  StationsSchema, 
  ObservationSchema,
  AlertsSchema 
} from '$lib/validators/nws';
import type { LocationInfo, Station, Observation, ForecastDay, Hazard } from '$lib/types/domain';

const BASE_URL = NWS_BASE_URL;

export async function getLocationByPoint(lat: number, lon: number): Promise<LocationInfo> {
  const url = `${BASE_URL}/points/${lat.toFixed(4)},${lon.toFixed(4)}`;
  
  const response = await fetchWithRetry(url, {
    headers: { Accept: 'application/geo+json' }
  }, DEFAULT_RETRY);

  if (!response.ok) {
    throw createApiError(`Points request failed: ${response.status} ${response.statusText}`, response.status);
  }

  const json = await response.json();
  const result = PointsResponseSchema.safeParse(json);
  
  if (!result.success) {
    console.error('Points validation failed:', result.error);
    throw createApiError('Invalid points response from NWS API');
  }

  return mapPoints(result.data);
}

export async function getStationsByGridpoint(gridId: string, x: number, y: number): Promise<Station[]> {
  const url = `${BASE_URL}/gridpoints/${gridId}/${x},${y}/stations`;
  
  const response = await fetchWithRetry(url, {
    headers: { Accept: 'application/geo+json' }
  }, DEFAULT_RETRY);

  if (!response.ok) {
    throw createApiError(`Stations request failed: ${response.status} ${response.statusText}`, response.status);
  }

  const json = await response.json();
  const result = StationsSchema.safeParse(json);
  
  if (!result.success) {
    console.error('Stations validation failed:', result.error);
    throw createApiError('Invalid stations response from NWS API');
  }

  return mapStations(result.data);
}

export async function getLatestObservation(stationId: string): Promise<Observation> {
  const url = `${BASE_URL}/stations/${stationId}/observations/latest`;
  
  const response = await fetchWithRetry(url, {
    headers: { Accept: 'application/geo+json' }
  }, DEFAULT_RETRY);

  if (!response.ok) {
    throw createApiError(`Observation request failed: ${response.status} ${response.statusText}`, response.status);
  }

  const json = await response.json();
  const result = ObservationSchema.safeParse(json);
  
  if (!result.success) {
    console.error('Observation validation failed:', result.error);
    throw createApiError('Invalid observation response from NWS API');
  }

  return mapObservation(result.data);
}

export async function getForecastByUrl(forecastUrl: string): Promise<ForecastDay[]> {
  const response = await fetchWithRetry(forecastUrl, {
    headers: { Accept: 'application/geo+json' }
  }, DEFAULT_RETRY);

  if (!response.ok) {
    throw createApiError(`Forecast request failed: ${response.status} ${response.statusText}`, response.status);
  }

  const json = await response.json();
  const result = ForecastSchema.safeParse(json);
  
  if (!result.success) {
    console.error('Forecast validation failed:', result.error);
    throw createApiError('Invalid forecast response from NWS API');
  }

  return mapForecast(result.data);
}

export async function getAlertsByPoint(lat: number, lon: number): Promise<Hazard[]> {
  const url = `${BASE_URL}/alerts/active?point=${lat.toFixed(4)},${lon.toFixed(4)}`;
  
  const response = await fetchWithRetry(url, {
    headers: { Accept: 'application/geo+json' }
  }, DEFAULT_RETRY);

  if (!response.ok) {
    throw createApiError(`Alerts request failed: ${response.status} ${response.statusText}`, response.status);
  }

  const json = await response.json();
  const result = AlertsSchema.safeParse(json);
  
  if (!result.success) {
    console.error('Alerts validation failed:', result.error);
    throw createApiError('Invalid alerts response from NWS API');
  }

  return mapAlerts(result.data);
}