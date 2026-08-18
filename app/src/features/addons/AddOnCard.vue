<script setup lang="ts">
import { computed } from 'vue';
import { moduleLabel } from '../../shared/composables/moduleLabel';
import type { AddOnRegistryEntry, ModuleManifest } from '../../shared/types/module';

type AddOnCardModule = ModuleManifest & Partial<AddOnRegistryEntry>;

const props = withDefaults(
  defineProps<{
    module: AddOnCardModule;
    actionLabel?: string;
    actionDisabled?: boolean;
    showOpen?: boolean;
  }>(),
  {
    actionLabel: 'Remove',
    actionDisabled: true,
    showOpen: true,
  },
);

defineEmits<{ action: [] }>();

const shortChecksum = computed(() => props.module.checksum?.replace('sha256:', '').slice(0, 12));
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
      <div class="flex flex-col items-end gap-1">
        <span class="text-[10px] uppercase text-zinc-500 dark:text-zinc-600">{{
          module.type
        }}</span>
        <span
          v-if="module.official"
          class="rounded-full bg-brand-800/10 px-2 py-0.5 text-[10px] text-brand-700 dark:text-brand-300"
        >
          Official
        </span>
        <span
          v-if="module.recommended"
          class="rounded-full bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 text-[10px] text-zinc-500 dark:text-zinc-500"
        >
          Recommended
        </span>
      </div>
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

    <div
      v-if="module.sourceRepo || module.releasePage || shortChecksum"
      class="mt-3 space-y-1 text-xs"
    >
      <a
        v-if="module.sourceRepo"
        :href="module.sourceRepo"
        target="_blank"
        rel="noreferrer"
        class="block text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
      >
        Source repo
      </a>
      <a
        v-if="module.releasePage"
        :href="module.releasePage"
        target="_blank"
        rel="noreferrer"
        class="block text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
      >
        Release page
      </a>
      <p v-if="shortChecksum" class="font-mono text-[10px] text-zinc-400 dark:text-zinc-600">
        sha256:{{ shortChecksum }}…
      </p>
    </div>

    <div class="mt-4 flex gap-2">
      <RouterLink
        v-if="showOpen && module.ui?.cockpit"
        :to="`/m/${module.name}`"
        class="rounded-md bg-zinc-900 dark:bg-white px-3 py-1.5 text-sm text-white dark:text-zinc-950"
      >
        Open
      </RouterLink>
      <button
        type="button"
        :disabled="actionDisabled"
        class="rounded-md border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 text-sm disabled:text-zinc-400 disabled:dark:text-zinc-600 disabled:cursor-not-allowed text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
        @click="$emit('action')"
      >
        {{ actionLabel }}
      </button>
    </div>
  </article>
</template>
