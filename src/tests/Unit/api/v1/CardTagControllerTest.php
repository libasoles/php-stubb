<?php
namespace Tests\Unit\Api\v1;

use Faker\Factory as Faker;
use Tests\TestCase;

class CardTagControllerTest extends TestCase
{
    
    protected function setUp(): void
    {
        parent::setUp();
    }

    /**
     * List cards w/tags
     *
     * @return void
     */
    public function testCardTagsList()
    {
        
        $response = $this->call('GET', $this->api.'/cards-tags');
 
        $response->assertStatus(200);
        
        $data = $response->decodeResponseJson();
        
        // is not an empty result
        $this->assertNotEmpty($data, 'Data list must not be empty');
                
        $this->assertNotEmpty($data[0]['tags'], 'Tag list must not be empty');
        
        //$this->assertNotEmpty($data[0]['tag_count'], 'Tag count must not be null');
        
        $response->assertJsonFragment(["id"=> 1]);
    }
    
    /**
     * Retrieve card
     *
     * @return void
     */
    public function testGetCardTags()
    {
        $response = $this->json('GET', $this->api.'/cards/1/tags');

        $this->assertEquals(200, $response->status(), 'Response code must be 200 OK');
    
        $data = $response->decodeResponseJson();
        
        // is not an empty result
        $this->assertNotEmpty($data, 'Item data must not be empty');
        
        $this->assertNotEmpty($data['tags'], 'Tag list must not be empty');
        
        //$this->assertNotEmpty($data['tag_count'], 'Tag count must not be null');
    }
    
    /**
     * Retrieve tag cards
     *
     * @return void
     */
    public function testGetTagCards()
    {
        $response = $this->json('GET', $this->api.'/tags/1/cards');

        $this->assertEquals(200, $response->status(), 'Response code must be 200 OK');
    
        $data = $response->decodeResponseJson();
        
        // is not an empty result
        $this->assertNotEmpty($data, 'Item data must not be empty');
        
        $this->assertNotEmpty($data['cards'], 'Cards list must not be empty');
        
        //$this->assertNotEmpty($data['cards_count'], 'Tag count must not be null');
    }
}
