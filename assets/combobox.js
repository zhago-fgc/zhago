// Type-to-filter suggestions, shared by any cockpit field that needs it —
// match's character picker and casters' commentator picker both wire this
// up instead of each hand-rolling the same mousedown/blur/render logic.
// `getCandidates(query)` returns `{ label, meta, ...data }[]`; `onSelect`
// receives the chosen candidate. Caller owns the actual <input> value.
function zhagoCombobox(input, suggestionsEl, { getCandidates, onSelect }) {
  function close() {
    suggestionsEl.classList.add('hidden');
    suggestionsEl.innerHTML = '';
  }

  function show() {
    const candidates = getCandidates(input.value.trim().toLowerCase());
    if (!candidates.length) return close();
    suggestionsEl.innerHTML = '';
    candidates.slice(0, 8).forEach((c) => {
      const li = document.createElement('li');
      li.textContent = c.label;
      if (c.meta) {
        const meta = document.createElement('span');
        meta.className = 'meta';
        meta.textContent = c.meta;
        li.appendChild(meta);
      }
      // mousedown (not click) fires before the input's blur, so the list is
      // still in the DOM when this handler runs.
      li.addEventListener('mousedown', (e) => {
        e.preventDefault();
        onSelect(c);
        close();
      });
      suggestionsEl.appendChild(li);
    });
    suggestionsEl.classList.remove('hidden');
  }

  input.addEventListener('input', show);
  input.addEventListener('focus', show);
  input.addEventListener('blur', () => setTimeout(close, 100));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });

  return { show, close };
}
