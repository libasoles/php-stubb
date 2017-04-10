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

                    $scope.cards = angular.fromJson(response.data);

                    $scope.orderCardsBy = 'updated_at';

                    $scope.direction = 'reverse';
                })
                .catch(function (err) {
                    console.log(err); // TODO: Tratar el error
                });

        $scope.createCard = function () {

            if ($scope.content) {

                let data = {
                    content: $scope.content
                };

                cardsFactory.save(data).then(function (response) {
                    $scope.cards.push(data);
                }, function (response) {
                    console.log(response);
                })

                $scope.content = '';
            }
        };
    }
})();


