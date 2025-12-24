<template>
  <div>
    <h1>EVENTS</h1>
    <h2>Available Events</h2>
    <ul>
      <li v-for="event in events" :key="event.id">
        {{ event.name }} - {{ event.status }} - {{ event.createdAt }} - {{ event.updatedAt }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { GetAllEvents } from '../../wailsjs/go/system/EventHandler';

const events = ref([])

async function getEvents() {
  try {
    const result = await GetAllEvents();
    events.value = result
  } catch (err) {
    console.error("Failed to retrieve events:", err)
  }
}

onMounted(() => {
  getEvents();
})
</script>
