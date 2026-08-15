// Mirrors the admin console's own theme logic (app/src/composables/theme.ts)
// exactly, reading the same localStorage key — same origin in production,
// so an explicit Light/Dark choice there applies here too, not just the OS.
// Loaded as a plain blocking <script> in <head>, before any stylesheet
// paints, so there's no flash of the wrong theme on load.
(function () {
  var stored = localStorage.getItem('zhago-theme'); // 'light' | 'dark' | 'system' | null
  var isDark =
    stored === 'light'
      ? false
      : stored === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
        : true; // 'dark', or unset — same default as the console
  if (isDark) document.documentElement.dataset.bsTheme = 'dark';
})();
