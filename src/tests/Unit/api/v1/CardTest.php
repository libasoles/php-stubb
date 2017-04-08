<?php
namespace Tests\Unit;

use Faker\Factory as Faker;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Tests\TestCase;

class CardTest extends TestCase
{
    protected $api;
    protected $faker;

    protected function setUp(): void
    {
        $this->api = '/api/v1';
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

        $response = $this->json('GET', $this->api.'/cards');
        $this->assertEquals(200, $response->status(), 'Response code must be 200');
    
        $data = $response->decodeResponseJson();

        // is not an empty result
        $this->assertNotEmpty($response, 'Data list must not be empty');
    }

    /**
     * Create Card
     *
     * @return int card id
     */
    public function testCreateCard(): int
    {
        $response = $this->post($this->api.'/cards', [
                'name' => 'My testing Card',
                'content' => $this->faker->text($maxNbChars = 200)
            ]);

        $this->assertEquals(201, $response->status(), 'Response code must be 201 Created');
    
        $data = $response->decodeResponseJson();
        
        // is not an empty result
        $this->assertNotEmpty($data['id'], 'Response must have an id');

        return $data['id'];
    }

    /**
     * Update card
     *
     * @depends testCreateCard
     * @return void
     */
    public function testSaveCard(int $id)
    {
        $response = $this->put($this->api.'/cards/' . $id, [
                'name' => 'My testing Card',
                'content' => 'updated ' . date("Y-m-d H:i:s"),
                'enabled' => false
            ]);

        $this->assertEquals(204, $response->status(), 'Response code must be 204 No Content');
    }
    
    /**
     * Update card with null values
     *
     * @depends testCreateCard
     * @return void
     */
    public function testSaveCardNullValues(int $id)
    {
        $response = $this->put($this->api.'/cards/' . $id, [
                'name' => null,
                'content' => null,
                'enabled' => false
            ]);      
        $this->assertEquals(500, $response->status(), 'Response code must be 500 Server Error');
    }

    /**
     * Retrieve card
     *
     * @depends testCreateCard
     * @return void
     */
    public function testGetCard(int $id)
    {
        $response = $this->json('GET', $this->api.'/cards/' . $id);

        $this->assertEquals(200, $response->status(), 'Response code must be 200 OK');
    
        $data = $response->decodeResponseJson();
        
        // is not an empty result
        $this->assertNotEmpty($data, 'Item data must not be empty');
    }

    /**
     * Delete card
     *
     * @depends testCreateCard
     * @return void
     */
    public function testDeleteCard(int $id)
    {
        $response = $this->delete($this->api.'/cards/' . $id);
        $this->assertEquals(204, $response->status(), 'Response code must be 204 No Content');
    }
}
