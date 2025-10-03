<script lang="ts">
  import type { PageData } from './$types';
  import { celsiusToFahrenheit, directionToNSEW } from '$lib/index';

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>Type Safety Demo - Retro Weather</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-b from-blue-900 to-blue-600 p-8">
  <div class="max-w-6xl mx-auto">
    <header class="text-center mb-8">
      <h1 class="text-4xl font-bold text-white mb-2">🌤️ Type Safety Demo</h1>
      <p class="text-blue-200 text-lg">OpenAPI → Zod → TypeScript → Svelte</p>
      <p class="text-blue-300 text-sm mt-2">Demonstrating the full type-safe data pipeline</p>
    </header>

    {#if data.error}
      <div class="bg-red-500/20 border border-red-400 rounded-lg p-6 text-white mb-8">
        <h2 class="text-xl font-bold mb-2">❌ Error</h2>
        <p class="mb-2">{data.error.message}</p>
        <p class="text-sm text-red-200">Type: {data.error.type}</p>
        {#if data.error.retryable}
          <button 
            class="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
            onclick={() => window.location.reload()}
          >
            🔄 Retry
          </button>
        {/if}
      </div>
    {:else if data.data}
      <!-- Location Info -->
      <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6">
        <h2 class="text-2xl font-bold text-white mb-4">📍 Location Data</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
          <div>
            <p><strong>Coordinates:</strong> {data.data.coords}</p>
            <p><strong>Grid ID:</strong> {data.data.location.gridId}</p>
            <p><strong>Grid Point:</strong> ({data.data.location.gridX}, {data.data.location.gridY})</p>
          </div>
          <div class="text-sm space-y-1">
            <p><strong>✅ DTO → Domain Mapping:</strong></p>
            <p class="text-green-200">• NWSPointsResponse → LocationInfo</p>
            <p class="text-green-200">• Zod validation passed</p>
            <p class="text-green-200">• Type-safe properties available</p>
          </div>
        </div>
      </div>

      <!-- Stations -->
      <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6">
        <h2 class="text-2xl font-bold text-white mb-4">🏢 Weather Stations</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {#each data.data.stations as station}
            <div class="bg-blue-500/20 rounded p-3 text-white">
              <p class="font-semibold">{station.id}</p>
              <p class="text-sm text-blue-200">{station.name}</p>
            </div>
          {/each}
        </div>
        <div class="mt-4 text-sm text-blue-200">
          <p><strong>✅ Array Mapping:</strong> NWSStationsResponse → Station[]</p>
        </div>
      </div>

      <!-- Current Observation -->
      {#if data.data.observation}
        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6">
          <h2 class="text-2xl font-bold text-white mb-4">🌡️ Current Conditions</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-white">
            {#if data.data.observation.temperatureC !== undefined}
              <div class="text-center">
                <div class="text-3xl font-bold text-yellow-300">
                  {Math.round(celsiusToFahrenheit(data.data.observation.temperatureC))}°F
                </div>
                <div class="text-sm text-blue-200">Temperature</div>
                <div class="text-xs text-green-200">({data.data.observation.temperatureC.toFixed(1)}°C)</div>
              </div>
            {/if}
            
            {#if data.data.observation.relativeHumidity !== undefined}
              <div class="text-center">
                <div class="text-2xl font-bold text-blue-300">
                  {Math.round(data.data.observation.relativeHumidity)}%
                </div>
                <div class="text-sm text-blue-200">Humidity</div>
              </div>
            {/if}
            
            {#if data.data.observation.windSpeedKmh !== undefined && data.data.observation.windDirectionDeg !== undefined}
              <div class="text-center">
                <div class="text-2xl font-bold text-gray-300">
                  {Math.round(data.data.observation.windSpeedKmh * 0.621371)} mph
                </div>
                <div class="text-sm text-blue-200">
                  {directionToNSEW(data.data.observation.windDirectionDeg)} Wind
                </div>
              </div>
            {/if}
            
            {#if data.data.observation.textDescription}
              <div class="text-center">
                <div class="text-lg font-semibold text-white">
                  {data.data.observation.textDescription}
                </div>
                <div class="text-sm text-blue-200">Conditions</div>
              </div>
            {/if}
          </div>
          
          <div class="mt-4 text-sm text-blue-200">
            <p><strong>✅ Complex Mapping:</strong> NWSObservationResponse → Observation</p>
            <p class="text-green-200">• Nested properties extracted safely</p>
            <p class="text-green-200">• Unit conversions applied</p>
            <p class="text-green-200">• Null values handled gracefully</p>
          </div>
        </div>
      {:else}
        <div class="bg-yellow-500/20 border border-yellow-400 rounded-lg p-4 mb-6 text-white">
          <p>⚠️ No current observation data available (station may be offline)</p>
        </div>
      {/if}

      <!-- Forecast -->
      <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6">
        <h2 class="text-2xl font-bold text-white mb-4">📅 Forecast Preview</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {#each data.data.forecast as period}
            <div class="bg-gradient-to-b from-blue-500/30 to-blue-600/30 rounded-lg p-4 text-white">
              <h3 class="font-bold text-lg mb-2">{period.dayName}</h3>
              <div class="text-2xl font-bold mb-2 {period.isDaytime ? 'text-yellow-300' : 'text-blue-300'}">
                {period.temperature}°F
              </div>
              <p class="text-sm text-blue-100 mb-2">{period.shortForecast}</p>
              <div class="text-xs text-blue-200">
                {period.isDaytime ? '☀️ Day' : '🌙 Night'}
              </div>
            </div>
          {/each}
        </div>
        
        <div class="mt-4 text-sm text-blue-200">
          <p><strong>✅ Array Processing:</strong> NWSForecastResponse → ForecastDay[]</p>
          <p class="text-green-200">• Period data normalized</p>
          <p class="text-green-200">• Day/night periods handled</p>
        </div>
      </div>

      <!-- Type Safety Demo -->
      <div class="bg-green-500/20 border border-green-400 rounded-lg p-6">
        <h2 class="text-2xl font-bold text-white mb-4">✅ Type Safety Verification</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-white">
          <div>
            <h3 class="font-semibold mb-2 text-green-300">🛡️ Runtime Validation</h3>
            <ul class="text-sm space-y-1 text-green-100">
              <li>• Zod schemas validate API responses</li>
              <li>• Invalid data caught before reaching UI</li>
              <li>• Detailed error information available</li>
              <li>• Graceful fallbacks for missing data</li>
            </ul>
          </div>
          <div>
            <h3 class="font-semibold mb-2 text-green-300">📋 Compile-time Safety</h3>
            <ul class="text-sm space-y-1 text-green-100">
              <li>• TypeScript ensures property access safety</li>
              <li>• IDE autocomplete for all domain properties</li>
              <li>• Refactoring support across entire codebase</li>
              <li>• No typos in property names possible</li>
            </ul>
          </div>
        </div>
        
        <div class="mt-4 p-4 bg-black/20 rounded text-sm font-mono text-green-200">
          <p>// All of this data is fully typed and validated:</p>
          <p>data.data.location.gridId: string</p>
          <p>data.data.observation?.temperatureC: number | undefined</p>
          <p>data.data.forecast: ForecastDay[]</p>
        </div>
      </div>
    {:else}
      <div class="text-center text-white">
        <div class="animate-spin text-6xl mb-4">🌀</div>
        <p>Loading demo data...</p>
      </div>
    {/if}
  </div>
</div>