# AGENTS.md

This file provides guidance for AI coding agents (like Claude Code, GitHub Copilot, Cursor, etc.) working on this project.

You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

## Available MCP Tools:

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.

## Project Overview

**retro-weather** is a SvelteKit-based weather application with a retro design aesthetic.

- **Framework**: SvelteKit (Svelte 5)
- **Styling**: Tailwind CSS v4 with @tailwindcss/forms and @tailwindcss/typography
- **Language**: TypeScript
- **Build Tool**: Vite
- **Testing**: Vitest (unit), Playwright (e2e), Storybook with Vitest addon
- **Code Quality**: ESLint, Prettier

## External Services & APIs

The application integrates with the following external services:

### National Weather Service (weather.gov)

- **Purpose**: Primary weather data source
- **API Documentation**: <https://www.weather.gov/documentation/services-web-api>
- **Features Used**:
  - Grid points API for location-specific forecasts
  - Observation stations and current conditions
  - Multi-day forecasts
  - Weather alerts and hazards
- **Authentication**: None required (public API)
- **Type Safety**: Full OpenAPI → Zod → TypeScript pipeline
- **Rate Limiting**: Be respectful of API limits
- **Generated Types**: `src/lib/generated/nws.ts` (auto-generated from OpenAPI spec)

### Zippopotam.us

- **Purpose**: Zipcode to coordinates geocoding
- **API Documentation**: <https://www.zippopotam.us/>
- **Endpoint**: `https://api.zippopotam.us/us/{zipcode}`
- **Features Used**:
  - Convert 5-digit US zipcodes to latitude/longitude
  - Retrieve city and state names
- **Authentication**: None required (free service)
- **Rate Limiting**: No strict limits for reasonable use
- **Coverage**: 43,000+ US zipcodes
- **Utility Functions**: `src/lib/utils/geolocation.ts`

### Browser Geolocation API

- **Purpose**: Get user's current location
- **Documentation**: <https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API>
- **Features Used**:
  - `navigator.geolocation.getCurrentPosition()`
  - High accuracy positioning
  - Permission-based access
- **Privacy**: Requires user consent
- **Fallback**: Manual zipcode entry available
- **Utility Functions**: `src/lib/utils/geolocation.ts`

### API Integration Patterns

The project uses a type-safe architecture for API integration:

1. **OpenAPI Spec** → Auto-generate types (`npm run generate:nws`)
2. **Zod Validators** → Runtime validation of API responses
3. **Domain Mappers** → Transform DTOs to internal models
4. **Service Layer** → Encapsulated API clients with error handling
5. **Utility Layer** → Reusable location/geocoding functions

**Key Files**:

- `src/lib/generated/nws.ts` - Auto-generated NWS API types
- `src/lib/validators/nws.ts` - Zod validation schemas
- `src/lib/mappers/nws.ts` - DTO to domain converters
- `src/lib/services/nws.ts` - NWS API service client
- `src/lib/utils/geolocation.ts` - Geocoding utilities
- `src/lib/utils/http.ts` - HTTP retry logic

## Development Commands

```sh
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build
npm run test             # Run all tests (unit + e2e)
npm run test:unit        # Run Vitest unit tests
npm run test:e2e         # Run Playwright e2e tests
npm run lint             # Check code with Prettier and ESLint
npm run format           # Format code with Prettier
npm run check            # Type-check with svelte-check
npm run storybook        # Start Storybook on port 6006
npm run build-storybook  # Build Storybook
```

## Project Structure

```
retro-weather/
├── src/
│   ├── routes/          # SvelteKit routes
│   ├── lib/             # Shared libraries and components
│   ├── stories/         # Storybook stories
│   └── app.css          # Global styles
├── e2e/                 # End-to-end tests
├── static/              # Static assets
└── tests/               # Unit tests
```

## Code Style & Guidelines

### General

- Use TypeScript for all new files
- Follow ESLint and Prettier configurations
- Write tests for new features and bug fixes
- Use Svelte 5 syntax and features

### Components

- Place reusable components in `src/lib/`
- Create Storybook stories for UI components in `src/stories/`
- Use TypeScript for component props

### Storybook Stories

- Use `@storybook/addon-svelte-csf` for writing stories
- When using `defineMeta({ component: MyComponent })`, the `<Story>` component automatically renders `MyComponent`
- **Do NOT** wrap Story content in the component again - it's redundant
- Pass children directly within `<Story>` tags; they're automatically passed to the component
- Example:

  ```svelte
  <script module>
  	const { Story } = defineMeta({
  		component: WeatherPanel
  	});
  </script>

  <!-- ✅ Correct -->
  <Story name="Default">
  	<div>Content here</div>
  </Story>

  <!-- ❌ Wrong - redundant wrapper -->
  <Story name="Default">
  	<WeatherPanel>
  		<div>Content here</div>
  	</WeatherPanel>
  </Story>
  ```

### Styling

- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Leverage Tailwind plugins (@tailwindcss/forms, @tailwindcss/typography)
- Keep custom CSS minimal; prefer Tailwind utilities

### Testing

- Unit tests: Vitest (`src/**/*.spec.ts`)
- E2E tests: Playwright (`e2e/**/*.test.ts`)
- Component tests: Storybook with Vitest addon
- Run tests before committing

## Important Notes

- The project uses Tailwind CSS v4 (latest major version)
- Svelte 5 uses runes syntax (`$state`, `$derived`, `$effect`, etc.)
- SvelteKit uses file-based routing in `src/routes/`
- Static assets go in the `static/` directory

## Git Commit Guidelines

**Always use Conventional Commits format:**

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style/formatting (no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `test`: Adding/updating tests
- `chore`: Maintenance tasks, dependencies

**Examples:**

- `feat(weather): add 5-day forecast display`
- `fix(ui): correct temperature unit toggle`
- `docs: update README with API usage`
- `test(weather): add unit tests for data fetching`

## Before Committing

1. Run `npm run format` to format code
2. Run `npm run lint` to check for linting issues
3. Run `npm run check` to type-check
4. Run `npm run test` to ensure all tests pass
5. Write a conventional commit message

## Helpful Resources

- [SvelteKit Documentation](https://svelte.dev/docs/kit)
- [Svelte 5 Documentation](https://svelte.dev/docs/svelte)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
