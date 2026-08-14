<template>
  <div class="p-8">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold tracking-wide">Commentators</h1>
      <button class="px-4 py-2 bg-brand-800 hover:bg-brand-700 text-white text-sm rounded transition-colors"
        @click="showCreate = !showCreate">
        {{ showCreate ? 'Cancel' : '+ Add Commentator' }}
      </button>
    </div>

    <div v-if="showCreate" class="bg-zinc-800 border border-zinc-700 rounded-lg p-5 mb-6">
      <h2 class="text-sm font-semibold text-zinc-300 mb-3">New Commentator</h2>
      <div class="flex gap-3">
        <input v-model="form.name" type="text" placeholder="Name *" autocomplete="off"
          class="flex-1 bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500" />
        <input v-model="form.handle" type="text" placeholder="@handle" autocomplete="off"
          class="w-40 bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500" />
        <input v-model="form.pronouns" type="text" placeholder="Pronouns" autocomplete="off"
          class="w-32 bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500" />
        <button class="px-4 py-2 bg-brand-800 hover:bg-brand-700 text-white text-sm rounded transition-colors disabled:opacity-50"
          :disabled="!form.name.trim() || creating" @click="createCommentator">
          {{ creating ? '...' : 'Add' }}
        </button>
      </div>
    </div>

    <div class="bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden">
      <div v-if="commentators.length === 0" class="px-5 py-10 text-center text-zinc-500 text-sm">
        No commentators yet.
      </div>
      <table v-else class="w-full text-sm">
        <thead>
          <tr class="border-b border-zinc-700 text-zinc-400 text-left">
            <th class="px-5 py-3 font-medium">Name</th>
            <th class="px-5 py-3 font-medium">Handle</th>
            <th class="px-5 py-3 font-medium">Pronouns</th>
            <th class="px-5 py-3"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in commentators" :key="c.id"
            class="border-b border-zinc-700/50 last:border-0 hover:bg-zinc-700/30 transition-colors group">
            <td class="px-5 py-3 text-white font-medium">{{ c.name }}</td>
            <td class="px-5 py-3 text-brand-400">{{ c.handle || '—' }}</td>
            <td class="px-5 py-3 text-zinc-400">{{ c.pronouns || '—' }}</td>
            <td class="px-5 py-3 text-right">
              <button class="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 transition-all text-xs px-2 py-1 rounded hover:bg-zinc-700"
                @click.stop="deleteCommentator(c.id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { GetAll, CreateCommentator, DeleteCommentator } from '../../bindings/zhago/internal/handler/system/commentatorhandler';
import { Commentator } from '../../bindings/zhago/internal/domain/model/models';
import { CreateCommentatorRequest } from '../../bindings/zhago/internal/dto/models';

const commentators = ref<Commentator[]>([]);
const creating     = ref(false);
const showCreate   = ref(false);
const form         = reactive({ name: '', handle: '', pronouns: '' });

async function load() {
  try { commentators.value = (await GetAll()) ?? []; } catch {}
}

async function createCommentator() {
  if (!form.name.trim() || creating.value) return;
  creating.value = true;
  try {
    await CreateCommentator(CreateCommentatorRequest.createFrom({
      name: form.name.trim(),
      handle: form.handle.trim(),
      pronouns: form.pronouns.trim(),
    }));
    form.name = ''; form.handle = ''; form.pronouns = '';
    showCreate.value = false;
    await load();
  } finally { creating.value = false; }
}

async function deleteCommentator(id: string) {
  try { await DeleteCommentator(id); await load(); } catch {}
}

onMounted(load);
</script>
