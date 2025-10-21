/**
 * Geolocation and location lookup utilities
 */

import { ZIPCODE_API_BASE_URL, GEOLOCATION_OPTIONS } from '$lib/config';

export interface GeolocationResult {
	lat: number;
	lon: number;
	city?: string;
	state?: string;
}

export interface GeolocationError {
	code: number;
	message: string;
}

/**
 * Lookup zipcode coordinates using Zippopotam.us API (free, no API key required)
 * @param zipcode - 5-digit US zipcode
 * @returns Coordinates and location info, or null if not found
 */
export async function lookupZipcode(zipcode: string): Promise<GeolocationResult | null> {
	try {
		const response = await fetch(`${ZIPCODE_API_BASE_URL}/us/${zipcode.trim()}`);

		if (!response.ok) {
			return null;
		}

		const data = await response.json();

		// Zippopotam returns data in this format:
		// { places: [{ latitude: "42.3601", longitude: "-71.0589", "place name": "Boston", "state": "Massachusetts" }] }
		if (data.places && data.places.length > 0) {
			const place = data.places[0];
			return {
				lat: parseFloat(place.latitude),
				lon: parseFloat(place.longitude),
				city: place['place name'],
				state: place.state
			};
		}

		return null;
	} catch (error) {
		console.error('Zipcode lookup error:', error);
		return null;
	}
}

/**
 * Validate a US zipcode format
 * @param zipcode - Zipcode to validate
 * @returns True if valid 5-digit zipcode
 */
export function isValidZipcode(zipcode: string): boolean {
	return /^\d{5}$/.test(zipcode.trim());
}

/**
 * Get user's location using browser geolocation API
 * @param options - Geolocation options
 * @returns Promise with coordinates
 */
export function getCurrentPosition(options?: PositionOptions): Promise<GeolocationPosition> {
	return new Promise((resolve, reject) => {
		if (!navigator.geolocation) {
			reject(new Error('Geolocation is not supported by your browser'));
			return;
		}

		navigator.geolocation.getCurrentPosition(resolve, reject, {
			...GEOLOCATION_OPTIONS,
			...options // Allow caller to override defaults
		});
	});
}

/**
 * Get user-friendly error message for geolocation errors
 * @param error - Geolocation error
 * @returns User-friendly error message
 */
export function getGeolocationErrorMessage(error: GeolocationPositionError): string {
	switch (error.code) {
		case error.PERMISSION_DENIED:
			return 'Location access denied. Please enter your zipcode manually.';
		case error.POSITION_UNAVAILABLE:
			return 'Location information unavailable. Please enter your zipcode manually.';
		case error.TIMEOUT:
			return 'Location request timed out. Please enter your zipcode manually.';
		default:
			return 'Failed to get your location. Please enter your zipcode manually.';
	}
}
