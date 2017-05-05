(function(){
    
    angular.module('app.stacks').directive('stackListPanel', ['config', '$cookies', 'queryFactory', function(config, $cookies, queryFactory){
            
            return {
                restrict: 'E',
                scope: true,
                templateUrl: config.SRC_FOLDER + 'stacks/templates/stack-list-panel.html',
                replace: true,       
                link: function(scope, element, attrs) {
                    scope.context.img_folder = config.PROFILE_IMG_FOLDER;
                    
                    scope.context.current_stack = $cookies.getObject("stack"); 
                    
                    /**
                     * On unselect stack
                     */
                    scope.$on('stack-unselected', function () {

                        // remove from UI
                        element.find('.list-group-item').removeClass('selected');

                        // remove from cookie
                        $cookies.remove('stack');

                        // remove from scope
                        scope.context.current_stack = null;

                        // query new results
                        queryFactory.all();
                    });
                    
                    /**
                     * On stack info edited
                     */
                    scope.$on('stack-updated', function(evt, original, stack) {
                        
                        // update cookie
                        $cookies.putObject("stack", stack);  
                          
                        // update view  
                        let item = scope.context.stacks.filter(function(e) {
                            return e.id == stack.id;
                        });
                        
                        let index = scope.context.stacks.indexOf(item[0]);
                      
                        // update item in list
                        angular.extend(scope.context.stacks[index], stack);
                    });
                },
                controller: ['$scope', '$rootScope', '$log', '$cookies', 'config', 'stacksFactory', 'queryFactory', 'ModalService', 
                    function($scope, $rootScope, $log, $cookies, config, stacksFactory, queryFactory, ModalService) {
                     
                        $scope.context = {};
                        $scope.events = {};
               
                        /**
                         * Get stack list
                         */
                        $scope.context.stacks = stacksFactory.query();

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
                            
                            $scope.context.current_stack = $cookies.getObject("stack"); 
                            
                            // query results
                            queryFactory.byStack({stack_id: stack.id});
                            
                            // tell the world
                            $rootScope.$broadcast('stack-selected', stack);
                        }       
                        
                        /**
                         * Unselect stack
                         */
                        $scope.events.unselectStackFilter = function ($event, stack) {

                            $event.preventDefault();
                            $event.stopPropagation();
                            
                            $rootScope.$broadcast('stack-unselected', stack);
                        }                        
                }]
            };
    }]);
})();