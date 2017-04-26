'use strict';

angular.module('app', ['ngRoute', 'app.config', 'app.home', 'angularModalService']);
  
angular.module('app').config(['$httpProvider', '$logProvider', 'config', function ($httpProvider, $logProvider, config) {
        
    $httpProvider.defaults.headers.common = { 
        'Content-Type': 'application/json',
        'Accept': 'application/json;odata=verbose',
        'X-Login-Ajax-call': 'true',
        'X-Requested-With': "XMLHttpRequest",
        'X-CSRF-TOKEN': Laravel.csrfToken,
      };
    
    $logProvider.debugEnabled(config.debug);
}]);
 
angular.module('app').run([function () {
 
}]);
