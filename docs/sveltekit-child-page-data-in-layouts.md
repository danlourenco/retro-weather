# Accessing Child Page Data in SvelteKit Layouts

## The Problem

In SvelteKit, when you have nested routes with layouts and pages, a common pattern is wanting to display page-specific data in the parent layout. For example, you might want to show a page title in your layout's header component, where the title changes based on which child page is currently active.

However, **child page data is not automatically merged into the parent layout's data prop**. This is a common gotcha for developers new to SvelteKit's data flow.

## Example Scenario

Consider this route structure:

```
src/routes/
├── weather/
│   └── [coords]/
│       ├── +layout.svelte          # Parent layout
│       ├── +layout.server.ts       # Parent layout data
│       └── current-conditions/
│           ├── +page.svelte        # Child page
│           └── +page.server.ts     # Child page data
```

### Child Page Server Load (current-conditions/+page.server.ts)

```typescript
export const load: PageServerLoad = async ({ parent }) => {
  const parentData = await parent();

  // ... fetch data ...

  return {
    data: {
      station,
      observation,
      coords,
      pageTitle: 'CURRENT CONDITIONS'  // ← We want this in the layout!
    }
  };
};
```

### Parent Layout (Incorrect Approach)

```svelte
<script lang="ts">
  import type { LayoutData } from './$types';

  let { data, children } = $props();

  // ❌ This won't work! Child page data is not in layout's data prop
  const pageTitle = $derived(data.data?.pageTitle || 'Weather');
</script>

<AppHeader {pageTitle} />
```

**Why this doesn't work:** The `data` prop in the layout only contains data from the layout's own `+layout.server.ts` file, not from child pages.

## The Solution: Use the `$page` Store

SvelteKit provides a `$page` store that contains the **current page's data**, which includes both layout data and the active page's data merged together.

### Parent Layout (Correct Approach)

```svelte
<script lang="ts">
  import type { LayoutData } from './$types';
  import { page } from '$app/stores';  // ← Import the page store

  let { data, children } = $props();

  // ✅ Access child page data via $page store
  const pageTitle = $derived($page.data?.data?.pageTitle || 'Weather');
</script>

<AppHeader {pageTitle} />
```

## How the `$page` Store Works

The `$page` store is a reactive store that contains information about the current page, including:

- `$page.data` - Merged data from all layouts and the current page
- `$page.params` - URL parameters
- `$page.route` - Route information
- `$page.url` - Full URL object
- `$page.status` - HTTP status code
- `$page.error` - Error object (if any)

### Data Structure in `$page.data`

When you access `$page.data`, it contains a merged object with data from:

1. Root layout (`src/routes/+layout.server.ts`)
2. Parent layout(s) (`src/routes/weather/[coords]/+layout.server.ts`)
3. Current page (`src/routes/weather/[coords]/current-conditions/+page.server.ts`)

In our example:
- Layout returns: `{ data: { location, coords, ... } }`
- Page returns: `{ data: { station, observation, pageTitle, ... } }`
- `$page.data` contains both merged together

## Alternative Approaches

### 1. Use Shared State (Svelte 5 Runes)

You can use Svelte 5's state runes with context to share state between child pages and parent layouts:

```typescript
// lib/stores/page-context.svelte.ts
export class PageContext {
  pageTitle = $state('Weather');

  setTitle(title: string) {
    this.pageTitle = title;
  }
}
```

```svelte
<!-- +layout.svelte -->
<script lang="ts">
  import { setContext } from 'svelte';
  import { PageContext } from '$lib/stores/page-context.svelte';

  const pageContext = new PageContext();
  setContext('page', pageContext);

  let { children } = $props();
</script>

<AppHeader pageTitle={pageContext.pageTitle} />
{@render children()}
```

```svelte
<!-- current-conditions/+page.svelte -->
<script lang="ts">
  import { getContext, onMount } from 'svelte';
  import type { PageContext } from '$lib/stores/page-context.svelte';

  const pageContext = getContext<PageContext>('page');

  onMount(() => {
    pageContext.setTitle('CURRENT CONDITIONS');
  });
</script>
```

**Pros:** More control, can update dynamically
**Cons:** More boilerplate, client-side only

### 2. Use URL-Based Logic

If page titles are predictable from the URL, you can derive them in the layout:

```svelte
<script lang="ts">
  import { page } from '$app/stores';

  const pageTitle = $derived(() => {
    const path = $page.url.pathname;
    if (path.includes('current-conditions')) return 'CURRENT CONDITIONS';
    if (path.includes('forecast')) return 'FORECAST';
    return 'Weather';
  });
</script>
```

**Pros:** Simple, no data passing needed
**Cons:** Tight coupling between URLs and titles, harder to maintain

### 3. Return Page Title from Parent Layout

Instead of having child pages set the title, have the parent layout's server load function determine it:

```typescript
// +layout.server.ts
export const load: LayoutServerLoad = async ({ url }) => {
  let pageTitle = 'Weather';

  if (url.pathname.includes('current-conditions')) {
    pageTitle = 'CURRENT CONDITIONS';
  } else if (url.pathname.includes('forecast')) {
    pageTitle = 'FORECAST';
  }

  return {
    data: {
      // ... other data
      pageTitle
    }
  };
};
```

**Pros:** Available in layout's own data prop
**Cons:** Parent needs to know about all child routes, violates separation of concerns

## Best Practices

1. **Use `$page` store for simple cases** - It's the most straightforward and idiomatic SvelteKit approach
2. **Use context for complex shared state** - When you need more than just data passing
3. **Keep layouts generic** - Layouts shouldn't need to know about specific child pages
4. **Document data contracts** - Make it clear what data child pages should provide

## Common Pitfalls

1. **Forgetting the reactive `$` prefix** - `page.data` won't be reactive, use `$page.data`
2. **Assuming layout data includes child data** - It doesn't! Use `$page.data` instead
3. **Not handling undefined values** - Always provide fallbacks: `$page.data?.pageTitle || 'Default'`
4. **Using stores in server-side code** - Stores like `$page` only work in components, not in `+page.server.ts`

## TypeScript Considerations

To get proper typing for `$page.data`, you can create a type that represents the merged data:

```typescript
// src/app.d.ts or a types file
import type { LayoutData } from './routes/weather/[coords]/$types';
import type { PageData as CurrentConditionsData } from './routes/weather/[coords]/current-conditions/$types';

// This is just for documentation - $page.data is dynamically typed
type MergedPageData = LayoutData & CurrentConditionsData;
```

However, SvelteKit's generated types already handle this for you in most cases.

## Conclusion

When you need to access child page data in a parent layout:

✅ **Do:** Use the `$page` store from `$app/stores`
❌ **Don't:** Expect child data to be in the layout's `data` prop

The `$page` store is your friend for accessing the current page's merged data, including everything from child pages.

## References

- [SvelteKit Documentation: $app/stores](https://kit.svelte.dev/docs/modules#$app-stores)
- [SvelteKit Documentation: Loading data](https://kit.svelte.dev/docs/load)
- [Svelte 5 Documentation: Runes](https://svelte.dev/docs/svelte)
