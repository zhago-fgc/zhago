// Injected into every module cockpit's iframe (see ModuleView.vue) so plain
// HTML/CSS/JS modules — no Vue, no build step — still read as part of one
// app instead of a bare unstyled form. Targets the same element selectors
// module authors already use (body, fieldset, input, button, ...), and wins
// the cascade purely by loading after the module's own <link>/<style>, so no
// !important is needed. Keep this generic — module-specific classes (like
// match's `.hidden`) stay in the module's own CSS, this file only owns the
// shared look.
export const COCKPIT_SKIN = `
  body { background: #09090b; color: #e4e4e7; font-family: system-ui, sans-serif; }
  h1, h2, h3 { color: #f4f4f5; }
  p { color: #a1a1aa; }
  fieldset { background: #18181b; border: 1px solid #27272a; border-radius: 0.5rem; }
  legend { color: #a1a1aa; }
  input, select {
    background: #18181b;
    border: 1px solid #3f3f46;
    color: #e4e4e7;
    border-radius: 0.375rem;
  }
  input::placeholder { color: #52525b; }
  input:focus, select:focus {
    outline: 2px solid #6366f1;
    outline-offset: 1px;
    border-color: #6366f1;
  }
  button {
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 0.375rem;
    font-weight: 500;
  }
  button:hover { background: #4f46e5; }
  #embed-url { background: #18181b; border: 1px solid #3f3f46; color: #a1a1aa; }
  .preview-frame { border-color: #27272a; }
`
