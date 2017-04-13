'use strict';

angular.module('app', ['ngRoute', 'app.config', 'app.home']);
  
angular.module('app').config(['$httpProvider', function ($httpProvider) {
        
    $httpProvider.defaults.headers.common = { 
        'Authorization': 'Bearer $AaHZSu"`uHGC|Iwd2rCuD98LQQ[&,;_s8a^"UJ6.&lu_](3\'(t4Op8k[_4y',
        'Accept': 'application/json;odata=verbose',
        'X-Login-Ajax-call': 'true',
        'X-Requested-With': "XMLHttpRequest"
      };
}])
 
angular.module('app').run([function () {
 
 
}]);