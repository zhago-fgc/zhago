<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router';
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { IsRunning, GetPort, ClientCount } from '../../wailsjs/go/system/ServerHandler';
import { ListPacks } from '../../wailsjs/go/system/TemplateHandler';
import logo from '../assets/zhago-logo-white.svg';

const route = useRoute();

const serverRunning   = ref(false);
const serverPort      = ref(0);
const clientCount     = ref(0);
const packs           = ref<any[]>([]);
const startggLinked   = ref(false);

// Overlay types with dedicated built-in views — excluded from dynamic nav.
const BUILTIN_TYPES = new Set(['scoreboard', 'commentary', 'brb', 'top8']);

const customOverlayTypes = computed(() => {
  const seen = new Set<string>();
  const result: { type: string; label: string }[] = [];
  for (const pack of packs.value) {
    for (const type of (pack.overlays ?? [])) {
      if (!BUILTIN_TYPES.has(type) && !seen.has(type)) {
        seen.add(type);
        result.push({
          type,
          label: type.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
        });
      }
    }
  }
  return result;
});

async function refreshStatus() {
  try {
    const [running, port, clients] = await Promise.all([IsRunning(), GetPort(), ClientCount()]);
    serverRunning.value = running;
    serverPort.value    = port;
    clientCount.value   = clients;
  } catch {}
}

async function refreshPacks() {
  try { packs.value = (await ListPacks()) ?? []; } catch {}
}

function refreshStartggLinked() {
  startggLinked.value = !!localStorage.getItem('zhago:startgg_token');
}

let interval: ReturnType<typeof setInterval>;
onMounted(() => {
  refreshStatus();
  refreshPacks();
  refreshStartggLinked();
  interval = setInterval(refreshStatus, 5000);
});
onUnmounted(() => clearInterval(interval));

watch(() => route.path, refreshStartggLinked);

function isActive(to: string, exact = false): boolean {
  return exact ? route.path === to : route.path.startsWith(to);
}

const navLinkClass = (to: string, exact = false) =>
  ['px-3 py-1.5 rounded text-sm transition-colors flex items-center gap-2',
   isActive(to, exact) ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
  ].join(' ');
</script>

<template>
  <aside class="w-52 shrink-0 bg-zinc-950 flex flex-col border-r border-zinc-800 select-none">

    <div class="px-4 pt-5 pb-4 border-b border-zinc-800 flex justify-center">
      <img :src="logo" alt="Zhago" class="h-8 w-auto" />
    </div>

    <div v-if="serverRunning" class="mx-3 mt-3 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 flex items-center gap-2">
      <span class="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0"></span>
      <span class="text-xs text-green-400 truncate">:{{ serverPort }} live — {{ clientCount }} {{ clientCount === 1 ? 'client' : 'clients' }}</span>
    </div>

    <nav class="flex-1 overflow-y-auto p-3 flex flex-col gap-0.5">
      <RouterLink to="/" :class="navLinkClass('/', true)">Home</RouterLink>
      <RouterLink to="/bracket" :class="navLinkClass('/bracket')">Bracket</RouterLink>

      <div class="mt-3 mb-1 px-3 text-[10px] text-zinc-600 uppercase tracking-widest font-medium">Production</div>
      <RouterLink to="/commentary" :class="navLinkClass('/commentary')">Commentary</RouterLink>
      <RouterLink to="/break-timer" :class="navLinkClass('/break-timer')">Break Timer</RouterLink>
      <RouterLink to="/top8" :class="navLinkClass('/top8')">Top 8</RouterLink>
      <RouterLink
        v-for="t in customOverlayTypes" :key="t.type"
        :to="'/overlay/' + t.type"
        :class="navLinkClass('/overlay/' + t.type, true)">
        {{ t.label }}
      </RouterLink>

      <div class="mt-3 mb-1 px-3 text-[10px] text-zinc-600 uppercase tracking-widest font-medium">Library</div>
      <RouterLink to="/players" :class="navLinkClass('/players')">Players</RouterLink>
      <RouterLink to="/commentators" :class="navLinkClass('/commentators')">Commentators</RouterLink>
      <RouterLink to="/assets" :class="navLinkClass('/assets')">Assets</RouterLink>
      <RouterLink to="/overlays" :class="navLinkClass('/overlays')">Overlays</RouterLink>

      <div class="mt-3 mb-1 px-3 text-[10px] text-zinc-600 uppercase tracking-widest font-medium">System</div>
      <RouterLink to="/settings" :class="navLinkClass('/settings')">Settings</RouterLink>

      <div class="mt-3 mb-1 px-3 text-[10px] text-zinc-600 uppercase tracking-widest font-medium">Connected</div>
      <div :class="startggLinked ? 'text-zinc-300' : 'text-zinc-600'" class="px-3 py-1.5 flex items-center gap-2 text-sm">
        <span :class="startggLinked ? 'bg-green-500' : 'bg-zinc-700'" class="w-1.5 h-1.5 rounded-full shrink-0"></span>start.gg
      </div>
      <div class="px-3 py-1.5 flex items-center gap-2 text-sm text-zinc-600">
        <span class="w-1.5 h-1.5 rounded-full bg-zinc-700 shrink-0"></span>challonge
      </div>
    </nav>

    <div class="px-4 py-3 border-t border-zinc-800 text-[10px] text-zinc-600">
      v0.1.0 · AGPL-3.0
    </div>
  </aside>
</template>
