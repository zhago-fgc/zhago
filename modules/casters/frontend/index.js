// Full absolute URL, since this is what gets pasted into OBS's browser
// source — a relative path means nothing outside this page. It never
// changes with the skin pick — it's /overlay/casters (see server.ts),
// pasted in once. That route resolves whichever pack is live off the
// `casters-overlay` bus namespace on every request/reload.
const OVERLAY_URL = new URL('/overlay/casters', location.origin).href;
const embedUrlInput = document.getElementById('embed-url');
const skinSelect = document.getElementById('skin-select');
const overlayPreview = document.getElementById('overlay-preview');

embedUrlInput.value = OVERLAY_URL;
overlayPreview.src = OVERLAY_URL;

// Skins are user-imported overlay HTML/CSS/JS dropped into ZHAGO_DIR — not
// something the module ships, so this list is fetched at runtime.
fetch('/api/overlays/casters')
  .then((r) => r.json())
  .then((skins) => {
    for (const skin of skins) {
      const opt = document.createElement('option');
      opt.value = skin;
      opt.textContent = skin;
      skinSelect.appendChild(opt);
    }
  });

skinSelect.addEventListener('change', () => {
  fetch('/api/bus/casters-overlay/set', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ skin: skinSelect.value }),
  });
});

let roster = [];
const findByName = (name) => roster.find((c) => c.name.toLowerCase() === name.trim().toLowerCase());

// Same shared combobox match's character picker uses — type to filter, pick
// one, and here it fills Handle/Pronouns too instead of just the name,
// since those are real fields now rather than hidden lookups.
function wireCommentator(n) {
  const nameInput = document.getElementById('c' + n + '-name');
  const handleInput = document.getElementById('c' + n + '-handle');
  const pronounsInput = document.getElementById('c' + n + '-pronouns');
  const suggestions = document.getElementById('c' + n + '-suggestions');

  zhagoCombobox(nameInput, suggestions, {
    getCandidates: (q) =>
      roster
        .filter((c) => !q || c.name.toLowerCase().includes(q))
        .map((c) => ({
          label: c.name,
          meta: [c.handle, c.pronouns].filter(Boolean).join(' · '),
          caster: c,
        })),
    onSelect: (item) => {
      nameInput.value = item.caster.name;
      handleInput.value = item.caster.handle || '';
      pronounsInput.value = item.caster.pronouns || '';
    },
  });

  return { nameInput, handleInput, pronounsInput };
}

const c1 = wireCommentator(1);
const c2 = wireCommentator(2);

// One connection for the skin-sync, the caster-directory roster, and
// casters' own live state — the last one is what makes the form come back
// populated after leaving and returning to this page, the same way match's
// cockpit already re-fills from its own live state. caster-directory is the
// source of truth for who exists, but it's suggestions now, not a hard
// constraint — the input still works as a plain free-text field with zero
// suggestions if caster-directory was never installed or has nothing in it
// yet.
const source = new EventSource('/api/bus/stream?ns=casters-overlay,caster-directory,casters');
source.onmessage = (e) => {
  const msg = JSON.parse(e.data);

  if (msg.ns === 'casters-overlay') {
    if (skinSelect.value !== msg.data.skin) skinSelect.value = msg.data.skin;
    return;
  }

  if (msg.ns === 'casters') {
    const state = msg.data;
    c1.nameInput.value = state.commentator1Name ?? '';
    c1.handleInput.value = state.commentator1Handle ?? '';
    c1.pronounsInput.value = state.commentator1Pronouns ?? '';
    c2.nameInput.value = state.commentator2Name ?? '';
    c2.handleInput.value = state.commentator2Handle ?? '';
    c2.pronounsInput.value = state.commentator2Pronouns ?? '';
    return;
  }

  roster = msg.data || [];
  document.getElementById('empty-roster-hint').style.display = roster.length ? 'none' : 'block';
};

// A name typed here that isn't already in the directory gets saved there
// too — the whole point of asking for Handle/Pronouns inline is that you
// shouldn't have to go fill out the same form twice.
async function saveNewToDirectory(name, handle, pronouns) {
  if (!name || findByName(name)) return;
  await fetch('/api/bus/caster-directory/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, handle: handle || undefined, pronouns: pronouns || undefined }),
  });
}

document.getElementById('form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const n1 = {
    name: c1.nameInput.value.trim(),
    handle: c1.handleInput.value.trim(),
    pronouns: c1.pronounsInput.value.trim(),
  };
  const n2 = {
    name: c2.nameInput.value.trim(),
    handle: c2.handleInput.value.trim(),
    pronouns: c2.pronounsInput.value.trim(),
  };

  await Promise.all([
    saveNewToDirectory(n1.name, n1.handle, n1.pronouns),
    saveNewToDirectory(n2.name, n2.handle, n2.pronouns),
  ]);

  await fetch('/api/bus/casters/set', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      commentator1Name: n1.name,
      commentator1Handle: n1.handle,
      commentator1Pronouns: n1.pronouns,
      commentator2Name: n2.name,
      commentator2Handle: n2.handle,
      commentator2Pronouns: n2.pronouns,
    }),
  });
});
