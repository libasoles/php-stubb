angular.module('app').config(['$routeProvider', function($routeProvider) {
    
  $routeProvider
    .when('/', {
        templateUrl: 'js/src/home/home-template.html',
        controller: 'HomeController',
        controllerAs: 'home'
    })
    
    .otherwise({redirectTo: '/'}); 
}]);