# Weather Icon System Refactor

## Overview

This document describes the refactoring of the weather icon mapping system in retro-weather, transforming it from a procedural if-else chain into a data-driven, type-safe, and maintainable architecture.

## The Problem

### Original Implementation

Our original `getWeatherIcon` function was a ~125 line monster with multiple issues:

```typescript
// ❌ Before: Hardcoded, repetitive, difficult to maintain
export const getWeatherIcon = (iconUrl: string | null | undefined): string | null => {
  if (!iconUrl) return null;

  const isNight = iconUrl.includes('/night/');
  const condition = iconUrl.split('/').pop()?.split('?')[0] || '';
  const basePath = '/images/weather/';

  // Clear sky
  if (condition.startsWith('skc') || condition.startsWith('hot') || condition.startsWith('cold')) {
    return basePath + (isNight ? 'CC_Clear0.gif' : 'Sunny.gif');
  }

  // Haze
  if (condition.startsWith('haze')) {
    return basePath + (isNight ? 'CC_Clear0.gif' : 'Sunny.gif');
  }

  // ... 40+ more if statements

  // Default fallback
  return basePath + (isNight ? 'CC_PartlyCloudy0.gif' : 'CC_PartlyCloudy1.gif');
};
```

### Issues with the Original Approach

1. **Magic Strings Everywhere**
   - Icon filenames hardcoded throughout: `'CC_Clear0.gif'`, `'Sunny.gif'`, etc.
   - No single source of truth
   - Easy to make typos
   - Difficult to rename files

2. **No Type Safety**
   - String concatenation: `basePath + iconName`
   - Could easily reference non-existent files
   - No autocomplete for icon names
   - Runtime errors instead of compile-time checks

3. **Difficult to Extend**
   - Adding a new weather condition required finding the right place in the if-else chain
   - No clear pattern for where to add new conditions
   - Risk of breaking existing logic

4. **Hard to Test**
   - Each condition buried in function logic
   - No way to verify all conditions are covered
   - Difficult to test edge cases

5. **No Fallback for Unknown Conditions**
   - Only fallback was the final else statement
   - New NWS condition codes would fail silently
   - No way to track unmapped conditions

## The Solution

We refactored the system into three layers:

### Layer 1: Icon Constants (`src/lib/constants/weather-icons.ts`)

A single source of truth for all icon filenames:

```typescript
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

  // ... all other icons

  // Default fallback
  DEFAULT_DAY: 'CC_PartlyCloudy1.gif',
  DEFAULT_NIGHT: 'CC_PartlyCloudy0.gif'
} as const;

export type WeatherIconValue = (typeof WeatherIcons)[WeatherIconKey];
```

**Benefits:**
- ✅ TypeScript autocomplete
- ✅ Compile-time checking
- ✅ Easy to rename files
- ✅ Clear inventory of all icons

### Layer 2: Condition Mappings

A declarative data structure for NWS condition code mapping:

```typescript
export interface NWSConditionMapping {
  pattern: string | RegExp;
  dayIcon: WeatherIconValue;
  nightIcon: WeatherIconValue;
}

export const NWS_CONDITION_MAPPINGS: NWSConditionMapping[] = [
  {
    pattern: /^(skc|hot|cold)/,
    dayIcon: WeatherIcons.SUNNY,
    nightIcon: WeatherIcons.CLEAR_NIGHT
  },
  {
    pattern: /^(few|sct)/,
    dayIcon: WeatherIcons.PARTLY_CLOUDY_DAY,
    nightIcon: WeatherIcons.PARTLY_CLOUDY_NIGHT
  },
  // ... more mappings
];
```

**Benefits:**
- ✅ Easy to add new conditions
- ✅ Clear, table-like structure
- ✅ Supports regex patterns
- ✅ Testable in isolation

### Layer 3: Smart Icon Resolver

A clean, data-driven implementation:

```typescript
export const getWeatherIcon = (iconUrl: string | null | undefined): string | null => {
  if (!iconUrl) return null;

  const isNight = iconUrl.includes('/night/');
  const condition = iconUrl.split('/').pop()?.split('?')[0] || '';

  // Find matching condition in mappings
  for (const mapping of NWS_CONDITION_MAPPINGS) {
    const pattern =
      typeof mapping.pattern === 'string'
        ? new RegExp(`^${mapping.pattern}`)
        : mapping.pattern;

    if (pattern.test(condition)) {
      const iconName = isNight ? mapping.nightIcon : mapping.dayIcon;
      return getIconPath(iconName);
    }
  }

  // Explicit fallback for unknown conditions
  const fallbackIcon = isNight ? WeatherIcons.DEFAULT_NIGHT : WeatherIcons.DEFAULT_DAY;
  return getIconPath(fallbackIcon);
};
```

**Benefits:**
- ✅ ~80% less code
- ✅ Declarative vs imperative
- ✅ Explicit unknown condition handling
- ✅ Easy to understand and maintain

## Architecture Diagram

```
NWS API Icon URL
    ↓
getWeatherIcon()
    ↓
Parse condition code → "skc", "rain", "tsra"
    ↓
Loop through NWS_CONDITION_MAPPINGS
    ↓
Match pattern (regex)
    ↓
Select day/night icon from WeatherIcons
    ↓
getIconPath() → Full path
    ↓
"/images/weather/Sunny.gif"
```

## Key Improvements

### 1. Type Safety

**Before:**
```typescript
// No type checking - could be anything
const iconPath = basePath + 'CC_Clear0.gif';
```

**After:**
```typescript
// Type-checked - must be a valid WeatherIconValue
const iconName: WeatherIconValue = WeatherIcons.SUNNY;
const iconPath = getIconPath(iconName); // Type-safe
```

### 2. Maintainability

**Before:**
```typescript
// Adding a new condition meant finding the right spot in 40+ if statements
if (condition.startsWith('new_condition')) {
  return basePath + 'NewIcon.gif'; // Where does this go?
}
```

**After:**
```typescript
// Adding a new condition is declarative and clear
export const WeatherIcons = {
  // ... existing icons
  NEW_CONDITION: 'NewIcon.gif' // 1. Add to constants
} as const;

export const NWS_CONDITION_MAPPINGS = [
  // ... existing mappings
  {
    pattern: /^new_condition/,  // 2. Add mapping
    dayIcon: WeatherIcons.NEW_CONDITION,
    nightIcon: WeatherIcons.NEW_CONDITION
  }
];
```

### 3. Testability

**Before:**
```typescript
// Testing required calling the function with different URLs
expect(getWeatherIcon('https://api.weather.gov/icons/land/day/skc')).toBe('...');
```

**After:**
```typescript
// Can test constants, mappings, and function separately
describe('WeatherIcons', () => {
  it('has no duplicate values', () => {
    const values = Object.values(WeatherIcons);
    expect(new Set(values).size).toBe(values.length);
  });
});

describe('NWS_CONDITION_MAPPINGS', () => {
  it('covers all expected conditions', () => {
    const conditions = ['skc', 'few', 'rain', 'snow', 'tsra'];
    conditions.forEach(condition => {
      const mapping = NWS_CONDITION_MAPPINGS.find(m => {
        const pattern = typeof m.pattern === 'string'
          ? new RegExp(`^${m.pattern}`)
          : m.pattern;
        return pattern.test(condition);
      });
      expect(mapping).toBeDefined();
    });
  });
});

describe('getWeatherIcon', () => {
  it('returns fallback for unknown conditions', () => {
    const icon = getWeatherIcon('https://api.weather.gov/icons/land/day/unknown');
    expect(icon).toBe(getIconPath(WeatherIcons.DEFAULT_DAY));
  });
});
```

### 4. Documentation

The new structure is self-documenting:

```typescript
export const WeatherIcons = {
  // Clear - self-explanatory category
  SUNNY: 'Sunny.gif',  // Clear what this represents
  CLEAR_NIGHT: 'CC_Clear0.gif',

  // Clouds - organized by category
  PARTLY_CLOUDY_DAY: 'CC_PartlyCloudy1.gif',
  PARTLY_CLOUDY_NIGHT: 'CC_PartlyCloudy0.gif',
  // ...
};
```

### 5. Unknown Condition Handling

**Before:**
```typescript
// Unknown conditions fell through to generic fallback
// No way to track what was unmapped
return basePath + (isNight ? 'CC_PartlyCloudy0.gif' : 'CC_PartlyCloudy1.gif');
```

**After:**
```typescript
// Explicit fallback with logging opportunity
for (const mapping of NWS_CONDITION_MAPPINGS) {
  if (pattern.test(condition)) {
    return getIconPath(isNight ? mapping.nightIcon : mapping.dayIcon);
  }
}

// If we reach here, condition is unmapped
// Could log for monitoring: console.warn('Unmapped condition:', condition);
const fallbackIcon = isNight ? WeatherIcons.DEFAULT_NIGHT : WeatherIcons.DEFAULT_DAY;
return getIconPath(fallbackIcon);
```

## Migration Path

### Step 1: Create Constants File

```typescript
// src/lib/constants/weather-icons.ts
export const WeatherIcons = {
  SUNNY: 'Sunny.gif',
  // ... extract all icon filenames
} as const;
```

### Step 2: Create Mappings

```typescript
export const NWS_CONDITION_MAPPINGS: NWSConditionMapping[] = [
  // Convert each if statement to a mapping object
  {
    pattern: /^skc/,
    dayIcon: WeatherIcons.SUNNY,
    nightIcon: WeatherIcons.CLEAR_NIGHT
  },
  // ...
];
```

### Step 3: Refactor Function

```typescript
// src/lib/index.ts
import { getIconPath, WeatherIcons, NWS_CONDITION_MAPPINGS } from '$lib/constants/weather-icons';

export const getWeatherIcon = (iconUrl: string | null | undefined): string | null => {
  // New implementation using mappings
};
```

### Step 4: Test

```typescript
// Verify all existing behavior works
// Add tests for edge cases
// Test unknown conditions
```

## Real-World Usage

### Before Refactor

```typescript
// In component
const weatherImage = getWeatherIcon(observation?.icon);
// Hope the string is correct, no type safety
```

### After Refactor

```typescript
// Full type safety and autocomplete
import { WeatherIcons, getIconPath } from '$lib/constants/weather-icons';

// Can reference icons directly when needed
const placeholderIcon = getIconPath(WeatherIcons.DEFAULT_DAY);

// Or use the smart resolver
const weatherImage = getWeatherIcon(observation?.icon);
// Guaranteed to return a valid path or null
```

## Performance Considerations

### Time Complexity

**Before:** O(n) worst-case (n if statements)
**After:** O(n) worst-case (n mappings)

Performance is equivalent, but the new approach:
- Has better cache locality (data structure)
- Is more JIT-optimization friendly
- Has less branching overhead

### Space Complexity

**Before:** All strings inline
**After:** Strings in separate const object

Minimal difference - modern JS engines optimize both similarly.

## Benefits Summary

| Aspect | Before | After |
|--------|--------|-------|
| **Lines of Code** | ~125 lines | ~40 lines |
| **Type Safety** | ❌ None | ✅ Full |
| **Maintainability** | 😞 Difficult | 😊 Easy |
| **Testability** | 😞 Hard | 😊 Easy |
| **Extensibility** | 😞 Risky | 😊 Safe |
| **Documentation** | ❌ Comments only | ✅ Self-documenting |
| **Unknown Conditions** | ⚠️ Silent fallback | ✅ Explicit handling |
| **Autocomplete** | ❌ None | ✅ Full IDE support |

## Future Enhancements

### 1. Icon Preloading

```typescript
export function preloadWeatherIcons() {
  Object.values(WeatherIcons).forEach(iconName => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = getIconPath(iconName);
    document.head.appendChild(link);
  });
}
```

### 2. Condition Analytics

```typescript
const unmappedConditions = new Set<string>();

export const getWeatherIcon = (iconUrl: string | null | undefined): string | null => {
  // ... existing logic

  if (!matchFound) {
    unmappedConditions.add(condition);
    // Report to analytics
  }

  // ... fallback
};
```

### 3. Dynamic Icon Loading

```typescript
export async function getWeatherIconAsync(iconUrl: string): Promise<string> {
  const iconPath = getWeatherIcon(iconUrl);
  if (!iconPath) return defaultIcon;

  // Lazy load the icon
  await import(iconPath);
  return iconPath;
}
```

### 4. Icon Size Variants

```typescript
export const WeatherIcons = {
  SUNNY: {
    small: 'Sunny_32.gif',
    medium: 'Sunny_64.gif',
    large: 'Sunny.gif'
  },
  // ...
} as const;
```

## Lessons Learned

### 1. Data-Driven > Procedural

Whenever you have a long chain of if-else statements that follow a pattern, consider refactoring to a data-driven approach.

### 2. Types Enable Refactoring

Strong typing made this refactor safe. TypeScript caught every place we needed to update.

### 3. Separation of Concerns

Splitting into constants, mappings, and logic made each piece:
- Easier to understand
- Easier to test
- Easier to change

### 4. Explicit is Better

The new fallback handling is explicit and obvious, making future debugging much easier.

## Related Files

- **Constants**: `src/lib/constants/weather-icons.ts`
- **Implementation**: `src/lib/index.ts` (getWeatherIcon)
- **Usage**: `src/routes/weather/[coords]/current-conditions/+page.svelte`
- **Tests**: `src/lib/constants/weather-icons.test.ts` (to be created)

## Contributing

When adding new weather conditions:

1. Add icon filename to `WeatherIcons` constant
2. Add mapping to `NWS_CONDITION_MAPPINGS` array
3. Add test case for the new condition
4. Update this documentation

## References

- [NWS Icon API Documentation](https://www.weather.gov/forecast-icons)
- [NWS Condition Codes](https://www.weather.gov/documentation/services-web-api)
- TypeScript Const Assertions: [docs](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions)
