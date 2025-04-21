<script setup>
import { ref } from 'vue';

// Sample alert data - this would normally come from your API
const alerts = ref([
  {
    id: 1,
    type: 'Earthquake',
    location: 'Los Angeles, CA',
    magnitude: 4.5,
    time: '2023-07-15 14:30:22',
    status: 'Active'
  },
  {
    id: 2,
    type: 'Volcanic Activity',
    location: 'Mount Fuji, Japan',
    severity: 'Moderate',
    time: '2023-07-14 23:15:45',
    status: 'Monitoring'
  },
  {
    id: 3,
    type: 'Tsunami Warning',
    location: 'Pacific Coast',
    severity: 'High',
    time: '2023-07-15 08:45:12',
    status: 'Active'
  }
]);
</script>

<template>
  <div class="py-8">
    <div class="container mx-auto px-4">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-theme-primary">Your Dashboard</h1>
        <p class="text-gray-600 mt-2">Monitor geological events and manage your alerts</p>
      </div>
      
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-xl font-semibold mb-4">Current Alerts</h2>
        
        <div class="overflow-x-auto">
          <table class="min-w-full bg-white">
            <thead>
              <tr class="bg-gray-100 text-gray-700">
                <th class="py-3 px-4 text-left">Type</th>
                <th class="py-3 px-4 text-left">Location</th>
                <th class="py-3 px-4 text-left">Details</th>
                <th class="py-3 px-4 text-left">Time</th>
                <th class="py-3 px-4 text-left">Status</th>
                <th class="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="alert in alerts" :key="alert.id" class="border-b border-gray-200 hover:bg-gray-50">
                <td class="py-3 px-4">{{ alert.type }}</td>
                <td class="py-3 px-4">{{ alert.location }}</td>
                <td class="py-3 px-4">
                  <span v-if="alert.magnitude">Magnitude {{ alert.magnitude }}</span>
                  <span v-if="alert.severity">Severity: {{ alert.severity }}</span>
                </td>
                <td class="py-3 px-4">{{ alert.time }}</td>
                <td class="py-3 px-4">
                  <span 
                    :class="{
                      'px-2 py-1 rounded text-xs font-medium': true,
                      'bg-red-100 text-red-800': alert.status === 'Active',
                      'bg-yellow-100 text-yellow-800': alert.status === 'Monitoring',
                      'bg-green-100 text-green-800': alert.status === 'Resolved'
                    }"
                  >
                    {{ alert.status }}
                  </span>
                </td>
                <td class="py-3 px-4">
                  <Button class="text-sm">View Details</Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div class="grid md:grid-cols-2 gap-6">
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold mb-4">Alert Settings</h2>
          <p class="text-gray-600 mb-4">Configure your notification preferences and alert thresholds</p>
          <Button>Configure Settings</Button>
        </div>
        
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold mb-4">Monitoring Areas</h2>
          <p class="text-gray-600 mb-4">Manage your locations of interest for geological events</p>
          <Button>Manage Locations</Button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom styles for Dashboard if needed */
</style> 