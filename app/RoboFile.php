<?php

/**
 * This is project's console commands configuration for Robo task runner.
 *
 * @see http://robo.li/
 */
class RoboFile extends \Robo\Tasks
{

    /**
     * Install app
     */
    public function install()
    {

        $this->taskExec('docker exec -it php-stubb php /src/artisan migrate')->run();

        $this->say("Database tables created");

        $this->taskExec('docker exec -it php-stubb php /src/artisan db:seed --class CardsSeeder')->background()->run();

        $this->say("Database seeded");
    }

    /**
     * Launch unit testing
     */
    public function test()
    {   
        $this->taskExec('docker-compose exec -T php bash -c "cd /src && vendor/bin/phpunit"')->run();
    }

    /**
     * Run app
     */
    public function run()
    {
        $this->taskExec('docker-compose up -f ../docker-compose.yml')->run();
    }
}
