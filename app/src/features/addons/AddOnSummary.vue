<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
}>();
</script>

<template>
  <div class="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
    <h2 class="text-sm font-medium text-zinc-900 dark:text-white">{{ title }}</h2>
    <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{{ description }}</p>
  </div>
</template>
