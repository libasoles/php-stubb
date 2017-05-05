(function() {

    angular.module('app.stacks').controller('EditStackController', ['$scope', 'data', 'close', EditStackController]);
    
    function EditStackController($scope, data, close) {
      
        $scope.form = {};
        $scope.form.name = data.stack.name;
        $scope.form.content = data.stack.description;

        $scope.close = function (result) {
           
            close(result, 200); // close, but give 200ms for bootstrap to animate
        };
    };
})();