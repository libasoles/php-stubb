<?php

use Illuminate\Database\Seeder;

class CardsSeeder extends Seeder {

    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run() {
        Project::create([
            'id' => 1,
            'name' => 'Card 1',
            'content' => 'Lorem Ipsum',
            'enabled' => 1
        ]);
        Project::create([
            'id' => 2,
            'name' => 'Card 2',
            'content' => 'Lorem Ipsum',
            'enabled' => 1
        ]);
    }

}
