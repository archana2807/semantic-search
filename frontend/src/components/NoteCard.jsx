import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

export default function NoteCard({ note, onSelect, onDelete }) {
  return (
    <Card
      className="cursor-pointer transition-all hover:ring-2 hover:ring-primary/50 hover:shadow-lg"
      onClick={() => onSelect(note)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg leading-tight">{note.title}</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
            onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="line-clamp-3 text-sm text-muted-foreground">
          {note.content.length > 200 ? note.content.slice(0, 200) + '...' : note.content}
        </p>
      </CardContent>
      <CardFooter>
        <span className="text-xs text-muted-foreground">
          {new Date(note.created_at).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
          })}
        </span>
      </CardFooter>
    </Card>
  );
}
