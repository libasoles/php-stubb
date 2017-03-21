<?php
namespace Tests\Unit;

use Faker\Factory as Faker;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class StackTest extends TestCase
{

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
        $response = $this->json('GET', '/api/stacks')->decodeResponseJson();

        // is not an empty result
        $this->assertNotEmpty($response['data'], 'Data list must not be empty');

        // response success is true
        $this->assertEquals('success', $response['status'], 'The response status should be "success"');
    }

    /**
     * Create Stack
     *
     * @return int stack id
     */
    public function testCreateStack(): int
    {

        $response = $this->post('/api/stack', [
                'name' => 'My testing Stack',
                'description' => $this->faker->text($maxNbChars = 200)
            ])->decodeResponseJson();

        // is not an empty result
        $this->assertNotEmpty($response['id'], 'Response must have an id');

        // response success is true
        $this->assertEquals('success', $response['status'], 'The response status should be "success"');

        return $response['id'];
    }

    /**
     * Update stack
     *
     * @depends testCreateStack
     * @return void
     */
    public function testSaveStack(int $id)
    {
        $response = $this->post('/api/stack/' . $id, [
                'name' => 'My testing Stack',
                'description' => 'updated ' . date("Y-m-d H:i:s"),
                'enabled' => false
            ])->decodeResponseJson();

        // is not an empty result
        $this->assertNotEmpty($response['id'], 'Response must have an id');

        // response success is true
        $this->assertEquals('success', $response['status'], 'The response status should be "success"');
    }

    /**
     * Update stack with null value
     *
     * @depends testCreateStack
     * @return void
     */
    public function testSaveStackNullValues(int $id)
    {
       
        $response = $this->post('/api/stack/' . $id, [
                'name' => null,
                'description' => null,
                'enabled' => false
            ])->decodeResponseJson();
        
        
        // response success is true
        $this->assertEquals('error', $response['status'], 'The response status should be "error"');
    }

    /**
     * Retrieve stack
     *
     * @depends testCreateStack
     * @return void
     */
    public function testGetStack(int $id)
    {
        $response = $this->json('GET', '/api/stack/' . $id)
            ->decodeResponseJson();

        // is not an empty result
        $this->assertNotEmpty($response['data'], 'Item data must not be empty');

        // response success is true
        $this->assertEquals('success', $response['status'], 'The response status should be "success"');
    }

    /**
     * Delete stack
     *
     * @depends testCreateStack
     * @return void
     */
    public function testDeleteStack(int $id)
    {
        $response = $this->delete('/api/stack/' . $id)->decodeResponseJson();

        // response success is true
        $this->assertEquals('success', $response['status'], 'The response status should be "success"');
    }
    
}
