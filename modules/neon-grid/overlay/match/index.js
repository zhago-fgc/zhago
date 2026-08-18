function sideName(side) {
  return (side?.participants || [])
    .map((participant) => participant.player)
    .filter(Boolean)
    .join(' / ');
}

function sideMeta(side) {
  const participants = side?.participants || [];
  const teams = [...new Set(participants.map((participant) => participant.team).filter(Boolean))];
  const characters = participants
    .flatMap((participant) => participant.characters || [])
    .filter(Boolean)
    .join(' + ');
  return [teams.join(' / '), characters].filter(Boolean).join(' · ');
}

function fill(prefix, side) {
  const el = document.getElementById(prefix);
  const name = sideName(side);
  el.classList.toggle('hidden', !name);
  document.getElementById(`${prefix}-name`).textContent = name;
  document.getElementById(`${prefix}-meta`).textContent = sideMeta(side);
  document.getElementById(`${prefix}-score`).textContent = side?.score ?? 0;
}

function render(state) {
  const [side1, side2] = state.sides || [];
  fill('p1', side1);
  fill('p2', side2);
  document.getElementById('round').textContent = state.round || 'Match';
}

const source = new EventSource('/api/bus/match/stream');
source.onmessage = (event) => render(JSON.parse(event.data));
