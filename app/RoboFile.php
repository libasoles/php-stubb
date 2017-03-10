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
    public function install() {
        
        $this->taskExec('docker exec -it php-stubb php /src/artisan migrate')->background()->run();
        
        $this->say("Database tables created");
        
        $this->taskExec('docker exec -it php-stubb php artisan db:seed')->background()->run();
        
        $this->say("Database seeded");
    }
}