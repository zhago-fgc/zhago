const p1Name  = document.getElementById('p1-name');
const p1Team  = document.getElementById('p1-team');
const p1Score = document.getElementById('p1-score');
const p2Name  = document.getElementById('p2-name');
const p2Team  = document.getElementById('p2-team');
const p2Score = document.getElementById('p2-score');
const roundEl = document.getElementById('round');

function connect() {
  const es = new EventSource('/stream');
  es.addEventListener('update', (e) => {
    const { type, payload } = JSON.parse(e.data);
    if (type !== 'scoreboard.update') return;
    p1Name.textContent  = payload.player1Name  || 'Player 1';
    p1Team.textContent  = payload.player1Team  || '';
    p1Score.textContent = payload.player1Score ?? 0;
    p2Name.textContent  = payload.player2Name  || 'Player 2';
    p2Team.textContent  = payload.player2Team  || '';
    p2Score.textContent = payload.player2Score ?? 0;
    roundEl.textContent = payload.round        || '';
    p1Team.style.display = payload.player1Team ? '' : 'none';
    p2Team.style.display = payload.player2Team ? '' : 'none';
  });
  es.onerror = () => { es.close(); setTimeout(connect, 3000); };
}
connect();
