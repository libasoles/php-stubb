<?php

//require "./vendor/guzzlehttp/guzzle/src/Client.php";

require __DIR__.'/bootstrap/autoload.php';
$http = new GuzzleHttp\Client;

$response = $http->post('http://localhost:8001/oauth/token', [
    'form_params' => [
        'grant_type' => 'password',
        'client_id' => '2',
        'client_secret' => 'tT3WGoS19kWRtLE1zENgJFFlb98WyOOd3DcvH5jy',
        'username' => 'gperez78@gmail.com',
        'password' => 'botanico',
        'scope' => '',
    ],
]);

var_export( json_decode((string) $response->getBody(), true) );
