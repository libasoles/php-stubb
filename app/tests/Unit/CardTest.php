<?php
namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Foundation\Testing\DatabaseMigrations;

class CardTest extends TestCase
{

    /**
     * List cards
     *
     * @return void
     */
    public function testCardsList()
    {

        $response = $this->json('GET', '/api/cards')->decodeResponseJson();

        // is not an empty result
        $this->assertNotEmpty($response);

        // response success is true
        $this->assertEquals('success', $response['status']);
    }

    /**
     * Create Card
     *
     * @return int card id
     */
    public function testCreateCard()
    {
        $response = $this->post('/api/card', [
                'name' => 'My testing Card',
                'content' => 'Lorem Ipsum Test Content'
            ])->decodeResponseJson();

        // is not an empty result
        $this->assertNotEmpty($response);

        // response success is true
        $this->assertEquals('success', $response['status']);

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
        $this->assertNotEmpty($response);

        // response success is true
        $this->assertEquals('success', $response['status']);
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
        $this->assertNotEmpty($response);

        // response success is true
        $this->assertEquals('success', $response['status']);
    }

    /**
     * Retrieve card
     *
     * @depends testCreateCard
     * @return void
     */
    public function testDeleteCard($id)
    {
        $response = $this->delete('/api/card/' . $id)->decodeResponseJson();

        // is not an empty result
        $this->assertNotEmpty($response);

        // response success is true
        $this->assertEquals('success', $response['status']);
    }
}
