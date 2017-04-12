(function(){
    
    angular.module('app.home').controller('ListController', ['$scope', 'cardsFactory', 'HomeContextService', ListController]);
    
    function ListController($scope, cardsFactory, HomeContextService){
                
        $scope.translations.no_results = "No results";        
        
        /**
         * Way to keep siblings connected and sharing scope
         */
        $scope.context = HomeContextService.context;
        
        /**
         * Get cards list
         */
        cardsFactory
            .getAll()
            .then(function (response) {

                $scope.context.cards = angular.fromJson(response.data);

                $scope.orderCardsBy = 'updated_at';

                $scope.direction = 'reverse';
            })
            .catch(function (err) {
                console.log(err); // TODO: Tratar el error
            });  
            
        $scope.deleteCard = function(item) {
            
            cardsFactory.delete(item.id).then(function(){
                let index = $scope.context.cards.indexOf(item);
                $scope.context.cards.splice(index, 1);
            }, function(err) {
                console.log(err);
            });
        }
    }
})();