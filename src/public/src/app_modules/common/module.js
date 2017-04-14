'use strict';

angular.module('app', ['ngRoute', 'app.config', 'app.home']);
  
angular.module('app').config(['$httpProvider', function ($httpProvider) {
        
    $httpProvider.defaults.headers.common = { 
        'Authorization': 'Bearer '+Laravel.laravel_token,
        'access_token': Laravel.laravel_token,
        'Content-Type': 'application/json',
        'Accept': 'application/json;odata=verbose',
        'X-Login-Ajax-call': 'true',
        'X-Requested-With': "XMLHttpRequest",
        'X-CSRF-TOKEN': Laravel.csrfToken,
      };
}])
 
angular.module('app').run([function () {
 
 
}]);