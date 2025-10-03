# Type Safety Demo

This demo showcases the complete type-safe architecture using OpenAPI → Zod → TypeScript → Svelte.

## 🚀 Quick Start

1. **Start the dev server**: `npm run dev`
2. **View the demo**: Visit [http://localhost:5174/demo](http://localhost:5174/demo)
3. **Run tests**: `npm run test:unit`

## 🏗️ Architecture Overview

### Data Flow Pipeline
```
NWS OpenAPI Spec → Generated Types & Zod Schemas → DTO Validation → Domain Mapping → Type-Safe UI
```

### Key Components

- **`src/lib/generated/nws.ts`** - Auto-generated from OpenAPI spec (`npm run generate:nws`)
- **`src/lib/validators/nws.ts`** - Zod schemas for runtime validation  
- **`src/lib/types/domain.ts`** - Clean internal domain models
- **`src/lib/mappers/nws.ts`** - DTO → Domain converters
- **`src/lib/services/nws.ts`** - Type-safe API client with retry logic

### Benefits Demonstrated

✅ **Compile-time Safety**: TypeScript catches errors before runtime  
✅ **Runtime Validation**: Zod validates API responses  
✅ **Clean Architecture**: DTOs never leak into UI components  
✅ **Error Resilience**: Proper retry logic and typed error handling  
✅ **Testability**: Pure mapper functions with comprehensive tests  
✅ **Maintainability**: Generated types stay in sync with API changes  

## 🧪 Testing

The demo includes comprehensive tests:

- **Mapper Tests**: `src/lib/mappers/nws.test.ts` (6 tests)
- **Validator Tests**: `src/lib/validators/nws.test.ts` (10 tests)

All tests validate the DTO → Domain mapping and Zod validation logic.

## 📊 Demo Features

The `/demo` page demonstrates:

1. **Location Data**: NWS grid point information
2. **Weather Stations**: Available observation stations
3. **Current Conditions**: Latest weather observations with unit conversions
4. **Forecast Preview**: Upcoming weather periods
5. **Type Safety Verification**: Shows compile-time and runtime safety

## 🔄 Regenerating Types

When the NWS API changes, simply run:

```bash
npm run generate:nws
```

This updates types while preserving your domain models and mappers.

---

This architecture provides a solid foundation for building robust, type-safe weather applications that won't break when external APIs evolve.