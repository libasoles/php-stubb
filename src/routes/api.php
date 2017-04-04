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

    Route::get('cards', 'CardController@index');
    Route::get('cards/{id}', "CardController@get");
    //Route::get('cards/{id}/stacks', "CardController@show");
    //Route::get('cards/{id}/tags', "CardController@show");
    Route::post('cards', "CardController@store");
    Route::put('cards/{id}', "CardController@update");
    Route::delete('cards/{id}', "CardController@destroy");

    Route::get('stacks', 'StackController@index');
    Route::get('stacks/{id}', "StackController@show");
    //Route::get('stacks/{id}/cards', "StackController@show");
    //Route::get('stacks/{id}/cards/{card_id}', "StackController@show");
    Route::post('stacks/{id?}', "StackController@store");
    Route::put('stacks/{id}', "StackController@update");
    Route::delete('stacks/{id}', "StackController@destroy");

    Route::get('tags', 'TagController@index');
    Route::get('tags/{id}', 'TagController@show');
    //Route::get('tags/{id}/cards', 'TagController@show');
    //Route::post('tags', 'TagController@store');
    //Route::put('tags/{id}', 'TagController@update');
    Route::delete('tags/{id}', 'TagController@destroy');
});


