<template>
  <div class="relative" ref="rootRef">
    <input
      :value="modelValue"
      type="text"
      autocomplete="off"
      :placeholder="placeholder"
      class="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
      @input="onInput"
      @keydown="onKeydown"
      @focus="open = filtered.length > 0" />

    <div v-if="open && filtered.length"
      class="absolute z-20 mt-1 w-full bg-zinc-900 border border-zinc-700 rounded shadow-xl overflow-hidden">
      <button
        v-for="(p, i) in filtered" :key="p.id"
        class="w-full text-left px-3 py-2.5 transition-colors flex items-center gap-2"
        :class="i === activeIndex ? 'bg-zinc-700' : 'hover:bg-zinc-800'"
        @mousedown.prevent="select(p)">
        <span class="text-sm text-white font-medium">{{ p.tag }}</span>
        <span v-if="p.team" class="text-xs text-brand-400 bg-zinc-800 px-1.5 py-0.5 rounded">{{ p.team }}</span>
        <span v-if="p.region" class="text-xs text-zinc-500">{{ p.region }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps<{
  modelValue: string;
  players: { id: string; tag: string; team: string; region: string }[];
  placeholder?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
  'select': [player: { id: string; tag: string; team: string; region: string }];
}>();

const open = ref(false);
const activeIndex = ref(-1);
const rootRef = ref<HTMLElement | null>(null);

const filtered = computed(() => {
  const q = props.modelValue.trim().toLowerCase();
  if (!q) return [];
  return props.players.filter(p => p.tag.toLowerCase().includes(q)).slice(0, 8);
});

function onInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).value);
  activeIndex.value = -1;
  open.value = true;
}

function select(p: typeof props.players[0]) {
  emit('update:modelValue', p.tag);
  emit('select', p);
  open.value = false;
  activeIndex.value = -1;
}

function onKeydown(e: KeyboardEvent) {
  if (!open.value || !filtered.value.length) return;
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    activeIndex.value = Math.min(activeIndex.value + 1, filtered.value.length - 1);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    activeIndex.value = Math.max(activeIndex.value - 1, 0);
  } else if (e.key === 'Enter' && activeIndex.value >= 0) {
    e.preventDefault();
    select(filtered.value[activeIndex.value]);
  } else if (e.key === 'Escape') {
    open.value = false;
  }
}

function onClickOutside(e: MouseEvent) {
  if (rootRef.value && !rootRef.value.contains(e.target as Node)) {
    open.value = false;
  }
}

onMounted(() => document.addEventListener('mousedown', onClickOutside));
onUnmounted(() => document.removeEventListener('mousedown', onClickOutside));
</script>
