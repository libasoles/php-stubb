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
                       
                    let order = angular.fromJson($cookies.get('order'));
                       
                    // initial position
                    $scope.order = !angular.isUndefined(order.order) ? order.order : 'updated_at';
                    $scope.direction = !angular.isUndefined(order.direction) ? order.direction : 'desc';

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
                  
                    $scope.events = {};
                  
                    /**
                     * Draw widget when data is available
                     */
                    $scope.$on('cards-loaded', function(evt, data) {
                        $scope.pages = data; 
                        $scope.display = data.data.length && (data.prev_page_url || data.next_page_url);
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
    
    function queryFactory($log, $cookies, $rootScope, cardsFactory, stacksFactory) {
        
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
            
            if(filters.includes('tags') && typeof($cookies.get('tags')) !== 'undefined') {
                params.tags = angular.fromJson($cookies.get('tags')).map(function(x){ return x.id; });
            }
            if(filters.includes('stack') && typeof($cookies.get('stack')) !== 'undefined') {
                params.stack = angular.fromJson($cookies.get('stack')).id;
            }
            if(filters.includes('order') && typeof($cookies.get('order')) !== 'undefined') {
                params.order = angular.fromJson($cookies.get('order'));                
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
        
        /**
         * Way to keep siblings connected and sharing scope
         */
        $scope.context = HomeContextService.context;
        
        /**
         * Get cards list
         */
        $scope.load = function(params) {
            
            // get data from server
            queryFactory
                .all(params).$promise.then(function (response) {
                             
                }, function(err) {
                    $log.error(err);
                });  
        };
        
        $scope.load(); // run at page load
        
        $scope.$on('cards-loaded', function(evt, response) {
            $scope.context.cards = response.data; // cards list
            $scope.context.pages = response; // pages data   
        });
        
        /**
         * Handle list order
         */
        $scope.$on('order-changed', function(evt, params) {   
            $scope.load({order: params}); // reload cards
        });
        
        /**
         * Handle pagination
         */
        $scope.$on('cards-page-changed', function(evt, params) {
            $scope.load(params); // reload cards
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
        
        /**
         * Filter by stack
         */
        $scope.$on('stack-selected', function(evt, stack) {
            
            // query results
            queryFactory.byStack({stack_id: stack.id});
          
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
            $scope.context.stack = $cookies.get("stack");
        }
        
        /**
         * Current tags filters
         */
        $scope.printCurrentTags = function() {
            
            let current_cookies = $cookies.get('tags');
            if( typeof(current_cookies) !== 'undefined' ) {
                $scope.tag_filters = angular.fromJson(current_cookies);
            }
        }
        
        // add one more
        $scope.$on('tag-filter-added', function(evt, tag) {
            $scope.tag_filters.unshift(tag);
        });
        
        // Draw tag filters on page load
        $scope.printCurrentTags(); 
        
        $scope.removeTagFilter = function(event, index, tag) {
            
            // remove from view
            $(event.currentTarget).closest('li').removeClass('animated pulse'); // no end animation
            $scope.tag_filters.splice(index, 1);
            
            // remove tag from cookies
            let current_cookies = angular.fromJson($cookies.get('tags'));
            let cookie_index = $.inArray( tag, current_cookies );
            current_cookies.splice(cookie_index, 1);
            $cookies.putObject('tags', current_cookies);
        }       
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
                        
                        let current_cookies = $cookies.get('tags');
                                 
                        if( typeof(current_cookies) === 'undefined') {
                            // first one
                            current_cookies = [tag];
                        } else {
                            // avoid duplicates
                            current_cookies = angular.fromJson(current_cookies);
                            if( current_cookies.map(function(e) { return e.id; }).indexOf(tag.id) === -1 ) {
                                current_cookies.push(tag);
                                $rootScope.$broadcast('tag-filter-added', tag);
                            }
                        }
                        
                        // add tag to current tags list
                        $cookies.putObject('tags', current_cookies);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC1jb25maWcuanMiLCJjYXJkcy9tb2R1bGUuanMiLCJjb21tb24vbW9kdWxlLmpzIiwiaG9tZS9tb2R1bGUuanMiLCJzdGFja3MvbW9kdWxlLmpzIiwidGFncy9tb2R1bGUuanMiLCJjYXJkcy9jYXJkcy1yb3V0ZS5qcyIsImNvbW1vbi9hcHAtcm91dGUuanMiLCJob21lL2hvbWUtcm91dGUuanMiLCJsb2dpbi9sb2dpbi5qcyIsInN0YWNrcy9ob21lLXJvdXRlLmpzIiwiY2FyZHMvZGlyZWN0aXZlcy9jYXJkLmpzIiwiY2FyZHMvZGlyZWN0aXZlcy9uZXctY2FyZC5qcyIsImNhcmRzL2RpcmVjdGl2ZXMvb3JkZXItYnkuanMiLCJjYXJkcy9kaXJlY3RpdmVzL3BhZ2luYXRlLWNhcmRzLmpzIiwiY2FyZHMvc2VydmljZXMvY2FyZHMtZmFjdG9yeS5qcyIsImNvbW1vbi9jb250cm9sbGVycy9oZWFkZXItY29udHJvbGxlcnMuanMiLCJjb21tb24vY29udHJvbGxlcnMvbGF5b3V0LWNvbnRyb2xsZXJzLmpzIiwiY29tbW9uL2RpcmVjdGl2ZXMvYXV0b2ZvY3VzLmpzIiwiY29tbW9uL2RpcmVjdGl2ZXMvZWxhc3RpY0FyZWEuanMiLCJjb21tb24vZGlyZWN0aXZlcy9oYXNodGFnaWZ5LmpzIiwiY29tbW9uL2RpcmVjdGl2ZXMvc2Vzc2lvbkRyb3Bkb3duLmpzIiwiY29tbW9uL2RpcmVjdGl2ZXMvc2hvd01vcmUuanMiLCJjb21tb24vZmlsdGVycy9yZWR1Y2VCeS5qcyIsImNvbW1vbi9zZXJ2aWNlcy9xdWVyeS1mYWN0b3J5LmpzIiwiaG9tZS9jb250cm9sbGVycy9ob21lLWNvbnRyb2xsZXIuanMiLCJob21lL2NvbnRyb2xsZXJzL2xpc3QtY29udHJvbGxlci5qcyIsImhvbWUvY29udHJvbGxlcnMvc2VhcmNoLWNvbnRyb2xsZXIuanMiLCJob21lL2ZpbHRlcnMvaGlnaGxpZ2h0VGV4dC5qcyIsImhvbWUvc2VydmljZXMvaG9tZS1jb250ZXh0LmpzIiwic3RhY2tzL2RpcmVjdGl2ZXMvc3RhY2stbGlzdC1wYW5lbC5qcyIsInN0YWNrcy9zZXJ2aWNlcy9zdGFja3MtZmFjdG9yeS5qcyIsInRhZ3MvZGlyZWN0aXZlcy9uZXctdGFnLmpzIiwidGFncy9kaXJlY3RpdmVzL3RhZy1jbG91ZC5qcyIsInRhZ3Mvc2VydmljZS90YWdzLWZhY3RvcnkuanMiLCJjYXJkcy9jb250cm9sbGVycy9tb2RhbHMvZWRpdC1jYXJkLWNvbnRyb2xsZXIuanMiLCJjb21tb24vY29udHJvbGxlcnMvbW9kYWxzL3llcy1uby1jb250cm9sbGVyLmpzIiwiaG9tZS9jb250cm9sbGVycy9tb2RhbHMvbWFya2Rvd24tY29udHJvbGxlci5qcyIsInN0YWNrcy9jb250cm9sbGVycy9tb2RhbHMvbmV3LXN0YWNrLWNvbnRyb2xsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQUdBLFFBQUEsT0FBQSxjQUFBO0tBQ0EsU0FBQSxVQUFBO1FBQ0EsT0FBQTtRQUNBLFNBQUE7UUFDQSxjQUFBO1FBQ0EsY0FBQTtRQUNBLHNCQUFBOzs7QUNUQSxRQUFBLE9BQUEsYUFBQTs7O0FDQUE7O0FBRUEsUUFBQSxPQUFBLE9BQUEsQ0FBQSxNQUFBLFdBQUEsYUFBQSxjQUFBLFlBQUEsdUJBQUE7Ozs7O0FBS0EsUUFBQSxPQUFBLE9BQUEsT0FBQSxDQUFBLGlCQUFBLGdCQUFBLHNCQUFBO0lBQ0EsVUFBQSxlQUFBLGNBQUEsb0JBQUEsUUFBQTs7Ozs7UUFLQSxjQUFBLFNBQUEsUUFBQSxTQUFBO1lBQ0EsZ0JBQUE7WUFDQSxVQUFBO1lBQ0EscUJBQUE7WUFDQSxvQkFBQTtZQUNBLGdCQUFBLFFBQUE7Ozs7OztRQU1BLGFBQUEsYUFBQSxPQUFBOzs7OztRQUtBLG1CQUFBLHFCQUFBO1lBQ0EsUUFBQTtZQUNBLFFBQUE7OztRQUdBLG1CQUFBO1FBQ0EsbUJBQUEsa0JBQUE7UUFDQSxtQkFBQSxpQkFBQTtRQUNBLG1CQUFBLHlCQUFBOzs7QUFHQSxRQUFBLE9BQUEsT0FBQSxJQUFBLENB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O2dCQUVBLEtBQUEsU0FBQTtnQkFDQSxLQUFBLFFBQUEsS0FBQSxRQUFBLEtBQUEsUUFBQSxZQUFBO2dCQUNBLElBQUEsUUFBQSxPQUFBLFFBQUEsTUFBQSxRQUFBO2dCQUNBLE9BQUEsUUFBQSxNQUFBLE9BQUEsT0FBQTtnQkFDQSxPQUFBLFFBQUEsTUFBQSxRQUFBOzs7Ozs7O1FBT0EsT0FBQSxJQUFBLGVBQUEsU0FBQSxLQUFBLE1BQUE7WUFDQSxJQUFBLFFBQUEsT0FBQSxRQUFBLE1BQUEsUUFBQTtZQUNBLE9BQUEsUUFBQSxNQUFBLE9BQUEsT0FBQTs7Ozs7O1FBTUEsT0FBQSxJQUFBLGVBQUEsU0FBQSxLQUFBLFVBQUEsU0FBQTtZQUNBLElBQUEsUUFBQSxPQUFBLFFBQUEsTUFBQSxRQUFBO1lBQ0EsUUFBQSxPQUFBLE9BQUEsUUFBQSxNQUFBLFFBQUE7Ozs7OztRQU1BLE9BQUEsSUFBQSxrQkFBQSxTQUFBLEtBQUEsT0FBQTs7O1lBR0EsYUFBQSxRQUFBLENBQUEsVUFBQSxNQUFBOzs7WUFHQSxPQUFBLFFBQUEsUUFBQTs7O1lBR0EsU0FBQSxLQUFBLHNCQUFBLFNBQUE7Ozs7OztRQU1BLFNBQUEsR0FBQSxnRkFBQSxzQkFBQSxXQUFBO1lBQ0EsRUFBQSxNQUFBLFlBQUE7OztRQUdBLEdBQUEsU0FBQSxJQUFBLFVBQUE7OztZQUdBLE9BQUEsUUFBQSxRQUFBLFNBQUEsSUFBQTs7Ozs7O1FBTUEsT0FBQSxtQkFBQSxXQUFBOztZQUVBLElBQUEsa0JBQUEsU0FBQSxJQUFBO1lBQ0EsSUFBQSxPQUFBLHFCQUFBLGNBQUE7Z0JBQ0EsT0FBQSxjQUFBLFFBQUEsU0FBQTs7Ozs7UUFLQSxPQUFBLElBQUEsb0JBQUEsU0FBQSxLQUFBLEtBQUE7WUFDQSxPQUFBLFlBQUEsUUFBQTs7OztRQUlBLE9BQUE7O1FBRUEsT0FBQSxrQkFBQSxTQUFBLE9BQUEsT0FBQSxLQUFBOzs7WUFHQSxFQUFBLE1BQUEsZUFBQSxRQUFBLE1BQUEsWUFBQTtZQUNBLE9BQUEsWUFBQSxPQUFBLE9BQUE7OztZQUdBLElBQUEs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QUE7Z0JBQ0EsVUFBQTtnQkFDQSxhQUFBLE9BQUEsYUFBQTtnQkFDQSxTQUFBO2dCQUNBLE9BQUE7b0JBQ0EsTUFBQTs7Z0JBRUEsTUFBQSxTQUFBLE9BQUEsU0FBQSxPQUFBOztvQkFFQSxNQUFBLFNBQUE7OztvQkFHQSxNQUFBLE1BQUE7d0JBQ0EsTUFBQTs7Ozs7O29CQU1BLE1BQUEsVUFBQTs7Ozs7b0JBS0EsTUFBQSxPQUFBLE9BQUEsV0FBQTt3QkFDQSxNQUFBLFVBQUE7d0JBQ0EsTUFBQSxhQUFBO3dCQUNBLFdBQUEsV0FBQTs0QkFDQSxRQUFBLEtBQUEsU0FBQTsyQkFDQTs7Ozs7O29CQU1BLE1BQUEsT0FBQSxPQUFBLFdBQUE7d0JBQ0EsTUFBQSxVQUFBO3dCQUNBLE1BQUEsYUFBQTt3QkFDQSxNQUFBLElBQUEsT0FBQTs7Ozs7Ozs7O29CQVNBLE1BQUEsT0FBQSxTQUFBLFlBQUE7O3dCQUVBLEdBQUEsTUFBQSxJQUFBLE1BQUE7OzRCQUVBLElBQUEsTUFBQTtnQ0FDQSxTQUFBLE1BQUEsS0FBQTtnQ0FDQSxNQUFBLE1BQUEsSUFBQTs7OzRCQUdBLFlBQUEsS0FBQSxLQUFBLFNBQUEsVUFBQTtnQ0FDQSxJQUFBLEtBQUEsU0FBQTtnQ0FDQSxNQUFBLE9BQUEsV0FBQSxTQUFBOzs7Z0NBR0EsR0FBQSxPQUFBLE1BQUEsS0FBQSxVQUFBLFlBQUE7O29DQUVBLE1BQUEsS0FBQSxLQUFBLE9BQUEsTUFBQSxhQUFBLEdBQUEsR0FBQTt1Q0FDQTs7b0NBRUEsTUFBQSxLQUFBLE9BQUEsQ0FBQTs7OytCQUdBLFNBQUEsS0FBQTtnQ0FDQSxNQUFBLE9BQUEsV0FBQSxTQUFBOzs0QkFFQSxNQUFBLElBQUEsT0FBQTs7Ozs7OztvQkFPQSxRQUFBLEtBQUEsb0JBQUEsVUFBQSxPQUFBO3dCQUNBLEdBQUEsTUFBQSxVQUFBLElBQUE7NEJBQ0EsTUFBQSxPQUFBOzRCQUNBLE1BQUE7Ozs7Ozs7Ozs7b0JBVUEsTUFBQSxPQUFBLGFBQUEsU0FBQSxTQUFBLFdBQUE7O3dCQUVBLFNBQUEsU0FBQSxTQUFBOzZCQUNBLEtBQUEsV0FBQTtnQ0FDQSxXQUFBLFdBQUE7b0NBQ0EsU0FBQSxZQUFBLFNBQUE7bUNBQ0E7Ozs7Ozs7O0FDdEdBLENBQUEsWUFBQTtJQUNBLFFBQUEsT0FBQSxZQUFBLFVBQUEsWUFBQSxDQUFBO1FBQ0EsVUFBQSxRQUFBOztZQUVBLE9BQUE7Z0JBQ0EsVUFBQTtnQkFDQSxPQUFBO2dCQUNBLFNBQUE7Z0JBQ0EsYUFBQSxPQUFBLGFBQUE7Z0JBQ0EsWUFBQSxDQUFBLFVBQUEsWUFBQSxjQUFBLGtCQUFBLFVBQUEsUUFBQSxVQUFBLFlBQUEsZ0JBQUE7O29CQUVBLE9BQUEsU0FBQTs7Ozs7b0JBS0EsT0FBQSxJQUFBLGdCQUFBLFVBQUEsS0FBQSxZQUFBOzt3QkFFQSxHQUFBLE9BQUEsV0FBQSxVQUFBOzRCQUNBOzs7d0JBR0EsSUFBQSxRQUFBLFdBQUEsS0FBQSxPQUFBLFVBQUEsTUFBQTs0QkFDQSxPQUFBLEtBQUEsT0FBQSxLQUFBLEtBQUEsU0FBQSxJQUFBOzs7O3dCQUlBLElBQUEsT0FBQSxNQUFBLElBQUEsVUFBQSxNQUFBOzRCQUNBLE9BQUEsS0FBQSxNQUFBLFFBQUEsT0FBQSxLQUFBOzs7O3dCQUlBLElBQUEsU0FBQSxHQUFBLE9BQUEsTUFBQSxJQUFBOzt3QkFFQSxPQUFBLE9BQUEsZUFBQSxRQUFBOzs7b0JBR0EsT0FBQSxPQUFBLFNBQUEsU0FBQSxLQUFBOzt3QkFFQSxJQUFBLGtCQUFBLFNBQUEsSUFBQTs7d0JBRUEsSUFBQSxPQUFBLHFCQUFBLGFBQUE7OzRCQUVBLGtCQUFBLENBQUE7K0JBQ0E7OzRCQUVBLGtCQUFBLFFBQUEsU0FBQTs0QkFDQSxJQUFBLGdCQUFBLElBQUEsU0FBQSxHQUFBLEVBQUEsT0FBQSxFQUFBLE9BQUEsUUFBQSxJQUFBLFFBQUEsQ0FBQSxJQUFBO2dDQUNBLGdCQUFBLEtBQUE7Z0NBQ0EsV0FBQSxXQUFBLG9CQUFBOzs7Ozt3QkFLQSxTQUFBLFVBQUEsUUFBQTs7Ozs7OztBQ3REQSxDQUFBLFVBQUE7SUFDQSxRQUFBLE9BQUEsWUFBQSxRQUFBLGVBQUEsQ0FBQSxhQUFBLFVBQUEsVUFBQSxXQUFBLFFBQUE7UUFDQSxPQUFBLFVBQUEsT0FBQSxNQUFBLGFBQUEsRUFBQSxJQUFBLE9BQUEsU0FBQSxjQUFBO1lBQ0EsTUFBQTtnQkFDQSxRQUFBO2dCQUNBLEtBQUEsT0FBQSxNQUFBOzs7Ozs7O0FDTEEsQ0FBQSxXQUFBOztJQUVBLFFBQUEsT0FBQSxhQUFBLFdBQUEsc0JBQUEsQ0FBQSxVQUFBLFFBQUEsU0FBQTs7SUFFQSxTQUFBLG1CQUFBLFFBQUEsTUFBQSxPQUFBOztRQUVBLE9BQUEsT0FBQTtRQUNBLE9BQUEsS0FBQSxPQUFBLEtBQUEsS0FBQTtRQUNBLE9BQUEsS0FBQSxVQUFBLEtBQUEsS0FBQTs7UUFFQSxPQUFBLFFBQUEsVUFBQSxRQUFBOztZQUVBLE1BQUEsUUFBQTs7S0FFQTs7QUNkQSxDQUFBLFlBQUE7O0lBRUEsUUFBQSxPQUFBLFlBQUEsV0FBQSxtQkFBQSxDQUFBLFVBQUEsUUFBQSxTQUFBLFVBQUEsUUFBQSxNQUFBLE9BQUE7O1lBRUEsT0FBQSxRQUFBLEtBQUE7WUFDQSxPQUFBLFVBQUEsS0FBQTs7WUFFQSxPQUFBLFFBQUEsVUFBQSxRQUFBO2dCQUNBLE1BQUEsUUFBQTs7OztBQ1JBLENBQUEsV0FBQTs7SUFFQSxRQUFBLE9BQUEsWUFBQSxXQUFBLHNCQUFBLENBQUEsVUFBQSxRQUFBLFNBQUE7O0lBRUEsU0FBQSxtQkFBQSxRQUFBLE1BQUEsT0FBQTs7UUFFQSxPQUFBLFFBQUEsS0FBQSxLQUFBO1FBQ0EsT0FBQSxVQUFBLEtBQUEsS0FBQTs7UUFFQSxPQUFBLGVBQUEsVUFBQSxRQUFBO1lBQ0EsTUFBQSxRQUFBOztLQUVBOztBQ1pBLENBQUEsV0FBQTs7SUFFQSxRQUFBLE9BQUEsY0FBQSxXQUFBLHNCQUFBLENBQUEsVUFBQSxZQUFBLFNBQUE7O0lBRUEsU0FBQSxtQkFBQSxRQUFBLFVBQUEsT0FBQTs7UUFFQSxPQUFBLE9BQUE7WUFDQSxNQUFBO1lBQ0EsYUFBQTs7Ozs7O1FBTUEsU0FBQSxLQUFBLFNBQUEsS0FBQSxvQkFBQSxVQUFBLE9BQUE7O1lBRUEsR0FBQSxNQUFBLFVBQUEsSUFBQTtnQkFDQSxTQUFBLE1BQUE7Z0JBQ0EsT0FBQSxNQUFBO2dCQUNBLE9BQUE7Ozs7UUFJQSxPQUFBLFFBQUEsVUFBQSxRQUFBOztZQUVBLE1BQUEsUUFBQTs7OztLQUlBO0tBQ0EiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBUaGlzIGNvbmZpZyBpcyBpbnRlbmRlZCB0byBiZSBpbmplY3RlZCBpbiB5b3VyIHNyY1xuICovXG5hbmd1bGFyLm1vZHVsZShcImFwcC5jb25maWdcIiwgW10pXG4gICAgLmNvbnN0YW50KFwiY29uZmlnXCIsIHtcbiAgICAgICAgXCJhcGlcIjogXCJodHRwOi8vbG9jYWxob3N0OjgwMDEvYXBpL3YxXCIsIFxuICAgICAgICBcImRlYnVnXCI6IHRydWUsXG4gICAgICAgIFwiU1JDX0ZPTERFUlwiOiAnL3NyYy9hcHBfbW9kdWxlcy8nLFxuICAgICAgICBcIklNR19GT0xERVJcIjogJy9pbWcvJyxcbiAgICAgICAgXCJQUk9GSUxFX0lNR19GT0xERVJcIjogJy9pbWcvcHJvZmlsZS8nXG4gICAgfSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwLmNhcmRzJywgW10pO1xuXG4iLCIndXNlIHN0cmljdCc7XG5cbmFuZ3VsYXIubW9kdWxlKCdhcHAnLCBbJ25nJywgJ25nUm91dGUnLCAnbmdDb29raWVzJywgJ2FwcC5jb25maWcnLCAnYXBwLmhvbWUnLCAnYW5ndWxhck1vZGFsU2VydmljZScsICdwYXNjYWxwcmVjaHQudHJhbnNsYXRlJ10pO1xuICBcbi8qKlxuICogUmVzdCBvZiB0aGUgZ2xvYmFsIGNvbmZpZyBjYW4gYmUgZm91bmQgaW4gYXBwLWNvbmZpZyBtb2R1bGVcbiAqLyAgXG5hbmd1bGFyLm1vZHVsZSgnYXBwJykuY29uZmlnKFsnJGh0dHBQcm92aWRlcicsICckbG9nUHJvdmlkZXInLCAnJHRyYW5zbGF0ZVByb3ZpZGVyJywgJ2NvbmZpZycsIFxuICAgIGZ1bmN0aW9uICgkaHR0cFByb3ZpZGVyLCAkbG9nUHJvdmlkZXIsICR0cmFuc2xhdGVQcm92aWRlciwgY29uZmlnKSB7XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQWpheCBjYWxsc1xuICAgICAgICAgKi8gXG4gICAgICAgICRodHRwUHJvdmlkZXIuZGVmYXVsdHMuaGVhZGVycy5jb21tb24gPSB7IFxuICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vanNvbjtvZGF0YT12ZXJib3NlJyxcbiAgICAgICAgICAgICdYLUxvZ2luLUFqYXgtY2FsbCc6ICd0cnVlJyxcbiAgICAgICAgICAgICdYLVJlcXVlc3RlZC1XaXRoJzogXCJYTUxIdHRwUmVxdWVzdFwiLFxuICAgICAgICAgICAgJ1gtQ1NSRi1UT0tFTic6IExhcmF2ZWwuY3NyZlRva2VuXG4gICAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogRGVidWdnaW5nXG4gICAgICAgICAqLyBcbiAgICAgICAgJGxvZ1Byb3ZpZGVyLmRlYnVnRW5hYmxlZChjb25maWcuZGVidWcpO1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRyYW5zbGF0aW9uc1xuICAgICAgICAgKi8gICAgIFxuICAgICAgICAkdHJhbnNsYXRlUHJvdmlkZXIudXNlU3RhdGljRmlsZXNMb2FkZXIoe1xuICAgICAgICAgICAgcHJlZml4OiAnL2kxOG4vbG9jYWxlLScsXG4gICAgICAgICAgICBzdWZmaXg6ICcuanNvbidcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJHRyYW5zbGF0ZVByb3ZpZGVyLnVzZUNvb2tpZVN0b3JhZ2UoKTtcbiAgICAgICAgJHRyYW5zbGF0ZVByb3ZpZGVyLnByZWZlcnJlZExhbmd1YWdlKCdlbl9VUycpO1xuICAgICAgICAkdHJhbnNsYXRlUHJvdmlkZXIuZmFsbGJhY2tMYW5ndWFnZSgnZW5fVVMnKTtcbiAgICAgICAgJHRyYW5zbGF0ZVByb3ZpZGVyLnVzZVNhbml0aXplVmFsdWVTdHJhdGVneSgnZXNjYXBlJyk7XG59XSk7XG4gXG5hbmd1bGFyLm1vZHVsZSgnYXBwJykucnVuKFtmdW5jdGlvbiAoKSB7XG4gXG59XSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwLmhvbWUnLCBbJ25nUm91dGUnLCAnYXBwLmNvbmZpZycsICduZ0FuaW1hdGUnLCAnYXBwLmNhcmRzJywgJ2FwcC5zdGFja3MnLCAnYXBwLnRhZ3MnLCAnaGMubWFya2VkJywgJ25nU2FuaXRpemUnXSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwLnN0YWNrcycsIFsnbmdSZXNvdXJjZSddKTtcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAudGFncycsIFsnbmdSZXNvdXJjZSddKTtcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAuY2FyZHMnKS5jb25maWcoZnVuY3Rpb24oJHJvdXRlUHJvdmlkZXIpIHtcbiAgIFxufSk7IiwiKGZ1bmN0aW9uICgpIHtcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwJykuY29uZmlnKFsnJHJvdXRlUHJvdmlkZXInLCAnY29uZmlnJywgZnVuY3Rpb24oJHJvdXRlUHJvdmlkZXIsIGNvbmZpZykge1xuXG4gICAgICAkcm91dGVQcm92aWRlclxuICAgICAgICAud2hlbignLycsIHtcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBjb25maWcuU1JDX0ZPTERFUiArICdob21lL3RlbXBsYXRlcy9ob21lLXRlbXBsYXRlLmh0bWwnLFxuICAgICAgICAgICAgY29udHJvbGxlcjogJ0hvbWVDb250cm9sbGVyJyxcbiAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ2hvbWUnXG4gICAgICAgIH0pXG5cbiAgICAgICAgLm90aGVyd2lzZSh7cmVkaXJlY3RUbzogJy8nfSk7IFxuICAgIH1dKTtcbn0pKCk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcC5ob21lJykuY29uZmlnKGZ1bmN0aW9uKCRyb3V0ZVByb3ZpZGVyKSB7XG5cbn0pOyIsIlxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xuXG4gICAgLy8gc3dpdGNoIGZvcm1zXG4gICAgJCgnLm1lc3NhZ2UgYScpLmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgXG4gICAgICAgICQoJ2Zvcm0nKS5hbmltYXRlKHtoZWlnaHQ6IFwidG9nZ2xlXCIsIG9wYWNpdHk6IFwidG9nZ2xlXCJ9LCBcInNsb3dcIik7XG4gICAgICAgIFxuICAgICAgICBpZih3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgPT0gJy9sb2dpbicpIHtcbiAgICAgICAgICAgIGhpc3RvcnkucHVzaFN0YXRlKHt9LCBcIlJlZ2lzdGVyXCIsIFwiL3JlZ2lzdGVyXCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaGlzdG9yeS5wdXNoU3RhdGUoe30sIFwiTG9naW5cIiwgXCIvbG9naW5cIik7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgICQoJ2Zvcm0gLmhlbHAtYmxvY2snKS5oaWRlKCk7XG4gICAgfSk7XG5cbn0pOyIsImFuZ3VsYXIubW9kdWxlKCdhcHAuc3RhY2tzJykuY29uZmlnKGZ1bmN0aW9uKCRyb3V0ZVByb3ZpZGVyKSB7XG5cbn0pOyIsIihmdW5jdGlvbiAoKSB7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmNhcmRzJykuZGlyZWN0aXZlKCdjYXJkJyxcbiAgICAgICAgWydjb25maWcnLCBmdW5jdGlvbiAoY29uZmlnKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBjb25maWcuU1JDX0ZPTERFUiArICdjYXJkcy90ZW1wbGF0ZXMvY2FyZC5odG1sJyxcbiAgICAgICAgICAgICAgICByZXN0cmljdDogJ0EnLFxuICAgICAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgICAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgICAgICAgICAgY2FyZDogXCI9ZGF0YVwiXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBbJyRzY29wZScsICckcm9vdFNjb3BlJywgJyRsb2cnLCAnY29uZmlnJywgJ2NhcmRzRmFjdG9yeScsICdNb2RhbFNlcnZpY2UnLFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoJHNjb3BlLCAkcm9vdFNjb3BlLCAkbG9nLCBjb25maWcsIGNhcmRzRmFjdG9yeSwgTW9kYWxTZXJ2aWNlKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5ldmVudHMgPSB7fTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBEaXNwbGF5IG9ubHkgWCB0YWdzXG4gICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5tYXhfbnVtX3RhZ3MgPSAzO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIFBpbiBDYXJkIChtYWtlIGl0ICdzdGlja3knKVxuICAgICAgICAgICAgICAgICAgICAgICAgICogXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBAcGFyYW0gQ2FyZCBpdGVtXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBAcmV0dXJucyB2b2lkXG4gICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5ldmVudHMucGluQ2FyZCA9IGZ1bmN0aW9uIChpdGVtKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgY2FyZCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGl0ZW0uaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0aWNreTogIWl0ZW0uc3RpY2t5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYWpheCBjYWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FyZHNGYWN0b3J5LnVwZGF0ZShjYXJkKS4kcHJvbWlzZS50aGVuKGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBlbW1pdCBldmVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ3Bpbi1jYXJkJywgaXRlbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkbG9nLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIERlbGV0ZSBDYXJkXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIEBwYXJhbSBDYXJkIGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgICAgICAqIEByZXR1cm5zIHZvaWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmV2ZW50cy5kZWxldGUgPSBmdW5jdGlvbiAoaXRlbSkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSnVzdCBwcm92aWRlIGEgdGVtcGxhdGUgdXJsLCBhIGNvbnRyb2xsZXIgYW5kIGNhbGwgJ3Nob3dNb2RhbCcuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTW9kYWxTZXJ2aWNlLnNob3dNb2RhbCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBjb25maWcuU1JDX0ZPTERFUiArIFwiY29tbW9uL3RlbXBsYXRlcy9tb2RhbHMvY29uZmlybS5odG1sXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IFwiWWVzTm9Db250cm9sbGVyXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0czoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICd0aXRsZSc6ICdEZWxldGUgY2FyZD8nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdjb250ZW50JzogXCJZb3UnbGwgbm90IGJlIGFibGUgdG8gcmVjb3ZlciBpdFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIChtb2RhbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RhbC5lbGVtZW50Lm1vZGFsKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFsLmNsb3NlLnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0KSB7ICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFqYXggY2FsbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhcmRzRmFjdG9yeS5kZWxldGUoe2lkOiBpdGVtLmlkfSkuJHByb21pc2UudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBlbW1pdCBldmVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ2RlbGV0ZS1jYXJkJywgaXRlbSk7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRsb2cuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIEVkaXQgQ2FyZFxuICAgICAgICAgICAgICAgICAgICAgICAgICogXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBAcGFyYW0gQ2FyZCBpdGVtXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBAcmV0dXJucyB2b2lkXG4gICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5ldmVudHMuZWRpdCA9IGZ1bmN0aW9uIChpdGVtKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBNb2RhbFNlcnZpY2Uuc2hvd01vZGFsKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IGNvbmZpZy5TUkNfRk9MREVSICsgXCJjYXJkcy90ZW1wbGF0ZXMvbW9kYWxzL2VkaXQtY2FyZC5odG1sXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IFwiRWRpdENhcmRDb250cm9sbGVyXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0czoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhcmQ6IGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKG1vZGFsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFsLmVsZW1lbnQubW9kYWwoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWwuY2xvc2UudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBwcmVwYXJlIGRhdGEgdG8gYmUgc2VuZCB0byBzZXJ2ZXIgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNhcmQgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBpdGVtLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBtb2RhbC5zY29wZS5mb3JtLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IG1vZGFsLnNjb3BlLmZvcm0uY29udGVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFqYXggY2FsbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhcmRzRmFjdG9yeS51cGRhdGUoY2FyZCkuJHByb21pc2UudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBlbW1pdCBldmVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ3VwZGF0ZS1jYXJkJywgaXRlbSwgY2FyZCk7ICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRsb2cuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIFZpZXcgY29udGVudCBpbiBtb2RhbGJveCB3aXRoIE1hcmtkb3duIChyaWNoIHRleHQgbW9kZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIFxuICAgICAgICAgICAgICAgICAgICAgICAgICogQHBhcmFtIENhcmQgaXRlbVxuICAgICAgICAgICAgICAgICAgICAgICAgICogQHJldHVybnMgdm9pZFxuICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXZlbnRzLnZpZXdBc01hcmtkb3duTW9kYWwgPSBmdW5jdGlvbiAoaXRlbSkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSnVzdCBwcm92aWRlIGEgdGVtcGxhdGUgdXJsLCBhIGNvbnRyb2xsZXIgYW5kIGNhbGwgJ3Nob3dNb2RhbCcuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTW9kYWxTZXJ2aWNlLnNob3dNb2RhbCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBjb25maWcuU1JDX0ZPTERFUiArIFwiaG9tZS90ZW1wbGF0ZXMvbW9kYWxzL21hcmtkb3duLmh0bWxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogXCJNYXJrZG93bkNvbnRyb2xsZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXRzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2NhcmQnOiBpdGVtXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIChtb2RhbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RhbC5lbGVtZW50Lm1vZGFsKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1dXG4gICAgICAgIH07XG4gICAgfV0pO1xufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5jYXJkcycpLmRpcmVjdGl2ZSgnbmV3Q2FyZEZvcm0nLFxuICAgICAgICBbJ2NvbmZpZycsIGZ1bmN0aW9uIChjb25maWcpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgICAgICAgICBjYXJkOiBcIj1cIlxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogY29uZmlnLlNSQ19GT0xERVIgKyAnY2FyZHMvdGVtcGxhdGVzL25ldy1mb3JtLmh0bWwnLFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJyRyb290U2NvcGUnLCAnJGxvZycsICdjYXJkc0ZhY3RvcnknLCBmdW5jdGlvbiAoJHNjb3BlLCAkcm9vdFNjb3BlLCAkbG9nLCBjYXJkc0ZhY3RvcnkpIHtcblxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXZlbnRzID0ge307XG5cbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFN1Ym1pdCBmb3JtXG4gICAgICAgICAgICAgICAgICAgICAqIEByZXR1cm5zIHZvaWRcbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5ldmVudHMuY3JlYXRlQ2FyZCA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCRzY29wZS5jb250ZW50KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgZGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogJHNjb3BlLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6ICRzY29wZS5jb250ZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhcmRzRmFjdG9yeS5zYXZlKGRhdGEpLiRwcm9taXNlLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY2xhc3MgPSAnaGlnaGxpZ2h0ZWQnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmlkID0gcmVzcG9uc2UuaWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnbmV3LWNhcmQnLCBkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJGxvZy5lcnJvcihyZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5jb250ZW50ID0gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXX1cbiAgICAgICAgfV0pO1xufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuY2FyZHMnKS5kaXJlY3RpdmUoJ29yZGVyQnknLCBbJ2NvbmZpZycsXG4gICAgICAgIGZ1bmN0aW9uIChjb25maWcpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICByZXN0cmljdDogJ0VBJyxcbiAgICAgICAgICAgICAgICBzY29wZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogY29uZmlnLlNSQ19GT0xERVIgKyAnL2NhcmRzL3RlbXBsYXRlcy9vcmRlci1ieS5odG1sJyxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBbJyRzY29wZScsICckcm9vdFNjb3BlJywgJyRjb29raWVzJywgZnVuY3Rpb24gKCRzY29wZSwgJHJvb3RTY29wZSwgJGNvb2tpZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5ldmVudHMgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGxldCBvcmRlciA9IGFuZ3VsYXIuZnJvbUpzb24oJGNvb2tpZXMuZ2V0KCdvcmRlcicpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vIGluaXRpYWwgcG9zaXRpb25cbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLm9yZGVyID0gIWFuZ3VsYXIuaXNVbmRlZmluZWQob3JkZXIub3JkZXIpID8gb3JkZXIub3JkZXIgOiAndXBkYXRlZF9hdCc7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5kaXJlY3Rpb24gPSAhYW5ndWxhci5pc1VuZGVmaW5lZChvcmRlci5kaXJlY3Rpb24pID8gb3JkZXIuZGlyZWN0aW9uIDogJ2Rlc2MnO1xuXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5ldmVudHMudXBkYXRlID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBkYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yZGVyOiAkc2NvcGUub3JkZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0aW9uOiAkc2NvcGUuZGlyZWN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHBlcnNpc3RcbiAgICAgICAgICAgICAgICAgICAgICAgICRjb29raWVzLnB1dE9iamVjdCgnb3JkZXInLCBkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdvcmRlci1jaGFuZ2VkJywgZGF0YSk7IC8vIGVtbWl0XG4gICAgICAgICAgICAgICAgICAgIH0gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIF0pO1xufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAnKS5kaXJlY3RpdmUoJ3BhZ2luYXRlQ2FyZHMnLCBbJ2NvbmZpZycsXG4gICAgICAgIGZ1bmN0aW9uIChjb25maWcpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICByZXN0cmljdDogJ0VBJyxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogY29uZmlnLlNSQ19GT0xERVIgKyAnL2NhcmRzL3RlbXBsYXRlcy9wYWdpbmF0ZS1jYXJkcy5odG1sJyxcbiAgICAgICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6ICc9J1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogWyckc2NvcGUnLCAnJHJvb3RTY29wZScsIGZ1bmN0aW9uICgkc2NvcGUsICRyb290U2NvcGUpIHtcbiAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXZlbnRzID0ge307XG4gICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIERyYXcgd2lkZ2V0IHdoZW4gZGF0YSBpcyBhdmFpbGFibGVcbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS4kb24oJ2NhcmRzLWxvYWRlZCcsIGZ1bmN0aW9uKGV2dCwgZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnBhZ2VzID0gZGF0YTsgXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGlzcGxheSA9IGRhdGEuZGF0YS5sZW5ndGggJiYgKGRhdGEucHJldl9wYWdlX3VybCB8fCBkYXRhLm5leHRfcGFnZV91cmwpO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBCcm9hZGNhc3QgY2hhbmdlc1xuICAgICAgICAgICAgICAgICAgICAgKiBAcmV0dXJucyB2b2lkXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXZlbnRzLm5hdmlnYXRlID0gZnVuY3Rpb24gKCRldmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAkZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICRldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdGFyZ2V0ID0gJGV2ZW50LmN1cnJlbnRUYXJnZXQ7XG4gICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHR5cGVvZih0YXJnZXQuYXR0cmlidXRlc1snZGlzYWJsZWQnXSkgPT09ICd1bmRlZmluZWQnIHx8ICF0YXJnZXQuYXR0cmlidXRlc1snZGlzYWJsZWQnXS52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnY2FyZHMtcGFnZS1jaGFuZ2VkJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWdlOiB0YXJnZXQuYXR0cmlidXRlc1snZGF0YS1wYWdlJ10udmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTsgLy8gZW1taXRcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1dXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgXSk7XG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmNhcmRzJykuZmFjdG9yeSgnY2FyZHNGYWN0b3J5JywgWyckcmVzb3VyY2UnLCAnY29uZmlnJywgZnVuY3Rpb24oJHJlc291cmNlLCBjb25maWcpIHtcblxuICAgICAgICByZXR1cm4gJHJlc291cmNlKGNvbmZpZy5hcGkgKyAnL2NhcmRzLzppZCcsIFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGlkOiAnQGlkJyxcbiAgICAgICAgICAgICAgICBwYWdlOiAnQHBhZ2UnXG4gICAgICAgICAgICB9LCBcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBxdWVyeToge1xuICAgICAgICAgICAgICAgICAgICB1cmw6IGNvbmZpZy5hcGkgKyAnL2NhcmRzL3RhZ3MvYWxsJyxcbiAgICAgICAgICAgICAgICAgICAgaXNBcnJheTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybVJlc3BvbnNlOiBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhbmd1bGFyLmZyb21Kc29uKHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdXBkYXRlOiB7XG4gICAgICAgICAgICAgICAgICBtZXRob2Q6ICdQVVQnIFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pOyBcbiAgICB9XSk7XG59KSgpO1xuXG4iLCIoZnVuY3Rpb24gKCkge1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmNvbnRyb2xsZXIoJ0hlYWRlckNvbnRyb2xsZXInLCBbJyRzY29wZScsIEhlYWRlckNvbnRyb2xsZXJdKTtcblxuICAgIGZ1bmN0aW9uIEhlYWRlckNvbnRyb2xsZXIoJHNjb3BlKSB7XG4gICAgICAgIFxuICAgIH1cbn0pKCk7XG5cblxuIiwiKGZ1bmN0aW9uICgpIHtcblxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAnKS5jb250cm9sbGVyKCdMYXlvdXRDb250cm9sbGVyJywgWyckc2NvcGUnLCAnJHNjZScsIExheW91dENvbnRyb2xsZXJdKTtcblxuICAgIGZ1bmN0aW9uIExheW91dENvbnRyb2xsZXIoJHNjb3BlLCAkc2NlKSB7XG5cbiAgICAgICAgJHNjb3BlLnRhZ1VzZXJDbGljayA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHZhciB0YWdUZXh0ID0gZS50YXJnZXQuaW5uZXJUZXh0O1xuICAgICAgICAgICAgYWxlcnQoJ3RhZ1VzZXJDbGljaywgdGFnVGV4dDogJyArIHRhZ1RleHQpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgJHNjb3BlLnRhZ1Rlcm1DbGljayA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHZhciB0YWdUZXh0ID0gZS50YXJnZXQuaW5uZXJUZXh0O1xuICAgICAgICAgICAgYWxlcnQoJ3RhZ1Rlcm1DbGljaywgdGFnVGV4dDogJyArIHRhZ1RleHQpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLy8gWW91IGNvdWxkIGRlZmluZSAndGFnVXNlckNsaWNrJyBhbmQgJ3RhZ1Rlcm1DbGljaydcbiAgICAgICAgLy8gb24gdGhlICckcm9vdFNjb3BlJy4gVGhpcyB3YXkgeW91IGNhbiBoYW5kbGUgd2hhdGV2ZXJcbiAgICAgICAgLy8gbG9naWMgeW91IHdhbnQgZm9yIGhhc2h0YWdzIGluIG9uZSBwbGFjZSByYXRoZXIgdGhhblxuICAgICAgICAvLyBoYXZpbmcgdG8gZGVmaW5lIGl0IGluIGVhY2ggY29udHJvbGxlci5cbiAgICAgICAgXG4gICAgICAgICRzY29wZS50cnVzdEh0bWwgPSBmdW5jdGlvbihodG1sKSB7XG4gICAgICAgICAgICAvLyBTYW5pdGl6ZSBtYW51YWxseSBpZiBuZWNlc3NhcnkuIEl0J3MgbGlrZWx5IHRoaXNcbiAgICAgICAgICAgIC8vIGh0bWwgaGFzIGFscmVhZHkgYmVlbiBzYW5pdGl6ZWQgc2VydmVyIHNpZGVcbiAgICAgICAgICAgIC8vIGJlZm9yZSBpdCB3ZW50IGludG8geW91ciBkYXRhYmFzZS5cbiAgICAgICAgICAgIC8vIERvbid0IGhvbGQgbWUgbGlhYmxlIGZvciBYU1MuLi4gbmV2ZXIgYXNzdW1lIDp+KVxuICAgICAgICAgICAgcmV0dXJuICRzY2UudHJ1c3RBc0h0bWwoaHRtbCk7XG4gICAgICAgIH07XG4gICAgfVxufSkoKTtcblxuXG4iLCIoZnVuY3Rpb24gKCkge1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAnKS5kaXJlY3RpdmUoJ2F1dG9mb2N1cycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnQScsXG4gICAgICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50WzBdLmZvY3VzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSk7XG59KSgpO1xuXG4gICAgICIsIihmdW5jdGlvbiAoKSB7XG4gICAgLy8gQmVjYXVzZSBvZiB0aGUgYW5tZSBhbmQgRSB0eXBlLCB3b3JrcyBhdXRvbWF0aWNhbGx5IGZvciBldmVyeSB0ZXh0YXJlYVxuICAgIC8vIHJlZjogaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vdGhvbXNlZGRvbi80NzAzOTY4XG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmRpcmVjdGl2ZSgnZWxhc3RpY0FyZWEnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByZXN0cmljdDogJ0EnLFxuICAgICAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRyaWJ1dGVzKSB7XG4gICAgICAgICAgICAgICAgdmFyIHRocmVzaG9sZCA9IDM1LFxuICAgICAgICAgICAgICAgICAgICAgICAgbWluSGVpZ2h0ID0gZWxlbWVudFswXS5vZmZzZXRIZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nTGVmdCA9IGVsZW1lbnQuY3NzKCdwYWRkaW5nTGVmdCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZ1JpZ2h0ID0gZWxlbWVudC5jc3MoJ3BhZGRpbmdSaWdodCcpO1xuXG4gICAgICAgICAgICAgICAgdmFyICRzaGFkb3cgPSBhbmd1bGFyLmVsZW1lbnQoJzxkaXY+PC9kaXY+JykuY3NzKHtcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgICAgICAgICAgICAgICAgIHRvcDogLTEwMDAwLFxuICAgICAgICAgICAgICAgICAgICBsZWZ0OiAtMTAwMDAsXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiBlbGVtZW50WzBdLm9mZnNldFdpZHRoIC0gcGFyc2VJbnQocGFkZGluZ0xlZnQgfHwgMCkgLSBwYXJzZUludChwYWRkaW5nUmlnaHQgfHwgMCksXG4gICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiBlbGVtZW50LmNzcygnZm9udFNpemUnKSxcbiAgICAgICAgICAgICAgICAgICAgZm9udEZhbWlseTogZWxlbWVudC5jc3MoJ2ZvbnRGYW1pbHknKSxcbiAgICAgICAgICAgICAgICAgICAgbGluZUhlaWdodDogZWxlbWVudC5jc3MoJ2xpbmVIZWlnaHQnKSxcbiAgICAgICAgICAgICAgICAgICAgcmVzaXplOiAnbm9uZSdcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5ib2R5KS5hcHBlbmQoJHNoYWRvdyk7XG5cbiAgICAgICAgICAgICAgICB2YXIgdXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdGltZXMgPSBmdW5jdGlvbiAoc3RyaW5nLCBudW1iZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCByID0gJyc7IGkgPCBudW1iZXI7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHIgKz0gc3RyaW5nO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHI7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB2YXIgdmFsID0gZWxlbWVudC52YWwoKS5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLyYvZywgJyZhbXA7JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxuJC8sICc8YnIvPiZuYnNwOycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcbi9nLCAnPGJyLz4nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXHN7Mix9L2csIGZ1bmN0aW9uIChzcGFjZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGltZXMoJyZuYnNwOycsIHNwYWNlLmxlbmd0aCAtIDEpICsgJyAnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICRzaGFkb3cuaHRtbCh2YWwpO1xuXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuY3NzKCdoZWlnaHQnLCBNYXRoLm1heCgkc2hhZG93WzBdLm9mZnNldEhlaWdodCArIHRocmVzaG9sZCwgbWluSGVpZ2h0KSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgJHNoYWRvdy5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGVsZW1lbnQuYmluZCgna2V5dXAga2V5ZG93biBrZXlwcmVzcyBjaGFuZ2UnLCB1cGRhdGUpO1xuICAgICAgICAgICAgICAgIHVwZGF0ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG59KSgpOyIsIihmdW5jdGlvbiAoKSB7IFxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAnKS5kaXJlY3RpdmUoJ2hhc2h0YWdpZnknLCBbJyR0aW1lb3V0JywgJyRjb21waWxlJyxcbiAgICAgICAgZnVuY3Rpb24oJHRpbWVvdXQsICRjb21waWxlKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHJlc3RyaWN0OiAnQScsXG4gICAgICAgICAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgICAgICAgICAgdUNsaWNrOiAnJnVzZXJDbGljaycsXG4gICAgICAgICAgICAgICAgICAgIHRDbGljazogJyZ0ZXJtQ2xpY2snXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaHRtbCA9IGVsZW1lbnQuaHRtbCgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaHRtbCA9PT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhdHRycy51c2VyQ2xpY2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBodG1sID0gaHRtbC5yZXBsYWNlKC8ofFxccykqQChcXHcrKS9nLCAnJDE8YSBuZy1jbGljaz1cInVDbGljayh7JGV2ZW50OiAkZXZlbnR9KVwiIGNsYXNzPVwiaGFzaHRhZ1wiPkAkMjwvYT4nKTsgXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhdHRycy50ZXJtQ2xpY2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBodG1sID0gaHRtbC5yZXBsYWNlKC8oXnxcXHMpKiMoXFx3KykvZywgJyQxPGEgbmctY2xpY2s9XCJ0Q2xpY2soeyRldmVudDogJGV2ZW50fSlcIiBjbGFzcz1cImhhc2h0YWdcIj4jJDI8L2E+Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuaHRtbChodG1sKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgJGNvbXBpbGUoZWxlbWVudC5jb250ZW50cygpKShzY29wZSk7XG4gICAgICAgICAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICBdKTtcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwJykuZGlyZWN0aXZlKCdzZXNzaW9uRHJvcGRvd24nLCBbJ2NvbmZpZycsXG4gICAgICAgIGZ1bmN0aW9uIChjb25maWcpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICByZXN0cmljdDogJ0VBJyxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogY29uZmlnLlNSQ19GT0xERVIgKyAnL2NvbW1vbi90ZW1wbGF0ZXMvc2Vzc2lvbi1kcm9wZG93bi5odG1sJywgICBcbiAgICAgICAgICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiBcIj1cIlxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnRzLCBhdHRycykge1xuICAgICAgICAgICAgICAgICAgICBzY29wZS5pbWdfZm9sZGVyID0gY29uZmlnLlBST0ZJTEVfSU1HX0ZPTERFUjtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgZnVuY3Rpb24gKCRzY29wZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS51c2VyID0gJHNjb3BlLmRhdGE7XG4gICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICBdKTsgICAgICAgXG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwJykuZGlyZWN0aXZlKCdzaG93TW9yZScsXG4gICAgICAgIFsnY29uZmlnJywgZnVuY3Rpb24gKGNvbmZpZykge1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBjb25maWcuU1JDX0ZPTERFUiArICdjb21tb24vdGVtcGxhdGVzL3Nob3dNb3JlLmh0bWwnLFxuICAgICAgICAgICAgICAgIHJlc3RyaWN0OiAnQScsXG4gICAgICAgICAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgICAgICAgICAnc2hvd01vcmVIZWlnaHQnOiAnQCdcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJyRlbGVtZW50JywgJyRpbnRlcnZhbCcsIGZ1bmN0aW9uICgkc2NvcGUsICRlbGVtZW50LCAkaW50ZXJ2YWwpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmV4cGFuZGVkID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICRpbnRlcnZhbChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVuZGVyU3R5bGVzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCAzMDApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXhwYW5kYWJsZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gcmVuZGVyU3R5bGVzKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICgkZWxlbWVudC5oZWlnaHQoKSA+PSAkc2NvcGUuc2hvd01vcmVIZWlnaHQgJiYgJHNjb3BlLmV4cGFuZGVkID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXhwYW5kYWJsZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuc2hvd0xlc3NTdHlsZSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnbWF4LWhlaWdodCc6ICRzY29wZS5zaG93TW9yZUhlaWdodCArICdweCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ292ZXJmbG93JzogJ2hpZGRlbidcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1dKTtcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwJylcbiAgICAgICAgLmZpbHRlcigncmVkdWNlQnknLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoY29sbGVjdGlvbiwgZmllbGQpIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICByZXR1cm4gY29sbGVjdGlvbi5yZWR1Y2UoZnVuY3Rpb24ob3V0cHV0LCBjdXJyZW50KXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKCFmaWVsZEV4aXN0cyhvdXRwdXQsIGZpZWxkLCBjdXJyZW50W2ZpZWxkXSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG91dHB1dC5jb25jYXQoY3VycmVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gb3V0cHV0O1xuICAgICAgICAgICAgICAgICAgICB9LCBbXSk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGZpZWxkRXhpc3RzKGhheXN0YWNrLCBmaWVsZE5hbWUsIGZpZWxkVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGhheXN0YWNrLnNvbWUoZnVuY3Rpb24oZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZWxbZmllbGROYW1lXSA9PT0gZmllbGRWYWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgfSk7IFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07ICAgICAgICAgICAgXG4gICAgICAgIH0pO1xufSkoKTtcblxuIiwiKGZ1bmN0aW9uICgpIHtcbiAgICBcbiAgICAgYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmZhY3RvcnkoJ3F1ZXJ5RmFjdG9yeScsIFsnJGxvZycsICckY29va2llcycsICckcm9vdFNjb3BlJywgJ2NhcmRzRmFjdG9yeScsICdzdGFja3NGYWN0b3J5JywgJ3RhZ3NGYWN0b3J5JywgcXVlcnlGYWN0b3J5XSk7XG4gICAgXG4gICAgZnVuY3Rpb24gcXVlcnlGYWN0b3J5KCRsb2csICRjb29raWVzLCAkcm9vdFNjb3BlLCBjYXJkc0ZhY3RvcnksIHN0YWNrc0ZhY3RvcnkpIHtcbiAgICAgICAgXG4gICAgICAgIHZhciBmYWN0b3J5ID0ge307XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogZ2V0IGFsbCBjYXJkcyBmcm9tIHNlcnZlciBmb3IgYSBnaXZlbiB1c2VyXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAcGFyYW0ganNvbiBwYXJhbXNcbiAgICAgICAgICogQHJldHVybnMgY2FyZHNGYWN0b3J5XG4gICAgICAgICAqIEBicm9hZGNhc3QgY2FyZHMgbGlzdFxuICAgICAgICAgKi9cbiAgICAgICAgZmFjdG9yeS5hbGwgPSBmdW5jdGlvbiAocGFyYW1zKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHBhcmFtcyA9IGdldEZpbHRlcnMocGFyYW1zLCBbJ29yZGVyJywgJ3N0YWNrJywgJ3RhZ3MnXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIHF1ZXJ5XG4gICAgICAgICAgICByZXR1cm4gY2FyZHNGYWN0b3J5XG4gICAgICAgICAgICAgICAgLnF1ZXJ5KHBhcmFtcywgZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBicm9hZGNhc3QocmVzcG9uc2UpOyAvLyB0ZWxsIHRoZSB3b3JsZFxuICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgICAgICAkbG9nLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgfSk7ICBcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBnZXQgY2FyZHMgdXNpbmcgc3RhY2sgZmlsdGVyc1xuICAgICAgICAgKiBcbiAgICAgICAgICogQHBhcmFtIGpzb24gcGFyYW1zXG4gICAgICAgICAqIEByZXR1cm5zIHN0YWNrc0ZhY3RvcnlcbiAgICAgICAgICogQGJyb2FkY2FzdCBjYXJkcyBsaXN0XG4gICAgICAgICAqL1xuICAgICAgICBmYWN0b3J5LmJ5U3RhY2sgPSBmdW5jdGlvbiAocGFyYW1zKSB7XG4gICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHBhcmFtcyA9IGdldEZpbHRlcnMocGFyYW1zLCBbJ29yZGVyJywgJ3N0YWNrJywgJ3RhZ3MnXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gc3RhY2tzRmFjdG9yeS5maWx0ZXIocGFyYW1zLCBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGJyb2FkY2FzdChyZXNwb25zZSk7IC8vIHRlbGwgdGhlIHdvcmxkXG4gICAgICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICAkbG9nLmVycm9yKGVycik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIGdldCBjYXJkcyB1c2luZyBjdXJyZW50IGZpbHRlcnNcbiAgICAgICAgICogXG4gICAgICAgICAqIEBwYXJhbSBqc29uIHBhcmFtc1xuICAgICAgICAgKiBAcmV0dXJucyBzdGFja3NGYWN0b3J5XG4gICAgICAgICAqIEBicm9hZGNhc3QgY2FyZHMgbGlzdFxuICAgICAgICAgKi9cbiAgICAgICAgZmFjdG9yeS5ieVRhZ3MgPSBmdW5jdGlvbiAocGFyYW1zKSB7XG4gICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHBhcmFtcyA9IGdldEZpbHRlcnMocGFyYW1zLCBbJ29yZGVyJywgJ3N0YWNrJywgJ3RhZ3MnXSk7XG4gICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiB0YWdzRmFjdG9yeS5maWx0ZXIocGFyYW1zLCBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGJyb2FkY2FzdChyZXNwb25zZSk7IC8vIHRlbGwgdGhlIHdvcmxkXG4gICAgICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICAkbG9nLmVycm9yKGVycik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICAgICAgICBcbiAgICAgICAgZnVuY3Rpb24gZ2V0RmlsdGVycyhwYXJhbXMsIGZpbHRlcnMpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYodHlwZW9mKHBhcmFtcykgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgcGFyYW1zID0ge307XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKGZpbHRlcnMuaW5jbHVkZXMoJ3RhZ3MnKSAmJiB0eXBlb2YoJGNvb2tpZXMuZ2V0KCd0YWdzJykpICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIHBhcmFtcy50YWdzID0gYW5ndWxhci5mcm9tSnNvbigkY29va2llcy5nZXQoJ3RhZ3MnKSkubWFwKGZ1bmN0aW9uKHgpeyByZXR1cm4geC5pZDsgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZihmaWx0ZXJzLmluY2x1ZGVzKCdzdGFjaycpICYmIHR5cGVvZigkY29va2llcy5nZXQoJ3N0YWNrJykpICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIHBhcmFtcy5zdGFjayA9IGFuZ3VsYXIuZnJvbUpzb24oJGNvb2tpZXMuZ2V0KCdzdGFjaycpKS5pZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKGZpbHRlcnMuaW5jbHVkZXMoJ29yZGVyJykgJiYgdHlwZW9mKCRjb29raWVzLmdldCgnb3JkZXInKSkgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgcGFyYW1zLm9yZGVyID0gYW5ndWxhci5mcm9tSnNvbigkY29va2llcy5nZXQoJ29yZGVyJykpOyAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIHBhcmFtcztcbiAgICAgICAgfVxuICAgICAgICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRlbGwgZXZlcnlib2R5IHdlIGhhdmUgYSByZW5vdmF0ZWQgbGlzdFxuICAgICAgICAgKi9cbiAgICAgICAgZnVuY3Rpb24gYnJvYWRjYXN0KGRhdGEpIHtcbiAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnY2FyZHMtbG9hZGVkJywgZGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBmYWN0b3J5O1xuICAgIH0gICAgXG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmhvbWUnKS5jb250cm9sbGVyKCdIb21lQ29udHJvbGxlcicsIFsnJHNjb3BlJywgSG9tZUNvbnRyb2xsZXJdKTtcblxuICAgIGZ1bmN0aW9uIEhvbWVDb250cm9sbGVyKCRzY29wZSkge1xuICAgICAgICAgIFxuICAgIH1cbn0pKCk7XG5cblxuIiwiKGZ1bmN0aW9uKCl7XG4gICAgXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5ob21lJykuY29udHJvbGxlcignTGlzdENvbnRyb2xsZXInLCBbJyRzY29wZScsICckbG9nJywgJyRjb29raWVzJywgJyRlbGVtZW50JywgJ3F1ZXJ5RmFjdG9yeScsICdIb21lQ29udGV4dFNlcnZpY2UnLCBMaXN0Q29udHJvbGxlcl0pO1xuICAgIFxuICAgIGZ1bmN0aW9uIExpc3RDb250cm9sbGVyKCRzY29wZSwgJGxvZywgJGNvb2tpZXMsICRlbGVtZW50LCBxdWVyeUZhY3RvcnksIEhvbWVDb250ZXh0U2VydmljZSl7XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogV2F5IHRvIGtlZXAgc2libGluZ3MgY29ubmVjdGVkIGFuZCBzaGFyaW5nIHNjb3BlXG4gICAgICAgICAqL1xuICAgICAgICAkc2NvcGUuY29udGV4dCA9IEhvbWVDb250ZXh0U2VydmljZS5jb250ZXh0O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEdldCBjYXJkcyBsaXN0XG4gICAgICAgICAqL1xuICAgICAgICAkc2NvcGUubG9hZCA9IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBnZXQgZGF0YSBmcm9tIHNlcnZlclxuICAgICAgICAgICAgcXVlcnlGYWN0b3J5XG4gICAgICAgICAgICAgICAgLmFsbChwYXJhbXMpLiRwcm9taXNlLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgICAgICAkbG9nLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgfSk7ICBcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgICRzY29wZS5sb2FkKCk7IC8vIHJ1biBhdCBwYWdlIGxvYWRcbiAgICAgICAgXG4gICAgICAgICRzY29wZS4kb24oJ2NhcmRzLWxvYWRlZCcsIGZ1bmN0aW9uKGV2dCwgcmVzcG9uc2UpIHtcbiAgICAgICAgICAgICRzY29wZS5jb250ZXh0LmNhcmRzID0gcmVzcG9uc2UuZGF0YTsgLy8gY2FyZHMgbGlzdFxuICAgICAgICAgICAgJHNjb3BlLmNvbnRleHQucGFnZXMgPSByZXNwb25zZTsgLy8gcGFnZXMgZGF0YSAgIFxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBIYW5kbGUgbGlzdCBvcmRlclxuICAgICAgICAgKi9cbiAgICAgICAgJHNjb3BlLiRvbignb3JkZXItY2hhbmdlZCcsIGZ1bmN0aW9uKGV2dCwgcGFyYW1zKSB7ICAgXG4gICAgICAgICAgICAkc2NvcGUubG9hZCh7b3JkZXI6IHBhcmFtc30pOyAvLyByZWxvYWQgY2FyZHNcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogSGFuZGxlIHBhZ2luYXRpb25cbiAgICAgICAgICovXG4gICAgICAgICRzY29wZS4kb24oJ2NhcmRzLXBhZ2UtY2hhbmdlZCcsIGZ1bmN0aW9uKGV2dCwgcGFyYW1zKSB7XG4gICAgICAgICAgICAkc2NvcGUubG9hZChwYXJhbXMpOyAvLyByZWxvYWQgY2FyZHNcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQ3JlYXRlIGNhcmRcbiAgICAgICAgICovXG4gICAgICAgICRzY29wZS4kb24oJ25ldy1jYXJkJywgZnVuY3Rpb24oZXZ0LCBpdGVtKSB7XG4gICAgICAgICAgICAkc2NvcGUuY29udGV4dC5jYXJkcy51bnNoaWZ0KGl0ZW0pO1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBQaW4gY2FyZFxuICAgICAgICAgKi9cbiAgICAgICAgJHNjb3BlLiRvbigncGluLWNhcmQnLCBmdW5jdGlvbihldnQsIGl0ZW0pIHtcbiAgICAgICAgICAgXG4gICAgICAgICAgICBpZihpdGVtLnN0aWNreSkge1xuICAgICAgICAgICAgICAgIC8vIG5vdCBzdGlja3kgYW55bW9yZVxuICAgICAgICAgICAgICAgIGl0ZW0uc3RpY2t5ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaXRlbS5jbGFzcyA9IGl0ZW0uY2xhc3MgPyBpdGVtLmNsYXNzLnJlcGxhY2UoXCJzdGlja3lcIiwgXCJcIikgOiBcIlwiO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBzdGlja3kuIFB1dCBpdCBmaXJzdFxuICAgICAgICAgICAgICAgIGl0ZW0uc3RpY2t5ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBpdGVtLmNsYXNzID0gaXRlbS5jbGFzcyA/IGl0ZW0uY2xhc3MgKyBcIiBzdGlja3lcIiA6IFwic3RpY2t5XCI7ICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGxldCBpbmRleCA9ICRzY29wZS5jb250ZXh0LmNhcmRzLmluZGV4T2YoaXRlbSk7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmNvbnRleHQuY2FyZHMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgICAgICAkc2NvcGUuY29udGV4dC5jYXJkcy51bnNoaWZ0KGl0ZW0pO1xuICAgICAgICAgICAgfSBcbiAgICAgICAgfSk7XG4gICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBEZWxldGUgY2FyZFxuICAgICAgICAgKi9cbiAgICAgICAgJHNjb3BlLiRvbignZGVsZXRlLWNhcmQnLCBmdW5jdGlvbihldnQsIGl0ZW0pIHtcbiAgICAgICAgICAgIGxldCBpbmRleCA9ICRzY29wZS5jb250ZXh0LmNhcmRzLmluZGV4T2YoaXRlbSk7XG4gICAgICAgICAgICAkc2NvcGUuY29udGV4dC5jYXJkcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBVcGRhdGUgY2FyZFxuICAgICAgICAgKi9cbiAgICAgICAgJHNjb3BlLiRvbigndXBkYXRlLWNhcmQnLCBmdW5jdGlvbihldnQsIG9yaWdpbmFsLCBuZXdDYXJkKSB7XG4gICAgICAgICAgICBsZXQgaW5kZXggPSAkc2NvcGUuY29udGV4dC5jYXJkcy5pbmRleE9mKG9yaWdpbmFsKTtcbiAgICAgICAgICAgIGFuZ3VsYXIuZXh0ZW5kKCRzY29wZS5jb250ZXh0LmNhcmRzW2luZGV4XSwgbmV3Q2FyZCk7XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZpbHRlciBieSBzdGFja1xuICAgICAgICAgKi9cbiAgICAgICAgJHNjb3BlLiRvbignc3RhY2stc2VsZWN0ZWQnLCBmdW5jdGlvbihldnQsIHN0YWNrKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIHF1ZXJ5IHJlc3VsdHNcbiAgICAgICAgICAgIHF1ZXJ5RmFjdG9yeS5ieVN0YWNrKHtzdGFja19pZDogc3RhY2suaWR9KTtcbiAgICAgICAgICBcbiAgICAgICAgICAgIC8vIHByb3ZpZGUgaW5mbyB0byB2aWV3XG4gICAgICAgICAgICAkc2NvcGUuY29udGV4dC5zdGFjayA9IHN0YWNrO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyByZWZyZXNoIGFuaW1hdGlvbiAod2hlbiBlbGVtZW50IGFscmVhZHkgdmlzaWJsZSlcbiAgICAgICAgICAgICRlbGVtZW50LmZpbmQoJy5zdGFjay1kZXNjcmlwdGlvbicpLmFkZENsYXNzKCdmbGlwSW5YJyk7XG4gICAgICAgIH0pOyAgICBcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDbGVhciBzdGFjayBkZXNjcmlwdGlvbiBhbmltYXRpb24gY2xhc3Mgd2hlbiBmaW5pc2hlZFxuICAgICAgICAgKi9cbiAgICAgICAgJGVsZW1lbnQub24oJ3dlYmtpdEFuaW1hdGlvbkVuZCBtb3pBbmltYXRpb25FbmQgTVNBbmltYXRpb25FbmQgb2FuaW1hdGlvbmVuZCBhbmltYXRpb25lbmQnLCAnLnN0YWNrLWRlc2NyaXB0aW9uJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKFwiZmxpcEluWFwiKTtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBpZigkY29va2llcy5nZXQoXCJzdGFja1wiKSkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBwcm92aWRlIGluZm8gdG8gdmlld1xuICAgICAgICAgICAgJHNjb3BlLmNvbnRleHQuc3RhY2sgPSAkY29va2llcy5nZXQoXCJzdGFja1wiKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEN1cnJlbnQgdGFncyBmaWx0ZXJzXG4gICAgICAgICAqL1xuICAgICAgICAkc2NvcGUucHJpbnRDdXJyZW50VGFncyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBsZXQgY3VycmVudF9jb29raWVzID0gJGNvb2tpZXMuZ2V0KCd0YWdzJyk7XG4gICAgICAgICAgICBpZiggdHlwZW9mKGN1cnJlbnRfY29va2llcykgIT09ICd1bmRlZmluZWQnICkge1xuICAgICAgICAgICAgICAgICRzY29wZS50YWdfZmlsdGVycyA9IGFuZ3VsYXIuZnJvbUpzb24oY3VycmVudF9jb29raWVzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gYWRkIG9uZSBtb3JlXG4gICAgICAgICRzY29wZS4kb24oJ3RhZy1maWx0ZXItYWRkZWQnLCBmdW5jdGlvbihldnQsIHRhZykge1xuICAgICAgICAgICAgJHNjb3BlLnRhZ19maWx0ZXJzLnVuc2hpZnQodGFnKTtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICAvLyBEcmF3IHRhZyBmaWx0ZXJzIG9uIHBhZ2UgbG9hZFxuICAgICAgICAkc2NvcGUucHJpbnRDdXJyZW50VGFncygpOyBcbiAgICAgICAgXG4gICAgICAgICRzY29wZS5yZW1vdmVUYWdGaWx0ZXIgPSBmdW5jdGlvbihldmVudCwgaW5kZXgsIHRhZykge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyByZW1vdmUgZnJvbSB2aWV3XG4gICAgICAgICAgICAkKGV2ZW50LmN1cnJlbnRUYXJnZXQpLmNsb3Nlc3QoJ2xpJykucmVtb3ZlQ2xhc3MoJ2FuaW1hdGVkIHB1bHNlJyk7IC8vIG5vIGVuZCBhbmltYXRpb25cbiAgICAgICAgICAgICRzY29wZS50YWdfZmlsdGVycy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyByZW1vdmUgdGFnIGZyb20gY29va2llc1xuICAgICAgICAgICAgbGV0IGN1cnJlbnRfY29va2llcyA9IGFuZ3VsYXIuZnJvbUpzb24oJGNvb2tpZXMuZ2V0KCd0YWdzJykpO1xuICAgICAgICAgICAgbGV0IGNvb2tpZV9pbmRleCA9ICQuaW5BcnJheSggdGFnLCBjdXJyZW50X2Nvb2tpZXMgKTtcbiAgICAgICAgICAgIGN1cnJlbnRfY29va2llcy5zcGxpY2UoY29va2llX2luZGV4LCAxKTtcbiAgICAgICAgICAgICRjb29raWVzLnB1dE9iamVjdCgndGFncycsIGN1cnJlbnRfY29va2llcyk7XG4gICAgICAgIH0gICAgICAgXG4gICAgfVxufSkoKTsiLCIoZnVuY3Rpb24oKXtcbiAgICBcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmhvbWUnKS5jb250cm9sbGVyKCdTZWFyY2hDb250cm9sbGVyJywgWyckc2NvcGUnLCAnSG9tZUNvbnRleHRTZXJ2aWNlJywgU2VhcmNoQ29udHJvbGxlcl0pO1xuICAgIFxuICAgIGZ1bmN0aW9uIFNlYXJjaENvbnRyb2xsZXIoJHNjb3BlLCBIb21lQ29udGV4dFNlcnZpY2Upe1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdheSB0byBrZWVwIHNpYmxpbmdzIGNvbm5lY3RlZCBhbmQgc2hhcmluZyBzY29wZVxuICAgICAgICAgKi9cbiAgICAgICAgJHNjb3BlLmNvbnRleHQgPSBIb21lQ29udGV4dFNlcnZpY2UuY29udGV4dDtcbiAgICB9XG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5ob21lJylcbiAgICAgICAgLmZpbHRlcignaGlnaGxpZ2h0VGV4dCcsIGZ1bmN0aW9uKCRzY2UpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAodGV4dCwgcGhyYXNlKSB7XG4gICAgICAgICAgICAgICAgbGV0IGhpZ2hsaWdodGVkID0gcGhyYXNlXG4gICAgICAgICAgICAgICAgICAgICAgICA/IHRleHQucmVwbGFjZShuZXcgUmVnRXhwKCcoJyArIHBocmFzZSArICcpJywgJ2dpJyksICc8c3BhbiBjbGFzcz1cImhpZ2hsaWdodC10ZXh0XCI+JDE8L3NwYW4+JylcbiAgICAgICAgICAgICAgICAgICAgICAgIDogdGV4dDtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHJldHVybiAkc2NlLnRydXN0QXNIdG1sKGhpZ2hsaWdodGVkKTtcbiAgICAgICAgICAgIH07ICAgICAgICAgICAgXG4gICAgICAgIH0pO1xufSkoKTtcblxuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcC5ob21lJykuc2VydmljZSgnSG9tZUNvbnRleHRTZXJ2aWNlJywgZnVuY3Rpb24oKXtcbiAgICB0aGlzLmNvbnRleHQgPSB7XG4gICAgICAgIGNhcmRzOiBbXSxcbiAgICAgICAgcXVlcnk6ICcnXG4gICAgfTtcbn0pOyIsIihmdW5jdGlvbigpe1xuICAgIFxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuc3RhY2tzJykuZGlyZWN0aXZlKCdzdGFja0xpc3RQYW5lbCcsIFsnY29uZmlnJywgJyRjb29raWVzJywgZnVuY3Rpb24oY29uZmlnLCAkY29va2llcyl7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgICAgICAgICBzY29wZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogY29uZmlnLlNSQ19GT0xERVIgKyAnc3RhY2tzL3RlbXBsYXRlcy9zdGFjay1saXN0LXBhbmVsLmh0bWwnLFxuICAgICAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsICAgICAgIFxuICAgICAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgICAgICAgICAgICAgICBzY29wZS5pbWdfZm9sZGVyID0gY29uZmlnLlBST0ZJTEVfSU1HX0ZPTERFUjtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLmN1cnJlbnRfc3RhY2sgPSBhbmd1bGFyLmZyb21Kc29uKCRjb29raWVzLmdldChcInN0YWNrXCIpKTsgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBbJyRzY29wZScsICckcm9vdFNjb3BlJywgJyRsb2cnLCAnJGNvb2tpZXMnLCAnY29uZmlnJywgJ3N0YWNrc0ZhY3RvcnknLCAnTW9kYWxTZXJ2aWNlJywgXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKCRzY29wZSwgJHJvb3RTY29wZSwgJGxvZywgJGNvb2tpZXMsIGNvbmZpZywgc3RhY2tzRmFjdG9yeSwgTW9kYWxTZXJ2aWNlKSB7XG4gICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5ldmVudHMgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBHZXQgc3RhY2sgbGlzdFxuICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuc3RhY2tzID0gc3RhY2tzRmFjdG9yeS5xdWVyeSgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIENyZWF0ZSBuZXcgc3RhY2tcbiAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmV2ZW50cy5hZGROZXcgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBNb2RhbFNlcnZpY2Uuc2hvd01vZGFsKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IGNvbmZpZy5TUkNfRk9MREVSICsgXCJzdGFja3MvdGVtcGxhdGVzL21vZGFscy9uZXctc3RhY2suaHRtbFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBcIk5ld1N0YWNrQ29udHJvbGxlclwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkudGhlbihmdW5jdGlvbihtb2RhbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RhbC5lbGVtZW50Lm1vZGFsKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFsLmNsb3NlLnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0KSB7ICAgIFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcHJlcGFyZSBkYXRhIHRvIHN1Ym1pdCB0byBzZXJ2ZXIgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHN0YWNrID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBtb2RhbC5zY29wZS5mb3JtLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBtb2RhbC5zY29wZS5mb3JtLmRlc2NyaXB0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhY2tzRmFjdG9yeS5zYXZlKHN0YWNrKS4kcHJvbWlzZS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBlbW1pdCBldmVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFjay5pZCA9IHJlc3BvbnNlLmlkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ25ldy1zdGFjaycsIHN0YWNrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFkZCB0byBzdGFja1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuc3RhY2tzLnVuc2hpZnQoc3RhY2spO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkbG9nLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkbG9nLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICogRmlsdGVyIGJ5IHN0YWNrXG4gICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5ldmVudHMuZmlsdGVyID0gZnVuY3Rpb24oJGV2ZW50LCBzdGFjaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBsaW5rID0gJCgkZXZlbnQuY3VycmVudFRhcmdldCk7XG4gICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmsuY2xvc2VzdCgndWwnKS5maW5kKCcubGlzdC1ncm91cC1pdGVtJykucmVtb3ZlQ2xhc3MoJ3NlbGVjdGVkJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGluay5wYXJlbnQoKS5hZGRDbGFzcygnc2VsZWN0ZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcGVyc2lzdCBmaWx0ZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkY29va2llcy5wdXRPYmplY3QoJ3N0YWNrJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogc3RhY2suaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHN0YWNrLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBzdGFjay5kZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRlbGwgdGhlIHdvcmxkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdzdGFjay1zZWxlY3RlZCcsIHN0YWNrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgfTtcbiAgICB9XSk7XG59KSgpOyIsIihmdW5jdGlvbigpe1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuc3RhY2tzJykuZmFjdG9yeSgnc3RhY2tzRmFjdG9yeScsIFsnJHJlc291cmNlJywgJ2NvbmZpZycsIGZ1bmN0aW9uICgkcmVzb3VyY2UsIGNvbmZpZykge1xuICAgICAgICByZXR1cm4gJHJlc291cmNlKGNvbmZpZy5hcGkgKyAnL3N0YWNrcy86aWQnLCB7IGlkOiAnQF9pZCcsIHN0YWNrX2lkOiAnQHN0YWNrX2lkJyB9LCB7XG4gICAgICAgICAgICB1cGRhdGU6IHtcbiAgICAgICAgICAgICAgbWV0aG9kOiAnUFVUJyBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmaWx0ZXI6IHtcbiAgICAgICAgICAgICAgdXJsOiBjb25maWcuYXBpICsgJy9zdGFja3MvOnN0YWNrX2lkL2NhcmRzJywgXG4gICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcgXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pOyBcbiAgICB9XSk7XG59KSgpO1xuXG4iLCIoZnVuY3Rpb24gKCkge1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAudGFncycpLmRpcmVjdGl2ZSgnbmV3VGFnJywgWydjb25maWcnLCAndGFnc0ZhY3RvcnknLCAnJHJvb3RTY29wZScsICckYW5pbWF0ZScsXG4gICAgICAgIGZ1bmN0aW9uIChjb25maWcsIHRhZ3NGYWN0b3J5LCAkcm9vdFNjb3BlLCAkYW5pbWF0ZSkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHJlc3RyaWN0OiAnRUEnLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBjb25maWcuU1JDX0ZPTERFUiArICcvdGFncy90ZW1wbGF0ZXMvbmV3LXRhZy5odG1sJyxcbiAgICAgICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICAgICAgICAgIGNhcmQ6IFwiPWRhdGFcIlxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuZXZlbnRzID0ge307XG4gICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy8gYXJjaGV0eXBlXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLnRhZyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICcnXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogSW5pdGlhbCB3aWRnZXQgc3RhdGVcbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLmRpc3BsYXkgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBIaWRlIHdpZGdldFxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuZXZlbnRzLnNob3cgPSBmdW5jdGlvbigpIHsgXG4gICAgICAgICAgICAgICAgICAgICAgICBzY29wZS5kaXNwbGF5ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLnZpc2liaWxpdHkgPSAndmlzaWJsZSc7IC8vIGNzcyBjbGFzc1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmZpbmQoJ2lucHV0JykuZm9jdXMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIDAuNSk7IC8vIHRpbWUgd2lsbCB2YXJ5IGFjY29yZGluZyB0byBjc3MgcnVsZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogSGlkZSB3aWRnZXRcbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLmV2ZW50cy5oaWRlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzY29wZS5kaXNwbGF5ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBzY29wZS52aXNpYmlsaXR5ID0gJyc7IC8vIGNzcyBjbGFzc1xuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUudGFnLm5hbWUgPSAnJzsgLy8gcmVzZXQgZmllbGRcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIGNyZWF0ZXMgYSB0YWcgYW5kIGF0dGFjaCBpdCB0byBjdXJyZW50IGNhcmRcbiAgICAgICAgICAgICAgICAgICAgICogXG4gICAgICAgICAgICAgICAgICAgICAqIEByZXR1cm5zIHZvaWRcbiAgICAgICAgICAgICAgICAgICAgICogQGJyb2FkY2FzdHMgZXZlbnRcbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLmV2ZW50cy5hZGROZXcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHNjb3BlLnRhZy5uYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHRhZyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FyZF9pZDogc2NvcGUuY2FyZC5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogc2NvcGUudGFnLm5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhZ3NGYWN0b3J5LnNhdmUodGFnLCBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWcuaWQgPSByZXNwb25zZS5pZDsgLy8gYXBwZW5kIHRhZyBpZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY29wZS5ldmVudHMuZmxhc2hDbGFzcyhlbGVtZW50LCAnb2snKTsgLy8gdXggXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhZGQgdGFnIGFzIHRoZSBsYXN0IHZpc2libGUgb2YgWCB0YWdzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKHR5cGVvZihzY29wZS5jYXJkLnRhZ3MpICE9PSAndW5kZWZpbmVkJyl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhZGQgdGFnIHRvIHRoZSBsaXN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY29wZS5jYXJkLnRhZ3Muc3BsaWNlKHNjb3BlLm1heF9udW1fdGFncy0xLCAwLCB0YWcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY3JlYXRlIHRoZSBsaXN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY29wZS5jYXJkLnRhZ3MgPSBbdGFnXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuZXZlbnRzLmZsYXNoQ2xhc3MoZWxlbWVudCwgJ2Vycm9yJyk7IC8vIHV4IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLnRhZy5uYW1lID0gJyc7IC8vIHJlc2V0IGZpZWxkXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogS2V5IGV2ZW50IChFbnRlcilcbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuYmluZChcImtleWRvd24ga2V5cHJlc3NcIiwgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihldmVudC53aGljaCA9PT0gMTMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY29wZS5ldmVudHMuYWRkTmV3KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogQWRkcyBhbmQgcmVtb3ZlcyBhIGNsYXNzXG4gICAgICAgICAgICAgICAgICAgICAqIFxuICAgICAgICAgICAgICAgICAgICAgKiBAcGFyYW0gc3RyaW5nIGNsYXNzTmFtZVxuICAgICAgICAgICAgICAgICAgICAgKiBAcmV0dXJucyB2b2lkXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBzY29wZS5ldmVudHMuZmxhc2hDbGFzcyA9IGZ1bmN0aW9uKGVsZW1lbnQsIGNsYXNzTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICRhbmltYXRlLmFkZENsYXNzKGVsZW1lbnQsIGNsYXNzTmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRhbmltYXRlLnJlbW92ZUNsYXNzKGVsZW1lbnQsIGNsYXNzTmFtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIDUwMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgXSk7XG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5ob21lJykuZGlyZWN0aXZlKCd0YWdDbG91ZCcsIFsnY29uZmlnJywgXG4gICAgICAgIGZ1bmN0aW9uIChjb25maWcpIHtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICByZXN0cmljdDogJ0VBJyxcbiAgICAgICAgICAgICAgICBzY29wZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICByZXBsYWNlOiB0cnVlLCAgICAgXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IGNvbmZpZy5TUkNfRk9MREVSICsgJy90YWdzL3RlbXBsYXRlcy90YWctY2xvdWQuaHRtbCcsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogWyckc2NvcGUnLCAnJGNvb2tpZXMnLCAnJHJvb3RTY29wZScsICdyZWR1Y2VCeUZpbHRlcicsIGZ1bmN0aW9uICgkc2NvcGUsICRjb29raWVzLCAkcm9vdFNjb3BlLCByZWR1Y2VCeUZpbHRlcikge1xuXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5ldmVudHMgPSB7fTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIEtlZXAgdHJhY2sgb2YgY2FyZCBsaXN0IGNoYW5nZXNcbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS4kb24oJ2NhcmRzLWxvYWRlZCcsIGZ1bmN0aW9uIChldnQsIGNvbGxlY3Rpb24pIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYodHlwZW9mKGNvbGxlY3Rpb24uZGF0YSkgPT09ICd1bmRlZmluZWQnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZXhjbHVkZSBjYXJkIHdpdGggbm8gdGFnc1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNhcmRzID0gY29sbGVjdGlvbi5kYXRhLmZpbHRlcihmdW5jdGlvbiAoY2FyZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjYXJkLnRhZ3MgPyBjYXJkLnRhZ3MubGVuZ3RoID4gMCA6IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBleHRyYWN0IHRhZ3MgZnJvbSBjYXJkXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdGFncyA9IGNhcmRzLm1hcChmdW5jdGlvbiAoY2FyZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKGFuZ3VsYXIudG9Kc29uKGNhcmQudGFncykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIG1lcmdlIHRhZ3MgaW4gZmxhdHRlbiBhcnJheVxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG1lcmdlZCA9IFtdLmNvbmNhdC5hcHBseShbXSwgdGFncyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBlbGltaW5hdGUgZHVwbGljYXRlcyBhbmQgc2VydmUgYXJyYXkgdG8gdmlld1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnRhZ3MgPSByZWR1Y2VCeUZpbHRlcihtZXJnZWQsICdpZCcpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5ldmVudHMuZmlsdGVyID0gZnVuY3Rpb24odGFnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjdXJyZW50X2Nvb2tpZXMgPSAkY29va2llcy5nZXQoJ3RhZ3MnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoIHR5cGVvZihjdXJyZW50X2Nvb2tpZXMpID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGZpcnN0IG9uZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRfY29va2llcyA9IFt0YWddO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhdm9pZCBkdXBsaWNhdGVzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudF9jb29raWVzID0gYW5ndWxhci5mcm9tSnNvbihjdXJyZW50X2Nvb2tpZXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKCBjdXJyZW50X2Nvb2tpZXMubWFwKGZ1bmN0aW9uKGUpIHsgcmV0dXJuIGUuaWQ7IH0pLmluZGV4T2YodGFnLmlkKSA9PT0gLTEgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRfY29va2llcy5wdXNoKHRhZyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgndGFnLWZpbHRlci1hZGRlZCcsIHRhZyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBhZGQgdGFnIHRvIGN1cnJlbnQgdGFncyBsaXN0XG4gICAgICAgICAgICAgICAgICAgICAgICAkY29va2llcy5wdXRPYmplY3QoJ3RhZ3MnLCBjdXJyZW50X2Nvb2tpZXMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICBdKTtcbn0pKCk7IiwiKGZ1bmN0aW9uKCl7XG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC50YWdzJykuZmFjdG9yeSgndGFnc0ZhY3RvcnknLCBbJyRyZXNvdXJjZScsICdjb25maWcnLCBmdW5jdGlvbiAoJHJlc291cmNlLCBjb25maWcpIHtcbiAgICAgICAgcmV0dXJuICRyZXNvdXJjZShjb25maWcuYXBpICsgJy90YWdzLzppZCcsIHsgaWQ6ICdAaWQnLCBjYXJkX2lkOiAnQGNhcmRfaWQnIH0sIHtcbiAgICAgICAgICAgIHNhdmU6IHtcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJywgXG4gICAgICAgICAgICAgICAgdXJsOiBjb25maWcuYXBpICsgJy9jYXJkcy86Y2FyZF9pZC90YWdzJyAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pOyBcbiAgICB9XSk7XG59KSgpO1xuXG4iLCIoZnVuY3Rpb24oKSB7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmNhcmRzJykuY29udHJvbGxlcignRWRpdENhcmRDb250cm9sbGVyJywgWyckc2NvcGUnLCAnZGF0YScsICdjbG9zZScsIEVkaXRDYXJkQ29udHJvbGxlcl0pO1xuICAgIFxuICAgIGZ1bmN0aW9uIEVkaXRDYXJkQ29udHJvbGxlcigkc2NvcGUsIGRhdGEsIGNsb3NlKSB7XG5cbiAgICAgICAgJHNjb3BlLmZvcm0gPSB7fTtcbiAgICAgICAgJHNjb3BlLmZvcm0ubmFtZSA9IGRhdGEuY2FyZC5uYW1lO1xuICAgICAgICAkc2NvcGUuZm9ybS5jb250ZW50ID0gZGF0YS5jYXJkLmNvbnRlbnQ7XG5cbiAgICAgICAgJHNjb3BlLmNsb3NlID0gZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICBcbiAgICAgICAgICAgIGNsb3NlKHJlc3VsdCwgMjAwKTsgLy8gY2xvc2UsIGJ1dCBnaXZlIDIwMG1zIGZvciBib290c3RyYXAgdG8gYW5pbWF0ZVxuICAgICAgICB9O1xuICAgIH07XG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmhvbWUnKS5jb250cm9sbGVyKCdZZXNOb0NvbnRyb2xsZXInLCBbJyRzY29wZScsICdkYXRhJywgJ2Nsb3NlJywgZnVuY3Rpb24gKCRzY29wZSwgZGF0YSwgY2xvc2UpIHtcbiAgICAgICAgICAgXG4gICAgICAgICAgICAkc2NvcGUudGl0bGUgPSBkYXRhLnRpdGxlO1xuICAgICAgICAgICAgJHNjb3BlLmNvbnRlbnQgPSBkYXRhLmNvbnRlbnQ7XG4gICAgICAgICAgIFxuICAgICAgICAgICAgJHNjb3BlLmNsb3NlID0gZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgIGNsb3NlKHJlc3VsdCwgMjAwKTsgLy8gY2xvc2UsIGJ1dCBnaXZlIDIwMG1zIGZvciBib290c3RyYXAgdG8gYW5pbWF0ZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfV0pO1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmhvbWUnKS5jb250cm9sbGVyKCdNYXJrZG93bkNvbnRyb2xsZXInLCBbJyRzY29wZScsICdkYXRhJywgJ2Nsb3NlJywgTWFya2Rvd25Db250cm9sbGVyXSk7XG4gICAgXG4gICAgZnVuY3Rpb24gTWFya2Rvd25Db250cm9sbGVyKCRzY29wZSwgZGF0YSwgY2xvc2UpIHtcblxuICAgICAgICAkc2NvcGUudGl0bGUgPSBkYXRhLmNhcmQubmFtZTtcbiAgICAgICAgJHNjb3BlLmNvbnRlbnQgPSBkYXRhLmNhcmQuY29udGVudDtcblxuICAgICAgICAkc2NvcGUuZGlzbWlzc01vZGFsID0gZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgY2xvc2UocmVzdWx0LCAyMDApOyAvLyBjbG9zZSwgYnV0IGdpdmUgMjAwbXMgZm9yIGJvb3RzdHJhcCB0byBhbmltYXRlXG4gICAgICAgIH07XG4gICAgfTtcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuICAgIFxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuc3RhY2tzJykuY29udHJvbGxlcignTmV3U3RhY2tDb250cm9sbGVyJywgWyckc2NvcGUnLCAnJGVsZW1lbnQnLCAnY2xvc2UnLCBOZXdTdGFja0NvbnRyb2xsZXJdKTtcbiAgICBcbiAgICBmdW5jdGlvbiBOZXdTdGFja0NvbnRyb2xsZXIoJHNjb3BlLCAkZWxlbWVudCwgY2xvc2UpIHtcbiAgICAgICBcbiAgICAgICAgJHNjb3BlLmZvcm0gPSB7XG4gICAgICAgICAgICBuYW1lOiAnJyxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnJ1xuICAgICAgICB9O1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogS2V5IGV2ZW50IChFbnRlcilcbiAgICAgICAgICovXG4gICAgICAgICRlbGVtZW50LmZpbmQoJ2lucHV0JykuYmluZChcImtleWRvd24ga2V5cHJlc3NcIiwgZnVuY3Rpb24gKGV2ZW50KSB7XG5cbiAgICAgICAgICAgIGlmKGV2ZW50LndoaWNoID09PSAxMykge1xuICAgICAgICAgICAgICAgICRlbGVtZW50Lm1vZGFsKCdoaWRlJyk7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmNsb3NlKHRydWUpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICAkc2NvcGUuY2xvc2UgPSBmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgIFxuICAgICAgICAgICAgY2xvc2UocmVzdWx0LCAyMDApOyAvLyBjbG9zZSwgYnV0IGdpdmUgMjAwbXMgZm9yIGJvb3RzdHJhcCB0byBhbmltYXRlXG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgXG4gICAgfTtcbn0pKCk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
