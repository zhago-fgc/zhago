<script setup lang="ts">
import { inject, watch, type Ref } from 'vue'
import { useRouter } from 'vue-router'

interface ModuleManifest {
  name: string
  ui?: { cockpit?: string }
}

const router = useRouter()
const modules = inject<Ref<ModuleManifest[]>>('modules')!

// Auto-redirect to the first module once the list has loaded — modules is
// empty on mount (fetched async in App.vue), so this waits rather than
// checking once.
watch(
  modules,
  (list) => {
    const first = list.find((m) => m.ui?.cockpit)
    if (first) router.replace(`/m/${first.name}`)
  },
  { immediate: true },
)
</script>

<template>
  <p class="p-4 text-sm text-zinc-500">Pick a module.</p>
</template>
