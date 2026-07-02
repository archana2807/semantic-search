import { useState } from 'react';
import { useNotes, useCreateNote, useUpdateNote, useDeleteNote } from './hooks';
import NoteCard from './components/NoteCard';
import NoteForm from './components/NoteForm';
import SearchBar from './components/SearchBar';
import NoteDetail from './components/NoteDetail';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { notesApi } from './api';

function App() {
  const [page, setPage] = useState(1);
  const [view, setView] = useState('list');
  const [selectedNote, setSelectedNote] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchClearKey, setSearchClearKey] = useState(0);

  const { data, isLoading } = useNotes(page);
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();

  const notes = data?.data ?? [];
  const totalPages = data?.last_page ?? 1;

  const handleCreate = async ({ title, content }) => {
    try {
      await createNote.mutateAsync({ title, content });
      toast.success('Note created successfully.');
      setView('list');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleUpdate = async ({ title, content }) => {
    try {
      await updateNote.mutateAsync({ id: selectedNote.id, title, content });
      toast.success('Note updated successfully.');
      setView('list');
      setSelectedNote(null);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this note?')) return;
    try {
      await deleteNote.mutateAsync(id);
      toast.success('Note deleted.');
    } catch {
      toast.error('Failed to delete note.');
    }
  };

  const handleSearch = async (query) => {
    setSearchLoading(true);
    try {
      const data = await notesApi.search(query);
      setSearchResults(data.results);
      if (data.results.length === 0) toast.info('No results found.');
    } catch {
      toast.error('Search failed.');
    }
    setSearchLoading(false);
  };

  const handleClearSearch = () => {
    setSearchResults(null);
    setSearchClearKey((k) => k + 1);
  };

  const displayNotes = searchResults !== null ? searchResults : notes;

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" richColors closeButton />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <h1
            className="cursor-pointer text-2xl font-bold tracking-tight sm:text-3xl"
            onClick={() => { setSearchResults(null); setView('list'); setPage(1); }}
          >
            <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              Nvecta AI Notes
            </span>
          </h1>
          {view === 'list' && (
            <Button onClick={() => setView('create')}>
              <Plus className="mr-2 h-4 w-4" />
              New Note
            </Button>
          )}
        </header>

        {/* List View */}
        {view === 'list' && (
          <div className="space-y-6">
            <SearchBar key={searchClearKey} onSearch={handleSearch} loading={searchLoading} />

            {searchResults !== null && (
              <div className="flex items-center justify-between">
                <Badge variant="secondary">
                  {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                </Badge>
                <Button variant="ghost" size="sm" onClick={handleClearSearch}>
                  Clear search
                </Button>
              </div>
            )}

            {isLoading || searchLoading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
                ))}
              </div>
            ) : displayNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="mb-4 rounded-full bg-muted p-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mb-1 text-lg font-medium">No notes yet</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Create your first note to get started.
                </p>
                <Button onClick={() => setView('create')}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Note
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {displayNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onSelect={(n) => { setSelectedNote(n); setView('detail'); }}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}

            {searchResults === null && totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Create View */}
        {view === 'create' && (
          <NoteForm onSubmit={handleCreate} onCancel={() => setView('list')} />
        )}

        {/* Edit View */}
        {view === 'edit' && selectedNote && (
          <NoteForm initial={selectedNote} onSubmit={handleUpdate} onCancel={() => setView('detail')} />
        )}

        {/* Detail View */}
        {view === 'detail' && selectedNote && (
          <NoteDetail
            note={selectedNote}
            onBack={() => { setView('list'); setSelectedNote(null); }}
            onEdit={(n) => { setSelectedNote(n); setView('edit'); }}
          />
        )}
      </div>
    </div>
  );
}

export default App;
