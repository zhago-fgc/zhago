<template>
  <div class="p-8">
    <div class="mb-6">
      <h1 class="text-2xl font-bold tracking-wide">Commentary</h1>
      <p class="text-zinc-400 text-sm mt-1">Broadcast commentator data to overlays.</p>
    </div>

    <div class="grid grid-cols-2 gap-4 mb-4">
      <div v-for="(c, i) in commentators" :key="i" class="bg-zinc-800 border border-zinc-700 rounded-lg p-5">
        <div class="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">Commentator {{ i + 1 }}</div>
        <div class="flex flex-col gap-3">
          <div>
            <label class="text-xs text-zinc-500 mb-1 block">Name</label>
            <CommentatorAutocomplete
              v-model="c.name"
              :commentators="library"
              placeholder="Full name"
              @select="(caster) => { c.name = caster.name; c.handle = caster.handle; c.pronouns = caster.pronouns; }" />
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

    <div class="flex justify-end">
      <button class="px-6 py-2 bg-brand-800 hover:bg-brand-700 text-white text-sm font-semibold rounded transition-colors" @click="updateOverlay">
        Update Overlay
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';
import CommentatorAutocomplete from '../components/CommentatorAutocomplete.vue';
import { Broadcast } from '../../wailsjs/go/system/ServerHandler';
import { GetAll } from '../../wailsjs/go/system/CommentatorHandler';
import { model } from '../../wailsjs/go/models';

const commentators = reactive([
  { name: '', handle: '', pronouns: '' },
  { name: '', handle: '', pronouns: '' },
]);

const library = ref<model.Commentator[]>([]);

onMounted(async () => {
  try { library.value = (await GetAll()) ?? []; } catch {}
});

function updateOverlay() {
  Broadcast({ type: 'commentary.update', payload: { commentators } } as any);
}
</script>
