function fill(prefix, name, team, score) {
  const el = document.getElementById(prefix)
  el.classList.toggle('hidden', !name)
  document.getElementById(prefix + '-name').textContent = name || ''
  document.getElementById(prefix + '-team').textContent = team || ''
  document.getElementById(prefix + '-score').textContent = score ?? 0
}

function render(state) {
  fill('p1', state.player1Name, state.player1Team, state.player1Score)
  fill('p2', state.player2Name, state.player2Team, state.player2Score)
  document.getElementById('round').textContent = state.round || ''
}

// Read-only: snapshot on connect, then live updates — never sends anything back.
const source = new EventSource('/api/bus/match/stream')
source.onmessage = (e) => render(JSON.parse(e.data))
