<script setup lang="ts">
import type { LogEntry } from '../../shared/types/log';

defineProps<{ entries: LogEntry[] }>();

function timeLabel(time: number): string {
  return new Date(time).toLocaleString();
}

function levelClass(entry: LogEntry): string {
  if (entry.level === 'error') return 'text-red-600 dark:text-red-400';
  if (entry.level === 'warn') return 'text-amber-600 dark:text-amber-400';
  return 'text-cyan-600 dark:text-cyan-400';
}
</script>

<template>
  <div class="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
    <div
      class="grid min-w-[42rem] grid-cols-[11rem_5rem_8rem_1fr] gap-3 px-4 py-2 text-[10px] uppercase tracking-widest text-zinc-400 dark:text-zinc-600 bg-zinc-50 dark:bg-zinc-900/50"
    >
      <div>Time</div>
      <div>Level</div>
      <div>Source</div>
      <div>Message</div>
    </div>

    <div v-if="entries.length" class="divide-y divide-zinc-200 dark:divide-zinc-800">
      <div
        v-for="(entry, index) in entries"
        :key="`${entry.time}-${index}`"
        class="grid min-w-[42rem] grid-cols-[11rem_5rem_8rem_1fr] gap-3 px-4 py-2 text-sm"
      >
        <div class="text-zinc-500 dark:text-zinc-500 whitespace-nowrap">
          {{ timeLabel(entry.time) }}
        </div>
        <div :class="['uppercase font-medium', levelClass(entry)]">{{ entry.level }}</div>
        <div class="text-zinc-600 dark:text-zinc-400 truncate">{{ entry.scope }}</div>
        <div class="text-zinc-900 dark:text-zinc-100 font-mono text-xs break-words">
          {{ entry.message }}
        </div>
      </div>
    </div>

    <p v-else class="p-4 text-sm text-zinc-500 dark:text-zinc-600">
      No logs match the current filters.
    </p>
  </div>
</template>
