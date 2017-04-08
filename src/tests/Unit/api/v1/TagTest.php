<?php
namespace Tests\Unit;

use App\Tag;
use Carbon\Carbon;
use Faker\Factory as Faker;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class TagTest extends TestCase
{
    protected $api = '/api/v1';
    
    protected function setUp(): void
    {
        $this->card_id = null;
        $this->tag_id = null;
        parent::setUp();
    }

    /**
     * List tags
     *
     * @return void
     */
    public function testTagsList()
    {

        $response = $this->json('GET', $this->api.'/tags')->decodeResponseJson();

        // is not an empty result
        $this->assertNotEmpty($response, 'Data list must not be empty');
    }

    /**
     * Retrieve tag
     *
     * @return void
     */
    public function testGetTag()
    {
        $faker = Faker::create();
        $this->card_id = DB::table('cards')->insertGetId([
            'name' => $faker->sentence($nbWords = 6, $variableNbWords = true),
            'content' => $faker->text($maxNbChars = 200),
            'enabled' => 1,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now()
        ]);

        $tag = Tag::create([
                'name' => $faker->word()
        ]);
        $tag->cards()->attach($this->card_id);
        $this->tag_id = $tag->id;

        $response = $this->json('GET', $this->api.'/tags/' . $tag->id)
            ->decodeResponseJson();

        // is not an empty result
        $this->assertNotEmpty($response, 'Item data must not be empty');
        
        return $tag->id;
    }

    /**
     * Delete tag
     * 
     * @depends testGetTag
     * @return void
     */
    public function testDeleteTag(int $tag_id)
    {
        $response = $this->delete($this->api.'/tags/' . $tag_id);
        $this->assertEquals(204, $response->status(), 'Response code must be 204 No Content');
    }

    protected function tearDown(): void
    {
        $this->delete($this->api.'/card/' . $this->card_id);
        $this->delete($this->api.'/tag/' . $this->tag_id);
        parent::tearDown();
    }
}
