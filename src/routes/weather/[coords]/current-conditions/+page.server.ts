import type { PageServerLoad } from './$types';
import { getStationsByGridpoint, getLatestObservation } from '$lib/services/nws';
import { ErrorType, type LoaderResult } from '$lib/types/errors';
import type { Station, Observation } from '$lib/types/domain';

interface CurrentConditionsData {
  station: Station | null;
  observation: Observation | null;
  coords: string;
}

export const load: PageServerLoad = async ({ parent }): Promise<LoaderResult<CurrentConditionsData>> => {
  const parentData = await parent();

  if (!parentData.data?.location?.observationStations) {
    return {
      data: null,
      error: {
        type: ErrorType.API_ERROR,
        message: 'No observation stations available for this location',
        retryable: false
      }
    };
  }

  const { location, coords } = parentData.data;

  try {
    // Get stations for this grid point
    const stations = await getStationsByGridpoint(location.gridId, location.gridX, location.gridY);
    
    if (stations.length === 0) {
      return {
        data: {
          station: null,
          observation: null,
          coords
        }
      };
    }

    // Get observation from the first available station
    const station = stations[0];
    
    try {
      const observation = await getLatestObservation(station.id);
      
      return {
        data: {
          station,
          observation,
          coords
        }
      };
    } catch (obsError) {
      console.warn(`Failed to get observation for station ${station.id}:`, obsError);
      
      // Return station info even if observation fails
      return {
        data: {
          station,
          observation: null,
          coords
        }
      };
    }

  } catch (err: unknown) {
    console.error('Failed to load current conditions:', err);
    return {
      data: null,
      error: {
        type: ErrorType.API_ERROR,
        message: 'Failed to load current weather conditions',
        retryable: true
      }
    };
  }
};