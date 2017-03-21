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

    Route::get('cards', 'CardController@getAll');
    Route::get('card/{id}', "CardController@get");
    Route::post('card/{id?}', "CardController@save");
    Route::delete('card/{id}', "CardController@delete");

    Route::get('stacks', 'StackController@getAll');
    Route::get('stack/{id}', "StackController@get");
    Route::post('stack/{id?}', "StackController@save");
    Route::delete('stack/{id}', "StackController@delete");

    Route::get('tags', 'TagController@getAll');
    Route::get('tag/{id}', 'TagController@get');
    Route::post('tag/{id?}', 'TagController@save');
    Route::delete('tag/{id}', 'TagController@delete');
});


