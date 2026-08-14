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
        v-for="(c, i) in filtered" :key="c.id"
        class="w-full text-left px-3 py-2.5 transition-colors flex items-center gap-2"
        :class="i === activeIndex ? 'bg-zinc-700' : 'hover:bg-zinc-800'"
        @mousedown.prevent="select(c)">
        <span class="text-sm text-white font-medium">{{ c.name }}</span>
        <span v-if="c.handle" class="text-xs text-brand-400">{{ c.handle }}</span>
        <span v-if="c.pronouns" class="text-xs text-zinc-500">{{ c.pronouns }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Commentator } from '../../bindings/zhago/internal/domain/model/models';

const props = defineProps<{
  modelValue: string;
  commentators: Commentator[];
  placeholder?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
  'select': [commentator: Commentator];
}>();

const open        = ref(false);
const activeIndex = ref(-1);
const rootRef     = ref<HTMLElement | null>(null);

const filtered = computed(() => {
  const q = props.modelValue.trim().toLowerCase();
  if (!q) return [];
  return props.commentators.filter(c =>
    c.name.toLowerCase().includes(q) || c.handle.toLowerCase().includes(q)
  ).slice(0, 8);
});

function onInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).value);
  activeIndex.value = -1;
  open.value = true;
}

function select(c: Commentator) {
  emit('update:modelValue', c.name);
  emit('select', c);
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
