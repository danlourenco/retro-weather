# Loader Utility Functions

## Overview

The loader utilities (`src/lib/utils/loader.ts`) provide a standardized approach to error handling in SvelteKit server loaders. These utilities help maintain consistency, reduce code duplication, and provide better error handling patterns across the application.

## Why Use Loader Utilities?

### The Problem

Before implementing these utilities, our loaders had repetitive error handling code:

```typescript
// ❌ Before: Repetitive try-catch blocks everywhere
try {
  const data = await someApiCall();
  return { data };
} catch (err: unknown) {
  console.error('Failed to load data:', err);
  return {
    data: null,
    error: createApiError('Failed to load data')
  };
}

// Another loader with the same pattern
try {
  const moreData = await anotherApiCall();
  // ... more logic
} catch (err: unknown) {
  console.error('Failed to load more data:', err);
  // ... duplicate error handling
}
```

### The Solution

Our loader utilities abstract this repetitive pattern into reusable functions:

```typescript
// ✅ After: Clean, consistent error handling
const result = await withErrorHandling(
  () => someApiCall(),
  'Failed to load data'
);

const optionalData = await withGracefulFallback(
  () => anotherApiCall(),
  null,
  'Failed to load optional data'
);
```

## API Reference

### `withErrorHandling<T>`

Wraps a loader function with consistent error handling. This function catches errors, logs them, and returns a standardized `LoaderResult<T>`.

**Type Signature:**
```typescript
async function withErrorHandling<T>(
  fn: () => Promise<T>,
  errorMessage: string
): Promise<LoaderResult<T>>
```

**Parameters:**
- `fn` - The async function to execute
- `errorMessage` - The error message to use if the function throws

**Returns:**
- `LoaderResult<T>` - Object with either `data` or `error` property

**Example:**
```typescript
export const load: PageServerLoad = async () => {
  return withErrorHandling(async () => {
    const stations = await getStationsByGridpoint(gridId, x, y);
    const observation = await getLatestObservation(stations[0].id);

    return {
      stations,
      observation,
      pageTitle: 'Weather Data'
    };
  }, 'Failed to load weather data');
};
```

**Error Handling:**
- Catches all errors thrown by `fn()`
- Logs errors to console with the provided message
- If error is already a `WeatherError`, preserves it
- Otherwise, creates a generic `API_ERROR` type error
- Returns `{ data: null, error: WeatherError }`

---

### `withGracefulFallback<T>`

Wraps a loader function that should fail gracefully without breaking the page. This is ideal for optional data like alerts, hazards, or supplementary information.

**Type Signature:**
```typescript
async function withGracefulFallback<T>(
  fn: () => Promise<T>,
  fallback: T,
  warningMessage: string
): Promise<T>
```

**Parameters:**
- `fn` - The async function to execute
- `fallback` - The value to return if the function throws
- `warningMessage` - The warning message to log if the function throws

**Returns:**
- `T` - Either the successful result or the fallback value

**Example:**
```typescript
export const load: PageServerLoad = async ({ parent }) => {
  const { location } = await parent();

  // Main data - must succeed
  const stations = await getStationsByGridpoint(
    location.gridId,
    location.gridX,
    location.gridY
  );

  // Optional data - fails gracefully
  const hazards = await withGracefulFallback(
    () => getAlertsByPoint(lat, lon),
    [], // Empty array if alerts fail
    'Failed to fetch weather alerts'
  );

  const observation = await withGracefulFallback(
    () => getLatestObservation(stations[0].id),
    null, // Null if observation fails
    'Failed to fetch latest observation'
  );

  return {
    data: {
      stations,
      observation,
      hazards
    }
  };
};
```

**Error Handling:**
- Catches all errors thrown by `fn()`
- Logs a warning to console (not an error)
- Returns the `fallback` value
- Does not throw or propagate errors

---

## Usage Patterns

### Pattern 1: Critical Data with Error Handling

Use `withErrorHandling` when data is required for the page to function:

```typescript
export const load: PageServerLoad = async ({ params }) => {
  return withErrorHandling(async () => {
    // Critical data - page can't render without it
    const location = await getLocationByPoint(lat, lon);
    const forecast = await getForecastByUrl(location.forecast);

    return { location, forecast };
  }, 'Failed to load weather forecast');
};
```

### Pattern 2: Optional Data with Graceful Fallback

Use `withGracefulFallback` for non-critical data:

```typescript
export const load: PageServerLoad = async () => {
  // Critical data
  const location = await getLocationByPoint(lat, lon);

  // Optional data - won't break the page if it fails
  const alerts = await withGracefulFallback(
    () => getAlertsByPoint(lat, lon),
    [],
    'Failed to fetch alerts'
  );

  return {
    data: { location, alerts }
  };
};
```

### Pattern 3: Combining Both Utilities

Mix critical and optional data loading:

```typescript
export const load: PageServerLoad = async ({ params }) => {
  return withErrorHandling(async () => {
    // Critical data
    const location = await getLocationByPoint(lat, lon);

    // Optional data within the critical handler
    const hazards = await withGracefulFallback(
      () => getAlertsByPoint(lat, lon),
      [],
      'Failed to fetch hazards'
    );

    const stations = await withGracefulFallback(
      () => getStationsByGridpoint(location.gridId, location.gridX, location.gridY),
      [],
      'Failed to fetch stations'
    );

    return {
      location,
      hazards,
      stations,
      pageTitle: 'Weather Data'
    };
  }, 'Failed to load location data');
};
```

## Real-World Examples

### Before: Layout Loader (Current Conditions)

```typescript
// ❌ Before: Nested try-catch blocks, repetitive error handling
export const load: PageServerLoad = async ({ parent }) => {
  const parentData = await parent();
  const { location, coords } = parentData.data;

  let hazards: Hazard[] = [];
  try {
    const [lat, lon] = coords.split(',').map(Number);
    hazards = await getAlertsByPoint(lat, lon);
  } catch (hazardError) {
    console.warn('Failed to fetch hazards:', hazardError);
  }

  try {
    const stations = await getStationsByGridpoint(
      location.gridId,
      location.gridX,
      location.gridY
    );

    if (stations.length === 0) {
      return { data: { station: null, observation: null, hazards } };
    }

    const station = stations[0];

    try {
      const observation = await getLatestObservation(station.id);
      return { data: { station, observation, hazards } };
    } catch (obsError) {
      console.warn('Failed to fetch observation:', obsError);
      return { data: { station, observation: null, hazards } };
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
```

### After: Using Loader Utilities

```typescript
// ✅ After: Clean, declarative, consistent
export const load: PageServerLoad = async ({ parent }) => {
  const parentData = await parent();
  const { location, coords } = parentData.data;

  // Optional data - gracefully fails
  const [lat, lon] = coords.split(',').map(Number);
  const hazards = await withGracefulFallback(
    () => getAlertsByPoint(lat, lon),
    [],
    'Failed to fetch hazards'
  );

  // Critical data - returns error on failure
  return withErrorHandling(async () => {
    const stations = await getStationsByGridpoint(
      location.gridId,
      location.gridX,
      location.gridY
    );

    if (stations.length === 0) {
      return { station: null, observation: null, hazards };
    }

    const station = stations[0];
    const observation = await withGracefulFallback(
      () => getLatestObservation(station.id),
      null,
      `Failed to get observation for station ${station.id}`
    );

    return { station, observation, hazards, pageTitle: 'CURRENT CONDITIONS' };
  }, 'Failed to load current weather conditions');
};
```

## Benefits

### 1. **Consistency**
- All errors are handled the same way across the application
- Standardized error logging format
- Predictable error response structure

### 2. **Less Code**
- Reduces boilerplate by ~40-60%
- No more nested try-catch blocks
- Cleaner, more readable loaders

### 3. **Type Safety**
- Generic types ensure type safety
- `LoaderResult<T>` provides clear return types
- Better IDE autocomplete and error detection

### 4. **Better Error Messages**
- Descriptive error messages at the call site
- Console logs include context
- Easier debugging

### 5. **Graceful Degradation**
- Optional data doesn't break the page
- Users see partial data instead of error pages
- Better user experience

## Testing

The loader utilities should be thoroughly tested to ensure reliability:

```typescript
// src/lib/utils/loader.test.ts
import { describe, it, expect, vi } from 'vitest';
import { withErrorHandling, withGracefulFallback } from './loader';

describe('withErrorHandling', () => {
  it('returns data on success', async () => {
    const result = await withErrorHandling(
      async () => ({ value: 42 }),
      'Test error'
    );

    expect(result).toEqual({ data: { value: 42 } });
  });

  it('returns error on failure', async () => {
    const result = await withErrorHandling(
      async () => { throw new Error('Test error'); },
      'Operation failed'
    );

    expect(result.data).toBeNull();
    expect(result.error).toBeDefined();
    expect(result.error?.message).toBe('Operation failed');
  });
});

describe('withGracefulFallback', () => {
  it('returns data on success', async () => {
    const result = await withGracefulFallback(
      async () => [1, 2, 3],
      [],
      'Test warning'
    );

    expect(result).toEqual([1, 2, 3]);
  });

  it('returns fallback on failure', async () => {
    const result = await withGracefulFallback(
      async () => { throw new Error('Test error'); },
      [],
      'Failed gracefully'
    );

    expect(result).toEqual([]);
  });
});
```

## Best Practices

### ✅ DO

- Use `withErrorHandling` for critical data
- Use `withGracefulFallback` for optional data
- Provide descriptive error messages
- Keep loader logic inside the wrapper functions
- Return appropriate fallback values (null, [], {}, etc.)

### ❌ DON'T

- Don't nest `withErrorHandling` calls
- Don't use generic error messages like "Error occurred"
- Don't use `withGracefulFallback` for critical data
- Don't swallow errors silently (always provide messages)
- Don't mix error handling patterns in the same codebase

## Migration Guide

To migrate existing loaders:

1. **Identify critical vs optional data**
   - Critical: Page can't render without it
   - Optional: Page works fine without it

2. **Replace try-catch blocks**
   ```typescript
   // Before
   try {
     const data = await fetchData();
     return { data };
   } catch (err) {
     console.error('Failed', err);
     return { data: null, error: createApiError('Failed') };
   }

   // After
   return withErrorHandling(
     () => fetchData(),
     'Failed to fetch data'
   );
   ```

3. **Replace nested try-catch for optional data**
   ```typescript
   // Before
   let optional = null;
   try {
     optional = await fetchOptional();
   } catch (err) {
     console.warn('Failed to fetch optional', err);
   }

   // After
   const optional = await withGracefulFallback(
     () => fetchOptional(),
     null,
     'Failed to fetch optional data'
   );
   ```

## Related Files

- Implementation: `src/lib/utils/loader.ts`
- Types: `src/lib/types/errors.ts`
- Examples: `src/routes/weather/[coords]/+layout.server.ts`
- Tests: `src/lib/utils/loader.test.ts`

## Contributing

When adding new loader utilities:

1. Add comprehensive JSDoc comments
2. Include type parameters and return types
3. Write unit tests
4. Update this documentation
5. Add examples to this guide
