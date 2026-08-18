<script setup lang="ts">
import { computed, inject, type Ref } from 'vue';
import { moduleLabel } from '../../shared/composables/moduleLabel';
import type { ModuleManifest } from '../../shared/types/module';
import AddOnCard from './AddOnCard.vue';
import AddOnSummary from './AddOnSummary.vue';

const modules = inject<Ref<ModuleManifest[]>>('modules')!;
const installed = computed(() =>
  [...modules.value].sort((a, b) => moduleLabel(a).localeCompare(moduleLabel(b))),
);
const withCockpit = computed(() => installed.value.filter((m) => m.ui?.cockpit));
const headless = computed(() => installed.value.filter((m) => !m.ui?.cockpit));
</script>

<template>
  <div class="p-6 max-w-5xl">
    <div class="mb-6">
      <h1 class="text-xl font-semibold text-zinc-900 dark:text-white mb-1">Add-ons</h1>
      <p class="text-sm text-zinc-500 dark:text-zinc-400">
        Connect the Zhago pieces you need for your event.
      </p>
    </div>

    <section
      class="rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 mb-6 bg-zinc-50 dark:bg-zinc-900/40"
    >
      <div class="flex items-start justify-between gap-4">
        <div>
          <h2 class="text-sm font-medium text-zinc-900 dark:text-white">Recommended setup</h2>
          <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl">
            The registry installer is not wired yet. For now, installed add-ons are loaded from your
            configured modules directory.
          </p>
        </div>
        <button
          type="button"
          disabled
          class="shrink-0 rounded-md border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 text-sm text-zinc-400 dark:text-zinc-600 cursor-not-allowed"
        >
          Install recommended
        </button>
      </div>
    </section>

    <section class="mb-8">
      <div class="flex items-end justify-between gap-4 mb-3">
        <div>
          <h2 class="text-sm font-medium text-zinc-900 dark:text-white">Installed</h2>
          <p class="text-sm text-zinc-500 dark:text-zinc-400">
            {{ installed.length }} add-ons loaded
          </p>
        </div>
      </div>

      <div v-if="installed.length" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        <AddOnCard v-for="m in installed" :key="m.name" :module="m" />
      </div>

      <p v-else class="text-sm text-zinc-500 dark:text-zinc-600">No add-ons installed yet.</p>
    </section>

    <section class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <AddOnSummary
        title="Cockpit add-ons"
        :description="`${withCockpit.length} add-ons expose an operator UI.`"
      />
      <AddOnSummary
        title="Headless add-ons"
        :description="`${headless.length} add-ons provide data, overlays, or background behavior.`"
      />
    </section>
  </div>
</template>
