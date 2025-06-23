<?php

namespace Tests\Feature;

use App\Models\Merchant;
use App\Models\Note;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class NoteControllerTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->actingAs($this->user);
    }

    public function test_can_list_notes_for_a_merchant()
    {
        $merchant = Merchant::factory()->create();
        Note::factory()->count(3)->for($merchant, 'notable')->byUser($this->user)->create();

        $response = $this->getJson("/api/notes?type=merchant&typeId={$merchant->id}");

        $response->assertStatus(200)
            ->assertJsonCount(3);
    }

    public function test_returns_error_for_invalid_type()
    {
        $response = $this->getJson("/api/notes?type=invalid&typeId=1");

        $response->assertStatus(400)
            ->assertJson(['error' => 'Invalid type']);
    }

    public function test_validates_required_parameters_for_listing()
    {
        $response = $this->getJson("/api/notes");

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['type', 'typeId']);
    }

    public function test_can_create_note_for_merchant()
    {
        $merchant = Merchant::factory()->create();

        $noteData = [
            'type' => 'merchant',
            'type_id' => $merchant->id,
            'note' => 'This is a test note for merchant',
        ];

        $response = $this->postJson('/api/notes', $noteData);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'note' => [
                    'note' => 'This is a test note for merchant',
                ]
            ]);

        $this->assertDatabaseHas('notes', [
            'notable_type' => Merchant::class,
            'notable_id' => $merchant->id,
            'note' => 'This is a test note for merchant',
            'created_by' => $this->user->id,
        ]);
    }

    public function test_validates_note_data_on_create()
    {
        $merchant = Merchant::factory()->create();

        $noteData = [
            'type' => 'merchant',
            'type_id' => $merchant->id,
        ];

        $response = $this->postJson('/api/notes', $noteData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['note']);
    }

    public function test_can_show_a_note()
    {
        $note = Note::factory()->forMerchant()->byUser($this->user)->create();

        $response = $this->getJson("/api/notes/{$note->id}");

        $response->assertStatus(200)
            ->assertJson([
                'id' => $note->id,
                'note' => $note->note,
                'creator' => [
                    'id' => $this->user->id
                ]
            ]);
    }

    public function test_can_update_a_note()
    {
        $note = Note::factory()->forMerchant()->byUser($this->user)->create();

        $updatedData = [
            'note' => 'Updated note content',
        ];

        $response = $this->putJson("/api/notes/{$note->id}", $updatedData);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'note' => [
                    'note' => 'Updated note content',
                ]
            ]);

        $this->assertDatabaseHas('notes', [
            'id' => $note->id,
            'note' => 'Updated note content',
        ]);
    }

    public function test_validates_note_data_on_update()
    {
        $note = Note::factory()->forMerchant()->byUser($this->user)->create();

        $response = $this->putJson("/api/notes/{$note->id}", ['note' => '']);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['note']);
    }

    public function test_can_delete_a_note()
    {
        $note = Note::factory()->forMerchant()->byUser($this->user)->create();

        $response = $this->deleteJson("/api/notes/{$note->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $this->assertSoftDeleted('notes', [
            'id' => $note->id,
        ]);
    }
}
