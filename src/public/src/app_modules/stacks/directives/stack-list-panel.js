(function(){
    
    angular.module('app.stacks').directive('stackListPanel', ['config', '$cookies', function(config, $cookies){
            
            return {
                restrict: 'E',
                scope: true,
                templateUrl: config.SRC_FOLDER + 'stacks/templates/stack-list-panel.html',
                replace: true,       
                link: function(scope, element, attrs) {
                    scope.img_folder = config.PROFILE_IMG_FOLDER;
                    
                    scope.current_stack = angular.fromJson($cookies.get("stack"));                
                },
                controller: ['$scope', '$rootScope', '$log', '$cookies', 'config', 'stacksFactory', 'ModalService', 
                    function($scope, $rootScope, $log, $cookies, config, stacksFactory, ModalService) {
                     
                        $scope.events = {};
                     
                        /**
                         * Get stack list
                         */
                        $scope.stacks = stacksFactory.query();

                        /**
                         * Create new stack
                         */
                        $scope.events.addNew = function() {
                            ModalService.showModal({
                                templateUrl: config.SRC_FOLDER + "stacks/templates/modals/new-stack.html",
                                controller: "NewStackController"
                            }).then(function(modal) {
                                modal.element.modal();
                                modal.close.then(function (result) {

                                    if (result) {    

                                        // prepare data to submit to server 
                                        let stack = {
                                            name: modal.scope.form.name,
                                            description: modal.scope.form.description
                                        }

                                        stacksFactory.save(stack).$promise.then(function(response) {
                                            
                                            // emmit event
                                            stack.id = response.id;
                                            $rootScope.$broadcast('new-stack', stack);
                                            
                                            // add to stack
                                            $scope.stacks.unshift(stack);
                                        }, function(err) {
                                            $log.error(err);
                                        });
                                    }
                                });
                            }, function(err) {
                                $log.error(err);
                            });
                        }
                        
                        /**
                         * Filter by stack
                         */
                        $scope.events.filter = function($event, stack) {
                           
                            $event.preventDefault();
                            $event.stopPropagation();
                            
                            let link = $($event.currentTarget);
                       
                            link.closest('ul').find('.list-group-item').removeClass('selected');
                            link.parent().addClass('selected');
                                                        
                            // persist filter
                            $cookies.putObject('stack', {
                                id: stack.id,
                                name: stack.name,
                                description: stack.description
                            });
                            
                            // tell the world
                            $rootScope.$broadcast('stack-selected', stack);
                        }
                }]
            };
    }]);
})();