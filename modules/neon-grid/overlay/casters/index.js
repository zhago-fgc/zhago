function fill(prefix, name, handle, pronouns) {
  const el = document.getElementById(prefix);
  el.classList.toggle('hidden', !name);
  document.getElementById(`${prefix}-name`).textContent = name || '';
  document.getElementById(`${prefix}-meta`).textContent = [handle, pronouns].filter(Boolean).join(' · ');
}

function render(state) {
  fill('c1', state.commentator1Name, state.commentator1Handle, state.commentator1Pronouns);
  fill('c2', state.commentator2Name, state.commentator2Handle, state.commentator2Pronouns);
}

const source = new EventSource('/api/bus/casters/stream');
source.onmessage = (event) => render(JSON.parse(event.data));
