<?php

namespace Tests\Unit\Models;

use App\Models\Merchant;
use App\Models\Note;
use App\Models\User;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NoteTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_note()
    {
        $user = User::factory()->create();
        $merchant = Merchant::factory()->create();

        $note = Note::factory()->create([
            'note' => 'Test note',
            'notable_id' => $merchant->id,
            'notable_type' => Merchant::class,
            'created_by' => $user->id,
        ]);

        $this->assertInstanceOf(Note::class, $note);
        $this->assertEquals('Test note', $note->note);
        $this->assertEquals($merchant->id, $note->notable_id);
        $this->assertEquals(Merchant::class, $note->notable_type);
        $this->assertEquals($user->id, $note->created_by);
    }

    public function test_notable_relationship_with_merchant()
    {
        $merchant = Merchant::factory()->create();
        $note = Note::factory()->create([
            'notable_id' => $merchant->id,
            'notable_type' => Merchant::class,
        ]);

        $this->assertInstanceOf(MorphTo::class, $note->notable());
        $this->assertInstanceOf(Merchant::class, $note->notable);
        $this->assertEquals($merchant->id, $note->notable->id);
    }

    public function test_creator_relationship()
    {
        $user = User::factory()->create();
        $merchant = Merchant::factory()->create();

        $note = Note::factory()->create([
            'created_by' => $user->id,
            'notable_id' => $merchant->id,
            'notable_type' => Merchant::class,
        ]);

        $this->assertInstanceOf(BelongsTo::class, $note->creator());
        $this->assertInstanceOf(User::class, $note->creator);
        $this->assertEquals($user->id, $note->creator->id);
    }

    public function test_soft_delete_functionality()
    {
        $merchant = Merchant::factory()->create();

        $note = Note::factory()->create([
            'notable_id' => $merchant->id,
            'notable_type' => Merchant::class,
        ]);

        $noteId = $note->id;

        $note->delete();

        $this->assertSoftDeleted('notes', ['id' => $noteId]);
        $this->assertDatabaseMissing('notes', [
            'id' => $noteId,
            'deleted_at' => null
        ]);

        $this->assertNotNull(Note::withTrashed()->find($noteId));
    }

    public function test_mass_assignment_protection()
    {
        $user = User::factory()->create();
        $merchant = Merchant::factory()->create();

        $note = Note::create([
            'note' => 'Test note content',
            'notable_id' => $merchant->id,
            'notable_type' => Merchant::class,
            'created_by' => $user->id
        ]);

        $this->assertDatabaseHas('notes', [
            'id' => $note->id,
            'note' => 'Test note content',
            'notable_id' => $merchant->id,
            'notable_type' => Merchant::class,
            'created_by' => $user->id
        ]);
    }
}
