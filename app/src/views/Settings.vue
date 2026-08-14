<script setup lang="ts">
import { theme, type Theme } from '../theme'

const options: { value: Theme; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
]
</script>

<template>
  <div class="p-6 max-w-md">
    <h1 class="text-xl font-semibold text-zinc-900 dark:text-white mb-6">Settings</h1>

    <section>
      <h2 class="text-sm font-medium text-zinc-900 dark:text-white mb-2">Appearance</h2>
      <p class="text-sm text-zinc-500 dark:text-zinc-400 mb-3">
        Applies to the admin console. Module cockpits keep their own dark skin for now.
      </p>
      <div class="flex gap-2">
        <button
          v-for="opt in options"
          :key="opt.value"
          type="button"
          @click="theme = opt.value"
          :class="[
            'px-3 py-1.5 rounded text-sm border transition-colors',
            theme === opt.value
              ? 'border-brand-700 bg-brand-800/10 text-zinc-900 dark:text-white'
              : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900',
          ]"
        >
          {{ opt.label }}
        </button>
      </div>
    </section>
  </div>
</template>
