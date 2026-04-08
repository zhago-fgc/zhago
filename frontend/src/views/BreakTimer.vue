<template>
  <div class="p-8">
    <div class="mb-6">
      <h1 class="text-2xl font-bold tracking-wide">Break Timer</h1>
      <p class="text-zinc-400 text-sm mt-1">Countdown timer for BRB screens.</p>
    </div>

    <div class="bg-zinc-800 border border-zinc-700 rounded-lg p-6 max-w-md">
      <div class="text-5xl font-bold text-white text-center mb-6 tabular-nums">
        {{ displayTime }}
      </div>

      <div class="flex gap-2 mb-4 justify-center flex-wrap">
        <button v-for="preset in presets" :key="preset.label"
          class="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded transition-colors"
          @click="setDuration(preset.seconds)">
          {{ preset.label }}
        </button>
      </div>

      <div class="mb-4">
        <label class="text-xs text-zinc-500 mb-1 block">Custom message</label>
        <input v-model="message" type="text" autocomplete="off" placeholder="We'll be right back!"
          class="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500" />
      </div>

      <div class="flex gap-2">
        <button class="flex-1 py-2 bg-brand-800 hover:bg-brand-700 text-white text-sm font-semibold rounded transition-colors"
          :disabled="running" @click="start">Start</button>
        <button class="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded transition-colors"
          @click="stop">Stop</button>
        <button class="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded transition-colors"
          @click="reset">Reset</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';
import { Broadcast } from '../../wailsjs/go/system/ServerHandler';

const presets = [
  { label: '3m', seconds: 180 },
  { label: '5m', seconds: 300 },
  { label: '10m', seconds: 600 },
  { label: '15m', seconds: 900 },
];

const remaining = ref(300);
const running = ref(false);
const message = ref('');
let timer: ReturnType<typeof setInterval> | null = null;

const displayTime = computed(() => {
  const m = Math.floor(remaining.value / 60).toString().padStart(2, '0');
  const s = (remaining.value % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
});

function setDuration(seconds: number) {
  stop();
  remaining.value = seconds;
}

function start() {
  if (running.value) return;
  running.value = true;
  const target = Date.now() + remaining.value * 1000;
  Broadcast({ type: 'timer.start', payload: { target, message: message.value } } as any);
  timer = setInterval(() => {
    remaining.value = Math.max(0, Math.round((target - Date.now()) / 1000));
    if (remaining.value === 0) stop();
  }, 500);
}

function stop() {
  running.value = false;
  if (timer) { clearInterval(timer); timer = null; }
  Broadcast({ type: 'timer.stop', payload: {} } as any);
}

function reset() {
  stop();
  remaining.value = 300;
}

onUnmounted(stop);
</script>
