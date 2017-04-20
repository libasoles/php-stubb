<?php
namespace Tests\Unit;

use Faker\Factory as Faker;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Tests\TestCase;

class StackControllerTest extends TestCase
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
        $response = $this->json('GET', $this->api . '/stacks');
        $response->assertStatus(200);

        // is not an empty result
        $this->assertNotEmpty($response, 'Data list must not be empty');

        $response->assertJsonFragment(["id" => 1]);
    }

    /**
     * Create Stack
     *
     * @return int stack id
     */
    public function testCreateStack(): int
    {

        $response = $this->post($this->api.'/stacks', [
                'name' => $this->faker->text($maxNbChars = 9),
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
     * @return void
     */
    public function testSaveStack()
    {
        $response = $this->put($this->api.'/stacks/1', [
                'name' => $this->faker->text($maxNbChars = 9),
                'description' => 'updated ' . date("Y-m-d H:i:s"),
                'enabled' => false
            ]);

        $this->assertEquals(204, $response->status(), 'Response code must be 204 No Content');
    }

    /**
     * Update stack with null value
     *
     * @return void
     */
    public function testSaveStackNullValues()
    {
        $response = $this->put($this->api.'/stacks/1', [
                'name' => null,
                'description' => null,
                'enabled' => false
            ]);
        
        $this->assertEquals(400, $response->status(), 'Response code must be 400');
    }

    /**
     * Retrieve stack
     *
     * @return void
     */
    public function testGetStack()
    {
        $response = $this->json('GET', $this->api.'/stacks/1');
        
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
    public function testDeleteStack()
    {
        $response = $this->delete($this->api.'/stacks/1');
        $this->assertEquals(204, $response->status(), 'Response code must be 204 No Content');
    }
    
}
