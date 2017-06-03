(function () {
    angular.module('app.cards').directive('orderBy', ['config',
        function (config) {
            
            return {
                restrict: 'EA',
                scope: true,
                templateUrl: config.SRC_FOLDER + '/cards/templates/order-by.html',
                controller: ['$scope', '$rootScope', function ($scope, $rootScope) {
                       
                    $scope.events = {};
                       
                    let order = JSON.parse(localStorage.getItem('order'));
                       
                    // initial position
                    $scope.order = order && !angular.isUndefined(order.order) ? order.order : 'updated_at';
                    $scope.direction = order && !angular.isUndefined(order.direction) ? order.direction : 'desc';

                    $scope.events.update = function() {

                        let data = {
                            order: $scope.order,
                            direction: $scope.direction
                        }
                        
                        // persist
                        localStorage.setItem('order', JSON.stringify(data));
                        
                        $rootScope.$broadcast('order-changed', data); // emmit
                    }                        
                }]
            };
        }
    ]);
})();