(function() {

    angular.module('app.home').controller('EditController', ['$scope', 'data', 'close', EditController]);
    
    function EditController($scope, data, close) {

        $scope.title = data.card.title;
        $scope.content = data.card.content;

        $scope.close = function (result) {
            
            close(result, 200); // close, but give 200ms for bootstrap to animate
        };
    };
})();