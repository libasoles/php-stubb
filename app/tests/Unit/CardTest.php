<?php
namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class CardTest extends TestCase
{

    use DatabaseTransactions;

    /**
     * List cards
     *
     * @return void
     */
    public function testCardsList()
    {

        $response = $this->json('GET', '/cards');

        // is not an empty result
        $this->assertNotEmpty($this->getResult());

        // is a valid Json
        $this->assertJson($response);

        // response success is true
        $data = $response->decodeResponseJson();
        $this->assertEquals('success', $data['status']);
    }

    /**
     * Create Card
     *
     * @return void
     */
    public function testCreateCard()
    {
        $response = $this->post('/card', ['name' => 'My testing Card', 'content' => 'Lorem Ipsum Test Content']);

        // is not an empty result
        $this->assertNotEmpty($this->getResult());

        // is a valid Json
        $this->assertJson($response);

        // response success is true
        $data = $response->decodeResponseJson();
        $this->assertEquals('success', $data['status']);
    }

    /**
     * Update card
     *
     * @return void
     */
    public function testSaveCard()
    {
        $response = $this->post('/card/1', ['name' => 'My testing Card', 'content' => 'updated' + date("Y-m-d H:i:s")]);

        // is not an empty result
        $this->assertNotEmpty($this->getResult());

        // is a valid Json
        $this->assertJson($response);

        // response success is true
        $data = $response->decodeResponseJson();
        $this->assertEquals('success', $data['status']);
    }

    /**
     * Retrieve card
     *
     * @return void
     */
    public function testGetCard()
    {
        $response = $this->json('GET', '/card/1');

        // is not an empty result
        $this->assertNotEmpty($this->getResult());

        // is a valid Json
        $this->assertJson($response);

        // response success is true
        $data = $response->decodeResponseJson();
        $this->assertEquals('success', $data['status']);
    }

    /**
     * Retrieve card
     *
     * @return void
     */
    public function testDeleteCard()
    {
        $response = $this->delete('/card/1');

        // is not an empty result
        $this->assertNotEmpty($this->getResult());

        // is a valid Json
        $this->assertJson($response);

        // response success is true
        $data = $response->decodeResponseJson();
        $this->assertEquals('success', $data['status']);
    }
}
