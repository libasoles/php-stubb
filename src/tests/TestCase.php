<?php

namespace Tests;

use DirectoryIterator;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Config;

abstract class TestCase extends BaseTestCase
{
    use CreatesApplication;
    
    protected function setUp()
    {
        parent::setUp();
        
        Config::set('database.connections.sqlite.database', ':memory:');
        Config::set('database.default', 'sqlite');
        
        Artisan::call('migrate');
        
        Artisan::call('db:seed');
    }

    protected function tearDown()
    {
        Artisan::call('migrate:reset');
        parent::tearDown();
    }
}
