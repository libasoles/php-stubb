(function () {

    angular.module('app.cards').directive('newCardForm',
        ['config', function (config) {
            return {
                restrict: 'E',
                scope: {
                    card: "="
                },
                replace: true,
                templateUrl: config.SRC_FOLDER + 'cards/templates/new-form.html',
                controller: ['$scope', '$rootScope', '$log', 'growl', 'cardsFactory', function ($scope, $rootScope, $log, growl, cardsFactory) {

                    $scope.events = {};

                    /**
                     * Submit form
                     * @returns void
                     */
                    $scope.events.createCard = function () {

                        if ($scope.content) {

                            let data = {
                                name: $scope.name,
                                content: $scope.content
                            };

                            cardsFactory.save(data).$promise.then(function (response) {
                                data.class = 'highlighted';
                                data.id = response.id;
                                $rootScope.$broadcast('new-card', data);
                            }, function (response) {
                                $log.error(response);
                                growl.error("Ups, failed saving. Sorry.");
                            })

                            $scope.content = '';
                        }
                    };
                }
            ]}
        }]);
})();