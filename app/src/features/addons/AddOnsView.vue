<script setup lang="ts">
import { computed, inject, onMounted, ref, type Ref } from 'vue';
import { moduleLabel } from '../../shared/composables/moduleLabel';
import type { AddOnRegistryEntry, ModuleManifest } from '../../shared/types/module';
import AddOnCard from './AddOnCard.vue';
import AddOnSummary from './AddOnSummary.vue';
import { installAddOn, listRegistryAddOns, removeAddOn, updateAddOn } from './api';

const modules = inject<Ref<ModuleManifest[]>>('modules')!;
const registry = ref<AddOnRegistryEntry[]>([]);
const registryError = ref<string | null>(null);
const actioning = ref<string | null>(null);
const actionError = ref<string | null>(null);
const pendingRestart = ref<Set<string>>(new Set());
const installed = computed(() =>
  [...modules.value].sort((a, b) => moduleLabel(a).localeCompare(moduleLabel(b))),
);
const withCockpit = computed(() => installed.value.filter((m) => m.ui?.cockpit));
const headless = computed(() => installed.value.filter((m) => !m.ui?.cockpit));
const installedNames = computed(() => new Set(installed.value.map((m) => m.name)));
const unavailableNames = computed(
  () => new Set([...installedNames.value, ...pendingRestart.value]),
);
const recommended = computed(() => registry.value.filter((m) => m.recommended));
const available = computed(() => registry.value.filter((m) => !unavailableNames.value.has(m.name)));
const registryByName = computed(() => new Map(registry.value.map((m) => [m.name, m])));
const installedCards = computed(() =>
  installed.value.map((m) => ({ ...registryByName.value.get(m.name), ...m })),
);

onMounted(async () => {
  try {
    registry.value = await listRegistryAddOns();
  } catch (err) {
    registryError.value = err instanceof Error ? err.message : 'Failed to load registry';
  }
});

function hasUpdate(addon: ModuleManifest) {
  const registryEntry = registryByName.value.get(addon.name);
  return Boolean(registryEntry && registryEntry.version !== addon.version);
}

function actionLabel(addon: ModuleManifest) {
  if (actioning.value === addon.name) return hasUpdate(addon) ? 'Updating...' : 'Removing...';
  return hasUpdate(addon) ? 'Update' : 'Remove';
}

function markPendingRestart(name: string) {
  pendingRestart.value = new Set(pendingRestart.value).add(name);
}

async function install(addon: AddOnRegistryEntry) {
  actioning.value = addon.name;
  actionError.value = null;
  try {
    await installAddOn(addon.name);
    markPendingRestart(addon.name);
  } catch (err) {
    actionError.value = err instanceof Error ? err.message : 'Install failed';
  } finally {
    actioning.value = null;
  }
}

async function updateOrRemove(addon: ModuleManifest) {
  actioning.value = addon.name;
  actionError.value = null;
  try {
    if (hasUpdate(addon)) await updateAddOn(addon.name);
    else await removeAddOn(addon.name);
    markPendingRestart(addon.name);
  } catch (err) {
    actionError.value = err instanceof Error ? err.message : 'Action failed';
  } finally {
    actioning.value = null;
  }
}
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
            {{ recommended.length }} recommended add-ons are listed in the registry. Installed
            add-ons require a Zhago restart before they are loaded.
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
          <h2 class="text-sm font-medium text-zinc-900 dark:text-white">Available</h2>
          <p class="text-sm text-zinc-500 dark:text-zinc-400">
            {{ available.length }} add-ons available from the registry
          </p>
        </div>
      </div>

      <div v-if="available.length" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        <AddOnCard
          v-for="m in available"
          :key="m.name"
          :module="m"
          :action-label="actioning === m.name ? 'Installing...' : 'Install'"
          :action-disabled="actioning !== null"
          :show-open="false"
          @action="install(m)"
        />
      </div>

      <p v-if="actionError" class="mt-3 text-sm text-red-600 dark:text-red-400">
        {{ actionError }}
      </p>
      <p v-if="pendingRestart.size" class="mt-3 text-sm text-amber-600 dark:text-amber-400">
        Changes saved. Restart Zhago to apply add-on changes.
      </p>
      <p v-if="registryError" class="text-sm text-red-600 dark:text-red-400">
        {{ registryError }}
      </p>
      <p
        v-if="!available.length && !registryError"
        class="text-sm text-zinc-500 dark:text-zinc-600"
      >
        No registry add-ons available yet.
      </p>
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
        <AddOnCard
          v-for="m in installedCards"
          :key="m.name"
          :module="m"
          :action-label="actionLabel(m)"
          :action-disabled="actioning !== null"
          @action="updateOrRemove(m)"
        />
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
