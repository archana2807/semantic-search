import { useState } from 'react';
import { notesApi } from '../api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Pencil, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function NoteDetail({ note, onBack, onEdit }) {
  const [summary, setSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);

  const handleSummarize = async () => {
    setLoadingSummary(true);
    try {
      const data = await notesApi.summarize(note.id);
      setSummary(data.summary);
      toast.success('Summary generated.');
    } catch {
      toast.error('Failed to generate summary.');
    }
    setLoadingSummary(false);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">{note.title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <Badge variant="secondary">
          {new Date(note.created_at).toLocaleDateString('en-US', {
            month: 'long', day: 'numeric', year: 'numeric'
          })}
        </Badge>
        <Button variant="outline" size="sm" onClick={() => onEdit(note)}>
          <Pencil className="mr-2 h-3.5 w-3.5" />
          Edit
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <p className="whitespace-pre-wrap leading-relaxed text-foreground">
            {note.content}
          </p>
        </CardContent>
      </Card>

      <Separator />

      <div className="space-y-3">
        <Button
          variant="secondary"
          onClick={handleSummarize}
          disabled={loadingSummary}
        >
          {loadingSummary ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          {loadingSummary ? 'Generating...' : 'AI Summarize'}
        </Button>

        {summary && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-5">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" />
                AI Summary
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {summary}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
