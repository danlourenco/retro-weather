# Caching API Data in Svelte 5 & SvelteKit: Best Practices

## TL;DR

**Don't over-engineer client-side caching.** Use SvelteKit's built-in features:
1. Server-side cache headers (`Cache-Control`)
2. `invalidate()` for manual refresh
3. Svelte 5 runes for UI state (showing data age)

This guide shows why simple is better and how to implement effective caching idiomatically.

---

## The Problem

You're building a weather app that fetches data from an external API. Questions arise:

- How do I avoid hitting the API on every navigation?
- Should I cache data client-side?
- How do I show users when data was last updated?
- When should I refresh?

### ❌ The Over-Engineered Approach

My first instinct was to build a complex client-side cache:

```typescript
// ❌ Over-engineered: Custom cache with TTL, localStorage, etc.
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

const cache = createCache<WeatherData>({ ttl: 300000 });

// Then manage cache manually everywhere...
const cached = cache.get(key);
if (!cached) {
  const data = await fetchWeather();
  cache.set(key, data);
}
```

**Problems:**
- Duplicates browser caching
- Complex state management
- More code to test
- Harder to debug
- Not idiomatic for SvelteKit

---

## ✅ The Idiomatic Svelte 5 / SvelteKit Approach

Use the platform! Leverage what's already built-in.

### Layer 1: Server-Side Caching (SvelteKit)

Let the **server** handle caching with HTTP headers:

```typescript
// +layout.server.ts
export const load: LayoutServerLoad = async ({ setHeaders }) => {
  const data = await fetchWeatherData();

  // Cache for 5 minutes, allow stale data for 10 minutes while revalidating
  setHeaders({
    'Cache-Control': 'public, max-age=300, stale-while-revalidate=600'
  });

  return { data };
};
```

**What this does:**
- Browser caches response for 5 minutes
- After 5 minutes, serves stale data while fetching fresh data in background
- No custom cache needed!
- Works across tabs and page reloads
- Standard HTTP caching

### Layer 2: Client-Side State (Svelte 5 Runes)

Track **when** data was loaded using Svelte 5's reactive runes:

```svelte
<script lang="ts">
  // Track when data was loaded (client-side only)
  let dataLoadedAt = $state(Date.now());
  let dataAge = $state(0);

  // Update age every second
  $effect(() => {
    const interval = setInterval(() => {
      dataAge = Date.now() - dataLoadedAt;
    }, 1000);

    return () => clearInterval(interval);
  });

  // Format age for display
  const formattedAge = $derived.by(() => {
    const seconds = Math.floor(dataAge / 1000);
    const minutes = Math.floor(seconds / 60);
    return minutes > 0
      ? `${minutes}m ${seconds % 60}s ago`
      : `${seconds}s ago`;
  });
</script>

<p>Updated {formattedAge}</p>
```

**Benefits:**
- Pure UI state (not data caching)
- Reactive with `$state` and `$derived`
- No external store needed
- Simple cleanup with `$effect`

### Layer 3: Manual Refresh (SvelteKit `invalidate`)

Give users a refresh button using SvelteKit's `invalidate()`:

```svelte
<script lang="ts">
  import { invalidate } from '$app/navigation';
  import { page } from '$app/state';

  let isRefreshing = $state(false);

  async function handleRefresh() {
    isRefreshing = true;

    try {
      // Invalidate current page data to force reload
      await invalidate(page.url.pathname);
      dataLoadedAt = Date.now(); // Reset age tracker
    } finally {
      isRefreshing = false;
    }
  }
</script>

<button onclick={handleRefresh} disabled={isRefreshing}>
  {isRefreshing ? 'REFRESHING...' : '🔄 REFRESH'}
</button>
```

**How it works:**
- `invalidate()` tells SvelteKit to re-run the load function
- Browser might still serve cached response (respecting headers)
- To bypass cache, use `fetch()` with `cache: 'reload'` in loader

---

## Complete Example

Here's a full implementation combining all three layers:

### Server Loader (`+page.server.ts`)

```typescript
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, setHeaders }) => {
  // Fetch weather data
  const response = await fetch('https://api.weather.gov/stations/KBOS/observations/latest');
  const data = await response.json();

  // Cache for 5 minutes
  setHeaders({
    'Cache-Control': 'public, max-age=300, stale-while-revalidate=600'
  });

  return {
    observation: data,
    fetchedAt: Date.now() // Server timestamp
  };
};
```

### Component (`+page.svelte`)

```svelte
<script lang="ts">
  import type { PageData } from './$types';
  import { invalidate } from '$app/navigation';
  import { page } from '$app/state';

  let { data }: { data: PageData } = $props();

  // Client-side: track when data was loaded
  let clientLoadedAt = $state(Date.now());
  let dataAge = $state(0);
  let isRefreshing = $state(false);

  // Update age every second
  $effect(() => {
    const interval = setInterval(() => {
      dataAge = Date.now() - clientLoadedAt;
    }, 1000);
    return () => clearInterval(interval);
  });

  // Format age
  const formattedAge = $derived.by(() => {
    const seconds = Math.floor(dataAge / 1000);
    const minutes = Math.floor(seconds / 60);
    return minutes > 0
      ? `${minutes}m ${seconds % 60}s ago`
      : `${seconds}s ago`;
  });

  // Refresh handler
  async function handleRefresh() {
    isRefreshing = true;
    try {
      await invalidate(page.url.pathname);
      clientLoadedAt = Date.now();
    } finally {
      isRefreshing = false;
    }
  }
</script>

<div>
  <h1>Current Temperature</h1>
  <p class="temp">{data.observation.temperature.value}°F</p>

  <!-- Cache info -->
  <div class="meta">
    <p>Updated {formattedAge}</p>
    {#if dataAge > 300000}
      <span class="warning">Data may be stale</span>
    {/if}
  </div>

  <!-- Refresh button -->
  <button onclick={handleRefresh} disabled={isRefreshing}>
    {isRefreshing ? 'Refreshing...' : '🔄 Refresh'}
  </button>
</div>
```

---

## Key Principles

### 1. **Leverage HTTP Caching**

Don't reinvent the wheel. HTTP caching is:
- Battle-tested
- Built into browsers
- Respected by proxies and CDNs
- Easy to configure

```typescript
// Good ✅
setHeaders({
  'Cache-Control': 'public, max-age=300, stale-while-revalidate=600'
});

// Over-engineered ❌
const cache = new Map();
if (!cache.has(key) || cache.get(key).expiresAt < Date.now()) {
  // ... manual cache management
}
```

### 2. **Separate Data from UI State**

- **Data caching** = Server's job (HTTP headers)
- **UI state** = Client's job (Svelte runes)

```typescript
// Data caching (server)
setHeaders({ 'Cache-Control': '...' });

// UI state (client)
let dataLoadedAt = $state(Date.now());
```

### 3. **Use Runes for Reactivity**

Svelte 5 runes (`$state`, `$derived`, `$effect`) replace stores for most use cases:

```svelte
<!-- ✅ Svelte 5 runes -->
<script>
  let count = $state(0);
  let doubled = $derived(count * 2);

  $effect(() => {
    console.log('Count changed:', count);
  });
</script>

<!-- ❌ Svelte 4 stores (legacy) -->
<script>
  import { writable, derived } from 'svelte/store';

  const count = writable(0);
  const doubled = derived(count, $count => $count * 2);

  $: console.log('Count changed:', $count);
</script>
```

### 4. **Provide Manual Refresh**

Even with good caching, users want control:

```typescript
// Invalidate specific route
await invalidate('/api/weather');

// Invalidate current page
await invalidate(page.url.pathname);

// Invalidate everything
await invalidate(() => true);
```

### 5. **Show Freshness Indicators**

Be transparent about data age:

```svelte
{#if dataAge < 60000}
  <span class="fresh">Just now</span>
{:else if dataAge < 300000}
  <span class="okay">{formattedAge}</span>
{:else}
  <span class="stale">{formattedAge} - Consider refreshing</span>
{/if}
```

---

## Advanced: Bypassing Cache

Sometimes you need fresh data regardless of cache:

### Option 1: Force Reload in Loader

```typescript
export const load: PageServerLoad = async ({ fetch, url }) => {
  const forceRefresh = url.searchParams.has('refresh');

  const response = await fetch('https://api.example.com/data', {
    cache: forceRefresh ? 'reload' : 'default'
  });

  return { data: await response.json() };
};
```

### Option 2: Use Dependency Tracking

```typescript
import { invalidate, depends } from '$app/navigation';

export const load: PageServerLoad = async ({ depends }) => {
  // Mark this load function as dependent on 'weather:current'
  depends('weather:current');

  const data = await fetchWeather();
  return { data };
};

// In component
await invalidate('weather:current'); // Only invalidates matching loaders
```

---

## When to Use Custom Client-Side Cache

**Very rarely.** Consider it only if:

1. **Multiple components need same data** that isn't from a shared parent
   - Even then, consider lifting state or using context

2. **Data is expensive to fetch** and you navigate away/back frequently
   - SvelteKit's built-in navigation caching often handles this

3. **You're building offline-first** with service workers
   - Use established libraries (Workbox, etc.)

4. **You have very specific cache invalidation rules**
   - Even then, try to model it server-side first

---

## Anti-Patterns to Avoid

### ❌ Don't Cache in Stores for HTTP Data

```typescript
// ❌ Anti-pattern
import { writable } from 'svelte/store';

const weatherStore = writable(null);

export async function fetchWeather() {
  const data = await fetch('/api/weather').then(r => r.json());
  weatherStore.set(data);
}
```

**Why avoid:**
- Duplicates HTTP caching
- State lost on page reload
- Doesn't work with SSR
- More complex than needed

### ❌ Don't Use LocalStorage for API Data

```typescript
// ❌ Anti-pattern
const cached = localStorage.getItem('weather');
if (cached && JSON.parse(cached).expiresAt > Date.now()) {
  return JSON.parse(cached).data;
}
```

**Why avoid:**
- 5-10MB limit
- Synchronous (blocks main thread)
- Not available in SSR
- Browser cache is better

### ❌ Don't Fight SvelteKit's Loading Pattern

```typescript
// ❌ Anti-pattern: Fetching in component instead of loader
<script>
  let data = $state(null);

  onMount(async () => {
    data = await fetch('/api/weather').then(r => r.json());
  });
</script>
```

**Why avoid:**
- Data not available for SSR
- Flash of loading state
- Can't use SvelteKit's caching
- Harder to handle errors

---

## Performance Considerations

### Server-Side Caching is Free

HTTP caching is handled by the browser—no JavaScript cost:

```typescript
// Zero runtime cost after initial load
setHeaders({ 'Cache-Control': 'public, max-age=300' });
```

### Svelte 5 Runes are Efficient

Runes compile to minimal JavaScript:

```svelte
<!-- Compiles to efficient reactive updates -->
let count = $state(0);
let doubled = $derived(count * 2);
```

### Use $effect Sparingly

Effects run on every reactive dependency change:

```svelte
<!-- ✅ Good: Cleanup subscription -->
$effect(() => {
  const interval = setInterval(() => tick(), 1000);
  return () => clearInterval(interval);
});

<!-- ❌ Avoid: Heavy computation in effect -->
$effect(() => {
  // Don't do this - runs on every change!
  expensiveOperation(data);
});
```

---

## Testing Caching

### 1. Check HTTP Headers

```bash
curl -I https://your-app.com/api/weather

# Should see:
# Cache-Control: public, max-age=300, stale-while-revalidate=600
```

### 2. Test in DevTools

- Open Network tab
- Disable cache to test fresh loads
- Re-enable to test caching
- Look for "(disk cache)" or "(memory cache)" annotations

### 3. Test Manual Refresh

```typescript
// tests/refresh.test.ts
import { test, expect } from '@playwright/test';

test('refresh button updates data', async ({ page }) => {
  await page.goto('/weather/current');

  const before = await page.textContent('[data-testid="temp"]');
  await page.click('button:has-text("Refresh")');
  await page.waitForLoadState('networkidle');

  const after = await page.textContent('[data-testid="temp"]');
  // Data should be fresh (might be same value but timestamp updated)
  expect(page.locator('text="Just now"')).toBeVisible();
});
```

---

## Real-World Example: retro-weather

In the retro-weather app, we implemented caching this way:

### Server (`+layout.server.ts`)
```typescript
setHeaders({
  'Cache-Control': 'public, max-age=300, stale-while-revalidate=600'
});
```

### Client (`+page.svelte`)
```svelte
let dataLoadedAt = $state(Date.now());
let dataAge = $state(0);

$effect(() => {
  const interval = setInterval(() => {
    dataAge = Date.now() - dataLoadedAt;
  }, 1000);
  return () => clearInterval(interval);
});
```

### UI
- Refresh button with loading state
- "Updated 2m 30s ago" indicator
- "Fresh" / "Consider refreshing" badges
- Ticker message: "Data cached for 5 minutes"

**Result:**
- Zero complex caching logic
- Standard HTTP caching
- Clear user feedback
- ~50 lines of code (vs 200+ for custom cache)

---

## Summary

| Approach | When to Use |
|----------|-------------|
| **HTTP Cache Headers** | Always (default) |
| **Svelte 5 Runes** | UI state (age, loading) |
| **`invalidate()`** | Manual refresh |
| **Custom Client Cache** | Rarely (very specific needs) |
| **LocalStorage** | Never for API data |
| **Svelte Stores** | Complex shared state only |

---

## Further Reading

- [SvelteKit Load Functions](https://svelte.dev/docs/kit/load)
- [HTTP Caching (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching)
- [Svelte 5 Runes](https://svelte.dev/docs/svelte/$state)
- [SvelteKit Invalidation](https://svelte.dev/docs/kit/$app-navigation#invalidate)
- [stale-while-revalidate](https://web.dev/stale-while-revalidate/)

---

## Conclusion

**Keep it simple.** The web platform and SvelteKit provide powerful caching out of the box. Use them. Add Svelte 5 runes for reactive UI state. That's 90% of use cases solved with minimal code.

When you find yourself building a custom cache, ask:
1. Can HTTP headers solve this?
2. Can I use SvelteKit's `invalidate()`?
3. Is this actually a UI state problem?

Usually, the answer to at least one is "yes."

Happy caching! 🚀
