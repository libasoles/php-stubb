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
        Route::get('cards', 'CardController@index');
        Route::get('cards/{id}', "CardController@get");
        Route::get('cards/{id}/stacks', "CardController@get");
        Route::get('cards/{id}/tags', "CardController@get");
        Route::post('cards', "CardController@store");
        Route::put('cards/{id}', "CardController@update");
        Route::delete('cards/{id}', "CardController@destroy");
        Route::get('cards/{id}/stacks', "CardController@get");

        Route::get('users/{user_id}/stacks', 'StackUserController@index');
        Route::get('users/{user_id}/stacks/{id}', "StackController@get");
        Route::post('users/{user_id}/stacks', "StackController@store");
        Route::put('users/{user_id}/stacks/{id}', "StackController@update");
        Route::delete('users/{user_id}/stacks/{id}', "StackController@destroy");
        
        Route::get('stacks/{id}/cards', "StackController@get");
        Route::get('stacks/{stack_id}/cards/{card_id}', "StackController@get");

        Route::get('tags', 'TagController@index');
        Route::get('tags/{id}', 'TagController@get');
        Route::get('tags/{id}/cards', 'TagController@get');
        Route::post('tags', 'TagController@store');
        Route::put('tags/{id}', 'TagController@update');
        Route::get('tags/{id}/cards', 'TagController@get'); // TBD
        Route::delete('tags/{id}', 'TagController@destroy');

        Route::get('cards/{card_id}/tags', "CardTagController@index");
        Route::post('cards/{card_id}/tags', 'CardTagController@store');
        Route::get('cards/{card_id}/stacks', "CardStackController@index");
        Route::post('cards/{card_id}/stacks', "CardStackController@store");
        Route::put('cards/{card_id}/stacks/{stack_id}', "CardStackController@update");
    });

    // redirect to current api version
    Route::get('{any?}', function ($any = null) {
        $current_api_version = Config::get('app.api_version');
        return redirect()->to("/api/{$current_api_version}/{$any}");
    })->where('any', '.*');
});


