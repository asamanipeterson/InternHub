<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Mentor;
use Google\Client as GoogleClient;

class CheckGoogleTokens extends Command
{
    protected $signature = 'google:check-tokens';
    protected $description = 'Verify if mentor Google tokens are still valid';

    public function handle()
    {
        $mentors = Mentor::whereNotNull('google_refresh_token')->get();

        $this->info("Checking " . $mentors->count() . " mentors...");

        foreach ($mentors as $mentor) {
            $client = new GoogleClient();
            $client->setClientId(config('services.google.client_id'));
            $client->setClientSecret(config('services.google.client_secret'));

            try {
                // The Model automatically decrypts these
                $newToken = $client->fetchAccessTokenWithRefreshToken($mentor->google_refresh_token);

                if (isset($newToken['error'])) {
                    $this->error("Mentor ID {$mentor->id} ({$mentor->user->name}): FAILED - " . ($newToken['error_description'] ?? $newToken['error']));
                } else {
                    $this->info("Mentor ID {$mentor->id} ({$mentor->user->name}): VALID");
                }
            } catch (\Exception $e) {
                $this->error("Mentor ID {$mentor->id}: EXCEPTION - " . $e->getMessage());
            }
        }
    }
}
