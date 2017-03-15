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
        $this->taskExec('docker-compose exec --user 1000 -T php bash -c "cd /src && vendor/bin/phpunit"')->run();
    }

    /**
     * Run app
     */
    public function run()
    {
        $this->taskExec('cd .. && docker-compose up')->run();
    }

    /**
     * Arguments must be wrapped altogether in quotes. 
     * Eg: "make:test MyUnitest"
     * 
     * @param string $args
     */
    public function artisan($args)
    {
        // run docker as non-root user
        $this->taskExec('docker-compose exec --user 1000 -T php bash -c "cd /src && php artisan ' . $args . ' --unit"')->run();
    }

    /**
     * Use at your own risk
     * Drops all db tables
     */
    public function emptyDB()
    {
        $this->taskExec('docker exec --user 1000 -ti php-stubb bash -c "cd /src && php artisan droptables"')->run();
    }
}
