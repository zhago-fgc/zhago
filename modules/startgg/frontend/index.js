const tokenInput = document.getElementById('token-input');
const tokenStatus = document.getElementById('token-status');
const slugInput = document.getElementById('slug-input');
const result = document.getElementById('result');

function post(type, payload) {
  return fetch('/api/bus/startgg/' + type, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

// Accepts a bare slug ("clust-v2-0") or a full start.gg tournament URL
// pasted straight from the browser bar — TOs paste the URL, not the slug.
function extractSlug(value) {
  const match = value.trim().match(/start\.gg\/tournament\/([^/?#]+)/);
  return match ? match[1] : value.trim();
}

document.getElementById('save-token').addEventListener('click', async () => {
  const token = tokenInput.value.trim();
  if (!token) return;
  await post('set-token', { token });
  tokenInput.value = '';
});

document.getElementById('clear-token').addEventListener('click', async () => {
  await post('clear-token', {});
});

document.getElementById('fetch-tournament').addEventListener('click', async () => {
  const slug = extractSlug(slugInput.value);
  if (!slug) return;
  await post('set-slug', { slug });
});

function renderResult(state) {
  if (state.status === 'idle') {
    result.innerHTML = '';
    return;
  }
  if (state.status === 'loading') {
    result.innerHTML = '<p class="muted">Loading…</p>';
    return;
  }
  if (state.status === 'error') {
    result.innerHTML = '<p class="error">' + state.error + '</p>';
    return;
  }
  const t = state.tournament;
  result.innerHTML =
    '<h3 class="h6">' +
    t.name +
    (t.city ? ' — ' + t.city : '') +
    '</h3>' +
    '<ul class="event-list">' +
    t.events
      .map((e) => '<li><span>' + e.name + '</span><span>' + e.numEntrants + ' entrants</span></li>')
      .join('') +
    '</ul>';
}

const source = new EventSource('/api/bus/startgg/stream');
source.onmessage = (e) => {
  const state = JSON.parse(e.data);
  tokenStatus.textContent = state.connected ? 'Connected' : 'Not connected';
  tokenStatus.className = 'status ' + (state.connected ? 'connected' : 'disconnected');
  if (state.slug) slugInput.value = state.slug;
  renderResult(state);
};
