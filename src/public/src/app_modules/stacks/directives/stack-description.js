(function () {
    angular.module('app.stacks').directive('stackDescription', ['config',
        function (config) {
            return {
                restrict: 'EA',
                replace: true,
                templateUrl: config.SRC_FOLDER + 'stacks/templates/stack-description.html',
                scope: true,
                controller: ['$scope', '$rootScope', '$cookies', '$log', '$element', 'growl', 'ModalService', 'stacksFactory',
                    function ($scope, $rootScope, $cookies, $log, $element, growl, ModalService, stacksFactory) {
                       
                       $scope.events = {};
                       
                       /**
                        * Show more behavior
                        */
                       $scope.showMore = {
                           expanded: true,
                           expandable: true,
                           hideArrow: true
                       }
                    
                       /**
                        * Filter by stack
                        */
                       $scope.$on('stack-selected', function(evt, stack) {

                           // provide info to view
                           $scope.context.stack = stack;

                           // refresh animation (when element already visible)
                           $element.find('.stack-description').addClass('flipInX');
                       });    

                       /**
                        * Clear stack description animation class when finished
                        */
                       $element.on('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', '.stack-description', function() {
                           $(this).removeClass("flipInX");
                       });

                       if($cookies.get("stack")) {

                           // provide info to view
                           $scope.context.stack = $cookies.getObject("stack");                           
                       }
                       
                       /**
                        * Uncheck current stack filter
                        */
                       $scope.events.removeStackFilter = function(stack) {
                           $rootScope.$broadcast('stack-unselected', stack);
                       }
                       
                       $scope.$on('stack-unselected', function() {
                           $scope.context.stack = null;
                       });
                       
                       /**
                        * Edit stack
                        */
                        $scope.events.editStack = function (item) {
                            
                            ModalService.showModal({
                                templateUrl: config.SRC_FOLDER + "stacks/templates/modals/edit-stack.html",
                                controller: "EditStackController",
                                inputs: {
                                    data: {
                                        stack: item
                                    }
                                }
                            }).then(function (modal) {
                                modal.element.modal();
                                modal.close.then(function (result) {
                                    if (result) {

                                        // prepare data to be send to server 
                                        let stack = {
                                            id: item.id,
                                            name: modal.scope.form.name,
                                            description: modal.scope.form.content
                                        }

                                        // ajax call
                                        stacksFactory.update(stack).$promise.then(function () {
                                         
                                            // emmit event
                                            $rootScope.$broadcast('stack-updated', item, stack);
                                        }, function (err) {
                                            $log.error(err);
                                            growl.error("Ups, failed saving. Sorry.");
                                        });
                                    }
                                });
                            }, function(err) {
                                $log.error(err);
                                growl.error("Ups, failed opening form.");
                            });
                        }
                        
                        // update in view
                        $scope.$on('stack-updated', function(evt, original, stack) {
                           $scope.context.stack = stack;
                        });
                        
                        /**
                         * Delete Stack
                         * 
                         * @param Stack item
                         * @returns void
                         */
                        $scope.events.deleteStack = function (item) {

                            // Just provide a template url, a controller and call 'showModal'.
                            ModalService.showModal({
                                templateUrl: config.SRC_FOLDER + "common/templates/modals/confirm.html",
                                controller: "YesNoController",
                                inputs: {
                                    data: {
                                        'title': 'Delete stack?',
                                        'content': "Your cards will not be erased, but remain orphans."
                                    }
                                }
                            }).then(function (modal) {
                                modal.element.modal();
                                modal.close.then(function (result) {

                                    if (result) {    
                                        // ajax call
                                        stacksFactory.delete({id: item.id}).$promise.then(function () {
                                            
                                            $scope.context.stack = null;
                                            
                                            // emmit event
                                            $rootScope.$broadcast('stack-deleted', item);                                            
                                        }, function (err) {
                                            $log.error(err);
                                            growl.error("Ups, failed deleting it.");
                                        });
                                    }
                                });
                            }, function(err) {
                                $log.error(err);
                                growl.error("Ups, failed opening dialog.");
                            });
                        };
                }]
            };
        }
    ]);
})();