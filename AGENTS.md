# AGENTS.md

This file provides guidance for AI coding agents (like Claude Code, GitHub Copilot, Cursor, etc.) working on this project.

## Project Overview

**retro-weather** is a SvelteKit-based weather application with a retro design aesthetic.

- **Framework**: SvelteKit (Svelte 5)
- **Styling**: Tailwind CSS v4 with @tailwindcss/forms and @tailwindcss/typography
- **Language**: TypeScript
- **Build Tool**: Vite
- **Testing**: Vitest (unit), Playwright (e2e), Storybook with Vitest addon
- **Code Quality**: ESLint, Prettier

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

## Before Committing

1. Run `npm run format` to format code
2. Run `npm run lint` to check for linting issues
3. Run `npm run check` to type-check
4. Run `npm run test` to ensure all tests pass

## Helpful Resources

- [SvelteKit Documentation](https://svelte.dev/docs/kit)
- [Svelte 5 Documentation](https://svelte.dev/docs/svelte)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
