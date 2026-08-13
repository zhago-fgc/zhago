document.getElementById('embed-url').value = new URL('overlay.html', location.href).href

const ids = ['p1-name', 'p1-team', 'p1-score', 'p2-name', 'p2-team', 'p2-score', 'round', 'best-of']
const fields = ['player1Name', 'player1Team', 'player1Score', 'player2Name', 'player2Team', 'player2Score', 'round', 'bestOf']
const numeric = new Set(['p1-score', 'p2-score', 'best-of'])

document.getElementById('form').addEventListener('submit', async (e) => {
  e.preventDefault()
  const payload = {}
  ids.forEach((id, i) => {
    const el = document.getElementById(id)
    payload[fields[i]] = numeric.has(id) ? Number(el.value) : el.value
  })
  await fetch('/api/bus/match/set', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
})

const source = new EventSource('/api/bus/match/stream')
source.onmessage = (e) => {
  const state = JSON.parse(e.data)
  ids.forEach((id, i) => {
    const val = state[fields[i]]
    document.getElementById(id).value = val ?? (numeric.has(id) ? 0 : '')
  })
}
