<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class CardTest extends TestCase {

    use DatabaseTransactions;

    /**
     * List cards
     *
     * @return void
     */
    public function testCardsList() {
        
        $this->json('/cards')
                ->seeJson([
                    'success' => true
        ]);
        
        // Response OK
        $this->assertResponseOk();
        
        // Data is not empty
        $data = $this->getResponse()->getContent();
        $this->assertNotEmpty($data['data']);
    }

    /**
     * Create Card
     *
     * @return void
     */
    public function testCreateCard() {
        $this->post('/card', ['name' => 'My testing Card', 'content' => 'Lorem Ipsum Content'])
                ->seeJsonEquals([
                    'success' => true
        ]);
    }

    /**
     * Update card
     *
     * @return void
     */
    public function testSaveCard() {
        $this->post('/card/1', ['name' => 'My testing Card', 'content' => 'updated' + date("Y-m-d H:i:s")])
                ->seeJsonEquals([
                    'success' => true
        ]);
    }

    /**
     * Retrieve card
     *
     * @return void
     */
    public function testGetCard() {
        $this->json('/card/1')
                ->seeJson([
                    'success' => true
        ]);
        
        // Response OK
        $this->assertResponseOk();
        
        // Data is not empty
        $data = $this->getResponse()->getContent();
        $this->assertNotEmpty($data['data']);
    }

    /**
     * Retrieve card
     *
     * @return void
     */
    public function testDeleteCard() {
        $this->delete('/card/1')
                ->seeJson([
                    'success' => true
        ]);
    }

}
