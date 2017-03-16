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

        $this->taskExec('docker exec php-stubb bash -c "cd /src && php artisan migrate"')->run();

        $this->say("Database tables created");

        $this->seed();
    }

    public function seed()
    {

        $this->taskExec('docker exec composer-stubb bash -c "composer dump-autoload"');

        // run each seed
        foreach (new DirectoryIterator('database/seeds') as $fileInfo) {
            if ($fileInfo->isFile()) {
                $file = $fileInfo->getBasename('.php');
                $this->say("Seeding $file");
                $this->taskExec('docker exec php-stubb bash -c "cd /src && php artisan db:seed --class ' . $file . '"')->run();
            }
        }

        $this->say("Database seeded");
    }

    /**
     * Execute a composer command
     * You have to pass the command and arguments within quotes, like:
     * robo composer "require package/package"    
     *   
     * @param string $commands
     */
    public function composer($commands)
    {

        $this->taskExec('docker run --rm -v $(pwd):/app composer/composer ' . $commands)->run();
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
     * @param string $commands Command within quotes
     * @param string $args Parameters after --
     */
    public function artisan($commands, $args = '')
    {
        // run docker as non-root user
        $this->taskExec('docker-compose exec --user 1000 -T php bash -c "cd /src && php artisan ' . $commands . '"')->args($args)->run();
    }

    /**
     * Use at your own risk
     * Drops all db tables
     */
    public function emptyDB()
    {
        $this->taskExec('docker exec -i php-stubb bash -c "cd /src && php artisan droptables"')->run();
    }

    /**
     * Use at your own risk
     * Drops all db tables, runs migrations and fill in with Fake data
     */
    public function resetDB()
    {
        $this->emptyDB();
        $this->install();
    }
}
