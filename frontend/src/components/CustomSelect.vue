<template>
  <div class="relative" :class="props.class" ref="rootRef">
    <button
      class="w-full flex items-center justify-between gap-2 bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm transition-colors hover:border-zinc-500 focus:outline-none"
      :class="open ? 'border-zinc-500' : ''"
      @click="toggle">
      <span :class="selectedLabel ? 'text-white' : 'text-zinc-500'" class="truncate">
        {{ selectedLabel || placeholder }}
      </span>
      <svg class="w-4 h-4 text-zinc-500 shrink-0 transition-transform" :class="open ? 'rotate-180' : ''" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
      </svg>
    </button>

    <Teleport to="body">
      <div v-if="open"
        ref="dropdownRef"
        :style="dropdownStyle"
        class="fixed z-50 bg-zinc-900 border border-zinc-700 rounded shadow-xl flex flex-col">
        <div class="p-1.5 border-b border-zinc-700">
          <input
            ref="searchRef"
            v-model="query"
            type="text"
            autocomplete="off"
            placeholder="Search…"
            class="w-full bg-zinc-800 rounded px-2.5 py-1.5 text-sm text-white placeholder-zinc-600 focus:outline-none" />
        </div>
        <div class="overflow-y-auto max-h-48">
          <div v-if="filtered.length === 0" class="px-3 py-2.5 text-xs text-zinc-600">{{ query ? 'No matches.' : emptyText }}</div>
          <button v-for="opt in filtered" :key="opt.value"
            class="w-full text-left px-3 py-2 text-sm transition-colors flex items-center justify-between"
            :class="modelValue === opt.value ? 'bg-zinc-700 text-white' : 'text-zinc-300 hover:bg-zinc-800'"
            @mousedown.prevent="select(opt.value)">
            <span class="truncate">{{ opt.label }}</span>
            <span v-if="modelValue === opt.value" class="text-xs text-zinc-400 ml-2 shrink-0">✓</span>
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue';

const props = defineProps<{
  modelValue: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  emptyText?: string;
  class?: string;
}>();

const emit = defineEmits<{ 'update:modelValue': [value: string] }>();

const open        = ref(false);
const query       = ref('');
const rootRef     = ref<HTMLElement | null>(null);
const dropdownRef = ref<HTMLElement | null>(null);
const searchRef   = ref<HTMLInputElement | null>(null);
const dropdownStyle = ref<Record<string, string>>({});

const selectedLabel = computed(
  () => props.options.find(o => o.value === props.modelValue)?.label ?? ''
);

const filtered = computed(() => {
  if (!query.value) return props.options;
  const q = query.value.toLowerCase();
  return props.options.filter(o => o.label.toLowerCase().includes(q));
});

async function toggle() {
  open.value = !open.value;
  if (open.value) {
    query.value = '';
    await nextTick();
    if (rootRef.value) {
      const rect = rootRef.value.getBoundingClientRect();
      dropdownStyle.value = {
        top:   `${rect.bottom + 4}px`,
        left:  `${rect.left}px`,
        width: `${rect.width}px`,
      };
    }
    searchRef.value?.focus();
  }
}

function select(value: string) {
  emit('update:modelValue', value);
  open.value = false;
  query.value = '';
}

function onClickOutside(e: MouseEvent) {
  if (!open.value) return;
  const target = e.target as Node;
  const inRoot     = rootRef.value?.contains(target);
  const inDropdown = dropdownRef.value?.contains(target);
  if (!inRoot && !inDropdown) {
    open.value = false;
    query.value = '';
  }
}

onMounted(() => document.addEventListener('mousedown', onClickOutside));
onUnmounted(() => document.removeEventListener('mousedown', onClickOutside));
</script>
