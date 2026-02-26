const API_BASE = '';
const DEFAULT_IDS = {
  admin: 'test-admin-1',
  technician: 'test-tech-1'
};

let currentPage = 1;
let totalPages = 1;
let currentEditId = null;
let currentSearch = '';
let currentStatus = '';

const tableBody = document.getElementById('projectsTable');
const pageInfo = document.getElementById('pageInfo');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
const createBtn = document.getElementById('createBtn');
const modal = document.getElementById('modal');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const projectForm = document.getElementById('projectForm');
const formTitle = document.getElementById('formTitle');
const formError = document.getElementById('formError');
const toast = document.getElementById('toast');
const userIdInput = document.getElementById('userId');
const roleRadios = document.querySelectorAll('input[name="role"]');

function getAuthHeaders() {
  const role = document.querySelector('input[name="role"]:checked').value;
  const userId = userIdInput.value.trim();
  return {
    'x-user-id': userId,
    'x-user-role': role
  };
}

async function apiFetch(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...(options.headers || {})
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  const payload = await res.json().catch(() => ({}));

  if (!res.ok || payload.ok === false) {
    const message = payload?.error?.message || 'Error inesperado';
    const details = payload?.error?.details || [];
    const code = payload?.error?.code || 'ERROR';
    const err = new Error(message);
    err.code = code;
    err.details = details;
    throw err;
  }

  return payload;
}

async function loadProjects() {
  tableBody.innerHTML = '<tr><td colspan="6" class="empty">Cargando...</td></tr>';

  const params = new URLSearchParams({
    page: String(currentPage),
    limit: '10',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  if (currentSearch) params.set('search', currentSearch);
  if (currentStatus) params.set('status', currentStatus);

  try {
    const res = await apiFetch(`/api/projects?${params.toString()}`, {
      method: 'GET'
    });

    renderTable(res.data || []);

    const meta = res.meta || { page: 1, pages: 1 };
    currentPage = meta.page || 1;
    totalPages = meta.pages || 0;
    pageInfo.textContent = totalPages === 0 ? '0/0' : `${currentPage}/${totalPages}`;
    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = totalPages === 0 || currentPage >= totalPages;
  } catch (err) {
    renderTable([]);
    showToast(`${err.code}: ${err.message}`);
  }
}

function renderTable(items) {
  if (!items.length) {
    tableBody.innerHTML = '<tr><td colspan="6" class="empty">Sin resultados</td></tr>';
    return;
  }

  tableBody.innerHTML = items
    .map((item) => {
      const scheduled = item.scheduledAt
        ? new Date(item.scheduledAt).toLocaleString()
        : '-';
      const created = item.createdAt
        ? new Date(item.createdAt).toLocaleString()
        : '-';

      return `
        <tr>
          <td>${escapeHtml(item.title)}</td>
          <td>${escapeHtml(item.clientName)}</td>
          <td><span class="status ${item.status}">${item.status}</span></td>
          <td>${scheduled}</td>
          <td>${created}</td>
          <td class="actions">
            <button class="btn" data-action="edit" data-id="${item.id}">Ver/Editar</button>
            <button class="btn danger" data-action="delete" data-id="${item.id}">Eliminar</button>
          </td>
        </tr>
      `;
    })
    .join('');
}

function openForm(mode, data = {}) {
  currentEditId = mode === 'edit' ? data.id : null;
  formTitle.textContent = mode === 'edit' ? 'Editar Proyecto' : 'Crear Proyecto';
  projectForm.reset();

  projectForm.elements.title.value = data.title || '';
  projectForm.elements.clientName.value = data.clientName || '';
  projectForm.elements.clientEmail.value = data.clientEmail || '';
  projectForm.elements.phone.value = data.phone || '';
  projectForm.elements.address.value = data.address || '';
  projectForm.elements.description.value = data.description || '';
  projectForm.elements.status.value = data.status || 'DRAFT';

  if (data.scheduledAt) {
    const dt = new Date(data.scheduledAt);
    projectForm.elements.scheduledAt.value = toLocalInputValue(dt);
  } else {
    projectForm.elements.scheduledAt.value = '';
  }

  formError.classList.add('hidden');
  formError.textContent = '';
  modal.classList.remove('hidden');
}

async function submitForm(event) {
  event.preventDefault();

  const formData = new FormData(projectForm);

  const payload = {
    title: formData.get('title')?.trim(),
    clientName: formData.get('clientName')?.trim(),
    clientEmail: toNullable(formData.get('clientEmail')),
    phone: toNullable(formData.get('phone')),
    address: toNullable(formData.get('address')),
    description: toNullable(formData.get('description')),
    status: formData.get('status') || 'DRAFT',
    scheduledAt: toNullableDate(formData.get('scheduledAt'))
  };

  if (!payload.title || !payload.clientName) {
    showFormError('Título y cliente son obligatorios.');
    return;
  }

  try {
    if (currentEditId) {
      await apiFetch(`/api/projects/${currentEditId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      showToast('Proyecto actualizado.');
    } else {
      await apiFetch('/api/projects', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      showToast('Proyecto creado.');
    }

    closeForm();
    loadProjects();
  } catch (err) {
    showFormError(`${err.code}: ${err.message}`);
  }
}

async function deleteProject(id) {
  const confirmDelete = window.confirm('¿Eliminar proyecto? (soft delete)');
  if (!confirmDelete) return;

  try {
    await apiFetch(`/api/projects/${id}`, { method: 'DELETE' });
    showToast('Proyecto eliminado.');
    loadProjects();
  } catch (err) {
    showToast(`${err.code}: ${err.message}`);
  }
}

function closeForm() {
  modal.classList.add('hidden');
  currentEditId = null;
}

function showFormError(message) {
  formError.textContent = message;
  formError.classList.remove('hidden');
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 3000);
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function toNullable(value) {
  const v = typeof value === 'string' ? value.trim() : value;
  return v ? v : null;
}

function toNullableDate(value) {
  if (!value) return null;
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return null;
  return dt.toISOString();
}

function toLocalInputValue(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function syncUserId(role) {
  const current = userIdInput.value.trim();
  if (!current || current === DEFAULT_IDS.admin || current === DEFAULT_IDS.technician) {
    userIdInput.value = DEFAULT_IDS[role];
  }
}

roleRadios.forEach((radio) => {
  radio.addEventListener('change', (e) => {
    syncUserId(e.target.value);
    loadProjects();
  });
});

searchInput.addEventListener('input', () => {
  currentSearch = searchInput.value.trim();
  currentPage = 1;
  loadProjects();
});

statusFilter.addEventListener('change', () => {
  currentStatus = statusFilter.value;
  currentPage = 1;
  loadProjects();
});

prevPageBtn.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage -= 1;
    loadProjects();
  }
});

nextPageBtn.addEventListener('click', () => {
  if (currentPage < totalPages) {
    currentPage += 1;
    loadProjects();
  }
});

createBtn.addEventListener('click', () => openForm('create'));
closeModal.addEventListener('click', closeForm);
cancelBtn.addEventListener('click', closeForm);
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeForm();
});
projectForm.addEventListener('submit', submitForm);

tableBody.addEventListener('click', async (e) => {
  const button = e.target.closest('button');
  if (!button) return;

  const action = button.dataset.action;
  const id = button.dataset.id;

  if (action === 'delete') {
    deleteProject(id);
    return;
  }

  if (action === 'edit') {
    try {
      const res = await apiFetch(`/api/projects/${id}`, { method: 'GET' });
      openForm('edit', res.data);
    } catch (err) {
      showToast(`${err.code}: ${err.message}`);
    }
  }
});

loadProjects();
