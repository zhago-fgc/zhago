<script setup lang="ts">
import type { LogEntry } from '../../shared/types/log';

defineProps<{
  level: 'all' | LogEntry['level'];
  query: string;
}>();

const emit = defineEmits<{
  'update:level': ['all' | LogEntry['level']];
  'update:query': [string];
  refresh: [];
}>();
</script>

<template>
  <div class="flex flex-col sm:flex-row gap-2 mb-4">
    <input
      :value="query"
      type="search"
      placeholder="Search logs"
      class="w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-white outline-none focus:border-zinc-400 dark:focus:border-zinc-600"
      @input="emit('update:query', ($event.target as HTMLInputElement).value)"
    />
    <select
      :value="level"
      class="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-white outline-none focus:border-zinc-400 dark:focus:border-zinc-600"
      @change="
        emit(
          'update:level',
          ($event.target as HTMLSelectElement).value as 'all' | LogEntry['level'],
        )
      "
    >
      <option value="all">All levels</option>
      <option value="info">Info</option>
      <option value="warn">Warn</option>
      <option value="error">Error</option>
    </select>
    <button
      type="button"
      class="rounded-md border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900"
      @click="emit('refresh')"
    >
      Refresh
    </button>
  </div>
</template>
