const timerEl  = document.getElementById('timer');
const msgEl    = document.getElementById('message');

let interval = null;
let target   = null;

function fmt(secs) {
  if (secs <= 0) return '0:00';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function tick() {
  if (!target) return;
  const remaining = Math.max(0, Math.round((target - Date.now()) / 1000));
  timerEl.textContent = fmt(remaining);
  if (remaining === 0) {
    clearInterval(interval);
    interval = null;
    timerEl.classList.add('hidden');
  }
}

function connect() {
  const es = new EventSource('/stream');
  es.addEventListener('update', (e) => {
    const { type, payload } = JSON.parse(e.data);
    if (type === 'timer.start') {
      target = payload.target || (payload.minutes ? Date.now() + payload.minutes * 60000 : null);
      msgEl.textContent = payload.message || '';
      timerEl.classList.remove('hidden');
      clearInterval(interval);
      interval = setInterval(tick, 500);
      tick();
    } else if (type === 'timer.stop') {
      clearInterval(interval);
      interval = null;
      timerEl.textContent = '–:––';
      timerEl.classList.remove('hidden');
    }
  });
  es.onerror = () => { es.close(); setTimeout(connect, 3000); };
}
connect();
