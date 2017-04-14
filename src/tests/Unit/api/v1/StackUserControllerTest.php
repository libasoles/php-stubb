<?php
namespace Tests\Unit;

use Faker\Factory as Faker;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Tests\TestCase;

class StackUserControllerTest extends TestCase
{
    /**
     * Retrieves a list of the stacks for a given user.
     *
     * @return Response
     */
    public function testGetUserStacks()
    {
       
        $response = $this->json('GET', $this->api . '/users/1/stacks');
        $response->assertStatus(200);
        
        // is not an empty result
        $this->assertNotEmpty($response, 'Data list must not be empty');
        
        $response->assertJsonFragment(["id"=> 2]);
    }
}
