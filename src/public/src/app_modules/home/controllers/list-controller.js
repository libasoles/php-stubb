(function(){
    
    angular.module('app.home').controller('ListController', ['$scope', 'config', 'cardsFactory', 'ModalService', 'HomeContextService', ListController]);
    
    function ListController($scope, config, cardsFactory, ModalService, HomeContextService){
                
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
                        
            // Just provide a template url, a controller and call 'showModal'.
            ModalService.showModal({
                templateUrl: config.SRC_FOLDER + "home/modals/confirm.html",
                controller: "YesNoController",
                inputs: {
                    data: {
                        'title': 'Delete card?',
                        'content': "You'll not be able to recover it" 
                    }
                }
            }).then(function (modal) {
                modal.element.modal();
                modal.close.then(function (result) {
                       
                    if(result) {
                        cardsFactory.delete(item.id).then(function(){
                            let index = $scope.context.cards.indexOf(item);
                            $scope.context.cards.splice(index, 1);
                        }, function(err) {
                            console.log(err);
                        });
                    } 
                });
            });
        };
        
        $scope.viewAsMarkdownModal = function (card) {

            // Just provide a template url, a controller and call 'showModal'.
            ModalService.showModal({
                templateUrl: config.SRC_FOLDER + "home/modals/markdown.html",
                controller: "MarkdownController",
                inputs: {
                    data: {
                        'card': card
                    }
                }
            }).then(function (modal) {
                modal.element.modal();
                modal.close.then(function (result) {
                    $scope.message = result ? "You said Yes" : "You said No";
                });
            });
        };
    }
})();