<?php
namespace Tests\Unit;

use App\Tag;
use Carbon\Carbon;
use Faker\Factory as Faker;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class TagTest extends TestCase
{

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

        $response = $this->json('GET', '/api/tags')->decodeResponseJson();

        // is not an empty result
        $this->assertNotEmpty($response['data'], 'Data list must not be empty');

        // response success is true
        $this->assertEquals('success', $response['status'], 'The response status should be "success"');
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

        $response = $this->json('GET', '/api/tag/' . $tag->id)
            ->decodeResponseJson();

        // is not an empty result
        $this->assertNotEmpty($response['data'], 'Item data must not be empty');

        // response success is true
        $this->assertEquals('success', $response['status'], 'The response status should be "success"');
        
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
        $response = $this->delete('/api/tag/' . $tag_id)->decodeResponseJson();

        // response success is true
        $this->assertEquals('success', $response['status'], 'The response status should be "success"');
    }

    protected function tearDown(): void
    {
        $this->delete('/api/card/' . $this->card_id);
        $this->delete('/api/tag/' . $this->tag_id);
        parent::tearDown();
    }
}
