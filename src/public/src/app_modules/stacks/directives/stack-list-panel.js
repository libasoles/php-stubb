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
                
                    $scope.stacks = [{
                        id: 1,
                        name: 'Universal',
                        participants: {}
                    }, {
                        id: 2,
                        name: 'Second stack',
                        participants: {
                            count: 1,
                            list: {
                                'John Doe': {
                                    img: 'profile-picture-60x60.png'
                                }
                            }
                        }
                    }, {
                        id: 3,
                        name: 'And so on',
                        participants: {
                            count: 15,
                            list: {
                                'John Doe': {
                                    img: 'profile-picture-60x60.png'
                                },
                                'Charles Davidson': {
                                    img: 'profile-picture-60x60.png'
                                },
                                'Alex Steward': {
                                    img: 'profile-picture-60x60.png'
                                }
                            }
                        }
                    }];
                }]
            };
    }]);
})();