<template>
  <div class="p-8">
    <div class="mb-6">
      <h1 class="text-2xl font-bold tracking-wide">Assets</h1>
      <p class="text-zinc-400 text-sm mt-1">Game asset packs installed at <code class="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">~/.zhago/assets/</code></p>
    </div>

    <div v-if="loading" class="text-zinc-500 text-sm">Loading…</div>

    <div v-else-if="assets.length === 0" class="bg-zinc-800 border border-zinc-700 rounded-lg p-6 text-center">
      <div class="text-zinc-400 text-sm mb-1">No game asset packs installed.</div>
      <div class="text-zinc-600 text-xs">
        Drop a game folder with a <code class="bg-zinc-900 px-1 rounded">manifest.json</code> into
        <code class="bg-zinc-900 px-1 rounded">~/.zhago/assets/</code> to get started.
      </div>
    </div>

    <div v-else class="flex flex-col gap-3">
      <div v-for="asset in assets" :key="asset.dir_name"
        class="bg-zinc-800 border border-zinc-700 rounded-lg px-5 py-4 flex items-center gap-4">

        <div class="flex-1 min-w-0">
          <div class="text-sm font-semibold text-white">{{ asset.name }}</div>
          <div class="text-xs text-zinc-500 mt-0.5 font-mono">{{ asset.dir_name }}</div>
        </div>

        <div class="flex items-center gap-6 shrink-0">
          <div class="text-center">
            <div class="text-lg font-bold text-white tabular-nums">{{ asset.character_count }}</div>
            <div class="text-[10px] text-zinc-500 uppercase tracking-widest">Characters</div>
          </div>
          <div class="text-center">
            <div class="text-lg font-bold text-white tabular-nums">{{ asset.characters_per_player }}v{{ asset.characters_per_player }}</div>
            <div class="text-[10px] text-zinc-500 uppercase tracking-widest">Format</div>
          </div>
        </div>

      </div>
    </div>

    <div class="mt-8 p-4 bg-zinc-800/50 border border-zinc-700/50 rounded-lg">
      <div class="text-xs text-zinc-500 mb-2 font-medium uppercase tracking-widest">Community asset repos</div>
      <div class="text-xs text-zinc-600">
        Game assets are maintained separately from the app. Clone a community repo into
        <code class="bg-zinc-800 px-1 rounded text-zinc-400">~/.zhago/assets/{game}/</code>
        then restart to pick it up. Rosters stay up to date independently of app releases.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ListInstalledAssets } from '../../wailsjs/go/system/AssetHandler';

const assets  = ref<any[]>([]);
const loading = ref(true);

onMounted(async () => {
  try { assets.value = (await ListInstalledAssets()) ?? []; }
  catch {}
  finally { loading.value = false; }
});
</script>
