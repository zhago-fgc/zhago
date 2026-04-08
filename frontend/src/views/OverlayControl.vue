<template>
  <div class="p-8">
    <div class="mb-6">
      <h1 class="text-2xl font-bold tracking-wide">{{ manifest?.name ?? typeLabel }}</h1>
      <p v-if="manifest?.subscribes?.[0]" class="text-zinc-400 text-sm mt-1">
        Broadcasts <code class="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">{{ manifest.subscribes[0] }}</code> via SSE.
      </p>
    </div>

    <div v-if="loading" class="text-zinc-500 text-sm">Loading…</div>

    <div v-else-if="!manifest" class="text-zinc-500 text-sm">
      No <code class="bg-zinc-800 px-1 py-0.5 rounded text-zinc-400">manifest.json</code> found for
      <span class="text-zinc-300">{{ typeLabel }}</span>. Add one to your overlay pack to define fields.
    </div>

    <div v-else>
      <div v-if="manifest.fields.length === 0" class="text-zinc-500 text-sm mb-6">No fields defined in manifest.</div>

      <div v-else class="grid grid-cols-2 gap-4 mb-6">
        <div v-for="field in manifest.fields" :key="field.key">
          <label class="text-xs text-zinc-500 mb-1 block">{{ field.label }}</label>

          <div v-if="field.type === 'number'" class="flex items-center gap-2">
            <button class="w-8 h-8 bg-zinc-700 hover:bg-zinc-600 rounded text-white text-lg leading-none transition-colors"
              @click="form[field.key] = Math.max(0, (form[field.key] ?? 0) - 1)">−</button>
            <span class="w-10 text-center text-xl font-bold">{{ form[field.key] ?? 0 }}</span>
            <button class="w-8 h-8 bg-zinc-700 hover:bg-zinc-600 rounded text-white text-lg leading-none transition-colors"
              @click="form[field.key] = (form[field.key] ?? 0) + 1">+</button>
          </div>

          <CustomSelect
            v-else-if="field.type === 'select'"
            :model-value="form[field.key] ?? ''"
            :options="(field.options ?? []).map((o: string) => ({ value: o, label: o }))"
            :placeholder="field.label"
            empty-text="No options."
            @update:modelValue="(v: string) => { form[field.key] = v }" />

          <textarea v-else-if="field.type === 'textarea'"
            v-model="form[field.key]" rows="3" :placeholder="field.label"
            class="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 resize-none" />

          <input v-else
            v-model="form[field.key]" type="text" autocomplete="off" :placeholder="field.label"
            class="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500" />
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button
          class="px-5 py-2 bg-brand-800 hover:bg-brand-700 text-white text-sm font-semibold rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          :disabled="!manifest.subscribes?.[0]"
          @click="send">
          Send to Overlay
        </button>
        <button class="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded transition-colors" @click="clear">
          Clear
        </button>
        <span v-if="sent" class="text-xs text-green-400">Sent!</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { GetOverlayManifest } from '../../wailsjs/go/system/TemplateHandler';
import { BroadcastMessage } from '../../wailsjs/go/system/ServerHandler';
import CustomSelect from '../components/CustomSelect.vue';

const route    = useRoute();
const manifest = ref<any>(null);
const loading  = ref(false);
const form     = ref<Record<string, any>>({});
const sent     = ref(false);

const overlayType = computed(() => route.params.type as string);
const typeLabel   = computed(() =>
  overlayType.value.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
);

async function loadManifest(type: string) {
  manifest.value = null;
  form.value = {};
  loading.value = true;
  try {
    const m = await GetOverlayManifest(type);
    manifest.value = m;
    if (m?.fields) {
      for (const field of m.fields) {
        form.value[field.key] = field.type === 'number' ? 0 : '';
      }
    }
  } catch {
    manifest.value = null;
  } finally {
    loading.value = false;
  }
}

async function send() {
  if (!manifest.value?.subscribes?.[0]) return;
  await BroadcastMessage(manifest.value.subscribes[0], { ...form.value });
  sent.value = true;
  setTimeout(() => { sent.value = false; }, 1500);
}

function clear() {
  if (!manifest.value?.fields) return;
  for (const field of manifest.value.fields) {
    form.value[field.key] = field.type === 'number' ? 0 : '';
  }
}

watch(overlayType, loadManifest);
onMounted(() => loadManifest(overlayType.value));
</script>
