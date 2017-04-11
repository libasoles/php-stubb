<?php

use Carbon\Carbon;
use Faker\Factory as Faker;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Card;
use App\Tag;

class DatabaseSeeder extends Seeder
{

    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $faker = Faker::create();
        foreach (range(1, 7) as $index) {

            // create stack
            $stack_id = DB::table('stacks')->insertGetId([
                'name' => $faker->sentence($nbWords = 6, $variableNbWords = true),
                'description' => $faker->text($maxNbChars = 200),
                'enabled' => 1,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now()
            ]);

            // assign cards
            foreach (range(1, 10) as $index) {

                $cardContent = $faker->text($maxNbChars = 200);

                $card = Card::create([
                        'name' => $faker->sentence($nbWords = 6, $variableNbWords = true),
                        'content' => $cardContent,
                        'enabled' => 1,
                        'created_at' => Carbon::now(),
                        'updated_at' => Carbon::now()
                ]);
                // associate stack and card
                $card->stack()->attach($stack_id);

                // assign random tags (belonging to card content)
                $tags = explode(' ', str_replace('.', '', $cardContent));
                $indices = array_rand($tags, 3); // create three random tags
                
                foreach ($indices as $index) {

                    Tag::firstOrCreate([
                        'name' => $tags[$index]
                    ])->cards()->attach($card->id);
                }
            }
        }
    }
}
