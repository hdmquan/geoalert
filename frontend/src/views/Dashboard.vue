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

    // TODO: replace with real backend POST call
    alert('Polygon saved! (Check console for data)')
}

onMounted(() => {
    mapboxgl.accessToken = MAPBOX_TOKEN

    map.value = new mapboxgl.Map({
        container: mapContainer.value,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [144.9631, -37.8136], // Melbourne center
        zoom: 8
    })

    draw.value = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
            polygon: true,
            trash: true
        },
        defaultMode: 'draw_polygon'
    })

    map.value.addControl(draw.value)
})
</script>

<template>
  <div class="relative h-screen">
    <div ref="mapContainer" class="h-full w-full"></div>

    <button 
      @click="savePolygon" 
      class="absolute bottom-6 right-6 bg-theme-primary text-white px-4 py-2 rounded shadow-lg hover:bg-opacity-90"
    >
      Save Polygon
    </button>
  </div>
</template>
