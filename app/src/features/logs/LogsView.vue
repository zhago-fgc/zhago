<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import type { LogEntry } from '../../shared/types/log';
import { listLogs } from './api';
import LogFilters from './LogFilters.vue';
import LogTable from './LogTable.vue';

const logs = ref<LogEntry[]>([]);
const level = ref<'all' | LogEntry['level']>('all');
const query = ref('');
let stream: EventSource | undefined;

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  return logs.value.filter((entry) => {
    if (level.value !== 'all' && entry.level !== level.value) return false;
    if (!q) return true;
    return `${entry.scope} ${entry.message}`.toLowerCase().includes(q);
  });
});

async function loadLogs() {
  logs.value = await listLogs();
}

onMounted(async () => {
  await loadLogs();
  stream = new EventSource('/api/bus/log/stream');
  stream.onmessage = (event) => {
    const data = JSON.parse(event.data) as LogEntry[] | LogEntry;
    if (Array.isArray(data)) {
      logs.value = data;
      return;
    }
    logs.value = [...logs.value.slice(-499), data];
  };
});

onUnmounted(() => stream?.close());
</script>

<template>
  <div class="p-6 max-w-6xl">
    <div class="mb-6">
      <h1 class="text-xl font-semibold text-zinc-900 dark:text-white mb-1">Logs</h1>
      <p class="text-sm text-zinc-500 dark:text-zinc-400">
        Runtime and add-on logs from the local Zhago data directory.
      </p>
    </div>

    <LogFilters v-model:level="level" v-model:query="query" @refresh="loadLogs" />
    <LogTable :entries="filtered" />
  </div>
</template>
