# Nvecta AI Notes

An AI-powered Notes Management System with semantic search and AI-generated summaries.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Laravel 12, PHP 8.2 |
| Frontend | React 19, Vite, Tailwind CSS v4, shadcn/ui |
| Database | PostgreSQL with pgvector |
| AI | OpenRouter API (text-embedding-3-small, GPT-4o-mini) |
| State | TanStack React Query |
| Notifications | Sonner |

## Features

- **CRUD Operations** — Create, read, update, delete notes
- **Pagination** — Paginated notes listing
- **AI Semantic Search** — Vector-based search using pgvector embeddings
- **AI Summary** — GPT-powered note summarization
- **Skeleton Loading** — Smooth loading states
- **Toast Notifications** — Real-time user feedback
- **Responsive UI** — Mobile-first design with shadcn/ui

## Setup Instructions

### Prerequisites

- PHP 8.2+
- Composer
- Node.js 18+
- PostgreSQL with pgvector extension
- Redis (optional, for caching)

### Backend

```bash
cd backend

# Install dependencies
composer install

# Copy env and generate key
cp .env.example .env
php artisan key:generate

# Configure .env (database, OpenRouter API key)
# DB_CONNECTION=pgsql
# DB_HOST=127.0.0.1
# DB_PORT=5432
# DB_DATABASE=nvecta_notes
# DB_USERNAME=your_user
# DB_PASSWORD=your_password
# OPENROUTER_API_KEY=your_key

# Enable pgvector extension in PostgreSQL
# CREATE EXTENSION IF NOT EXISTS vector;

# Run migrations
php artisan migrate

# Start server
php artisan serve
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure .env
# VITE_API_URL=http://localhost:8000/api

# Start dev server
npm run dev
```

### Docker (Backend)

```bash
cd backend
docker build -t nvecta-api .
docker run -p 8000:8000 nvecta-api
```

## API Documentation

Base URL: `http://localhost:8000/api`

### Notes CRUD

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| `GET` | `/notes?page=1&limit=10` | List notes (paginated) | — |
| `POST` | `/notes` | Create note | `{ "title": "...", "content": "..." }` |
| `GET` | `/notes/{id}` | Get single note | — |
| `PUT` | `/notes/{id}` | Update note | `{ "title": "...", "content": "..." }` |
| `DELETE` | `/notes/{id}` | Delete note | — |

### AI Endpoints

| Method | Endpoint | Description | Body/Query |
|--------|----------|-------------|------------|
| `GET` | `/notes/search?query=keyword` | AI semantic search | — |
| `POST` | `/notes/{id}/summary` | AI-generated summary | — |

### Response Examples

**Create Note (201)**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "My Note",
    "content": "Note content here...",
    "created_at": "2026-07-03T10:00:00.000000Z"
  }
}
```

**Search Results**
```json
{
  "query": "machine learning",
  "results": [
    {
      "id": 1,
      "title": "ML Basics",
      "content": "Machine learning is...",
      "score": 0.23
    }
  ]
}
```

**Summary**
```json
{
  "summary": "- Key point 1\n- Key point 2\n..."
}
```

**Paginated List**
```json
{
  "data": [...],
  "current_page": 1,
  "last_page": 5,
  "total": 50,
  "per_page": 10
}
```

## Database Schema

### notes Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | `bigint` (PK) | Auto-increment ID |
| `title` | `string(255)` | Note title |
| `content` | `text` | Note body |
| `embedding` | `vector(1536)` | OpenAI embedding for semantic search |
| `created_at` | `timestamp` | Created timestamp |
| `updated_at` | `timestamp` | Updated timestamp |

```sql
CREATE TABLE notes (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1536),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX notes_embedding_idx ON notes
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);
```

## Architecture

```
nvecta-ai-notes/
├── backend/                    # Laravel 12 API
│   ├── app/
│   │   ├── Http/Controllers/
│   │   │   └── NoteController.php    # CRUD + AI endpoints
│   │   ├── Models/
│   │   │   └── Note.php              # Eloquent model with pgvector
│   │   └── Services/
│   │       └── AiService.php         # OpenRouter API integration
│   ├── routes/
│   │   └── api.php                   # API route definitions
│   └── database/
│       └── migrations/               # DB migrations
├── frontend/                   # React 19 SPA
│   ├── src/
│   │   ├── api.js                    # HTTP client
│   │   ├── hooks.js                  # React Query hooks
│   │   ├── QueryProvider.jsx         # QueryClient setup
│   │   ├── components/
│   │   │   ├── NoteCard.jsx          # Note list card
│   │   │   ├── NoteForm.jsx          # Create/edit form
│   │   │   ├── NoteDetail.jsx        # View + AI summary
│   │   │   ├── SearchBar.jsx         # AI search input
│   │   │   └── ui/                   # shadcn/ui components
│   │   └── App.jsx                   # Main app layout
│   └── .env                          # VITE_API_URL config
└── README.md
```

### Request Flow

```
Frontend (React) → api.js (fetch) → Laravel Router → NoteController
                                                          ↓
                                              Note Model (Eloquent)
                                                          ↓
                                              AiService (OpenRouter API)
                                                          ↓
                                              PostgreSQL + pgvector
```

### Semantic Search Flow

1. User enters search query
2. Frontend calls `GET /api/notes/search?query=...`
3. Backend converts query to embedding via `text-embedding-3-small`
4. pgvector performs cosine similarity search against stored embeddings
5. Results ranked by similarity score (< 0.85 threshold)
6. Results cached in Redis for 10 minutes

### AI Summary Flow

1. User clicks "AI Summarize" on a note
2. Frontend calls `POST /api/notes/{id}/summary`
3. Backend sends note content to GPT-4o-mini
4. System prompt: "Summarize in 5 bullet points"
5. Summary returned and displayed in UI

## AI Tools Used

| Tool | Usage |
|------|-------|
| OpenRouter API | Embedding generation (text-embedding-3-small) |
| OpenRouter API | Summary generation (GPT-4o-mini) |
| Copilot | Code completion, component generation |
| ChatGPT/Claude | Architecture decisions, debugging |

### Prompts Used

**Embedding:**
```
Model: text-embedding-3-small
Input: [note content or search query]
Output: 1536-dimensional vector
```

**Summary:**
```
System: Summarize in 5 bullet points
User: [note content]
Model: gpt-4o-mini
```

## Security

- **SQL Injection** — Eloquent ORM parameterized queries
- **Validation** — Laravel request validation on all inputs
- **Rate Limiting** — 60 requests/minute on AI endpoints
- **CORS** — Configured for frontend origin
- **Environment Variables** — API keys in `.env`, never committed

## License

MIT
