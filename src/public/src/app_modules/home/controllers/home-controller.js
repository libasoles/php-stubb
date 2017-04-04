(function () {

    angular.module('app.home').controller('HomeController', ['$scope', '$http', 'cardsFactory', HomeController]);

    function HomeController($scope, $http, cardsFactory) {

        $scope.cards = [];

        $scope.translations = {
            "no_results": "Sin Resultados"
        };

        cardsFactory
            .getAll()
            .then(function (response) {
                $scope.cards = angular.fromJson(response.data.data);  
        
                $scope.orderCardsBy = 'updated_at';
            })
            .catch(function(err) {                
                console.log(err); // TODO: Tratar el error
            });

        $scope.createCard = function() {
         
            if ($scope.copy) {
          
                cardsFactory.save().then(function(response){
                    $scope.cards.push(response.data);
                })                 
                
                $scope.copy = '';
            }
        };    
    }
})();



