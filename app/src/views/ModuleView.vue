<script setup lang="ts">
import { inject, computed, ref, watch, type Ref } from 'vue';
import { useRoute } from 'vue-router';
import { COCKPIT_SKIN } from '../cockpit-skin';

interface ModuleManifest {
  name: string;
  ui?: { cockpit?: string };
}

const route = useRoute();
const modules = inject<Ref<ModuleManifest[]>>('modules')!;

const cockpitUrl = computed(() => {
  const name = route.params.name as string;
  const m = modules.value.find((mod) => mod.name === name);
  return m?.ui?.cockpit ? `/modules/${m.name}/${m.ui.cockpit}` : null;
});

// `load` fires only after the browser has already parsed and painted the
// module's own (unstyled/white) page — injecting the skin there is correct
// but too late to prevent a visible flash. So the iframe stays invisible
// (see `ready` below) until the skin is actually in place, instead of
// racing to inject before first paint.
const ready = ref(false);
watch(cockpitUrl, () => {
  ready.value = false;
});

// Modules ship plain HTML/CSS/JS (no Vue, no build step — that's what lets a
// module get picked up at runtime without rebuilding the console), so they
// can't be real Vue components. The iframe boundary stays for isolation
// (each module gets its own document; navigating away tears down whatever
// EventSources it opened, same as a real page unload). What we CAN do without
// giving that up: same-origin (proxied in dev, same server in prod) means the
// parent can reach into the iframe's own document and inject a stylesheet
// once it's loaded, so plain <input>/<select>/<button> elements pick up the
// console's look without any module author touching CSS.
function skin(e: Event) {
  const doc = (e.target as HTMLIFrameElement).contentDocument;
  if (doc) {
    const style = doc.createElement('style');
    style.textContent = COCKPIT_SKIN;
    doc.head.appendChild(style);
  }
  // Reveal even if contentDocument was unreachable (cross-origin) — an
  // unskinned module beats one stuck invisible forever.
  ready.value = true;
}
</script>

<template>
  <!-- :key forces a brand-new iframe element per module, instead of reusing
       one iframe and reactively changing its src. A fresh iframe's first
       navigation replaces its own blank initial state; reusing one and
       changing src is a real navigation that adds its own entry to the
       browser's joint session history, which is what broke the back button. -->
  <iframe
    v-if="cockpitUrl"
    :key="cockpitUrl"
    :src="cockpitUrl"
    class="w-full h-full border-0 transition-opacity duration-150"
    :class="ready ? 'opacity-100' : 'opacity-0'"
    @load="skin"
  />
  <p v-else class="p-4 text-sm text-zinc-500">Module not found.</p>
</template>
