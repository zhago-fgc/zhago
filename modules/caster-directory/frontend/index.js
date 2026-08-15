async function send(type, payload) {
  await fetch('/api/bus/caster-directory/' + type, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

const form = document.getElementById('form');
const formHeading = document.getElementById('form-heading');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const nameInput = document.getElementById('name');
const handleInput = document.getElementById('handle');
const pronounsInput = document.getElementById('pronouns');

let editingId = null;

function startEdit(c) {
  editingId = c.id;
  nameInput.value = c.name;
  handleInput.value = c.handle || '';
  pronounsInput.value = c.pronouns || '';
  formHeading.textContent = 'Edit caster';
  submitBtn.textContent = 'Save';
  cancelBtn.classList.remove('hidden');
  nameInput.focus();
}

function stopEdit() {
  editingId = null;
  form.reset();
  formHeading.textContent = 'Add a caster';
  submitBtn.textContent = 'Add';
  cancelBtn.classList.add('hidden');
}

cancelBtn.addEventListener('click', stopEdit);

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const payload = {
    name: nameInput.value,
    handle: handleInput.value || undefined,
    pronouns: pronounsInput.value || undefined,
  };
  if (editingId) {
    send('edit', { id: editingId, ...payload });
  } else {
    send('create', payload);
  }
  stopEdit();
});

function render(casters) {
  const list = document.getElementById('list');
  list.innerHTML = '';
  document.getElementById('empty-hint').style.display = casters.length ? 'none' : 'block';
  for (const c of casters) {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex align-items-center gap-2';

    const name = document.createElement('span');
    name.textContent = c.name;
    li.appendChild(name);

    const meta = [c.handle, c.pronouns].filter(Boolean).join(' · ');
    if (meta) {
      const metaEl = document.createElement('span');
      metaEl.className = 'text-body-secondary small';
      metaEl.textContent = meta;
      li.appendChild(metaEl);
    }

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'btn btn-outline-secondary btn-sm ms-auto';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => startEdit(c));
    li.appendChild(editBtn);

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn btn-outline-danger btn-sm';
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', () => {
      if (editingId === c.id) stopEdit();
      send('delete', { id: c.id });
    });
    li.appendChild(removeBtn);

    list.appendChild(li);
  }
}

const source = new EventSource('/api/bus/caster-directory/stream');
source.onmessage = (e) => render(JSON.parse(e.data) || []);
