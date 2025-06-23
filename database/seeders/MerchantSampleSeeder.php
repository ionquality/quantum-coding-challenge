<?php
namespace Database\Seeders;
use App\Models\Merchant;
use App\Models\Note;
use Illuminate\Database\Seeder;

class MerchantSampleSeeder extends Seeder
{
    public function run(): void
    {
        // Only seed if there are no merchants
        if (Merchant::count() > 0) {
            $this->command->info('MerchantSampleSeeder skipped (merchants already exist).');
            return;
        }

        Merchant::factory()
            ->count(3)
            ->create()
            ->each(function ($merchant) {
                Note::factory()->count(3)->create([
                    'notable_id' => $merchant->id,
                    'notable_type' => Merchant::class,
                ]);
            });

        $this->command->info('Seeded 3 merchants with 3 notes each.');
    }
}
