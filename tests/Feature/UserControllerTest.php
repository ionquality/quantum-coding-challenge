<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class UserControllerTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    /**
     * Test the store method.
     *
     * @return void
     */
    public function testStore()
    {
        $userData = [
            'first_name' => $this->faker->firstName,
            'last_name' => $this->faker->lastName,
            'username' => $this->faker->userName,
            'name' => $this->faker->name,
            'email' => $this->faker->unique()->safeEmail,
            'password' => 'password', // password
            'avatar' => $this->faker->imageUrl(),
            'theme' => $this->faker->randomElement(['dark', 'light']),
            'locale' => $this->faker->locale,
            'phone' => $this->faker->phoneNumber,
            'active' => $this->faker->boolean,
        ];

        $response = $this->post(route('users.store'), $userData);

        $response
            ->assertStatus(201)
            ->assertJson([
                'first_name' => $userData['first_name'],
                'last_name' => $userData['last_name'],
                'username' => $userData['username'],
                'name' => $userData['name'],
                'email' => $userData['email'],
                'avatar' => $userData['avatar'],
                'theme' => $userData['theme'],
                'locale' => $userData['locale'],
                'phone' => $userData['phone'],
                'active' => $userData['active'],
            ]);
    }

    public function testUpdate()
    {
        $user = User::factory()->create();
        $email = $this->faker->unique()->safeEmail;
        $first_name = $this->faker->firstName;
        $last_name = $this->faker->lastName;
        $name = $first_name . ' ' . $last_name;
        $userData = [
            'first_name' => $first_name,
            'last_name' => $last_name,
            'email' => $email,
            'username' => $email,
            'name' => $name,
            'password' => 'password', // password
            'avatar' => $this->faker->imageUrl(),
            'theme' => $this->faker->randomElement(['dark', 'light']),
            'locale' => $this->faker->locale,
            'phone' => $this->faker->phoneNumber,
            'active' => $this->faker->boolean,
        ];

        $response = $this->put(route('users.update', $user), $userData);

        $response->assertOk();

        $this->assertDatabaseHas('users', [
            'first_name' => $userData['first_name'],
            'last_name' => $userData['last_name'],
            'username' => $userData['email'],
            'name' => $userData['first_name'] . ' ' . $userData['last_name'],
            'email' => $userData['email'],
            'avatar' => $userData['avatar'],
            'theme' => $userData['theme'],
            'locale' => $userData['locale'],
            'phone' => $userData['phone'],
            'active' => $userData['active'],
        ]);
    }

    /**
     * Test the destroy method.
     *
     * @return void
     */
    public function testDestroy()
    {
        $user = User::factory()->create();

        $response = $this->delete(route('users.destroy', $user));

        $response->assertJson(['success' => true]);
        $response->assertStatus(200);

        $deletedUser = User::find($user->id);
        $this->assertNull($deletedUser);
    }

}
