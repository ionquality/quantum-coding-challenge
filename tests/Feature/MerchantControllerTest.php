<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Merchant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class MerchantControllerTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected function authenticate(): User
    {
        $user = User::factory()->create();
        $this->actingAs($user, 'sanctum');
        return $user;
    }

    public function test_it_lists_all_merchants()
    {
        $this->authenticate();
        Merchant::factory()->count(3)->create();

        $this->getJson('/api/merchants')
            ->assertOk()
            ->assertJsonStructure(['data' => [['id', 'name']]]);
    }

    public function test_it_creates_a_new_merchant()
    {
        $user = $this->authenticate();

        $payload = ['name' => 'New Merchant'];

        $this->postJson('/api/merchants', $payload)
            ->assertCreated()
            ->assertJson([
                'success' => true,
                'message' => 'Merchant created successfully.',
            ]);

        $this->assertDatabaseHas('merchants', [
            'name' => 'New Merchant',
            'created_by' => $user->id,
        ]);
    }

    public function test_it_shows_a_single_merchant()
    {
        $this->authenticate();
        $merchant = Merchant::factory()->create();

        $this->getJson("/api/merchants/$merchant->id")
            ->assertOk()
            ->assertJson([
                'data' => ['id' => $merchant->id, 'name' => $merchant->name]
            ]);
    }

    public function test_it_updates_a_merchant()
    {
        $this->authenticate();
        $merchant = Merchant::factory()->create();

        $this->putJson("/api/merchants/$merchant->id", ['name' => 'Updated Merchant'])
            ->assertOk()
            ->assertJson([
                'success' => true,
                'message' => 'Merchant created successfully.', // Consider fixing this in your controller
            ]);

        $this->assertDatabaseHas('merchants', [
            'id' => $merchant->id,
            'name' => 'Updated Merchant',
        ]);
    }

    public function test_it_deletes_a_merchant()
    {
        $this->authenticate();
        $merchant = Merchant::factory()->create();

        $this->deleteJson("/api/merchants/$merchant->id")
            ->assertNoContent();

        $this->assertSoftDeleted('merchants', ['id' => $merchant->id]);
    }
}
