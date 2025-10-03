import { goto } from '$app/navigation';

/**
 * Centralized navigation service for weather routes
 */
export class WeatherNavigation {
  /**
   * Navigate to the current conditions page for given coordinates
   */
  static goToCurrentConditions(coords: string): void {
    goto(`/weather/${coords}/current-conditions`);
  }

  /**
   * Navigate to the local forecast page for given coordinates
   */
  static goToLocalForecast(coords: string): void {
    goto(`/weather/${coords}/local-forecast`);
  }

  /**
   * Navigate to the weather hazards page for given coordinates
   */
  static goToHazards(coords: string): void {
    goto(`/weather/${coords}/hazards`);
  }

  /**
   * Navigate to the extended forecast page for given coordinates
   */
  static goToExtendedForecast(coords: string): void {
    goto(`/weather/${coords}/extended-forecast`);
  }

  /**
   * Navigate to the weather intro page for given coordinates
   */
  static goToWeatherIntro(coords: string): void {
    goto(`/weather/${coords}`);
  }

  /**
   * Get the URL for a specific weather route without navigating
   */
  static getWeatherUrl(coords: string, page: 'current-conditions' | 'local-forecast' | 'hazards' | 'extended-forecast' | ''): string {
    const basePath = `/weather/${coords}`;
    return page ? `${basePath}/${page}` : basePath;
  }

  /**
   * Validate coordinates format
   */
  static validateCoords(coords: string): { lat: number; lon: number } | null {
    const parts = coords.split(',');
    if (parts.length !== 2) return null;

    const [latStr, lonStr] = parts;
    const lat = parseFloat(latStr);
    const lon = parseFloat(lonStr);

    if (isNaN(lat) || isNaN(lon)) return null;
    if (lat < -90 || lat > 90) return null;
    if (lon < -180 || lon > 180) return null;

    return { lat, lon };
  }
}