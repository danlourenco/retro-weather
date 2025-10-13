# 🌤️ Retro Weather

A beautifully nostalgic weather application built with modern web technology.

[![Built with SvelteKit](https://img.shields.io/badge/SvelteKit-FF3E00?style=flat&logo=svelte&logoColor=white)](https://kit.svelte.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

## ✨ Features

- 🎨 **Retro Design** - Classic weather interface with modern UX
- 🌡️ **Current Conditions** - Real-time weather data from NOAA
- 📅 **Multi-Day Forecasts** - Plan ahead with extended forecasts
- ⚠️ **Weather Alerts** - Stay informed about hazardous conditions
- 📍 **Smart Location** - Browser geolocation or zipcode lookup
- 🎯 **Type-Safe** - Full TypeScript with OpenAPI → Zod pipeline

## 🚀 Quick Start

```sh
# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
npm run dev -- --open
```

Visit [http://localhost:5173](http://localhost:5173) to see your app.

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm test` | Run all tests |
| `npm run lint` | Check code quality |
| `npm run format` | Format code with Prettier |
| `npm run storybook` | Launch Storybook UI explorer |

## 🏗️ Tech Stack

- **Framework**: [SvelteKit](https://kit.svelte.dev/) (Svelte 5)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Testing**: [Vitest](https://vitest.dev/) + [Playwright](https://playwright.dev/)
- **UI Development**: [Storybook](https://storybook.js.org/)
- **Data Source**: [National Weather Service API](https://www.weather.gov/documentation/services-web-api)

## 📚 Documentation

For detailed information about project structure, API integrations, and development guidelines, see [AGENTS.md](./AGENTS.md).

## 🧪 Testing

```sh
# Unit tests
npm run test:unit

# E2E tests
npm run test:e2e

# Watch mode
npm run test:unit -- --watch
```

## 🎨 Component Development

We use Storybook for component development and documentation:

```sh
# Start Storybook
npm run storybook

# Build Storybook
npm run build-storybook
```

## 🌐 API Integration

Weather data is sourced from the [National Weather Service API](https://www.weather.gov/documentation/services-web-api) with a fully type-safe integration:

1. OpenAPI spec → Auto-generated types
2. Zod validators → Runtime validation
3. Domain mappers → Clean internal models

```sh
# Regenerate API types
npm run generate:nws
```

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Format**: Run `npm run format` before committing
2. **Lint**: Ensure `npm run lint` passes
3. **Test**: Run `npm test` to verify all tests pass
4. **Commits**: Use [Conventional Commits](https://www.conventionalcommits.org/) format

Example: `feat(ui): add temperature unit toggle`

## 📄 License

This project is private and not licensed for public use.

## 🙏 Acknowledgments

- Heavily inspired by [netbymatt/ws4kp](https://github.com/netbymatt/ws4kp) - a fantastic weather display project that demonstrated the potential of the National Weather Service API
- Weather data provided by [NOAA's National Weather Service](https://www.weather.gov/)
- Geocoding by [Zippopotam.us](https://www.zippopotam.us/)
