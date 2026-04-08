<template>
  <div class="p-8">
    <div class="mb-6">
      <h1 class="text-2xl font-bold tracking-wide">Overlays</h1>
      <p class="text-zinc-400 text-sm mt-1">Manage overlay packs and OBS browser source URLs.</p>
    </div>

    <!-- Active pack selector (rich dropdown with metadata) -->
    <div class="bg-zinc-800 border border-zinc-700 rounded-lg p-5 mb-6">
      <div class="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">Active Pack</div>
      <div class="flex items-center gap-4">
        <div class="relative w-64" ref="packDropdownRef">
          <button
            class="w-full flex items-center justify-between gap-2 bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm transition-colors hover:border-zinc-500 focus:outline-none"
            :class="packDropdownOpen ? 'border-zinc-500' : ''"
            @click="packDropdownOpen = !packDropdownOpen">
            <span :class="activePack ? 'text-white' : 'text-zinc-500'" class="truncate">
              {{ activePack ? (packInfo(activePack)?.name ?? activePack) : 'No pack selected' }}
            </span>
            <svg class="w-4 h-4 text-zinc-500 shrink-0 transition-transform" :class="packDropdownOpen ? 'rotate-180' : ''" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
            </svg>
          </button>
          <div v-if="packDropdownOpen"
            class="absolute z-10 mt-1 w-full bg-zinc-900 border border-zinc-700 rounded shadow-xl overflow-hidden">
            <div v-if="packs.length === 0" class="px-3 py-2.5 text-xs text-zinc-600">No packs installed.</div>
            <button v-for="p in packs" :key="p.dir_name"
              class="w-full text-left px-3 py-2.5 transition-colors"
              :class="activePack === p.dir_name ? 'bg-zinc-700' : 'hover:bg-zinc-800'"
              @click="selectPack(p.dir_name)">
              <div class="text-sm text-white flex items-center justify-between">
                <span>{{ p.name }}</span>
                <span v-if="activePack === p.dir_name" class="text-xs text-zinc-400">active</span>
              </div>
              <div class="text-xs text-zinc-500 mt-0.5">
                {{ p.author }} · v{{ p.version }}
                <span v-if="p.overlays?.length"> · {{ p.overlays.join(', ') }}</span>
              </div>
            </button>
          </div>
        </div>
        <div v-if="activePack && packInfo(activePack)" class="text-xs text-zinc-500">
          {{ packInfo(activePack)?.description }}
        </div>
      </div>
    </div>

    <!-- Per-overlay rows -->
    <div class="flex flex-col gap-2">
      <div v-for="overlay in overlays" :key="overlay.type"
        class="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 flex items-center gap-4">

        <div class="w-36 shrink-0">
          <div class="text-sm font-medium text-white">{{ overlay.name }}</div>
          <div class="text-xs text-zinc-500">{{ overlay.type }}</div>
        </div>

        <div class="w-48 shrink-0">
          <CustomSelect
            :model-value="activeTemplates[overlay.type] ?? ''"
            :options="overrideOptions(overlay.type)"
            placeholder="Active pack"
            empty-text="No packs available."
            @update:modelValue="val => selectOverride(overlay.type, val)" />
        </div>

        <!-- OBS URL -->
        <div class="flex-1 min-w-0 bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-xs text-zinc-500 font-mono truncate">
          http://localhost:{{ port }}/{{ overlay.type }}/index.html
        </div>

        <!-- Copy button -->
        <button
          class="shrink-0 px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white text-xs rounded transition-colors"
          @click="copyUrl(overlay.type)">
          {{ copiedType === overlay.type ? 'Copied!' : 'Copy URL' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { GetPort, IsRunning } from '../../wailsjs/go/system/ServerHandler';
import { ListPacks, GetActivePack, SetActivePack, GetActiveTemplate, SetActiveTemplate } from '../../wailsjs/go/system/TemplateHandler';
import CustomSelect from '../components/CustomSelect.vue';

const port = ref(3000);
const packs = ref<any[]>([]);
const activePack = ref('');
const activeTemplates = ref<Record<string, string>>({});
const packDropdownOpen = ref(false);
const packDropdownRef = ref<HTMLElement | null>(null);
const copiedType = ref<string | null>(null);

function typeLabel(type: string): string {
  return type.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// Derive overlay list from all installed packs — union of all overlay types across packs.
const overlays = computed(() => {
  const seen = new Set<string>();
  const result: { type: string; name: string }[] = [];
  for (const pack of packs.value) {
    for (const type of (pack.overlays ?? [])) {
      if (!seen.has(type)) {
        seen.add(type);
        result.push({ type, name: typeLabel(type) });
      }
    }
  }
  return result;
});

function packInfo(dirName: string) {
  return packs.value.find(p => p.dir_name === dirName) ?? null;
}

// Returns options for the per-type override dropdown:
// first option is "Active pack" (empty value = no override), then packs that support this type.
function overrideOptions(type: string) {
  const options = [{ value: '', label: 'Active pack' }];
  packs.value
    .filter(p => p.overlays?.includes(type))
    .forEach(p => options.push({ value: p.dir_name, label: p.name }));
  return options;
}

async function selectPack(dirName: string) {
  try {
    await SetActivePack(dirName);
    activePack.value = dirName;
  } catch (err) {
    console.error('Failed to set active pack:', err);
  }
  packDropdownOpen.value = false;
}

async function selectOverride(overlayType: string, packDirName: string) {
  try {
    await SetActiveTemplate(overlayType, packDirName);
    if (packDirName) {
      activeTemplates.value = { ...activeTemplates.value, [overlayType]: packDirName };
    } else {
      const updated = { ...activeTemplates.value };
      delete updated[overlayType];
      activeTemplates.value = updated;
    }
  } catch (err) {
    console.error('Failed to set override:', err);
  }
}

function copyUrl(type: string) {
  navigator.clipboard.writeText(`http://localhost:${port.value}/${type}/index.html`);
  copiedType.value = type;
  setTimeout(() => { copiedType.value = null; }, 1500);
}

function onClickOutside(e: MouseEvent) {
  if (packDropdownOpen.value && packDropdownRef.value && !packDropdownRef.value.contains(e.target as Node)) {
    packDropdownOpen.value = false;
  }
}

onMounted(async () => {
  document.addEventListener('mousedown', onClickOutside);
  try {
    const [running, p, pkgs, pack] = await Promise.all([
      IsRunning(), GetPort(), ListPacks(), GetActivePack(),
    ]);
    if (running && p) port.value = p;
    packs.value = pkgs ?? [];
    activePack.value = pack ?? '';

    const active: Record<string, string> = {};
    await Promise.all(overlays.value.map(async o => {
      try {
        const a = await GetActiveTemplate(o.type);
        if (a) active[o.type] = a;
      } catch {}
    }));
    activeTemplates.value = active;
  } catch {}
});

onUnmounted(() => {
  document.removeEventListener('mousedown', onClickOutside);
});
</script>
