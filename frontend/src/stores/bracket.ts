import { reactive } from 'vue';

export interface CachedSetData {
  p1Name:       string;
  p1Team:       string;
  p1Characters: string[];
  p2Name:       string;
  p2Team:       string;
  p2Characters: string[];
}

// Persists across tab navigation (module-level singleton).
// Caches player data for sets with no linked player records (e.g. quick matches).
export const bracketStore = reactive({
  displayNames: {} as Record<string, CachedSetData>,
});
