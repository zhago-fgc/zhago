<template>
  <div class="p-8">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold tracking-wide">Players</h1>
      <button class="px-4 py-2 bg-brand-800 hover:bg-brand-700 text-white text-sm rounded transition-colors"
        @click="showCreate = !showCreate">
        {{ showCreate ? 'Cancel' : '+ Add Player' }}
      </button>
    </div>

    <div v-if="showCreate" class="bg-zinc-800 border border-zinc-700 rounded-lg p-5 mb-6">
      <h2 class="text-sm font-semibold text-zinc-300 mb-3">New Player</h2>
      <div class="flex gap-3">
        <input v-model="form.tag" type="text" placeholder="Tag *" autocomplete="off"
          class="flex-1 bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500" />
        <input v-model="form.team" type="text" placeholder="Team" autocomplete="off"
          class="w-32 bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500" />
        <input v-model="form.region" type="text" placeholder="Region" autocomplete="off"
          class="w-32 bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500" />
        <button class="px-4 py-2 bg-brand-800 hover:bg-brand-700 text-white text-sm rounded transition-colors disabled:opacity-50"
          :disabled="!form.tag.trim() || creating" @click="createPlayer">
          {{ creating ? '...' : 'Add' }}
        </button>
      </div>
    </div>

    <div class="bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden">
      <div v-if="players.length === 0" class="px-5 py-10 text-center text-zinc-500 text-sm">
        No players yet.
      </div>
      <table v-else class="w-full text-sm">
        <thead>
          <tr class="border-b border-zinc-700 text-zinc-400 text-left">
            <th class="px-5 py-3 font-medium">Tag</th>
            <th class="px-5 py-3 font-medium">Team</th>
            <th class="px-5 py-3 font-medium">Region</th>
            <th class="px-5 py-3 font-medium text-right">W</th>
            <th class="px-5 py-3 font-medium text-right">L</th>
            <th class="px-5 py-3 font-medium text-right">Win %</th>
            <th class="px-5 py-3 font-medium text-right">Games</th>
            <th class="px-5 py-3"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in players" :key="p.id"
            class="border-b border-zinc-700/50 last:border-0 hover:bg-zinc-700/30 transition-colors group">
            <td class="px-5 py-3 text-white font-medium">{{ p.tag }}</td>
            <td class="px-5 py-3 text-zinc-400">{{ p.team || '—' }}</td>
            <td class="px-5 py-3 text-zinc-400">{{ p.region || '—' }}</td>
            <template v-if="statsMap[p.id]">
              <td class="px-5 py-3 text-right text-green-400 font-medium">{{ statsMap[p.id].sets_won }}</td>
              <td class="px-5 py-3 text-right text-red-400 font-medium">{{ statsMap[p.id].sets_lost }}</td>
              <td class="px-5 py-3 text-right text-zinc-300">
                {{ statsMap[p.id].sets_played === 0 ? '—' : statsMap[p.id].win_rate.toFixed(0) + '%' }}
              </td>
              <td class="px-5 py-3 text-right text-zinc-500 text-xs">
                {{ statsMap[p.id].sets_played === 0 ? '—' : `${statsMap[p.id].games_won}–${statsMap[p.id].games_lost}` }}
              </td>
            </template>
            <template v-else>
              <td colspan="4" class="px-5 py-3 text-right text-zinc-600 text-xs">no data</td>
            </template>
            <td class="px-5 py-3 text-right">
              <button class="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 transition-all text-xs px-2 py-1 rounded hover:bg-zinc-700"
                @click.stop="deletePlayer(p.id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue';
import { GetAll, CreatePlayer, DeletePlayer, GetAllStats } from '../../bindings/zhago/internal/handler/system/playerhandler';
import { Player } from '../../bindings/zhago/internal/domain/model/models';
import { PlayerStats, CreatePlayerRequest } from '../../bindings/zhago/internal/dto/models';

const players = ref<Player[]>([]);
const stats   = ref<PlayerStats[]>([]);
const showCreate = ref(false);
const creating = ref(false);
const form = reactive({ tag: '', team: '', region: '' });

const statsMap = computed(() =>
  Object.fromEntries(stats.value.map(s => [s.player_id, s]))
);

async function load() {
  try {
    const [pl, st] = await Promise.all([GetAll(), GetAllStats()]);
    players.value = pl ?? [];
    stats.value   = st ?? [];
  } catch (err) {
    console.error('Failed to load players:', err);
  }
}

async function createPlayer() {
  if (!form.tag.trim() || creating.value) return;
  creating.value = true;
  try {
    await CreatePlayer(CreatePlayerRequest.createFrom({ tag: form.tag.trim(), team: form.team.trim(), region: form.region.trim() }));
    form.tag = ''; form.team = ''; form.region = '';
    showCreate.value = false;
    await load();
  } finally {
    creating.value = false;
  }
}

async function deletePlayer(id: string) {
  try {
    await DeletePlayer(id);
    await load();
  } catch (err) {
    console.error('Failed to delete player:', err);
  }
}

onMounted(load);
</script>
