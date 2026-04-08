const SLOT_IDS = ['p1st','p2nd','p3rd','p4th','p5th','p6th','p7th','p8th'];
const FLAT_KEYS = ['p1Name','p2Name','p3Name','p4Name','p5Name','p6Name','p7Name','p8Name'];

function set(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text || 'TBD';
}

function applyPayload(payload) {
  // Flat-field format (from Controls view)
  if (FLAT_KEYS.some(k => payload[k] !== undefined)) {
    FLAT_KEYS.forEach((key, i) => set(SLOT_IDS[i], payload[key]));
    return;
  }
  // Array format (from future Top8 dedicated view or start.gg import)
  const placements = payload.placements || [];
  placements.forEach((p, i) => {
    if (i >= SLOT_IDS.length) return;
    set(SLOT_IDS[i], p.player?.tag || p.name);
  });
}

function connect() {
  const es = new EventSource('/stream');
  es.addEventListener('update', (e) => {
    const { type, payload } = JSON.parse(e.data);
    if (type !== 'top8.update') return;
    applyPayload(payload);
  });
  es.onerror = () => { es.close(); setTimeout(connect, 3000); };
}
connect();
