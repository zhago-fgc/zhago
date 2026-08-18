<script setup lang="ts">
import { inject, computed, type Ref } from 'vue';
import { moduleLabel } from '../../shared/composables/moduleLabel';
import type { ModuleManifest } from '../../shared/types/module';

const modules = inject<Ref<ModuleManifest[]>>('modules')!;

// Same filter as the sidebar's Modules section — a plugin with no cockpit
// has nothing to click into here either.
const withCockpit = computed(() => modules.value.filter((m) => m.ui?.cockpit));
</script>

<template>
  <div class="p-4 sm:p-6 max-w-3xl">
    <h1 class="text-xl font-semibold text-zinc-900 dark:text-white mb-1">Zhago</h1>
    <p class="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Pick a module to get started.</p>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <RouterLink
        v-for="m in withCockpit"
        :key="m.name"
        :to="`/m/${m.name}`"
        class="block rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 transition-colors hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900"
      >
        <div class="text-sm font-medium text-zinc-900 dark:text-white">{{ moduleLabel(m) }}</div>
        <div class="mt-1 text-[10px] uppercase text-zinc-500 dark:text-zinc-600">{{ m.type }}</div>
      </RouterLink>
    </div>

    <p v-if="!withCockpit.length" class="text-sm text-zinc-500 dark:text-zinc-600">
      No modules with a UI yet.
    </p>
  </div>
</template>
