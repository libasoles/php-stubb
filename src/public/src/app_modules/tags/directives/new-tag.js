(function () {
    angular.module('app.tags').directive('newTag', ['config',
        function (config) {
            
            return {
                restrict: 'EA',
                templateUrl: config.SRC_FOLDER + '/tags/templates/new-tag.html',
                scope: {
                    data: "="
                },
                controller: ['$scope', '$rootScope', '$element', function ($scope, $rootScope, $element) {
                    
                    $scope.translations = {};
                    $scope.translations.placeholder = "Name it...";
                    
                    /**
                     * Initial widget state
                     */
                    $scope.display = false;
                    
                    /**
                     * Hide widget
                     */
                    $scope.show = function() {
                        $scope.display = true;
                        $scope.visibility = 'visible'; // css class
                        setTimeout(function(){
                            $element.find('input').focus();
                        }, 0.5); // time will vary according to css rule
                    }
                    
                    /**
                     * Hide widget
                     */
                    $scope.hide = function() {
                        $scope.display = false;
                        $scope.visibility = ''; // css class
                        $scope.name = ''; // reset field
                    }
                    
                    /**
                     * creates a tag and attach it to current card
                     * 
                     * @returns void
                     * @broadcasts event
                     */
                    $scope.addNew = function () {
                        
                        if($scope.name) {
                            
                        }
                    };
                }]
            };
        }
    ]);
})();