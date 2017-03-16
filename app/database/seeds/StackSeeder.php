<?php

use Carbon\Carbon;
use Faker\Factory as Faker;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Card;

class StackSeeder extends Seeder
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
                
                Card::create([
                    'name' => $faker->sentence($nbWords = 6, $variableNbWords = true),
                    'content' => $faker->text($maxNbChars = 200),
                    'enabled' => 1,
                    'created_at' => Carbon::now(),
                    'updated_at' => Carbon::now()
                ])->stack()->attach($stack_id);
            }
        }
    }
}
