<template>
  <div class="p-8">
    <div class="mb-6">
      <h1 class="text-2xl font-bold tracking-wide">Top 8</h1>
      <p class="text-zinc-400 text-sm mt-1">Broadcast final placements to overlays.</p>
    </div>

    <div class="grid grid-cols-2 gap-3 mb-6">
      <div v-for="slot in slots" :key="slot.key"
        class="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 flex items-center gap-3">
        <div class="w-16 shrink-0">
          <div class="text-sm font-semibold text-white">{{ slot.place }}</div>
          <div class="text-xs text-zinc-500">{{ slot.label }}</div>
        </div>
        <div class="flex-1">
          <PlayerAutocomplete
            :model-value="placements[slot.key]"
            :players="players"
            :placeholder="slot.place"
            @update:modelValue="(v: string) => placements[slot.key] = v"
            @select="(p: any) => { placements[slot.key] = p.tag; }" />
        </div>
      </div>
    </div>

    <div class="flex items-center gap-3">
      <button
        class="px-5 py-2 bg-brand-800 hover:bg-brand-700 text-white text-sm font-semibold rounded transition-colors"
        @click="send">
        Send to Overlay
      </button>
      <button
        class="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded transition-colors"
        @click="clear">
        Clear
      </button>
      <span v-if="sent" class="text-xs text-green-400">Sent!</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';
import PlayerAutocomplete from '../components/PlayerAutocomplete.vue';
import { GetAll as GetAllPlayers } from '../../wailsjs/go/system/PlayerHandler';
import { BroadcastMessage } from '../../wailsjs/go/system/ServerHandler';
import { model } from '../../wailsjs/go/models';

const players = ref<model.Player[]>([]);
const sent    = ref(false);

const slots = [
  { key: 'p1Name', place: '1st',   label: 'Winner' },
  { key: 'p2Name', place: '2nd',   label: 'Runner-up' },
  { key: 'p3Name', place: '3rd',   label: 'Losers Final' },
  { key: 'p4Name', place: '4th',   label: 'Losers Semi' },
  { key: 'p5Name', place: '5th A', label: 'Losers QF' },
  { key: 'p6Name', place: '5th B', label: 'Losers QF' },
  { key: 'p7Name', place: '7th A', label: 'Losers R2' },
  { key: 'p8Name', place: '7th B', label: 'Losers R2' },
] as const;

const placements = reactive<Record<string, string>>({
  p1Name: '', p2Name: '', p3Name: '', p4Name: '',
  p5Name: '', p6Name: '', p7Name: '', p8Name: '',
});

async function send() {
  await BroadcastMessage('top8.update', { ...placements });
  sent.value = true;
  setTimeout(() => { sent.value = false; }, 1500);
}

function clear() {
  for (const key of Object.keys(placements)) placements[key] = '';
}

onMounted(async () => {
  try { players.value = (await GetAllPlayers()) ?? []; } catch {}
});
</script>
