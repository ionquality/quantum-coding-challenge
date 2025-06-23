<?php

namespace Database\Factories;

use App\Models\Merchant;
use App\Models\Note;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Note>
 */
class NoteFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'note' => $this->faker->paragraph(),
            'created_by' => User::factory(),
        ];
    }

    /**
     * Configure the model factory to associate the note with a merchant.
     *
     */
    public function forMerchant()
    {
        return $this->for(Merchant::factory(), 'notable'); // ✅ correct
    }



    /**
     * Configure the model factory with a specific creator user.
     *
     * @param User|null $user
     * @return Factory
     */
    public function byUser(User $user = null): Factory
    {
        $user = $user ?? User::factory()->create();

        return $this->state(function (array $attributes) use ($user) {
            return [
                'created_by' => $user->id,
            ];
        });
    }
}
