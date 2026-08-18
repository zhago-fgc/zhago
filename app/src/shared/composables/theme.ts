import { ref, watch } from 'vue';

export type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'zhago-theme';

// Defaults to 'dark' (not 'system') so existing users see no change on
// upgrade — the whole app was hardcoded dark before Settings existed.
export const theme = ref<Theme>((localStorage.getItem(STORAGE_KEY) as Theme | null) ?? 'dark');

function prefersDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function apply() {
  const isDark = theme.value === 'system' ? prefersDark() : theme.value === 'dark';
  document.documentElement.classList.toggle('dark', isDark);
}

watch(
  theme,
  (t) => {
    localStorage.setItem(STORAGE_KEY, t);
    apply();
  },
  { immediate: true },
);

// Only matters while 'system' is selected — 'light'/'dark' are pinned
// regardless of what the OS is doing.
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (theme.value === 'system') apply();
});
