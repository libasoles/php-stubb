(function() {
    
    angular.module('app.stacks').controller('NewStackController', ['$scope', 'close', NewStackController]);
    
    function NewStackController($scope, close) {
       
        $scope.form = {
            name: '',
            description: ''
        };
      
        $scope.close = function (result) {
           
            close(result, 200); // close, but give 200ms for bootstrap to animate
        };
    };
})();