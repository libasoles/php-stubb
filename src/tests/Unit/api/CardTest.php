<?php
namespace Tests\Unit;

use Faker\Factory as Faker;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class CardTest extends TestCase
{
    protected $faker;

    protected function setUp(): void
    {
        $this->faker = Faker::create();
        parent::setUp();
    }

    /**
     * List cards
     *
     * @return void
     */
    public function testCardsList()
    {

        $response = $this->json('GET', '/api/cards')->decodeResponseJson();

        // is not an empty result
        $this->assertNotEmpty($response['data'], 'Data list must not be empty');

        // response success is true
        $this->assertEquals('success', $response['status'], 'The response status should be "success"');
    }

    /**
     * Create Card
     *
     * @return int card id
     */
    public function testCreateCard(): int
    {
        $response = $this->post('/api/card', [
                'name' => 'My testing Card',
                'content' => $this->faker->text($maxNbChars = 200)
            ])->decodeResponseJson();

        // is not an empty result
        $this->assertNotEmpty($response['id'], 'Response must have an id');

        // response success is true
        $this->assertEquals('success', $response['status'], 'The response status should be "success"');

        return $response['id'];
    }

    /**
     * Update card
     *
     * @depends testCreateCard
     * @return void
     */
    public function testSaveCard(int $id)
    {
        $response = $this->post('/api/card/' . $id, [
                'name' => 'My testing Card',
                'content' => 'updated ' . date("Y-m-d H:i:s"),
                'enabled' => false
            ])->decodeResponseJson();

        // is not an empty result
        $this->assertNotEmpty($response['id'], 'Response must have an id');

        // response success is true
        $this->assertEquals('success', $response['status'], 'The response status should be "success"');
    }
    
    /**
     * Update card with null values
     *
     * @depends testCreateCard
     * @return void
     */
    public function testSaveCardNullValues(int $id)
    {
        $this->expectException(ValidationException::class);
        
        $response = $this->post('/api/card/' . $id, [
                'name' => null,
                'content' => null,
                'enabled' => false
            ])->decodeResponseJson();
    }

    /**
     * Retrieve card
     *
     * @depends testCreateCard
     * @return void
     */
    public function testGetCard(int $id)
    {
        $response = $this->json('GET', '/api/card/' . $id)
            ->decodeResponseJson();

        // is not an empty result
        $this->assertNotEmpty($response['data'], 'Item data must not be empty');

        // response success is true
        $this->assertEquals('success', $response['status'], 'The response status should be "success"');
    }

    /**
     * Delete card
     *
     * @depends testCreateCard
     * @return void
     */
    public function testDeleteCard(int $id)
    {
        $response = $this->delete('/api/card/' . $id)->decodeResponseJson();

        // response success is true
        $this->assertEquals('success', $response['status'], 'The response status should be "success"');
    }
}
