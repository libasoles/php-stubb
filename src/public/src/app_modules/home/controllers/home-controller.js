(function () {

    angular.module('app.home').controller('HomeController', ['$scope', 'cardsFactory', HomeController]);

    function HomeController($scope, cardsFactory) {

        $scope.translations = {};            
    }
})();


