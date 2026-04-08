<template>
  <div class="flex h-full overflow-hidden">

    <div class="w-60 shrink-0 bg-zinc-950 border-r border-zinc-800 flex flex-col">
      <div class="p-3 border-b border-zinc-800">
        <CustomSelect
          v-model="selectedTournamentId"
          :options="tournaments.map(t => ({ value: t.id, label: t.name }))"
          placeholder="Select tournament"
          empty-text="No tournaments yet."
          @update:modelValue="onTournamentSelect" />
      </div>

      <div class="flex-1 overflow-y-auto">
        <div v-if="!selectedTournamentId" class="p-4 text-sm text-zinc-600">Select a tournament above.</div>
        <div v-else-if="sets.length === 0" class="p-4 text-sm text-zinc-600">No sets yet.</div>
        <div v-else>
          <div class="px-3 py-2 text-[10px] text-zinc-600 uppercase tracking-widest font-medium">Upcoming</div>
          <template v-for="s in upcomingSets" :key="s.id">
            <div class="group relative border-b border-zinc-800/50">
              <button class="w-full text-left px-3 py-2.5 hover:bg-zinc-800 transition-colors"
                :class="selectedSet?.id === s.id ? 'bg-zinc-800' : ''"
                @click="loadSet(s)">
                <div class="text-sm text-white truncate pr-8">{{ setLabel(s) }}</div>
                <div class="text-xs text-zinc-500 mt-0.5">{{ s.round || 'No round' }}</div>
              </button>
              <button class="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all text-xs px-1.5 py-1 rounded hover:bg-zinc-700"
                @click.stop="deleteSet(s.id)">✕</button>
            </div>
          </template>

          <div v-if="completedSets.length" class="px-3 py-2 text-[10px] text-zinc-600 uppercase tracking-widest font-medium mt-1">Completed</div>
          <template v-for="s in completedSets" :key="s.id">
            <div class="group relative border-b border-zinc-800/50 opacity-60">
              <button class="w-full text-left px-3 py-2.5 hover:bg-zinc-800 transition-colors"
                @click="loadSet(s)">
                <div class="text-sm text-white truncate pr-8">{{ setLabel(s) }}</div>
                <div class="text-xs text-zinc-500 mt-0.5">{{ s.round }} · {{ s.player1_score }}–{{ s.player2_score }}</div>
              </button>
              <button class="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all text-xs px-1.5 py-1 rounded hover:bg-zinc-700"
                @click.stop="deleteSet(s.id)">✕</button>
            </div>
          </template>
        </div>
      </div>

      <div class="p-3 border-t border-zinc-800">
        <button class="w-full px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded transition-colors"
          :disabled="!selectedTournamentId" @click="quickMatch">
          + Quick Match
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto p-6">
      <div v-if="!selectedTournamentId" class="text-zinc-500 text-sm">Select a tournament to get started.</div>
      <div v-else>
        <div class="text-xs text-zinc-500 mb-4">
          {{ selectedTournamentName }}
          <span v-if="selectedSet"> · {{ selectedSet.round || 'Quick Match' }}</span>
          <span v-if="gameManifest?.name" class="ml-2 text-zinc-600">{{ gameManifest.name }}</span>
        </div>

        <div class="grid grid-cols-2 gap-4 mb-4">
          <div v-for="side in (['player1', 'player2'] as const)" :key="side" class="bg-zinc-800 border border-zinc-700 rounded-lg p-5">
            <div class="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">
              {{ side === 'player1' ? 'Player 1' : 'Player 2' }}
            </div>
            <div class="flex flex-col gap-3">
              <div>
                <label class="text-xs text-zinc-500 mb-1 block">Tag</label>
                <PlayerAutocomplete
                  :model-value="store[`${side}Name`]"
                  :players="players"
                  placeholder="Player tag"
                  @update:modelValue="(v: string) => store[`${side}Name`] = v"
                  @select="(p: any) => { store[`${side}Name`] = p.tag; store[`${side}Team`] = p.team; }" />
              </div>
              <div>
                <label class="text-xs text-zinc-500 mb-1 block">Team</label>
                <input :value="store[`${side}Team`]" @input="(e: any) => store[`${side}Team`] = e.target.value"
                  type="text" autocomplete="off" placeholder="Team tag"
                  class="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500" />
              </div>

              <!-- Dynamic character slots -->
              <div v-for="i in charactersPerPlayer" :key="i">
                <label class="text-xs text-zinc-500 mb-1 block">
                  {{ charactersPerPlayer === 1 ? 'Character' : `Character ${i}` }}
                </label>
                <CustomSelect
                  v-if="gameManifest && gameManifest.characters.length > 0"
                  :model-value="store[`${side}Characters`][i - 1] ?? ''"
                  :options="gameManifest.characters.map((c: any) => ({ value: c.name, label: c.name }))"
                  placeholder="Select character"
                  empty-text="No characters found."
                  @update:modelValue="(v: string) => setCharacter(side, i - 1, v)" />
                <input v-else
                  :value="store[`${side}Characters`][i - 1] ?? ''"
                  @input="(e: any) => setCharacter(side, i - 1, e.target.value)"
                  type="text" autocomplete="off" placeholder="Character"
                  class="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500" />
              </div>

              <div>
                <label class="text-xs text-zinc-500 mb-1 block">Score</label>
                <div class="flex items-center gap-2">
                  <button class="w-8 h-8 bg-zinc-700 hover:bg-zinc-600 rounded text-white text-lg leading-none transition-colors"
                    @click="store[`${side}Score`] = Math.max(0, store[`${side}Score`] - 1)">−</button>
                  <span class="w-10 text-center text-xl font-bold">{{ store[`${side}Score`] }}</span>
                  <button class="w-8 h-8 bg-zinc-700 hover:bg-zinc-600 rounded text-white text-lg leading-none transition-colors"
                    @click="store[`${side}Score`]++">+</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-zinc-800 border border-zinc-700 rounded-lg p-5 mb-4 flex gap-4">
          <div class="flex-1">
            <label class="text-xs text-zinc-500 mb-1 block">Round</label>
            <input v-model="store.round" type="text" autocomplete="off" placeholder="e.g. Winners Finals"
              class="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500" />
          </div>
          <div>
            <label class="text-xs text-zinc-500 mb-1 block">Best of</label>
            <div class="flex gap-1">
              <button v-for="n in [3, 5, 7]" :key="n"
                class="w-9 h-9 rounded text-sm font-medium transition-colors"
                :class="store.bestOf === n ? 'bg-brand-800 text-white' : 'bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white'"
                @click="store.bestOf = n">{{ n }}</button>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex gap-2">
            <button class="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded transition-colors" @click="swapPlayers">Swap</button>
            <button class="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded transition-colors" @click="resetScores">Reset</button>
          </div>
          <div class="flex items-center gap-3">
            <span v-if="sent" class="text-xs text-green-400">Sent!</span>
            <button v-if="selectedSet" class="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded transition-colors" @click="reportSet">
              Report Set
            </button>
            <button class="px-5 py-2 bg-brand-800 hover:bg-brand-700 text-white text-sm font-semibold rounded transition-colors" @click="sendOverlay">
              Send to Overlay
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import CustomSelect from '../components/CustomSelect.vue';
import PlayerAutocomplete from '../components/PlayerAutocomplete.vue';
import { scoreboardStore as store } from '../stores/scoreboard';
import { bracketStore, type CachedSetData } from '../stores/bracket';
import { GetAll as GetAllTournaments } from '../../wailsjs/go/system/TournamentHandler';
import { GetByTournament, CreateSet, UpdateScore, ReportResult, DeleteSet } from '../../wailsjs/go/system/SetHandler';
import { GetAll as GetAllPlayers } from '../../wailsjs/go/system/PlayerHandler';
import { GetGameManifest } from '../../wailsjs/go/system/AssetHandler';
import { BroadcastMessage } from '../../wailsjs/go/system/ServerHandler';
import { dto, model } from '../../wailsjs/go/models';

const tournaments      = ref<model.Tournament[]>([]);
const sets             = ref<model.Set[]>([]);
const players          = ref<model.Player[]>([]);
const selectedTournamentId = ref('');
const selectedSet      = ref<model.Set | null>(null);
const gameManifest     = ref<any>(null);
const sent             = ref(false);
const displayNames = bracketStore.displayNames;

const selectedTournamentName = computed(() =>
  tournaments.value.find(t => t.id === selectedTournamentId.value)?.name ?? ''
);
const upcomingSets  = computed(() => sets.value.filter(s => s.status !== 'COMPLETED'));
const completedSets = computed(() => sets.value.filter(s => s.status === 'COMPLETED'));
const charactersPerPlayer = computed(() => gameManifest.value?.characters_per_player ?? 1);

function setCharacter(side: 'player1' | 'player2', index: number, value: string) {
  const arr = [...store[`${side}Characters`]];
  arr[index] = value;
  store[`${side}Characters`] = arr;
}

function initCharacterSlots(count: number) {
  store.player1Characters = Array(count).fill('');
  store.player2Characters = Array(count).fill('');
}

function cacheSet(id: string) {
  displayNames[id] = {
    p1Name:       store.player1Name,
    p1Team:       store.player1Team,
    p1Characters: [...store.player1Characters],
    p2Name:       store.player2Name,
    p2Team:       store.player2Team,
    p2Characters: [...store.player2Characters],
  };
}

function setLabel(s: model.Set): string {
  const isSelected = selectedSet.value?.id === s.id;
  const cached = displayNames[s.id];
  const p1 = s.player1?.tag || s.player1_id || (isSelected ? store.player1Name : cached?.p1Name) || '?';
  const p2 = s.player2?.tag || s.player2_id || (isSelected ? store.player2Name : cached?.p2Name) || '?';
  return `${p1} vs ${p2}`;
}

async function onTournamentSelect(id: string) {
  sets.value = [];
  selectedSet.value = null;
  gameManifest.value = null;
  if (!id) return;
  const tournament = tournaments.value.find(t => t.id === id);
  try {
    const [setsResult, manifest] = await Promise.all([
      GetByTournament(id),
      GetGameManifest(tournament?.game ?? ''),
    ]);
    sets.value = setsResult ?? [];
    gameManifest.value = manifest;
    initCharacterSlots(manifest?.characters_per_player ?? 1);
  } catch (err) { console.error(err); }
}

function loadSet(s: model.Set) {
  selectedSet.value  = s;
  const cached       = displayNames[s.id];
  store.player1Name       = s.player1?.tag  || cached?.p1Name || '';
  store.player1Team       = s.player1?.team || cached?.p1Team || '';
  store.player1Score      = s.player1_score;
  store.player1Characters = s.player1 ? Array(charactersPerPlayer.value).fill('') : (cached?.p1Characters ?? Array(charactersPerPlayer.value).fill(''));
  store.player2Name       = s.player2?.tag  || cached?.p2Name || '';
  store.player2Team       = s.player2?.team || cached?.p2Team || '';
  store.player2Score      = s.player2_score;
  store.player2Characters = s.player2 ? Array(charactersPerPlayer.value).fill('') : (cached?.p2Characters ?? Array(charactersPerPlayer.value).fill(''));
  store.round             = s.round;
  store.bestOf            = s.best_of || 3;
}

async function loadSets() {
  if (!selectedTournamentId.value) { sets.value = []; return; }
  try { sets.value = (await GetByTournament(selectedTournamentId.value)) ?? []; }
  catch (err) { console.error(err); }
}

async function quickMatch() {
  if (!selectedTournamentId.value) return;
  try {
    const newSet = await CreateSet(dto.CreateSetRequest.createFrom({
      tournament_id: selectedTournamentId.value,
      player1_id: '', player2_id: '',
      round: 'Quick Match', best_of: 3,
    }));
    await loadSets();
    if (newSet) loadSet(newSet);
  } catch (err) { console.error(err); }
}

async function sendOverlay() {
  if (selectedSet.value) cacheSet(selectedSet.value.id);
  await BroadcastMessage('scoreboard.update', {
    player1Name: store.player1Name, player1Team: store.player1Team,
    player1Score: store.player1Score, player1Characters: store.player1Characters,
    player2Name: store.player2Name, player2Team: store.player2Team,
    player2Score: store.player2Score, player2Characters: store.player2Characters,
    round: store.round, bestOf: store.bestOf,
  });
  if (selectedSet.value) {
    UpdateScore(dto.UpdateSetScoreRequest.createFrom({
      set_id: selectedSet.value.id,
      player1_score: store.player1Score,
      player2_score: store.player2Score,
    })).catch(console.error);
  }
  sent.value = true;
  setTimeout(() => { sent.value = false; }, 1500);
}

async function reportSet() {
  if (!selectedSet.value) return;
  // Cache all fields before the set is deselected (important for quick matches with no player IDs).
  cacheSet(selectedSet.value.id);
  const winnerId = store.player1Score > store.player2Score
    ? selectedSet.value.player1_id
    : selectedSet.value.player2_id;
  try {
    await ReportResult(dto.ReportSetRequest.createFrom({
      set_id: selectedSet.value.id,
      winner_id: winnerId,
      player1_score: store.player1Score,
      player2_score: store.player2Score,
    }));
    await loadSets();
    selectedSet.value = null;
  } catch (err) { console.error(err); }
}

function swapPlayers() {
  [store.player1Name,       store.player2Name]       = [store.player2Name,       store.player1Name];
  [store.player1Team,       store.player2Team]        = [store.player2Team,       store.player1Team];
  [store.player1Score,      store.player2Score]       = [store.player2Score,      store.player1Score];
  [store.player1Characters, store.player2Characters]  = [store.player2Characters, store.player1Characters];
}

function resetScores() {
  store.player1Score = 0;
  store.player2Score = 0;
}

async function deleteSet(id: string) {
  try {
    await DeleteSet(id);
    if (selectedSet.value?.id === id) selectedSet.value = null;
    await loadSets();
  } catch (err) { console.error(err); }
}

onMounted(async () => {
  try {
    const [trns, plrs] = await Promise.all([GetAllTournaments(), GetAllPlayers()]);
    tournaments.value = trns ?? [];
    players.value = plrs ?? [];
    const saved = localStorage.getItem('selectedTournamentId');
    if (saved && tournaments.value.some(t => t.id === saved)) {
      selectedTournamentId.value = saved;
      await onTournamentSelect(saved);
    }
  } catch (err) { console.error(err); }
});
</script>
