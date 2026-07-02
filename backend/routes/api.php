<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\NoteController;



// CRUD
Route::get('/notes', [NoteController::class, 'index']);
Route::post('/notes', [NoteController::class, 'store']);

// ✅ AI routes FIRST (important)
Route::middleware('throttle:60,1')->group(function () {
    Route::get('/notes/search', [NoteController::class, 'search']);
    Route::post('/notes/{id}/summary', [NoteController::class, 'summary']);
});

// ✅ THEN dynamic routes LAST
Route::get('/notes/{id}', [NoteController::class, 'show'])
    ->where('id', '[0-9]+');

Route::put('/notes/{id}', [NoteController::class, 'update'])
    ->where('id', '[0-9]+');

Route::delete('/notes/{id}', [NoteController::class, 'destroy'])
    ->where('id', '[0-9]+');