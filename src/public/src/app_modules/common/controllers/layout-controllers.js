(function () {

    angular.module('app').controller('LayoutController', ['$scope', LayoutController]);

    function LayoutController($scope) {

        $scope.translations = {
            subtitle: 'Simply hash your notes and navigate them'
        };            
    }
})();


