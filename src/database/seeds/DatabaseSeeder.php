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
            'avatar'=> 'profile-picture.png',
        ]);
        
        // create more users
        foreach (range(1, 5) as $index) {
            $user_id = DB::table('users')->insertGetId([
                'name'=> $faker->name(),
                'email'=> $faker->email(),
                'password'=> Hash::make( $faker->password() ),
                'avatar'=> 'profile-picture.png',
            ]);
        }
        
        // assign stacks to users
        foreach (range(1, 4) as $index) {

            // create stack
            $stack = App\Stack::create([
                'name' => $faker->sentence($nbWords = 2, $variableNbWords = true),
                'description' => $faker->text($maxNbChars = 200),
                'enabled' => 1,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now()
            ]);
            
            // assign stacks to random users
            $stack->users()->attach(array_rand( range(1, 5), random_int(1, 4) ));

            // assign cards
            foreach (range(1, 2) as $index) {

                $cardContent = $faker->text($maxNbChars = 200);

                $card = Card::create([
                        'name' => $faker->sentence($nbWords = 5, $variableNbWords = true),
                        'content' => $cardContent,
                        'enabled' => 1,
                        'created_at' => Carbon::now(),
                        'updated_at' => Carbon::now(),
                        'sticky' => rand(0, 100) < 30
                ]);
                // associate stack and card
                $card->stacks()->attach($stack->id);

                // assign random tags (belonging to card content)
                $tags = explode(' ', str_replace('.', '', $cardContent));
                $indices = array_rand($tags, 3); // create three random tags
                
                foreach ($indices as $index) {

                    $tag = Tag::firstOrCreate([
                        'name' => $tags[$index]
                    ]);
                    
                    if(!$tag->cards->contains($card->id)) {      
                        $tag->cards()->attach($card->id);
                    }                    
                }
            }
        }        
    }
}
