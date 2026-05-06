import { createNwsHttpProvider } from './nws-http-adapter';

export type { WeatherProvider, WeatherSnapshot, Coords } from './port';
export { createNwsHttpProvider } from './nws-http-adapter';
export { createInMemoryProvider } from './in-memory-adapter';

/** Default singleton: a production NWS HTTP provider with default transport. */
export const weather = createNwsHttpProvider();
