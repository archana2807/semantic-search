<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class AiService
{
    private string $baseUrl = "https://openrouter.ai/api/v1";

    private function headers(): array
    {
        return [
            'Authorization' => 'Bearer ' . env('OPENROUTER_API_KEY'),
            'Content-Type'  => 'application/json',
        ];
    }

    // 🔥 EMBEDDINGS
    public function getEmbedding(string $text): array
    {
        $response = Http::withHeaders($this->headers())
            ->post($this->baseUrl . '/embeddings', [
                'model' => 'text-embedding-3-small',
                'input' => $text,
            ]);

        return $response->json('data.0.embedding', []);
    }

    // 🧠 SUMMARY
    public function generateSummary(string $text): string
    {
        $response = Http::withHeaders($this->headers())
            ->post($this->baseUrl . '/chat/completions', [
                'model' => 'openai/gpt-4o-mini',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'Summarize in 5 bullet points'
                    ],
                    [
                        'role' => 'user',
                        'content' => $text
                    ]
                ]
            ]);

        return $response->json('choices.0.message.content', '');
    }
}