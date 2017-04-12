<!DOCTYPE html>
<html lang="{{ config('app.locale') }}" ng-app>
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>Stubb</title>

        <!-- Fonts -->
        <link href="https://fonts.googleapis.com/css?family=Roboto:300" rel="stylesheet" type="text/css">
        <link href='//fonts.googleapis.com/css?family=Lato:300' rel='stylesheet' type='text/css'>
        @yield('fonts')

        <!-- Css -->
        @yield('css')

        <!-- Js -->
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
        @yield('js')
        
    </head>
    <body>
        
        @yield('content')
        
    </body>
</html>
