<template>
  <div class="flex h-screen bg-zinc-900 text-white overflow-hidden">
    <Navbar />
    <main class="flex-1 overflow-y-auto">
      <RouterView />
    </main>
  </div>
</template>

<script lang="ts" setup>
import { RouterView } from 'vue-router';
import Navbar from './components/Navbar.vue';
</script>
