function set(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text || '';
}

function applyPayload(payload) {
  // Flat-field format (from Controls view)
  if (payload.commentator1Name !== undefined || payload.commentator2Name !== undefined) {
    set('c1-name',     payload.commentator1Name);
    set('c1-handle',   payload.commentator1Handle ? '@' + payload.commentator1Handle.replace(/^@/, '') : '');
    set('c1-pronouns', payload.commentator1Pronouns);
    set('c2-name',     payload.commentator2Name);
    set('c2-handle',   payload.commentator2Handle ? '@' + payload.commentator2Handle.replace(/^@/, '') : '');
    set('c2-pronouns', payload.commentator2Pronouns);
    return;
  }
  // Array format (from Commentary view)
  const commentators = payload.commentators || [];
  const ids = [
    ['c1-name', 'c1-handle', 'c1-pronouns'],
    ['c2-name', 'c2-handle', 'c2-pronouns'],
  ];
  commentators.forEach((c, i) => {
    if (i > 1) return;
    set(ids[i][0], c.name);
    set(ids[i][1], c.handle ? '@' + c.handle.replace(/^@/, '') : '');
    set(ids[i][2], c.pronouns);
  });
}

function connect() {
  const es = new EventSource('/stream');
  es.addEventListener('update', (e) => {
    const { type, payload } = JSON.parse(e.data);
    if (type !== 'commentary.update') return;
    applyPayload(payload);
  });
  es.onerror = () => { es.close(); setTimeout(connect, 3000); };
}
connect();
