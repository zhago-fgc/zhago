document.getElementById('embed-url').value = new URL('../overlay/index.html', location.href).href;

const SIDES = [0, 1];

const gameSelect = document.getElementById('game-select');
const teamInputs = SIDES.map((i) => document.getElementById('side-' + i + '-team'));
const scoreInputs = SIDES.map((i) => document.getElementById('side-' + i + '-score'));
const playerContainers = SIDES.map((i) => document.getElementById('side-' + i + '-players'));
const addPlayerButtons = SIDES.map((i) => document.getElementById('side-' + i + '-add-player'));
const charContainers = SIDES.map((i) => document.getElementById('side-' + i + '-characters'));
const addCharButtons = SIDES.map((i) => document.getElementById('side-' + i + '-add-character'));
const roundInput = document.getElementById('round');
const bestOfInput = document.getElementById('best-of');

// Match never imports a game module — it discovers installed ones through
// the manifest registry (tags.includes('game')), same as any other module
// consuming another's data only through the bus.
fetch('/api/modules')
  .then((r) => r.json())
  .then((modules) => {
    for (const m of modules.filter((m) => m.tags?.includes('game'))) {
      const opt = document.createElement('option');
      opt.value = m.name;
      opt.textContent = m.name;
      gameSelect.appendChild(opt);
    }
  });

let gameData = null; // { characters, charactersPerSide, playersPerSide, ... } from the selected game module

// No format list gating this — a game just declares how many characters (or
// players) a side needs as a {min, max} range (2xko: characters fixed at 2,
// players 1-2 for solo/duo; sf6: both fixed at 1; a Skullgirls-style module:
// characters 1-3), and the cockpit adds/removes slots within that range
// instead of offering a menu of named shapes to pick between. A game that
// doesn't declare a range at all is treated as fully freeform — {1,
// Infinity} — rather than forcing every game author to opt in just to get
// today's default behavior.
function charRange() {
  return gameData?.charactersPerSide ?? { min: 1, max: Infinity };
}

function playerRange() {
  return gameData?.playersPerSide ?? { min: 1, max: Infinity };
}

function updateCharacterControls(i) {
  const rows = charContainers[i].querySelectorAll('.char-row');
  const { min, max } = charRange();
  addCharButtons[i].classList.toggle('hidden', !gameData || rows.length >= max);
  rows.forEach((row) =>
    row.querySelector('.remove-character').classList.toggle('hidden', rows.length <= min),
  );
}

function addCharacterRow(i, value = '') {
  const row = document.createElement('div');
  row.className = 'char-row';
  const select = document.createElement('select');
  select.innerHTML =
    '<option value="">— character —</option>' +
    gameData.characters
      .map((c) => '<option value="' + c.name + '">' + c.name + '</option>')
      .join('');
  if (value) select.value = value;
  const remove = document.createElement('button');
  remove.type = 'button';
  remove.className = 'remove-character';
  remove.textContent = '×';
  remove.addEventListener('click', () => {
    row.remove();
    updateCharacterControls(i);
  });
  row.append(select, remove);
  charContainers[i].appendChild(row);
  updateCharacterControls(i);
}

function resetCharacters(i, values = []) {
  charContainers[i].innerHTML = '';
  const slots = values.length ? values : Array(charRange().min || 1).fill('');
  slots.forEach((v) => addCharacterRow(i, v));
}

// Same shape as the character slots above, bounded by playersPerSide instead
// of charactersPerSide — a plain text tag rather than a <select>, since a
// game module has no player roster to source options from (unlike
// characters, which come from that game's own declared list).
function updatePlayerControls(i) {
  const rows = playerContainers[i].querySelectorAll('.char-row');
  const { min, max } = playerRange();
  addPlayerButtons[i].classList.toggle('hidden', !gameData || rows.length >= max);
  rows.forEach((row) =>
    row.querySelector('.remove-character').classList.toggle('hidden', rows.length <= min),
  );
}

function addPlayerRow(i, value = '') {
  const row = document.createElement('div');
  row.className = 'char-row';
  const input = document.createElement('input');
  input.placeholder = 'Tag';
  if (value) input.value = value;
  const remove = document.createElement('button');
  remove.type = 'button';
  remove.className = 'remove-character';
  remove.textContent = '×';
  remove.addEventListener('click', () => {
    row.remove();
    updatePlayerControls(i);
  });
  row.append(input, remove);
  playerContainers[i].appendChild(row);
  updatePlayerControls(i);
}

function resetPlayers(i, values = []) {
  playerContainers[i].innerHTML = '';
  const slots = values.length ? values : Array(playerRange().min || 1).fill('');
  slots.forEach((v) => addPlayerRow(i, v));
}

// Static reference content — one snapshot is enough, so the stream closes
// itself after the first message instead of staying open for updates that
// will never come (see the 2xko/sf6 modules: get-current only, no `update`).
function loadGame(name, onReady) {
  if (!name) {
    gameData = null;
    for (const i of SIDES) {
      addPlayerButtons[i].classList.add('hidden');
      playerContainers[i].innerHTML = '';
      addCharButtons[i].classList.add('hidden');
      charContainers[i].innerHTML = '';
    }
    onReady?.();
    return;
  }
  const es = new EventSource('/api/bus/' + name + '/stream');
  es.onmessage = (e) => {
    es.close();
    gameData = JSON.parse(e.data) || { characters: [] };
    for (const i of SIDES) {
      resetPlayers(i);
      resetCharacters(i);
    }
    onReady?.();
  };
}

gameSelect.addEventListener('change', () => loadGame(gameSelect.value));
for (const i of SIDES) {
  addPlayerButtons[i].addEventListener('click', () => addPlayerRow(i));
  addCharButtons[i].addEventListener('click', () => addCharacterRow(i));
}

function sideValues(i) {
  return {
    players: [...playerContainers[i].querySelectorAll('input')]
      .map((el) => el.value)
      .filter(Boolean),
    characters: [...charContainers[i].querySelectorAll('select')]
      .map((el) => el.value)
      .filter(Boolean),
  };
}

document.getElementById('form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    game: gameSelect.value,
    round: roundInput.value,
    bestOf: Number(bestOfInput.value),
    sides: SIDES.map((i) => ({
      id: 'side-' + (i + 1),
      team: teamInputs[i].value,
      score: Number(scoreInputs[i].value),
      ...sideValues(i),
    })),
  };
  await fetch('/api/bus/match/set', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
});

const source = new EventSource('/api/bus/match/stream');
source.onmessage = (e) => {
  const state = JSON.parse(e.data);
  roundInput.value = state.round ?? '';
  bestOfInput.value = state.bestOf ?? 0;
  SIDES.forEach((i) => {
    const side = state.sides?.[i];
    teamInputs[i].value = side?.team ?? '';
    scoreInputs[i].value = side?.score ?? 0;
  });

  const targetGame = state.game || '';
  if (gameSelect.value !== targetGame) gameSelect.value = targetGame;
  loadGame(targetGame, () => {
    SIDES.forEach((i) => {
      const side = state.sides?.[i];
      resetPlayers(i, side?.players || []);
      resetCharacters(i, side?.characters || []);
    });
  });
};
