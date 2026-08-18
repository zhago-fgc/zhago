<script setup lang="ts">
import { inject, computed, type Ref } from 'vue';
import { useRoute } from 'vue-router';
import type { ModuleManifest } from '../../shared/types/module';

const route = useRoute();
const modules = inject<Ref<ModuleManifest[]>>('modules')!;

const cockpitUrl = computed(() => {
  const name = route.params.name as string;
  const m = modules.value.find((mod) => mod.name === name);
  return m?.ui?.cockpit ? `/modules/${m.name}/${m.ui.cockpit}` : null;
});
</script>

<template>
  <!-- :key forces a brand-new iframe element per module, instead of reusing
       one iframe and reactively changing its src. A fresh iframe's first
       navigation replaces its own blank initial state; reusing one and
       changing src is a real navigation that adds its own entry to the
       browser's joint session history, which is what broke the back button. -->
  <iframe v-if="cockpitUrl" :key="cockpitUrl" :src="cockpitUrl" class="w-full h-full border-0" />
  <p v-else class="p-4 text-sm text-zinc-500">Module not found.</p>
</template>
