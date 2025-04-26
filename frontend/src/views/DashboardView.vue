<script setup>
import { ref, onMounted } from "vue"
import mapboxgl from "mapbox-gl"
import MapboxDraw from "@mapbox/mapbox-gl-draw"
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css"
import axios from "axios"

const mapContainer = ref(null)
const draw = ref(null)
const map = ref(null)

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_API_KEY

const savePolygon = async () => {
    const data = draw.value.getAll()

    console.log("Polygon data:", data)
    
    let geometry = null

    if (data.features.length > 0) {
        geometry = data.features[0].geometry
    }

    try {
        const token = localStorage.getItem("token")
        await axios.post(
            "/api/zones",
            {
                geometry,
                event_types: []
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )
        alert("Polygon saved!")
    } catch (err) {
        console.error(err)
        alert(err.response?.data?.error || "Failed to save polygon")
    }
}

const switchToPanMode = () => {
    map.value.dragPan.enable()
    draw.value.changeMode("simple_select")
    map.value.getCanvas().style.cursor = "grab"
}

const switchToDrawMode = () => {
    map.value.dragPan.disable()
    draw.value.changeMode("draw_polygon")
    map.value.getCanvas().style.cursor = "crosshair"
}

const deleteAll = () => {
    draw.value.deleteAll()
}

onMounted(() => {
    mapboxgl.accessToken = MAPBOX_TOKEN

    map.value = new mapboxgl.Map({
        container: mapContainer.value,
        style: "mapbox://styles/mapbox/streets-v11",
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
    map.value.on("load", switchToPanMode) // Default to pan mode
})
</script>

<template>
    <div class="relative h-screen w-screen overflow-hidden">
        <!-- Top Bar -->
        <div
            class="absolute top-0 left-0 w-full h-14 bg-white shadow flex justify-between items-center px-4 z-10"
        >
            <div class="text-xl font-bold text-theme-primary">GeoAlert</div>
            <router-link to="/history" class="text-theme-primary hover:underline hidden sm:block">
                History
            </router-link>
            <router-link to="/history" class="block sm:hidden text-theme-primary">
                <img
                    src="@/assets/svgs/history-svgrepo-com.svg"
                    alt="History"
                    class="w-6 h-6 filter transition-transform duration-300 hover:scale-125"
                />
            </router-link>
        </div>

        <!-- Sidebar -->
        <div
            class="absolute top-14 left-0 w-16 h-[calc(100vh-3.5rem)] bg-white shadow flex flex-col items-center py-4 space-y-4 z-10"
        >
            <button @click="switchToPanMode" class="hover:text-white p-2 rounded">
                <img
                    src="@/assets/svgs/halt-svgrepo-com.svg"
                    alt="Pan"
                    class="w-6 h-6 filter transition-transform duration-300 hover:scale-125"
                />
            </button>
            <button @click="switchToDrawMode" class="hover:text-white p-2 rounded">
                <img
                    src="@/assets/svgs/edit-svgrepo-com.svg"
                    alt="Edit"
                    class="w-6 h-6 filter transition-transform duration-300 hover:scale-125"
                />
            </button>
            <button @click="deleteAll" class="hover:text-white p-2 rounded">
                <img
                    src="@/assets/svgs/trash-svgrepo-com.svg"
                    alt="Delete"
                    class="w-6 h-6 filter transition-transform duration-300 hover:scale-125"
                />
            </button>
            <button @click="savePolygon" class="hover:text-white p-2 rounded block sm:hidden">
                <img
                    src="@/assets/svgs/save-svgrepo-com.svg"
                    alt="Save"
                    class="w-6 h-6 filter transition-transform duration-300 hover:scale-125"
                />
            </button>
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
