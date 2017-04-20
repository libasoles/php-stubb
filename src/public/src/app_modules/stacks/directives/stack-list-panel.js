(function(){
    
    angular.module('app.stacks').directive('stackListPanel', ['config', function(config){
            
            return {
                restrict: 'E',
                templateUrl: config.SRC_FOLDER + 'stacks/templates/stack-list-panel.html',
                transclude: true,
                scope: {
                    
                },
                controller: ['$scope', 'stacksFactory', function($scope, stacksFactory) {
                        
                    $scope.translations = {
                        home: {
                            stackList: {
                                title: "Stacks"
                            }
                        }    
                    }
                               
                    $scope.stacks = stacksFactory.query();
                }]
            };
    }]);
})();