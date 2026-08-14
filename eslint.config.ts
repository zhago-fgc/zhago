import { globalIgnores } from 'eslint/config';
import pluginVue from 'eslint-plugin-vue';
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript';
import eslintConfigPrettier from 'eslint-config-prettier';

export default defineConfigWithVueTs(
  {
    name: 'zhago/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },
  globalIgnores([
    '**/dist/**',
    '**/build/**',
    '**/node_modules/**',
    '**/.gen/**',
    '**/graphify-out/**',
    // pre-rewrite leftovers, not tracked by git
    'frontend/**',
    'internal/**',
    'templates/**',
    'bin/**',
    'app/src/vite-env.d.ts',
  ]),
  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,
  {
    name: 'zhago/rule-overrides',
    files: ['**/*.vue'],
    rules: {
      // Route views (Home.vue, Settings.vue, ...) are never registered as
      // custom elements, so there's no collision risk this rule guards
      // against.
      'vue/multi-word-component-names': 'off',
    },
  },
  {
    name: 'zhago/bus-payloads',
    // The bus and module manifest types are intentionally untyped at their
    // payload boundary — modules define their own message shapes, the core
    // can't know them ahead of time. `unknown` would just push a required
    // cast into every module instead of the one place that owns the bus.
    files: ['src/core/bus.ts', 'src/core/storage.ts', 'src/server.ts', 'src/types/index.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  // Must stay last: turns off stylistic ESLint/vue rules that would
  // otherwise fight Prettier's formatting decisions.
  eslintConfigPrettier,
);
