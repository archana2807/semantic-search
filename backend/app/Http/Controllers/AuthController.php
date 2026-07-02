<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Note;
use OpenAI\Laravel\Facades\OpenAI;

class NoteController extends Controller
{
    public function index()
    {
        return response()->json(Note::latest()->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string',
            'content' => 'required|string',
        ]);

        $note = Note::create($data);

        return response()->json([
            'success' => true,
            'data' => $note
        ]);
    }

    public function show($id)
    {
        return Note::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $note = Note::findOrFail($id);
        $note->update($request->only('title', 'content'));

        return response()->json($note);
    }

    public function destroy($id)
    {
        $note = Note::findOrFail($id);
        $note->delete();

        return response()->json([
            'message' => 'Deleted successfully'
        ]);
    }
}