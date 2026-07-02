<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Note;
use App\Services\AiService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class NoteController extends Controller
{
    private AiService $ai;

    public function __construct(AiService $ai)
    {
        $this->ai = $ai;
    }

    // =========================
    // 📄 GET ALL NOTES (Pagination)
    // =========================
    public function index(Request $request)
    {
        $limit = $request->get('limit', 10);

        $notes = Note::orderBy('id', 'desc')
            ->paginate($limit);

        return response()->json($notes);
    }

    // =========================
    // ➕ CREATE NOTE
    // =========================
    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        // 🧠 AI embedding
        $embedding = $this->ai->getEmbedding($data['content']);

        $note = Note::create([
            'title' => $data['title'],
            'content' => $data['content'],
            'embedding' => '[' . implode(',', $embedding) . ']'
        ]);

        return response()->json([
            'success' => true,
            'data' => $note
        ], 201);
    }

    // =========================
    // 🔍 GET SINGLE NOTE
    // =========================
    public function show($id)
    {
        return response()->json(
            Note::findOrFail($id)
        );
    }

    // =========================
    // ✏️ UPDATE NOTE
    // =========================
    public function update(Request $request, $id)
    {
        $note = Note::findOrFail($id);

        $data = $request->validate([
            'title' => 'sometimes|string|max:255',
            'content' => 'sometimes|string',
        ]);

       if (isset($data['content'])) {
    $embedding = $this->ai->getEmbedding($data['content']);
    $data['embedding'] = '[' . implode(',', $embedding) . ']';
}

$note->update($data);

        return response()->json([
            'success' => true,
            'data' => $note
        ]);
    }

    // =========================
    // 🗑 DELETE NOTE
    // =========================
    public function destroy($id)
    {
        Note::findOrFail($id)->delete();

        return response()->json([
            'message' => 'Deleted successfully'
        ]);
    }

    // =========================
    // 🔍 AI SEARCH (PGVECTOR + REDIS)
    // =========================
    public function search(Request $request)
    {
        $request->validate([
            'query' => 'required|string|min:2'
        ]);

        $query = trim($request->query('query'));

        $cacheKey = "note_search:" . md5($query);

        return Cache::remember($cacheKey, 600, function () use ($query) {

            // 🧠 Convert query → embedding
            $queryEmbedding = $this->ai->getEmbedding($query);

            // Convert array → pgvector format
            $vector = '[' . implode(',', $queryEmbedding) . ']';

            // ⚡ PGVECTOR QUERY (REAL PRODUCTION SEARCH)
            $results = Note::select(
                    'id',
                    'title',
                    'content',
                    'created_at'
                )
                ->selectRaw("embedding <=> ? AS score", [$vector])
                ->whereRaw("embedding <=> ? < 0.85", [$vector])
                ->orderBy('score')
                ->limit(10)
                ->get();

            return [
                'query' => $query,
                'results' => $results
            ];
        });
    }

    // =========================
    // 🧠 SUMMARY (AI)
    // =========================
    public function summary($id)
    {
        $note = Note::findOrFail($id);

        $summary = $this->ai->generateSummary($note->content);

        return response()->json([
            'summary' => $summary
        ]);
    }
}