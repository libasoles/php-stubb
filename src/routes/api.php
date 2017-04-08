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

Route::group([
    'namespace' => 'Api'
    ], function () {

    Route::get('/', function() {
        
        return [
            'greetings'=> 'Welcome to Stubb API',
            'api-version'=> Config::get('app.api_version')
        ];
    });
    
    Route::group(['prefix' => 'v1', 'namespace' => 'v1'], function($app)
    {
        Route::get('cards', 'CardController@index');
        Route::get('cards/{id}', "CardController@get");
        Route::post('cards', "CardController@store");
        Route::put('cards/{id}', "CardController@update");
        Route::delete('cards/{id}', "CardController@destroy");

        Route::get('stacks', 'StackController@index');
        Route::get('stacks/{id}', "StackController@get");
        Route::post('stacks/{id?}', "StackController@store");
        Route::put('stacks/{id}', "StackController@update");
        Route::delete('stacks/{id}', "StackController@destroy");

        Route::get('tags', 'TagController@index');
        Route::get('tags/{id}', 'TagController@get');
        Route::delete('tags/{id}', 'TagController@destroy');
    });
        
    // redirect to current api version
    Route::get('{any?}', function ($any = null) {   
        $current_api_version = Config::get('app.api_version');
        return redirect()->to("/api/{$current_api_version}/{$any}");
    })->where('any', '.*');
    
});


