(function() {

    angular.module('app.stacks').controller('EditStackController', ['$scope', '$element', 'data', 'close', EditStackController]);
    
    function EditStackController($scope, $element, data, close) {
      
        $scope.form = {};
        $scope.form.name = data.stack.name;
        $scope.form.content = data.stack.description;

        /**
         * Key event (Enter)
         */
        $element.find('input').bind("keydown keypress", function (event) {

            if(event.which === 13) {
                $element.modal('hide');
                $scope.close(true);
                return false;
            }
        });

        $scope.close = function (result) {
           
            close(result, 200); // close, but give 200ms for bootstrap to animate
        };
    };
})();