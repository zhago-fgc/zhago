<template>
  <div class="flex h-full overflow-hidden">

    <!-- Left: overlay type tabs -->
    <div class="w-48 shrink-0 bg-zinc-950 border-r border-zinc-800 flex flex-col">
      <div class="p-3 border-b border-zinc-800 text-[10px] text-zinc-600 uppercase tracking-widest font-medium">
        Production
      </div>
      <div class="flex-1 overflow-y-auto">
        <div v-if="overlayTypes.length === 0" class="p-4 text-sm text-zinc-600">No packs installed.</div>
        <button
          v-for="t in overlayTypes" :key="t.type"
          class="w-full text-left px-3 py-2.5 border-b border-zinc-800/50 text-sm transition-colors"
          :class="activeType === t.type ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-white'"
          @click="selectType(t.type)">
          {{ t.name }}
        </button>
      </div>
    </div>

    <!-- Right: type panel -->
    <div class="flex-1 overflow-y-auto">
      <div v-if="!activeType" class="p-6 text-zinc-500 text-sm">No overlay packs installed.</div>

      <!-- ─── SCOREBOARD ─────────────────────────────────── -->
      <div v-else-if="activeType === 'scoreboard'" class="p-6">

        <!-- Set picker -->
        <div class="flex gap-3 mb-5">
          <div class="flex-1">
            <label class="text-xs text-zinc-500 mb-1 block">Tournament</label>
            <CustomSelect
              v-model="selectedTournamentId"
              :options="tournaments.map(t => ({ value: t.id, label: t.name }))"
              placeholder="Select tournament"
              empty-text="No tournaments."
              @update:modelValue="onTournamentSelect" />
          </div>
          <div class="flex-1">
            <label class="text-xs text-zinc-500 mb-1 block">Active Set</label>
            <CustomSelect
              v-model="selectedSetId"
              :options="availableSets.map(s => ({ value: s.id, label: setLabel(s) }))"
              placeholder="Select set"
              empty-text="No sets."
              @update:modelValue="onSetSelect" />
          </div>
        </div>

        <!-- Player cards -->
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div class="bg-zinc-800 border border-zinc-700 rounded-lg p-5">
            <div class="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">Player 1</div>
            <div class="flex flex-col gap-3">
              <div>
                <label class="text-xs text-zinc-500 mb-1 block">Tag</label>
                <PlayerAutocomplete v-model="store.player1Name" :players="players" placeholder="Player tag"
                  @select="p => { store.player1Name = p.tag; store.player1Team = p.team; }" />
              </div>
              <div>
                <label class="text-xs text-zinc-500 mb-1 block">Team</label>
                <input v-model="store.player1Team" type="text" autocomplete="off" placeholder="Team tag"
                  class="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500" />
              </div>
              <div>
                <label class="text-xs text-zinc-500 mb-1 block">Character</label>
                <input v-model="store.player1Character" type="text" autocomplete="off" placeholder="Character"
                  class="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500" />
              </div>
              <div>
                <label class="text-xs text-zinc-500 mb-1 block">Score</label>
                <div class="flex items-center gap-2">
                  <button class="w-8 h-8 bg-zinc-700 hover:bg-zinc-600 rounded text-white text-lg leading-none transition-colors"
                    @click="store.player1Score = Math.max(0, store.player1Score - 1)">−</button>
                  <span class="w-10 text-center text-xl font-bold">{{ store.player1Score }}</span>
                  <button class="w-8 h-8 bg-zinc-700 hover:bg-zinc-600 rounded text-white text-lg leading-none transition-colors"
                    @click="store.player1Score++">+</button>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-zinc-800 border border-zinc-700 rounded-lg p-5">
            <div class="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">Player 2</div>
            <div class="flex flex-col gap-3">
              <div>
                <label class="text-xs text-zinc-500 mb-1 block">Tag</label>
                <PlayerAutocomplete v-model="store.player2Name" :players="players" placeholder="Player tag"
                  @select="p => { store.player2Name = p.tag; store.player2Team = p.team; }" />
              </div>
              <div>
                <label class="text-xs text-zinc-500 mb-1 block">Team</label>
                <input v-model="store.player2Team" type="text" autocomplete="off" placeholder="Team tag"
                  class="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500" />
              </div>
              <div>
                <label class="text-xs text-zinc-500 mb-1 block">Character</label>
                <input v-model="store.player2Character" type="text" autocomplete="off" placeholder="Character"
                  class="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500" />
              </div>
              <div>
                <label class="text-xs text-zinc-500 mb-1 block">Score</label>
                <div class="flex items-center gap-2">
                  <button class="w-8 h-8 bg-zinc-700 hover:bg-zinc-600 rounded text-white text-lg leading-none transition-colors"
                    @click="store.player2Score = Math.max(0, store.player2Score - 1)">−</button>
                  <span class="w-10 text-center text-xl font-bold">{{ store.player2Score }}</span>
                  <button class="w-8 h-8 bg-zinc-700 hover:bg-zinc-600 rounded text-white text-lg leading-none transition-colors"
                    @click="store.player2Score++">+</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Round + best of -->
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

        <!-- Actions -->
        <div class="flex items-center justify-between">
          <div class="flex gap-2">
            <button class="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded transition-colors" @click="swapPlayers">Swap</button>
            <button class="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded transition-colors" @click="resetScores">Reset</button>
          </div>
          <div class="flex items-center gap-3">
            <span v-if="!serverRunning" class="text-xs text-zinc-500">Server offline.</span>
            <span v-if="sent" class="text-xs text-green-400">Sent!</span>
            <button v-if="selectedSet" class="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded transition-colors" @click="reportSet">
              Report Set
            </button>
            <button
              class="px-5 py-2 bg-brand-800 hover:bg-brand-700 text-white text-sm font-semibold rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              :disabled="!serverRunning"
              @click="sendScoreboard">
              Send to Overlay
            </button>
          </div>
        </div>
      </div>

      <!-- ─── COMMENTARY ──────────────────────────────────── -->
      <div v-else-if="activeType === 'commentary'" class="p-6">
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div v-for="(c, i) in commentators" :key="i" class="bg-zinc-800 border border-zinc-700 rounded-lg p-5">
            <div class="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">Commentator {{ i + 1 }}</div>
            <div class="flex flex-col gap-3">
              <div>
                <label class="text-xs text-zinc-500 mb-1 block">Name</label>
                <input v-model="c.name" type="text" autocomplete="off" placeholder="Full name"
                  class="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500" />
              </div>
              <div>
                <label class="text-xs text-zinc-500 mb-1 block">Handle</label>
                <input v-model="c.handle" type="text" autocomplete="off" placeholder="@handle"
                  class="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500" />
              </div>
              <div>
                <label class="text-xs text-zinc-500 mb-1 block">Pronouns</label>
                <input v-model="c.pronouns" type="text" autocomplete="off" placeholder="they/them"
                  class="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500" />
              </div>
            </div>
          </div>
        </div>
        <div class="flex items-center justify-end gap-3">
          <span v-if="!serverRunning" class="text-xs text-zinc-500">Server offline.</span>
          <span v-if="sent" class="text-xs text-green-400">Sent!</span>
          <button
            class="px-5 py-2 bg-brand-800 hover:bg-brand-700 text-white text-sm font-semibold rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            :disabled="!serverRunning"
            @click="sendCommentary">
            Send to Overlay
          </button>
        </div>
      </div>

      <!-- ─── BRB / TIMER ────────────────────────────────── -->
      <div v-else-if="activeType === 'brb'" class="p-6">
        <div class="bg-zinc-800 border border-zinc-700 rounded-lg p-6 max-w-md">
          <div class="text-5xl font-bold text-white text-center mb-6 tabular-nums">{{ displayTime }}</div>
          <div class="flex gap-2 mb-4 justify-center flex-wrap">
            <button v-for="preset in timerPresets" :key="preset.label"
              class="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded transition-colors"
              @click="setTimerDuration(preset.seconds)">
              {{ preset.label }}
            </button>
          </div>
          <div class="mb-4">
            <label class="text-xs text-zinc-500 mb-1 block">Custom message</label>
            <input v-model="timerMessage" type="text" autocomplete="off" placeholder="We'll be right back!"
              class="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500" />
          </div>
          <div class="flex gap-2">
            <button class="flex-1 py-2 bg-brand-800 hover:bg-brand-700 text-white text-sm font-semibold rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              :disabled="timerRunning || !serverRunning" @click="startTimer">Start</button>
            <button class="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded transition-colors" @click="stopTimer">Stop</button>
            <button class="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded transition-colors" @click="resetTimer">Reset</button>
          </div>
          <div v-if="!serverRunning" class="mt-3 text-xs text-zinc-500 text-center">Server offline — start it in Settings.</div>
        </div>
      </div>

      <!-- ─── GENERIC (manifest-driven) ─────────────────── -->
      <div v-else class="p-6">
        <div v-if="loadingManifest" class="text-zinc-500 text-sm">Loading manifest…</div>
        <div v-else-if="!manifest" class="text-zinc-500 text-sm">
          No <code class="bg-zinc-800 px-1 py-0.5 rounded text-zinc-400">manifest.json</code> found for
          <span class="text-zinc-300">{{ activeType }}</span>.
        </div>
        <div v-else>
          <div class="text-xs text-zinc-500 mb-6">
            {{ manifest.name }}
            <span v-if="manifest.subscribes?.[0]">
              · broadcasts <code class="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">{{ manifest.subscribes[0] }}</code>
            </span>
          </div>
          <div v-if="manifest.fields.length === 0" class="text-zinc-500 text-sm mb-6">No fields defined in manifest.</div>
          <div v-else class="grid grid-cols-2 gap-4 mb-6">
            <div v-for="field in manifest.fields" :key="field.key">
              <label class="text-xs text-zinc-500 mb-1 block">{{ field.label }}</label>
              <div v-if="field.type === 'number'" class="flex items-center gap-2">
                <button class="w-8 h-8 bg-zinc-700 hover:bg-zinc-600 rounded text-white text-lg leading-none transition-colors"
                  @click="genericForm[field.key] = Math.max(0, (genericForm[field.key] ?? 0) - 1)">−</button>
                <span class="w-10 text-center text-xl font-bold">{{ genericForm[field.key] ?? 0 }}</span>
                <button class="w-8 h-8 bg-zinc-700 hover:bg-zinc-600 rounded text-white text-lg leading-none transition-colors"
                  @click="genericForm[field.key] = (genericForm[field.key] ?? 0) + 1">+</button>
              </div>
              <CustomSelect
                v-else-if="field.type === 'select'"
                :model-value="genericForm[field.key] ?? ''"
                :options="(field.options ?? []).map((o: string) => ({ value: o, label: o }))"
                :placeholder="field.label"
                empty-text="No options."
                @update:modelValue="(v: string) => { genericForm[field.key] = v }" />
              <textarea v-else-if="field.type === 'textarea'"
                v-model="genericForm[field.key]" rows="3" :placeholder="field.label"
                class="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 resize-none" />
              <input v-else v-model="genericForm[field.key]" type="text" autocomplete="off" :placeholder="field.label"
                class="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500" />
            </div>
          </div>
          <div class="flex items-center gap-3">
            <button
              class="px-5 py-2 bg-brand-800 hover:bg-brand-700 text-white text-sm font-semibold rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              :disabled="!serverRunning || !manifest.subscribes?.[0]"
              @click="sendGeneric">
              Send to Overlay
            </button>
            <button class="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded transition-colors" @click="clearGenericForm">Clear</button>
            <span v-if="!serverRunning" class="text-xs text-zinc-500">Server offline.</span>
            <span v-if="sent" class="text-xs text-green-400">Sent!</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, onUnmounted } from 'vue';
import { ListPacks, GetOverlayManifest } from '../../wailsjs/go/system/TemplateHandler';
import { IsRunning, BroadcastMessage, Broadcast } from '../../wailsjs/go/system/ServerHandler';
import { GetAll as GetAllTournaments } from '../../wailsjs/go/system/TournamentHandler';
import { GetByTournament, ReportResult } from '../../wailsjs/go/system/SetHandler';
import { GetAll as GetAllPlayers } from '../../wailsjs/go/system/PlayerHandler';
import { scoreboardStore as store } from '../stores/scoreboard';
import { dto, model } from '../../wailsjs/go/models';
import CustomSelect from '../components/CustomSelect.vue';
import PlayerAutocomplete from '../components/PlayerAutocomplete.vue';

// ── Shared state ──────────────────────────────────────────
const packs        = ref<any[]>([]);
const serverRunning = ref(false);
const sent         = ref(false);
const activeType   = ref('');

function flash() { sent.value = true; setTimeout(() => { sent.value = false; }, 1500); }

function typeLabel(type: string) {
  return type.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

const overlayTypes = computed(() => {
  const seen = new Set<string>();
  const result: { type: string; name: string }[] = [];
  for (const pack of packs.value) {
    for (const type of (pack.overlays ?? [])) {
      if (!seen.has(type)) { seen.add(type); result.push({ type, name: typeLabel(type) }); }
    }
  }
  return result;
});

async function selectType(type: string) {
  sent.value = false;
  activeType.value = type;
  if (!['scoreboard', 'commentary', 'brb'].includes(type)) {
    await loadManifest(type);
  }
}

// ── Scoreboard ────────────────────────────────────────────
const tournaments      = ref<model.Tournament[]>([]);
const availableSets    = ref<model.Set[]>([]);
const players          = ref<model.Player[]>([]);
const selectedTournamentId = ref('');
const selectedSetId    = ref('');
const selectedSet      = ref<model.Set | null>(null);

function setLabel(s: model.Set): string {
  const p1 = s.player1?.tag || s.player1_id || '?';
  const p2 = s.player2?.tag || s.player2_id || '?';
  return `${p1} vs ${p2}`;
}

async function onTournamentSelect(id: string) {
  selectedSetId.value = '';
  selectedSet.value = null;
  availableSets.value = [];
  if (!id) return;
  try {
    const result = await GetByTournament(id);
    availableSets.value = (result ?? []).filter(s => s.status !== 'COMPLETED');
  } catch {}
}

function onSetSelect(id: string) {
  const s = availableSets.value.find(s => s.id === id) ?? null;
  selectedSet.value = s;
  if (!s) return;
  store.player1Name      = s.player1?.tag ?? '';
  store.player1Team      = s.player1?.team ?? '';
  store.player1Score     = s.player1_score;
  store.player1Character = '';
  store.player2Name      = s.player2?.tag ?? '';
  store.player2Team      = s.player2?.team ?? '';
  store.player2Score     = s.player2_score;
  store.player2Character = '';
  store.round            = s.round;
  store.bestOf           = s.best_of || 3;
}

function swapPlayers() {
  [store.player1Name,      store.player2Name]      = [store.player2Name,      store.player1Name];
  [store.player1Team,      store.player2Team]       = [store.player2Team,      store.player1Team];
  [store.player1Score,     store.player2Score]      = [store.player2Score,     store.player1Score];
  [store.player1Character, store.player2Character]  = [store.player2Character, store.player1Character];
}

function resetScores() {
  store.player1Score = 0;
  store.player2Score = 0;
}

async function reportSet() {
  if (!selectedSet.value) return;
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
    selectedSet.value = null;
    selectedSetId.value = '';
    await onTournamentSelect(selectedTournamentId.value);
  } catch (err) {
    console.error('Failed to report set:', err);
  }
}

async function sendScoreboard() {
  await BroadcastMessage('scoreboard.update', {
    player1Name: store.player1Name,
    player1Team: store.player1Team,
    player1Score: store.player1Score,
    player1Character: store.player1Character,
    player2Name: store.player2Name,
    player2Team: store.player2Team,
    player2Score: store.player2Score,
    player2Character: store.player2Character,
    round: store.round,
    bestOf: store.bestOf,
  });
  flash();
}

// ── Commentary ────────────────────────────────────────────
const commentators = reactive([
  { name: '', handle: '', pronouns: '' },
  { name: '', handle: '', pronouns: '' },
]);

async function sendCommentary() {
  Broadcast({ type: 'commentary.update', payload: { commentators } } as any);
  flash();
}

// ── BRB / Timer ───────────────────────────────────────────
const timerPresets = [
  { label: '3m', seconds: 180 },
  { label: '5m', seconds: 300 },
  { label: '10m', seconds: 600 },
  { label: '15m', seconds: 900 },
];

const timerRemaining = ref(300);
const timerRunning   = ref(false);
const timerMessage   = ref('');
let   timerInterval: ReturnType<typeof setInterval> | null = null;

const displayTime = computed(() => {
  const m = Math.floor(timerRemaining.value / 60).toString().padStart(2, '0');
  const s = (timerRemaining.value % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
});

function setTimerDuration(seconds: number) { stopTimer(); timerRemaining.value = seconds; }

function startTimer() {
  if (timerRunning.value) return;
  timerRunning.value = true;
  const target = Date.now() + timerRemaining.value * 1000;
  Broadcast({ type: 'timer.start', payload: { target, message: timerMessage.value } } as any);
  timerInterval = setInterval(() => {
    timerRemaining.value = Math.max(0, Math.round((target - Date.now()) / 1000));
    if (timerRemaining.value === 0) stopTimer();
  }, 500);
}

function stopTimer() {
  timerRunning.value = false;
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  Broadcast({ type: 'timer.stop', payload: {} } as any);
}

function resetTimer() { stopTimer(); timerRemaining.value = 300; }

// ── Generic manifest form ─────────────────────────────────
const manifest      = ref<any>(null);
const loadingManifest = ref(false);
const genericForm   = ref<Record<string, any>>({});

async function loadManifest(type: string) {
  manifest.value = null;
  genericForm.value = {};
  loadingManifest.value = true;
  try {
    const m = await GetOverlayManifest(type);
    manifest.value = m;
    if (m?.fields) {
      for (const field of m.fields) {
        genericForm.value[field.key] = field.type === 'number' ? 0 : '';
      }
    }
  } catch {
    manifest.value = null;
  } finally {
    loadingManifest.value = false;
  }
}

async function sendGeneric() {
  if (!manifest.value?.subscribes?.[0]) return;
  await BroadcastMessage(manifest.value.subscribes[0], { ...genericForm.value });
  flash();
}

function clearGenericForm() {
  if (!manifest.value?.fields) return;
  for (const field of manifest.value.fields) {
    genericForm.value[field.key] = field.type === 'number' ? 0 : '';
  }
}

// ── Mount ─────────────────────────────────────────────────
onMounted(async () => {
  try {
    const [pkgs, running, trns, plrs] = await Promise.all([
      ListPacks(), IsRunning(), GetAllTournaments(), GetAllPlayers(),
    ]);
    packs.value = pkgs ?? [];
    serverRunning.value = running;
    tournaments.value = trns ?? [];
    players.value = plrs ?? [];

    // Default to first overlay type
    if (overlayTypes.value.length) selectType(overlayTypes.value[0].type);

    // If navigated from Bracket, pre-select the active tournament + set
    if (store.activeTournamentId) {
      selectedTournamentId.value = store.activeTournamentId;
      await onTournamentSelect(store.activeTournamentId);
      if (store.activeSetId) {
        selectedSetId.value = store.activeSetId;
        onSetSelect(store.activeSetId);
      }
    }
  } catch {}
});

onUnmounted(stopTimer);
</script>
