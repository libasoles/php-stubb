(function () {

    angular.module('app.home').controller('TagController', ['$scope', 'cardsFactory', 'HomeContextService', TagController]);

    function TagController($scope, cardsFactory, HomeContextService) {

        $scope.translations.title = "In this page";

        /**
         * Way to keep siblings connected and sharing scope
         */
        $scope.context = HomeContextService.context;

        /**
         * Get tag list
         */
        cardsFactory
                .getAll()
                .then(function (response) {

                    $scope.context.cards = angular.fromJson(response.data);

                    // exclude card with no tags
                    let cards = $scope.context.cards.filter(function (card) {
                        return card.tags.length > 0;
                    });

                    // extract tags from card
                    let tags = cards.map(function (card) {
                        return JSON.parse(angular.toJson(card.tags));
                    });

                    // merge tags in flatten array
                    let merged = [].concat.apply([], tags);
                    
                    // serve array to view
                    $scope.context.tags = merged;

                })
                .catch(function (err) {
                    console.log(err); // TODO: Tratar el error
                });

    }
})();