<?php
namespace App\Providers;

use App\Card;
use App\Http\Controllers\Api\v1\CardController;
use App\Http\Controllers\Api\v1\StackController;
use App\Stack;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{

    /**
     * Indicates if loading of the provider is deferred.
     *
     * @var bool
     */
    protected $defer = true;

    /**
     * Register the application services.
     *
     * @return void
     */
    public function register()
    {
       
        $this->app->when(CardController::class)
            ->needs(Model::class)
            ->give(function () {
                return new Card;
            });

        $this->app->when(StackController::class)
            ->needs(Model::class)
            ->give(function () {
                return new Stack;
            });
    }
    
    /**
     * Get the services provided by the provider.
     *
     * @return array
     */
    public function provides()
    {
        return [Model::class];
    }
}
