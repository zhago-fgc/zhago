<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, provide } from 'vue';
import logo from '../assets/zhago-logo-white.svg';
import { listInstalledAddOns } from '../features/addons/api';
import { moduleLabel } from '../shared/composables/moduleLabel';
import type { ModuleManifest } from '../shared/types/module';

const modules = ref<ModuleManifest[]>([]);
const navOpen = ref(false);
let modulesStream: EventSource | undefined;
provide('modules', modules);

// Only modules with a cockpit page show up in the nav — a plugin with no UI
// (e.g. a bracket-source integration) has nothing to click into here.
const withCockpit = computed(() => modules.value.filter((m) => m.ui?.cockpit));

onMounted(async () => {
  modules.value = await listInstalledAddOns();
  modulesStream = new EventSource('/api/bus/modules/stream');
  modulesStream.onmessage = (event) => {
    modules.value = JSON.parse(event.data) as ModuleManifest[];
  };
});

function closeNav() {
  navOpen.value = false;
}

onUnmounted(() => modulesStream?.close());
</script>

<template>
  <div class="flex h-dvh flex-col md:flex-row overflow-hidden">
    <header
      class="relative md:hidden shrink-0 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 select-none z-20"
    >
      <div class="flex items-center justify-between gap-3 px-3 py-3">
        <img :src="logo" alt="Zhago" class="h-7 w-auto invert dark:invert-0" />
        <button
          type="button"
          class="rounded border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
          :aria-expanded="navOpen"
          aria-controls="mobile-nav"
          @click="navOpen = !navOpen"
        >
          Menu
        </button>
      </div>

      <nav
        v-if="navOpen"
        id="mobile-nav"
        class="absolute inset-x-0 top-full max-h-[calc(100dvh-3.25rem)] overflow-y-auto border-b border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div class="flex flex-col gap-0.5">
          <RouterLink
            to="/"
            class="rounded px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
            active-class="!bg-zinc-100 dark:!bg-zinc-800 !text-zinc-900 dark:!text-white"
            @click="closeNav"
          >
            Home
          </RouterLink>
          <RouterLink
            to="/addons"
            class="rounded px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
            active-class="!bg-zinc-100 dark:!bg-zinc-800 !text-zinc-900 dark:!text-white"
            @click="closeNav"
          >
            Add-ons
          </RouterLink>
          <RouterLink
            to="/logs"
            class="rounded px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
            active-class="!bg-zinc-100 dark:!bg-zinc-800 !text-zinc-900 dark:!text-white"
            @click="closeNav"
          >
            Logs
          </RouterLink>
          <RouterLink
            to="/settings"
            class="rounded px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
            active-class="!bg-zinc-100 dark:!bg-zinc-800 !text-zinc-900 dark:!text-white"
            @click="closeNav"
          >
            Settings
          </RouterLink>

          <div
            class="mt-3 mb-1 px-3 text-[10px] text-zinc-400 dark:text-zinc-600 uppercase tracking-widest font-medium"
          >
            Installed
          </div>
          <RouterLink
            v-for="m in withCockpit"
            :key="m.name"
            :to="`/m/${m.name}`"
            class="rounded px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
            active-class="!bg-zinc-100 dark:!bg-zinc-800 !text-zinc-900 dark:!text-white"
            @click="closeNav"
          >
            <span class="block truncate">{{ moduleLabel(m) }}</span>
          </RouterLink>
          <p v-if="!withCockpit.length" class="px-3 text-sm text-zinc-400 dark:text-zinc-600">
            No modules with a UI yet.
          </p>
        </div>
      </nav>
    </header>

    <aside
      class="hidden md:flex w-52 shrink-0 bg-white dark:bg-zinc-950 flex-col border-r border-zinc-200 dark:border-zinc-800 select-none"
    >
      <div class="px-4 pt-5 pb-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-center">
        <img :src="logo" alt="Zhago" class="h-8 w-auto invert dark:invert-0" />
      </div>

      <nav class="flex-1 overflow-y-auto p-3 flex flex-col gap-0.5">
        <RouterLink
          to="/"
          class="px-3 py-1.5 rounded text-sm transition-colors flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
          active-class="!bg-zinc-100 dark:!bg-zinc-800 !text-zinc-900 dark:!text-white"
        >
          Home
        </RouterLink>
        <RouterLink
          to="/addons"
          class="px-3 py-1.5 rounded text-sm transition-colors flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
          active-class="!bg-zinc-100 dark:!bg-zinc-800 !text-zinc-900 dark:!text-white"
        >
          Add-ons
        </RouterLink>
        <RouterLink
          to="/logs"
          class="px-3 py-1.5 rounded text-sm transition-colors flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
          active-class="!bg-zinc-100 dark:!bg-zinc-800 !text-zinc-900 dark:!text-white"
        >
          Logs
        </RouterLink>

        <div
          class="mt-3 mb-1 px-3 text-[10px] text-zinc-400 dark:text-zinc-600 uppercase tracking-widest font-medium"
        >
          Installed
        </div>
        <RouterLink
          v-for="m in withCockpit"
          :key="m.name"
          :to="`/m/${m.name}`"
          class="px-3 py-1.5 rounded text-sm transition-colors flex items-center justify-between gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
          active-class="!bg-zinc-100 dark:!bg-zinc-800 !text-zinc-900 dark:!text-white"
        >
          <span class="truncate">{{ moduleLabel(m) }}</span>
          <span class="shrink-0 text-[10px] text-zinc-400 dark:text-zinc-600 uppercase">{{
            m.type
          }}</span>
        </RouterLink>
        <p v-if="!withCockpit.length" class="px-3 text-sm text-zinc-400 dark:text-zinc-600">
          No modules with a UI yet.
        </p>
      </nav>

      <div class="p-3 border-t border-zinc-200 dark:border-zinc-800">
        <RouterLink
          to="/settings"
          class="px-3 py-1.5 rounded text-sm transition-colors flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
          active-class="!bg-zinc-100 dark:!bg-zinc-800 !text-zinc-900 dark:!text-white"
        >
          Settings
        </RouterLink>
        <div class="px-3 pt-2 text-[10px] text-zinc-400 dark:text-zinc-600">
          zhago-bun experiment
        </div>
      </div>
    </aside>

    <main class="flex-1 min-h-0 min-w-0 overflow-y-auto bg-white dark:bg-zinc-950">
      <RouterView />
    </main>
  </div>
</template>
