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
angular.module('app.home').config(["$routeProvider", function($routeProvider) {

}]);
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
                controller: ['$scope', '$rootScope', '$cookies', '$element', 
                    function ($scope, $rootScope, $cookies, $element) {
                       
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
                        * Uncheck current stack filter
                        */
                       $scope.events.removeStackFilter = function(stack) {
                           $rootScope.$broadcast('stack-unselected', stack);
                       }
                       
                       $scope.$on('stack-unselected', function(stack) {
                           $scope.context.stack = null;
                       });
                       
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
                    * On unselect stack
                    */
                   scope.$on('stack-unselected', function (stack) {

                        // remove from UI
                        element.find('.list-group-item').removeClass('selected');

                        // remove from cookie
                        $cookies.remove('stack');

                        // remove from scope
                        scope.context.current_stack = null;

                        // query new results
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC1jb25maWcuanMiLCJjYXJkcy9tb2R1bGUuanMiLCJjb21tb24vbW9kdWxlLmpzIiwiaG9tZS9tb2R1bGUuanMiLCJzdGFja3MvbW9kdWxlLmpzIiwidGFncy9tb2R1bGUuanMiLCJjYXJkcy9jYXJkcy1yb3V0ZS5qcyIsImNvbW1vbi9hcHAtcm91dGUuanMiLCJsb2dpbi9sb2dpbi5qcyIsImhvbWUvaG9tZS1yb3V0ZS5qcyIsInN0YWNrcy9ob21lLXJvdXRlLmpzIiwiY2FyZHMvZGlyZWN0aXZlcy9jYXJkLmpzIiwiY2FyZHMvZGlyZWN0aXZlcy9uZXctY2FyZC5qcyIsImNhcmRzL2RpcmVjdGl2ZXMvb3JkZXItYnkuanMiLCJjYXJkcy9kaXJlY3RpdmVzL3BhZ2luYXRlLWNhcmRzLmpzIiwiY2FyZHMvc2VydmljZXMvY2FyZHMtZmFjdG9yeS5qcyIsImNvbW1vbi9jb250cm9sbGVycy9oZWFkZXItY29udHJvbGxlcnMuanMiLCJjb21tb24vY29udHJvbGxlcnMvbGF5b3V0LWNvbnRyb2xsZXJzLmpzIiwiY29tbW9uL2RpcmVjdGl2ZXMvYXV0b2ZvY3VzLmpzIiwiY29tbW9uL2RpcmVjdGl2ZXMvZWxhc3RpY0FyZWEuanMiLCJjb21tb24vZGlyZWN0aXZlcy9oYXNodGFnaWZ5LmpzIiwiY29tbW9uL2RpcmVjdGl2ZXMvc2Vzc2lvbkRyb3Bkb3duLmpzIiwiY29tbW9uL2RpcmVjdGl2ZXMvc2hvd01vcmUuanMiLCJjb21tb24vZmlsdGVycy9yZWR1Y2VCeS5qcyIsImNvbW1vbi9zZXJ2aWNlcy9xdWVyeS1mYWN0b3J5LmpzIiwiaG9tZS9jb250cm9sbGVycy9ob21lLWNvbnRyb2xsZXIuanMiLCJob21lL2NvbnRyb2xsZXJzL2xpc3QtY29udHJvbGxlci5qcyIsImhvbWUvY29udHJvbGxlcnMvc2VhcmNoLWNvbnRyb2xsZXIuanMiLCJob21lL2ZpbHRlcnMvaGlnaGxpZ2h0VGV4dC5qcyIsImhvbWUvc2VydmljZXMvaG9tZS1jb250ZXh0LmpzIiwic3RhY2tzL2RpcmVjdGl2ZXMvc3RhY2stZGVzY3JpcHRpb24uanMiLCJzdGFja3MvZGlyZWN0aXZlcy9zdGFjay1saXN0LXBhbmVsLmpzIiwic3RhY2tzL3NlcnZpY2VzL3N0YWNrcy1mYWN0b3J5LmpzIiwidGFncy9kaXJlY3RpdmVzL2N1cnJlbnQtdGFncy5qcyIsInRhZ3MvZGlyZWN0aXZlcy9uZXctdGFnLmpzIiwidGFncy9kaXJlY3RpdmVzL3RhZy1jbG91ZC5qcyIsInRhZ3Mvc2VydmljZS90YWdzLWZhY3RvcnkuanMiLCJjYXJkcy9jb250cm9sbGVycy9tb2RhbHMvZWRpdC1jYXJkLWNvbnRyb2xsZXIuanMiLCJjb21tb24vY29udHJvbGxlcnMvbW9kYWxzL3llcy1uby1jb250cm9sbGVyLmpzIiwiaG9tZS9jb250cm9sbGVycy9tb2RhbHMvbWFya2Rvd24tY29udHJvbGxlci5qcyIsInN0YWNrcy9jb250cm9sbGVycy9tb2RhbHMvbmV3LXN0YWNrLWNvbnRyb2xsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQUdBLFFBQUEsT0FBQSxjQUFBO0tBQ0EsU0FBQSxVQUFBO1FBQ0EsT0FBQTtRQUNBLFNBQUE7UUFDQSxjQUFBO1FBQ0EsY0FBQTtRQUNBLHNCQUFBOzs7QUNUQSxRQUFBLE9BQUEsYUFBQTs7O0FDQUE7O0FBRUEsUUFBQSxPQUFBLE9BQUEsQ0FBQSxNQUFBLFdBQUEsYUFBQSxjQUFBLFlBQUEsdUJBQUE7Ozs7O0FBS0EsUUFBQSxPQUFBLE9BQUEsT0FBQSxDQUFBLGlCQUFBLGdCQUFBLHNCQUFBO0lBQ0EsVUFBQSxlQUFBLGNBQUEsb0JBQUEsUUFBQTs7Ozs7UUFLQSxjQUFBLFNBQUEsUUFBQSxTQUFBO1lBQ0EsZ0JBQUE7WUFDQSxVQUFBO1lBQ0EscUJBQUE7WUFDQSxvQkFBQTtZQUNBLGdCQUFBLFFBQUE7Ozs7OztRQU1BLGFBQUEsYUFBQSxPQUFBOzs7OztRQUtBLG1CQUFBLHFCQUFBO1lBQ0EsUUFBQTtZQUNBLFFBQUE7OztRQUdBLG1CQUFBO1FBQ0Es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QUVBLE9BQUEsVUFBQSxPQUFBLE1BQUE7WUFDQTtnQkFDQSxJQUFBO2dCQUNBLE1BQUE7O1lBRUE7Z0JBQ0EsT0FBQTtvQkFDQSxLQUFBLE9BQUEsTUFBQTtvQkFDQSxTQUFBO29CQUNBLG1CQUFBLFVBQUEsVUFBQTt3QkFDQSxPQUFBLFFBQUEsU0FBQTs7O2dCQUdBLFFBQUE7a0JBQ0EsUUFBQTs7Ozs7OztBQ2xCQSxDQUFBLFlBQUE7O0lBRUEsUUFBQSxPQUFBLE9BQUEsV0FBQSxvQkFBQSxDQUFBLFVBQUE7O0lBRUEsU0FBQSxpQkFBQSxRQUFBOzs7Ozs7O0FDSkEsQ0FBQSxZQUFBOztJQUVBLFFBQUEsT0FBQSxPQUFBLFdBQUEsb0JBQUEsQ0FBQSxVQUFBLFFBQUE7O0lBRUEsU0FBQSxpQkFBQSxRQUFBLE1BQUE7O1FBRUEsT0FBQSxlQUFBLFNBQUEsR0FBQTtZQUNBLElBQUEsVUFBQSxFQUFBLE9BQUE7WUFDQSxNQUFBLDRCQUFBOzs7UUFHQSxPQUFBLGVBQUEsU0FBQSxHQUFBO1lBQ0EsSUFBQSxVQUFBLEVBQUEsT0FBQTtZQUNBLE1BQUEsNEJBQUE7Ozs7Ozs7O1FBUUEsT0FBQSxZQUFBLFNBQUEsTUFBQTs7Ozs7WUFLQSxPQUFBLEtBQUEsWUFBQTs7Ozs7OztBQzFCQSxDQUFBLFlBQUE7SUFDQSxRQUFBLE9BQUEsT0FBQSxVQUFBLGFBQUEsWUFBQTtRQUNBLE9BQUE7WUFDQSxVQUFBO1lBQ0EsTUFBQSxVQUFBLE9BQUEsU0FBQTtnQkFDQSxRQUFBLEdBQUE7Ozs7Ozs7QUNMQSxDQUFBLFlBQUE7OztJQUdBLFFBQUEsT0FBQSxPQUFBLFVBQUEsZUFBQSxZQUFBO1FBQ0EsT0FBQTtZQUNBLFVBQUE7WUFDQSxNQUFBLFVBQUEsT0FBQSxTQUFBLFlBQUE7Z0JBQ0EsSUFBQSxZQUFBO3dCQUNBLFlBQUEsUUFBQSxHQUFBO3dCQUNBLGNBQUEsUUFBQSxJQUFBO3dCQUNBLGVBQUEsUUFBQSxJQUFBOztnQkFFQSxJQUFBLFVBQUEsUUFBQSxRQUFBLGVBQUEsSUFBQTtvQkFDQSxVQUFBO29CQUNBLEtBQUEsQ0FBQTtvQkFDQSxNQUFBLENBQUE7b0JBQ0EsT0FBQSxRQUFBLEdBQUEsY0FBQSxTQUFBLGVBQUEsS0FBQSxTQUFBLGdCQUFBO29CQUNBLFVBQUEsUUFBQSxJQUFBO29CQUNBLFlBQUEsUUFBQSxJQUFBO29CQUNBLFlBQUEsUUFBQSxJQUFBO29CQUNBLFFBQUE7OztnQkFHQSxRQUFBLFFBQUEsU0FBQSxNQUFBLE9BQUE7O2dCQUVBLElBQUEsU0FBQSxZQUFBO29CQUNBLElBQUEsUUFBQSxVQUFBLFFBQUEsUUFBQTt3QkFDQSxLQUFBLElBQUEsSUFBQSxHQUFBLElBQUEsSUFBQSxJQUFBLFFBQUEsS0FBQTs0QkFDQSxLQUFBOzt3QkFFQSxPQUFBOzs7b0JBR0EsSUFBQSxNQUFBLFFBQUEsTUFBQSxRQUFBLE1BQUE7NkJBQ0EsUUFBQSxNQUFBOzZCQUNBLFFBQUEsTUFBQTs2QkFDQSxRQUFBLE9BQUE7NkJBQ0EsUUFBQSxPQUFBOzZCQUNBLFFBQUEsV0FBQSxVQUFBLE9BQUE7Z0NBQ0EsT0FBQSxNQUFBLFVBQUEsTUFBQSxTQUFBLEtBQUE7OztvQkFHQSxRQUFBLEtBQUE7O29CQUVBLFFBQUEsSUFBQSxVQUFBLEtBQUEsSUFBQSxRQUFBLEdBQUEsZUFBQSxXQUFBOzs7Z0JBR0EsTUFBQSxJQUFBLFlBQUEsWUFBQTtvQkFDQSxRQUFBOzs7Z0JBR0EsUUFBQSxLQUFBLGlDQUFBO2dCQUNBOzs7OztBQ3BEQSxDQUFBLFlBQUE7SUFDQSxRQUFBLE9BQUEsT0FBQSxVQUFBLGNBQUEsQ0FBQSxZQUFBO1FBQ0EsU0FBQSxVQUFBLFVBQUE7WUFDQSxPQUFBO2dCQUNBLFVBQUE7Z0JBQ0EsT0FBQTtvQkFDQSxRQUFBO29CQUNBLFFBQUE7O2dCQUVBLE1BQUEsU0FBQSxPQUFBLFNBQUEsT0FBQTtvQkFDQSxTQUFBLFdBQUE7d0JBQ0EsSUFBQSxPQUFBLFFBQUE7O3dCQUVBLElBQUEsU0FBQSxJQUFBOzRCQUNBLE9BQUE7Ozt3QkFHQSxJQUFBLE1BQUEsV0FBQTs0QkFDQSxPQUFBLEtBQUEsUUFBQSxpQkFBQTs7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QUEsSUFBQSxZQUFBLFNBQUEsS0FBQSxNQUFBOztZQUVBLEdBQUEsS0FBQSxRQUFBOztnQkFFQSxLQUFBLFNBQUE7Z0JBQ0EsS0FBQSxRQUFBLEtBQUEsUUFBQSxLQUFBLE1BQUEsUUFBQSxVQUFBLE1BQUE7bUJBQ0E7O2dCQUVBLEtBQUEsU0FBQTtnQkFDQSxLQUFBLFFBQUEsS0FBQSxRQUFBLEtBQUEsUUFBQSxZQUFBO2dCQUNBLElBQUEsUUFBQSxPQUFBLFFBQUEsTUFBQSxRQUFBO2dCQUNBLE9BQUEsUUFBQSxNQUFBLE9BQUEsT0FBQTtnQkFDQSxPQUFBLFFBQUEsTUFBQSxRQUFBOzs7Ozs7O1FBT0EsT0FBQSxJQUFBLGVBQUEsU0FBQSxLQUFBLE1BQUE7WUFDQSxJQUFBLFFBQUEsT0FBQSxRQUFBLE1BQUEsUUFBQTtZQUNBLE9BQUEsUUFBQSxNQUFBLE9BQUEsT0FBQTs7Ozs7O1FBTUEsT0FBQSxJQUFBLGVBQUEsU0FBQSxLQUFBLFVBQUEsU0FBQTtZQUNBLElBQUEsUUFBQSxPQUFBLFFBQUEsTUFBQSxRQUFBO1lBQ0EsUUFBQSxPQUFBLE9BQUEsUUFBQSxNQUFBLFFBQUE7Ozs7QUN2RkEsQ0FBQSxVQUFBOztJQUVBLFFBQUEsT0FBQSxZQUFBLFdBQUEsb0JBQUEsQ0FBQSxVQUFBLHNCQUFBOztJQUVBLFNBQUEsaUJBQUEsUUFBQSxtQkFBQTs7Ozs7UUFLQSxPQUFBLFVBQUEsbUJBQUE7OztBQ1RBLENBQUEsWUFBQTtJQUNBLFFBQUEsT0FBQTtTQUNBLE9BQUEsMEJBQUEsU0FBQSxNQUFBO1lBQ0EsT0FBQSxVQUFBLE1BQUEsUUFBQTtnQkFDQSxJQUFBLGNBQUE7MEJBQ0EsS0FBQSxRQUFBLElBQUEsT0FBQSxNQUFBLFNBQUEsS0FBQSxPQUFBOzBCQUNBOztnQkFFQSxPQUFBLEtBQUEsWUFBQTs7Ozs7O0FDUkEsUUFBQSxPQUFBLFlBQUEsUUFBQSxzQkFBQSxVQUFBO0lBQ0EsS0FBQSxVQUFBO1FBQ0EsT0FBQTtRQUNBLE9BQUE7OztBQ0hBLENBQUEsWUFBQTtJQUNBLFFBQUEsT0FBQSxjQUFB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RUE7O0FDWkEsQ0FBQSxXQUFBOztJQUVBLFFBQUEsT0FBQSxjQUFBLFdBQUEsc0JBQUEsQ0FBQSxVQUFBLFlBQUEsU0FBQTs7SUFFQSxTQUFBLG1CQUFBLFFBQUEsVUFBQSxPQUFBOztRQUVBLE9BQUEsT0FBQTtZQUNBLE1BQUE7WUFDQSxhQUFBOzs7Ozs7UUFNQSxTQUFBLEtBQUEsU0FBQSxLQUFBLG9CQUFBLFVBQUEsT0FBQTs7WUFFQSxHQUFBLE1BQUEsVUFBQSxJQUFBO2dCQUNBLFNBQUEsTUFBQTtnQkFDQSxPQUFBLE1BQUE7Z0JBQ0EsT0FBQTs7OztRQUlBLE9BQUEsUUFBQSxVQUFBLFFBQUE7O1lBRUEsTUFBQSxRQUFBOzs7O0tBSUE7S0FDQSIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFRoaXMgY29uZmlnIGlzIGludGVuZGVkIHRvIGJlIGluamVjdGVkIGluIHlvdXIgc3JjXG4gKi9cbmFuZ3VsYXIubW9kdWxlKFwiYXBwLmNvbmZpZ1wiLCBbXSlcbiAgICAuY29uc3RhbnQoXCJjb25maWdcIiwge1xuICAgICAgICBcImFwaVwiOiBcImh0dHA6Ly9sb2NhbGhvc3Q6ODAwMS9hcGkvdjFcIiwgXG4gICAgICAgIFwiZGVidWdcIjogdHJ1ZSxcbiAgICAgICAgXCJTUkNfRk9MREVSXCI6ICcvc3JjL2FwcF9tb2R1bGVzLycsXG4gICAgICAgIFwiSU1HX0ZPTERFUlwiOiAnL2ltZy8nLFxuICAgICAgICBcIlBST0ZJTEVfSU1HX0ZPTERFUlwiOiAnL2ltZy9wcm9maWxlLydcbiAgICB9KTtcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAuY2FyZHMnLCBbXSk7XG5cbiIsIid1c2Ugc3RyaWN0JztcblxuYW5ndWxhci5tb2R1bGUoJ2FwcCcsIFsnbmcnLCAnbmdSb3V0ZScsICduZ0Nvb2tpZXMnLCAnYXBwLmNvbmZpZycsICdhcHAuaG9tZScsICdhbmd1bGFyTW9kYWxTZXJ2aWNlJywgJ3Bhc2NhbHByZWNodC50cmFuc2xhdGUnXSk7XG4gIFxuLyoqXG4gKiBSZXN0IG9mIHRoZSBnbG9iYWwgY29uZmlnIGNhbiBiZSBmb3VuZCBpbiBhcHAtY29uZmlnIG1vZHVsZVxuICovICBcbmFuZ3VsYXIubW9kdWxlKCdhcHAnKS5jb25maWcoWyckaHR0cFByb3ZpZGVyJywgJyRsb2dQcm92aWRlcicsICckdHJhbnNsYXRlUHJvdmlkZXInLCAnY29uZmlnJywgXG4gICAgZnVuY3Rpb24gKCRodHRwUHJvdmlkZXIsICRsb2dQcm92aWRlciwgJHRyYW5zbGF0ZVByb3ZpZGVyLCBjb25maWcpIHtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBamF4IGNhbGxzXG4gICAgICAgICAqLyBcbiAgICAgICAgJGh0dHBQcm92aWRlci5kZWZhdWx0cy5oZWFkZXJzLmNvbW1vbiA9IHsgXG4gICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uO29kYXRhPXZlcmJvc2UnLFxuICAgICAgICAgICAgJ1gtTG9naW4tQWpheC1jYWxsJzogJ3RydWUnLFxuICAgICAgICAgICAgJ1gtUmVxdWVzdGVkLVdpdGgnOiBcIlhNTEh0dHBSZXF1ZXN0XCIsXG4gICAgICAgICAgICAnWC1DU1JGLVRPS0VOJzogTGFyYXZlbC5jc3JmVG9rZW5cbiAgICAgICAgICB9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBEZWJ1Z2dpbmdcbiAgICAgICAgICovIFxuICAgICAgICAkbG9nUHJvdmlkZXIuZGVidWdFbmFibGVkKGNvbmZpZy5kZWJ1Zyk7XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogVHJhbnNsYXRpb25zXG4gICAgICAgICAqLyAgICAgXG4gICAgICAgICR0cmFuc2xhdGVQcm92aWRlci51c2VTdGF0aWNGaWxlc0xvYWRlcih7XG4gICAgICAgICAgICBwcmVmaXg6ICcvaTE4bi9sb2NhbGUtJyxcbiAgICAgICAgICAgIHN1ZmZpeDogJy5qc29uJ1xuICAgICAgICB9KTtcblxuICAgICAgICAkdHJhbnNsYXRlUHJvdmlkZXIudXNlQ29va2llU3RvcmFnZSgpO1xuICAgICAgICAkdHJhbnNsYXRlUHJvdmlkZXIucHJlZmVycmVkTGFuZ3VhZ2UoJ2VuX1VTJyk7XG4gICAgICAgICR0cmFuc2xhdGVQcm92aWRlci5mYWxsYmFja0xhbmd1YWdlKCdlbl9VUycpO1xuICAgICAgICAkdHJhbnNsYXRlUHJvdmlkZXIudXNlU2FuaXRpemVWYWx1ZVN0cmF0ZWd5KCdlc2NhcGUnKTtcbn1dKTtcbiBcbmFuZ3VsYXIubW9kdWxlKCdhcHAnKS5ydW4oW2Z1bmN0aW9uICgpIHtcbiBcbn1dKTtcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAuaG9tZScsIFsnbmdSb3V0ZScsICdhcHAuY29uZmlnJywgJ25nQW5pbWF0ZScsICdhcHAuY2FyZHMnLCAnYXBwLnN0YWNrcycsICdhcHAudGFncycsICdoYy5tYXJrZWQnLCAnbmdTYW5pdGl6ZSddKTtcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAuc3RhY2tzJywgWyduZ1Jlc291cmNlJ10pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcC50YWdzJywgWyduZ1Jlc291cmNlJ10pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcC5jYXJkcycpLmNvbmZpZyhmdW5jdGlvbigkcm91dGVQcm92aWRlcikge1xuICAgXG59KTsiLCIoZnVuY3Rpb24gKCkge1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAnKS5jb25maWcoWyckcm91dGVQcm92aWRlcicsICdjb25maWcnLCBmdW5jdGlvbigkcm91dGVQcm92aWRlciwgY29uZmlnKSB7XG5cbiAgICAgICRyb3V0ZVByb3ZpZGVyXG4gICAgICAgIC53aGVuKCcvJywge1xuICAgICAgICAgICAgdGVtcGxhdGVVcmw6IGNvbmZpZy5TUkNfRk9MREVSICsgJ2hvbWUvdGVtcGxhdGVzL2hvbWUtdGVtcGxhdGUuaHRtbCcsXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnSG9tZUNvbnRyb2xsZXInLFxuICAgICAgICAgICAgY29udHJvbGxlckFzOiAnaG9tZSdcbiAgICAgICAgfSlcblxuICAgICAgICAub3RoZXJ3aXNlKHtyZWRpcmVjdFRvOiAnLyd9KTsgXG4gICAgfV0pO1xufSkoKTsiLCJcbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcblxuICAgIC8vIHN3aXRjaCBmb3Jtc1xuICAgICQoJy5tZXNzYWdlIGEnKS5jbGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgIFxuICAgICAgICAkKCdmb3JtJykuYW5pbWF0ZSh7aGVpZ2h0OiBcInRvZ2dsZVwiLCBvcGFjaXR5OiBcInRvZ2dsZVwifSwgXCJzbG93XCIpO1xuICAgICAgICBcbiAgICAgICAgaWYod2luZG93LmxvY2F0aW9uLnBhdGhuYW1lID09ICcvbG9naW4nKSB7XG4gICAgICAgICAgICBoaXN0b3J5LnB1c2hTdGF0ZSh7fSwgXCJSZWdpc3RlclwiLCBcIi9yZWdpc3RlclwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGhpc3RvcnkucHVzaFN0YXRlKHt9LCBcIkxvZ2luXCIsIFwiL2xvZ2luXCIpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAkKCdmb3JtIC5oZWxwLWJsb2NrJykuaGlkZSgpO1xuICAgIH0pO1xuXG59KTsiLCJhbmd1bGFyLm1vZHVsZSgnYXBwLmhvbWUnKS5jb25maWcoZnVuY3Rpb24oJHJvdXRlUHJvdmlkZXIpIHtcblxufSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcC5zdGFja3MnKS5jb25maWcoZnVuY3Rpb24oJHJvdXRlUHJvdmlkZXIpIHtcblxufSk7IiwiKGZ1bmN0aW9uICgpIHtcblxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuY2FyZHMnKS5kaXJlY3RpdmUoJ2NhcmQnLFxuICAgICAgICBbJ2NvbmZpZycsIGZ1bmN0aW9uIChjb25maWcpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IGNvbmZpZy5TUkNfRk9MREVSICsgJ2NhcmRzL3RlbXBsYXRlcy9jYXJkLmh0bWwnLFxuICAgICAgICAgICAgICAgIHJlc3RyaWN0OiAnQScsXG4gICAgICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgICAgICAgICBjYXJkOiBcIj1kYXRhXCJcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJyRyb290U2NvcGUnLCAnJGxvZycsICdjb25maWcnLCAnY2FyZHNGYWN0b3J5JywgJ01vZGFsU2VydmljZScsXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgkc2NvcGUsICRyb290U2NvcGUsICRsb2csIGNvbmZpZywgY2FyZHNGYWN0b3J5LCBNb2RhbFNlcnZpY2UpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmV2ZW50cyA9IHt9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIERpc3BsYXkgb25seSBYIHRhZ3NcbiAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLm1heF9udW1fdGFncyA9IDM7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICogUGluIENhcmQgKG1ha2UgaXQgJ3N0aWNreScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIEBwYXJhbSBDYXJkIGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgICAgICAqIEByZXR1cm5zIHZvaWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmV2ZW50cy5waW5DYXJkID0gZnVuY3Rpb24gKGl0ZW0pIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjYXJkID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogaXRlbS5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RpY2t5OiAhaXRlbS5zdGlja3lcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhamF4IGNhbGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXJkc0ZhY3RvcnkudXBkYXRlKGNhcmQpLiRwcm9taXNlLnRoZW4oZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGVtbWl0IGV2ZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgncGluLWNhcmQnLCBpdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRsb2cuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICogRGVsZXRlIENhcmRcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIFxuICAgICAgICAgICAgICAgICAgICAgICAgICogQHBhcmFtIENhcmQgaXRlbVxuICAgICAgICAgICAgICAgICAgICAgICAgICogQHJldHVybnMgdm9pZFxuICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXZlbnRzLmRlbGV0ZSA9IGZ1bmN0aW9uIChpdGVtKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBKdXN0IHByb3ZpZGUgYSB0ZW1wbGF0ZSB1cmwsIGEgY29udHJvbGxlciBhbmQgY2FsbCAnc2hvd01vZGFsJy5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBNb2RhbFNlcnZpY2Uuc2hvd01vZGFsKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IGNvbmZpZy5TUkNfRk9MREVSICsgXCJjb21tb24vdGVtcGxhdGVzL21vZGFscy9jb25maXJtLmh0bWxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogXCJZZXNOb0NvbnRyb2xsZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXRzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3RpdGxlJzogJ0RlbGV0ZSBjYXJkPycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2NvbnRlbnQnOiBcIllvdSdsbCBub3QgYmUgYWJsZSB0byByZWNvdmVyIGl0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKG1vZGFsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFsLmVsZW1lbnQubW9kYWwoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWwuY2xvc2UudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQpIHsgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYWpheCBjYWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FyZHNGYWN0b3J5LmRlbGV0ZSh7aWQ6IGl0ZW0uaWR9KS4kcHJvbWlzZS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGVtbWl0IGV2ZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnZGVsZXRlLWNhcmQnLCBpdGVtKTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJGxvZy5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICogRWRpdCBDYXJkXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIEBwYXJhbSBDYXJkIGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgICAgICAqIEByZXR1cm5zIHZvaWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmV2ZW50cy5lZGl0ID0gZnVuY3Rpb24gKGl0ZW0pIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1vZGFsU2VydmljZS5zaG93TW9kYWwoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogY29uZmlnLlNSQ19GT0xERVIgKyBcImNhcmRzL3RlbXBsYXRlcy9tb2RhbHMvZWRpdC1jYXJkLmh0bWxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogXCJFZGl0Q2FyZENvbnRyb2xsZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXRzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FyZDogaXRlbVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkudGhlbihmdW5jdGlvbiAobW9kYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWwuZWxlbWVudC5tb2RhbCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RhbC5jbG9zZS50aGVuKGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHByZXBhcmUgZGF0YSB0byBiZSBzZW5kIHRvIHNlcnZlciBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgY2FyZCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGl0ZW0uaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IG1vZGFsLnNjb3BlLmZvcm0ubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogbW9kYWwuc2NvcGUuZm9ybS5jb250ZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYWpheCBjYWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FyZHNGYWN0b3J5LnVwZGF0ZShjYXJkKS4kcHJvbWlzZS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGVtbWl0IGV2ZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgndXBkYXRlLWNhcmQnLCBpdGVtLCBjYXJkKTsgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJGxvZy5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICogVmlldyBjb250ZW50IGluIG1vZGFsYm94IHdpdGggTWFya2Rvd24gKHJpY2ggdGV4dCBtb2RlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICogXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBAcGFyYW0gQ2FyZCBpdGVtXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBAcmV0dXJucyB2b2lkXG4gICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5ldmVudHMudmlld0FzTWFya2Rvd25Nb2RhbCA9IGZ1bmN0aW9uIChpdGVtKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBKdXN0IHByb3ZpZGUgYSB0ZW1wbGF0ZSB1cmwsIGEgY29udHJvbGxlciBhbmQgY2FsbCAnc2hvd01vZGFsJy5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBNb2RhbFNlcnZpY2Uuc2hvd01vZGFsKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IGNvbmZpZy5TUkNfRk9MREVSICsgXCJob21lL3RlbXBsYXRlcy9tb2RhbHMvbWFya2Rvd24uaHRtbFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBcIk1hcmtkb3duQ29udHJvbGxlclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnB1dHM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnY2FyZCc6IGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKG1vZGFsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFsLmVsZW1lbnQubW9kYWwoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfV1cbiAgICAgICAgfTtcbiAgICB9XSk7XG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmNhcmRzJykuZGlyZWN0aXZlKCduZXdDYXJkRm9ybScsXG4gICAgICAgIFsnY29uZmlnJywgZnVuY3Rpb24gKGNvbmZpZykge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICAgICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICAgICAgICAgIGNhcmQ6IFwiPVwiXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBjb25maWcuU1JDX0ZPTERFUiArICdjYXJkcy90ZW1wbGF0ZXMvbmV3LWZvcm0uaHRtbCcsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogWyckc2NvcGUnLCAnJHJvb3RTY29wZScsICckbG9nJywgJ2NhcmRzRmFjdG9yeScsIGZ1bmN0aW9uICgkc2NvcGUsICRyb290U2NvcGUsICRsb2csIGNhcmRzRmFjdG9yeSkge1xuXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5ldmVudHMgPSB7fTtcblxuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogU3VibWl0IGZvcm1cbiAgICAgICAgICAgICAgICAgICAgICogQHJldHVybnMgdm9pZFxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmV2ZW50cy5jcmVhdGVDYXJkID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoJHNjb3BlLmNvbnRlbnQpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBkYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAkc2NvcGUubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogJHNjb3BlLmNvbnRlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FyZHNGYWN0b3J5LnNhdmUoZGF0YSkuJHByb21pc2UudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jbGFzcyA9ICdoaWdobGlnaHRlZCc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuaWQgPSByZXNwb25zZS5pZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCduZXctY2FyZCcsIGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkbG9nLmVycm9yKHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmNvbnRlbnQgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdfVxuICAgICAgICB9XSk7XG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5jYXJkcycpLmRpcmVjdGl2ZSgnb3JkZXJCeScsIFsnY29uZmlnJyxcbiAgICAgICAgZnVuY3Rpb24gKGNvbmZpZykge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHJlc3RyaWN0OiAnRUEnLFxuICAgICAgICAgICAgICAgIHNjb3BlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBjb25maWcuU1JDX0ZPTERFUiArICcvY2FyZHMvdGVtcGxhdGVzL29yZGVyLWJ5Lmh0bWwnLFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJyRyb290U2NvcGUnLCAnJGNvb2tpZXMnLCBmdW5jdGlvbiAoJHNjb3BlLCAkcm9vdFNjb3BlLCAkY29va2llcykge1xuICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmV2ZW50cyA9IHt9O1xuICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgbGV0IG9yZGVyID0gJGNvb2tpZXMuZ2V0T2JqZWN0KCdvcmRlcicpO1xuICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy8gaW5pdGlhbCBwb3NpdGlvblxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUub3JkZXIgPSBvcmRlciAmJiAhYW5ndWxhci5pc1VuZGVmaW5lZChvcmRlci5vcmRlcikgPyBvcmRlci5vcmRlciA6ICd1cGRhdGVkX2F0JztcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRpcmVjdGlvbiA9IG9yZGVyICYmICFhbmd1bGFyLmlzVW5kZWZpbmVkKG9yZGVyLmRpcmVjdGlvbikgPyBvcmRlci5kaXJlY3Rpb24gOiAnZGVzYyc7XG5cbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmV2ZW50cy51cGRhdGUgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGRhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JkZXI6ICRzY29wZS5vcmRlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXJlY3Rpb246ICRzY29wZS5kaXJlY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcGVyc2lzdFxuICAgICAgICAgICAgICAgICAgICAgICAgJGNvb2tpZXMucHV0T2JqZWN0KCdvcmRlcicsIGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ29yZGVyLWNoYW5nZWQnLCBkYXRhKTsgLy8gZW1taXRcbiAgICAgICAgICAgICAgICAgICAgfSAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH1dXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgXSk7XG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmRpcmVjdGl2ZSgncGFnaW5hdGVDYXJkcycsIFsnY29uZmlnJyxcbiAgICAgICAgZnVuY3Rpb24gKGNvbmZpZykge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHJlc3RyaWN0OiAnRUEnLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBjb25maWcuU1JDX0ZPTERFUiArICcvY2FyZHMvdGVtcGxhdGVzL3BhZ2luYXRlLWNhcmRzLmh0bWwnLFxuICAgICAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgICAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogJz0nXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBbJyRzY29wZScsICckcm9vdFNjb3BlJywgZnVuY3Rpb24gKCRzY29wZSwgJHJvb3RTY29wZSkge1xuICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5jb250ZXh0ID0ge307XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5ldmVudHMgPSB7fTtcbiAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogRHJhdyB3aWRnZXQgd2hlbiBkYXRhIGlzIGF2YWlsYWJsZVxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRvbignY2FyZHMtbG9hZGVkJywgZnVuY3Rpb24oZXZ0LCBkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuY29udGV4dC5wYWdlcyA9IGRhdGE7IFxuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmNvbnRleHQuZGlzcGxheSA9IGRhdGEuZGF0YS5sZW5ndGggJiYgKGRhdGEucHJldl9wYWdlX3VybCAhPT0gbnVsbCB8fCBkYXRhLm5leHRfcGFnZV91cmwgIT09IG51bGwpO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBCcm9hZGNhc3QgY2hhbmdlc1xuICAgICAgICAgICAgICAgICAgICAgKiBAcmV0dXJucyB2b2lkXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXZlbnRzLm5hdmlnYXRlID0gZnVuY3Rpb24gKCRldmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAkZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICRldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdGFyZ2V0ID0gJGV2ZW50LmN1cnJlbnRUYXJnZXQ7XG4gICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHR5cGVvZih0YXJnZXQuYXR0cmlidXRlc1snZGlzYWJsZWQnXSkgPT09ICd1bmRlZmluZWQnIHx8ICF0YXJnZXQuYXR0cmlidXRlc1snZGlzYWJsZWQnXS52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnY2FyZHMtcGFnZS1jaGFuZ2VkJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWdlOiB0YXJnZXQuYXR0cmlidXRlc1snZGF0YS1wYWdlJ10udmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTsgLy8gZW1taXRcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1dXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgXSk7XG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmNhcmRzJykuZmFjdG9yeSgnY2FyZHNGYWN0b3J5JywgWyckcmVzb3VyY2UnLCAnY29uZmlnJywgZnVuY3Rpb24oJHJlc291cmNlLCBjb25maWcpIHtcblxuICAgICAgICByZXR1cm4gJHJlc291cmNlKGNvbmZpZy5hcGkgKyAnL2NhcmRzLzppZCcsIFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGlkOiAnQGlkJyxcbiAgICAgICAgICAgICAgICBwYWdlOiAnQHBhZ2UnXG4gICAgICAgICAgICB9LCBcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBxdWVyeToge1xuICAgICAgICAgICAgICAgICAgICB1cmw6IGNvbmZpZy5hcGkgKyAnL2NhcmRzL3RhZ3MvYWxsJyxcbiAgICAgICAgICAgICAgICAgICAgaXNBcnJheTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybVJlc3BvbnNlOiBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhbmd1bGFyLmZyb21Kc29uKHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdXBkYXRlOiB7XG4gICAgICAgICAgICAgICAgICBtZXRob2Q6ICdQVVQnIFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pOyBcbiAgICB9XSk7XG59KSgpO1xuXG4iLCIoZnVuY3Rpb24gKCkge1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmNvbnRyb2xsZXIoJ0hlYWRlckNvbnRyb2xsZXInLCBbJyRzY29wZScsIEhlYWRlckNvbnRyb2xsZXJdKTtcblxuICAgIGZ1bmN0aW9uIEhlYWRlckNvbnRyb2xsZXIoJHNjb3BlKSB7XG4gICAgICAgIFxuICAgIH1cbn0pKCk7XG5cblxuIiwiKGZ1bmN0aW9uICgpIHtcblxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAnKS5jb250cm9sbGVyKCdMYXlvdXRDb250cm9sbGVyJywgWyckc2NvcGUnLCAnJHNjZScsIExheW91dENvbnRyb2xsZXJdKTtcblxuICAgIGZ1bmN0aW9uIExheW91dENvbnRyb2xsZXIoJHNjb3BlLCAkc2NlKSB7XG5cbiAgICAgICAgJHNjb3BlLnRhZ1VzZXJDbGljayA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHZhciB0YWdUZXh0ID0gZS50YXJnZXQuaW5uZXJUZXh0O1xuICAgICAgICAgICAgYWxlcnQoJ3RhZ1VzZXJDbGljaywgdGFnVGV4dDogJyArIHRhZ1RleHQpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgJHNjb3BlLnRhZ1Rlcm1DbGljayA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHZhciB0YWdUZXh0ID0gZS50YXJnZXQuaW5uZXJUZXh0O1xuICAgICAgICAgICAgYWxlcnQoJ3RhZ1Rlcm1DbGljaywgdGFnVGV4dDogJyArIHRhZ1RleHQpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLy8gWW91IGNvdWxkIGRlZmluZSAndGFnVXNlckNsaWNrJyBhbmQgJ3RhZ1Rlcm1DbGljaydcbiAgICAgICAgLy8gb24gdGhlICckcm9vdFNjb3BlJy4gVGhpcyB3YXkgeW91IGNhbiBoYW5kbGUgd2hhdGV2ZXJcbiAgICAgICAgLy8gbG9naWMgeW91IHdhbnQgZm9yIGhhc2h0YWdzIGluIG9uZSBwbGFjZSByYXRoZXIgdGhhblxuICAgICAgICAvLyBoYXZpbmcgdG8gZGVmaW5lIGl0IGluIGVhY2ggY29udHJvbGxlci5cbiAgICAgICAgXG4gICAgICAgICRzY29wZS50cnVzdEh0bWwgPSBmdW5jdGlvbihodG1sKSB7XG4gICAgICAgICAgICAvLyBTYW5pdGl6ZSBtYW51YWxseSBpZiBuZWNlc3NhcnkuIEl0J3MgbGlrZWx5IHRoaXNcbiAgICAgICAgICAgIC8vIGh0bWwgaGFzIGFscmVhZHkgYmVlbiBzYW5pdGl6ZWQgc2VydmVyIHNpZGVcbiAgICAgICAgICAgIC8vIGJlZm9yZSBpdCB3ZW50IGludG8geW91ciBkYXRhYmFzZS5cbiAgICAgICAgICAgIC8vIERvbid0IGhvbGQgbWUgbGlhYmxlIGZvciBYU1MuLi4gbmV2ZXIgYXNzdW1lIDp+KVxuICAgICAgICAgICAgcmV0dXJuICRzY2UudHJ1c3RBc0h0bWwoaHRtbCk7XG4gICAgICAgIH07XG4gICAgfVxufSkoKTtcblxuXG4iLCIoZnVuY3Rpb24gKCkge1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAnKS5kaXJlY3RpdmUoJ2F1dG9mb2N1cycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnQScsXG4gICAgICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50WzBdLmZvY3VzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSk7XG59KSgpO1xuXG4gICAgICIsIihmdW5jdGlvbiAoKSB7XG4gICAgLy8gQmVjYXVzZSBvZiB0aGUgYW5tZSBhbmQgRSB0eXBlLCB3b3JrcyBhdXRvbWF0aWNhbGx5IGZvciBldmVyeSB0ZXh0YXJlYVxuICAgIC8vIHJlZjogaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vdGhvbXNlZGRvbi80NzAzOTY4XG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmRpcmVjdGl2ZSgnZWxhc3RpY0FyZWEnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByZXN0cmljdDogJ0EnLFxuICAgICAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRyaWJ1dGVzKSB7XG4gICAgICAgICAgICAgICAgdmFyIHRocmVzaG9sZCA9IDM1LFxuICAgICAgICAgICAgICAgICAgICAgICAgbWluSGVpZ2h0ID0gZWxlbWVudFswXS5vZmZzZXRIZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nTGVmdCA9IGVsZW1lbnQuY3NzKCdwYWRkaW5nTGVmdCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZ1JpZ2h0ID0gZWxlbWVudC5jc3MoJ3BhZGRpbmdSaWdodCcpO1xuXG4gICAgICAgICAgICAgICAgdmFyICRzaGFkb3cgPSBhbmd1bGFyLmVsZW1lbnQoJzxkaXY+PC9kaXY+JykuY3NzKHtcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgICAgICAgICAgICAgICAgIHRvcDogLTEwMDAwLFxuICAgICAgICAgICAgICAgICAgICBsZWZ0OiAtMTAwMDAsXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiBlbGVtZW50WzBdLm9mZnNldFdpZHRoIC0gcGFyc2VJbnQocGFkZGluZ0xlZnQgfHwgMCkgLSBwYXJzZUludChwYWRkaW5nUmlnaHQgfHwgMCksXG4gICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiBlbGVtZW50LmNzcygnZm9udFNpemUnKSxcbiAgICAgICAgICAgICAgICAgICAgZm9udEZhbWlseTogZWxlbWVudC5jc3MoJ2ZvbnRGYW1pbHknKSxcbiAgICAgICAgICAgICAgICAgICAgbGluZUhlaWdodDogZWxlbWVudC5jc3MoJ2xpbmVIZWlnaHQnKSxcbiAgICAgICAgICAgICAgICAgICAgcmVzaXplOiAnbm9uZSdcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5ib2R5KS5hcHBlbmQoJHNoYWRvdyk7XG5cbiAgICAgICAgICAgICAgICB2YXIgdXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdGltZXMgPSBmdW5jdGlvbiAoc3RyaW5nLCBudW1iZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCByID0gJyc7IGkgPCBudW1iZXI7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHIgKz0gc3RyaW5nO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHI7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB2YXIgdmFsID0gZWxlbWVudC52YWwoKS5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLyYvZywgJyZhbXA7JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxuJC8sICc8YnIvPiZuYnNwOycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcbi9nLCAnPGJyLz4nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXHN7Mix9L2csIGZ1bmN0aW9uIChzcGFjZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGltZXMoJyZuYnNwOycsIHNwYWNlLmxlbmd0aCAtIDEpICsgJyAnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICRzaGFkb3cuaHRtbCh2YWwpO1xuXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuY3NzKCdoZWlnaHQnLCBNYXRoLm1heCgkc2hhZG93WzBdLm9mZnNldEhlaWdodCArIHRocmVzaG9sZCwgbWluSGVpZ2h0KSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgJHNoYWRvdy5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGVsZW1lbnQuYmluZCgna2V5dXAga2V5ZG93biBrZXlwcmVzcyBjaGFuZ2UnLCB1cGRhdGUpO1xuICAgICAgICAgICAgICAgIHVwZGF0ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG59KSgpOyIsIihmdW5jdGlvbiAoKSB7IFxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAnKS5kaXJlY3RpdmUoJ2hhc2h0YWdpZnknLCBbJyR0aW1lb3V0JywgJyRjb21waWxlJyxcbiAgICAgICAgZnVuY3Rpb24oJHRpbWVvdXQsICRjb21waWxlKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHJlc3RyaWN0OiAnQScsXG4gICAgICAgICAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgICAgICAgICAgdUNsaWNrOiAnJnVzZXJDbGljaycsXG4gICAgICAgICAgICAgICAgICAgIHRDbGljazogJyZ0ZXJtQ2xpY2snXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaHRtbCA9IGVsZW1lbnQuaHRtbCgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaHRtbCA9PT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhdHRycy51c2VyQ2xpY2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBodG1sID0gaHRtbC5yZXBsYWNlKC8ofFxccykqQChcXHcrKS9nLCAnJDE8YSBuZy1jbGljaz1cInVDbGljayh7JGV2ZW50OiAkZXZlbnR9KVwiIGNsYXNzPVwiaGFzaHRhZ1wiPkAkMjwvYT4nKTsgXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhdHRycy50ZXJtQ2xpY2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBodG1sID0gaHRtbC5yZXBsYWNlKC8oXnxcXHMpKiMoXFx3KykvZywgJyQxPGEgbmctY2xpY2s9XCJ0Q2xpY2soeyRldmVudDogJGV2ZW50fSlcIiBjbGFzcz1cImhhc2h0YWdcIj4jJDI8L2E+Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuaHRtbChodG1sKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgJGNvbXBpbGUoZWxlbWVudC5jb250ZW50cygpKShzY29wZSk7XG4gICAgICAgICAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICBdKTtcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwJykuZGlyZWN0aXZlKCdzZXNzaW9uRHJvcGRvd24nLCBbJ2NvbmZpZycsXG4gICAgICAgIGZ1bmN0aW9uIChjb25maWcpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICByZXN0cmljdDogJ0VBJyxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogY29uZmlnLlNSQ19GT0xERVIgKyAnL2NvbW1vbi90ZW1wbGF0ZXMvc2Vzc2lvbi1kcm9wZG93bi5odG1sJywgICBcbiAgICAgICAgICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiBcIj1cIlxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnRzLCBhdHRycykge1xuICAgICAgICAgICAgICAgICAgICBzY29wZS5pbWdfZm9sZGVyID0gY29uZmlnLlBST0ZJTEVfSU1HX0ZPTERFUjtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgZnVuY3Rpb24gKCRzY29wZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS51c2VyID0gJHNjb3BlLmRhdGE7XG4gICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICBdKTsgICAgICAgXG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwJykuZGlyZWN0aXZlKCdzaG93TW9yZScsXG4gICAgICAgIFsnY29uZmlnJywgZnVuY3Rpb24gKGNvbmZpZykge1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBjb25maWcuU1JDX0ZPTERFUiArICdjb21tb24vdGVtcGxhdGVzL3Nob3dNb3JlLmh0bWwnLFxuICAgICAgICAgICAgICAgIHJlc3RyaWN0OiAnQScsXG4gICAgICAgICAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgICAgICAgICAnc2hvd01vcmVIZWlnaHQnOiAnQCdcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJyRlbGVtZW50JywgJyRpbnRlcnZhbCcsIGZ1bmN0aW9uICgkc2NvcGUsICRlbGVtZW50LCAkaW50ZXJ2YWwpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmV4cGFuZGVkID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICRpbnRlcnZhbChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVuZGVyU3R5bGVzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCAzMDApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXhwYW5kYWJsZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gcmVuZGVyU3R5bGVzKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICgkZWxlbWVudC5oZWlnaHQoKSA+PSAkc2NvcGUuc2hvd01vcmVIZWlnaHQgJiYgJHNjb3BlLmV4cGFuZGVkID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXhwYW5kYWJsZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuc2hvd0xlc3NTdHlsZSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnbWF4LWhlaWdodCc6ICRzY29wZS5zaG93TW9yZUhlaWdodCArICdweCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ292ZXJmbG93JzogJ2hpZGRlbidcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1dKTtcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwJylcbiAgICAgICAgLmZpbHRlcigncmVkdWNlQnknLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoY29sbGVjdGlvbiwgZmllbGQpIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICByZXR1cm4gY29sbGVjdGlvbi5yZWR1Y2UoZnVuY3Rpb24ob3V0cHV0LCBjdXJyZW50KXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKCFmaWVsZEV4aXN0cyhvdXRwdXQsIGZpZWxkLCBjdXJyZW50W2ZpZWxkXSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG91dHB1dC5jb25jYXQoY3VycmVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gb3V0cHV0O1xuICAgICAgICAgICAgICAgICAgICB9LCBbXSk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGZpZWxkRXhpc3RzKGhheXN0YWNrLCBmaWVsZE5hbWUsIGZpZWxkVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGhheXN0YWNrLnNvbWUoZnVuY3Rpb24oZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZWxbZmllbGROYW1lXSA9PT0gZmllbGRWYWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgfSk7IFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07ICAgICAgICAgICAgXG4gICAgICAgIH0pO1xufSkoKTtcblxuIiwiKGZ1bmN0aW9uICgpIHtcbiAgICBcbiAgICAgYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmZhY3RvcnkoJ3F1ZXJ5RmFjdG9yeScsIFsnJGxvZycsICckY29va2llcycsICckcm9vdFNjb3BlJywgJ2NhcmRzRmFjdG9yeScsICdzdGFja3NGYWN0b3J5JywgJ3RhZ3NGYWN0b3J5JywgcXVlcnlGYWN0b3J5XSk7XG4gICAgXG4gICAgZnVuY3Rpb24gcXVlcnlGYWN0b3J5KCRsb2csICRjb29raWVzLCAkcm9vdFNjb3BlLCBjYXJkc0ZhY3RvcnksIHN0YWNrc0ZhY3RvcnksIHRhZ3NGYWN0b3J5KSB7XG4gICAgICAgIFxuICAgICAgICB2YXIgZmFjdG9yeSA9IHt9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIGdldCBhbGwgY2FyZHMgZnJvbSBzZXJ2ZXIgZm9yIGEgZ2l2ZW4gdXNlclxuICAgICAgICAgKiBcbiAgICAgICAgICogQHBhcmFtIGpzb24gcGFyYW1zXG4gICAgICAgICAqIEByZXR1cm5zIGNhcmRzRmFjdG9yeVxuICAgICAgICAgKiBAYnJvYWRjYXN0IGNhcmRzIGxpc3RcbiAgICAgICAgICovXG4gICAgICAgIGZhY3RvcnkuYWxsID0gZnVuY3Rpb24gKHBhcmFtcykge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBwYXJhbXMgPSBnZXRGaWx0ZXJzKHBhcmFtcywgWydvcmRlcicsICdzdGFjaycsICd0YWdzJ10pO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBxdWVyeVxuICAgICAgICAgICAgcmV0dXJuIGNhcmRzRmFjdG9yeVxuICAgICAgICAgICAgICAgIC5xdWVyeShwYXJhbXMsIGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgYnJvYWRjYXN0KHJlc3BvbnNlKTsgLy8gdGVsbCB0aGUgd29ybGRcbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgJGxvZy5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgIH0pOyAgXG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogZ2V0IGNhcmRzIHVzaW5nIHN0YWNrIGZpbHRlcnNcbiAgICAgICAgICogXG4gICAgICAgICAqIEBwYXJhbSBqc29uIHBhcmFtc1xuICAgICAgICAgKiBAcmV0dXJucyBzdGFja3NGYWN0b3J5XG4gICAgICAgICAqIEBicm9hZGNhc3QgY2FyZHMgbGlzdFxuICAgICAgICAgKi9cbiAgICAgICAgZmFjdG9yeS5ieVN0YWNrID0gZnVuY3Rpb24gKHBhcmFtcykge1xuICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBwYXJhbXMgPSBnZXRGaWx0ZXJzKHBhcmFtcywgWydvcmRlcicsICdzdGFjaycsICd0YWdzJ10pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIHN0YWNrc0ZhY3RvcnkuZmlsdGVyKHBhcmFtcywgZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBicm9hZGNhc3QocmVzcG9uc2UpOyAvLyB0ZWxsIHRoZSB3b3JsZFxuICAgICAgICAgICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgICAgJGxvZy5lcnJvcihlcnIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBnZXQgY2FyZHMgdXNpbmcgY3VycmVudCBmaWx0ZXJzXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAcGFyYW0ganNvbiBwYXJhbXNcbiAgICAgICAgICogQHJldHVybnMgc3RhY2tzRmFjdG9yeVxuICAgICAgICAgKiBAYnJvYWRjYXN0IGNhcmRzIGxpc3RcbiAgICAgICAgICovXG4gICAgICAgIGZhY3RvcnkuYnlUYWdzID0gZnVuY3Rpb24gKHBhcmFtcykge1xuICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBwYXJhbXMgPSBnZXRGaWx0ZXJzKHBhcmFtcywgWydvcmRlcicsICdzdGFjaycsICd0YWdzJ10pO1xuICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gdGFnc0ZhY3RvcnkuZmlsdGVyKHBhcmFtcywgZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBicm9hZGNhc3QocmVzcG9uc2UpOyAvLyB0ZWxsIHRoZSB3b3JsZFxuICAgICAgICAgICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgICAgJGxvZy5lcnJvcihlcnIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgICAgICAgXG4gICAgICAgIGZ1bmN0aW9uIGdldEZpbHRlcnMocGFyYW1zLCBmaWx0ZXJzKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKHR5cGVvZihwYXJhbXMpID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIHBhcmFtcyA9IHt9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZihmaWx0ZXJzLmluY2x1ZGVzKCd0YWdzJykgJiYgdHlwZW9mKCRjb29raWVzLmdldCgndGFnc1tdJykpICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIHBhcmFtc1sndGFnc1tdJ10gPSAkY29va2llcy5nZXRPYmplY3QoJ3RhZ3NbXScpLm1hcChmdW5jdGlvbih4KXsgcmV0dXJuIHguaWQ7IH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYoZmlsdGVycy5pbmNsdWRlcygnc3RhY2snKSAmJiB0eXBlb2YoJGNvb2tpZXMuZ2V0KCdzdGFjaycpKSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICBwYXJhbXMuc3RhY2sgPSAkY29va2llcy5nZXRPYmplY3QoJ3N0YWNrJykuaWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZihmaWx0ZXJzLmluY2x1ZGVzKCdvcmRlcicpICYmIHR5cGVvZigkY29va2llcy5nZXQoJ29yZGVyJykpICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIHBhcmFtcy5vcmRlciA9ICRjb29raWVzLmdldE9iamVjdCgnb3JkZXInKTsgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gcGFyYW1zO1xuICAgICAgICB9XG4gICAgICAgICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogVGVsbCBldmVyeWJvZHkgd2UgaGF2ZSBhIHJlbm92YXRlZCBsaXN0XG4gICAgICAgICAqL1xuICAgICAgICBmdW5jdGlvbiBicm9hZGNhc3QoZGF0YSkge1xuICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdjYXJkcy1sb2FkZWQnLCBkYXRhKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGZhY3Rvcnk7XG4gICAgfSAgICBcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcblxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuaG9tZScpLmNvbnRyb2xsZXIoJ0hvbWVDb250cm9sbGVyJywgWyckc2NvcGUnLCBIb21lQ29udHJvbGxlcl0pO1xuXG4gICAgZnVuY3Rpb24gSG9tZUNvbnRyb2xsZXIoJHNjb3BlKSB7XG4gICAgICAgICAgXG4gICAgfVxufSkoKTtcblxuXG4iLCIoZnVuY3Rpb24oKXtcbiAgICBcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmhvbWUnKS5jb250cm9sbGVyKCdMaXN0Q29udHJvbGxlcicsIFsnJHNjb3BlJywgJyRsb2cnLCAnJGNvb2tpZXMnLCAnJGVsZW1lbnQnLCAncXVlcnlGYWN0b3J5JywgJ0hvbWVDb250ZXh0U2VydmljZScsIExpc3RDb250cm9sbGVyXSk7XG4gICAgXG4gICAgZnVuY3Rpb24gTGlzdENvbnRyb2xsZXIoJHNjb3BlLCAkbG9nLCAkY29va2llcywgJGVsZW1lbnQsIHF1ZXJ5RmFjdG9yeSwgSG9tZUNvbnRleHRTZXJ2aWNlKXtcbiAgICAgICAgXG4gICAgICAgICRzY29wZS5ldmVudHMgPSB7fTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBXYXkgdG8ga2VlcCBzaWJsaW5ncyBjb25uZWN0ZWQgYW5kIHNoYXJpbmcgc2NvcGVcbiAgICAgICAgICovXG4gICAgICAgICRzY29wZS5jb250ZXh0ID0gSG9tZUNvbnRleHRTZXJ2aWNlLmNvbnRleHQ7XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogR2V0IGNhcmRzIGxpc3RcbiAgICAgICAgICovXG4gICAgICAgICRzY29wZS5ldmVudHMubG9hZCA9IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBnZXQgZGF0YSBmcm9tIHNlcnZlclxuICAgICAgICAgICAgcXVlcnlGYWN0b3J5XG4gICAgICAgICAgICAgICAgLmFsbChwYXJhbXMpLiRwcm9taXNlLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgICAgICAkbG9nLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgfSk7ICBcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgICRzY29wZS5ldmVudHMubG9hZCgpOyAvLyBydW4gYXQgcGFnZSBsb2FkXG4gICAgICAgIFxuICAgICAgICAkc2NvcGUuJG9uKCdjYXJkcy1sb2FkZWQnLCBmdW5jdGlvbihldnQsIHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAkc2NvcGUuY29udGV4dC5jYXJkcyA9IHJlc3BvbnNlLmRhdGE7IC8vIGNhcmRzIGxpc3RcbiAgICAgICAgICAgICRzY29wZS5jb250ZXh0LnBhZ2VzID0gcmVzcG9uc2U7IC8vIHBhZ2VzIGRhdGEgICBcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogSGFuZGxlIGxpc3Qgb3JkZXJcbiAgICAgICAgICovXG4gICAgICAgICRzY29wZS4kb24oJ29yZGVyLWNoYW5nZWQnLCBmdW5jdGlvbihldnQsIHBhcmFtcykgeyAgIFxuICAgICAgICAgICAgJHNjb3BlLmV2ZW50cy5sb2FkKHtvcmRlcjogcGFyYW1zfSk7IC8vIHJlbG9hZCBjYXJkc1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBIYW5kbGUgcGFnaW5hdGlvblxuICAgICAgICAgKi9cbiAgICAgICAgJHNjb3BlLiRvbignY2FyZHMtcGFnZS1jaGFuZ2VkJywgZnVuY3Rpb24oZXZ0LCBwYXJhbXMpIHtcbiAgICAgICAgICAgICRzY29wZS5ldmVudHMubG9hZChwYXJhbXMpOyAvLyByZWxvYWQgY2FyZHNcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQ3JlYXRlIGNhcmRcbiAgICAgICAgICovXG4gICAgICAgICRzY29wZS4kb24oJ25ldy1jYXJkJywgZnVuY3Rpb24oZXZ0LCBpdGVtKSB7XG4gICAgICAgICAgICAkc2NvcGUuY29udGV4dC5jYXJkcy51bnNoaWZ0KGl0ZW0pO1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBQaW4gY2FyZFxuICAgICAgICAgKi9cbiAgICAgICAgJHNjb3BlLiRvbigncGluLWNhcmQnLCBmdW5jdGlvbihldnQsIGl0ZW0pIHtcbiAgICAgICAgICAgXG4gICAgICAgICAgICBpZihpdGVtLnN0aWNreSkge1xuICAgICAgICAgICAgICAgIC8vIG5vdCBzdGlja3kgYW55bW9yZVxuICAgICAgICAgICAgICAgIGl0ZW0uc3RpY2t5ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaXRlbS5jbGFzcyA9IGl0ZW0uY2xhc3MgPyBpdGVtLmNsYXNzLnJlcGxhY2UoXCJzdGlja3lcIiwgXCJcIikgOiBcIlwiO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBzdGlja3kuIFB1dCBpdCBmaXJzdFxuICAgICAgICAgICAgICAgIGl0ZW0uc3RpY2t5ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBpdGVtLmNsYXNzID0gaXRlbS5jbGFzcyA/IGl0ZW0uY2xhc3MgKyBcIiBzdGlja3lcIiA6IFwic3RpY2t5XCI7ICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGxldCBpbmRleCA9ICRzY29wZS5jb250ZXh0LmNhcmRzLmluZGV4T2YoaXRlbSk7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmNvbnRleHQuY2FyZHMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgICAgICAkc2NvcGUuY29udGV4dC5jYXJkcy51bnNoaWZ0KGl0ZW0pO1xuICAgICAgICAgICAgfSBcbiAgICAgICAgfSk7XG4gICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBEZWxldGUgY2FyZFxuICAgICAgICAgKi9cbiAgICAgICAgJHNjb3BlLiRvbignZGVsZXRlLWNhcmQnLCBmdW5jdGlvbihldnQsIGl0ZW0pIHtcbiAgICAgICAgICAgIGxldCBpbmRleCA9ICRzY29wZS5jb250ZXh0LmNhcmRzLmluZGV4T2YoaXRlbSk7XG4gICAgICAgICAgICAkc2NvcGUuY29udGV4dC5jYXJkcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBVcGRhdGUgY2FyZFxuICAgICAgICAgKi9cbiAgICAgICAgJHNjb3BlLiRvbigndXBkYXRlLWNhcmQnLCBmdW5jdGlvbihldnQsIG9yaWdpbmFsLCBuZXdDYXJkKSB7XG4gICAgICAgICAgICBsZXQgaW5kZXggPSAkc2NvcGUuY29udGV4dC5jYXJkcy5pbmRleE9mKG9yaWdpbmFsKTtcbiAgICAgICAgICAgIGFuZ3VsYXIuZXh0ZW5kKCRzY29wZS5jb250ZXh0LmNhcmRzW2luZGV4XSwgbmV3Q2FyZCk7XG4gICAgICAgIH0pO1xuICAgIH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCl7XG4gICAgXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5ob21lJykuY29udHJvbGxlcignU2VhcmNoQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJ0hvbWVDb250ZXh0U2VydmljZScsIFNlYXJjaENvbnRyb2xsZXJdKTtcbiAgICBcbiAgICBmdW5jdGlvbiBTZWFyY2hDb250cm9sbGVyKCRzY29wZSwgSG9tZUNvbnRleHRTZXJ2aWNlKXtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBXYXkgdG8ga2VlcCBzaWJsaW5ncyBjb25uZWN0ZWQgYW5kIHNoYXJpbmcgc2NvcGVcbiAgICAgICAgICovXG4gICAgICAgICRzY29wZS5jb250ZXh0ID0gSG9tZUNvbnRleHRTZXJ2aWNlLmNvbnRleHQ7XG4gICAgfVxufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuaG9tZScpXG4gICAgICAgIC5maWx0ZXIoJ2hpZ2hsaWdodFRleHQnLCBmdW5jdGlvbigkc2NlKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHRleHQsIHBocmFzZSkge1xuICAgICAgICAgICAgICAgIGxldCBoaWdobGlnaHRlZCA9IHBocmFzZVxuICAgICAgICAgICAgICAgICAgICAgICAgPyB0ZXh0LnJlcGxhY2UobmV3IFJlZ0V4cCgnKCcgKyBwaHJhc2UgKyAnKScsICdnaScpLCAnPHNwYW4gY2xhc3M9XCJoaWdobGlnaHQtdGV4dFwiPiQxPC9zcGFuPicpXG4gICAgICAgICAgICAgICAgICAgICAgICA6IHRleHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICByZXR1cm4gJHNjZS50cnVzdEFzSHRtbChoaWdobGlnaHRlZCk7XG4gICAgICAgICAgICB9OyAgICAgICAgICAgIFxuICAgICAgICB9KTtcbn0pKCk7XG5cbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAuaG9tZScpLnNlcnZpY2UoJ0hvbWVDb250ZXh0U2VydmljZScsIGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5jb250ZXh0ID0ge1xuICAgICAgICBjYXJkczogW10sXG4gICAgICAgIHF1ZXJ5OiAnJ1xuICAgIH07XG59KTsiLCIoZnVuY3Rpb24gKCkge1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuc3RhY2tzJykuZGlyZWN0aXZlKCdzdGFja0Rlc2NyaXB0aW9uJywgWydjb25maWcnLFxuICAgICAgICBmdW5jdGlvbiAoY29uZmlnKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHJlc3RyaWN0OiAnRUEnLFxuICAgICAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IGNvbmZpZy5TUkNfRk9MREVSICsgJ3N0YWNrcy90ZW1wbGF0ZXMvc3RhY2stZGVzY3JpcHRpb24uaHRtbCcsXG4gICAgICAgICAgICAgICAgc2NvcGU6IHRydWUsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogWyckc2NvcGUnLCAnJHJvb3RTY29wZScsICckY29va2llcycsICckZWxlbWVudCcsIFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoJHNjb3BlLCAkcm9vdFNjb3BlLCAkY29va2llcywgJGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5ldmVudHMgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgKiBGaWx0ZXIgYnkgc3RhY2tcbiAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICRzY29wZS4kb24oJ3N0YWNrLXNlbGVjdGVkJywgZnVuY3Rpb24oZXZ0LCBzdGFjaykge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBwcm92aWRlIGluZm8gdG8gdmlld1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmNvbnRleHQuc3RhY2sgPSBzdGFjaztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmVmcmVzaCBhbmltYXRpb24gKHdoZW4gZWxlbWVudCBhbHJlYWR5IHZpc2libGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAkZWxlbWVudC5maW5kKCcuc3RhY2stZGVzY3JpcHRpb24nKS5hZGRDbGFzcygnZmxpcEluWCcpO1xuICAgICAgICAgICAgICAgICAgICAgICB9KTsgICAgXG5cbiAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAqIENsZWFyIHN0YWNrIGRlc2NyaXB0aW9uIGFuaW1hdGlvbiBjbGFzcyB3aGVuIGZpbmlzaGVkXG4gICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAkZWxlbWVudC5vbignd2Via2l0QW5pbWF0aW9uRW5kIG1vekFuaW1hdGlvbkVuZCBNU0FuaW1hdGlvbkVuZCBvYW5pbWF0aW9uZW5kIGFuaW1hdGlvbmVuZCcsICcuc3RhY2stZGVzY3JpcHRpb24nLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoXCJmbGlwSW5YXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICBpZigkY29va2llcy5nZXQoXCJzdGFja1wiKSkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBwcm92aWRlIGluZm8gdG8gdmlld1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmNvbnRleHQuc3RhY2sgPSAkY29va2llcy5nZXRPYmplY3QoXCJzdGFja1wiKTsgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAqIFVuY2hlY2sgY3VycmVudCBzdGFjayBmaWx0ZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5ldmVudHMucmVtb3ZlU3RhY2tGaWx0ZXIgPSBmdW5jdGlvbihzdGFjaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdzdGFjay11bnNlbGVjdGVkJywgc3RhY2spO1xuICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuJG9uKCdzdGFjay11bnNlbGVjdGVkJywgZnVuY3Rpb24oc3RhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5jb250ZXh0LnN0YWNrID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICogXG4gICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXZlbnRzLmVkaXRTdGFjayA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIF0pO1xufSkoKTsiLCIoZnVuY3Rpb24oKXtcbiAgICBcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLnN0YWNrcycpLmRpcmVjdGl2ZSgnc3RhY2tMaXN0UGFuZWwnLCBbJ2NvbmZpZycsICckY29va2llcycsICdxdWVyeUZhY3RvcnknLCBmdW5jdGlvbihjb25maWcsICRjb29raWVzLCBxdWVyeUZhY3Rvcnkpe1xuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgICAgICAgICAgc2NvcGU6IHRydWUsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IGNvbmZpZy5TUkNfRk9MREVSICsgJ3N0YWNrcy90ZW1wbGF0ZXMvc3RhY2stbGlzdC1wYW5lbC5odG1sJyxcbiAgICAgICAgICAgICAgICByZXBsYWNlOiB0cnVlLCAgICAgICBcbiAgICAgICAgICAgICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuY29udGV4dC5pbWdfZm9sZGVyID0gY29uZmlnLlBST0ZJTEVfSU1HX0ZPTERFUjtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLmNvbnRleHQuY3VycmVudF9zdGFjayA9ICRjb29raWVzLmdldE9iamVjdChcInN0YWNrXCIpOyBcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAqIE9uIHVuc2VsZWN0IHN0YWNrXG4gICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgc2NvcGUuJG9uKCdzdGFjay11bnNlbGVjdGVkJywgZnVuY3Rpb24gKHN0YWNrKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJlbW92ZSBmcm9tIFVJXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmZpbmQoJy5saXN0LWdyb3VwLWl0ZW0nKS5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmVtb3ZlIGZyb20gY29va2llXG4gICAgICAgICAgICAgICAgICAgICAgICAkY29va2llcy5yZW1vdmUoJ3N0YWNrJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJlbW92ZSBmcm9tIHNjb3BlXG4gICAgICAgICAgICAgICAgICAgICAgICBzY29wZS5jb250ZXh0LmN1cnJlbnRfc3RhY2sgPSBudWxsO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBxdWVyeSBuZXcgcmVzdWx0c1xuICAgICAgICAgICAgICAgICAgICAgICAgcXVlcnlGYWN0b3J5LmFsbCgpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBbJyRzY29wZScsICckcm9vdFNjb3BlJywgJyRsb2cnLCAnJGNvb2tpZXMnLCAnY29uZmlnJywgJ3N0YWNrc0ZhY3RvcnknLCAncXVlcnlGYWN0b3J5JywgJ01vZGFsU2VydmljZScsIFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbigkc2NvcGUsICRyb290U2NvcGUsICRsb2csICRjb29raWVzLCBjb25maWcsIHN0YWNrc0ZhY3RvcnksIHF1ZXJ5RmFjdG9yeSwgTW9kYWxTZXJ2aWNlKSB7XG4gICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5jb250ZXh0ID0ge307XG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXZlbnRzID0ge307XG4gICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICogR2V0IHN0YWNrIGxpc3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmNvbnRleHQuc3RhY2tzID0gc3RhY2tzRmFjdG9yeS5xdWVyeSgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIENyZWF0ZSBuZXcgc3RhY2tcbiAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmV2ZW50cy5hZGROZXcgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBNb2RhbFNlcnZpY2Uuc2hvd01vZGFsKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IGNvbmZpZy5TUkNfRk9MREVSICsgXCJzdGFja3MvdGVtcGxhdGVzL21vZGFscy9uZXctc3RhY2suaHRtbFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBcIk5ld1N0YWNrQ29udHJvbGxlclwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkudGhlbihmdW5jdGlvbihtb2RhbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RhbC5lbGVtZW50Lm1vZGFsKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFsLmNsb3NlLnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0KSB7ICAgIFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcHJlcGFyZSBkYXRhIHRvIHN1Ym1pdCB0byBzZXJ2ZXIgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHN0YWNrID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBtb2RhbC5zY29wZS5mb3JtLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBtb2RhbC5zY29wZS5mb3JtLmRlc2NyaXB0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhY2tzRmFjdG9yeS5zYXZlKHN0YWNrKS4kcHJvbWlzZS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBlbW1pdCBldmVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFjay5pZCA9IHJlc3BvbnNlLmlkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ25ldy1zdGFjaycsIHN0YWNrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFkZCB0byBzdGFja1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuc3RhY2tzLnVuc2hpZnQoc3RhY2spO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkbG9nLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkbG9nLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICogRmlsdGVyIGJ5IHN0YWNrXG4gICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5ldmVudHMuZmlsdGVyID0gZnVuY3Rpb24oJGV2ZW50LCBzdGFjaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBsaW5rID0gJCgkZXZlbnQuY3VycmVudFRhcmdldCk7XG4gICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmsuY2xvc2VzdCgndWwnKS5maW5kKCcubGlzdC1ncm91cC1pdGVtJykucmVtb3ZlQ2xhc3MoJ3NlbGVjdGVkJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGluay5wYXJlbnQoKS5hZGRDbGFzcygnc2VsZWN0ZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcGVyc2lzdCBmaWx0ZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkY29va2llcy5wdXRPYmplY3QoJ3N0YWNrJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogc3RhY2suaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHN0YWNrLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBzdGFjay5kZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5jb250ZXh0LmN1cnJlbnRfc3RhY2sgPSAkY29va2llcy5nZXRPYmplY3QoXCJzdGFja1wiKTsgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcXVlcnkgcmVzdWx0c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXJ5RmFjdG9yeS5ieVN0YWNrKHtzdGFja19pZDogc3RhY2suaWR9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB0ZWxsIHRoZSB3b3JsZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnc3RhY2stc2VsZWN0ZWQnLCBzdGFjayk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9ICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIFVuc2VsZWN0IHN0YWNrXG4gICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5ldmVudHMudW5zZWxlY3RTdGFja0ZpbHRlciA9IGZ1bmN0aW9uICgkZXZlbnQsIHN0YWNrKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdzdGFjay11bnNlbGVjdGVkJywgc3RhY2spO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH1dXG4gICAgICAgICAgICB9O1xuICAgIH1dKTtcbn0pKCk7IiwiKGZ1bmN0aW9uKCl7XG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5zdGFja3MnKS5mYWN0b3J5KCdzdGFja3NGYWN0b3J5JywgWyckcmVzb3VyY2UnLCAnY29uZmlnJywgZnVuY3Rpb24gKCRyZXNvdXJjZSwgY29uZmlnKSB7XG4gICAgICAgIHJldHVybiAkcmVzb3VyY2UoY29uZmlnLmFwaSArICcvc3RhY2tzLzppZCcsIHsgaWQ6ICdAX2lkJywgc3RhY2tfaWQ6ICdAc3RhY2tfaWQnIH0sIHtcbiAgICAgICAgICAgIHVwZGF0ZToge1xuICAgICAgICAgICAgICBtZXRob2Q6ICdQVVQnIFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZpbHRlcjoge1xuICAgICAgICAgICAgICB1cmw6IGNvbmZpZy5hcGkgKyAnL3N0YWNrcy86c3RhY2tfaWQvY2FyZHMnLCBcbiAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7IFxuICAgIH1dKTtcbn0pKCk7XG5cbiIsIihmdW5jdGlvbiAoKSB7XG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC50YWdzJykuZGlyZWN0aXZlKCdjdXJyZW50VGFncycsIFsnY29uZmlnJyxcbiAgICAgICAgZnVuY3Rpb24gKGNvbmZpZykge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICByZXN0cmljdDogJ0VBJyxcbiAgICAgICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBjb25maWcuU1JDX0ZPTERFUiArICd0YWdzL3RlbXBsYXRlcy9jdXJyZW50LXRhZ3MuaHRtbCcsXG4gICAgICAgICAgICAgICAgc2NvcGU6IHRydWUsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogWyckc2NvcGUnLCAnJGNvb2tpZXMnLCAncXVlcnlGYWN0b3J5JywgZnVuY3Rpb24gKCRzY29wZSwgJGNvb2tpZXMsIHF1ZXJ5RmFjdG9yeSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5ldmVudHMgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgKiBDdXJyZW50IHRhZ3MgZmlsdGVyc1xuICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICRzY29wZS5ldmVudHMucHJpbnRDdXJyZW50VGFncyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICBsZXQgY3VycmVudF9jb29raWVzID0gJGNvb2tpZXMuZ2V0T2JqZWN0KCd0YWdzW10nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgaWYoIHR5cGVvZihjdXJyZW50X2Nvb2tpZXMpICE9PSAndW5kZWZpbmVkJyApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5jb250ZXh0LnRhZ19maWx0ZXJzID0gY3VycmVudF9jb29raWVzO1xuICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgLy8gYWRkIG9uZSBtb3JlXG4gICAgICAgICAgICAgICAgICAgJHNjb3BlLiRvbigndGFnLWZpbHRlci1hZGRlZCcsIGZ1bmN0aW9uKGV2dCwgdGFnKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgcXVlcnlGYWN0b3J5LmJ5VGFncygpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5jb250ZXh0LnRhZ19maWx0ZXJzLnVuc2hpZnQodGFnKTtcbiAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgIC8vIERyYXcgdGFnIGZpbHRlcnMgb24gcGFnZSBsb2FkXG4gICAgICAgICAgICAgICAgICAgJHNjb3BlLmV2ZW50cy5wcmludEN1cnJlbnRUYWdzKCk7IFxuXG4gICAgICAgICAgICAgICAgICAgJHNjb3BlLmV2ZW50cy5yZW1vdmVUYWdGaWx0ZXIgPSBmdW5jdGlvbihldmVudCwgaW5kZXgsIHRhZykge1xuXG4gICAgICAgICAgICAgICAgICAgICAgIC8vIHJlbW92ZSBmcm9tIHZpZXdcbiAgICAgICAgICAgICAgICAgICAgICAgJChldmVudC5jdXJyZW50VGFyZ2V0KS5jbG9zZXN0KCdsaScpLnJlbW92ZUNsYXNzKCdhbmltYXRlZCcpOyAvLyBubyBoaWRlIGFuaW1hdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuY29udGV4dC50YWdfZmlsdGVycy5zcGxpY2UoaW5kZXgsIDEpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgIC8vIHJlbW92ZSB0YWcgZnJvbSBjb29raWVzXG4gICAgICAgICAgICAgICAgICAgICAgIGxldCBjdXJyZW50X2Nvb2tpZXMgPSAkY29va2llcy5nZXRPYmplY3QoJ3RhZ3NbXScpO1xuICAgICAgICAgICAgICAgICAgICAgICBsZXQgY29va2llX2luZGV4ID0gJC5pbkFycmF5KCB0YWcsIGN1cnJlbnRfY29va2llcyApO1xuICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50X2Nvb2tpZXMuc3BsaWNlKGNvb2tpZV9pbmRleCwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICRjb29raWVzLnB1dE9iamVjdCgndGFnc1tdJywgY3VycmVudF9jb29raWVzKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAvLyBxdWVyeVxuICAgICAgICAgICAgICAgICAgICAgICBxdWVyeUZhY3RvcnkuYnlUYWdzKCk7XG4gICAgICAgICAgICAgICAgICAgfSAgICAgXG4gICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICBdKTtcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLnRhZ3MnKS5kaXJlY3RpdmUoJ25ld1RhZycsIFsnY29uZmlnJywgJ3RhZ3NGYWN0b3J5JywgJyRyb290U2NvcGUnLCAnJGFuaW1hdGUnLFxuICAgICAgICBmdW5jdGlvbiAoY29uZmlnLCB0YWdzRmFjdG9yeSwgJHJvb3RTY29wZSwgJGFuaW1hdGUpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICByZXN0cmljdDogJ0VBJyxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogY29uZmlnLlNSQ19GT0xERVIgKyAnL3RhZ3MvdGVtcGxhdGVzL25ldy10YWcuaHRtbCcsXG4gICAgICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgICAgICAgICBjYXJkOiBcIj1kYXRhXCJcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLmV2ZW50cyA9IHt9O1xuICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vIGFyY2hldHlwZVxuICAgICAgICAgICAgICAgICAgICBzY29wZS50YWcgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAnJ1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIEluaXRpYWwgd2lkZ2V0IHN0YXRlXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBzY29wZS5kaXNwbGF5ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogSGlkZSB3aWRnZXRcbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLmV2ZW50cy5zaG93ID0gZnVuY3Rpb24oKSB7IFxuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuZGlzcGxheSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBzY29wZS52aXNpYmlsaXR5ID0gJ3Zpc2libGUnOyAvLyBjc3MgY2xhc3NcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5maW5kKCdpbnB1dCcpLmZvY3VzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCAwLjUpOyAvLyB0aW1lIHdpbGwgdmFyeSBhY2NvcmRpbmcgdG8gY3NzIHJ1bGVcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIEhpZGUgd2lkZ2V0XG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBzY29wZS5ldmVudHMuaGlkZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuZGlzcGxheSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUudmlzaWJpbGl0eSA9ICcnOyAvLyBjc3MgY2xhc3NcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLnRhZy5uYW1lID0gJyc7IC8vIHJlc2V0IGZpZWxkXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBjcmVhdGVzIGEgdGFnIGFuZCBhdHRhY2ggaXQgdG8gY3VycmVudCBjYXJkXG4gICAgICAgICAgICAgICAgICAgICAqIFxuICAgICAgICAgICAgICAgICAgICAgKiBAcmV0dXJucyB2b2lkXG4gICAgICAgICAgICAgICAgICAgICAqIEBicm9hZGNhc3RzIGV2ZW50XG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBzY29wZS5ldmVudHMuYWRkTmV3ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihzY29wZS50YWcubmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCB0YWcgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhcmRfaWQ6IHNjb3BlLmNhcmQuaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHNjb3BlLnRhZy5uYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWdzRmFjdG9yeS5zYXZlKHRhZywgZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFnLmlkID0gcmVzcG9uc2UuaWQ7IC8vIGFwcGVuZCB0YWcgaWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuZXZlbnRzLmZsYXNoQ2xhc3MoZWxlbWVudCwgJ29rJyk7IC8vIHV4IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYWRkIHRhZyBhcyB0aGUgbGFzdCB2aXNpYmxlIG9mIFggdGFnc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZih0eXBlb2Yoc2NvcGUuY2FyZC50YWdzKSAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYWRkIHRhZyB0byB0aGUgbGlzdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuY2FyZC50YWdzLnNwbGljZShzY29wZS5tYXhfbnVtX3RhZ3MtMSwgMCwgdGFnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNyZWF0ZSB0aGUgbGlzdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuY2FyZC50YWdzID0gW3RhZ107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLmV2ZW50cy5mbGFzaENsYXNzKGVsZW1lbnQsICdlcnJvcicpOyAvLyB1eCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY29wZS50YWcubmFtZSA9ICcnOyAvLyByZXNldCBmaWVsZFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIEtleSBldmVudCAoRW50ZXIpXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmJpbmQoXCJrZXlkb3duIGtleXByZXNzXCIsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoZXZlbnQud2hpY2ggPT09IDEzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuZXZlbnRzLmFkZE5ldygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIEFkZHMgYW5kIHJlbW92ZXMgYSBjbGFzc1xuICAgICAgICAgICAgICAgICAgICAgKiBcbiAgICAgICAgICAgICAgICAgICAgICogQHBhcmFtIHN0cmluZyBjbGFzc05hbWVcbiAgICAgICAgICAgICAgICAgICAgICogQHJldHVybnMgdm9pZFxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuZXZlbnRzLmZsYXNoQ2xhc3MgPSBmdW5jdGlvbihlbGVtZW50LCBjbGFzc05hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAkYW5pbWF0ZS5hZGRDbGFzcyhlbGVtZW50LCBjbGFzc05hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkYW5pbWF0ZS5yZW1vdmVDbGFzcyhlbGVtZW50LCBjbGFzc05hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCA1MDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIF0pO1xufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuaG9tZScpLmRpcmVjdGl2ZSgndGFnQ2xvdWQnLCBbJ2NvbmZpZycsIFxuICAgICAgICBmdW5jdGlvbiAoY29uZmlnKSB7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcmVzdHJpY3Q6ICdFQScsXG4gICAgICAgICAgICAgICAgc2NvcGU6IHRydWUsXG4gICAgICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSwgICAgIFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBjb25maWcuU1JDX0ZPTERFUiArICcvdGFncy90ZW1wbGF0ZXMvdGFnLWNsb3VkLmh0bWwnLFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJyRjb29raWVzJywgJyRyb290U2NvcGUnLCAncmVkdWNlQnlGaWx0ZXInLCBmdW5jdGlvbiAoJHNjb3BlLCAkY29va2llcywgJHJvb3RTY29wZSwgcmVkdWNlQnlGaWx0ZXIpIHtcblxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXZlbnRzID0ge307XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBLZWVwIHRyYWNrIG9mIGNhcmQgbGlzdCBjaGFuZ2VzXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuJG9uKCdjYXJkcy1sb2FkZWQnLCBmdW5jdGlvbiAoZXZ0LCBjb2xsZWN0aW9uKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHR5cGVvZihjb2xsZWN0aW9uLmRhdGEpID09PSAndW5kZWZpbmVkJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGV4Y2x1ZGUgY2FyZCB3aXRoIG5vIHRhZ3NcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjYXJkcyA9IGNvbGxlY3Rpb24uZGF0YS5maWx0ZXIoZnVuY3Rpb24gKGNhcmQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2FyZC50YWdzID8gY2FyZC50YWdzLmxlbmd0aCA+IDAgOiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZXh0cmFjdCB0YWdzIGZyb20gY2FyZFxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHRhZ3MgPSBjYXJkcy5tYXAoZnVuY3Rpb24gKGNhcmQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShhbmd1bGFyLnRvSnNvbihjYXJkLnRhZ3MpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBtZXJnZSB0YWdzIGluIGZsYXR0ZW4gYXJyYXlcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBtZXJnZWQgPSBbXS5jb25jYXQuYXBwbHkoW10sIHRhZ3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZWxpbWluYXRlIGR1cGxpY2F0ZXMgYW5kIHNlcnZlIGFycmF5IHRvIHZpZXdcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS50YWdzID0gcmVkdWNlQnlGaWx0ZXIobWVyZ2VkLCAnaWQnKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXZlbnRzLmZpbHRlciA9IGZ1bmN0aW9uKHRhZykge1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY3VycmVudF9jb29raWVzID0gJGNvb2tpZXMuZ2V0T2JqZWN0KCd0YWdzW10nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoIHR5cGVvZihjdXJyZW50X2Nvb2tpZXMpID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGZpcnN0IG9uZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRfY29va2llcyA9IFt0YWddO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhdm9pZCBkdXBsaWNhdGVzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudF9jb29raWVzID0gYW5ndWxhci5mcm9tSnNvbihjdXJyZW50X2Nvb2tpZXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKCBjdXJyZW50X2Nvb2tpZXMubWFwKGZ1bmN0aW9uKGUpIHsgcmV0dXJuIGUuaWQ7IH0pLmluZGV4T2YodGFnLmlkKSA9PT0gLTEgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRfY29va2llcy5wdXNoKHRhZyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBhZGQgdGFnIHRvIGN1cnJlbnQgdGFncyBsaXN0XG4gICAgICAgICAgICAgICAgICAgICAgICAkY29va2llcy5wdXRPYmplY3QoJ3RhZ3NbXScsIGN1cnJlbnRfY29va2llcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNvbWVvbmUgZWxzZSB3aWxsIG1ha2UgdGhlIHF1ZXJ5XG4gICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ3RhZy1maWx0ZXItYWRkZWQnLCB0YWcpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICBdKTtcbn0pKCk7IiwiKGZ1bmN0aW9uKCl7XG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC50YWdzJykuZmFjdG9yeSgndGFnc0ZhY3RvcnknLCBbJyRyZXNvdXJjZScsICdjb25maWcnLCBmdW5jdGlvbiAoJHJlc291cmNlLCBjb25maWcpIHtcbiAgICAgICAgcmV0dXJuICRyZXNvdXJjZShjb25maWcuYXBpICsgJy90YWdzLzppZCcsIHsgaWQ6ICdAaWQnLCBjYXJkX2lkOiAnQGNhcmRfaWQnIH0sIHtcbiAgICAgICAgICAgIHNhdmU6IHtcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJywgXG4gICAgICAgICAgICAgICAgdXJsOiBjb25maWcuYXBpICsgJy9jYXJkcy86Y2FyZF9pZC90YWdzJyAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmaWx0ZXI6IHtcbiAgICAgICAgICAgICAgdXJsOiBjb25maWcuYXBpICsgJy9jYXJkcy90YWdzL2FsbCcsIFxuICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnIFxuICAgICAgICAgICAgfVxuICAgICAgICB9KTsgXG4gICAgfV0pO1xufSkoKTtcblxuIiwiKGZ1bmN0aW9uKCkge1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5jYXJkcycpLmNvbnRyb2xsZXIoJ0VkaXRDYXJkQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJ2RhdGEnLCAnY2xvc2UnLCBFZGl0Q2FyZENvbnRyb2xsZXJdKTtcbiAgICBcbiAgICBmdW5jdGlvbiBFZGl0Q2FyZENvbnRyb2xsZXIoJHNjb3BlLCBkYXRhLCBjbG9zZSkge1xuXG4gICAgICAgICRzY29wZS5mb3JtID0ge307XG4gICAgICAgICRzY29wZS5mb3JtLm5hbWUgPSBkYXRhLmNhcmQubmFtZTtcbiAgICAgICAgJHNjb3BlLmZvcm0uY29udGVudCA9IGRhdGEuY2FyZC5jb250ZW50O1xuXG4gICAgICAgICRzY29wZS5jbG9zZSA9IGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgXG4gICAgICAgICAgICBjbG9zZShyZXN1bHQsIDIwMCk7IC8vIGNsb3NlLCBidXQgZ2l2ZSAyMDBtcyBmb3IgYm9vdHN0cmFwIHRvIGFuaW1hdGVcbiAgICAgICAgfTtcbiAgICB9O1xufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5ob21lJykuY29udHJvbGxlcignWWVzTm9Db250cm9sbGVyJywgWyckc2NvcGUnLCAnZGF0YScsICdjbG9zZScsIGZ1bmN0aW9uICgkc2NvcGUsIGRhdGEsIGNsb3NlKSB7XG4gICAgICAgICAgIFxuICAgICAgICAgICAgJHNjb3BlLnRpdGxlID0gZGF0YS50aXRsZTtcbiAgICAgICAgICAgICRzY29wZS5jb250ZW50ID0gZGF0YS5jb250ZW50O1xuICAgICAgICAgICBcbiAgICAgICAgICAgICRzY29wZS5jbG9zZSA9IGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICBjbG9zZShyZXN1bHQsIDIwMCk7IC8vIGNsb3NlLCBidXQgZ2l2ZSAyMDBtcyBmb3IgYm9vdHN0cmFwIHRvIGFuaW1hdGVcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1dKTtcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5ob21lJykuY29udHJvbGxlcignTWFya2Rvd25Db250cm9sbGVyJywgWyckc2NvcGUnLCAnZGF0YScsICdjbG9zZScsIE1hcmtkb3duQ29udHJvbGxlcl0pO1xuICAgIFxuICAgIGZ1bmN0aW9uIE1hcmtkb3duQ29udHJvbGxlcigkc2NvcGUsIGRhdGEsIGNsb3NlKSB7XG5cbiAgICAgICAgJHNjb3BlLnRpdGxlID0gZGF0YS5jYXJkLm5hbWU7XG4gICAgICAgICRzY29wZS5jb250ZW50ID0gZGF0YS5jYXJkLmNvbnRlbnQ7XG5cbiAgICAgICAgJHNjb3BlLmRpc21pc3NNb2RhbCA9IGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgIGNsb3NlKHJlc3VsdCwgMjAwKTsgLy8gY2xvc2UsIGJ1dCBnaXZlIDIwMG1zIGZvciBib290c3RyYXAgdG8gYW5pbWF0ZVxuICAgICAgICB9O1xuICAgIH07XG59KSgpOyIsIihmdW5jdGlvbigpIHtcbiAgICBcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLnN0YWNrcycpLmNvbnRyb2xsZXIoJ05ld1N0YWNrQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJyRlbGVtZW50JywgJ2Nsb3NlJywgTmV3U3RhY2tDb250cm9sbGVyXSk7XG4gICAgXG4gICAgZnVuY3Rpb24gTmV3U3RhY2tDb250cm9sbGVyKCRzY29wZSwgJGVsZW1lbnQsIGNsb3NlKSB7XG4gICAgICAgXG4gICAgICAgICRzY29wZS5mb3JtID0ge1xuICAgICAgICAgICAgbmFtZTogJycsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJydcbiAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEtleSBldmVudCAoRW50ZXIpXG4gICAgICAgICAqL1xuICAgICAgICAkZWxlbWVudC5maW5kKCdpbnB1dCcpLmJpbmQoXCJrZXlkb3duIGtleXByZXNzXCIsIGZ1bmN0aW9uIChldmVudCkge1xuXG4gICAgICAgICAgICBpZihldmVudC53aGljaCA9PT0gMTMpIHtcbiAgICAgICAgICAgICAgICAkZWxlbWVudC5tb2RhbCgnaGlkZScpO1xuICAgICAgICAgICAgICAgICRzY29wZS5jbG9zZSh0cnVlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgJHNjb3BlLmNsb3NlID0gZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICBcbiAgICAgICAgICAgIGNsb3NlKHJlc3VsdCwgMjAwKTsgLy8gY2xvc2UsIGJ1dCBnaXZlIDIwMG1zIGZvciBib290c3RyYXAgdG8gYW5pbWF0ZVxuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgIFxuICAgIH07XG59KSgpOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
