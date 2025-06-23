<?php

namespace Tests\Unit;

use App\Models\Merchant;
use App\Models\Note;
use App\Models\User;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MerchantTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_has_expected_fillable_attributes()
    {
        $merchant = new Merchant();

        $this->assertEquals(
            ['name', 'created_by'],
            $merchant->getFillable()
        );
    }

    public function test_creator_relationship_returns_belongs_to()
    {
        $merchant = new Merchant();

        $this->assertInstanceOf(BelongsTo::class, $merchant->creator());
        $this->assertEquals('created_by', $merchant->creator()->getForeignKeyName());
    }

    public function test_notes_relationship_returns_morph_many()
    {
        $merchant = new Merchant();

        $this->assertInstanceOf(MorphMany::class, $merchant->notes());
        $this->assertEquals('notable_type', $merchant->notes()->getMorphType());
    }

    public function test_it_can_have_notes()
    {
        $merchant = Merchant::factory()->create();
        $note = Note::factory()->create([
            'notable_id' => $merchant->id,
            'notable_type' => Merchant::class,
        ]);

        $this->assertTrue($merchant->notes->contains($note));
    }

    public function test_it_belongs_to_creator()
    {
        $user = User::factory()->create();
        $merchant = Merchant::factory()->create(['created_by' => $user->id]);

        $this->assertInstanceOf(User::class, $merchant->creator);
        $this->assertEquals($user->id, $merchant->creator->id);
    }
}
