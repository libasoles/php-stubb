<?php

use Illuminate\Http\Request;

/*
  |--------------------------------------------------------------------------
  | API Routes
  |--------------------------------------------------------------------------
  |
  | Here is where you can register API routes for your application. These
  | routes are loaded by the RouteServiceProvider within a group which
  | is assigned the "api" middleware group. Enjoy building your API!
  |
 */

Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});

/**
 * APIs
 */
Route::group([
    'namespace' => 'Api',
    'middleware' => ['auth:api'],
    ], function () {

    Route::get('/', function() {

        return [
            'greetings' => 'Welcome to Stubb API',
            'api-version' => Config::get('app.api_version')
        ];
    });

    /**
     * API v1
     */
    Route::group(['prefix' => 'v1', 'namespace' => 'v1'], function($app) {
        
        // No action
        Route::get('/', [function() {
            return [
                'api_version' => 1
            ];
        }]);
        
        Route::pattern('id', '[0-9]+');
        
        // Basic CRUD
        Route::resource('cards', 'CardController', ['except' => ['create', 'edit']]);
        Route::resource('stacks', 'StackController', ['except' => ['index', 'create', 'edit']]);
        Route::resource('tags', 'TagController', ['only' => ['index', 'show', 'destroy']]);
                       
        /**
         * User stacks
         * @overrides resource method
         */
        Route::get('stacks', 'StackUserController@index');
        
        /**
         * ALl cards w/tags
         */
        Route::get('cards/tags/all', "CardTagController@index");
        
        /**
         * Single card w/tags
         */
        Route::get('cards/{card_id}/tags', "CardTagController@showTags");
        
        /**
         * Single tag cards
         */
        Route::get('tags/{tag_id}/cards', 'CardTagController@showCards');
        
        /**
         * Create tag and assign to card
         */
        Route::post('cards/{card_id}/tags', 'CardTagController@store');

        /**
         * Stack cards
         */
        Route::get('stacks/{stack_id}/cards', "CardStackController@showCards");
        
        /**
         * Cards stacks
         */
        Route::get('cards/{card_id}/stacks', "CardStackController@showStacks");
        
        /**
         * Assign card to stack
         */
        Route::put('cards/{card_id}/stacks/{stack_id}', "CardStackController@update");
        Route::put('stacks/{stack_id}/cards/{card_id}', "CardStackController@update");
        
        /**
         *  Catch unknown endpoints
         */
        Route::any('{any:.*}', function ($any = null) {
            throw new Symfony\Component\HttpKernel\Exception\HttpException(400, "Endpoint not found: {$any}");
        });    
    });
    
    /**
    * Fallback to current API version
    */
    Route::get('{any:.*}', function ($any = null) {
        $current_api_version = config('app.current_api_version', 1);
        return response('', 302)
                ->header('Location', "/api/v{$current_api_version}/{$any}");
    });
});


