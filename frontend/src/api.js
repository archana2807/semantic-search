const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export const notesApi = {
  list: (page = 1, limit = 10) =>
    request(`/notes?page=${page}&limit=${limit}`),

  get: (id) => request(`/notes/${id}`),

  create: (title, content) =>
    request('/notes', {
      method: 'POST',
      body: JSON.stringify({ title, content }),
    }),

  update: (id, data) =>
    request(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id) =>
    request(`/notes/${id}`, { method: 'DELETE' }),

  search: (query) =>
    request(`/notes/search?query=${encodeURIComponent(query)}`),

  summarize: (id) =>
    request(`/notes/${id}/summary`, { method: 'POST' }),
};
