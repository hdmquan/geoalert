<script setup>
import { ref, onMounted } from 'vue'
import mapboxgl from 'mapbox-gl'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'

const mapContainer = ref(null)
const draw = ref(null)
const map = ref(null)

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_API_KEY

const savePolygon = async () => {
    const data = draw.value.getAll()
    if (data.features.length === 0) {
        alert('No polygon drawn!')
        return
    }

    const polygon = data.features[0]
    console.log('Polygon to save:', polygon)

    // TODO: real backend POST call
    alert('Polygon saved! (Check console for data)')
}

const switchToPanMode = () => {
    map.value.dragPan.enable()
    draw.value.changeMode('simple_select')
    map.value.getCanvas().style.cursor = 'grab'
}

const switchToDrawMode = () => {
    map.value.dragPan.disable()
    draw.value.changeMode('draw_polygon')
    map.value.getCanvas().style.cursor = 'crosshair'
}

const deleteAll = () => {
    draw.value.deleteAll()
}

onMounted(() => {
    mapboxgl.accessToken = MAPBOX_TOKEN

    map.value = new mapboxgl.Map({
        container: mapContainer.value,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [144.9631, -37.8136], // Melbourne
        zoom: 8
    })

    draw.value = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
            polygon: false,
            trash: false
        }
    })

    map.value.addControl(draw.value)
    map.value.on('load', switchToPanMode) // Default to pan mode
})
</script>

<template>
  <div class="relative h-screen w-screen overflow-hidden">

    <!-- Top Bar -->
    <div class="absolute top-0 left-0 w-full h-14 bg-white shadow flex justify-between items-center px-4 z-10">
      <div class="text-xl font-bold text-theme-primary">GeoAlert</div>
      <router-link 
        to="/history" 
        class="text-theme-primary hover:underline hidden sm:block"
      >
        History
      </router-link>
      <router-link 
        to="/history" 
        class="block sm:hidden text-theme-primary"
      >
        History
      </router-link>
    </div>

    <!-- Sidebar -->
    <div class="absolute top-14 left-0 w-16 bg-white shadow flex flex-col items-center py-4 space-y-4 z-10">
      <button @click="switchToPanMode" class="hover:bg-theme-primary hover:text-white p-2 rounded">Pan</button>
      <button @click="switchToDrawMode" class="hover:bg-theme-primary hover:text-white p-2 rounded">Edit</button>
      <button @click="deleteAll" class="hover:bg-theme-primary hover:text-white p-2 rounded">Delete</button>
      <button @click="savePolygon" class="hover:bg-theme-primary hover:text-white p-2 rounded block sm:hidden">Save</button>
    </div>

    <!-- Map -->
    <div ref="mapContainer" class="h-full w-full"></div>

    <!-- Save Button (Desktop Only) -->
    <button 
      @click="savePolygon" 
      class="hidden sm:block absolute bottom-6 right-6 bg-theme-primary text-white px-4 py-2 rounded shadow-lg hover:bg-opacity-90"
    >
      Save Polygon
    </button>
  </div>
</template>
