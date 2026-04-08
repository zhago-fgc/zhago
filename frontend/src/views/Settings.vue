<template>
  <div class="p-8">
    <div class="mb-6">
      <h1 class="text-2xl font-bold tracking-wide">Settings</h1>
    </div>

    <div class="flex flex-col gap-6 max-w-md">

      <div class="bg-zinc-800 border border-zinc-700 rounded-lg p-5">
        <h2 class="text-sm font-semibold text-zinc-300 mb-4">HTTP Server</h2>
        <div class="flex flex-col gap-3">
          <div>
            <label class="text-xs text-zinc-500 mb-1 block">Port</label>
            <input v-model.number="state.httpPort" type="number" autocomplete="off"
              :disabled="state.isRunning"
              class="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed" />
          </div>
          <div class="flex items-center justify-between pt-1">
            <div class="flex items-center gap-2 text-sm">
              <span :class="state.isRunning ? 'bg-green-500' : 'bg-zinc-500'" class="w-2 h-2 rounded-full"></span>
              <span class="text-zinc-400">{{ state.isRunning ? `Running on :${state.httpPort}` : 'Stopped' }}</span>
            </div>
            <button class="px-4 py-2 text-sm rounded font-medium transition-colors disabled:opacity-50"
              :class="state.isRunning ? 'bg-zinc-700 hover:bg-zinc-600 text-white' : 'bg-brand-800 hover:bg-brand-700 text-white'"
              :disabled="state.isLoading" @click="toggleServer">
              {{ state.isLoading ? 'Loading...' : (state.isRunning ? 'Stop' : 'Start Server') }}
            </button>
          </div>
        </div>
      </div>

      <div class="bg-zinc-800 border border-zinc-700 rounded-lg p-5">
        <h2 class="text-sm font-semibold text-zinc-300 mb-4">API Keys</h2>
        <div class="flex flex-col gap-3">
          <div>
            <label class="text-xs text-zinc-500 mb-1 block">start.gg API key</label>
            <input type="password" placeholder="Coming soon" disabled
              class="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-500 cursor-not-allowed" />
          </div>
          <div>
            <label class="text-xs text-zinc-500 mb-1 block">Challonge API key</label>
            <input type="password" placeholder="Coming soon" disabled
              class="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-500 cursor-not-allowed" />
          </div>
        </div>
      </div>

      <div class="bg-zinc-800 border border-zinc-700 rounded-lg p-5">
        <h2 class="text-sm font-semibold text-zinc-300 mb-3">Storage</h2>
        <div class="flex flex-col gap-2 text-xs text-zinc-500 font-mono">
          <div>Database: ~/.zhago/zhago.db</div>
          <div>Templates: ~/.zhago/templates/</div>
          <div>Assets: ~/.zhago/assets/</div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue';
import { StartServer, StopServer, IsRunning, GetConfigPort } from '../../wailsjs/go/system/ServerHandler';

const state = reactive({ httpPort: 3000, isRunning: false, isLoading: false });

onMounted(async () => {
  try {
    const [running, port] = await Promise.all([IsRunning(), GetConfigPort()]);
    state.isRunning = running;
    state.httpPort  = port;
  } catch {}
});

async function toggleServer() {
  state.isLoading = true;
  try {
    if (state.isRunning) {
      await StopServer();
      state.isRunning = false;
    } else {
      await StartServer(state.httpPort);
      state.isRunning = true;
    }
  } catch (err) {
    console.error('Server error:', err);
  } finally {
    state.isLoading = false;
  }
}
</script>
