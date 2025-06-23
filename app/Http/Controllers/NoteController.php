<?php

namespace App\Http\Controllers;

use App\Models\Note;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NoteController extends Controller
{
    /**
     * Display a listing of notes for a specific entity.
     */
    public function index(Request $request)
    {
        $request->validate([
            'type' => 'required|string',
            'typeId' => 'required|integer',
        ]);

        $type = $request->query('type');
        $typeId = $request->query('typeId');

        // Map the type to a fully qualified class name
        $notableType = $this->resolveNotableType($type);

        if (!$notableType) {
            return response()->json(['error' => 'Invalid type'], 400);
        }

        $notes = Note::where('notable_type', $notableType)
                    ->where('notable_id', $typeId)
                    ->with('creator')
                    ->orderBy('created_at', 'desc')
                    ->get();

        return response()->json($notes);
    }

    /**
     * Store a newly created note.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|string',
            'type_id' => 'required|integer',
            'note' => 'required|string',
        ]);

        $notableType = $this->resolveNotableType($validated['type']);

        if (!$notableType) {
            return response()->json(['error' => 'Invalid type'], 400);
        }


        $note = Note::create([
            'note' => $validated['note'],
            'notable_type' => $notableType,
            'notable_id' => $validated['type_id'],
            'created_by' => Auth::id() ?? 1,
        ]);

        return response()->json([
            'success' => true,
            'note' => $note
        ], 201);
    }

    /**
     * Display the specified note.
     */
    public function show(Note $note)
    {
        $note->load('creator');
        return response()->json($note);
    }

    /**
     * Update the specified note.
     */
    public function update(Request $request, Note $note)
    {
        $validated = $request->validate([
            'note' => 'required|string',
        ]);

        $note->update([
            'note' => $validated['note'],
        ]);

        $note->load('creator');

        return response()->json([
            'success' => true,
            'note' => $note
        ], 200);
    }

    /**
     * Remove the specified note from storage.
     */
    public function destroy(Note $note)
    {
        $note->delete();

        return response()->json([
            'success' => true,
        ], 200);
    }

    /**
     * Resolve the notable type string to a fully qualified class name.
     */
    private function resolveNotableType(string $type): ?string
    {
        return match ($type) {
            'merchant' => 'App\\Models\\Merchant',

            default => null,
        };
    }
}
