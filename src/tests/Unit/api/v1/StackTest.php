<?php
namespace Tests\Unit;

use Faker\Factory as Faker;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Tests\TestCase;

class StackTest extends TestCase
{
    protected $api = '/api/v1';
    protected $faker;

    protected function setUp(): void
    {
        $this->faker = Faker::create();
        parent::setUp();
    }

    /**
     * Test stack list
     *
     * @return void
     */
    public function testStackList()
    {
        $response = $this->json('GET', $this->api.'/stacks')->decodeResponseJson();

        // is not an empty result
        $this->assertNotEmpty($response, 'Data list must not be empty');
    }

    /**
     * Create Stack
     *
     * @return int stack id
     */
    public function testCreateStack(): int
    {

        $response = $this->post($this->api.'/stacks', [
                'name' => 'My testing Stack',
                'description' => $this->faker->text($maxNbChars = 200)
            ]);
        
        $this->assertEquals(201, $response->status(), 'Response code must be 201 Created');
    
        $data = $response->decodeResponseJson();

        // is not an empty result
        $this->assertNotEmpty($data['id'], 'Response must have an id');

        return $data['id'];
    }

    /**
     * Update stack
     *
     * @depends testCreateStack
     * @return void
     */
    public function testSaveStack(int $id)
    {
        $response = $this->put($this->api.'/stacks/' . $id, [
                'name' => 'My testing Stack',
                'description' => 'updated ' . date("Y-m-d H:i:s"),
                'enabled' => false
            ]);

        $this->assertEquals(204, $response->status(), 'Response code must be 204 No Content');
    }

    /**
     * Update stack with null value
     *
     * @depends testCreateStack
     * @return void
     */
    public function testSaveStackNullValues(int $id)
    {
        $response = $this->put($this->api.'/stacks/' . $id, [
                'name' => null,
                'description' => null,
                'enabled' => false
            ]);
        
        $this->assertEquals(500, $response->status(), 'Response code must be 500 Server Error');
    }

    /**
     * Retrieve stack
     *
     * @depends testCreateStack
     * @return void
     */
    public function testGetStack(int $id)
    {
        $response = $this->json('GET', $this->api.'/stacks/' . $id);
        
        $this->assertEquals(200, $response->status(), 'Response code must be 200 OK');
    
        $data = $response->decodeResponseJson();

        // is not an empty result
        $this->assertNotEmpty($data, 'Item data must not be empty');
    }

    /**
     * Delete stack
     *
     * @depends testCreateStack
     * @return void
     */
    public function testDeleteStack(int $id)
    {
        $response = $this->delete($this->api.'/stacks/' . $id);
        $this->assertEquals(204, $response->status(), 'Response code must be 204 No Content');
    }
    
}
