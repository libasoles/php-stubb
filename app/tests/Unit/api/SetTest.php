<?php
namespace Tests\Unit;

use Faker\Factory as Faker;
use Tests\TestCase;

class SetTest extends TestCase
{

    protected function setUp(): void
    {
        $this->faker = Faker::create();
        parent::setUp();
    }

    /**
     * Test set list
     *
     * @return void
     */
    public function testSetList()
    {
        $response = $this->json('GET', '/api/sets')->decodeResponseJson();

        // is not an empty result
        $this->assertNotEmpty($response['data'], 'Data list must not be empty');

        // response success is true
        $this->assertEquals('success', $response['status'], 'The response status should be "success"');
    }

    /**
     * Create Set
     *
     * @return int set id
     */
    public function testCreateSet(): int
    {

        $response = $this->post('/api/set', [
                'name' => 'My testing Set',
                'description' => $this->faker->text($maxNbChars = 200)
            ])->decodeResponseJson();

        // is not an empty result
        $this->assertNotEmpty($response['id'], 'Response must have an id');

        // response success is true
        $this->assertEquals('success', $response['status'], 'The response status should be "success"');

        return $response['id'];
    }

    /**
     * Update set
     *
     * @depends testCreateSet
     * @return void
     */
    public function testSaveSet(int $id)
    {
        $response = $this->post('/api/set/' . $id, [
                'name' => 'My testing Set',
                'content' => 'updated ' . date("Y-m-d H:i:s"),
                'enabled' => false
            ])->decodeResponseJson();

        // is not an empty result
        $this->assertNotEmpty($response['id'], 'Response must have an id');

        // response success is true
        $this->assertEquals('success', $response['status'], 'The response status should be "success"');
    }

    /**
     * Retrieve set
     *
     * @depends testCreateSet
     * @return void
     */
    public function testGetSet(int $id)
    {
        $response = $this->json('GET', '/api/set/' . $id)
            ->decodeResponseJson();

        // is not an empty result
        $this->assertNotEmpty($response['data'], 'Item data must not be empty');

        // response success is true
        $this->assertEquals('success', $response['status'], 'The response status should be "success"');
    }

    /**
     * Retrieve set
     *
     * @depends testCreateSet
     * @return void
     */
    public function testDeleteSet(int $id)
    {
        $response = $this->delete('/api/set/' . $id)->decodeResponseJson();

        // response success is true
        $this->assertEquals('success', $response['status'], 'The response status should be "success"');
    }
}
