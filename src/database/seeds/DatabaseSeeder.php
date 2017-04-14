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
        
        // create one user
        $user_id = DB::table('users')->insertGetId([
            'name'=> 'SysAdmin',
            'email'=> 'admin@stubb.net',
            'password'=> Hash::make('sysadmin'),
            'api_token'=> $faker->password(60, 60),
        ]);
        
        // create more users
        foreach (range(1, 5) as $index) {
            $user_id = DB::table('users')->insertGetId([
                'name'=> $faker->name(),
                'email'=> $faker->email(),
                'password'=> Hash::make( $faker->password() ),
                'api_token'=> $faker->password(60, 60),
            ]);
        }
        
        // assign stacks to users
        foreach (range(1, 4) as $index) {

            // create stack
            $stack = App\Stack::create([
                'name' => $faker->sentence($nbWords = 6, $variableNbWords = true),
                'description' => $faker->text($maxNbChars = 200),
                'enabled' => 1,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now()
            ]);
            
            foreach (range(1, 5) as $index) {
                $stack->users()->attach(random_int(1, 5));
            }

            // assign cards
            foreach (range(1, 2) as $index) {

                $cardContent = $faker->text($maxNbChars = 200);

                $card = Card::create([
                        'name' => $faker->sentence($nbWords = 6, $variableNbWords = true),
                        'content' => $cardContent,
                        'enabled' => 1,
                        'created_at' => Carbon::now(),
                        'updated_at' => Carbon::now()
                ]);
                // associate stack and card
                $card->stack()->attach($stack->id);

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
