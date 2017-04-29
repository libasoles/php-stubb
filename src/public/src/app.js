/**
 * This config is intended to be injected in your src
 */
angular.module("app.config", [])
    .constant("config", {
        "api": "http://localhost:8001/api/v1", 
        "debug": true,
        "SRC_FOLDER": '/src/app_modules/',
        "IMG_FOLDER": '/img/',
        "PROFILE_IMG_FOLDER": '/img/profile/'
    });

angular.module('app.cards', []);


'use strict';

angular.module('app', ['ng', 'ngRoute', 'ngCookies', 'app.config', 'app.home', 'angularModalService', 'pascalprecht.translate']);
  
/**
 * Rest of the global config can be found in app-config module
 */  
angular.module('app').config(['$httpProvider', '$logProvider', '$translateProvider', 'config', 
    function ($httpProvider, $logProvider, $translateProvider, config) {
        
        /**
         * Ajax calls
         */ 
        $httpProvider.defaults.headers.common = { 
            'Content-Type': 'application/json',
            'Accept': 'application/json;odata=verbose',
            'X-Login-Ajax-call': 'true',
            'X-Requested-With': "XMLHttpRequest",
            'X-CSRF-TOKEN': Laravel.csrfToken
          };

        /**
         * Debugging
         */ 
        $logProvider.debugEnabled(config.debug);
        
        /**
         * Translations
         */     
        $translateProvider.useStaticFilesLoader({
            prefix: '/i18n/locale-',
            suffix: '.json'
        });

        $translateProvider.useCookieStorage();
        $translateProvider.preferredLanguage('en_US');
        $translateProvider.fallbackLanguage('en_US');
        $translateProvider.useSanitizeValueStrategy('escape');
}]);
 
angular.module('app').run([function () {
 
}]);

angular.module('app.home', ['ngRoute', 'app.config', 'ngAnimate', 'app.cards', 'app.stacks', 'app.tags', 'hc.marked', 'ngSanitize']);

angular.module('app.stacks', ['ngResource']);

angular.module('app.tags', ['ngResource']);

angular.module('app.cards').config(["$routeProvider", function($routeProvider) {
   
}]);
(function () {
    angular.module('app').config(['$routeProvider', 'config', function($routeProvider, config) {

      $routeProvider
        .when('/', {
            templateUrl: config.SRC_FOLDER + 'home/templates/home-template.html',
            controller: 'HomeController',
            controllerAs: 'home'
        })

        .otherwise({redirectTo: '/'}); 
    }]);
})();
angular.module('app.home').config(["$routeProvider", function($routeProvider) {

}]);

$(document).ready(function () {

    // switch forms
    $('.message a').click(function () {
        
        $('form').animate({height: "toggle", opacity: "toggle"}, "slow");
        
        if(window.location.pathname == '/login') {
            history.pushState({}, "Register", "/register");
        } else {
            history.pushState({}, "Login", "/login");
        }
        
        $('form .help-block').hide();
    });

});
angular.module('app.stacks').config(["$routeProvider", function($routeProvider) {

}]);
(function () {

    angular.module('app.cards').directive('card',
        ['config', function (config) {
            return {
                templateUrl: config.SRC_FOLDER + 'cards/templates/card.html',
                restrict: 'A',
                replace: true,
                scope: {
                    card: "=data"
                },
                controller: ['$scope', '$rootScope', '$log', 'config', 'cardsFactory', 'ModalService',
                    function ($scope, $rootScope, $log, config, cardsFactory, ModalService) {

                        $scope.events = {};

                        /**
                         * Display only X tags
                         */
                        $scope.max_num_tags = 3;

                        /**
                         * Pin Card (make it 'sticky')
                         * 
                         * @param Card item
                         * @returns void
                         */
                        $scope.events.pinCard = function (item) {

                            let card = {
                                id: item.id,
                                sticky: !item.sticky
                            }

                            // ajax call
                            cardsFactory.update(card).$promise.then(function () {

                                // emmit event
                                $rootScope.$broadcast('pin-card', item);
                            }, function (err) {
                                $log.error(err);
                            });
                        };

                        /**
                         * Delete Card
                         * 
                         * @param Card item
                         * @returns void
                         */
                        $scope.events.delete = function (item) {

                            // Just provide a template url, a controller and call 'showModal'.
                            ModalService.showModal({
                                templateUrl: config.SRC_FOLDER + "common/templates/modals/confirm.html",
                                controller: "YesNoController",
                                inputs: {
                                    data: {
                                        'title': 'Delete card?',
                                        'content': "You'll not be able to recover it"
                                    }
                                }
                            }).then(function (modal) {
                                modal.element.modal();
                                modal.close.then(function (result) {

                                    if (result) {    
                                        // ajax call
                                        cardsFactory.delete({id: item.id}).$promise.then(function () {
                                            
                                            // emmit event
                                            $rootScope.$broadcast('delete-card', item);                                            
                                        }, function (err) {
                                            $log.error(err);
                                        });
                                    }
                                });
                            });
                        };

                        /**
                         * Edit Card
                         * 
                         * @param Card item
                         * @returns void
                         */
                        $scope.events.edit = function (item) {

                            ModalService.showModal({
                                templateUrl: config.SRC_FOLDER + "cards/templates/modals/edit-card.html",
                                controller: "EditCardController",
                                inputs: {
                                    data: {
                                        card: item
                                    }
                                }
                            }).then(function (modal) {
                                modal.element.modal();
                                modal.close.then(function (result) {
                                    if (result) {

                                        // prepare data to be send to server 
                                        let card = {
                                            id: item.id,
                                            name: modal.scope.form.name,
                                            content: modal.scope.form.content
                                        }

                                        // ajax call
                                        cardsFactory.update(card).$promise.then(function () {
                                            
                                            // emmit event
                                            $rootScope.$broadcast('update-card', item, card);     
                                        }, function (err) {
                                            $log.error(err);
                                        });
                                    }
                                });
                            });
                        };

                        /**
                         * View content in modalbox with Markdown (rich text mode)
                         * 
                         * @param Card item
                         * @returns void
                         */
                        $scope.events.viewAsMarkdownModal = function (item) {

                            // Just provide a template url, a controller and call 'showModal'.
                            ModalService.showModal({
                                templateUrl: config.SRC_FOLDER + "home/templates/modals/markdown.html",
                                controller: "MarkdownController",
                                inputs: {
                                    data: {
                                        'card': item
                                    }
                                }
                            }).then(function (modal) {
                                modal.element.modal();
                            });
                        };
                }]
        };
    }]);
})();
(function () {

    angular.module('app.cards').directive('newCardForm',
        ['config', function (config) {
            return {
                restrict: 'E',
                scope: {
                    card: "="
                },
                replace: true,
                templateUrl: config.SRC_FOLDER + 'cards/templates/new-form.html',
                controller: ['$scope', '$rootScope', '$log', 'cardsFactory', function ($scope, $rootScope, $log, cardsFactory) {

                    $scope.events = {};

                    /**
                     * Submit form
                     * @returns void
                     */
                    $scope.events.createCard = function () {

                        if ($scope.content) {

                            let data = {
                                name: $scope.name,
                                content: $scope.content
                            };

                            cardsFactory.save(data).$promise.then(function (response) {
                                data.class = 'highlighted';
                                data.id = response.id;
                                $rootScope.$broadcast('new-card', data);
                            }, function (response) {
                                $log.error(response);
                            })

                            $scope.content = '';
                        }
                    };
                }
            ]}
        }]);
})();
(function () {
    angular.module('app.cards').directive('orderBy', ['config',
        function (config) {
            
            return {
                restrict: 'EA',
                scope: true,
                templateUrl: config.SRC_FOLDER + '/cards/templates/order-by.html',
                controller: ['$scope', '$rootScope', '$cookies', function ($scope, $rootScope, $cookies) {
                       
                    $scope.events = {};
                       
                    let order = $cookies.getObject('order');
                       
                    // initial position
                    $scope.order = order && !angular.isUndefined(order.order) ? order.order : 'updated_at';
                    $scope.direction = order && !angular.isUndefined(order.direction) ? order.direction : 'desc';

                    $scope.events.update = function() {

                        let data = {
                            order: $scope.order,
                            direction: $scope.direction
                        }
                        
                        // persist
                        $cookies.putObject('order', data);
                        
                        $rootScope.$broadcast('order-changed', data); // emmit
                    }                        
                }]
            };
        }
    ]);
})();
(function () {
    angular.module('app').directive('paginateCards', ['config',
        function (config) {
            
            return {
                restrict: 'EA',
                templateUrl: config.SRC_FOLDER + '/cards/templates/paginate-cards.html',
                replace: true,
                scope: {
                    data: '='
                },
                controller: ['$scope', '$rootScope', function ($scope, $rootScope) {
                  
                    $scope.context = {};
                    $scope.events = {};
                  
                    /**
                     * Draw widget when data is available
                     */
                    $scope.$on('cards-loaded', function(evt, data) {
                        $scope.context.pages = data; 
                        $scope.context.display = data.data.length && (data.prev_page_url !== null || data.next_page_url !== null);
                    })
                  
                    /**
                     * Broadcast changes
                     * @returns void
                     */
                    $scope.events.navigate = function ($event) {
                        
                        $event.preventDefault();
                        $event.stopPropagation()
                     
                        let target = $event.currentTarget;
                  
                        if(typeof(target.attributes['disabled']) === 'undefined' || !target.attributes['disabled'].value) {
                            
                            $rootScope.$broadcast('cards-page-changed', {
                                page: target.attributes['data-page'].value
                            }); // emmit
                        }
                        
                        return false;
                    };
                }]
            };
        }
    ]);
})();
(function () {

    angular.module('app.cards').factory('cardsFactory', ['$resource', 'config', function($resource, config) {

        return $resource(config.api + '/cards/:id', 
            {
                id: '@id',
                page: '@page'
            }, 
            {
                query: {
                    url: config.api + '/cards/tags/all',
                    isArray: false,
                    transformResponse: function (response) {
                        return angular.fromJson(response);
                    }
                },
                update: {
                  method: 'PUT' 
                }
            }); 
    }]);
})();


(function () {

    angular.module('app').controller('HeaderController', ['$scope', HeaderController]);

    function HeaderController($scope) {
        
    }
})();



(function () {

    angular.module('app').controller('LayoutController', ['$scope', '$sce', LayoutController]);

    function LayoutController($scope, $sce) {

        $scope.tagUserClick = function(e) {
            var tagText = e.target.innerText;
            alert('tagUserClick, tagText: ' + tagText);
        };
        
        $scope.tagTermClick = function(e) {
            var tagText = e.target.innerText;
            alert('tagTermClick, tagText: ' + tagText);
        };
        
        // You could define 'tagUserClick' and 'tagTermClick'
        // on the '$rootScope'. This way you can handle whatever
        // logic you want for hashtags in one place rather than
        // having to define it in each controller.
        
        $scope.trustHtml = function(html) {
            // Sanitize manually if necessary. It's likely this
            // html has already been sanitized server side
            // before it went into your database.
            // Don't hold me liable for XSS... never assume :~)
            return $sce.trustAsHtml(html);
        };
    }
})();



(function () {
    angular.module('app').directive('autofocus', function () {
        return {
            restrict: 'A',
            link: function (scope, element) {
                element[0].focus();
            }
        };
    });
})();

     
(function () {
    // Because of the anme and E type, works automatically for every textarea
    // ref: https://gist.github.com/thomseddon/4703968
    angular.module('app').directive('elasticArea', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attributes) {
                var threshold = 35,
                        minHeight = element[0].offsetHeight,
                        paddingLeft = element.css('paddingLeft'),
                        paddingRight = element.css('paddingRight');

                var $shadow = angular.element('<div></div>').css({
                    position: 'absolute',
                    top: -10000,
                    left: -10000,
                    width: element[0].offsetWidth - parseInt(paddingLeft || 0) - parseInt(paddingRight || 0),
                    fontSize: element.css('fontSize'),
                    fontFamily: element.css('fontFamily'),
                    lineHeight: element.css('lineHeight'),
                    resize: 'none'
                });

                angular.element(document.body).append($shadow);

                var update = function () {
                    var times = function (string, number) {
                        for (var i = 0, r = ''; i < number; i++) {
                            r += string;
                        }
                        return r;
                    }

                    var val = element.val().replace(/</g, '&lt;')
                            .replace(/>/g, '&gt;')
                            .replace(/&/g, '&amp;')
                            .replace(/\n$/, '<br/>&nbsp;')
                            .replace(/\n/g, '<br/>')
                            .replace(/\s{2,}/g, function (space) {
                                return times('&nbsp;', space.length - 1) + ' ';
                            });

                    $shadow.html(val);

                    element.css('height', Math.max($shadow[0].offsetHeight + threshold, minHeight));
                }

                scope.$on('$destroy', function () {
                    $shadow.remove();
                });

                element.bind('keyup keydown keypress change', update);
                update();
            }
        }
    });
})();
(function () { 
    angular.module('app').directive('hashtagify', ['$timeout', '$compile',
        function($timeout, $compile) {
            return {
                restrict: 'A',
                scope: {
                    uClick: '&userClick',
                    tClick: '&termClick'
                },
                link: function(scope, element, attrs) {
                    $timeout(function() {
                        var html = element.html();

                        if (html === '') {
                            return false;
                        }

                        if (attrs.userClick) {
                            html = html.replace(/(|\s)*@(\w+)/g, '$1<a ng-click="uClick({$event: $event})" class="hashtag">@$2</a>'); 
                        }

                        if (attrs.termClick) {
                            html = html.replace(/(^|\s)*#(\w+)/g, '$1<a ng-click="tClick({$event: $event})" class="hashtag">#$2</a>');
                        }

                        element.html(html);

                        $compile(element.contents())(scope);
                    }, 0);
                }
            };
        }
    ]);
})();
(function () {
    angular.module('app').directive('sessionDropdown', ['config',
        function (config) {
            
            return {
                restrict: 'EA',
                templateUrl: config.SRC_FOLDER + '/common/templates/session-dropdown.html',   
                scope: {
                    data: "="
                },
                link: function(scope, elements, attrs) {
                    scope.img_folder = config.PROFILE_IMG_FOLDER;
                },
                controller: ['$scope', function ($scope) {
                        
                    $scope.user = $scope.data;
                }]
            };
        }
    ]);       
})();
(function () {

    angular.module('app').directive('showMore',
        ['config', function (config) {

            return {
                templateUrl: config.SRC_FOLDER + 'common/templates/showMore.html',
                restrict: 'A',
                transclude: true,
                scope: {
                    'showMoreHeight': '@'
                },
                controller: ['$scope', '$element', '$interval', function ($scope, $element, $interval) {

                        $scope.expanded = false;

                        $interval(function () {
                            renderStyles();
                        }, 300);

                        $scope.expandable = false;
                        function renderStyles() {
                            if ($element.height() >= $scope.showMoreHeight && $scope.expanded === false) {
                                $scope.expandable = true;
                            }
                        }

                        $scope.showLessStyle = {
                            'max-height': $scope.showMoreHeight + 'px',
                            'overflow': 'hidden'
                        };

                    }]
            };
        }]);
})();
(function () {
    angular.module('app')
        .filter('reduceBy', function() {
            return function (collection, field) {
                
                return collection.reduce(function(output, current){
                        if(!fieldExists(output, field, current[field]))
                            return output.concat(current);
                        return output;
                    }, []);
                    
                function fieldExists(haystack, fieldName, fieldValue) {
                    return haystack.some(function(el) {
                      return el[fieldName] === fieldValue;
                    }); 
                }
            };            
        });
})();


(function () {
    
     angular.module('app').factory('queryFactory', ['$log', '$cookies', '$rootScope', 'cardsFactory', 'stacksFactory', 'tagsFactory', queryFactory]);
    
    function queryFactory($log, $cookies, $rootScope, cardsFactory, stacksFactory, tagsFactory) {
        
        var factory = {};
        
        /**
         * get all cards from server for a given user
         * 
         * @param json params
         * @returns cardsFactory
         * @broadcast cards list
         */
        factory.all = function (params) {
            
            params = getFilters(params, ['order', 'stack', 'tags']);
                        
            // query
            return cardsFactory
                .query(params, function (response) {
                    
                    broadcast(response); // tell the world
                }, function(err) {
                    $log.error(err);
                });  
        };
        
        /**
         * get cards using stack filters
         * 
         * @param json params
         * @returns stacksFactory
         * @broadcast cards list
         */
        factory.byStack = function (params) {
                  
            params = getFilters(params, ['order', 'stack', 'tags']);
                            
            return stacksFactory.filter(params, function(response) {
                
                broadcast(response); // tell the world
            }, function(err) {
                $log.error(err);
            });
        }
        
        /**
         * get cards using current filters
         * 
         * @param json params
         * @returns stacksFactory
         * @broadcast cards list
         */
        factory.byTags = function (params) {
                  
            params = getFilters(params, ['order', 'stack', 'tags']);
                  
            return tagsFactory.filter(params, function(response) {
                
                broadcast(response); // tell the world
            }, function(err) {
                $log.error(err);
            });
        }
              
        function getFilters(params, filters) {
            
            if(typeof(params) === 'undefined') {
                params = {};
            }
            
            if(filters.includes('tags') && typeof($cookies.get('tags[]')) !== 'undefined') {
                params['tags[]'] = $cookies.getObject('tags[]').map(function(x){ return x.id; });
            }
            if(filters.includes('stack') && typeof($cookies.get('stack')) !== 'undefined') {
                params.stack = $cookies.getObject('stack').id;
            }
            if(filters.includes('order') && typeof($cookies.get('order')) !== 'undefined') {
                params.order = $cookies.getObject('order');                
            }
          
            return params;
        }
              
        /**
         * Tell everybody we have a renovated list
         */
        function broadcast(data) {
            $rootScope.$broadcast('cards-loaded', data);
        }
        
        return factory;
    }    
})();
(function () {

    angular.module('app.home').controller('HomeController', ['$scope', HomeController]);

    function HomeController($scope) {
          
    }
})();



(function(){
    
    angular.module('app.home').controller('ListController', ['$scope', '$log', '$cookies', '$element', 'queryFactory', 'HomeContextService', ListController]);
    
    function ListController($scope, $log, $cookies, $element, queryFactory, HomeContextService){
        
        $scope.events = {};
        
        /**
         * Way to keep siblings connected and sharing scope
         */
        $scope.context = HomeContextService.context;
        
        /**
         * Get cards list
         */
        $scope.events.load = function(params) {
            
            // get data from server
            queryFactory
                .all(params).$promise.then(function (response) {
                             
                }, function(err) {
                    $log.error(err);
                });  
        };
        
        $scope.events.load(); // run at page load
        
        $scope.$on('cards-loaded', function(evt, response) {
            $scope.context.cards = response.data; // cards list
            $scope.context.pages = response; // pages data   
        });
        
        /**
         * Handle list order
         */
        $scope.$on('order-changed', function(evt, params) {   
            $scope.events.load({order: params}); // reload cards
        });
        
        /**
         * Handle pagination
         */
        $scope.$on('cards-page-changed', function(evt, params) {
            $scope.events.load(params); // reload cards
        });
        
        /**
         * Create card
         */
        $scope.$on('new-card', function(evt, item) {
            $scope.context.cards.unshift(item);
        });
        
        /**
         * Pin card
         */
        $scope.$on('pin-card', function(evt, item) {
           
            if(item.sticky) {
                // not sticky anymore
                item.sticky = false;
                item.class = item.class ? item.class.replace("sticky", "") : "";
            } else {
                // sticky. Put it first
                item.sticky = true;
                item.class = item.class ? item.class + " sticky" : "sticky";                
                let index = $scope.context.cards.indexOf(item);
                $scope.context.cards.splice(index, 1);
                $scope.context.cards.unshift(item);
            } 
        });
    
        /**
         * Delete card
         */
        $scope.$on('delete-card', function(evt, item) {
            let index = $scope.context.cards.indexOf(item);
            $scope.context.cards.splice(index, 1);
        });
        
        /**
         * Update card
         */
        $scope.$on('update-card', function(evt, original, newCard) {
            let index = $scope.context.cards.indexOf(original);
            angular.extend($scope.context.cards[index], newCard);
        });
    }
})();
(function(){
    
    angular.module('app.home').controller('SearchController', ['$scope', 'HomeContextService', SearchController]);
    
    function SearchController($scope, HomeContextService){
        
        /**
         * Way to keep siblings connected and sharing scope
         */
        $scope.context = HomeContextService.context;
    }
})();
(function () {
    angular.module('app.home')
        .filter('highlightText', ["$sce", function($sce) {
            return function (text, phrase) {
                let highlighted = phrase
                        ? text.replace(new RegExp('(' + phrase + ')', 'gi'), '<span class="highlight-text">$1</span>')
                        : text;
                        
                return $sce.trustAsHtml(highlighted);
            };            
        }]);
})();


angular.module('app.home').service('HomeContextService', function(){
    this.context = {
        cards: [],
        query: ''
    };
});
(function () {
    angular.module('app.stacks').directive('stackDescription', ['config',
        function (config) {
            return {
                restrict: 'EA',
                replace: true,
                templateUrl: config.SRC_FOLDER + 'stacks/templates/stack-description.html',
                scope: true,
                controller: ['$scope', '$rootScope', '$cookies', '$element', 'queryFactory', 
                    function ($scope, $rootScope, $cookies, $element, queryFactory) {
                       
                       $scope.events = {};
                       
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
                        * 
                        */
                       $scope.events.removeStackFilter = function(stack) {
                           $scope.context.stack = null;
                           $cookies.remove('stack');
                           $rootScope.$broadcast('stack-unselected', stack);
                       }
                       
                       /**
                        * 
                        */
                       $scope.events.editStack = function() {
                           
                       }
                }]
            };
        }
    ]);
})();
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
                     * Unselect stack
                     */
                    scope.$on('stack-unselected',function(stack) {

                        scope.context.current_stack = null;                    
                        element.find('.list-group-item').removeClass('selected');
                        
                         // query results
                        queryFactory.all();
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
                            
                            // query results
                            queryFactory.byStack({stack_id: stack.id});
                            
                            // tell the world
                            $rootScope.$broadcast('stack-selected', stack);
                        }                      
                }]
            };
    }]);
})();
(function(){
    angular.module('app.stacks').factory('stacksFactory', ['$resource', 'config', function ($resource, config) {
        return $resource(config.api + '/stacks/:id', { id: '@_id', stack_id: '@stack_id' }, {
            update: {
              method: 'PUT' 
            },
            filter: {
              url: config.api + '/stacks/:stack_id/cards', 
              method: 'GET' 
            }
        }); 
    }]);
})();


(function () {
    angular.module('app.tags').directive('currentTags', ['config',
        function (config) {
            return {
                restrict: 'EA',
                replace: true,
                templateUrl: config.SRC_FOLDER + 'tags/templates/current-tags.html',
                scope: true,
                controller: ['$scope', '$cookies', 'queryFactory', function ($scope, $cookies, queryFactory) {
                        
                    $scope.events = {};
                        
                    /**
                    * Current tags filters
                    */
                   $scope.events.printCurrentTags = function() {
                       let current_cookies = $cookies.getObject('tags[]');
                       if( typeof(current_cookies) !== 'undefined' ) {
                           $scope.context.tag_filters = current_cookies;
                       }
                   }

                   // add one more
                   $scope.$on('tag-filter-added', function(evt, tag) {

                       queryFactory.byTags();

                       $scope.context.tag_filters.unshift(tag);
                   });

                   // Draw tag filters on page load
                   $scope.events.printCurrentTags(); 

                   $scope.events.removeTagFilter = function(event, index, tag) {

                       // remove from view
                       $(event.currentTarget).closest('li').removeClass('animated'); // no hide animation
                       $scope.context.tag_filters.splice(index, 1);

                       // remove tag from cookies
                       let current_cookies = $cookies.getObject('tags[]');
                       let cookie_index = $.inArray( tag, current_cookies );
                       current_cookies.splice(cookie_index, 1);
                       $cookies.putObject('tags[]', current_cookies);

                       // query
                       queryFactory.byTags();
                   }     
                }]
            };
        }
    ]);
})();
(function () {
    angular.module('app.tags').directive('newTag', ['config', 'tagsFactory', '$rootScope', '$animate',
        function (config, tagsFactory, $rootScope, $animate) {
            
            return {
                restrict: 'EA',
                templateUrl: config.SRC_FOLDER + '/tags/templates/new-tag.html',
                replace: true,
                scope: {
                    card: "=data"
                },
                link: function(scope, element, attrs) {
                  
                    scope.events = {};
                  
                    // archetype
                    scope.tag = {
                        name: ''
                    };
                    
                    /**
                     * Initial widget state
                     */
                    scope.display = false;
                    
                    /**
                     * Hide widget
                     */
                    scope.events.show = function() { 
                        scope.display = true;
                        scope.visibility = 'visible'; // css class
                        setTimeout(function() {
                            element.find('input').focus();
                        }, 0.5); // time will vary according to css rule
                    }
                    
                    /**
                     * Hide widget
                     */
                    scope.events.hide = function() {
                        scope.display = false;
                        scope.visibility = ''; // css class
                        scope.tag.name = ''; // reset field
                    }
                    
                    /**
                     * creates a tag and attach it to current card
                     * 
                     * @returns void
                     * @broadcasts event
                     */
                    scope.events.addNew = function () {
                        
                        if(scope.tag.name) {
                            
                            let tag = {
                                card_id: scope.card.id,
                                name: scope.tag.name
                            };
                            
                            tagsFactory.save(tag, function(response) {
                                tag.id = response.id; // append tag id
                                scope.events.flashClass(element, 'ok'); // ux 
                                
                                // add tag as the last visible of X tags
                                if(typeof(scope.card.tags) !== 'undefined'){
                                    // add tag to the list
                                    scope.card.tags.splice(scope.max_num_tags-1, 0, tag);
                                } else {
                                    // create the list
                                    scope.card.tags = [tag];
                                }
                                
                            }, function(err) {
                                scope.events.flashClass(element, 'error'); // ux 
                            });
                            scope.tag.name = ''; // reset field
                        }
                    };
                    
                    /**
                     * Key event (Enter)
                     */
                    element.bind("keydown keypress", function (event) {
                        if(event.which === 13) {
                            scope.events.addNew();
                            event.preventDefault();
                        }
                    });
                    
                    /**
                     * Adds and removes a class
                     * 
                     * @param string className
                     * @returns void
                     */
                    scope.events.flashClass = function(element, className) {
                       
                        $animate.addClass(element, className)
                            .then(function() {
                                setTimeout(function() {
                                    $animate.removeClass(element, className);
                                }, 500);
                        });
                    }
                },
            };
        }
    ]);
})();
(function () {
    angular.module('app.home').directive('tagCloud', ['config', 
        function (config) {

            return {
                restrict: 'EA',
                scope: true,
                replace: true,     
                templateUrl: config.SRC_FOLDER + '/tags/templates/tag-cloud.html',
                controller: ['$scope', '$cookies', '$rootScope', 'reduceByFilter', function ($scope, $cookies, $rootScope, reduceByFilter) {

                    $scope.events = {};
                
                    /**
                     * Keep track of card list changes
                     */
                    $scope.$on('cards-loaded', function (evt, collection) {

                        if(typeof(collection.data) === 'undefined')
                            return;

                        // exclude card with no tags
                        let cards = collection.data.filter(function (card) {
                            return card.tags ? card.tags.length > 0 : false;
                        });
                      
                        // extract tags from card
                        let tags = cards.map(function (card) {
                            return JSON.parse(angular.toJson(card.tags));
                        });
                     
                        // merge tags in flatten array
                        let merged = [].concat.apply([], tags);
                        // eliminate duplicates and serve array to view
                        $scope.tags = reduceByFilter(merged, 'id');
                    });
                    
                    $scope.events.filter = function(tag) {
                        
                        let current_cookies = $cookies.getObject('tags[]');
                                 
                        if( typeof(current_cookies) === 'undefined') {
                            // first one
                            current_cookies = [tag];
                        } else {
                            // avoid duplicates
                            current_cookies = angular.fromJson(current_cookies);
                            if( current_cookies.map(function(e) { return e.id; }).indexOf(tag.id) === -1 ) {
                                current_cookies.push(tag);
                            }
                        }
                        
                        // add tag to current tags list
                        $cookies.putObject('tags[]', current_cookies);
                        
                        // someone else will make the query
                        $rootScope.$broadcast('tag-filter-added', tag);
                    }
                }]
            };
        }
    ]);
})();
(function(){
    angular.module('app.tags').factory('tagsFactory', ['$resource', 'config', function ($resource, config) {
        return $resource(config.api + '/tags/:id', { id: '@id', card_id: '@card_id' }, {
            save: {
                method: 'POST', 
                url: config.api + '/cards/:card_id/tags'                
            },
            filter: {
              url: config.api + '/cards/tags/all', 
              method: 'GET' 
            }
        }); 
    }]);
})();


(function() {

    angular.module('app.cards').controller('EditCardController', ['$scope', 'data', 'close', EditCardController]);
    
    function EditCardController($scope, data, close) {

        $scope.form = {};
        $scope.form.name = data.card.name;
        $scope.form.content = data.card.content;

        $scope.close = function (result) {
           
            close(result, 200); // close, but give 200ms for bootstrap to animate
        };
    };
})();
(function () {

    angular.module('app.home').controller('YesNoController', ['$scope', 'data', 'close', function ($scope, data, close) {
           
            $scope.title = data.title;
            $scope.content = data.content;
           
            $scope.close = function (result) {
                close(result, 200); // close, but give 200ms for bootstrap to animate
            };
        }]);
})();
(function() {

    angular.module('app.home').controller('MarkdownController', ['$scope', 'data', 'close', MarkdownController]);
    
    function MarkdownController($scope, data, close) {

        $scope.title = data.card.name;
        $scope.content = data.card.content;

        $scope.dismissModal = function (result) {
            close(result, 200); // close, but give 200ms for bootstrap to animate
        };
    };
})();
(function() {
    
    angular.module('app.stacks').controller('NewStackController', ['$scope', '$element', 'close', NewStackController]);
    
    function NewStackController($scope, $element, close) {
       
        $scope.form = {
            name: '',
            description: ''
        };
                
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC1jb25maWcuanMiLCJjYXJkcy9tb2R1bGUuanMiLCJjb21tb24vbW9kdWxlLmpzIiwiaG9tZS9tb2R1bGUuanMiLCJzdGFja3MvbW9kdWxlLmpzIiwidGFncy9tb2R1bGUuanMiLCJjYXJkcy9jYXJkcy1yb3V0ZS5qcyIsImNvbW1vbi9hcHAtcm91dGUuanMiLCJob21lL2hvbWUtcm91dGUuanMiLCJsb2dpbi9sb2dpbi5qcyIsInN0YWNrcy9ob21lLXJvdXRlLmpzIiwiY2FyZHMvZGlyZWN0aXZlcy9jYXJkLmpzIiwiY2FyZHMvZGlyZWN0aXZlcy9uZXctY2FyZC5qcyIsImNhcmRzL2RpcmVjdGl2ZXMvb3JkZXItYnkuanMiLCJjYXJkcy9kaXJlY3RpdmVzL3BhZ2luYXRlLWNhcmRzLmpzIiwiY2FyZHMvc2VydmljZXMvY2FyZHMtZmFjdG9yeS5qcyIsImNvbW1vbi9jb250cm9sbGVycy9oZWFkZXItY29udHJvbGxlcnMuanMiLCJjb21tb24vY29udHJvbGxlcnMvbGF5b3V0LWNvbnRyb2xsZXJzLmpzIiwiY29tbW9uL2RpcmVjdGl2ZXMvYXV0b2ZvY3VzLmpzIiwiY29tbW9uL2RpcmVjdGl2ZXMvZWxhc3RpY0FyZWEuanMiLCJjb21tb24vZGlyZWN0aXZlcy9oYXNodGFnaWZ5LmpzIiwiY29tbW9uL2RpcmVjdGl2ZXMvc2Vzc2lvbkRyb3Bkb3duLmpzIiwiY29tbW9uL2RpcmVjdGl2ZXMvc2hvd01vcmUuanMiLCJjb21tb24vZmlsdGVycy9yZWR1Y2VCeS5qcyIsImNvbW1vbi9zZXJ2aWNlcy9xdWVyeS1mYWN0b3J5LmpzIiwiaG9tZS9jb250cm9sbGVycy9ob21lLWNvbnRyb2xsZXIuanMiLCJob21lL2NvbnRyb2xsZXJzL2xpc3QtY29udHJvbGxlci5qcyIsImhvbWUvY29udHJvbGxlcnMvc2VhcmNoLWNvbnRyb2xsZXIuanMiLCJob21lL2ZpbHRlcnMvaGlnaGxpZ2h0VGV4dC5qcyIsImhvbWUvc2VydmljZXMvaG9tZS1jb250ZXh0LmpzIiwic3RhY2tzL2RpcmVjdGl2ZXMvc3RhY2stZGVzY3JpcHRpb24uanMiLCJzdGFja3MvZGlyZWN0aXZlcy9zdGFjay1saXN0LXBhbmVsLmpzIiwic3RhY2tzL3NlcnZpY2VzL3N0YWNrcy1mYWN0b3J5LmpzIiwidGFncy9kaXJlY3RpdmVzL2N1cnJlbnQtdGFncy5qcyIsInRhZ3MvZGlyZWN0aXZlcy9uZXctdGFnLmpzIiwidGFncy9kaXJlY3RpdmVzL3RhZy1jbG91ZC5qcyIsInRhZ3Mvc2VydmljZS90YWdzLWZhY3RvcnkuanMiLCJjYXJkcy9jb250cm9sbGVycy9tb2RhbHMvZWRpdC1jYXJkLWNvbnRyb2xsZXIuanMiLCJjb21tb24vY29udHJvbGxlcnMvbW9kYWxzL3llcy1uby1jb250cm9sbGVyLmpzIiwiaG9tZS9jb250cm9sbGVycy9tb2RhbHMvbWFya2Rvd24tY29udHJvbGxlci5qcyIsInN0YWNrcy9jb250cm9sbGVycy9tb2RhbHMvbmV3LXN0YWNrLWNvbnRyb2xsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQUdBLFFBQUEsT0FBQSxjQUFBO0tBQ0EsU0FBQSxVQUFBO1FBQ0EsT0FBQTtRQUNBLFNBQUE7UUFDQSxjQUFBO1FBQ0EsY0FBQTtRQUNBLHNCQUFBOzs7QUNUQSxRQUFBLE9BQUEsYUFBQTs7O0FDQUE7O0FBRUEsUUFBQSxPQUFBLE9BQUEsQ0FBQSxNQUFBLFdBQUEsYUFBQSxjQUFBLFlBQUEsdUJBQUE7Ozs7O0FBS0EsUUFBQSxPQUFBLE9BQUEsT0FBQSxDQUFBLGlCQUFBLGdCQUFBLHNCQUFBO0lBQ0EsVUFBQSxlQUFBLGNBQUEsb0JBQUEsUUFBQTs7Ozs7UUFLQSxjQUFBLFNBQUEsUUFBQSxTQUFBO1lBQ0EsZ0JBQUE7WUFDQSxVQUFBO1lBQ0EscUJBQUE7WUFDQSxvQkFBQTtZQUNBLGdCQUFBLFFBQUE7Ozs7OztRQU1BLGFBQUEsYUFBQSxPQUFBOzs7OztRQUtBLG1CQUFBLHFCQUFBO1lBQ0EsUUFBQTtZQUNBLFFBQUE7OztRQUdBLG1CQUFBO1FBQ0Es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QUVBLE9BQUEsVUFBQSxPQUFBLE1BQUE7WUFDQTtnQkFDQSxJQUFBO2dCQUNBLE1BQUE7O1lBRUE7Z0JBQ0EsT0FBQTtvQkFDQSxLQUFBLE9BQUEsTUFBQTtvQkFDQSxTQUFBO29CQUNBLG1CQUFBLFVBQUEsVUFBQTt3QkFDQSxPQUFBLFFBQUEsU0FBQTs7O2dCQUdBLFFBQUE7a0JBQ0EsUUFBQTs7Ozs7OztBQ2xCQSxDQUFBLFlBQUE7O0lBRUEsUUFBQSxPQUFBLE9BQUEsV0FBQSxvQkFBQSxDQUFBLFVBQUE7O0lBRUEsU0FBQSxpQkFBQSxRQUFBOzs7Ozs7O0FDSkEsQ0FBQSxZQUFBOztJQUVBLFFBQUEsT0FBQSxPQUFBLFdBQUEsb0JBQUEsQ0FBQSxVQUFBLFFBQUE7O0lBRUEsU0FBQSxpQkFBQSxRQUFBLE1BQUE7O1FBRUEsT0FBQSxlQUFBLFNBQUEsR0FBQTtZQUNBLElBQUEsVUFBQSxFQUFBLE9BQUE7WUFDQSxNQUFBLDRCQUFBOzs7UUFHQSxPQUFBLGVBQUEsU0FBQSxHQUFBO1lBQ0EsSUFBQSxVQUFBLEVBQUEsT0FBQTtZQUNBLE1BQUEsNEJBQUE7Ozs7Ozs7O1FBUUEsT0FBQSxZQUFBLFNBQUEsTUFBQTs7Ozs7WUFLQSxPQUFBLEtBQUEsWUFBQTs7Ozs7OztBQzFCQSxDQUFBLFlBQUE7SUFDQSxRQUFBLE9BQUEsT0FBQSxVQUFBLGFBQUEsWUFBQTtRQUNBLE9BQUE7WUFDQSxVQUFBO1lBQ0EsTUFBQSxVQUFBLE9BQUEsU0FBQTtnQkFDQSxRQUFBLEdBQUE7Ozs7Ozs7QUNMQSxDQUFBLFlBQUE7OztJQUdBLFFBQUEsT0FBQSxPQUFBLFVBQUEsZUFBQSxZQUFBO1FBQ0EsT0FBQTtZQUNBLFVBQUE7WUFDQSxNQUFBLFVBQUEsT0FBQSxTQUFBLFlBQUE7Z0JBQ0EsSUFBQSxZQUFBO3dCQUNBLFlBQUEsUUFBQSxHQUFBO3dCQUNBLGNBQUEsUUFBQSxJQUFBO3dCQUNBLGVBQUEsUUFBQSxJQUFBOztnQkFFQSxJQUFBLFVBQUEsUUFBQSxRQUFBLGVBQUEsSUFBQTtvQkFDQSxVQUFBO29CQUNBLEtBQUEsQ0FBQTtvQkFDQSxNQUFBLENBQUE7b0JBQ0EsT0FBQSxRQUFBLEdBQUEsY0FBQSxTQUFBLGVBQUEsS0FBQSxTQUFBLGdCQUFBO29CQUNBLFVBQUEsUUFBQSxJQUFBO29CQUNBLFlBQUEsUUFBQSxJQUFBO29CQUNBLFlBQUEsUUFBQSxJQUFBO29CQUNBLFFBQUE7OztnQkFHQSxRQUFBLFFBQUEsU0FBQSxNQUFBLE9BQUE7O2dCQUVBLElBQUEsU0FBQSxZQUFBO29CQUNBLElBQUEsUUFBQSxVQUFBLFFBQUEsUUFBQTt3QkFDQSxLQUFBLElBQUEsSUFBQSxHQUFBLElBQUEsSUFBQSxJQUFBLFFBQUEsS0FBQTs0QkFDQSxLQUFBOzt3QkFFQSxPQUFBOzs7b0JBR0EsSUFBQSxNQUFBLFFBQUEsTUFBQSxRQUFBLE1BQUE7NkJBQ0EsUUFBQSxNQUFBOzZCQUNBLFFBQUEsTUFBQTs2QkFDQSxRQUFBLE9BQUE7NkJBQ0EsUUFBQSxPQUFBOzZCQUNBLFFBQUEsV0FBQSxVQUFBLE9BQUE7Z0NBQ0EsT0FBQSxNQUFBLFVBQUEsTUFBQSxTQUFBLEtBQUE7OztvQkFHQSxRQUFBLEtBQUE7O29CQUVBLFFBQUEsSUFBQSxVQUFBLEtBQUEsSUFBQSxRQUFBLEdBQUEsZUFBQSxXQUFBOzs7Z0JBR0EsTUFBQSxJQUFBLFlBQUEsWUFBQTtvQkFDQSxRQUFBOzs7Z0JBR0EsUUFBQSxLQUFBLGlDQUFBO2dCQUNBOzs7OztBQ3BEQSxDQUFBLFlBQUE7SUFDQSxRQUFBLE9BQUEsT0FBQSxVQUFBLGNBQUEsQ0FBQSxZQUFBO1FBQ0EsU0FBQSxVQUFBLFVBQUE7WUFDQSxPQUFBO2dCQUNBLFVBQUE7Z0JBQ0EsT0FBQTtvQkFDQSxRQUFBO29CQUNBLFFBQUE7O2dCQUVBLE1BQUEsU0FBQSxPQUFBLFNBQUEsT0FBQTtvQkFDQSxTQUFBLFdBQUE7d0JBQ0EsSUFBQSxPQUFBLFFBQUE7O3dCQUVBLElBQUEsU0FBQSxJQUFBOzRCQUNBLE9BQUE7Ozt3QkFHQSxJQUFBLE1BQUEsV0FBQTs0QkFDQSxPQUFBLEtBQUEsUUFBQSxpQkFBQTs7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QUEsSUFBQSxZQUFBLFNBQUEsS0FBQSxNQUFBOztZQUVBLEdBQUEsS0FBQSxRQUFBOztnQkFFQSxLQUFBLFNBQUE7Z0JBQ0EsS0FBQSxRQUFBLEtBQUEsUUFBQSxLQUFBLE1BQUEsUUFBQSxVQUFBLE1BQUE7bUJBQ0E7O2dCQUVBLEtBQUEsU0FBQTtnQkFDQSxLQUFBLFFBQUEsS0FBQSxRQUFBLEtBQUEsUUFBQSxZQUFBO2dCQUNBLElBQUEsUUFBQSxPQUFBLFFBQUEsTUFBQSxRQUFBO2dCQUNBLE9BQUEsUUFBQSxNQUFBLE9BQUEsT0FBQTtnQkFDQSxPQUFBLFFBQUEsTUFBQSxRQUFBOzs7Ozs7O1FBT0EsT0FBQSxJQUFBLGVBQUEsU0FBQSxLQUFBLE1BQUE7WUFDQSxJQUFBLFFBQUEsT0FBQSxRQUFBLE1BQUEsUUFBQTtZQUNBLE9BQUEsUUFBQSxNQUFBLE9BQUEsT0FBQTs7Ozs7O1FBTUEsT0FBQSxJQUFBLGVBQUEsU0FBQSxLQUFBLFVBQUEsU0FBQTtZQUNBLElBQUEsUUFBQSxPQUFBLFFBQUEsTUFBQSxRQUFBO1lBQ0EsUUFBQSxPQUFBLE9BQUEsUUFBQSxNQUFBLFFBQUE7Ozs7QUN2RkEsQ0FBQSxVQUFBOztJQUVBLFFBQUEsT0FBQSxZQUFBLFdBQUEsb0JBQUEsQ0FBQSxVQUFBLHNCQUFBOztJQUVBLFNBQUEsaUJBQUEsUUFBQSxtQkFBQTs7Ozs7UUFLQSxPQUFBLFVBQUEsbUJBQUE7OztBQ1RBLENBQUEsWUFBQTtJQUNBLFFBQUEsT0FBQTtTQUNBLE9BQUEsMEJBQUEsU0FBQSxNQUFBO1lBQ0EsT0FBQSxVQUFBLE1BQUEsUUFBQTtnQkFDQSxJQUFBLGNBQUE7MEJBQ0EsS0FBQSxRQUFBLElBQUEsT0FBQSxNQUFBLFNBQUEsS0FBQSxPQUFBOzBCQUNBOztnQkFFQSxPQUFBLEtBQUEsWUFBQTs7Ozs7O0FDUkEsUUFBQSxPQUFBLFlBQUEsUUFBQSxzQkFBQSxVQUFBO0lBQ0EsS0FBQSxVQUFBO1FBQ0EsT0FBQTtRQUNBLE9BQUE7OztBQ0hBLENBQUEsWUFBQTtJQUNBLFFBQUEsT0FBQSxjQUFB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QUFBLE9BQUEsYUFBQTtnQkFDQSxTQUFBO2dCQUNBLE9BQUE7b0JBQ0EsTUFBQTs7Z0JBRUEsTUFBQSxTQUFBLE9BQUEsU0FBQSxPQUFBOztvQkFFQSxNQUFBLFNBQUE7OztvQkFHQSxNQUFBLE1BQUE7d0JBQ0EsTUFBQTs7Ozs7O29CQU1BLE1BQUEsVUFBQTs7Ozs7b0JBS0EsTUFBQSxPQUFBLE9BQUEsV0FBQTt3QkFDQSxNQUFBLFVBQUE7d0JBQ0EsTUFBQSxhQUFBO3dCQUNBLFdBQUEsV0FBQTs0QkFDQSxRQUFBLEtBQUEsU0FBQTsyQkFDQTs7Ozs7O29CQU1BLE1BQUEsT0FBQSxPQUFBLFdBQUE7d0JBQ0EsTUFBQSxVQUFBO3dCQUNBLE1BQUEsYUFBQTt3QkFDQSxNQUFBLElBQUEsT0FBQTs7Ozs7Ozs7O29CQVNBLE1BQUEsT0FBQSxTQUFBLFlBQUE7O3dCQUVBLEdBQUEsTUFBQSxJQUFBLE1BQUE7OzRCQUVBLElBQUEsTUFBQTtnQ0FDQSxTQUFBLE1BQUEsS0FBQTtnQ0FDQSxNQUFBLE1BQUEsSUFBQTs7OzRCQUdBLFlBQUEsS0FBQSxLQUFBLFNBQUEsVUFBQTtnQ0FDQSxJQUFBLEtBQUEsU0FBQTtnQ0FDQSxNQUFBLE9BQUEsV0FBQSxTQUFBOzs7Z0NBR0EsR0FBQSxPQUFBLE1BQUEsS0FBQSxVQUFBLFlBQUE7O29DQUVBLE1BQUEsS0FBQSxLQUFBLE9BQUEsTUFBQSxhQUFBLEdBQUEsR0FBQTt1Q0FDQTs7b0NBRUEsTUFBQSxLQUFBLE9BQUEsQ0FBQTs7OytCQUdBLFNBQUEsS0FBQTtnQ0FDQSxNQUFBLE9BQUEsV0FBQSxTQUFBOzs0QkFFQSxNQUFBLElBQUEsT0FBQTs7Ozs7OztvQkFPQSxRQUFBLEtBQUEsb0JBQUEsVUFBQSxPQUFBO3dCQUNBLEdBQUEsTUFBQSxVQUFBLElBQUE7NEJBQ0EsTUFBQSxPQUFBOzRCQUNBLE1BQUE7Ozs7Ozs7Ozs7b0JBVUEsTUFBQSxPQUFBLGFBQUEsU0FBQSxTQUFBLFdBQUE7O3dCQUVBLFNBQUEsU0FBQSxTQUFBOzZCQUNBLEtBQUEsV0FBQTtnQ0FDQSxXQUFBLFdBQUE7b0NBQ0EsU0FBQSxZQUFBLFNBQUE7bUNBQ0E7Ozs7Ozs7O0FDdEdBLENBQUEsWUFBQTtJQUNBLFFBQUEsT0FBQSxZQUFBLFVBQUEsWUFBQSxDQUFBO1FBQ0EsVUFBQSxRQUFBOztZQUVBLE9BQUE7Z0JBQ0EsVUFBQTtnQkFDQSxPQUFBO2dCQUNBLFNBQUE7Z0JBQ0EsYUFBQSxPQUFBLGFBQUE7Z0JBQ0EsWUFBQSxDQUFBLFVBQUEsWUFBQSxjQUFBLGtCQUFBLFVBQUEsUUFBQSxVQUFBLFlBQUEsZ0JBQUE7O29CQUVBLE9BQUEsU0FBQTs7Ozs7b0JBS0EsT0FBQSxJQUFBLGdCQUFBLFVBQUEsS0FBQSxZQUFBOzt3QkFFQSxHQUFBLE9BQUEsV0FBQSxVQUFBOzRCQUNBOzs7d0JBR0EsSUFBQSxRQUFBLFdBQUEsS0FBQSxPQUFBLFVBQUEsTUFBQTs0QkFDQSxPQUFBLEtBQUEsT0FBQSxLQUFBLEtBQUEsU0FBQSxJQUFBOzs7O3dCQUlBLElBQUEsT0FBQSxNQUFBLElBQUEsVUFBQSxNQUFBOzRCQUNBLE9BQUEsS0FBQSxNQUFBLFFBQUEsT0FBQSxLQUFBOzs7O3dCQUlBLElBQUEsU0FBQSxHQUFBLE9BQUEsTUFBQSxJQUFBOzt3QkFFQSxPQUFBLE9BQUEsZUFBQSxRQUFBOzs7b0JBR0EsT0FBQSxPQUFBLFNBQUEsU0FBQSxLQUFBOzt3QkFFQSxJQUFBLGtCQUFBLFNBQUEsVUFBQTs7d0JBRUEsSUFBQSxPQUFBLHFCQUFBLGFBQUE7OzRCQUVBLGtCQUFBLENBQUE7K0JBQ0E7OzRCQUVBLGtCQUFBLFFBQUEsU0FBQTs0QkFDQSxJQUFBLGdCQUFBLElBQUEsU0FBQSxHQUFBLEVBQUEsT0FBQSxFQUFBLE9BQUEsUUFBQSxJQUFBLFFBQUEsQ0FBQSxJQUFBO2dDQUNBLGdCQUFBLEtBQUE7Ozs7O3dCQUtBLFNBQUEsVUFBQSxVQUFBOzs7d0JBR0EsV0FBQSxXQUFBLG9CQUFBOzs7Ozs7O0FDeERBLENBQUEsVUFBQTtJQUNBLFFBQUEsT0FBQSxZQUFBLFFBQUEsZUFBQSxDQUFBLGFBQUEsVUFBQSxVQUFBLFdBQUEsUUFBQTtRQUNBLE9BQUEsVUFBQSxPQUFBLE1BQUEsYUFBQSxFQUFBLElBQUEsT0FBQSxTQUFBLGNBQUE7WUFDQSxNQUFBO2dCQUNBLFFBQUE7Z0JBQ0EsS0FBQSxPQUFBLE1BQUE7O1lBRUEsUUFBQTtjQUNBLEtBQUEsT0FBQSxNQUFBO2NBQ0EsUUFBQTs7Ozs7OztBQ1RBLENBQUEsV0FBQTs7SUFFQSxRQUFBLE9BQUEsYUFBQSxXQUFBLHNCQUFBLENBQUEsVUFBQSxRQUFBLFNBQUE7O0lBRUEsU0FBQSxtQkFBQSxRQUFBLE1BQUEsT0FBQTs7UUFFQSxPQUFBLE9BQUE7UUFDQSxPQUFBLEtBQUEsT0FBQSxLQUFBLEtBQUE7UUFDQSxPQUFBLEtBQUEsVUFBQSxLQUFBLEtBQUE7O1FBRUEsT0FBQSxRQUFBLFVBQUEsUUFBQTs7WUFFQSxNQUFBLFFBQUE7O0tBRUE7O0FDZEEsQ0FBQSxZQUFBOztJQUVBLFFBQUEsT0FBQSxZQUFBLFdBQUEsbUJBQUEsQ0FBQSxVQUFBLFFBQUEsU0FBQSxVQUFBLFFBQUEsTUFBQSxPQUFBOztZQUVBLE9BQUEsUUFBQSxLQUFBO1lBQ0EsT0FBQSxVQUFBLEtBQUE7O1lBRUEsT0FBQSxRQUFBLFVBQUEsUUFBQTtnQkFDQSxNQUFBLFFBQUE7Ozs7QUNSQSxDQUFBLFdBQUE7O0lBRUEsUUFBQSxPQUFBLFlBQUEsV0FBQSxzQkFBQSxDQUFBLFVBQUEsUUFBQSxTQUFBOztJQUVBLFNBQUEsbUJBQUEsUUFBQSxNQUFBLE9BQUE7O1FBRUEsT0FBQSxRQUFBLEtBQUEsS0FBQTtRQUNBLE9BQUEsVUFBQSxLQUFBLEtBQUE7O1FBRUEsT0FBQSxlQUFBLFVBQUEsUUFBQTtZQUNBLE1BQUEsUUFBQTs7S0FFQTs7QUNaQSxDQUFBLFdBQUE7O0lBRUEsUUFBQSxPQUFBLGNBQUEsV0FBQSxzQkFBQSxDQUFBLFVBQUEsWUFBQSxTQUFBOztJQUVBLFNBQUEsbUJBQUEsUUFBQSxVQUFBLE9BQUE7O1FBRUEsT0FBQSxPQUFBO1lBQ0EsTUFBQTtZQUNBLGFBQUE7Ozs7OztRQU1BLFNBQUEsS0FBQSxTQUFBLEtBQUEsb0JBQUEsVUFBQSxPQUFBOztZQUVBLEdBQUEsTUFBQSxVQUFBLElBQUE7Z0JBQ0EsU0FBQSxNQUFBO2dCQUNBLE9BQUEsTUFBQTtnQkFDQSxPQUFBOzs7O1FBSUEsT0FBQSxRQUFBLFVBQUEsUUFBQTs7WUFFQSxNQUFBLFFBQUE7Ozs7S0FJQTtLQUNBIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogVGhpcyBjb25maWcgaXMgaW50ZW5kZWQgdG8gYmUgaW5qZWN0ZWQgaW4geW91ciBzcmNcbiAqL1xuYW5ndWxhci5tb2R1bGUoXCJhcHAuY29uZmlnXCIsIFtdKVxuICAgIC5jb25zdGFudChcImNvbmZpZ1wiLCB7XG4gICAgICAgIFwiYXBpXCI6IFwiaHR0cDovL2xvY2FsaG9zdDo4MDAxL2FwaS92MVwiLCBcbiAgICAgICAgXCJkZWJ1Z1wiOiB0cnVlLFxuICAgICAgICBcIlNSQ19GT0xERVJcIjogJy9zcmMvYXBwX21vZHVsZXMvJyxcbiAgICAgICAgXCJJTUdfRk9MREVSXCI6ICcvaW1nLycsXG4gICAgICAgIFwiUFJPRklMRV9JTUdfRk9MREVSXCI6ICcvaW1nL3Byb2ZpbGUvJ1xuICAgIH0pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcC5jYXJkcycsIFtdKTtcblxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5hbmd1bGFyLm1vZHVsZSgnYXBwJywgWyduZycsICduZ1JvdXRlJywgJ25nQ29va2llcycsICdhcHAuY29uZmlnJywgJ2FwcC5ob21lJywgJ2FuZ3VsYXJNb2RhbFNlcnZpY2UnLCAncGFzY2FscHJlY2h0LnRyYW5zbGF0ZSddKTtcbiAgXG4vKipcbiAqIFJlc3Qgb2YgdGhlIGdsb2JhbCBjb25maWcgY2FuIGJlIGZvdW5kIGluIGFwcC1jb25maWcgbW9kdWxlXG4gKi8gIFxuYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmNvbmZpZyhbJyRodHRwUHJvdmlkZXInLCAnJGxvZ1Byb3ZpZGVyJywgJyR0cmFuc2xhdGVQcm92aWRlcicsICdjb25maWcnLCBcbiAgICBmdW5jdGlvbiAoJGh0dHBQcm92aWRlciwgJGxvZ1Byb3ZpZGVyLCAkdHJhbnNsYXRlUHJvdmlkZXIsIGNvbmZpZykge1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFqYXggY2FsbHNcbiAgICAgICAgICovIFxuICAgICAgICAkaHR0cFByb3ZpZGVyLmRlZmF1bHRzLmhlYWRlcnMuY29tbW9uID0geyBcbiAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb247b2RhdGE9dmVyYm9zZScsXG4gICAgICAgICAgICAnWC1Mb2dpbi1BamF4LWNhbGwnOiAndHJ1ZScsXG4gICAgICAgICAgICAnWC1SZXF1ZXN0ZWQtV2l0aCc6IFwiWE1MSHR0cFJlcXVlc3RcIixcbiAgICAgICAgICAgICdYLUNTUkYtVE9LRU4nOiBMYXJhdmVsLmNzcmZUb2tlblxuICAgICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIERlYnVnZ2luZ1xuICAgICAgICAgKi8gXG4gICAgICAgICRsb2dQcm92aWRlci5kZWJ1Z0VuYWJsZWQoY29uZmlnLmRlYnVnKTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUcmFuc2xhdGlvbnNcbiAgICAgICAgICovICAgICBcbiAgICAgICAgJHRyYW5zbGF0ZVByb3ZpZGVyLnVzZVN0YXRpY0ZpbGVzTG9hZGVyKHtcbiAgICAgICAgICAgIHByZWZpeDogJy9pMThuL2xvY2FsZS0nLFxuICAgICAgICAgICAgc3VmZml4OiAnLmpzb24nXG4gICAgICAgIH0pO1xuXG4gICAgICAgICR0cmFuc2xhdGVQcm92aWRlci51c2VDb29raWVTdG9yYWdlKCk7XG4gICAgICAgICR0cmFuc2xhdGVQcm92aWRlci5wcmVmZXJyZWRMYW5ndWFnZSgnZW5fVVMnKTtcbiAgICAgICAgJHRyYW5zbGF0ZVByb3ZpZGVyLmZhbGxiYWNrTGFuZ3VhZ2UoJ2VuX1VTJyk7XG4gICAgICAgICR0cmFuc2xhdGVQcm92aWRlci51c2VTYW5pdGl6ZVZhbHVlU3RyYXRlZ3koJ2VzY2FwZScpO1xufV0pO1xuIFxuYW5ndWxhci5tb2R1bGUoJ2FwcCcpLnJ1bihbZnVuY3Rpb24gKCkge1xuIFxufV0pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcC5ob21lJywgWyduZ1JvdXRlJywgJ2FwcC5jb25maWcnLCAnbmdBbmltYXRlJywgJ2FwcC5jYXJkcycsICdhcHAuc3RhY2tzJywgJ2FwcC50YWdzJywgJ2hjLm1hcmtlZCcsICduZ1Nhbml0aXplJ10pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcC5zdGFja3MnLCBbJ25nUmVzb3VyY2UnXSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwLnRhZ3MnLCBbJ25nUmVzb3VyY2UnXSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwLmNhcmRzJykuY29uZmlnKGZ1bmN0aW9uKCRyb3V0ZVByb3ZpZGVyKSB7XG4gICBcbn0pOyIsIihmdW5jdGlvbiAoKSB7XG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmNvbmZpZyhbJyRyb3V0ZVByb3ZpZGVyJywgJ2NvbmZpZycsIGZ1bmN0aW9uKCRyb3V0ZVByb3ZpZGVyLCBjb25maWcpIHtcblxuICAgICAgJHJvdXRlUHJvdmlkZXJcbiAgICAgICAgLndoZW4oJy8nLCB7XG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogY29uZmlnLlNSQ19GT0xERVIgKyAnaG9tZS90ZW1wbGF0ZXMvaG9tZS10ZW1wbGF0ZS5odG1sJyxcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdIb21lQ29udHJvbGxlcicsXG4gICAgICAgICAgICBjb250cm9sbGVyQXM6ICdob21lJ1xuICAgICAgICB9KVxuXG4gICAgICAgIC5vdGhlcndpc2Uoe3JlZGlyZWN0VG86ICcvJ30pOyBcbiAgICB9XSk7XG59KSgpOyIsImFuZ3VsYXIubW9kdWxlKCdhcHAuaG9tZScpLmNvbmZpZyhmdW5jdGlvbigkcm91dGVQcm92aWRlcikge1xuXG59KTsiLCJcbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcblxuICAgIC8vIHN3aXRjaCBmb3Jtc1xuICAgICQoJy5tZXNzYWdlIGEnKS5jbGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgIFxuICAgICAgICAkKCdmb3JtJykuYW5pbWF0ZSh7aGVpZ2h0OiBcInRvZ2dsZVwiLCBvcGFjaXR5OiBcInRvZ2dsZVwifSwgXCJzbG93XCIpO1xuICAgICAgICBcbiAgICAgICAgaWYod2luZG93LmxvY2F0aW9uLnBhdGhuYW1lID09ICcvbG9naW4nKSB7XG4gICAgICAgICAgICBoaXN0b3J5LnB1c2hTdGF0ZSh7fSwgXCJSZWdpc3RlclwiLCBcIi9yZWdpc3RlclwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGhpc3RvcnkucHVzaFN0YXRlKHt9LCBcIkxvZ2luXCIsIFwiL2xvZ2luXCIpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAkKCdmb3JtIC5oZWxwLWJsb2NrJykuaGlkZSgpO1xuICAgIH0pO1xuXG59KTsiLCJhbmd1bGFyLm1vZHVsZSgnYXBwLnN0YWNrcycpLmNvbmZpZyhmdW5jdGlvbigkcm91dGVQcm92aWRlcikge1xuXG59KTsiLCIoZnVuY3Rpb24gKCkge1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5jYXJkcycpLmRpcmVjdGl2ZSgnY2FyZCcsXG4gICAgICAgIFsnY29uZmlnJywgZnVuY3Rpb24gKGNvbmZpZykge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogY29uZmlnLlNSQ19GT0xERVIgKyAnY2FyZHMvdGVtcGxhdGVzL2NhcmQuaHRtbCcsXG4gICAgICAgICAgICAgICAgcmVzdHJpY3Q6ICdBJyxcbiAgICAgICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICAgICAgICAgIGNhcmQ6IFwiPWRhdGFcIlxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogWyckc2NvcGUnLCAnJHJvb3RTY29wZScsICckbG9nJywgJ2NvbmZpZycsICdjYXJkc0ZhY3RvcnknLCAnTW9kYWxTZXJ2aWNlJyxcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKCRzY29wZSwgJHJvb3RTY29wZSwgJGxvZywgY29uZmlnLCBjYXJkc0ZhY3RvcnksIE1vZGFsU2VydmljZSkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXZlbnRzID0ge307XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICogRGlzcGxheSBvbmx5IFggdGFnc1xuICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUubWF4X251bV90YWdzID0gMztcblxuICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBQaW4gQ2FyZCAobWFrZSBpdCAnc3RpY2t5JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIFxuICAgICAgICAgICAgICAgICAgICAgICAgICogQHBhcmFtIENhcmQgaXRlbVxuICAgICAgICAgICAgICAgICAgICAgICAgICogQHJldHVybnMgdm9pZFxuICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXZlbnRzLnBpbkNhcmQgPSBmdW5jdGlvbiAoaXRlbSkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNhcmQgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBpdGVtLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGlja3k6ICFpdGVtLnN0aWNreVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFqYXggY2FsbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhcmRzRmFjdG9yeS51cGRhdGUoY2FyZCkuJHByb21pc2UudGhlbihmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZW1taXQgZXZlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdwaW4tY2FyZCcsIGl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJGxvZy5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBEZWxldGUgQ2FyZFxuICAgICAgICAgICAgICAgICAgICAgICAgICogXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBAcGFyYW0gQ2FyZCBpdGVtXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBAcmV0dXJucyB2b2lkXG4gICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5ldmVudHMuZGVsZXRlID0gZnVuY3Rpb24gKGl0ZW0pIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEp1c3QgcHJvdmlkZSBhIHRlbXBsYXRlIHVybCwgYSBjb250cm9sbGVyIGFuZCBjYWxsICdzaG93TW9kYWwnLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1vZGFsU2VydmljZS5zaG93TW9kYWwoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogY29uZmlnLlNSQ19GT0xERVIgKyBcImNvbW1vbi90ZW1wbGF0ZXMvbW9kYWxzL2NvbmZpcm0uaHRtbFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBcIlllc05vQ29udHJvbGxlclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnB1dHM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAndGl0bGUnOiAnRGVsZXRlIGNhcmQ/JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnY29udGVudCc6IFwiWW91J2xsIG5vdCBiZSBhYmxlIHRvIHJlY292ZXIgaXRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkudGhlbihmdW5jdGlvbiAobW9kYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWwuZWxlbWVudC5tb2RhbCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RhbC5jbG9zZS50aGVuKGZ1bmN0aW9uIChyZXN1bHQpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdCkgeyAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhamF4IGNhbGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXJkc0ZhY3RvcnkuZGVsZXRlKHtpZDogaXRlbS5pZH0pLiRwcm9taXNlLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZW1taXQgZXZlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdkZWxldGUtY2FyZCcsIGl0ZW0pOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkbG9nLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBFZGl0IENhcmRcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIFxuICAgICAgICAgICAgICAgICAgICAgICAgICogQHBhcmFtIENhcmQgaXRlbVxuICAgICAgICAgICAgICAgICAgICAgICAgICogQHJldHVybnMgdm9pZFxuICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXZlbnRzLmVkaXQgPSBmdW5jdGlvbiAoaXRlbSkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTW9kYWxTZXJ2aWNlLnNob3dNb2RhbCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBjb25maWcuU1JDX0ZPTERFUiArIFwiY2FyZHMvdGVtcGxhdGVzL21vZGFscy9lZGl0LWNhcmQuaHRtbFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBcIkVkaXRDYXJkQ29udHJvbGxlclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnB1dHM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXJkOiBpdGVtXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIChtb2RhbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RhbC5lbGVtZW50Lm1vZGFsKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFsLmNsb3NlLnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcHJlcGFyZSBkYXRhIHRvIGJlIHNlbmQgdG8gc2VydmVyIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjYXJkID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogaXRlbS5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogbW9kYWwuc2NvcGUuZm9ybS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBtb2RhbC5zY29wZS5mb3JtLmNvbnRlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhamF4IGNhbGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXJkc0ZhY3RvcnkudXBkYXRlKGNhcmQpLiRwcm9taXNlLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZW1taXQgZXZlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCd1cGRhdGUtY2FyZCcsIGl0ZW0sIGNhcmQpOyAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkbG9nLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBWaWV3IGNvbnRlbnQgaW4gbW9kYWxib3ggd2l0aCBNYXJrZG93biAocmljaCB0ZXh0IG1vZGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIEBwYXJhbSBDYXJkIGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgICAgICAqIEByZXR1cm5zIHZvaWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmV2ZW50cy52aWV3QXNNYXJrZG93bk1vZGFsID0gZnVuY3Rpb24gKGl0ZW0pIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEp1c3QgcHJvdmlkZSBhIHRlbXBsYXRlIHVybCwgYSBjb250cm9sbGVyIGFuZCBjYWxsICdzaG93TW9kYWwnLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1vZGFsU2VydmljZS5zaG93TW9kYWwoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogY29uZmlnLlNSQ19GT0xERVIgKyBcImhvbWUvdGVtcGxhdGVzL21vZGFscy9tYXJrZG93bi5odG1sXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IFwiTWFya2Rvd25Db250cm9sbGVyXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0czoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdjYXJkJzogaXRlbVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkudGhlbihmdW5jdGlvbiAobW9kYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWwuZWxlbWVudC5tb2RhbCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XVxuICAgICAgICB9O1xuICAgIH1dKTtcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcblxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuY2FyZHMnKS5kaXJlY3RpdmUoJ25ld0NhcmRGb3JtJyxcbiAgICAgICAgWydjb25maWcnLCBmdW5jdGlvbiAoY29uZmlnKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgICAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgICAgICAgICAgY2FyZDogXCI9XCJcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IGNvbmZpZy5TUkNfRk9MREVSICsgJ2NhcmRzL3RlbXBsYXRlcy9uZXctZm9ybS5odG1sJyxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBbJyRzY29wZScsICckcm9vdFNjb3BlJywgJyRsb2cnLCAnY2FyZHNGYWN0b3J5JywgZnVuY3Rpb24gKCRzY29wZSwgJHJvb3RTY29wZSwgJGxvZywgY2FyZHNGYWN0b3J5KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmV2ZW50cyA9IHt9O1xuXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBTdWJtaXQgZm9ybVxuICAgICAgICAgICAgICAgICAgICAgKiBAcmV0dXJucyB2b2lkXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXZlbnRzLmNyZWF0ZUNhcmQgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgkc2NvcGUuY29udGVudCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGRhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICRzY29wZS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiAkc2NvcGUuY29udGVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXJkc0ZhY3Rvcnkuc2F2ZShkYXRhKS4kcHJvbWlzZS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNsYXNzID0gJ2hpZ2hsaWdodGVkJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5pZCA9IHJlc3BvbnNlLmlkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ25ldy1jYXJkJywgZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRsb2cuZXJyb3IocmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuY29udGVudCA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF19XG4gICAgICAgIH1dKTtcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmNhcmRzJykuZGlyZWN0aXZlKCdvcmRlckJ5JywgWydjb25maWcnLFxuICAgICAgICBmdW5jdGlvbiAoY29uZmlnKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcmVzdHJpY3Q6ICdFQScsXG4gICAgICAgICAgICAgICAgc2NvcGU6IHRydWUsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IGNvbmZpZy5TUkNfRk9MREVSICsgJy9jYXJkcy90ZW1wbGF0ZXMvb3JkZXItYnkuaHRtbCcsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogWyckc2NvcGUnLCAnJHJvb3RTY29wZScsICckY29va2llcycsIGZ1bmN0aW9uICgkc2NvcGUsICRyb290U2NvcGUsICRjb29raWVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXZlbnRzID0ge307XG4gICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBsZXQgb3JkZXIgPSAkY29va2llcy5nZXRPYmplY3QoJ29yZGVyJyk7XG4gICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvLyBpbml0aWFsIHBvc2l0aW9uXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5vcmRlciA9IG9yZGVyICYmICFhbmd1bGFyLmlzVW5kZWZpbmVkKG9yZGVyLm9yZGVyKSA/IG9yZGVyLm9yZGVyIDogJ3VwZGF0ZWRfYXQnO1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGlyZWN0aW9uID0gb3JkZXIgJiYgIWFuZ3VsYXIuaXNVbmRlZmluZWQob3JkZXIuZGlyZWN0aW9uKSA/IG9yZGVyLmRpcmVjdGlvbiA6ICdkZXNjJztcblxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXZlbnRzLnVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcmRlcjogJHNjb3BlLm9yZGVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogJHNjb3BlLmRpcmVjdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBwZXJzaXN0XG4gICAgICAgICAgICAgICAgICAgICAgICAkY29va2llcy5wdXRPYmplY3QoJ29yZGVyJywgZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnb3JkZXItY2hhbmdlZCcsIGRhdGEpOyAvLyBlbW1pdFxuICAgICAgICAgICAgICAgICAgICB9ICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICBdKTtcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwJykuZGlyZWN0aXZlKCdwYWdpbmF0ZUNhcmRzJywgWydjb25maWcnLFxuICAgICAgICBmdW5jdGlvbiAoY29uZmlnKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcmVzdHJpY3Q6ICdFQScsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IGNvbmZpZy5TUkNfRk9MREVSICsgJy9jYXJkcy90ZW1wbGF0ZXMvcGFnaW5hdGUtY2FyZHMuaHRtbCcsXG4gICAgICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiAnPSdcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJyRyb290U2NvcGUnLCBmdW5jdGlvbiAoJHNjb3BlLCAkcm9vdFNjb3BlKSB7XG4gICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmNvbnRleHQgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmV2ZW50cyA9IHt9O1xuICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBEcmF3IHdpZGdldCB3aGVuIGRhdGEgaXMgYXZhaWxhYmxlXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuJG9uKCdjYXJkcy1sb2FkZWQnLCBmdW5jdGlvbihldnQsIGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5jb250ZXh0LnBhZ2VzID0gZGF0YTsgXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuY29udGV4dC5kaXNwbGF5ID0gZGF0YS5kYXRhLmxlbmd0aCAmJiAoZGF0YS5wcmV2X3BhZ2VfdXJsICE9PSBudWxsIHx8IGRhdGEubmV4dF9wYWdlX3VybCAhPT0gbnVsbCk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIEJyb2FkY2FzdCBjaGFuZ2VzXG4gICAgICAgICAgICAgICAgICAgICAqIEByZXR1cm5zIHZvaWRcbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5ldmVudHMubmF2aWdhdGUgPSBmdW5jdGlvbiAoJGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgJGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCB0YXJnZXQgPSAkZXZlbnQuY3VycmVudFRhcmdldDtcbiAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYodHlwZW9mKHRhcmdldC5hdHRyaWJ1dGVzWydkaXNhYmxlZCddKSA9PT0gJ3VuZGVmaW5lZCcgfHwgIXRhcmdldC5hdHRyaWJ1dGVzWydkaXNhYmxlZCddLnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdjYXJkcy1wYWdlLWNoYW5nZWQnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZ2U6IHRhcmdldC5hdHRyaWJ1dGVzWydkYXRhLXBhZ2UnXS52YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pOyAvLyBlbW1pdFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICBdKTtcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcblxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuY2FyZHMnKS5mYWN0b3J5KCdjYXJkc0ZhY3RvcnknLCBbJyRyZXNvdXJjZScsICdjb25maWcnLCBmdW5jdGlvbigkcmVzb3VyY2UsIGNvbmZpZykge1xuXG4gICAgICAgIHJldHVybiAkcmVzb3VyY2UoY29uZmlnLmFwaSArICcvY2FyZHMvOmlkJywgXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaWQ6ICdAaWQnLFxuICAgICAgICAgICAgICAgIHBhZ2U6ICdAcGFnZSdcbiAgICAgICAgICAgIH0sIFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHF1ZXJ5OiB7XG4gICAgICAgICAgICAgICAgICAgIHVybDogY29uZmlnLmFwaSArICcvY2FyZHMvdGFncy9hbGwnLFxuICAgICAgICAgICAgICAgICAgICBpc0FycmF5OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtUmVzcG9uc2U6IGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFuZ3VsYXIuZnJvbUpzb24ocmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB1cGRhdGU6IHtcbiAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BVVCcgXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7IFxuICAgIH1dKTtcbn0pKCk7XG5cbiIsIihmdW5jdGlvbiAoKSB7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwJykuY29udHJvbGxlcignSGVhZGVyQ29udHJvbGxlcicsIFsnJHNjb3BlJywgSGVhZGVyQ29udHJvbGxlcl0pO1xuXG4gICAgZnVuY3Rpb24gSGVhZGVyQ29udHJvbGxlcigkc2NvcGUpIHtcbiAgICAgICAgXG4gICAgfVxufSkoKTtcblxuXG4iLCIoZnVuY3Rpb24gKCkge1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmNvbnRyb2xsZXIoJ0xheW91dENvbnRyb2xsZXInLCBbJyRzY29wZScsICckc2NlJywgTGF5b3V0Q29udHJvbGxlcl0pO1xuXG4gICAgZnVuY3Rpb24gTGF5b3V0Q29udHJvbGxlcigkc2NvcGUsICRzY2UpIHtcblxuICAgICAgICAkc2NvcGUudGFnVXNlckNsaWNrID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgdmFyIHRhZ1RleHQgPSBlLnRhcmdldC5pbm5lclRleHQ7XG4gICAgICAgICAgICBhbGVydCgndGFnVXNlckNsaWNrLCB0YWdUZXh0OiAnICsgdGFnVGV4dCk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAkc2NvcGUudGFnVGVybUNsaWNrID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgdmFyIHRhZ1RleHQgPSBlLnRhcmdldC5pbm5lclRleHQ7XG4gICAgICAgICAgICBhbGVydCgndGFnVGVybUNsaWNrLCB0YWdUZXh0OiAnICsgdGFnVGV4dCk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvLyBZb3UgY291bGQgZGVmaW5lICd0YWdVc2VyQ2xpY2snIGFuZCAndGFnVGVybUNsaWNrJ1xuICAgICAgICAvLyBvbiB0aGUgJyRyb290U2NvcGUnLiBUaGlzIHdheSB5b3UgY2FuIGhhbmRsZSB3aGF0ZXZlclxuICAgICAgICAvLyBsb2dpYyB5b3Ugd2FudCBmb3IgaGFzaHRhZ3MgaW4gb25lIHBsYWNlIHJhdGhlciB0aGFuXG4gICAgICAgIC8vIGhhdmluZyB0byBkZWZpbmUgaXQgaW4gZWFjaCBjb250cm9sbGVyLlxuICAgICAgICBcbiAgICAgICAgJHNjb3BlLnRydXN0SHRtbCA9IGZ1bmN0aW9uKGh0bWwpIHtcbiAgICAgICAgICAgIC8vIFNhbml0aXplIG1hbnVhbGx5IGlmIG5lY2Vzc2FyeS4gSXQncyBsaWtlbHkgdGhpc1xuICAgICAgICAgICAgLy8gaHRtbCBoYXMgYWxyZWFkeSBiZWVuIHNhbml0aXplZCBzZXJ2ZXIgc2lkZVxuICAgICAgICAgICAgLy8gYmVmb3JlIGl0IHdlbnQgaW50byB5b3VyIGRhdGFiYXNlLlxuICAgICAgICAgICAgLy8gRG9uJ3QgaG9sZCBtZSBsaWFibGUgZm9yIFhTUy4uLiBuZXZlciBhc3N1bWUgOn4pXG4gICAgICAgICAgICByZXR1cm4gJHNjZS50cnVzdEFzSHRtbChodG1sKTtcbiAgICAgICAgfTtcbiAgICB9XG59KSgpO1xuXG5cbiIsIihmdW5jdGlvbiAoKSB7XG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmRpcmVjdGl2ZSgnYXV0b2ZvY3VzJywgZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmVzdHJpY3Q6ICdBJyxcbiAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCkge1xuICAgICAgICAgICAgICAgIGVsZW1lbnRbMF0uZm9jdXMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9KTtcbn0pKCk7XG5cbiAgICAgIiwiKGZ1bmN0aW9uICgpIHtcbiAgICAvLyBCZWNhdXNlIG9mIHRoZSBhbm1lIGFuZCBFIHR5cGUsIHdvcmtzIGF1dG9tYXRpY2FsbHkgZm9yIGV2ZXJ5IHRleHRhcmVhXG4gICAgLy8gcmVmOiBodHRwczovL2dpc3QuZ2l0aHViLmNvbS90aG9tc2VkZG9uLzQ3MDM5NjhcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwJykuZGlyZWN0aXZlKCdlbGFzdGljQXJlYScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnQScsXG4gICAgICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgICAgICAgICB2YXIgdGhyZXNob2xkID0gMzUsXG4gICAgICAgICAgICAgICAgICAgICAgICBtaW5IZWlnaHQgPSBlbGVtZW50WzBdLm9mZnNldEhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmdMZWZ0ID0gZWxlbWVudC5jc3MoJ3BhZGRpbmdMZWZ0JyksXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nUmlnaHQgPSBlbGVtZW50LmNzcygncGFkZGluZ1JpZ2h0Jyk7XG5cbiAgICAgICAgICAgICAgICB2YXIgJHNoYWRvdyA9IGFuZ3VsYXIuZWxlbWVudCgnPGRpdj48L2Rpdj4nKS5jc3Moe1xuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgICAgICAgICAgICAgICAgdG9wOiAtMTAwMDAsXG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6IC0xMDAwMCxcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IGVsZW1lbnRbMF0ub2Zmc2V0V2lkdGggLSBwYXJzZUludChwYWRkaW5nTGVmdCB8fCAwKSAtIHBhcnNlSW50KHBhZGRpbmdSaWdodCB8fCAwKSxcbiAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6IGVsZW1lbnQuY3NzKCdmb250U2l6ZScpLFxuICAgICAgICAgICAgICAgICAgICBmb250RmFtaWx5OiBlbGVtZW50LmNzcygnZm9udEZhbWlseScpLFxuICAgICAgICAgICAgICAgICAgICBsaW5lSGVpZ2h0OiBlbGVtZW50LmNzcygnbGluZUhlaWdodCcpLFxuICAgICAgICAgICAgICAgICAgICByZXNpemU6ICdub25lJ1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmJvZHkpLmFwcGVuZCgkc2hhZG93KTtcblxuICAgICAgICAgICAgICAgIHZhciB1cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB0aW1lcyA9IGZ1bmN0aW9uIChzdHJpbmcsIG51bWJlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIHIgPSAnJzsgaSA8IG51bWJlcjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgciArPSBzdHJpbmc7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcjtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHZhciB2YWwgPSBlbGVtZW50LnZhbCgpLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvJi9nLCAnJmFtcDsnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXG4kLywgJzxici8+Jm5ic3A7JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxuL2csICc8YnIvPicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcc3syLH0vZywgZnVuY3Rpb24gKHNwYWNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aW1lcygnJm5ic3A7Jywgc3BhY2UubGVuZ3RoIC0gMSkgKyAnICc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgJHNoYWRvdy5odG1sKHZhbCk7XG5cbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5jc3MoJ2hlaWdodCcsIE1hdGgubWF4KCRzaGFkb3dbMF0ub2Zmc2V0SGVpZ2h0ICsgdGhyZXNob2xkLCBtaW5IZWlnaHQpKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAkc2hhZG93LnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgZWxlbWVudC5iaW5kKCdrZXl1cCBrZXlkb3duIGtleXByZXNzIGNoYW5nZScsIHVwZGF0ZSk7XG4gICAgICAgICAgICAgICAgdXBkYXRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHsgXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmRpcmVjdGl2ZSgnaGFzaHRhZ2lmeScsIFsnJHRpbWVvdXQnLCAnJGNvbXBpbGUnLFxuICAgICAgICBmdW5jdGlvbigkdGltZW91dCwgJGNvbXBpbGUpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcmVzdHJpY3Q6ICdBJyxcbiAgICAgICAgICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgICAgICAgICB1Q2xpY2s6ICcmdXNlckNsaWNrJyxcbiAgICAgICAgICAgICAgICAgICAgdENsaWNrOiAnJnRlcm1DbGljaydcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBodG1sID0gZWxlbWVudC5odG1sKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChodG1sID09PSAnJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGF0dHJzLnVzZXJDbGljaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGh0bWwgPSBodG1sLnJlcGxhY2UoLyh8XFxzKSpAKFxcdyspL2csICckMTxhIG5nLWNsaWNrPVwidUNsaWNrKHskZXZlbnQ6ICRldmVudH0pXCIgY2xhc3M9XCJoYXNodGFnXCI+QCQyPC9hPicpOyBcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGF0dHJzLnRlcm1DbGljaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGh0bWwgPSBodG1sLnJlcGxhY2UoLyhefFxccykqIyhcXHcrKS9nLCAnJDE8YSBuZy1jbGljaz1cInRDbGljayh7JGV2ZW50OiAkZXZlbnR9KVwiIGNsYXNzPVwiaGFzaHRhZ1wiPiMkMjwvYT4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5odG1sKGh0bWwpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAkY29tcGlsZShlbGVtZW50LmNvbnRlbnRzKCkpKHNjb3BlKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIF0pO1xufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAnKS5kaXJlY3RpdmUoJ3Nlc3Npb25Ecm9wZG93bicsIFsnY29uZmlnJyxcbiAgICAgICAgZnVuY3Rpb24gKGNvbmZpZykge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHJlc3RyaWN0OiAnRUEnLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBjb25maWcuU1JDX0ZPTERFUiArICcvY29tbW9uL3RlbXBsYXRlcy9zZXNzaW9uLWRyb3Bkb3duLmh0bWwnLCAgIFxuICAgICAgICAgICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IFwiPVwiXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudHMsIGF0dHJzKSB7XG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLmltZ19mb2xkZXIgPSBjb25maWcuUFJPRklMRV9JTUdfRk9MREVSO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogWyckc2NvcGUnLCBmdW5jdGlvbiAoJHNjb3BlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnVzZXIgPSAkc2NvcGUuZGF0YTtcbiAgICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIF0pOyAgICAgICBcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcblxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAnKS5kaXJlY3RpdmUoJ3Nob3dNb3JlJyxcbiAgICAgICAgWydjb25maWcnLCBmdW5jdGlvbiAoY29uZmlnKSB7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IGNvbmZpZy5TUkNfRk9MREVSICsgJ2NvbW1vbi90ZW1wbGF0ZXMvc2hvd01vcmUuaHRtbCcsXG4gICAgICAgICAgICAgICAgcmVzdHJpY3Q6ICdBJyxcbiAgICAgICAgICAgICAgICB0cmFuc2NsdWRlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICAgICAgICAgICdzaG93TW9yZUhlaWdodCc6ICdAJ1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogWyckc2NvcGUnLCAnJGVsZW1lbnQnLCAnJGludGVydmFsJywgZnVuY3Rpb24gKCRzY29wZSwgJGVsZW1lbnQsICRpbnRlcnZhbCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXhwYW5kZWQgPSBmYWxzZTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgJGludGVydmFsKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW5kZXJTdHlsZXMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIDMwMCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5leHBhbmRhYmxlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiByZW5kZXJTdHlsZXMoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCRlbGVtZW50LmhlaWdodCgpID49ICRzY29wZS5zaG93TW9yZUhlaWdodCAmJiAkc2NvcGUuZXhwYW5kZWQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5leHBhbmRhYmxlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5zaG93TGVzc1N0eWxlID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdtYXgtaGVpZ2h0JzogJHNjb3BlLnNob3dNb3JlSGVpZ2h0ICsgJ3B4JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnb3ZlcmZsb3cnOiAnaGlkZGVuJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfV0pO1xufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAnKVxuICAgICAgICAuZmlsdGVyKCdyZWR1Y2VCeScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChjb2xsZWN0aW9uLCBmaWVsZCkge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHJldHVybiBjb2xsZWN0aW9uLnJlZHVjZShmdW5jdGlvbihvdXRwdXQsIGN1cnJlbnQpe1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoIWZpZWxkRXhpc3RzKG91dHB1dCwgZmllbGQsIGN1cnJlbnRbZmllbGRdKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gb3V0cHV0LmNvbmNhdChjdXJyZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgICAgICAgICAgICAgICAgIH0sIFtdKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gZmllbGRFeGlzdHMoaGF5c3RhY2ssIGZpZWxkTmFtZSwgZmllbGRWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaGF5c3RhY2suc29tZShmdW5jdGlvbihlbCkge1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBlbFtmaWVsZE5hbWVdID09PSBmaWVsZFZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9KTsgXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTsgICAgICAgICAgICBcbiAgICAgICAgfSk7XG59KSgpO1xuXG4iLCIoZnVuY3Rpb24gKCkge1xuICAgIFxuICAgICBhbmd1bGFyLm1vZHVsZSgnYXBwJykuZmFjdG9yeSgncXVlcnlGYWN0b3J5JywgWyckbG9nJywgJyRjb29raWVzJywgJyRyb290U2NvcGUnLCAnY2FyZHNGYWN0b3J5JywgJ3N0YWNrc0ZhY3RvcnknLCAndGFnc0ZhY3RvcnknLCBxdWVyeUZhY3RvcnldKTtcbiAgICBcbiAgICBmdW5jdGlvbiBxdWVyeUZhY3RvcnkoJGxvZywgJGNvb2tpZXMsICRyb290U2NvcGUsIGNhcmRzRmFjdG9yeSwgc3RhY2tzRmFjdG9yeSwgdGFnc0ZhY3RvcnkpIHtcbiAgICAgICAgXG4gICAgICAgIHZhciBmYWN0b3J5ID0ge307XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogZ2V0IGFsbCBjYXJkcyBmcm9tIHNlcnZlciBmb3IgYSBnaXZlbiB1c2VyXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAcGFyYW0ganNvbiBwYXJhbXNcbiAgICAgICAgICogQHJldHVybnMgY2FyZHNGYWN0b3J5XG4gICAgICAgICAqIEBicm9hZGNhc3QgY2FyZHMgbGlzdFxuICAgICAgICAgKi9cbiAgICAgICAgZmFjdG9yeS5hbGwgPSBmdW5jdGlvbiAocGFyYW1zKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHBhcmFtcyA9IGdldEZpbHRlcnMocGFyYW1zLCBbJ29yZGVyJywgJ3N0YWNrJywgJ3RhZ3MnXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIHF1ZXJ5XG4gICAgICAgICAgICByZXR1cm4gY2FyZHNGYWN0b3J5XG4gICAgICAgICAgICAgICAgLnF1ZXJ5KHBhcmFtcywgZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBicm9hZGNhc3QocmVzcG9uc2UpOyAvLyB0ZWxsIHRoZSB3b3JsZFxuICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgICAgICAkbG9nLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgfSk7ICBcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBnZXQgY2FyZHMgdXNpbmcgc3RhY2sgZmlsdGVyc1xuICAgICAgICAgKiBcbiAgICAgICAgICogQHBhcmFtIGpzb24gcGFyYW1zXG4gICAgICAgICAqIEByZXR1cm5zIHN0YWNrc0ZhY3RvcnlcbiAgICAgICAgICogQGJyb2FkY2FzdCBjYXJkcyBsaXN0XG4gICAgICAgICAqL1xuICAgICAgICBmYWN0b3J5LmJ5U3RhY2sgPSBmdW5jdGlvbiAocGFyYW1zKSB7XG4gICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHBhcmFtcyA9IGdldEZpbHRlcnMocGFyYW1zLCBbJ29yZGVyJywgJ3N0YWNrJywgJ3RhZ3MnXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gc3RhY2tzRmFjdG9yeS5maWx0ZXIocGFyYW1zLCBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGJyb2FkY2FzdChyZXNwb25zZSk7IC8vIHRlbGwgdGhlIHdvcmxkXG4gICAgICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICAkbG9nLmVycm9yKGVycik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIGdldCBjYXJkcyB1c2luZyBjdXJyZW50IGZpbHRlcnNcbiAgICAgICAgICogXG4gICAgICAgICAqIEBwYXJhbSBqc29uIHBhcmFtc1xuICAgICAgICAgKiBAcmV0dXJucyBzdGFja3NGYWN0b3J5XG4gICAgICAgICAqIEBicm9hZGNhc3QgY2FyZHMgbGlzdFxuICAgICAgICAgKi9cbiAgICAgICAgZmFjdG9yeS5ieVRhZ3MgPSBmdW5jdGlvbiAocGFyYW1zKSB7XG4gICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHBhcmFtcyA9IGdldEZpbHRlcnMocGFyYW1zLCBbJ29yZGVyJywgJ3N0YWNrJywgJ3RhZ3MnXSk7XG4gICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiB0YWdzRmFjdG9yeS5maWx0ZXIocGFyYW1zLCBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGJyb2FkY2FzdChyZXNwb25zZSk7IC8vIHRlbGwgdGhlIHdvcmxkXG4gICAgICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICAkbG9nLmVycm9yKGVycik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICAgICAgICBcbiAgICAgICAgZnVuY3Rpb24gZ2V0RmlsdGVycyhwYXJhbXMsIGZpbHRlcnMpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYodHlwZW9mKHBhcmFtcykgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgcGFyYW1zID0ge307XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKGZpbHRlcnMuaW5jbHVkZXMoJ3RhZ3MnKSAmJiB0eXBlb2YoJGNvb2tpZXMuZ2V0KCd0YWdzW10nKSkgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgcGFyYW1zWyd0YWdzW10nXSA9ICRjb29raWVzLmdldE9iamVjdCgndGFnc1tdJykubWFwKGZ1bmN0aW9uKHgpeyByZXR1cm4geC5pZDsgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZihmaWx0ZXJzLmluY2x1ZGVzKCdzdGFjaycpICYmIHR5cGVvZigkY29va2llcy5nZXQoJ3N0YWNrJykpICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIHBhcmFtcy5zdGFjayA9ICRjb29raWVzLmdldE9iamVjdCgnc3RhY2snKS5pZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKGZpbHRlcnMuaW5jbHVkZXMoJ29yZGVyJykgJiYgdHlwZW9mKCRjb29raWVzLmdldCgnb3JkZXInKSkgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgcGFyYW1zLm9yZGVyID0gJGNvb2tpZXMuZ2V0T2JqZWN0KCdvcmRlcicpOyAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiBwYXJhbXM7XG4gICAgICAgIH1cbiAgICAgICAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUZWxsIGV2ZXJ5Ym9keSB3ZSBoYXZlIGEgcmVub3ZhdGVkIGxpc3RcbiAgICAgICAgICovXG4gICAgICAgIGZ1bmN0aW9uIGJyb2FkY2FzdChkYXRhKSB7XG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ2NhcmRzLWxvYWRlZCcsIGRhdGEpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gZmFjdG9yeTtcbiAgICB9ICAgIFxufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5ob21lJykuY29udHJvbGxlcignSG9tZUNvbnRyb2xsZXInLCBbJyRzY29wZScsIEhvbWVDb250cm9sbGVyXSk7XG5cbiAgICBmdW5jdGlvbiBIb21lQ29udHJvbGxlcigkc2NvcGUpIHtcbiAgICAgICAgICBcbiAgICB9XG59KSgpO1xuXG5cbiIsIihmdW5jdGlvbigpe1xuICAgIFxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuaG9tZScpLmNvbnRyb2xsZXIoJ0xpc3RDb250cm9sbGVyJywgWyckc2NvcGUnLCAnJGxvZycsICckY29va2llcycsICckZWxlbWVudCcsICdxdWVyeUZhY3RvcnknLCAnSG9tZUNvbnRleHRTZXJ2aWNlJywgTGlzdENvbnRyb2xsZXJdKTtcbiAgICBcbiAgICBmdW5jdGlvbiBMaXN0Q29udHJvbGxlcigkc2NvcGUsICRsb2csICRjb29raWVzLCAkZWxlbWVudCwgcXVlcnlGYWN0b3J5LCBIb21lQ29udGV4dFNlcnZpY2Upe1xuICAgICAgICBcbiAgICAgICAgJHNjb3BlLmV2ZW50cyA9IHt9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdheSB0byBrZWVwIHNpYmxpbmdzIGNvbm5lY3RlZCBhbmQgc2hhcmluZyBzY29wZVxuICAgICAgICAgKi9cbiAgICAgICAgJHNjb3BlLmNvbnRleHQgPSBIb21lQ29udGV4dFNlcnZpY2UuY29udGV4dDtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHZXQgY2FyZHMgbGlzdFxuICAgICAgICAgKi9cbiAgICAgICAgJHNjb3BlLmV2ZW50cy5sb2FkID0gZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIGdldCBkYXRhIGZyb20gc2VydmVyXG4gICAgICAgICAgICBxdWVyeUZhY3RvcnlcbiAgICAgICAgICAgICAgICAuYWxsKHBhcmFtcykuJHByb21pc2UudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICRsb2cuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICB9KTsgIFxuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgJHNjb3BlLmV2ZW50cy5sb2FkKCk7IC8vIHJ1biBhdCBwYWdlIGxvYWRcbiAgICAgICAgXG4gICAgICAgICRzY29wZS4kb24oJ2NhcmRzLWxvYWRlZCcsIGZ1bmN0aW9uKGV2dCwgcmVzcG9uc2UpIHtcbiAgICAgICAgICAgICRzY29wZS5jb250ZXh0LmNhcmRzID0gcmVzcG9uc2UuZGF0YTsgLy8gY2FyZHMgbGlzdFxuICAgICAgICAgICAgJHNjb3BlLmNvbnRleHQucGFnZXMgPSByZXNwb25zZTsgLy8gcGFnZXMgZGF0YSAgIFxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBIYW5kbGUgbGlzdCBvcmRlclxuICAgICAgICAgKi9cbiAgICAgICAgJHNjb3BlLiRvbignb3JkZXItY2hhbmdlZCcsIGZ1bmN0aW9uKGV2dCwgcGFyYW1zKSB7ICAgXG4gICAgICAgICAgICAkc2NvcGUuZXZlbnRzLmxvYWQoe29yZGVyOiBwYXJhbXN9KTsgLy8gcmVsb2FkIGNhcmRzXG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEhhbmRsZSBwYWdpbmF0aW9uXG4gICAgICAgICAqL1xuICAgICAgICAkc2NvcGUuJG9uKCdjYXJkcy1wYWdlLWNoYW5nZWQnLCBmdW5jdGlvbihldnQsIHBhcmFtcykge1xuICAgICAgICAgICAgJHNjb3BlLmV2ZW50cy5sb2FkKHBhcmFtcyk7IC8vIHJlbG9hZCBjYXJkc1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDcmVhdGUgY2FyZFxuICAgICAgICAgKi9cbiAgICAgICAgJHNjb3BlLiRvbignbmV3LWNhcmQnLCBmdW5jdGlvbihldnQsIGl0ZW0pIHtcbiAgICAgICAgICAgICRzY29wZS5jb250ZXh0LmNhcmRzLnVuc2hpZnQoaXRlbSk7XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFBpbiBjYXJkXG4gICAgICAgICAqL1xuICAgICAgICAkc2NvcGUuJG9uKCdwaW4tY2FyZCcsIGZ1bmN0aW9uKGV2dCwgaXRlbSkge1xuICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKGl0ZW0uc3RpY2t5KSB7XG4gICAgICAgICAgICAgICAgLy8gbm90IHN0aWNreSBhbnltb3JlXG4gICAgICAgICAgICAgICAgaXRlbS5zdGlja3kgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpdGVtLmNsYXNzID0gaXRlbS5jbGFzcyA/IGl0ZW0uY2xhc3MucmVwbGFjZShcInN0aWNreVwiLCBcIlwiKSA6IFwiXCI7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIHN0aWNreS4gUHV0IGl0IGZpcnN0XG4gICAgICAgICAgICAgICAgaXRlbS5zdGlja3kgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGl0ZW0uY2xhc3MgPSBpdGVtLmNsYXNzID8gaXRlbS5jbGFzcyArIFwiIHN0aWNreVwiIDogXCJzdGlja3lcIjsgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgbGV0IGluZGV4ID0gJHNjb3BlLmNvbnRleHQuY2FyZHMuaW5kZXhPZihpdGVtKTtcbiAgICAgICAgICAgICAgICAkc2NvcGUuY29udGV4dC5jYXJkcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgICAgICRzY29wZS5jb250ZXh0LmNhcmRzLnVuc2hpZnQoaXRlbSk7XG4gICAgICAgICAgICB9IFxuICAgICAgICB9KTtcbiAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIERlbGV0ZSBjYXJkXG4gICAgICAgICAqL1xuICAgICAgICAkc2NvcGUuJG9uKCdkZWxldGUtY2FyZCcsIGZ1bmN0aW9uKGV2dCwgaXRlbSkge1xuICAgICAgICAgICAgbGV0IGluZGV4ID0gJHNjb3BlLmNvbnRleHQuY2FyZHMuaW5kZXhPZihpdGVtKTtcbiAgICAgICAgICAgICRzY29wZS5jb250ZXh0LmNhcmRzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFVwZGF0ZSBjYXJkXG4gICAgICAgICAqL1xuICAgICAgICAkc2NvcGUuJG9uKCd1cGRhdGUtY2FyZCcsIGZ1bmN0aW9uKGV2dCwgb3JpZ2luYWwsIG5ld0NhcmQpIHtcbiAgICAgICAgICAgIGxldCBpbmRleCA9ICRzY29wZS5jb250ZXh0LmNhcmRzLmluZGV4T2Yob3JpZ2luYWwpO1xuICAgICAgICAgICAgYW5ndWxhci5leHRlbmQoJHNjb3BlLmNvbnRleHQuY2FyZHNbaW5kZXhdLCBuZXdDYXJkKTtcbiAgICAgICAgfSk7XG4gICAgfVxufSkoKTsiLCIoZnVuY3Rpb24oKXtcbiAgICBcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmhvbWUnKS5jb250cm9sbGVyKCdTZWFyY2hDb250cm9sbGVyJywgWyckc2NvcGUnLCAnSG9tZUNvbnRleHRTZXJ2aWNlJywgU2VhcmNoQ29udHJvbGxlcl0pO1xuICAgIFxuICAgIGZ1bmN0aW9uIFNlYXJjaENvbnRyb2xsZXIoJHNjb3BlLCBIb21lQ29udGV4dFNlcnZpY2Upe1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdheSB0byBrZWVwIHNpYmxpbmdzIGNvbm5lY3RlZCBhbmQgc2hhcmluZyBzY29wZVxuICAgICAgICAgKi9cbiAgICAgICAgJHNjb3BlLmNvbnRleHQgPSBIb21lQ29udGV4dFNlcnZpY2UuY29udGV4dDtcbiAgICB9XG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5ob21lJylcbiAgICAgICAgLmZpbHRlcignaGlnaGxpZ2h0VGV4dCcsIGZ1bmN0aW9uKCRzY2UpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAodGV4dCwgcGhyYXNlKSB7XG4gICAgICAgICAgICAgICAgbGV0IGhpZ2hsaWdodGVkID0gcGhyYXNlXG4gICAgICAgICAgICAgICAgICAgICAgICA/IHRleHQucmVwbGFjZShuZXcgUmVnRXhwKCcoJyArIHBocmFzZSArICcpJywgJ2dpJyksICc8c3BhbiBjbGFzcz1cImhpZ2hsaWdodC10ZXh0XCI+JDE8L3NwYW4+JylcbiAgICAgICAgICAgICAgICAgICAgICAgIDogdGV4dDtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHJldHVybiAkc2NlLnRydXN0QXNIdG1sKGhpZ2hsaWdodGVkKTtcbiAgICAgICAgICAgIH07ICAgICAgICAgICAgXG4gICAgICAgIH0pO1xufSkoKTtcblxuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcC5ob21lJykuc2VydmljZSgnSG9tZUNvbnRleHRTZXJ2aWNlJywgZnVuY3Rpb24oKXtcbiAgICB0aGlzLmNvbnRleHQgPSB7XG4gICAgICAgIGNhcmRzOiBbXSxcbiAgICAgICAgcXVlcnk6ICcnXG4gICAgfTtcbn0pOyIsIihmdW5jdGlvbiAoKSB7XG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5zdGFja3MnKS5kaXJlY3RpdmUoJ3N0YWNrRGVzY3JpcHRpb24nLCBbJ2NvbmZpZycsXG4gICAgICAgIGZ1bmN0aW9uIChjb25maWcpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcmVzdHJpY3Q6ICdFQScsXG4gICAgICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogY29uZmlnLlNSQ19GT0xERVIgKyAnc3RhY2tzL3RlbXBsYXRlcy9zdGFjay1kZXNjcmlwdGlvbi5odG1sJyxcbiAgICAgICAgICAgICAgICBzY29wZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBbJyRzY29wZScsICckcm9vdFNjb3BlJywgJyRjb29raWVzJywgJyRlbGVtZW50JywgJ3F1ZXJ5RmFjdG9yeScsIFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoJHNjb3BlLCAkcm9vdFNjb3BlLCAkY29va2llcywgJGVsZW1lbnQsIHF1ZXJ5RmFjdG9yeSkge1xuICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmV2ZW50cyA9IHt9O1xuICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAqIEZpbHRlciBieSBzdGFja1xuICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRvbignc3RhY2stc2VsZWN0ZWQnLCBmdW5jdGlvbihldnQsIHN0YWNrKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHByb3ZpZGUgaW5mbyB0byB2aWV3XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuY29udGV4dC5zdGFjayA9IHN0YWNrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAvLyByZWZyZXNoIGFuaW1hdGlvbiAod2hlbiBlbGVtZW50IGFscmVhZHkgdmlzaWJsZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICRlbGVtZW50LmZpbmQoJy5zdGFjay1kZXNjcmlwdGlvbicpLmFkZENsYXNzKCdmbGlwSW5YJyk7XG4gICAgICAgICAgICAgICAgICAgICAgIH0pOyAgICBcblxuICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICogQ2xlYXIgc3RhY2sgZGVzY3JpcHRpb24gYW5pbWF0aW9uIGNsYXNzIHdoZW4gZmluaXNoZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICRlbGVtZW50Lm9uKCd3ZWJraXRBbmltYXRpb25FbmQgbW96QW5pbWF0aW9uRW5kIE1TQW5pbWF0aW9uRW5kIG9hbmltYXRpb25lbmQgYW5pbWF0aW9uZW5kJywgJy5zdGFjay1kZXNjcmlwdGlvbicsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcyhcImZsaXBJblhcIik7XG4gICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgIGlmKCRjb29raWVzLmdldChcInN0YWNrXCIpKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHByb3ZpZGUgaW5mbyB0byB2aWV3XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuY29udGV4dC5zdGFjayA9ICRjb29raWVzLmdldE9iamVjdChcInN0YWNrXCIpOyAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICogXG4gICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXZlbnRzLnJlbW92ZVN0YWNrRmlsdGVyID0gZnVuY3Rpb24oc3RhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5jb250ZXh0LnN0YWNrID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICRjb29raWVzLnJlbW92ZSgnc3RhY2snKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnc3RhY2stdW5zZWxlY3RlZCcsIHN0YWNrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAqIFxuICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmV2ZW50cy5lZGl0U3RhY2sgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICBdKTtcbn0pKCk7IiwiKGZ1bmN0aW9uKCl7XG4gICAgXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5zdGFja3MnKS5kaXJlY3RpdmUoJ3N0YWNrTGlzdFBhbmVsJywgWydjb25maWcnLCAnJGNvb2tpZXMnLCAncXVlcnlGYWN0b3J5JywgZnVuY3Rpb24oY29uZmlnLCAkY29va2llcywgcXVlcnlGYWN0b3J5KXtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICAgICAgICAgIHNjb3BlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBjb25maWcuU1JDX0ZPTERFUiArICdzdGFja3MvdGVtcGxhdGVzL3N0YWNrLWxpc3QtcGFuZWwuaHRtbCcsXG4gICAgICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSwgICAgICAgXG4gICAgICAgICAgICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLmNvbnRleHQuaW1nX2ZvbGRlciA9IGNvbmZpZy5QUk9GSUxFX0lNR19GT0xERVI7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBzY29wZS5jb250ZXh0LmN1cnJlbnRfc3RhY2sgPSAkY29va2llcy5nZXRPYmplY3QoXCJzdGFja1wiKTsgXG4gICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBVbnNlbGVjdCBzdGFja1xuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuJG9uKCdzdGFjay11bnNlbGVjdGVkJyxmdW5jdGlvbihzdGFjaykge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBzY29wZS5jb250ZXh0LmN1cnJlbnRfc3RhY2sgPSBudWxsOyAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmZpbmQoJy5saXN0LWdyb3VwLWl0ZW0nKS5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHF1ZXJ5IHJlc3VsdHNcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXJ5RmFjdG9yeS5hbGwoKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBbJyRzY29wZScsICckcm9vdFNjb3BlJywgJyRsb2cnLCAnJGNvb2tpZXMnLCAnY29uZmlnJywgJ3N0YWNrc0ZhY3RvcnknLCAncXVlcnlGYWN0b3J5JywgJ01vZGFsU2VydmljZScsIFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbigkc2NvcGUsICRyb290U2NvcGUsICRsb2csICRjb29raWVzLCBjb25maWcsIHN0YWNrc0ZhY3RvcnksIHF1ZXJ5RmFjdG9yeSwgTW9kYWxTZXJ2aWNlKSB7XG4gICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5jb250ZXh0ID0ge307XG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXZlbnRzID0ge307XG4gICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICogR2V0IHN0YWNrIGxpc3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmNvbnRleHQuc3RhY2tzID0gc3RhY2tzRmFjdG9yeS5xdWVyeSgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIENyZWF0ZSBuZXcgc3RhY2tcbiAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmV2ZW50cy5hZGROZXcgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBNb2RhbFNlcnZpY2Uuc2hvd01vZGFsKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IGNvbmZpZy5TUkNfRk9MREVSICsgXCJzdGFja3MvdGVtcGxhdGVzL21vZGFscy9uZXctc3RhY2suaHRtbFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBcIk5ld1N0YWNrQ29udHJvbGxlclwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkudGhlbihmdW5jdGlvbihtb2RhbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RhbC5lbGVtZW50Lm1vZGFsKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFsLmNsb3NlLnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0KSB7ICAgIFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcHJlcGFyZSBkYXRhIHRvIHN1Ym1pdCB0byBzZXJ2ZXIgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHN0YWNrID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBtb2RhbC5zY29wZS5mb3JtLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBtb2RhbC5zY29wZS5mb3JtLmRlc2NyaXB0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhY2tzRmFjdG9yeS5zYXZlKHN0YWNrKS4kcHJvbWlzZS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBlbW1pdCBldmVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFjay5pZCA9IHJlc3BvbnNlLmlkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ25ldy1zdGFjaycsIHN0YWNrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFkZCB0byBzdGFja1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuc3RhY2tzLnVuc2hpZnQoc3RhY2spO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkbG9nLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkbG9nLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICogRmlsdGVyIGJ5IHN0YWNrXG4gICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5ldmVudHMuZmlsdGVyID0gZnVuY3Rpb24oJGV2ZW50LCBzdGFjaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBsaW5rID0gJCgkZXZlbnQuY3VycmVudFRhcmdldCk7XG4gICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmsuY2xvc2VzdCgndWwnKS5maW5kKCcubGlzdC1ncm91cC1pdGVtJykucmVtb3ZlQ2xhc3MoJ3NlbGVjdGVkJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGluay5wYXJlbnQoKS5hZGRDbGFzcygnc2VsZWN0ZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcGVyc2lzdCBmaWx0ZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkY29va2llcy5wdXRPYmplY3QoJ3N0YWNrJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogc3RhY2suaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHN0YWNrLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBzdGFjay5kZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHF1ZXJ5IHJlc3VsdHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWVyeUZhY3RvcnkuYnlTdGFjayh7c3RhY2tfaWQ6IHN0YWNrLmlkfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGVsbCB0aGUgd29ybGRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ3N0YWNrLXNlbGVjdGVkJywgc3RhY2spO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgfTtcbiAgICB9XSk7XG59KSgpOyIsIihmdW5jdGlvbigpe1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuc3RhY2tzJykuZmFjdG9yeSgnc3RhY2tzRmFjdG9yeScsIFsnJHJlc291cmNlJywgJ2NvbmZpZycsIGZ1bmN0aW9uICgkcmVzb3VyY2UsIGNvbmZpZykge1xuICAgICAgICByZXR1cm4gJHJlc291cmNlKGNvbmZpZy5hcGkgKyAnL3N0YWNrcy86aWQnLCB7IGlkOiAnQF9pZCcsIHN0YWNrX2lkOiAnQHN0YWNrX2lkJyB9LCB7XG4gICAgICAgICAgICB1cGRhdGU6IHtcbiAgICAgICAgICAgICAgbWV0aG9kOiAnUFVUJyBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmaWx0ZXI6IHtcbiAgICAgICAgICAgICAgdXJsOiBjb25maWcuYXBpICsgJy9zdGFja3MvOnN0YWNrX2lkL2NhcmRzJywgXG4gICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcgXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pOyBcbiAgICB9XSk7XG59KSgpO1xuXG4iLCIoZnVuY3Rpb24gKCkge1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAudGFncycpLmRpcmVjdGl2ZSgnY3VycmVudFRhZ3MnLCBbJ2NvbmZpZycsXG4gICAgICAgIGZ1bmN0aW9uIChjb25maWcpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcmVzdHJpY3Q6ICdFQScsXG4gICAgICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogY29uZmlnLlNSQ19GT0xERVIgKyAndGFncy90ZW1wbGF0ZXMvY3VycmVudC10YWdzLmh0bWwnLFxuICAgICAgICAgICAgICAgIHNjb3BlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJyRjb29raWVzJywgJ3F1ZXJ5RmFjdG9yeScsIGZ1bmN0aW9uICgkc2NvcGUsICRjb29raWVzLCBxdWVyeUZhY3RvcnkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXZlbnRzID0ge307XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICogQ3VycmVudCB0YWdzIGZpbHRlcnNcbiAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXZlbnRzLnByaW50Q3VycmVudFRhZ3MgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgbGV0IGN1cnJlbnRfY29va2llcyA9ICRjb29raWVzLmdldE9iamVjdCgndGFnc1tdJyk7XG4gICAgICAgICAgICAgICAgICAgICAgIGlmKCB0eXBlb2YoY3VycmVudF9jb29raWVzKSAhPT0gJ3VuZGVmaW5lZCcgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuY29udGV4dC50YWdfZmlsdGVycyA9IGN1cnJlbnRfY29va2llcztcbiAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgIC8vIGFkZCBvbmUgbW9yZVxuICAgICAgICAgICAgICAgICAgICRzY29wZS4kb24oJ3RhZy1maWx0ZXItYWRkZWQnLCBmdW5jdGlvbihldnQsIHRhZykge1xuXG4gICAgICAgICAgICAgICAgICAgICAgIHF1ZXJ5RmFjdG9yeS5ieVRhZ3MoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuY29udGV4dC50YWdfZmlsdGVycy51bnNoaWZ0KHRhZyk7XG4gICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAvLyBEcmF3IHRhZyBmaWx0ZXJzIG9uIHBhZ2UgbG9hZFxuICAgICAgICAgICAgICAgICAgICRzY29wZS5ldmVudHMucHJpbnRDdXJyZW50VGFncygpOyBcblxuICAgICAgICAgICAgICAgICAgICRzY29wZS5ldmVudHMucmVtb3ZlVGFnRmlsdGVyID0gZnVuY3Rpb24oZXZlbnQsIGluZGV4LCB0YWcpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAvLyByZW1vdmUgZnJvbSB2aWV3XG4gICAgICAgICAgICAgICAgICAgICAgICQoZXZlbnQuY3VycmVudFRhcmdldCkuY2xvc2VzdCgnbGknKS5yZW1vdmVDbGFzcygnYW5pbWF0ZWQnKTsgLy8gbm8gaGlkZSBhbmltYXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmNvbnRleHQudGFnX2ZpbHRlcnMuc3BsaWNlKGluZGV4LCAxKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAvLyByZW1vdmUgdGFnIGZyb20gY29va2llc1xuICAgICAgICAgICAgICAgICAgICAgICBsZXQgY3VycmVudF9jb29raWVzID0gJGNvb2tpZXMuZ2V0T2JqZWN0KCd0YWdzW10nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNvb2tpZV9pbmRleCA9ICQuaW5BcnJheSggdGFnLCBjdXJyZW50X2Nvb2tpZXMgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudF9jb29raWVzLnNwbGljZShjb29raWVfaW5kZXgsIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAkY29va2llcy5wdXRPYmplY3QoJ3RhZ3NbXScsIGN1cnJlbnRfY29va2llcyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgLy8gcXVlcnlcbiAgICAgICAgICAgICAgICAgICAgICAgcXVlcnlGYWN0b3J5LmJ5VGFncygpO1xuICAgICAgICAgICAgICAgICAgIH0gICAgIFxuICAgICAgICAgICAgICAgIH1dXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgXSk7XG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC50YWdzJykuZGlyZWN0aXZlKCduZXdUYWcnLCBbJ2NvbmZpZycsICd0YWdzRmFjdG9yeScsICckcm9vdFNjb3BlJywgJyRhbmltYXRlJyxcbiAgICAgICAgZnVuY3Rpb24gKGNvbmZpZywgdGFnc0ZhY3RvcnksICRyb290U2NvcGUsICRhbmltYXRlKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcmVzdHJpY3Q6ICdFQScsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IGNvbmZpZy5TUkNfRk9MREVSICsgJy90YWdzL3RlbXBsYXRlcy9uZXctdGFnLmh0bWwnLFxuICAgICAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgICAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgICAgICAgICAgY2FyZDogXCI9ZGF0YVwiXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBzY29wZS5ldmVudHMgPSB7fTtcbiAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvLyBhcmNoZXR5cGVcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUudGFnID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogJydcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBJbml0aWFsIHdpZGdldCBzdGF0ZVxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuZGlzcGxheSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIEhpZGUgd2lkZ2V0XG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBzY29wZS5ldmVudHMuc2hvdyA9IGZ1bmN0aW9uKCkgeyBcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLmRpc3BsYXkgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUudmlzaWJpbGl0eSA9ICd2aXNpYmxlJzsgLy8gY3NzIGNsYXNzXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuZmluZCgnaW5wdXQnKS5mb2N1cygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgMC41KTsgLy8gdGltZSB3aWxsIHZhcnkgYWNjb3JkaW5nIHRvIGNzcyBydWxlXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBIaWRlIHdpZGdldFxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuZXZlbnRzLmhpZGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLmRpc3BsYXkgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLnZpc2liaWxpdHkgPSAnJzsgLy8gY3NzIGNsYXNzXG4gICAgICAgICAgICAgICAgICAgICAgICBzY29wZS50YWcubmFtZSA9ICcnOyAvLyByZXNldCBmaWVsZFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogY3JlYXRlcyBhIHRhZyBhbmQgYXR0YWNoIGl0IHRvIGN1cnJlbnQgY2FyZFxuICAgICAgICAgICAgICAgICAgICAgKiBcbiAgICAgICAgICAgICAgICAgICAgICogQHJldHVybnMgdm9pZFxuICAgICAgICAgICAgICAgICAgICAgKiBAYnJvYWRjYXN0cyBldmVudFxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuZXZlbnRzLmFkZE5ldyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoc2NvcGUudGFnLm5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgdGFnID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXJkX2lkOiBzY29wZS5jYXJkLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBzY29wZS50YWcubmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFnc0ZhY3Rvcnkuc2F2ZSh0YWcsIGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhZy5pZCA9IHJlc3BvbnNlLmlkOyAvLyBhcHBlbmQgdGFnIGlkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLmV2ZW50cy5mbGFzaENsYXNzKGVsZW1lbnQsICdvaycpOyAvLyB1eCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFkZCB0YWcgYXMgdGhlIGxhc3QgdmlzaWJsZSBvZiBYIHRhZ3NcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYodHlwZW9mKHNjb3BlLmNhcmQudGFncykgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFkZCB0YWcgdG8gdGhlIGxpc3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLmNhcmQudGFncy5zcGxpY2Uoc2NvcGUubWF4X251bV90YWdzLTEsIDAsIHRhZyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjcmVhdGUgdGhlIGxpc3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLmNhcmQudGFncyA9IFt0YWddO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY29wZS5ldmVudHMuZmxhc2hDbGFzcyhlbGVtZW50LCAnZXJyb3InKTsgLy8gdXggXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUudGFnLm5hbWUgPSAnJzsgLy8gcmVzZXQgZmllbGRcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBLZXkgZXZlbnQgKEVudGVyKVxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5iaW5kKFwia2V5ZG93biBrZXlwcmVzc1wiLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGV2ZW50LndoaWNoID09PSAxMykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLmV2ZW50cy5hZGROZXcoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBBZGRzIGFuZCByZW1vdmVzIGEgY2xhc3NcbiAgICAgICAgICAgICAgICAgICAgICogXG4gICAgICAgICAgICAgICAgICAgICAqIEBwYXJhbSBzdHJpbmcgY2xhc3NOYW1lXG4gICAgICAgICAgICAgICAgICAgICAqIEByZXR1cm5zIHZvaWRcbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLmV2ZW50cy5mbGFzaENsYXNzID0gZnVuY3Rpb24oZWxlbWVudCwgY2xhc3NOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgJGFuaW1hdGUuYWRkQ2xhc3MoZWxlbWVudCwgY2xhc3NOYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJGFuaW1hdGUucmVtb3ZlQ2xhc3MoZWxlbWVudCwgY2xhc3NOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgNTAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICBdKTtcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmhvbWUnKS5kaXJlY3RpdmUoJ3RhZ0Nsb3VkJywgWydjb25maWcnLCBcbiAgICAgICAgZnVuY3Rpb24gKGNvbmZpZykge1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHJlc3RyaWN0OiAnRUEnLFxuICAgICAgICAgICAgICAgIHNjb3BlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsICAgICBcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogY29uZmlnLlNSQ19GT0xERVIgKyAnL3RhZ3MvdGVtcGxhdGVzL3RhZy1jbG91ZC5odG1sJyxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBbJyRzY29wZScsICckY29va2llcycsICckcm9vdFNjb3BlJywgJ3JlZHVjZUJ5RmlsdGVyJywgZnVuY3Rpb24gKCRzY29wZSwgJGNvb2tpZXMsICRyb290U2NvcGUsIHJlZHVjZUJ5RmlsdGVyKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmV2ZW50cyA9IHt9O1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogS2VlcCB0cmFjayBvZiBjYXJkIGxpc3QgY2hhbmdlc1xuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRvbignY2FyZHMtbG9hZGVkJywgZnVuY3Rpb24gKGV2dCwgY29sbGVjdGlvbikge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZih0eXBlb2YoY29sbGVjdGlvbi5kYXRhKSA9PT0gJ3VuZGVmaW5lZCcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBleGNsdWRlIGNhcmQgd2l0aCBubyB0YWdzXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY2FyZHMgPSBjb2xsZWN0aW9uLmRhdGEuZmlsdGVyKGZ1bmN0aW9uIChjYXJkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhcmQudGFncyA/IGNhcmQudGFncy5sZW5ndGggPiAwIDogZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGV4dHJhY3QgdGFncyBmcm9tIGNhcmRcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCB0YWdzID0gY2FyZHMubWFwKGZ1bmN0aW9uIChjYXJkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoYW5ndWxhci50b0pzb24oY2FyZC50YWdzKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gbWVyZ2UgdGFncyBpbiBmbGF0dGVuIGFycmF5XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgbWVyZ2VkID0gW10uY29uY2F0LmFwcGx5KFtdLCB0YWdzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGVsaW1pbmF0ZSBkdXBsaWNhdGVzIGFuZCBzZXJ2ZSBhcnJheSB0byB2aWV3XG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUudGFncyA9IHJlZHVjZUJ5RmlsdGVyKG1lcmdlZCwgJ2lkJyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmV2ZW50cy5maWx0ZXIgPSBmdW5jdGlvbih0YWcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGN1cnJlbnRfY29va2llcyA9ICRjb29raWVzLmdldE9iamVjdCgndGFnc1tdJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKCB0eXBlb2YoY3VycmVudF9jb29raWVzKSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBmaXJzdCBvbmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50X2Nvb2tpZXMgPSBbdGFnXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYXZvaWQgZHVwbGljYXRlc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRfY29va2llcyA9IGFuZ3VsYXIuZnJvbUpzb24oY3VycmVudF9jb29raWVzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiggY3VycmVudF9jb29raWVzLm1hcChmdW5jdGlvbihlKSB7IHJldHVybiBlLmlkOyB9KS5pbmRleE9mKHRhZy5pZCkgPT09IC0xICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50X2Nvb2tpZXMucHVzaCh0YWcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gYWRkIHRhZyB0byBjdXJyZW50IHRhZ3MgbGlzdFxuICAgICAgICAgICAgICAgICAgICAgICAgJGNvb2tpZXMucHV0T2JqZWN0KCd0YWdzW10nLCBjdXJyZW50X2Nvb2tpZXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzb21lb25lIGVsc2Ugd2lsbCBtYWtlIHRoZSBxdWVyeVxuICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCd0YWctZmlsdGVyLWFkZGVkJywgdGFnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1dXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgXSk7XG59KSgpOyIsIihmdW5jdGlvbigpe1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAudGFncycpLmZhY3RvcnkoJ3RhZ3NGYWN0b3J5JywgWyckcmVzb3VyY2UnLCAnY29uZmlnJywgZnVuY3Rpb24gKCRyZXNvdXJjZSwgY29uZmlnKSB7XG4gICAgICAgIHJldHVybiAkcmVzb3VyY2UoY29uZmlnLmFwaSArICcvdGFncy86aWQnLCB7IGlkOiAnQGlkJywgY2FyZF9pZDogJ0BjYXJkX2lkJyB9LCB7XG4gICAgICAgICAgICBzYXZlOiB7XG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsIFxuICAgICAgICAgICAgICAgIHVybDogY29uZmlnLmFwaSArICcvY2FyZHMvOmNhcmRfaWQvdGFncycgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZmlsdGVyOiB7XG4gICAgICAgICAgICAgIHVybDogY29uZmlnLmFwaSArICcvY2FyZHMvdGFncy9hbGwnLCBcbiAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7IFxuICAgIH1dKTtcbn0pKCk7XG5cbiIsIihmdW5jdGlvbigpIHtcblxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuY2FyZHMnKS5jb250cm9sbGVyKCdFZGl0Q2FyZENvbnRyb2xsZXInLCBbJyRzY29wZScsICdkYXRhJywgJ2Nsb3NlJywgRWRpdENhcmRDb250cm9sbGVyXSk7XG4gICAgXG4gICAgZnVuY3Rpb24gRWRpdENhcmRDb250cm9sbGVyKCRzY29wZSwgZGF0YSwgY2xvc2UpIHtcblxuICAgICAgICAkc2NvcGUuZm9ybSA9IHt9O1xuICAgICAgICAkc2NvcGUuZm9ybS5uYW1lID0gZGF0YS5jYXJkLm5hbWU7XG4gICAgICAgICRzY29wZS5mb3JtLmNvbnRlbnQgPSBkYXRhLmNhcmQuY29udGVudDtcblxuICAgICAgICAkc2NvcGUuY2xvc2UgPSBmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgIFxuICAgICAgICAgICAgY2xvc2UocmVzdWx0LCAyMDApOyAvLyBjbG9zZSwgYnV0IGdpdmUgMjAwbXMgZm9yIGJvb3RzdHJhcCB0byBhbmltYXRlXG4gICAgICAgIH07XG4gICAgfTtcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcblxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuaG9tZScpLmNvbnRyb2xsZXIoJ1llc05vQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJ2RhdGEnLCAnY2xvc2UnLCBmdW5jdGlvbiAoJHNjb3BlLCBkYXRhLCBjbG9zZSkge1xuICAgICAgICAgICBcbiAgICAgICAgICAgICRzY29wZS50aXRsZSA9IGRhdGEudGl0bGU7XG4gICAgICAgICAgICAkc2NvcGUuY29udGVudCA9IGRhdGEuY29udGVudDtcbiAgICAgICAgICAgXG4gICAgICAgICAgICAkc2NvcGUuY2xvc2UgPSBmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgY2xvc2UocmVzdWx0LCAyMDApOyAvLyBjbG9zZSwgYnV0IGdpdmUgMjAwbXMgZm9yIGJvb3RzdHJhcCB0byBhbmltYXRlXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XSk7XG59KSgpOyIsIihmdW5jdGlvbigpIHtcblxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuaG9tZScpLmNvbnRyb2xsZXIoJ01hcmtkb3duQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJ2RhdGEnLCAnY2xvc2UnLCBNYXJrZG93bkNvbnRyb2xsZXJdKTtcbiAgICBcbiAgICBmdW5jdGlvbiBNYXJrZG93bkNvbnRyb2xsZXIoJHNjb3BlLCBkYXRhLCBjbG9zZSkge1xuXG4gICAgICAgICRzY29wZS50aXRsZSA9IGRhdGEuY2FyZC5uYW1lO1xuICAgICAgICAkc2NvcGUuY29udGVudCA9IGRhdGEuY2FyZC5jb250ZW50O1xuXG4gICAgICAgICRzY29wZS5kaXNtaXNzTW9kYWwgPSBmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgICBjbG9zZShyZXN1bHQsIDIwMCk7IC8vIGNsb3NlLCBidXQgZ2l2ZSAyMDBtcyBmb3IgYm9vdHN0cmFwIHRvIGFuaW1hdGVcbiAgICAgICAgfTtcbiAgICB9O1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG4gICAgXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5zdGFja3MnKS5jb250cm9sbGVyKCdOZXdTdGFja0NvbnRyb2xsZXInLCBbJyRzY29wZScsICckZWxlbWVudCcsICdjbG9zZScsIE5ld1N0YWNrQ29udHJvbGxlcl0pO1xuICAgIFxuICAgIGZ1bmN0aW9uIE5ld1N0YWNrQ29udHJvbGxlcigkc2NvcGUsICRlbGVtZW50LCBjbG9zZSkge1xuICAgICAgIFxuICAgICAgICAkc2NvcGUuZm9ybSA9IHtcbiAgICAgICAgICAgIG5hbWU6ICcnLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICcnXG4gICAgICAgIH07XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBLZXkgZXZlbnQgKEVudGVyKVxuICAgICAgICAgKi9cbiAgICAgICAgJGVsZW1lbnQuZmluZCgnaW5wdXQnKS5iaW5kKFwia2V5ZG93biBrZXlwcmVzc1wiLCBmdW5jdGlvbiAoZXZlbnQpIHtcblxuICAgICAgICAgICAgaWYoZXZlbnQud2hpY2ggPT09IDEzKSB7XG4gICAgICAgICAgICAgICAgJGVsZW1lbnQubW9kYWwoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICAkc2NvcGUuY2xvc2UodHJ1ZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgICRzY29wZS5jbG9zZSA9IGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgXG4gICAgICAgICAgICBjbG9zZShyZXN1bHQsIDIwMCk7IC8vIGNsb3NlLCBidXQgZ2l2ZSAyMDBtcyBmb3IgYm9vdHN0cmFwIHRvIGFuaW1hdGVcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICBcbiAgICB9O1xufSkoKTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
