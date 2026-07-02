import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notesApi } from './api';

// ─── Queries ──────────────────────────────────────────────

export function useNotes(page = 1, limit = 10) {
  return useQuery({
    queryKey: ['notes', page, limit],
    queryFn: () => notesApi.list(page, limit),
  });
}

export function useNote(id) {
  return useQuery({
    queryKey: ['note', id],
    queryFn: () => notesApi.get(id),
    enabled: !!id,
  });
}

// ─── Mutations ────────────────────────────────────────────

export function useCreateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ title, content }) => notesApi.create(title, content),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notes'] }),
  });
}

export function useUpdateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, title, content }) => notesApi.update(id, { title, content }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notes'] }),
  });
}

export function useDeleteNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => notesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notes'] }),
  });
}
