<template>
  <div class="p-8">
    <div class="mb-6">
      <h1 class="text-2xl font-bold tracking-wide">Home</h1>
    </div>

    <div v-if="activeTournament" class="bg-zinc-800 border border-zinc-700 rounded-lg p-5 mb-6 flex items-center justify-between">
      <div>
        <div class="text-xs text-zinc-400 uppercase tracking-widest mb-1">Live now</div>
        <div class="text-lg font-semibold text-white">{{ activeTournament.name }}</div>
        <div class="text-sm text-zinc-400 mt-0.5">{{ activeTournament.game || 'No game set' }}</div>
      </div>
      <RouterLink to="/bracket" class="px-4 py-2 bg-brand-800 hover:bg-brand-700 text-white text-sm rounded transition-colors">
        Continue →
      </RouterLink>
    </div>

    <div class="flex gap-3 mb-6">
      <button class="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-sm text-white rounded transition-colors" @click="showCreateEvent = true">
        + New Event
      </button>
      <button class="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-sm text-white rounded transition-colors"
        @click="toggleStartggImport">
        Import start.gg
      </button>
      <button class="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-sm text-zinc-400 rounded transition-colors cursor-not-allowed" disabled title="Coming soon">
        Import Challonge
      </button>
    </div>

    <!-- start.gg import form -->
    <div v-if="showStartggImport" class="bg-zinc-800 border border-zinc-700 rounded-lg p-5 mb-6">
      <h2 class="text-sm font-semibold text-zinc-300 mb-3">Import from start.gg</h2>
      <div class="flex flex-col gap-3">
        <div class="flex gap-3">
          <input v-model="startggUrl" type="text" placeholder="https://start.gg/tournament/your-tournament"
            autocomplete="off"
            class="flex-1 bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500" />
        </div>
        <div v-if="!startggToken" class="text-xs text-yellow-400">
          No start.gg token found. Add one in <RouterLink to="/settings" class="underline hover:text-yellow-300">Settings → API Keys</RouterLink>.
        </div>
        <div v-if="importError" class="text-xs text-red-400">{{ importError }}</div>
        <div v-if="importSuccess" class="text-xs text-green-400">Import complete. Events and brackets have been created.</div>
        <div class="flex gap-2">
          <button class="px-4 py-2 bg-brand-800 hover:bg-brand-700 text-white text-sm rounded transition-colors disabled:opacity-50"
            :disabled="!startggUrl.trim() || !startggToken || importing"
            @click="runStartggImport">
            {{ importing ? 'Importing...' : 'Import' }}
          </button>
          <button class="px-3 py-2 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded transition-colors"
            @click="showStartggImport = false">
            Cancel
          </button>
        </div>
      </div>
    </div>

    <div v-if="showCreateEvent" class="bg-zinc-800 border border-zinc-700 rounded-lg p-5 mb-6">
      <h2 class="text-sm font-semibold text-zinc-300 mb-3">New Event</h2>
      <div class="flex gap-3">
        <input v-model="newEventName" type="text" placeholder="Event name" autocomplete="off"
          class="flex-1 bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
          @keydown.enter="createEvent" />
        <button class="px-4 py-2 bg-brand-800 hover:bg-brand-700 text-white text-sm rounded transition-colors disabled:opacity-50"
          :disabled="!newEventName.trim() || creating" @click="createEvent">
          {{ creating ? 'Creating...' : 'Create' }}
        </button>
        <button class="px-3 py-2 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded transition-colors" @click="showCreateEvent = false">
          Cancel
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-zinc-500 text-sm">Loading...</div>

    <div v-else-if="events.length === 0" class="text-zinc-500 text-sm">
      No events yet. Create one to get started.
    </div>

    <div v-else class="flex flex-col gap-4">
      <div v-for="event in events" :key="event.id" class="bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden">

        <!-- Event header -->
        <div class="px-5 py-3 border-b border-zinc-700/50 flex items-center justify-between group">
          <div class="flex items-center gap-3">
            <span class="text-sm font-semibold text-white">{{ event.name }}</span>
            <span :class="statusClass(event.status)" class="px-2 py-0.5 rounded text-xs font-medium">{{ event.status }}</span>
          </div>
          <div class="flex items-center gap-1">
            <!-- Delete event with inline confirm -->
            <template v-if="confirmDeleteEvent === event.id">
              <span class="text-xs text-zinc-400 mr-1">Delete event and all its tournaments?</span>
              <button class="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-zinc-700 transition-colors"
                @click.stop="deleteEvent(event.id)">Yes, delete</button>
              <button class="text-xs text-zinc-500 hover:text-white px-2 py-1 rounded hover:bg-zinc-700 transition-colors"
                @click.stop="confirmDeleteEvent = null">Cancel</button>
            </template>
            <button v-else
              class="opacity-0 group-hover:opacity-100 text-xs text-zinc-500 hover:text-red-400 transition-all px-2 py-1 rounded hover:bg-zinc-700"
              @click.stop="confirmDeleteEvent = event.id">Delete</button>
            <button class="text-xs text-zinc-500 hover:text-white transition-colors px-2 py-1 rounded hover:bg-zinc-700"
              @click="openCreateTournament(event.id)">
              + Tournament
            </button>
          </div>
        </div>

        <!-- Add tournament form -->
        <div v-if="createTournamentForEvent === event.id" class="px-5 py-3 border-b border-zinc-700/50 bg-zinc-900/50">
          <div class="flex gap-2">
            <input v-model="newTournamentName" type="text" placeholder="Tournament name" autocomplete="off"
              class="flex-1 bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500" />
            <CustomSelect
              v-if="gameOptions.length > 0"
              v-model="newTournamentGame"
              :options="gameOptions"
              placeholder="Game"
              empty-text="No assets installed."
              class="w-56" />
            <input v-else v-model="newTournamentGame" type="text" placeholder="Game (e.g. SF6)" autocomplete="off"
              class="w-36 bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500" />
            <button class="px-3 py-1.5 bg-brand-800 hover:bg-brand-700 text-white text-sm rounded transition-colors disabled:opacity-50"
              :disabled="!newTournamentName.trim() || creatingTournament" @click="createTournament(event.id)">
              Add
            </button>
            <button class="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded transition-colors"
              @click="createTournamentForEvent = null">
              Cancel
            </button>
          </div>
        </div>

        <!-- Tournament list -->
        <div v-if="tournamentsForEvent(event.id).length === 0" class="px-5 py-4 text-sm text-zinc-600">
          No tournaments yet.
        </div>
        <div v-else>
          <div v-for="t in tournamentsForEvent(event.id)" :key="t.id"
            class="border-b border-zinc-700/30 last:border-0">

            <!-- Edit mode -->
            <div v-if="editingTournament === t.id" class="flex gap-2 px-5 py-2.5 bg-zinc-900/50">
              <input v-model="editName" type="text" placeholder="Tournament name" autocomplete="off"
                class="flex-1 bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                @keydown.enter="saveEdit(t.id)" />
              <CustomSelect
                v-if="gameOptions.length > 0"
                v-model="editGame"
                :options="gameOptions"
                placeholder="Game"
                empty-text="No assets installed."
                class="w-56" />
              <input v-else v-model="editGame" type="text" placeholder="Game" autocomplete="off"
                class="w-36 bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500" />
              <button class="px-3 py-1.5 bg-brand-800 hover:bg-brand-700 text-white text-sm rounded transition-colors"
                @click="saveEdit(t.id)">Save</button>
              <button class="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded transition-colors"
                @click="editingTournament = null">Cancel</button>
            </div>

            <!-- View mode -->
            <div v-else class="flex items-center justify-between px-5 py-3 hover:bg-zinc-700/30 transition-colors group">
              <RouterLink to="/bracket" class="flex items-center gap-3 flex-1 min-w-0"
                @click="selectTournament(t.id)">
                <span class="text-sm text-white">{{ t.name }}</span>
                <span v-if="t.game" class="text-xs text-zinc-400 bg-zinc-700 px-1.5 py-0.5 rounded">{{ t.game }}</span>
                <span class="text-xs text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded">{{ t.source }}</span>
              </RouterLink>
              <div class="flex items-center gap-2 shrink-0 ml-2">
                <span :class="statusClass(t.status)" class="text-xs font-medium px-2 py-0.5 rounded">{{ t.status }}</span>
                <button class="opacity-0 group-hover:opacity-100 text-xs text-zinc-500 hover:text-white transition-all px-2 py-1 rounded hover:bg-zinc-700"
                  @click.stop="openEdit(t)">Edit</button>
                <!-- Delete tournament with inline confirm -->
                <template v-if="confirmDeleteTournament === t.id">
                  <button class="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-zinc-700 transition-colors"
                    @click.stop="deleteTournament(t.id)">Yes, delete</button>
                  <button class="text-xs text-zinc-500 hover:text-white px-2 py-1 rounded hover:bg-zinc-700 transition-colors"
                    @click.stop="confirmDeleteTournament = null">Cancel</button>
                </template>
                <button v-else
                  class="opacity-0 group-hover:opacity-100 text-xs text-zinc-500 hover:text-red-400 transition-all px-2 py-1 rounded hover:bg-zinc-700"
                  @click.stop="confirmDeleteTournament = t.id">Delete</button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { RouterLink } from 'vue-router';
import CustomSelect from '../components/CustomSelect.vue';
import { GetAllEvents, CreateEvent, DeleteEvent } from '../../bindings/zhago/internal/handler/system/eventhandler';
import { GetAll as GetAllTournaments, CreateTournament, UpdateTournament, DeleteTournament, ActivateTournament } from '../../bindings/zhago/internal/handler/system/tournamenthandler';
import { ListInstalledAssets } from '../../bindings/zhago/internal/handler/system/assethandler';
import { ImportTournament } from '../../bindings/zhago/internal/handler/system/startgghandler';
import { Event as ZhagoEvent, Tournament } from '../../bindings/zhago/internal/domain/model/models';
import { UpdateTournamentRequest, CreateEventRequest, CreateTournamentRequest } from '../../bindings/zhago/internal/dto/models';

const STARTGG_TOKEN_KEY = 'zhago:startgg_token';
const startggToken       = ref('');
const showStartggImport  = ref(false);
const startggUrl         = ref('');
const importing          = ref(false);
const importError        = ref('');
const importSuccess      = ref(false);

function toggleStartggImport() {
  showStartggImport.value = !showStartggImport.value;
  importError.value = '';
  importSuccess.value = false;
}

async function runStartggImport() {
  if (!startggUrl.value.trim() || !startggToken.value || importing.value) return;
  importing.value = true;
  importError.value = '';
  importSuccess.value = false;
  try {
    await ImportTournament(startggUrl.value.trim(), startggToken.value);
    importSuccess.value = true;
    startggUrl.value = '';
    await load();
  } catch (err: any) {
    importError.value = err?.message ?? String(err);
  } finally {
    importing.value = false;
  }
}

const events           = ref<ZhagoEvent[]>([]);
const tournaments      = ref<Tournament[]>([]);
const installedAssets  = ref<any[]>([]);
const loading          = ref(true);

const gameOptions = computed(() =>
  installedAssets.value.map(a => ({ value: a.name, label: a.name }))
);

const showCreateEvent        = ref(false);
const newEventName           = ref('');
const creating               = ref(false);

const createTournamentForEvent = ref<string | null>(null);
const newTournamentName      = ref('');
const newTournamentGame      = ref('');
const creatingTournament     = ref(false);

const editingTournament      = ref<string | null>(null);
const editName               = ref('');
const editGame               = ref('');

const confirmDeleteEvent      = ref<string | null>(null);
const confirmDeleteTournament = ref<string | null>(null);

const activeTournament = computed(() =>
  tournaments.value.find(t => t.status === 'ACTIVE') ?? null
);

const selectedTournamentId = ref('');

function selectTournament(id: string) {
  selectedTournamentId.value = id;
  localStorage.setItem('selectedTournamentId', id);
  ActivateTournament(id).then(load).catch(console.error);
}

function tournamentsForEvent(eventId: string) {
  return tournaments.value.filter(t => t.event_id === eventId);
}

function openEdit(t: Tournament) {
  editingTournament.value = t.id;
  editName.value = t.name;
  editGame.value = t.game ?? '';
  confirmDeleteTournament.value = null;
}

async function saveEdit(id: string) {
  if (!editName.value.trim()) return;
  try {
    await UpdateTournament(UpdateTournamentRequest.createFrom({
      id,
      name: editName.value.trim(),
      game: editGame.value.trim(),
    }));
    editingTournament.value = null;
    await load();
  } catch (err) { console.error(err); }
}

async function load() {
  loading.value = true;
  try {
    const [evts, trns, assets] = await Promise.all([GetAllEvents(), GetAllTournaments(), ListInstalledAssets()]);
    events.value          = evts   ?? [];
    tournaments.value     = trns   ?? [];
    installedAssets.value = assets ?? [];
  } catch (err) {
    console.error('Failed to load:', err);
  } finally {
    loading.value = false;
  }
}

async function createEvent() {
  if (!newEventName.value.trim() || creating.value) return;
  creating.value = true;
  try {
    await CreateEvent(CreateEventRequest.createFrom({ name: newEventName.value.trim() }));
    newEventName.value = '';
    showCreateEvent.value = false;
    await load();
  } finally {
    creating.value = false;
  }
}

function openCreateTournament(eventId: string) {
  createTournamentForEvent.value = eventId;
  newTournamentName.value = '';
  newTournamentGame.value = '';
}

async function createTournament(eventId: string) {
  if (!newTournamentName.value.trim() || creatingTournament.value) return;
  creatingTournament.value = true;
  try {
    await CreateTournament(CreateTournamentRequest.createFrom({
      event_id: eventId,
      name: newTournamentName.value.trim(),
      game: newTournamentGame.value.trim(),
    }));
    createTournamentForEvent.value = null;
    await load();
  } finally {
    creatingTournament.value = false;
  }
}

function statusClass(status: string) {
  switch (status) {
    case 'ACTIVE':    return 'bg-green-500/20 text-green-400';
    case 'COMPLETED': return 'bg-zinc-500/20 text-zinc-400';
    case 'DISABLED':  return 'bg-yellow-500/20 text-yellow-400';
    default:          return 'bg-zinc-500/20 text-zinc-400';
  }
}

async function deleteEvent(id: string) {
  try {
    await DeleteEvent(id);
    confirmDeleteEvent.value = null;
    await load();
  } catch (err) { console.error(err); }
}

async function deleteTournament(id: string) {
  try {
    await DeleteTournament(id);
    confirmDeleteTournament.value = null;
    await load();
  } catch (err) { console.error(err); }
}

onMounted(() => {
  startggToken.value = localStorage.getItem(STARTGG_TOKEN_KEY) ?? '';
  load();
});
</script>
