<script setup lang="ts">
import { moduleLabel } from '../../shared/composables/moduleLabel';
import type { ModuleManifest } from '../../shared/types/module';

defineProps<{ module: ModuleManifest }>();
</script>

<template>
  <article
    class="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 bg-white dark:bg-zinc-950"
  >
    <div class="flex items-start justify-between gap-3">
      <div>
        <h3 class="text-sm font-medium text-zinc-900 dark:text-white">{{ moduleLabel(module) }}</h3>
        <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
          {{ module.name }} · v{{ module.version }}
        </p>
      </div>
      <span class="text-[10px] uppercase text-zinc-500 dark:text-zinc-600">{{ module.type }}</span>
    </div>

    <div v-if="module.tags?.length" class="mt-3 flex flex-wrap gap-1">
      <span
        v-for="tag in module.tags"
        :key="tag"
        class="rounded bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 text-[10px] text-zinc-500 dark:text-zinc-500"
      >
        {{ tag }}
      </span>
    </div>

    <div class="mt-4 flex gap-2">
      <RouterLink
        v-if="module.ui?.cockpit"
        :to="`/m/${module.name}`"
        class="rounded-md bg-zinc-900 dark:bg-white px-3 py-1.5 text-sm text-white dark:text-zinc-950"
      >
        Open
      </RouterLink>
      <button
        type="button"
        disabled
        class="rounded-md border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 text-sm text-zinc-400 dark:text-zinc-600 cursor-not-allowed"
      >
        Remove
      </button>
    </div>
  </article>
</template>
