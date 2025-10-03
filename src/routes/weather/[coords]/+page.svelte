<script lang="ts">
  import type { PageData } from './$types';
  import { WeatherNavigation } from '$lib/services/navigation';

  let { data }: { data: PageData } = $props();
  
  const coords = data.data?.coords || '';
</script>

<div class="space-y-6">
  <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
    <h2 class="text-xl font-bold mb-4">Weather Overview</h2>
    <p class="mb-4">Select a weather view:</p>
    
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <button 
        class="bg-blue-500/80 hover:bg-blue-600/80 p-4 rounded-lg transition-colors"
        onclick={() => WeatherNavigation.goToCurrentConditions(coords)}
      >
        <h3 class="font-semibold">Current Conditions</h3>
        <p class="text-sm text-blue-100">Latest observations</p>
      </button>
      
      <button 
        class="bg-green-500/80 hover:bg-green-600/80 p-4 rounded-lg transition-colors"
        onclick={() => WeatherNavigation.goToLocalForecast(coords)}
      >
        <h3 class="font-semibold">Local Forecast</h3>
        <p class="text-sm text-green-100">7-day outlook</p>
      </button>
      
      <button 
        class="bg-orange-500/80 hover:bg-orange-600/80 p-4 rounded-lg transition-colors"
        onclick={() => WeatherNavigation.goToHazards(coords)}
      >
        <h3 class="font-semibold">Weather Hazards</h3>
        <p class="text-sm text-orange-100">Alerts & warnings</p>
      </button>
      
      <button 
        class="bg-purple-500/80 hover:bg-purple-600/80 p-4 rounded-lg transition-colors"
        onclick={() => WeatherNavigation.goToExtendedForecast(coords)}
      >
        <h3 class="font-semibold">Extended Forecast</h3>
        <p class="text-sm text-purple-100">14-day outlook</p>
      </button>
    </div>
  </div>
  
  {#if data.data?.location}
    <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
      <h3 class="text-lg font-semibold mb-2">Location Information</h3>
      <div class="space-y-1 text-sm">
        <p><strong>Grid ID:</strong> {data.data.location.gridId}</p>
        <p><strong>Grid Point:</strong> ({data.data.location.gridX}, {data.data.location.gridY})</p>
        <p><strong>Forecast URL:</strong> <a href={data.data.location.forecast} class="text-blue-300 hover:text-blue-200 underline">View</a></p>
        <p><strong>Stations URL:</strong> <a href={data.data.location.observationStations} class="text-blue-300 hover:text-blue-200 underline">View</a></p>
      </div>
    </div>
  {/if}
</div>