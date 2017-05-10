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

angular.module('app', ['ng', 'ngRoute', 'ngCookies', 'app.config', 'app.home', 'angularModalService', 'pascalprecht.translate', 'angular-growl']);
  
/**
 * Rest of the global config can be found in app-config module
 */  
angular.module('app').config(['$httpProvider', '$logProvider', '$translateProvider', 'growlProvider', 'config', 
    function ($httpProvider, $logProvider, $translateProvider, growlProvider, config) {
        
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
         * Growl messages
         */
        growlProvider.onlyUniqueMessages(false);
        growlProvider.globalReversedOrder(true);
        growlProvider.globalTimeToLive({success: 1000, error: 112000, warning: 3000, info: 4000});
        growlProvider.globalDisableCountDown(true);
        growlProvider.globalDisableIcons(true);
        growlProvider.globalPosition('bottom-left');

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
                controller: ['$scope', '$rootScope', '$log', 'config', 'growl', 'cardsFactory', 'ModalService',
                    function ($scope, $rootScope, $log, config, growl, cardsFactory, ModalService) {

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
                                growl.error("Ups, failed. Sorry.");
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
                                            growl.error("Ups, failed deleting it.");
                                        });
                                    }
                                });
                            }, function(err) {
                                $log.error(err);
                                growl.error("Ups, failed opening dialog.");
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
                                            growl.error("Ups, failed saving changes.");
                                        });
                                    }
                                });
                            }, function(err) {
                                $log.error(err);
                                growl.error("Ups, failed opening form.");
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
                            }, function(err) {
                                $log.error(err);
                                growl.error("Ups, failed opening view.");
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
                controller: ['$scope', '$rootScope', '$log', 'growl', 'cardsFactory', function ($scope, $rootScope, $log, growl, cardsFactory) {

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
                                growl.error("Ups, failed saving. Sorry.");
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

    /**
     * You may pass any of these value:
     * control: {
     *   expanded: boolean,
     *   expandable: boolean,
     *   toggle: fn         // actually, this is here to be called from the outside, not overriden.
     *   hideArrow: boolean // hide original arrows?
     * },
     * showMoreHeight: ...px
     */
    angular.module('app').directive('showMore',
        ['config', function (config) {

            return {
                templateUrl: config.SRC_FOLDER + 'common/templates/showMore.html',
                restrict: 'A',
                transclude: true,
                scope: {
                    'control': '=',
                    'showMoreHeight': '@'
                },
                link: function(scope, element, attrs) {
                   
                    // accessible from the outside
                    scope.public = scope.control || {}; 
                    
                    // if possible, set value from the outside. 
                    scope.public.expanded = scope.public.expanded || false;
                                            
                    // Useful when you cannot measure the height of element at first. Decide this outside.
                    scope.public.expandable = scope.public.expandable || isExpandable();
                                            
                    // Useful when you cannot measure the height of element at first. Decide this outside.
                    scope.public.hideArrow = scope.public.hideArrow || false;
                   
                    /**
                     * Public methods
                     */                    
                    scope.public.toggle = function () {
                        scope.public.expanded = !scope.public.expanded;
                        if (isExpandable() && scope.public.expanded === false) {                               
                            scope.public.expandable = true;
                        }
                    };
                    
                    /**
                     * Private methods
                     */
                    function isExpandable() {
                        return element.height() >= scope.showMoreHeight;
                    }
                    
                    // directive style 
                    scope.showLessStyle = {
                        'max-height': scope.showMoreHeight + 'px',
                        'overflow': 'hidden'
                    };
                }
            };
        }]);
})();
(function () {
    angular.module('app').directive('submitOnK13', ['config',
        function (config) {
            return {
                restrict: 'A',
                controller: ['$scope', '$element', function ($scope, $element) {

                    /**
                     * Key event (Enter)
                     */
                    $element.bind("keydown keypress", function (event) {

                        if (event.currentTargetwhich === 13) {
                            $element.closest('form').submit();
                            return false;
                        }
                    });
                }]
            };
        }
    ]);
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

    angular.module('app.home').controller('HomeController', ['$scope', 'growl', HomeController]);

    function HomeController($scope, growl) {
        
    }
})();



(function(){
    
    angular.module('app.home').controller('ListController', ['$scope', '$log', 'growl', 'queryFactory', 'HomeContextService', ListController]);
    
    function ListController($scope, $log, growl, queryFactory, HomeContextService){
        
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
                    growl.error("Ups, failed loading cards.");
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
                          
                        // find stack in list
                        let item = scope.context.stacks.filter(function(e) {
                            return e.id == stack.id;
                        });
                        
                        let index = scope.context.stacks.indexOf(item[0]);
                      
                        // update item in list
                        angular.extend(scope.context.stacks[index], stack);
                    });
                    
                    /**
                     * On stack deleted
                     */                    
                    scope.$on('stack-deleted', function(evt, stack) {
                        
                        // remove cookie
                        $cookies.remove("stack");  
                          
                        // find stack in list
                        let item = scope.context.stacks.filter(function(e) {
                            return e.id == stack.id;
                        });
                        
                        let index = scope.context.stacks.indexOf(item[0]);
                     
                        // remove item from list
                        scope.context.stacks.splice(index, 1);     
                        
                        // query new results
                        queryFactory.all();
                    })
                },
                controller: ['$scope', '$rootScope', '$log', '$cookies', 'config', 'growl', 'stacksFactory', 'queryFactory', 'ModalService', 
                    function($scope, $rootScope, $log, $cookies, config, growl, stacksFactory, queryFactory, ModalService) {
                     
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
                                            $scope.context.stacks.unshift(stack);
                                        }, function(err) {
                                            $log.error(err);
                                            growl.error("Ups, failed creating stack.");
                                        });
                                    }
                                });
                            }, function(err) {
                                $log.error(err);
                                growl.error("Ups, failed opening form.");
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
        return $resource(config.api + '/stacks/:id', { id: '@id', stack_id: '@stack_id' }, {
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
                    $scope.events.printCurrentTags = function () {
                        let current_cookies = $cookies.getObject('tags[]');
                        if (typeof (current_cookies) !== 'undefined') {
                            $scope.context.tag_filters = current_cookies;
                        }
                    }

                    // add one more
                    $scope.$on('tag-filter-added', function (evt, tag) {

                        queryFactory.byTags();

                        if (typeof ($scope.context.tag_filters) !== 'undefined') {

                            $scope.context.tag_filters.unshift(tag);
                        } else {
                            $scope.context.tag_filters = [tag];
                        }
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
                                    element.removeClass(className);
                                }, 600);
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

    angular.module('app.stacks').controller('EditStackController', ['$scope', '$element', 'data', 'close', EditStackController]);
    
    function EditStackController($scope, $element, data, close) {
      
        $scope.form = {};
        $scope.form.name = data.stack.name;
        $scope.form.content = data.stack.description;

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC1jb25maWcuanMiLCJjYXJkcy9tb2R1bGUuanMiLCJjb21tb24vbW9kdWxlLmpzIiwiaG9tZS9tb2R1bGUuanMiLCJzdGFja3MvbW9kdWxlLmpzIiwidGFncy9tb2R1bGUuanMiLCJjYXJkcy9jYXJkcy1yb3V0ZS5qcyIsImNvbW1vbi9hcHAtcm91dGUuanMiLCJob21lL2hvbWUtcm91dGUuanMiLCJsb2dpbi9sb2dpbi5qcyIsInN0YWNrcy9ob21lLXJvdXRlLmpzIiwiY2FyZHMvZGlyZWN0aXZlcy9jYXJkLmpzIiwiY2FyZHMvZGlyZWN0aXZlcy9uZXctY2FyZC5qcyIsImNhcmRzL2RpcmVjdGl2ZXMvb3JkZXItYnkuanMiLCJjYXJkcy9kaXJlY3RpdmVzL3BhZ2luYXRlLWNhcmRzLmpzIiwiY2FyZHMvc2VydmljZXMvY2FyZHMtZmFjdG9yeS5qcyIsImNvbW1vbi9jb250cm9sbGVycy9oZWFkZXItY29udHJvbGxlcnMuanMiLCJjb21tb24vY29udHJvbGxlcnMvbGF5b3V0LWNvbnRyb2xsZXJzLmpzIiwiY29tbW9uL2RpcmVjdGl2ZXMvYXV0b2ZvY3VzLmpzIiwiY29tbW9uL2RpcmVjdGl2ZXMvZWxhc3RpY0FyZWEuanMiLCJjb21tb24vZGlyZWN0aXZlcy9oYXNodGFnaWZ5LmpzIiwiY29tbW9uL2RpcmVjdGl2ZXMvc2Vzc2lvbkRyb3Bkb3duLmpzIiwiY29tbW9uL2RpcmVjdGl2ZXMvc2hvd01vcmUuanMiLCJjb21tb24vZGlyZWN0aXZlcy9zdWJtaXRPbksxMy5qcyIsImNvbW1vbi9maWx0ZXJzL3JlZHVjZUJ5LmpzIiwiY29tbW9uL3NlcnZpY2VzL3F1ZXJ5LWZhY3RvcnkuanMiLCJob21lL2NvbnRyb2xsZXJzL2hvbWUtY29udHJvbGxlci5qcyIsImhvbWUvY29udHJvbGxlcnMvbGlzdC1jb250cm9sbGVyLmpzIiwiaG9tZS9jb250cm9sbGVycy9zZWFyY2gtY29udHJvbGxlci5qcyIsImhvbWUvZmlsdGVycy9oaWdobGlnaHRUZXh0LmpzIiwiaG9tZS9zZXJ2aWNlcy9ob21lLWNvbnRleHQuanMiLCJzdGFja3MvZGlyZWN0aXZlcy9zdGFjay1kZXNjcmlwdGlvbi5qcyIsInN0YWNrcy9kaXJlY3RpdmVzL3N0YWNrLWxpc3QtcGFuZWwuanMiLCJzdGFja3Mvc2VydmljZXMvc3RhY2tzLWZhY3RvcnkuanMiLCJ0YWdzL2RpcmVjdGl2ZXMvY3VycmVudC10YWdzLmpzIiwidGFncy9kaXJlY3RpdmVzL25ldy10YWcuanMiLCJ0YWdzL2RpcmVjdGl2ZXMvdGFnLWNsb3VkLmpzIiwidGFncy9zZXJ2aWNlL3RhZ3MtZmFjdG9yeS5qcyIsImNhcmRzL2NvbnRyb2xsZXJzL21vZGFscy9lZGl0LWNhcmQtY29udHJvbGxlci5qcyIsImNvbW1vbi9jb250cm9sbGVycy9tb2RhbHMveWVzLW5vLWNvbnRyb2xsZXIuanMiLCJob21lL2NvbnRyb2xsZXJzL21vZGFscy9tYXJrZG93bi1jb250cm9sbGVyLmpzIiwic3RhY2tzL2NvbnRyb2xsZXJzL21vZGFscy9lZGl0LXN0YWNrLWNvbnRyb2xsZXIuanMiLCJzdGFja3MvY29udHJvbGxlcnMvbW9kYWxzL25ldy1zdGFjay1jb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUFHQSxRQUFBLE9BQUEsY0FBQTtLQUNBLFNBQUEsVUFBQTtRQUNBLE9BQUE7UUFDQSxTQUFBO1FBQ0EsY0FBQTtRQUNBLGNBQUE7UUFDQSxzQkFBQTs7O0FDVEEsUUFBQSxPQUFBLGFBQUE7OztBQ0FBOztBQUVBLFFBQUEsT0FBQSxPQUFBLENBQUEsTUFBQSxXQUFBLGFBQUEsY0FBQSxZQUFBLHVCQUFBLDBCQUFBOzs7OztBQUtBLFFBQUEsT0FBQSxPQUFBLE9BQUEsQ0FBQSxpQkFBQSxnQkFBQSxzQkFBQSxpQkFBQTtJQUNBLFVBQUEsZUFBQSxjQUFBLG9CQUFBLGVBQUEsUUFBQTs7Ozs7UUFLQSxjQUFBLFNBQUEsUUFBQSxTQUFBO1lBQ0EsZ0JBQUE7WUFDQSxVQUFBO1lBQ0EscUJBQUE7WUFDQSxv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QUFBLFNBQUEsR0FBQTtZQUNBLElBQUEsVUFBQSxFQUFBLE9BQUE7WUFDQSxNQUFBLDRCQUFBOzs7Ozs7OztRQVFBLE9BQUEsWUFBQSxTQUFBLE1BQUE7Ozs7O1lBS0EsT0FBQSxLQUFBLFlBQUE7Ozs7Ozs7QUMxQkEsQ0FBQSxZQUFBO0lBQ0EsUUFBQSxPQUFBLE9BQUEsVUFBQSxhQUFBLFlBQUE7UUFDQSxPQUFBO1lBQ0EsVUFBQTtZQUNBLE1BQUEsVUFBQSxPQUFBLFNBQUE7Z0JBQ0EsUUFBQSxHQUFBOzs7Ozs7O0FDTEEsQ0FBQSxZQUFBOzs7SUFHQSxRQUFBLE9BQUEsT0FBQSxVQUFBLGVBQUEsWUFBQTtRQUNBLE9BQUE7WUFDQSxVQUFBO1lBQ0EsTUFBQSxVQUFBLE9BQUEsU0FBQSxZQUFBO2dCQUNBLElBQUEsWUFBQTt3QkFDQSxZQUFBLFFBQUEsR0FBQTt3QkFDQSxjQUFBLFFBQUEsSUFBQTt3QkFDQSxlQUFBLFFBQUEsSUFBQTs7Z0JBRUEsSUFBQSxVQUFBLFFBQUEsUUFBQSxlQUFBLElBQUE7b0JBQ0EsVUFBQTtvQkFDQSxLQUFBLENBQUE7b0JBQ0EsTUFBQSxDQUFBO29CQUNBLE9BQUEsUUFBQSxHQUFBLGNBQUEsU0FBQSxlQUFBLEtBQUEsU0FBQSxnQkFBQTtvQkFDQSxVQUFBLFFBQUEsSUFBQTtvQkFDQSxZQUFBLFFBQUEsSUFBQTtvQkFDQSxZQUFBLFFBQUEsSUFBQTtvQkFDQSxRQUFBOzs7Z0JBR0EsUUFBQSxRQUFBLFNBQUEsTUFBQSxPQUFBOztnQkFFQSxJQUFBLFNBQUEsWUFBQTtvQkFDQSxJQUFBLFFBQUEsVUFBQSxRQUFBLFFBQUE7d0JBQ0EsS0FBQSxJQUFBLElBQUEsR0FBQSxJQUFBLElBQUEsSUFBQSxRQUFBLEtBQUE7NEJBQ0EsS0FBQTs7d0JBRUEsT0FBQTs7O29CQUdBLElBQUEsTUFBQSxRQUFBLE1BQUEsUUFBQSxNQUFBOzZCQUNBLFFBQUEsTUFBQTs2QkFDQSxRQUFBLE1BQUE7NkJBQ0EsUUFBQSxPQUFBOzZCQUNBLFFBQUEsT0FBQTs2QkFDQSxRQUFBLFdBQUEsVUFBQSxPQUFBO2dDQUNBLE9BQUEsTUFBQSxVQUFBLE1BQUEsU0FBQSxLQUFBOzs7b0JBR0EsUUFBQSxLQUFBOztvQkFFQSxRQUFBLElBQUEsVUFBQSxLQUFBLElBQUEsUUFBQSxHQUFBLGVBQUEsV0FBQTs7O2dCQUdBLE1BQUEsSUFBQSxZQUFBLFlBQUE7b0JBQ0EsUUFBQTs7O2dCQUdBLFFBQUEsS0FBQSxpQ0FBQTtnQkFDQTs7Ozs7QUNwREEsQ0FBQSxZQUFBO0lBQ0EsUUFBQSxPQUFBLE9BQUEsVUFBQSxjQUFBLENBQUEsWUFBQTtRQUNBLFNBQUEsVUFBQSxVQUFBO1lBQ0EsT0FBQTtnQkFDQSxVQUFBO2dCQUNBLE9BQUE7b0JBQ0EsUUFBQTtvQkFDQSxRQUFBOztnQkFFQSxNQUFBLFNBQUEsT0FBQSxTQUFBLE9BQUE7b0JBQ0EsU0FBQSxXQUFBO3dCQUNBLElBQUEsT0FBQSxRQUFBOzt3QkFFQSxJQUFBLFNBQUEsSUFBQTs0QkFDQSxPQUFBOzs7d0JBR0EsSUFBQSxNQUFBLFdBQUE7NEJBQ0EsT0FBQSxLQUFBLFFBQUEsaUJBQUE7Ozt3QkFHQSxJQUFBLE1BQUEsV0FBQTs0QkFDQSxPQUFBLEtBQUEsUUFBQSxrQkFBQTs7O3dCQUdBLFFBQUEsS0FBQTs7d0JBRUEsU0FBQSxRQUFBLFlBQUE7dUJBQ0E7Ozs7OztBQzVCQSxDQUFBLFlBQUE7SUFDQSxRQUFBLE9BQUEsT0FBQSxVQUFBLG1CQUFBLENBQUE7UUFDQSxVQUFBLFFBQUE7O1lBRUEsT0FBQTtnQkFDQSxVQUFBO2dCQUNBLGFBQUEsT0FBQSxhQUFBO2dCQUNBLE9BQUE7b0JBQ0EsTUFBQTs7Z0JBRUEsTUFBQSxTQUFBLE9BQUEsVUFBQSxPQUFBO29CQUNBLE1BQUEsYUFBQSxPQUFBOztnQkFFQSxZQUFBLENBQUEsVUFBQSxVQUFBLFFBQUE7O29CQUVBLE9BQUEsT0FBQSxPQUFBOzs7Ozs7QUNmQSxDQUFBLFlBQUE7Ozs7Ozs7Ozs7OztJQVlBLFFBQUEsT0FBQSxPQUFBLFVBQUE7UUFDQSxDQUFBLFVBQUEsVUFBQSxRQUFBOztZQUVBLE9BQUE7Z0JBQ0EsYUFBQSxPQUFBLGFBQUE7Z0JBQ0EsVUFBQTtnQkFDQSxZQUFBO2dCQUNBLE9BQUE7b0JBQ0EsV0FBQTtvQkFDQSxrQkFBQTs7Z0JBRUEsTUFBQSxTQUFBLE9BQUEsU0FBQSxPQUFBOzs7b0JBR0EsTUFBQSxTQUFBLE1BQUEsV0FBQTs7O29CQUdBLE1BQUEsT0FBQSxXQUFBLE1BQUEsT0FBQSxZQUFBOzs7b0JBR0EsTUFBQSxPQUFBLGFBQUEsTUFBQSxPQUFBLGNBQUE7OztvQkFHQSxNQUFBLE9BQUEsWUFBQSxNQUFBLE9BQUEsYUFBQTs7Ozs7b0JBS0EsTUFBQSxPQUFBLFNBQUEsWUFBQTt3QkFDQSxNQUFBLE9BQUEsV0FBQSxDQUFBLE1BQUEsT0FBQTt3QkFDQSxJQUFBLGtCQUFBLE1BQUEsT0FBQSxhQUFBLE9BQUE7NEJBQ0EsTUFBQSxPQUFBLGFBQUE7Ozs7Ozs7b0JBT0EsU0FBQSxlQUFBO3dCQUNBLE9BQUEsUUFBQSxZQUFBLE1BQUE7Ozs7b0JBSUEsTUFBQSxnQkFBQTt3QkFDQSxjQUFBLE1BQUEsaUJBQUE7d0JBQ0EsWUFBQTs7Ozs7O0FDekRBLENBQUEsWUFBQTtJQUNBLFFBQUEsT0FBQSxPQUFBLFVBQUEsZUFBQSxDQUFBO1FBQ0EsVUFBQSxRQUFBO1lBQ0EsT0FBQTtnQkFDQSxVQUFBO2dCQUNBLFlBQUEsQ0FBQSxVQUFBLFlBQUEsVUFBQSxRQUFBLFVBQUE7Ozs7O29CQUtBLFNBQUEsS0FBQSxvQkFBQSxVQUFBLE9BQUE7O3dCQUVBLElBQUEsTUFBQSx1QkFBQSxJQUFBOzRCQUNBLFNBQUEsUUFBQSxRQUFBOzRCQUNBLE9BQUE7Ozs7Ozs7O0FDZEEsQ0FBQSxZQUFBO0lBQ0EsUUFBQSxPQUFBO1NBQ0EsT0FBQSxZQUFBLFdBQUE7WUFDQSxPQUFBLFVBQUEsWUFBQSxPQUFBOztnQkFFQSxPQUFBLFdBQUEsT0FBQSxTQUFBLFFBQUEsUUFBQTt3QkFDQSxHQUFBLENBQUEsWUFBQSxRQUFBLE9BQUEsUUFBQTs0QkFDQSxPQUFBLE9BQUEsT0FBQTt3QkFDQSxPQUFBO3VCQUNBOztnQkFFQSxTQUFBLFlBQUEsVUFBQSxXQUFBLFlBQUE7b0JBQ0EsT0FBQSxTQUFBLEtBQUEsU0FBQSxJQUFBO3NCQUNBLE9BQUEsR0FBQSxlQUFBOzs7Ozs7OztBQ2JBLENBQUEsWUFBQTs7S0FFQSxRQUFBLE9BQUEsT0FBQSxRQUFBLGdCQUFBLENBQUEsUUFBQSxZQUFBLGNBQUEsZ0JBQUEsaUJBQUEsZUFBQTs7SUFFQSxTQUFBLGFBQUEsTUFBQSxVQUFBLFlBQUEsY0FBQSxlQUFBLGFBQUE7O1FBRUEsSUFBQSxVQUFBOzs7Ozs7Ozs7UUFTQSxRQUFBLE1BQUEsVUFBQSxRQUFBOztZQUVBLFNBQUEsV0FBQSxRQUFBLENBQUEsU0FBQSxTQUFBOzs7WUFHQSxPQUFBO2lCQUNBLE1BQUEsUUFBQSxVQUFBLFVBQUE7O29CQUVBLFVBQUE7bUJBQ0EsU0FBQSxLQUFBO29CQUNBLEtBQUEsTUFBQTs7Ozs7Ozs7Ozs7UUFXQSxRQUFBLFVBQUEsVUFBQSxRQUFBOztZQUVBLFNBQUEsV0FBQSxRQUFBLENBQUEsU0FBQSxTQUFBOztZQUVBLE9BQUEsY0FBQSxPQUFBLFFBQUEsU0FBQSxVQUFBOztnQkFFQSxVQUFBO2VBQ0EsU0FBQSxLQUFBO2dCQUNBLEtBQUEsTUFBQTs7Ozs7Ozs7Ozs7UUFXQSxRQUFBLFNBQUEsVUFBQSxRQUFBOztZQUVBLFNBQUEsV0FBQSxRQUFBLENBQUEsU0FBQSxTQUFBOztZQUVBLE9BQUEsWUFBQSxPQUFBLFFBQUEsU0FBQSxVQUFBOztnQkFFQSxVQUFBO2VBQ0EsU0FBQSxLQUFBO2dCQUNBLEtBQUEsTUFBQTs7OztRQUlBLFNBQUEsV0FBQSxRQUFBLFNBQUE7O1lBRUEsR0FBQSxPQUFBLFlBQUEsYUFBQTtnQkFDQSxTQUFBOzs7WUFHQSxHQUFBLFFBQUEsU0FBQSxXQUFBLE9BQUEsU0FBQSxJQUFBLGVBQUEsYUFBQTtnQkFDQSxPQUFBLFlBQUEsU0FBQSxVQUFBLFVBQUEsSUFBQSxTQUFBLEVBQUEsRUFBQSxPQUFBLEVBQUE7O1lBRUEsR0FBQSxRQUFBLFNBQUEsWUFBQSxPQUFBLFNB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QSxRQUFBO2dCQUNBLEtBQUEsT0FBQSxNQUFBOztZQUVBLFFBQUE7Y0FDQSxLQUFBLE9BQUEsTUFBQTtjQUNBLFFBQUE7Ozs7Ozs7QUNUQSxDQUFBLFdBQUE7O0lBRUEsUUFBQSxPQUFBLGFBQUEsV0FBQSxzQkFBQSxDQUFBLFVBQUEsUUFBQSxTQUFBOztJQUVBLFNBQUEsbUJBQUEsUUFBQSxNQUFBLE9BQUE7O1FBRUEsT0FBQSxPQUFBO1FBQ0EsT0FBQSxLQUFBLE9BQUEsS0FBQSxLQUFBO1FBQ0EsT0FBQSxLQUFBLFVBQUEsS0FBQSxLQUFBOztRQUVBLE9BQUEsUUFBQSxVQUFBLFFBQUE7O1lBRUEsTUFBQSxRQUFBOztLQUVBOztBQ2RBLENBQUEsWUFBQTs7SUFFQSxRQUFBLE9BQUEsWUFBQSxXQUFBLG1CQUFBLENBQUEsVUFBQSxRQUFBLFNBQUEsVUFBQSxRQUFBLE1BQUEsT0FBQTs7WUFFQSxPQUFBLFFBQUEsS0FBQTtZQUNBLE9BQUEsVUFBQSxLQUFBOztZQUVBLE9BQUEsUUFBQSxVQUFBLFFBQUE7Z0JBQ0EsTUFBQSxRQUFBOzs7O0FDUkEsQ0FBQSxXQUFBOztJQUVBLFFBQUEsT0FBQSxZQUFBLFdBQUEsc0JBQUEsQ0FBQSxVQUFBLFFBQUEsU0FBQTs7SUFFQSxTQUFBLG1CQUFBLFFBQUEsTUFBQSxPQUFBOztRQUVBLE9BQUEsUUFBQSxLQUFBLEtBQUE7UUFDQSxPQUFBLFVBQUEsS0FBQSxLQUFBOztRQUVBLE9BQUEsZUFBQSxVQUFBLFFBQUE7WUFDQSxNQUFBLFFBQUE7O0tBRUE7O0FDWkEsQ0FBQSxXQUFBOztJQUVBLFFBQUEsT0FBQSxjQUFBLFdBQUEsdUJBQUEsQ0FBQSxVQUFBLFlBQUEsUUFBQSxTQUFBOztJQUVBLFNBQUEsb0JBQUEsUUFBQSxVQUFBLE1BQUEsT0FBQTs7UUFFQSxPQUFBLE9BQUE7UUFDQSxPQUFBLEtBQUEsT0FBQSxLQUFBLE1BQUE7UUFDQSxPQUFBLEtBQUEsVUFBQSxLQUFBLE1BQUE7Ozs7O1FBS0EsU0FBQSxLQUFBLFNBQUEsS0FBQSxvQkFBQSxVQUFBLE9BQUE7O1lBRUEsR0FBQSxNQUFBLFVBQUEsSUFBQTtnQkFDQSxTQUFBLE1BQUE7Z0JBQ0EsT0FBQSxNQUFBO2dCQUNBLE9BQUE7Ozs7UUFJQSxPQUFBLFFBQUEsVUFBQSxRQUFBOztZQUVBLE1BQUEsUUFBQTs7S0FFQTs7QUMxQkEsQ0FBQSxXQUFBOztJQUVBLFFBQUEsT0FBQSxjQUFBLFdBQUEsc0JBQUEsQ0FBQSxVQUFBLFlBQUEsU0FBQTs7SUFFQSxTQUFBLG1CQUFBLFFBQUEsVUFBQSxPQUFBOztRQUVBLE9BQUEsT0FBQTtZQUNBLE1BQUE7WUFDQSxhQUFBOzs7Ozs7UUFNQSxTQUFBLEtBQUEsU0FBQSxLQUFBLG9CQUFBLFVBQUEsT0FBQTs7WUFFQSxHQUFBLE1BQUEsVUFBQSxJQUFBO2dCQUNBLFNBQUEsTUFBQTtnQkFDQSxPQUFBLE1BQUE7Z0JBQ0EsT0FBQTs7OztRQUlBLE9BQUEsUUFBQSxVQUFBLFFBQUE7O1lBRUEsTUFBQSxRQUFBOzs7O0tBSUE7S0FDQSIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFRoaXMgY29uZmlnIGlzIGludGVuZGVkIHRvIGJlIGluamVjdGVkIGluIHlvdXIgc3JjXG4gKi9cbmFuZ3VsYXIubW9kdWxlKFwiYXBwLmNvbmZpZ1wiLCBbXSlcbiAgICAuY29uc3RhbnQoXCJjb25maWdcIiwge1xuICAgICAgICBcImFwaVwiOiBcImh0dHA6Ly9sb2NhbGhvc3Q6ODAwMS9hcGkvdjFcIiwgXG4gICAgICAgIFwiZGVidWdcIjogdHJ1ZSxcbiAgICAgICAgXCJTUkNfRk9MREVSXCI6ICcvc3JjL2FwcF9tb2R1bGVzLycsXG4gICAgICAgIFwiSU1HX0ZPTERFUlwiOiAnL2ltZy8nLFxuICAgICAgICBcIlBST0ZJTEVfSU1HX0ZPTERFUlwiOiAnL2ltZy9wcm9maWxlLydcbiAgICB9KTtcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAuY2FyZHMnLCBbXSk7XG5cbiIsIid1c2Ugc3RyaWN0JztcblxuYW5ndWxhci5tb2R1bGUoJ2FwcCcsIFsnbmcnLCAnbmdSb3V0ZScsICduZ0Nvb2tpZXMnLCAnYXBwLmNvbmZpZycsICdhcHAuaG9tZScsICdhbmd1bGFyTW9kYWxTZXJ2aWNlJywgJ3Bhc2NhbHByZWNodC50cmFuc2xhdGUnLCAnYW5ndWxhci1ncm93bCddKTtcbiAgXG4vKipcbiAqIFJlc3Qgb2YgdGhlIGdsb2JhbCBjb25maWcgY2FuIGJlIGZvdW5kIGluIGFwcC1jb25maWcgbW9kdWxlXG4gKi8gIFxuYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmNvbmZpZyhbJyRodHRwUHJvdmlkZXInLCAnJGxvZ1Byb3ZpZGVyJywgJyR0cmFuc2xhdGVQcm92aWRlcicsICdncm93bFByb3ZpZGVyJywgJ2NvbmZpZycsIFxuICAgIGZ1bmN0aW9uICgkaHR0cFByb3ZpZGVyLCAkbG9nUHJvdmlkZXIsICR0cmFuc2xhdGVQcm92aWRlciwgZ3Jvd2xQcm92aWRlciwgY29uZmlnKSB7XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQWpheCBjYWxsc1xuICAgICAgICAgKi8gXG4gICAgICAgICRodHRwUHJvdmlkZXIuZGVmYXVsdHMuaGVhZGVycy5jb21tb24gPSB7IFxuICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vanNvbjtvZGF0YT12ZXJib3NlJyxcbiAgICAgICAgICAgICdYLUxvZ2luLUFqYXgtY2FsbCc6ICd0cnVlJyxcbiAgICAgICAgICAgICdYLVJlcXVlc3RlZC1XaXRoJzogXCJYTUxIdHRwUmVxdWVzdFwiLFxuICAgICAgICAgICAgJ1gtQ1NSRi1UT0tFTic6IExhcmF2ZWwuY3NyZlRva2VuXG4gICAgICAgICAgfTtcbiAgICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEdyb3dsIG1lc3NhZ2VzXG4gICAgICAgICAqL1xuICAgICAgICBncm93bFByb3ZpZGVyLm9ubHlVbmlxdWVNZXNzYWdlcyhmYWxzZSk7XG4gICAgICAgIGdyb3dsUHJvdmlkZXIuZ2xvYmFsUmV2ZXJzZWRPcmRlcih0cnVlKTtcbiAgICAgICAgZ3Jvd2xQcm92aWRlci5nbG9iYWxUaW1lVG9MaXZlKHtzdWNjZXNzOiAxMDAwLCBlcnJvcjogMTEyMDAwLCB3YXJuaW5nOiAzMDAwLCBpbmZvOiA0MDAwfSk7XG4gICAgICAgIGdyb3dsUHJvdmlkZXIuZ2xvYmFsRGlzYWJsZUNvdW50RG93bih0cnVlKTtcbiAgICAgICAgZ3Jvd2xQcm92aWRlci5nbG9iYWxEaXNhYmxlSWNvbnModHJ1ZSk7XG4gICAgICAgIGdyb3dsUHJvdmlkZXIuZ2xvYmFsUG9zaXRpb24oJ2JvdHRvbS1sZWZ0Jyk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIERlYnVnZ2luZ1xuICAgICAgICAgKi8gXG4gICAgICAgICRsb2dQcm92aWRlci5kZWJ1Z0VuYWJsZWQoY29uZmlnLmRlYnVnKTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUcmFuc2xhdGlvbnNcbiAgICAgICAgICovICAgICBcbiAgICAgICAgJHRyYW5zbGF0ZVByb3ZpZGVyLnVzZVN0YXRpY0ZpbGVzTG9hZGVyKHtcbiAgICAgICAgICAgIHByZWZpeDogJy9pMThuL2xvY2FsZS0nLFxuICAgICAgICAgICAgc3VmZml4OiAnLmpzb24nXG4gICAgICAgIH0pO1xuXG4gICAgICAgICR0cmFuc2xhdGVQcm92aWRlci51c2VDb29raWVTdG9yYWdlKCk7XG4gICAgICAgICR0cmFuc2xhdGVQcm92aWRlci5wcmVmZXJyZWRMYW5ndWFnZSgnZW5fVVMnKTtcbiAgICAgICAgJHRyYW5zbGF0ZVByb3ZpZGVyLmZhbGxiYWNrTGFuZ3VhZ2UoJ2VuX1VTJyk7XG4gICAgICAgICR0cmFuc2xhdGVQcm92aWRlci51c2VTYW5pdGl6ZVZhbHVlU3RyYXRlZ3koJ2VzY2FwZScpO1xufV0pO1xuIFxuYW5ndWxhci5tb2R1bGUoJ2FwcCcpLnJ1bihbZnVuY3Rpb24gKCkge1xuIFxufV0pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcC5ob21lJywgWyduZ1JvdXRlJywgJ2FwcC5jb25maWcnLCAnbmdBbmltYXRlJywgJ2FwcC5jYXJkcycsICdhcHAuc3RhY2tzJywgJ2FwcC50YWdzJywgJ2hjLm1hcmtlZCcsICduZ1Nhbml0aXplJ10pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcC5zdGFja3MnLCBbJ25nUmVzb3VyY2UnXSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwLnRhZ3MnLCBbJ25nUmVzb3VyY2UnXSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwLmNhcmRzJykuY29uZmlnKGZ1bmN0aW9uKCRyb3V0ZVByb3ZpZGVyKSB7XG4gICBcbn0pOyIsIihmdW5jdGlvbiAoKSB7XG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmNvbmZpZyhbJyRyb3V0ZVByb3ZpZGVyJywgJ2NvbmZpZycsIGZ1bmN0aW9uKCRyb3V0ZVByb3ZpZGVyLCBjb25maWcpIHtcblxuICAgICAgJHJvdXRlUHJvdmlkZXJcbiAgICAgICAgLndoZW4oJy8nLCB7XG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogY29uZmlnLlNSQ19GT0xERVIgKyAnaG9tZS90ZW1wbGF0ZXMvaG9tZS10ZW1wbGF0ZS5odG1sJyxcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdIb21lQ29udHJvbGxlcicsXG4gICAgICAgICAgICBjb250cm9sbGVyQXM6ICdob21lJ1xuICAgICAgICB9KVxuXG4gICAgICAgIC5vdGhlcndpc2Uoe3JlZGlyZWN0VG86ICcvJ30pOyBcbiAgICB9XSk7XG59KSgpOyIsImFuZ3VsYXIubW9kdWxlKCdhcHAuaG9tZScpLmNvbmZpZyhmdW5jdGlvbigkcm91dGVQcm92aWRlcikge1xuXG59KTsiLCJcbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcblxuICAgIC8vIHN3aXRjaCBmb3Jtc1xuICAgICQoJy5tZXNzYWdlIGEnKS5jbGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgIFxuICAgICAgICAkKCdmb3JtJykuYW5pbWF0ZSh7aGVpZ2h0OiBcInRvZ2dsZVwiLCBvcGFjaXR5OiBcInRvZ2dsZVwifSwgXCJzbG93XCIpO1xuICAgICAgICBcbiAgICAgICAgaWYod2luZG93LmxvY2F0aW9uLnBhdGhuYW1lID09ICcvbG9naW4nKSB7XG4gICAgICAgICAgICBoaXN0b3J5LnB1c2hTdGF0ZSh7fSwgXCJSZWdpc3RlclwiLCBcIi9yZWdpc3RlclwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGhpc3RvcnkucHVzaFN0YXRlKHt9LCBcIkxvZ2luXCIsIFwiL2xvZ2luXCIpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAkKCdmb3JtIC5oZWxwLWJsb2NrJykuaGlkZSgpO1xuICAgIH0pO1xuXG59KTsiLCJhbmd1bGFyLm1vZHVsZSgnYXBwLnN0YWNrcycpLmNvbmZpZyhmdW5jdGlvbigkcm91dGVQcm92aWRlcikge1xuXG59KTsiLCIoZnVuY3Rpb24gKCkge1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5jYXJkcycpLmRpcmVjdGl2ZSgnY2FyZCcsXG4gICAgICAgIFsnY29uZmlnJywgZnVuY3Rpb24gKGNvbmZpZykge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogY29uZmlnLlNSQ19GT0xERVIgKyAnY2FyZHMvdGVtcGxhdGVzL2NhcmQuaHRtbCcsXG4gICAgICAgICAgICAgICAgcmVzdHJpY3Q6ICdBJyxcbiAgICAgICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICAgICAgICAgIGNhcmQ6IFwiPWRhdGFcIlxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogWyckc2NvcGUnLCAnJHJvb3RTY29wZScsICckbG9nJywgJ2NvbmZpZycsICdncm93bCcsICdjYXJkc0ZhY3RvcnknLCAnTW9kYWxTZXJ2aWNlJyxcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKCRzY29wZSwgJHJvb3RTY29wZSwgJGxvZywgY29uZmlnLCBncm93bCwgY2FyZHNGYWN0b3J5LCBNb2RhbFNlcnZpY2UpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmV2ZW50cyA9IHt9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIERpc3BsYXkgb25seSBYIHRhZ3NcbiAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLm1heF9udW1fdGFncyA9IDM7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICogUGluIENhcmQgKG1ha2UgaXQgJ3N0aWNreScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIEBwYXJhbSBDYXJkIGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgICAgICAqIEByZXR1cm5zIHZvaWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmV2ZW50cy5waW5DYXJkID0gZnVuY3Rpb24gKGl0ZW0pIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjYXJkID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogaXRlbS5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RpY2t5OiAhaXRlbS5zdGlja3lcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhamF4IGNhbGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXJkc0ZhY3RvcnkudXBkYXRlKGNhcmQpLiRwcm9taXNlLnRoZW4oZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGVtbWl0IGV2ZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgncGluLWNhcmQnLCBpdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRsb2cuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3Jvd2wuZXJyb3IoXCJVcHMsIGZhaWxlZC4gU29ycnkuXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBEZWxldGUgQ2FyZFxuICAgICAgICAgICAgICAgICAgICAgICAgICogXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBAcGFyYW0gQ2FyZCBpdGVtXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBAcmV0dXJucyB2b2lkXG4gICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5ldmVudHMuZGVsZXRlID0gZnVuY3Rpb24gKGl0ZW0pIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEp1c3QgcHJvdmlkZSBhIHRlbXBsYXRlIHVybCwgYSBjb250cm9sbGVyIGFuZCBjYWxsICdzaG93TW9kYWwnLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1vZGFsU2VydmljZS5zaG93TW9kYWwoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogY29uZmlnLlNSQ19GT0xERVIgKyBcImNvbW1vbi90ZW1wbGF0ZXMvbW9kYWxzL2NvbmZpcm0uaHRtbFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBcIlllc05vQ29udHJvbGxlclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnB1dHM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAndGl0bGUnOiAnRGVsZXRlIGNhcmQ/JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnY29udGVudCc6IFwiWW91J2xsIG5vdCBiZSBhYmxlIHRvIHJlY292ZXIgaXRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkudGhlbihmdW5jdGlvbiAobW9kYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWwuZWxlbWVudC5tb2RhbCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RhbC5jbG9zZS50aGVuKGZ1bmN0aW9uIChyZXN1bHQpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdCkgeyAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhamF4IGNhbGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXJkc0ZhY3RvcnkuZGVsZXRlKHtpZDogaXRlbS5pZH0pLiRwcm9taXNlLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZW1taXQgZXZlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdkZWxldGUtY2FyZCcsIGl0ZW0pOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkbG9nLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3dsLmVycm9yKFwiVXBzLCBmYWlsZWQgZGVsZXRpbmcgaXQuXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJGxvZy5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncm93bC5lcnJvcihcIlVwcywgZmFpbGVkIG9wZW5pbmcgZGlhbG9nLlwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICogRWRpdCBDYXJkXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIEBwYXJhbSBDYXJkIGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgICAgICAqIEByZXR1cm5zIHZvaWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmV2ZW50cy5lZGl0ID0gZnVuY3Rpb24gKGl0ZW0pIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1vZGFsU2VydmljZS5zaG93TW9kYWwoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogY29uZmlnLlNSQ19GT0xERVIgKyBcImNhcmRzL3RlbXBsYXRlcy9tb2RhbHMvZWRpdC1jYXJkLmh0bWxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogXCJFZGl0Q2FyZENvbnRyb2xsZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXRzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FyZDogaXRlbVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkudGhlbihmdW5jdGlvbiAobW9kYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWwuZWxlbWVudC5tb2RhbCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RhbC5jbG9zZS50aGVuKGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHByZXBhcmUgZGF0YSB0byBiZSBzZW5kIHRvIHNlcnZlciBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgY2FyZCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGl0ZW0uaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IG1vZGFsLnNjb3BlLmZvcm0ubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogbW9kYWwuc2NvcGUuZm9ybS5jb250ZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYWpheCBjYWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FyZHNGYWN0b3J5LnVwZGF0ZShjYXJkKS4kcHJvbWlzZS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGVtbWl0IGV2ZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgndXBkYXRlLWNhcmQnLCBpdGVtLCBjYXJkKTsgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJGxvZy5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncm93bC5lcnJvcihcIlVwcywgZmFpbGVkIHNhdmluZyBjaGFuZ2VzLlwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRsb2cuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3Jvd2wuZXJyb3IoXCJVcHMsIGZhaWxlZCBvcGVuaW5nIGZvcm0uXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBWaWV3IGNvbnRlbnQgaW4gbW9kYWxib3ggd2l0aCBNYXJrZG93biAocmljaCB0ZXh0IG1vZGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIEBwYXJhbSBDYXJkIGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgICAgICAqIEByZXR1cm5zIHZvaWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmV2ZW50cy52aWV3QXNNYXJrZG93bk1vZGFsID0gZnVuY3Rpb24gKGl0ZW0pIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEp1c3QgcHJvdmlkZSBhIHRlbXBsYXRlIHVybCwgYSBjb250cm9sbGVyIGFuZCBjYWxsICdzaG93TW9kYWwnLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1vZGFsU2VydmljZS5zaG93TW9kYWwoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogY29uZmlnLlNSQ19GT0xERVIgKyBcImhvbWUvdGVtcGxhdGVzL21vZGFscy9tYXJrZG93bi5odG1sXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IFwiTWFya2Rvd25Db250cm9sbGVyXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0czoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdjYXJkJzogaXRlbVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkudGhlbihmdW5jdGlvbiAobW9kYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWwuZWxlbWVudC5tb2RhbCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkbG9nLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3dsLmVycm9yKFwiVXBzLCBmYWlsZWQgb3BlbmluZyB2aWV3LlwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfV1cbiAgICAgICAgfTtcbiAgICB9XSk7XG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmNhcmRzJykuZGlyZWN0aXZlKCduZXdDYXJkRm9ybScsXG4gICAgICAgIFsnY29uZmlnJywgZnVuY3Rpb24gKGNvbmZpZykge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICAgICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICAgICAgICAgIGNhcmQ6IFwiPVwiXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBjb25maWcuU1JDX0ZPTERFUiArICdjYXJkcy90ZW1wbGF0ZXMvbmV3LWZvcm0uaHRtbCcsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogWyckc2NvcGUnLCAnJHJvb3RTY29wZScsICckbG9nJywgJ2dyb3dsJywgJ2NhcmRzRmFjdG9yeScsIGZ1bmN0aW9uICgkc2NvcGUsICRyb290U2NvcGUsICRsb2csIGdyb3dsLCBjYXJkc0ZhY3RvcnkpIHtcblxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXZlbnRzID0ge307XG5cbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFN1Ym1pdCBmb3JtXG4gICAgICAgICAgICAgICAgICAgICAqIEByZXR1cm5zIHZvaWRcbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5ldmVudHMuY3JlYXRlQ2FyZCA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCRzY29wZS5jb250ZW50KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgZGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogJHNjb3BlLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6ICRzY29wZS5jb250ZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhcmRzRmFjdG9yeS5zYXZlKGRhdGEpLiRwcm9taXNlLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY2xhc3MgPSAnaGlnaGxpZ2h0ZWQnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmlkID0gcmVzcG9uc2UuaWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnbmV3LWNhcmQnLCBkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJGxvZy5lcnJvcihyZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3dsLmVycm9yKFwiVXBzLCBmYWlsZWQgc2F2aW5nLiBTb3JyeS5cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5jb250ZW50ID0gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXX1cbiAgICAgICAgfV0pO1xufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuY2FyZHMnKS5kaXJlY3RpdmUoJ29yZGVyQnknLCBbJ2NvbmZpZycsXG4gICAgICAgIGZ1bmN0aW9uIChjb25maWcpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICByZXN0cmljdDogJ0VBJyxcbiAgICAgICAgICAgICAgICBzY29wZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogY29uZmlnLlNSQ19GT0xERVIgKyAnL2NhcmRzL3RlbXBsYXRlcy9vcmRlci1ieS5odG1sJyxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBbJyRzY29wZScsICckcm9vdFNjb3BlJywgJyRjb29raWVzJywgZnVuY3Rpb24gKCRzY29wZSwgJHJvb3RTY29wZSwgJGNvb2tpZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5ldmVudHMgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGxldCBvcmRlciA9ICRjb29raWVzLmdldE9iamVjdCgnb3JkZXInKTtcbiAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vIGluaXRpYWwgcG9zaXRpb25cbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLm9yZGVyID0gb3JkZXIgJiYgIWFuZ3VsYXIuaXNVbmRlZmluZWQob3JkZXIub3JkZXIpID8gb3JkZXIub3JkZXIgOiAndXBkYXRlZF9hdCc7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5kaXJlY3Rpb24gPSBvcmRlciAmJiAhYW5ndWxhci5pc1VuZGVmaW5lZChvcmRlci5kaXJlY3Rpb24pID8gb3JkZXIuZGlyZWN0aW9uIDogJ2Rlc2MnO1xuXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5ldmVudHMudXBkYXRlID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBkYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yZGVyOiAkc2NvcGUub3JkZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0aW9uOiAkc2NvcGUuZGlyZWN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHBlcnNpc3RcbiAgICAgICAgICAgICAgICAgICAgICAgICRjb29raWVzLnB1dE9iamVjdCgnb3JkZXInLCBkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdvcmRlci1jaGFuZ2VkJywgZGF0YSk7IC8vIGVtbWl0XG4gICAgICAgICAgICAgICAgICAgIH0gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIF0pO1xufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAnKS5kaXJlY3RpdmUoJ3BhZ2luYXRlQ2FyZHMnLCBbJ2NvbmZpZycsXG4gICAgICAgIGZ1bmN0aW9uIChjb25maWcpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICByZXN0cmljdDogJ0VBJyxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogY29uZmlnLlNSQ19GT0xERVIgKyAnL2NhcmRzL3RlbXBsYXRlcy9wYWdpbmF0ZS1jYXJkcy5odG1sJyxcbiAgICAgICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6ICc9J1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogWyckc2NvcGUnLCAnJHJvb3RTY29wZScsIGZ1bmN0aW9uICgkc2NvcGUsICRyb290U2NvcGUpIHtcbiAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuY29udGV4dCA9IHt9O1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXZlbnRzID0ge307XG4gICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIERyYXcgd2lkZ2V0IHdoZW4gZGF0YSBpcyBhdmFpbGFibGVcbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS4kb24oJ2NhcmRzLWxvYWRlZCcsIGZ1bmN0aW9uKGV2dCwgZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmNvbnRleHQucGFnZXMgPSBkYXRhOyBcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5jb250ZXh0LmRpc3BsYXkgPSBkYXRhLmRhdGEubGVuZ3RoICYmIChkYXRhLnByZXZfcGFnZV91cmwgIT09IG51bGwgfHwgZGF0YS5uZXh0X3BhZ2VfdXJsICE9PSBudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogQnJvYWRjYXN0IGNoYW5nZXNcbiAgICAgICAgICAgICAgICAgICAgICogQHJldHVybnMgdm9pZFxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmV2ZW50cy5uYXZpZ2F0ZSA9IGZ1bmN0aW9uICgkZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgJGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAkZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHRhcmdldCA9ICRldmVudC5jdXJyZW50VGFyZ2V0O1xuICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBpZih0eXBlb2YodGFyZ2V0LmF0dHJpYnV0ZXNbJ2Rpc2FibGVkJ10pID09PSAndW5kZWZpbmVkJyB8fCAhdGFyZ2V0LmF0dHJpYnV0ZXNbJ2Rpc2FibGVkJ10udmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ2NhcmRzLXBhZ2UtY2hhbmdlZCcsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFnZTogdGFyZ2V0LmF0dHJpYnV0ZXNbJ2RhdGEtcGFnZSddLnZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7IC8vIGVtbWl0XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIF0pO1xufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5jYXJkcycpLmZhY3RvcnkoJ2NhcmRzRmFjdG9yeScsIFsnJHJlc291cmNlJywgJ2NvbmZpZycsIGZ1bmN0aW9uKCRyZXNvdXJjZSwgY29uZmlnKSB7XG5cbiAgICAgICAgcmV0dXJuICRyZXNvdXJjZShjb25maWcuYXBpICsgJy9jYXJkcy86aWQnLCBcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpZDogJ0BpZCcsXG4gICAgICAgICAgICAgICAgcGFnZTogJ0BwYWdlJ1xuICAgICAgICAgICAgfSwgXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcXVlcnk6IHtcbiAgICAgICAgICAgICAgICAgICAgdXJsOiBjb25maWcuYXBpICsgJy9jYXJkcy90YWdzL2FsbCcsXG4gICAgICAgICAgICAgICAgICAgIGlzQXJyYXk6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm1SZXNwb25zZTogZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYW5ndWxhci5mcm9tSnNvbihyZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHVwZGF0ZToge1xuICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnUFVUJyBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTsgXG4gICAgfV0pO1xufSkoKTtcblxuIiwiKGZ1bmN0aW9uICgpIHtcblxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAnKS5jb250cm9sbGVyKCdIZWFkZXJDb250cm9sbGVyJywgWyckc2NvcGUnLCBIZWFkZXJDb250cm9sbGVyXSk7XG5cbiAgICBmdW5jdGlvbiBIZWFkZXJDb250cm9sbGVyKCRzY29wZSkge1xuICAgICAgICBcbiAgICB9XG59KSgpO1xuXG5cbiIsIihmdW5jdGlvbiAoKSB7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwJykuY29udHJvbGxlcignTGF5b3V0Q29udHJvbGxlcicsIFsnJHNjb3BlJywgJyRzY2UnLCBMYXlvdXRDb250cm9sbGVyXSk7XG5cbiAgICBmdW5jdGlvbiBMYXlvdXRDb250cm9sbGVyKCRzY29wZSwgJHNjZSkge1xuXG4gICAgICAgICRzY29wZS50YWdVc2VyQ2xpY2sgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICB2YXIgdGFnVGV4dCA9IGUudGFyZ2V0LmlubmVyVGV4dDtcbiAgICAgICAgICAgIGFsZXJ0KCd0YWdVc2VyQ2xpY2ssIHRhZ1RleHQ6ICcgKyB0YWdUZXh0KTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgICRzY29wZS50YWdUZXJtQ2xpY2sgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICB2YXIgdGFnVGV4dCA9IGUudGFyZ2V0LmlubmVyVGV4dDtcbiAgICAgICAgICAgIGFsZXJ0KCd0YWdUZXJtQ2xpY2ssIHRhZ1RleHQ6ICcgKyB0YWdUZXh0KTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8vIFlvdSBjb3VsZCBkZWZpbmUgJ3RhZ1VzZXJDbGljaycgYW5kICd0YWdUZXJtQ2xpY2snXG4gICAgICAgIC8vIG9uIHRoZSAnJHJvb3RTY29wZScuIFRoaXMgd2F5IHlvdSBjYW4gaGFuZGxlIHdoYXRldmVyXG4gICAgICAgIC8vIGxvZ2ljIHlvdSB3YW50IGZvciBoYXNodGFncyBpbiBvbmUgcGxhY2UgcmF0aGVyIHRoYW5cbiAgICAgICAgLy8gaGF2aW5nIHRvIGRlZmluZSBpdCBpbiBlYWNoIGNvbnRyb2xsZXIuXG4gICAgICAgIFxuICAgICAgICAkc2NvcGUudHJ1c3RIdG1sID0gZnVuY3Rpb24oaHRtbCkge1xuICAgICAgICAgICAgLy8gU2FuaXRpemUgbWFudWFsbHkgaWYgbmVjZXNzYXJ5LiBJdCdzIGxpa2VseSB0aGlzXG4gICAgICAgICAgICAvLyBodG1sIGhhcyBhbHJlYWR5IGJlZW4gc2FuaXRpemVkIHNlcnZlciBzaWRlXG4gICAgICAgICAgICAvLyBiZWZvcmUgaXQgd2VudCBpbnRvIHlvdXIgZGF0YWJhc2UuXG4gICAgICAgICAgICAvLyBEb24ndCBob2xkIG1lIGxpYWJsZSBmb3IgWFNTLi4uIG5ldmVyIGFzc3VtZSA6filcbiAgICAgICAgICAgIHJldHVybiAkc2NlLnRydXN0QXNIdG1sKGh0bWwpO1xuICAgICAgICB9O1xuICAgIH1cbn0pKCk7XG5cblxuIiwiKGZ1bmN0aW9uICgpIHtcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwJykuZGlyZWN0aXZlKCdhdXRvZm9jdXMnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByZXN0cmljdDogJ0EnLFxuICAgICAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudFswXS5mb2N1cygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0pO1xufSkoKTtcblxuICAgICAiLCIoZnVuY3Rpb24gKCkge1xuICAgIC8vIEJlY2F1c2Ugb2YgdGhlIGFubWUgYW5kIEUgdHlwZSwgd29ya3MgYXV0b21hdGljYWxseSBmb3IgZXZlcnkgdGV4dGFyZWFcbiAgICAvLyByZWY6IGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL3Rob21zZWRkb24vNDcwMzk2OFxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAnKS5kaXJlY3RpdmUoJ2VsYXN0aWNBcmVhJywgZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmVzdHJpY3Q6ICdBJyxcbiAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cmlidXRlcykge1xuICAgICAgICAgICAgICAgIHZhciB0aHJlc2hvbGQgPSAzNSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbkhlaWdodCA9IGVsZW1lbnRbMF0ub2Zmc2V0SGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZ0xlZnQgPSBlbGVtZW50LmNzcygncGFkZGluZ0xlZnQnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmdSaWdodCA9IGVsZW1lbnQuY3NzKCdwYWRkaW5nUmlnaHQnKTtcblxuICAgICAgICAgICAgICAgIHZhciAkc2hhZG93ID0gYW5ndWxhci5lbGVtZW50KCc8ZGl2PjwvZGl2PicpLmNzcyh7XG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgICAgICAgICAgICAgICB0b3A6IC0xMDAwMCxcbiAgICAgICAgICAgICAgICAgICAgbGVmdDogLTEwMDAwLFxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogZWxlbWVudFswXS5vZmZzZXRXaWR0aCAtIHBhcnNlSW50KHBhZGRpbmdMZWZ0IHx8IDApIC0gcGFyc2VJbnQocGFkZGluZ1JpZ2h0IHx8IDApLFxuICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogZWxlbWVudC5jc3MoJ2ZvbnRTaXplJyksXG4gICAgICAgICAgICAgICAgICAgIGZvbnRGYW1pbHk6IGVsZW1lbnQuY3NzKCdmb250RmFtaWx5JyksXG4gICAgICAgICAgICAgICAgICAgIGxpbmVIZWlnaHQ6IGVsZW1lbnQuY3NzKCdsaW5lSGVpZ2h0JyksXG4gICAgICAgICAgICAgICAgICAgIHJlc2l6ZTogJ25vbmUnXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuYm9keSkuYXBwZW5kKCRzaGFkb3cpO1xuXG4gICAgICAgICAgICAgICAgdmFyIHVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRpbWVzID0gZnVuY3Rpb24gKHN0cmluZywgbnVtYmVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgciA9ICcnOyBpIDwgbnVtYmVyOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByICs9IHN0cmluZztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHZhbCA9IGVsZW1lbnQudmFsKCkucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8mL2csICcmYW1wOycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcbiQvLCAnPGJyLz4mbmJzcDsnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXG4vZywgJzxici8+JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxzezIsfS9nLCBmdW5jdGlvbiAoc3BhY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRpbWVzKCcmbmJzcDsnLCBzcGFjZS5sZW5ndGggLSAxKSArICcgJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAkc2hhZG93Lmh0bWwodmFsKTtcblxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmNzcygnaGVpZ2h0JywgTWF0aC5tYXgoJHNoYWRvd1swXS5vZmZzZXRIZWlnaHQgKyB0aHJlc2hvbGQsIG1pbkhlaWdodCkpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICRzaGFkb3cucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBlbGVtZW50LmJpbmQoJ2tleXVwIGtleWRvd24ga2V5cHJlc3MgY2hhbmdlJywgdXBkYXRlKTtcbiAgICAgICAgICAgICAgICB1cGRhdGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xufSkoKTsiLCIoZnVuY3Rpb24gKCkgeyBcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwJykuZGlyZWN0aXZlKCdoYXNodGFnaWZ5JywgWyckdGltZW91dCcsICckY29tcGlsZScsXG4gICAgICAgIGZ1bmN0aW9uKCR0aW1lb3V0LCAkY29tcGlsZSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICByZXN0cmljdDogJ0EnLFxuICAgICAgICAgICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICAgICAgICAgIHVDbGljazogJyZ1c2VyQ2xpY2snLFxuICAgICAgICAgICAgICAgICAgICB0Q2xpY2s6ICcmdGVybUNsaWNrJ1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGh0bWwgPSBlbGVtZW50Lmh0bWwoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGh0bWwgPT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXR0cnMudXNlckNsaWNrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaHRtbCA9IGh0bWwucmVwbGFjZSgvKHxcXHMpKkAoXFx3KykvZywgJyQxPGEgbmctY2xpY2s9XCJ1Q2xpY2soeyRldmVudDogJGV2ZW50fSlcIiBjbGFzcz1cImhhc2h0YWdcIj5AJDI8L2E+Jyk7IFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXR0cnMudGVybUNsaWNrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaHRtbCA9IGh0bWwucmVwbGFjZSgvKF58XFxzKSojKFxcdyspL2csICckMTxhIG5nLWNsaWNrPVwidENsaWNrKHskZXZlbnQ6ICRldmVudH0pXCIgY2xhc3M9XCJoYXNodGFnXCI+IyQyPC9hPicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50Lmh0bWwoaHRtbCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICRjb21waWxlKGVsZW1lbnQuY29udGVudHMoKSkoc2NvcGUpO1xuICAgICAgICAgICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgXSk7XG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmRpcmVjdGl2ZSgnc2Vzc2lvbkRyb3Bkb3duJywgWydjb25maWcnLFxuICAgICAgICBmdW5jdGlvbiAoY29uZmlnKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcmVzdHJpY3Q6ICdFQScsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IGNvbmZpZy5TUkNfRk9MREVSICsgJy9jb21tb24vdGVtcGxhdGVzL3Nlc3Npb24tZHJvcGRvd24uaHRtbCcsICAgXG4gICAgICAgICAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogXCI9XCJcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50cywgYXR0cnMpIHtcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuaW1nX2ZvbGRlciA9IGNvbmZpZy5QUk9GSUxFX0lNR19GT0xERVI7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBbJyRzY29wZScsIGZ1bmN0aW9uICgkc2NvcGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUudXNlciA9ICRzY29wZS5kYXRhO1xuICAgICAgICAgICAgICAgIH1dXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgXSk7ICAgICAgIFxufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xuXG4gICAgLyoqXG4gICAgICogWW91IG1heSBwYXNzIGFueSBvZiB0aGVzZSB2YWx1ZTpcbiAgICAgKiBjb250cm9sOiB7XG4gICAgICogICBleHBhbmRlZDogYm9vbGVhbixcbiAgICAgKiAgIGV4cGFuZGFibGU6IGJvb2xlYW4sXG4gICAgICogICB0b2dnbGU6IGZuICAgICAgICAgLy8gYWN0dWFsbHksIHRoaXMgaXMgaGVyZSB0byBiZSBjYWxsZWQgZnJvbSB0aGUgb3V0c2lkZSwgbm90IG92ZXJyaWRlbi5cbiAgICAgKiAgIGhpZGVBcnJvdzogYm9vbGVhbiAvLyBoaWRlIG9yaWdpbmFsIGFycm93cz9cbiAgICAgKiB9LFxuICAgICAqIHNob3dNb3JlSGVpZ2h0OiAuLi5weFxuICAgICAqL1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAnKS5kaXJlY3RpdmUoJ3Nob3dNb3JlJyxcbiAgICAgICAgWydjb25maWcnLCBmdW5jdGlvbiAoY29uZmlnKSB7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IGNvbmZpZy5TUkNfRk9MREVSICsgJ2NvbW1vbi90ZW1wbGF0ZXMvc2hvd01vcmUuaHRtbCcsXG4gICAgICAgICAgICAgICAgcmVzdHJpY3Q6ICdBJyxcbiAgICAgICAgICAgICAgICB0cmFuc2NsdWRlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICAgICAgICAgICdjb250cm9sJzogJz0nLFxuICAgICAgICAgICAgICAgICAgICAnc2hvd01vcmVIZWlnaHQnOiAnQCdcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvLyBhY2Nlc3NpYmxlIGZyb20gdGhlIG91dHNpZGVcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUucHVibGljID0gc2NvcGUuY29udHJvbCB8fCB7fTsgXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvLyBpZiBwb3NzaWJsZSwgc2V0IHZhbHVlIGZyb20gdGhlIG91dHNpZGUuIFxuICAgICAgICAgICAgICAgICAgICBzY29wZS5wdWJsaWMuZXhwYW5kZWQgPSBzY29wZS5wdWJsaWMuZXhwYW5kZWQgfHwgZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvLyBVc2VmdWwgd2hlbiB5b3UgY2Fubm90IG1lYXN1cmUgdGhlIGhlaWdodCBvZiBlbGVtZW50IGF0IGZpcnN0LiBEZWNpZGUgdGhpcyBvdXRzaWRlLlxuICAgICAgICAgICAgICAgICAgICBzY29wZS5wdWJsaWMuZXhwYW5kYWJsZSA9IHNjb3BlLnB1YmxpYy5leHBhbmRhYmxlIHx8IGlzRXhwYW5kYWJsZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy8gVXNlZnVsIHdoZW4geW91IGNhbm5vdCBtZWFzdXJlIHRoZSBoZWlnaHQgb2YgZWxlbWVudCBhdCBmaXJzdC4gRGVjaWRlIHRoaXMgb3V0c2lkZS5cbiAgICAgICAgICAgICAgICAgICAgc2NvcGUucHVibGljLmhpZGVBcnJvdyA9IHNjb3BlLnB1YmxpYy5oaWRlQXJyb3cgfHwgZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBQdWJsaWMgbWV0aG9kc1xuICAgICAgICAgICAgICAgICAgICAgKi8gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBzY29wZS5wdWJsaWMudG9nZ2xlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUucHVibGljLmV4cGFuZGVkID0gIXNjb3BlLnB1YmxpYy5leHBhbmRlZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc0V4cGFuZGFibGUoKSAmJiBzY29wZS5wdWJsaWMuZXhwYW5kZWQgPT09IGZhbHNlKSB7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLnB1YmxpYy5leHBhbmRhYmxlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBQcml2YXRlIG1ldGhvZHNcbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGlzRXhwYW5kYWJsZSgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBlbGVtZW50LmhlaWdodCgpID49IHNjb3BlLnNob3dNb3JlSGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvLyBkaXJlY3RpdmUgc3R5bGUgXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLnNob3dMZXNzU3R5bGUgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAnbWF4LWhlaWdodCc6IHNjb3BlLnNob3dNb3JlSGVpZ2h0ICsgJ3B4JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdvdmVyZmxvdyc6ICdoaWRkZW4nXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfV0pO1xufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAnKS5kaXJlY3RpdmUoJ3N1Ym1pdE9uSzEzJywgWydjb25maWcnLFxuICAgICAgICBmdW5jdGlvbiAoY29uZmlnKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHJlc3RyaWN0OiAnQScsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogWyckc2NvcGUnLCAnJGVsZW1lbnQnLCBmdW5jdGlvbiAoJHNjb3BlLCAkZWxlbWVudCkge1xuXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBLZXkgZXZlbnQgKEVudGVyKVxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgJGVsZW1lbnQuYmluZChcImtleWRvd24ga2V5cHJlc3NcIiwgZnVuY3Rpb24gKGV2ZW50KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChldmVudC5jdXJyZW50VGFyZ2V0d2hpY2ggPT09IDEzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJGVsZW1lbnQuY2xvc2VzdCgnZm9ybScpLnN1Ym1pdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICBdKTtcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwJylcbiAgICAgICAgLmZpbHRlcigncmVkdWNlQnknLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoY29sbGVjdGlvbiwgZmllbGQpIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICByZXR1cm4gY29sbGVjdGlvbi5yZWR1Y2UoZnVuY3Rpb24ob3V0cHV0LCBjdXJyZW50KXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKCFmaWVsZEV4aXN0cyhvdXRwdXQsIGZpZWxkLCBjdXJyZW50W2ZpZWxkXSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG91dHB1dC5jb25jYXQoY3VycmVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gb3V0cHV0O1xuICAgICAgICAgICAgICAgICAgICB9LCBbXSk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGZpZWxkRXhpc3RzKGhheXN0YWNrLCBmaWVsZE5hbWUsIGZpZWxkVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGhheXN0YWNrLnNvbWUoZnVuY3Rpb24oZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZWxbZmllbGROYW1lXSA9PT0gZmllbGRWYWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgfSk7IFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07ICAgICAgICAgICAgXG4gICAgICAgIH0pO1xufSkoKTtcblxuIiwiKGZ1bmN0aW9uICgpIHtcbiAgICBcbiAgICAgYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmZhY3RvcnkoJ3F1ZXJ5RmFjdG9yeScsIFsnJGxvZycsICckY29va2llcycsICckcm9vdFNjb3BlJywgJ2NhcmRzRmFjdG9yeScsICdzdGFja3NGYWN0b3J5JywgJ3RhZ3NGYWN0b3J5JywgcXVlcnlGYWN0b3J5XSk7XG4gICAgXG4gICAgZnVuY3Rpb24gcXVlcnlGYWN0b3J5KCRsb2csICRjb29raWVzLCAkcm9vdFNjb3BlLCBjYXJkc0ZhY3RvcnksIHN0YWNrc0ZhY3RvcnksIHRhZ3NGYWN0b3J5KSB7XG4gICAgICAgIFxuICAgICAgICB2YXIgZmFjdG9yeSA9IHt9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIGdldCBhbGwgY2FyZHMgZnJvbSBzZXJ2ZXIgZm9yIGEgZ2l2ZW4gdXNlclxuICAgICAgICAgKiBcbiAgICAgICAgICogQHBhcmFtIGpzb24gcGFyYW1zXG4gICAgICAgICAqIEByZXR1cm5zIGNhcmRzRmFjdG9yeVxuICAgICAgICAgKiBAYnJvYWRjYXN0IGNhcmRzIGxpc3RcbiAgICAgICAgICovXG4gICAgICAgIGZhY3RvcnkuYWxsID0gZnVuY3Rpb24gKHBhcmFtcykge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBwYXJhbXMgPSBnZXRGaWx0ZXJzKHBhcmFtcywgWydvcmRlcicsICdzdGFjaycsICd0YWdzJ10pO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBxdWVyeVxuICAgICAgICAgICAgcmV0dXJuIGNhcmRzRmFjdG9yeVxuICAgICAgICAgICAgICAgIC5xdWVyeShwYXJhbXMsIGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgYnJvYWRjYXN0KHJlc3BvbnNlKTsgLy8gdGVsbCB0aGUgd29ybGRcbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgJGxvZy5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgIH0pOyAgXG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogZ2V0IGNhcmRzIHVzaW5nIHN0YWNrIGZpbHRlcnNcbiAgICAgICAgICogXG4gICAgICAgICAqIEBwYXJhbSBqc29uIHBhcmFtc1xuICAgICAgICAgKiBAcmV0dXJucyBzdGFja3NGYWN0b3J5XG4gICAgICAgICAqIEBicm9hZGNhc3QgY2FyZHMgbGlzdFxuICAgICAgICAgKi9cbiAgICAgICAgZmFjdG9yeS5ieVN0YWNrID0gZnVuY3Rpb24gKHBhcmFtcykge1xuICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBwYXJhbXMgPSBnZXRGaWx0ZXJzKHBhcmFtcywgWydvcmRlcicsICdzdGFjaycsICd0YWdzJ10pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIHN0YWNrc0ZhY3RvcnkuZmlsdGVyKHBhcmFtcywgZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBicm9hZGNhc3QocmVzcG9uc2UpOyAvLyB0ZWxsIHRoZSB3b3JsZFxuICAgICAgICAgICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgICAgJGxvZy5lcnJvcihlcnIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBnZXQgY2FyZHMgdXNpbmcgY3VycmVudCBmaWx0ZXJzXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAcGFyYW0ganNvbiBwYXJhbXNcbiAgICAgICAgICogQHJldHVybnMgc3RhY2tzRmFjdG9yeVxuICAgICAgICAgKiBAYnJvYWRjYXN0IGNhcmRzIGxpc3RcbiAgICAgICAgICovXG4gICAgICAgIGZhY3RvcnkuYnlUYWdzID0gZnVuY3Rpb24gKHBhcmFtcykge1xuICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBwYXJhbXMgPSBnZXRGaWx0ZXJzKHBhcmFtcywgWydvcmRlcicsICdzdGFjaycsICd0YWdzJ10pO1xuICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gdGFnc0ZhY3RvcnkuZmlsdGVyKHBhcmFtcywgZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBicm9hZGNhc3QocmVzcG9uc2UpOyAvLyB0ZWxsIHRoZSB3b3JsZFxuICAgICAgICAgICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgICAgJGxvZy5lcnJvcihlcnIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgICAgICAgXG4gICAgICAgIGZ1bmN0aW9uIGdldEZpbHRlcnMocGFyYW1zLCBmaWx0ZXJzKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKHR5cGVvZihwYXJhbXMpID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIHBhcmFtcyA9IHt9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZihmaWx0ZXJzLmluY2x1ZGVzKCd0YWdzJykgJiYgdHlwZW9mKCRjb29raWVzLmdldCgndGFnc1tdJykpICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIHBhcmFtc1sndGFnc1tdJ10gPSAkY29va2llcy5nZXRPYmplY3QoJ3RhZ3NbXScpLm1hcChmdW5jdGlvbih4KXsgcmV0dXJuIHguaWQ7IH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYoZmlsdGVycy5pbmNsdWRlcygnc3RhY2snKSAmJiB0eXBlb2YoJGNvb2tpZXMuZ2V0KCdzdGFjaycpKSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICBwYXJhbXMuc3RhY2sgPSAkY29va2llcy5nZXRPYmplY3QoJ3N0YWNrJykuaWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZihmaWx0ZXJzLmluY2x1ZGVzKCdvcmRlcicpICYmIHR5cGVvZigkY29va2llcy5nZXQoJ29yZGVyJykpICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIHBhcmFtcy5vcmRlciA9ICRjb29raWVzLmdldE9iamVjdCgnb3JkZXInKTsgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gcGFyYW1zO1xuICAgICAgICB9XG4gICAgICAgICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogVGVsbCBldmVyeWJvZHkgd2UgaGF2ZSBhIHJlbm92YXRlZCBsaXN0XG4gICAgICAgICAqL1xuICAgICAgICBmdW5jdGlvbiBicm9hZGNhc3QoZGF0YSkge1xuICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdjYXJkcy1sb2FkZWQnLCBkYXRhKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGZhY3Rvcnk7XG4gICAgfSAgICBcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcblxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuaG9tZScpLmNvbnRyb2xsZXIoJ0hvbWVDb250cm9sbGVyJywgWyckc2NvcGUnLCAnZ3Jvd2wnLCBIb21lQ29udHJvbGxlcl0pO1xuXG4gICAgZnVuY3Rpb24gSG9tZUNvbnRyb2xsZXIoJHNjb3BlLCBncm93bCkge1xuICAgICAgICBcbiAgICB9XG59KSgpO1xuXG5cbiIsIihmdW5jdGlvbigpe1xuICAgIFxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuaG9tZScpLmNvbnRyb2xsZXIoJ0xpc3RDb250cm9sbGVyJywgWyckc2NvcGUnLCAnJGxvZycsICdncm93bCcsICdxdWVyeUZhY3RvcnknLCAnSG9tZUNvbnRleHRTZXJ2aWNlJywgTGlzdENvbnRyb2xsZXJdKTtcbiAgICBcbiAgICBmdW5jdGlvbiBMaXN0Q29udHJvbGxlcigkc2NvcGUsICRsb2csIGdyb3dsLCBxdWVyeUZhY3RvcnksIEhvbWVDb250ZXh0U2VydmljZSl7XG4gICAgICAgIFxuICAgICAgICAkc2NvcGUuZXZlbnRzID0ge307XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogV2F5IHRvIGtlZXAgc2libGluZ3MgY29ubmVjdGVkIGFuZCBzaGFyaW5nIHNjb3BlXG4gICAgICAgICAqL1xuICAgICAgICAkc2NvcGUuY29udGV4dCA9IEhvbWVDb250ZXh0U2VydmljZS5jb250ZXh0O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEdldCBjYXJkcyBsaXN0XG4gICAgICAgICAqL1xuICAgICAgICAkc2NvcGUuZXZlbnRzLmxvYWQgPSBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gZ2V0IGRhdGEgZnJvbSBzZXJ2ZXJcbiAgICAgICAgICAgIHF1ZXJ5RmFjdG9yeVxuICAgICAgICAgICAgICAgIC5hbGwocGFyYW1zKS4kcHJvbWlzZS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgJGxvZy5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgICAgICBncm93bC5lcnJvcihcIlVwcywgZmFpbGVkIGxvYWRpbmcgY2FyZHMuXCIpO1xuICAgICAgICAgICAgICAgIH0pOyAgXG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAkc2NvcGUuZXZlbnRzLmxvYWQoKTsgLy8gcnVuIGF0IHBhZ2UgbG9hZFxuICAgICAgICBcbiAgICAgICAgJHNjb3BlLiRvbignY2FyZHMtbG9hZGVkJywgZnVuY3Rpb24oZXZ0LCByZXNwb25zZSkge1xuICAgICAgICAgICAgJHNjb3BlLmNvbnRleHQuY2FyZHMgPSByZXNwb25zZS5kYXRhOyAvLyBjYXJkcyBsaXN0XG4gICAgICAgICAgICAkc2NvcGUuY29udGV4dC5wYWdlcyA9IHJlc3BvbnNlOyAvLyBwYWdlcyBkYXRhICAgXG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEhhbmRsZSBsaXN0IG9yZGVyXG4gICAgICAgICAqL1xuICAgICAgICAkc2NvcGUuJG9uKCdvcmRlci1jaGFuZ2VkJywgZnVuY3Rpb24oZXZ0LCBwYXJhbXMpIHsgICBcbiAgICAgICAgICAgICRzY29wZS5ldmVudHMubG9hZCh7b3JkZXI6IHBhcmFtc30pOyAvLyByZWxvYWQgY2FyZHNcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogSGFuZGxlIHBhZ2luYXRpb25cbiAgICAgICAgICovXG4gICAgICAgICRzY29wZS4kb24oJ2NhcmRzLXBhZ2UtY2hhbmdlZCcsIGZ1bmN0aW9uKGV2dCwgcGFyYW1zKSB7XG4gICAgICAgICAgICAkc2NvcGUuZXZlbnRzLmxvYWQocGFyYW1zKTsgLy8gcmVsb2FkIGNhcmRzXG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENyZWF0ZSBjYXJkXG4gICAgICAgICAqL1xuICAgICAgICAkc2NvcGUuJG9uKCduZXctY2FyZCcsIGZ1bmN0aW9uKGV2dCwgaXRlbSkge1xuICAgICAgICAgICAgJHNjb3BlLmNvbnRleHQuY2FyZHMudW5zaGlmdChpdGVtKTtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogUGluIGNhcmRcbiAgICAgICAgICovXG4gICAgICAgICRzY29wZS4kb24oJ3Bpbi1jYXJkJywgZnVuY3Rpb24oZXZ0LCBpdGVtKSB7XG4gICAgICAgICAgIFxuICAgICAgICAgICAgaWYoaXRlbS5zdGlja3kpIHtcbiAgICAgICAgICAgICAgICAvLyBub3Qgc3RpY2t5IGFueW1vcmVcbiAgICAgICAgICAgICAgICBpdGVtLnN0aWNreSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGl0ZW0uY2xhc3MgPSBpdGVtLmNsYXNzID8gaXRlbS5jbGFzcy5yZXBsYWNlKFwic3RpY2t5XCIsIFwiXCIpIDogXCJcIjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gc3RpY2t5LiBQdXQgaXQgZmlyc3RcbiAgICAgICAgICAgICAgICBpdGVtLnN0aWNreSA9IHRydWU7XG4gICAgICAgICAgICAgICAgaXRlbS5jbGFzcyA9IGl0ZW0uY2xhc3MgPyBpdGVtLmNsYXNzICsgXCIgc3RpY2t5XCIgOiBcInN0aWNreVwiOyAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBsZXQgaW5kZXggPSAkc2NvcGUuY29udGV4dC5jYXJkcy5pbmRleE9mKGl0ZW0pO1xuICAgICAgICAgICAgICAgICRzY29wZS5jb250ZXh0LmNhcmRzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmNvbnRleHQuY2FyZHMudW5zaGlmdChpdGVtKTtcbiAgICAgICAgICAgIH0gXG4gICAgICAgIH0pO1xuICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogRGVsZXRlIGNhcmRcbiAgICAgICAgICovXG4gICAgICAgICRzY29wZS4kb24oJ2RlbGV0ZS1jYXJkJywgZnVuY3Rpb24oZXZ0LCBpdGVtKSB7XG4gICAgICAgICAgICBsZXQgaW5kZXggPSAkc2NvcGUuY29udGV4dC5jYXJkcy5pbmRleE9mKGl0ZW0pO1xuICAgICAgICAgICAgJHNjb3BlLmNvbnRleHQuY2FyZHMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogVXBkYXRlIGNhcmRcbiAgICAgICAgICovXG4gICAgICAgICRzY29wZS4kb24oJ3VwZGF0ZS1jYXJkJywgZnVuY3Rpb24oZXZ0LCBvcmlnaW5hbCwgbmV3Q2FyZCkge1xuICAgICAgICAgICAgbGV0IGluZGV4ID0gJHNjb3BlLmNvbnRleHQuY2FyZHMuaW5kZXhPZihvcmlnaW5hbCk7XG4gICAgICAgICAgICBhbmd1bGFyLmV4dGVuZCgkc2NvcGUuY29udGV4dC5jYXJkc1tpbmRleF0sIG5ld0NhcmQpO1xuICAgICAgICB9KTtcbiAgICB9XG59KSgpOyIsIihmdW5jdGlvbigpe1xuICAgIFxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuaG9tZScpLmNvbnRyb2xsZXIoJ1NlYXJjaENvbnRyb2xsZXInLCBbJyRzY29wZScsICdIb21lQ29udGV4dFNlcnZpY2UnLCBTZWFyY2hDb250cm9sbGVyXSk7XG4gICAgXG4gICAgZnVuY3Rpb24gU2VhcmNoQ29udHJvbGxlcigkc2NvcGUsIEhvbWVDb250ZXh0U2VydmljZSl7XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogV2F5IHRvIGtlZXAgc2libGluZ3MgY29ubmVjdGVkIGFuZCBzaGFyaW5nIHNjb3BlXG4gICAgICAgICAqL1xuICAgICAgICAkc2NvcGUuY29udGV4dCA9IEhvbWVDb250ZXh0U2VydmljZS5jb250ZXh0O1xuICAgIH1cbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmhvbWUnKVxuICAgICAgICAuZmlsdGVyKCdoaWdobGlnaHRUZXh0JywgZnVuY3Rpb24oJHNjZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh0ZXh0LCBwaHJhc2UpIHtcbiAgICAgICAgICAgICAgICBsZXQgaGlnaGxpZ2h0ZWQgPSBwaHJhc2VcbiAgICAgICAgICAgICAgICAgICAgICAgID8gdGV4dC5yZXBsYWNlKG5ldyBSZWdFeHAoJygnICsgcGhyYXNlICsgJyknLCAnZ2knKSwgJzxzcGFuIGNsYXNzPVwiaGlnaGxpZ2h0LXRleHRcIj4kMTwvc3Bhbj4nKVxuICAgICAgICAgICAgICAgICAgICAgICAgOiB0ZXh0O1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcmV0dXJuICRzY2UudHJ1c3RBc0h0bWwoaGlnaGxpZ2h0ZWQpO1xuICAgICAgICAgICAgfTsgICAgICAgICAgICBcbiAgICAgICAgfSk7XG59KSgpO1xuXG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwLmhvbWUnKS5zZXJ2aWNlKCdIb21lQ29udGV4dFNlcnZpY2UnLCBmdW5jdGlvbigpe1xuICAgIHRoaXMuY29udGV4dCA9IHtcbiAgICAgICAgY2FyZHM6IFtdLFxuICAgICAgICBxdWVyeTogJydcbiAgICB9O1xufSk7IiwiKGZ1bmN0aW9uICgpIHtcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLnN0YWNrcycpLmRpcmVjdGl2ZSgnc3RhY2tEZXNjcmlwdGlvbicsIFsnY29uZmlnJyxcbiAgICAgICAgZnVuY3Rpb24gKGNvbmZpZykge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICByZXN0cmljdDogJ0VBJyxcbiAgICAgICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBjb25maWcuU1JDX0ZPTERFUiArICdzdGFja3MvdGVtcGxhdGVzL3N0YWNrLWRlc2NyaXB0aW9uLmh0bWwnLFxuICAgICAgICAgICAgICAgIHNjb3BlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJyRyb290U2NvcGUnLCAnJGNvb2tpZXMnLCAnJGxvZycsICckZWxlbWVudCcsICdncm93bCcsICdNb2RhbFNlcnZpY2UnLCAnc3RhY2tzRmFjdG9yeScsXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgkc2NvcGUsICRyb290U2NvcGUsICRjb29raWVzLCAkbG9nLCAkZWxlbWVudCwgZ3Jvd2wsIE1vZGFsU2VydmljZSwgc3RhY2tzRmFjdG9yeSkge1xuICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmV2ZW50cyA9IHt9O1xuICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAqIFNob3cgbW9yZSBiZWhhdmlvclxuICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnNob3dNb3JlID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhwYW5kZWQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBleHBhbmRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgaGlkZUFycm93OiB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgKiBGaWx0ZXIgYnkgc3RhY2tcbiAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICRzY29wZS4kb24oJ3N0YWNrLXNlbGVjdGVkJywgZnVuY3Rpb24oZXZ0LCBzdGFjaykge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBwcm92aWRlIGluZm8gdG8gdmlld1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmNvbnRleHQuc3RhY2sgPSBzdGFjaztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmVmcmVzaCBhbmltYXRpb24gKHdoZW4gZWxlbWVudCBhbHJlYWR5IHZpc2libGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAkZWxlbWVudC5maW5kKCcuc3RhY2stZGVzY3JpcHRpb24nKS5hZGRDbGFzcygnZmxpcEluWCcpO1xuICAgICAgICAgICAgICAgICAgICAgICB9KTsgICAgXG5cbiAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAqIENsZWFyIHN0YWNrIGRlc2NyaXB0aW9uIGFuaW1hdGlvbiBjbGFzcyB3aGVuIGZpbmlzaGVkXG4gICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAkZWxlbWVudC5vbignd2Via2l0QW5pbWF0aW9uRW5kIG1vekFuaW1hdGlvbkVuZCBNU0FuaW1hdGlvbkVuZCBvYW5pbWF0aW9uZW5kIGFuaW1hdGlvbmVuZCcsICcuc3RhY2stZGVzY3JpcHRpb24nLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoXCJmbGlwSW5YXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICBpZigkY29va2llcy5nZXQoXCJzdGFja1wiKSkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBwcm92aWRlIGluZm8gdG8gdmlld1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmNvbnRleHQuc3RhY2sgPSAkY29va2llcy5nZXRPYmplY3QoXCJzdGFja1wiKTsgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAqIFVuY2hlY2sgY3VycmVudCBzdGFjayBmaWx0ZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5ldmVudHMucmVtb3ZlU3RhY2tGaWx0ZXIgPSBmdW5jdGlvbihzdGFjaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdzdGFjay11bnNlbGVjdGVkJywgc3RhY2spO1xuICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuJG9uKCdzdGFjay11bnNlbGVjdGVkJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuY29udGV4dC5zdGFjayA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAqIEVkaXQgc3RhY2tcbiAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXZlbnRzLmVkaXRTdGFjayA9IGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTW9kYWxTZXJ2aWNlLnNob3dNb2RhbCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBjb25maWcuU1JDX0ZPTERFUiArIFwic3RhY2tzL3RlbXBsYXRlcy9tb2RhbHMvZWRpdC1zdGFjay5odG1sXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IFwiRWRpdFN0YWNrQ29udHJvbGxlclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnB1dHM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFjazogaXRlbVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkudGhlbihmdW5jdGlvbiAobW9kYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWwuZWxlbWVudC5tb2RhbCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RhbC5jbG9zZS50aGVuKGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHByZXBhcmUgZGF0YSB0byBiZSBzZW5kIHRvIHNlcnZlciBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgc3RhY2sgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBpdGVtLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBtb2RhbC5zY29wZS5mb3JtLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBtb2RhbC5zY29wZS5mb3JtLmNvbnRlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhamF4IGNhbGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFja3NGYWN0b3J5LnVwZGF0ZShzdGFjaykuJHByb21pc2UudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBlbW1pdCBldmVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ3N0YWNrLXVwZGF0ZWQnLCBpdGVtLCBzdGFjayk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkbG9nLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3dsLmVycm9yKFwiVXBzLCBmYWlsZWQgc2F2aW5nLiBTb3JyeS5cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkbG9nLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3dsLmVycm9yKFwiVXBzLCBmYWlsZWQgb3BlbmluZyBmb3JtLlwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gdXBkYXRlIGluIHZpZXdcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS4kb24oJ3N0YWNrLXVwZGF0ZWQnLCBmdW5jdGlvbihldnQsIG9yaWdpbmFsLCBzdGFjaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmNvbnRleHQuc3RhY2sgPSBzdGFjaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIERlbGV0ZSBTdGFja1xuICAgICAgICAgICAgICAgICAgICAgICAgICogXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBAcGFyYW0gU3RhY2sgaXRlbVxuICAgICAgICAgICAgICAgICAgICAgICAgICogQHJldHVybnMgdm9pZFxuICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXZlbnRzLmRlbGV0ZVN0YWNrID0gZnVuY3Rpb24gKGl0ZW0pIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEp1c3QgcHJvdmlkZSBhIHRlbXBsYXRlIHVybCwgYSBjb250cm9sbGVyIGFuZCBjYWxsICdzaG93TW9kYWwnLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1vZGFsU2VydmljZS5zaG93TW9kYWwoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogY29uZmlnLlNSQ19GT0xERVIgKyBcImNvbW1vbi90ZW1wbGF0ZXMvbW9kYWxzL2NvbmZpcm0uaHRtbFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBcIlllc05vQ29udHJvbGxlclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnB1dHM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAndGl0bGUnOiAnRGVsZXRlIHN0YWNrPycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2NvbnRlbnQnOiBcIllvdXIgY2FyZHMgd2lsbCBub3QgYmUgZXJhc2VkLCBidXQgcmVtYWluIG9ycGhhbnMuXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKG1vZGFsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFsLmVsZW1lbnQubW9kYWwoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWwuY2xvc2UudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQpIHsgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYWpheCBjYWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhY2tzRmFjdG9yeS5kZWxldGUoe2lkOiBpdGVtLmlkfSkuJHByb21pc2UudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuY29udGV4dC5zdGFjayA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBlbW1pdCBldmVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ3N0YWNrLWRlbGV0ZWQnLCBpdGVtKTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJGxvZy5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncm93bC5lcnJvcihcIlVwcywgZmFpbGVkIGRlbGV0aW5nIGl0LlwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRsb2cuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3Jvd2wuZXJyb3IoXCJVcHMsIGZhaWxlZCBvcGVuaW5nIGRpYWxvZy5cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1dXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgXSk7XG59KSgpOyIsIihmdW5jdGlvbigpe1xuICAgIFxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuc3RhY2tzJykuZGlyZWN0aXZlKCdzdGFja0xpc3RQYW5lbCcsIFsnY29uZmlnJywgJyRjb29raWVzJywgJ3F1ZXJ5RmFjdG9yeScsIGZ1bmN0aW9uKGNvbmZpZywgJGNvb2tpZXMsIHF1ZXJ5RmFjdG9yeSl7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgICAgICAgICBzY29wZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogY29uZmlnLlNSQ19GT0xERVIgKyAnc3RhY2tzL3RlbXBsYXRlcy9zdGFjay1saXN0LXBhbmVsLmh0bWwnLFxuICAgICAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsICAgICAgIFxuICAgICAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgICAgICAgICAgICAgICBzY29wZS5jb250ZXh0LmltZ19mb2xkZXIgPSBjb25maWcuUFJPRklMRV9JTUdfRk9MREVSO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuY29udGV4dC5jdXJyZW50X3N0YWNrID0gJGNvb2tpZXMuZ2V0T2JqZWN0KFwic3RhY2tcIik7IFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIE9uIHVuc2VsZWN0IHN0YWNrXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBzY29wZS4kb24oJ3N0YWNrLXVuc2VsZWN0ZWQnLCBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJlbW92ZSBmcm9tIFVJXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmZpbmQoJy5saXN0LWdyb3VwLWl0ZW0nKS5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmVtb3ZlIGZyb20gY29va2llXG4gICAgICAgICAgICAgICAgICAgICAgICAkY29va2llcy5yZW1vdmUoJ3N0YWNrJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJlbW92ZSBmcm9tIHNjb3BlXG4gICAgICAgICAgICAgICAgICAgICAgICBzY29wZS5jb250ZXh0LmN1cnJlbnRfc3RhY2sgPSBudWxsO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBxdWVyeSBuZXcgcmVzdWx0c1xuICAgICAgICAgICAgICAgICAgICAgICAgcXVlcnlGYWN0b3J5LmFsbCgpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBPbiBzdGFjayBpbmZvIGVkaXRlZFxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuJG9uKCdzdGFjay11cGRhdGVkJywgZnVuY3Rpb24oZXZ0LCBvcmlnaW5hbCwgc3RhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gdXBkYXRlIGNvb2tpZVxuICAgICAgICAgICAgICAgICAgICAgICAgJGNvb2tpZXMucHV0T2JqZWN0KFwic3RhY2tcIiwgc3RhY2spOyAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZmluZCBzdGFjayBpbiBsaXN0XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaXRlbSA9IHNjb3BlLmNvbnRleHQuc3RhY2tzLmZpbHRlcihmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGUuaWQgPT0gc3RhY2suaWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGluZGV4ID0gc2NvcGUuY29udGV4dC5zdGFja3MuaW5kZXhPZihpdGVtWzBdKTtcbiAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHVwZGF0ZSBpdGVtIGluIGxpc3RcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZXh0ZW5kKHNjb3BlLmNvbnRleHQuc3RhY2tzW2luZGV4XSwgc3RhY2spO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBPbiBzdGFjayBkZWxldGVkXG4gICAgICAgICAgICAgICAgICAgICAqLyAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLiRvbignc3RhY2stZGVsZXRlZCcsIGZ1bmN0aW9uKGV2dCwgc3RhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmVtb3ZlIGNvb2tpZVxuICAgICAgICAgICAgICAgICAgICAgICAgJGNvb2tpZXMucmVtb3ZlKFwic3RhY2tcIik7ICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBmaW5kIHN0YWNrIGluIGxpc3RcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpdGVtID0gc2NvcGUuY29udGV4dC5zdGFja3MuZmlsdGVyKGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZS5pZCA9PSBzdGFjay5pZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaW5kZXggPSBzY29wZS5jb250ZXh0LnN0YWNrcy5pbmRleE9mKGl0ZW1bMF0pO1xuICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyByZW1vdmUgaXRlbSBmcm9tIGxpc3RcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLmNvbnRleHQuc3RhY2tzLnNwbGljZShpbmRleCwgMSk7ICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcXVlcnkgbmV3IHJlc3VsdHNcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXJ5RmFjdG9yeS5hbGwoKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJyRyb290U2NvcGUnLCAnJGxvZycsICckY29va2llcycsICdjb25maWcnLCAnZ3Jvd2wnLCAnc3RhY2tzRmFjdG9yeScsICdxdWVyeUZhY3RvcnknLCAnTW9kYWxTZXJ2aWNlJywgXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKCRzY29wZSwgJHJvb3RTY29wZSwgJGxvZywgJGNvb2tpZXMsIGNvbmZpZywgZ3Jvd2wsIHN0YWNrc0ZhY3RvcnksIHF1ZXJ5RmFjdG9yeSwgTW9kYWxTZXJ2aWNlKSB7XG4gICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5jb250ZXh0ID0ge307XG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXZlbnRzID0ge307XG4gICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICogR2V0IHN0YWNrIGxpc3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmNvbnRleHQuc3RhY2tzID0gc3RhY2tzRmFjdG9yeS5xdWVyeSgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIENyZWF0ZSBuZXcgc3RhY2tcbiAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmV2ZW50cy5hZGROZXcgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBNb2RhbFNlcnZpY2Uuc2hvd01vZGFsKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IGNvbmZpZy5TUkNfRk9MREVSICsgXCJzdGFja3MvdGVtcGxhdGVzL21vZGFscy9uZXctc3RhY2suaHRtbFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBcIk5ld1N0YWNrQ29udHJvbGxlclwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkudGhlbihmdW5jdGlvbihtb2RhbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RhbC5lbGVtZW50Lm1vZGFsKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFsLmNsb3NlLnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0KSB7ICAgIFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcHJlcGFyZSBkYXRhIHRvIHN1Ym1pdCB0byBzZXJ2ZXIgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHN0YWNrID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBtb2RhbC5zY29wZS5mb3JtLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBtb2RhbC5zY29wZS5mb3JtLmRlc2NyaXB0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhY2tzRmFjdG9yeS5zYXZlKHN0YWNrKS4kcHJvbWlzZS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBlbW1pdCBldmVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFjay5pZCA9IHJlc3BvbnNlLmlkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ25ldy1zdGFjaycsIHN0YWNrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFkZCB0byBzdGFja1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuY29udGV4dC5zdGFja3MudW5zaGlmdChzdGFjayk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRsb2cuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3Jvd2wuZXJyb3IoXCJVcHMsIGZhaWxlZCBjcmVhdGluZyBzdGFjay5cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkbG9nLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3dsLmVycm9yKFwiVXBzLCBmYWlsZWQgb3BlbmluZyBmb3JtLlwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBGaWx0ZXIgYnkgc3RhY2tcbiAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmV2ZW50cy5maWx0ZXIgPSBmdW5jdGlvbigkZXZlbnQsIHN0YWNrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGxpbmsgPSAkKCRldmVudC5jdXJyZW50VGFyZ2V0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGluay5jbG9zZXN0KCd1bCcpLmZpbmQoJy5saXN0LWdyb3VwLWl0ZW0nKS5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaW5rLnBhcmVudCgpLmFkZENsYXNzKCdzZWxlY3RlZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBwZXJzaXN0IGZpbHRlclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRjb29raWVzLnB1dE9iamVjdCgnc3RhY2snLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBzdGFjay5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogc3RhY2submFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHN0YWNrLmRlc2NyaXB0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmNvbnRleHQuY3VycmVudF9zdGFjayA9ICRjb29raWVzLmdldE9iamVjdChcInN0YWNrXCIpOyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBxdWVyeSByZXN1bHRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVlcnlGYWN0b3J5LmJ5U3RhY2soe3N0YWNrX2lkOiBzdGFjay5pZH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRlbGwgdGhlIHdvcmxkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdzdGFjay1zZWxlY3RlZCcsIHN0YWNrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICogVW5zZWxlY3Qgc3RhY2tcbiAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmV2ZW50cy51bnNlbGVjdFN0YWNrRmlsdGVyID0gZnVuY3Rpb24gKCRldmVudCwgc3RhY2spIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ3N0YWNrLXVuc2VsZWN0ZWQnLCBzdGFjayk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9ICAgICAgICBcbiAgICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgfTtcbiAgICB9XSk7XG59KSgpOyIsIihmdW5jdGlvbigpe1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuc3RhY2tzJykuZmFjdG9yeSgnc3RhY2tzRmFjdG9yeScsIFsnJHJlc291cmNlJywgJ2NvbmZpZycsIGZ1bmN0aW9uICgkcmVzb3VyY2UsIGNvbmZpZykge1xuICAgICAgICByZXR1cm4gJHJlc291cmNlKGNvbmZpZy5hcGkgKyAnL3N0YWNrcy86aWQnLCB7IGlkOiAnQGlkJywgc3RhY2tfaWQ6ICdAc3RhY2tfaWQnIH0sIHtcbiAgICAgICAgICAgIHVwZGF0ZToge1xuICAgICAgICAgICAgICBtZXRob2Q6ICdQVVQnIFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZpbHRlcjoge1xuICAgICAgICAgICAgICB1cmw6IGNvbmZpZy5hcGkgKyAnL3N0YWNrcy86c3RhY2tfaWQvY2FyZHMnLCBcbiAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7IFxuICAgIH1dKTtcbn0pKCk7XG5cbiIsIihmdW5jdGlvbiAoKSB7XG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC50YWdzJykuZGlyZWN0aXZlKCdjdXJyZW50VGFncycsIFsnY29uZmlnJyxcbiAgICAgICAgZnVuY3Rpb24gKGNvbmZpZykge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICByZXN0cmljdDogJ0VBJyxcbiAgICAgICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBjb25maWcuU1JDX0ZPTERFUiArICd0YWdzL3RlbXBsYXRlcy9jdXJyZW50LXRhZ3MuaHRtbCcsXG4gICAgICAgICAgICAgICAgc2NvcGU6IHRydWUsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogWyckc2NvcGUnLCAnJGNvb2tpZXMnLCAncXVlcnlGYWN0b3J5JywgZnVuY3Rpb24gKCRzY29wZSwgJGNvb2tpZXMsIHF1ZXJ5RmFjdG9yeSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5ldmVudHMgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogQ3VycmVudCB0YWdzIGZpbHRlcnNcbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5ldmVudHMucHJpbnRDdXJyZW50VGFncyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjdXJyZW50X2Nvb2tpZXMgPSAkY29va2llcy5nZXRPYmplY3QoJ3RhZ3NbXScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiAoY3VycmVudF9jb29raWVzKSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuY29udGV4dC50YWdfZmlsdGVycyA9IGN1cnJlbnRfY29va2llcztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIGFkZCBvbmUgbW9yZVxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuJG9uKCd0YWctZmlsdGVyLWFkZGVkJywgZnVuY3Rpb24gKGV2dCwgdGFnKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXJ5RmFjdG9yeS5ieVRhZ3MoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiAoJHNjb3BlLmNvbnRleHQudGFnX2ZpbHRlcnMpICE9PSAndW5kZWZpbmVkJykge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmNvbnRleHQudGFnX2ZpbHRlcnMudW5zaGlmdCh0YWcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuY29udGV4dC50YWdfZmlsdGVycyA9IFt0YWddO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgIC8vIERyYXcgdGFnIGZpbHRlcnMgb24gcGFnZSBsb2FkXG4gICAgICAgICAgICAgICAgICAgJHNjb3BlLmV2ZW50cy5wcmludEN1cnJlbnRUYWdzKCk7IFxuXG4gICAgICAgICAgICAgICAgICAgJHNjb3BlLmV2ZW50cy5yZW1vdmVUYWdGaWx0ZXIgPSBmdW5jdGlvbihldmVudCwgaW5kZXgsIHRhZykge1xuXG4gICAgICAgICAgICAgICAgICAgICAgIC8vIHJlbW92ZSBmcm9tIHZpZXdcbiAgICAgICAgICAgICAgICAgICAgICAgJChldmVudC5jdXJyZW50VGFyZ2V0KS5jbG9zZXN0KCdsaScpLnJlbW92ZUNsYXNzKCdhbmltYXRlZCcpOyAvLyBubyBoaWRlIGFuaW1hdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuY29udGV4dC50YWdfZmlsdGVycy5zcGxpY2UoaW5kZXgsIDEpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgIC8vIHJlbW92ZSB0YWcgZnJvbSBjb29raWVzXG4gICAgICAgICAgICAgICAgICAgICAgIGxldCBjdXJyZW50X2Nvb2tpZXMgPSAkY29va2llcy5nZXRPYmplY3QoJ3RhZ3NbXScpO1xuICAgICAgICAgICAgICAgICAgICAgICBsZXQgY29va2llX2luZGV4ID0gJC5pbkFycmF5KCB0YWcsIGN1cnJlbnRfY29va2llcyApO1xuICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50X2Nvb2tpZXMuc3BsaWNlKGNvb2tpZV9pbmRleCwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICRjb29raWVzLnB1dE9iamVjdCgndGFnc1tdJywgY3VycmVudF9jb29raWVzKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAvLyBxdWVyeVxuICAgICAgICAgICAgICAgICAgICAgICBxdWVyeUZhY3RvcnkuYnlUYWdzKCk7XG4gICAgICAgICAgICAgICAgICAgfSAgICAgXG4gICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICBdKTtcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLnRhZ3MnKS5kaXJlY3RpdmUoJ25ld1RhZycsIFsnY29uZmlnJywgJ3RhZ3NGYWN0b3J5JywgJyRyb290U2NvcGUnLCAnJGFuaW1hdGUnLFxuICAgICAgICBmdW5jdGlvbiAoY29uZmlnLCB0YWdzRmFjdG9yeSwgJHJvb3RTY29wZSwgJGFuaW1hdGUpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICByZXN0cmljdDogJ0VBJyxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogY29uZmlnLlNSQ19GT0xERVIgKyAnL3RhZ3MvdGVtcGxhdGVzL25ldy10YWcuaHRtbCcsXG4gICAgICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgICAgICAgICBjYXJkOiBcIj1kYXRhXCJcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLmV2ZW50cyA9IHt9O1xuICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vIGFyY2hldHlwZVxuICAgICAgICAgICAgICAgICAgICBzY29wZS50YWcgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAnJ1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIEluaXRpYWwgd2lkZ2V0IHN0YXRlXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBzY29wZS5kaXNwbGF5ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogSGlkZSB3aWRnZXRcbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLmV2ZW50cy5zaG93ID0gZnVuY3Rpb24oKSB7IFxuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuZGlzcGxheSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBzY29wZS52aXNpYmlsaXR5ID0gJ3Zpc2libGUnOyAvLyBjc3MgY2xhc3NcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5maW5kKCdpbnB1dCcpLmZvY3VzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCAwLjUpOyAvLyB0aW1lIHdpbGwgdmFyeSBhY2NvcmRpbmcgdG8gY3NzIHJ1bGVcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIEhpZGUgd2lkZ2V0XG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBzY29wZS5ldmVudHMuaGlkZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuZGlzcGxheSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUudmlzaWJpbGl0eSA9ICcnOyAvLyBjc3MgY2xhc3NcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLnRhZy5uYW1lID0gJyc7IC8vIHJlc2V0IGZpZWxkXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBjcmVhdGVzIGEgdGFnIGFuZCBhdHRhY2ggaXQgdG8gY3VycmVudCBjYXJkXG4gICAgICAgICAgICAgICAgICAgICAqIFxuICAgICAgICAgICAgICAgICAgICAgKiBAcmV0dXJucyB2b2lkXG4gICAgICAgICAgICAgICAgICAgICAqIEBicm9hZGNhc3RzIGV2ZW50XG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBzY29wZS5ldmVudHMuYWRkTmV3ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihzY29wZS50YWcubmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCB0YWcgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhcmRfaWQ6IHNjb3BlLmNhcmQuaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHNjb3BlLnRhZy5uYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWdzRmFjdG9yeS5zYXZlKHRhZywgZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFnLmlkID0gcmVzcG9uc2UuaWQ7IC8vIGFwcGVuZCB0YWcgaWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuZXZlbnRzLmZsYXNoQ2xhc3MoZWxlbWVudCwgJ29rJyk7IC8vIHV4IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYWRkIHRhZyBhcyB0aGUgbGFzdCB2aXNpYmxlIG9mIFggdGFnc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZih0eXBlb2Yoc2NvcGUuY2FyZC50YWdzKSAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYWRkIHRhZyB0byB0aGUgbGlzdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuY2FyZC50YWdzLnNwbGljZShzY29wZS5tYXhfbnVtX3RhZ3MtMSwgMCwgdGFnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNyZWF0ZSB0aGUgbGlzdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuY2FyZC50YWdzID0gW3RhZ107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLmV2ZW50cy5mbGFzaENsYXNzKGVsZW1lbnQsICdlcnJvcicpOyAvLyB1eCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY29wZS50YWcubmFtZSA9ICcnOyAvLyByZXNldCBmaWVsZFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIEtleSBldmVudCAoRW50ZXIpXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmJpbmQoXCJrZXlkb3duIGtleXByZXNzXCIsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoZXZlbnQud2hpY2ggPT09IDEzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuZXZlbnRzLmFkZE5ldygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIEFkZHMgYW5kIHJlbW92ZXMgYSBjbGFzc1xuICAgICAgICAgICAgICAgICAgICAgKiBcbiAgICAgICAgICAgICAgICAgICAgICogQHBhcmFtIHN0cmluZyBjbGFzc05hbWVcbiAgICAgICAgICAgICAgICAgICAgICogQHJldHVybnMgdm9pZFxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuZXZlbnRzLmZsYXNoQ2xhc3MgPSBmdW5jdGlvbihlbGVtZW50LCBjbGFzc05hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAkYW5pbWF0ZS5hZGRDbGFzcyhlbGVtZW50LCBjbGFzc05hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkYW5pbWF0ZS5yZW1vdmVDbGFzcyhlbGVtZW50LCBjbGFzc05hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVDbGFzcyhjbGFzc05hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCA2MDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIF0pO1xufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuaG9tZScpLmRpcmVjdGl2ZSgndGFnQ2xvdWQnLCBbJ2NvbmZpZycsIFxuICAgICAgICBmdW5jdGlvbiAoY29uZmlnKSB7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcmVzdHJpY3Q6ICdFQScsXG4gICAgICAgICAgICAgICAgc2NvcGU6IHRydWUsXG4gICAgICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSwgICAgIFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBjb25maWcuU1JDX0ZPTERFUiArICcvdGFncy90ZW1wbGF0ZXMvdGFnLWNsb3VkLmh0bWwnLFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJyRjb29raWVzJywgJyRyb290U2NvcGUnLCAncmVkdWNlQnlGaWx0ZXInLCBmdW5jdGlvbiAoJHNjb3BlLCAkY29va2llcywgJHJvb3RTY29wZSwgcmVkdWNlQnlGaWx0ZXIpIHtcblxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXZlbnRzID0ge307XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBLZWVwIHRyYWNrIG9mIGNhcmQgbGlzdCBjaGFuZ2VzXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuJG9uKCdjYXJkcy1sb2FkZWQnLCBmdW5jdGlvbiAoZXZ0LCBjb2xsZWN0aW9uKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHR5cGVvZihjb2xsZWN0aW9uLmRhdGEpID09PSAndW5kZWZpbmVkJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGV4Y2x1ZGUgY2FyZCB3aXRoIG5vIHRhZ3NcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjYXJkcyA9IGNvbGxlY3Rpb24uZGF0YS5maWx0ZXIoZnVuY3Rpb24gKGNhcmQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2FyZC50YWdzID8gY2FyZC50YWdzLmxlbmd0aCA+IDAgOiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZXh0cmFjdCB0YWdzIGZyb20gY2FyZFxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHRhZ3MgPSBjYXJkcy5tYXAoZnVuY3Rpb24gKGNhcmQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShhbmd1bGFyLnRvSnNvbihjYXJkLnRhZ3MpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBtZXJnZSB0YWdzIGluIGZsYXR0ZW4gYXJyYXlcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBtZXJnZWQgPSBbXS5jb25jYXQuYXBwbHkoW10sIHRhZ3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZWxpbWluYXRlIGR1cGxpY2F0ZXMgYW5kIHNlcnZlIGFycmF5IHRvIHZpZXdcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS50YWdzID0gcmVkdWNlQnlGaWx0ZXIobWVyZ2VkLCAnaWQnKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXZlbnRzLmZpbHRlciA9IGZ1bmN0aW9uKHRhZykge1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY3VycmVudF9jb29raWVzID0gJGNvb2tpZXMuZ2V0T2JqZWN0KCd0YWdzW10nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoIHR5cGVvZihjdXJyZW50X2Nvb2tpZXMpID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGZpcnN0IG9uZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRfY29va2llcyA9IFt0YWddO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhdm9pZCBkdXBsaWNhdGVzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudF9jb29raWVzID0gYW5ndWxhci5mcm9tSnNvbihjdXJyZW50X2Nvb2tpZXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKCBjdXJyZW50X2Nvb2tpZXMubWFwKGZ1bmN0aW9uKGUpIHsgcmV0dXJuIGUuaWQ7IH0pLmluZGV4T2YodGFnLmlkKSA9PT0gLTEgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRfY29va2llcy5wdXNoKHRhZyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBhZGQgdGFnIHRvIGN1cnJlbnQgdGFncyBsaXN0XG4gICAgICAgICAgICAgICAgICAgICAgICAkY29va2llcy5wdXRPYmplY3QoJ3RhZ3NbXScsIGN1cnJlbnRfY29va2llcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNvbWVvbmUgZWxzZSB3aWxsIG1ha2UgdGhlIHF1ZXJ5XG4gICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ3RhZy1maWx0ZXItYWRkZWQnLCB0YWcpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICBdKTtcbn0pKCk7IiwiKGZ1bmN0aW9uKCl7XG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC50YWdzJykuZmFjdG9yeSgndGFnc0ZhY3RvcnknLCBbJyRyZXNvdXJjZScsICdjb25maWcnLCBmdW5jdGlvbiAoJHJlc291cmNlLCBjb25maWcpIHtcbiAgICAgICAgcmV0dXJuICRyZXNvdXJjZShjb25maWcuYXBpICsgJy90YWdzLzppZCcsIHsgaWQ6ICdAaWQnLCBjYXJkX2lkOiAnQGNhcmRfaWQnIH0sIHtcbiAgICAgICAgICAgIHNhdmU6IHtcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJywgXG4gICAgICAgICAgICAgICAgdXJsOiBjb25maWcuYXBpICsgJy9jYXJkcy86Y2FyZF9pZC90YWdzJyAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmaWx0ZXI6IHtcbiAgICAgICAgICAgICAgdXJsOiBjb25maWcuYXBpICsgJy9jYXJkcy90YWdzL2FsbCcsIFxuICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnIFxuICAgICAgICAgICAgfVxuICAgICAgICB9KTsgXG4gICAgfV0pO1xufSkoKTtcblxuIiwiKGZ1bmN0aW9uKCkge1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5jYXJkcycpLmNvbnRyb2xsZXIoJ0VkaXRDYXJkQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJ2RhdGEnLCAnY2xvc2UnLCBFZGl0Q2FyZENvbnRyb2xsZXJdKTtcbiAgICBcbiAgICBmdW5jdGlvbiBFZGl0Q2FyZENvbnRyb2xsZXIoJHNjb3BlLCBkYXRhLCBjbG9zZSkge1xuXG4gICAgICAgICRzY29wZS5mb3JtID0ge307XG4gICAgICAgICRzY29wZS5mb3JtLm5hbWUgPSBkYXRhLmNhcmQubmFtZTtcbiAgICAgICAgJHNjb3BlLmZvcm0uY29udGVudCA9IGRhdGEuY2FyZC5jb250ZW50O1xuXG4gICAgICAgICRzY29wZS5jbG9zZSA9IGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgXG4gICAgICAgICAgICBjbG9zZShyZXN1bHQsIDIwMCk7IC8vIGNsb3NlLCBidXQgZ2l2ZSAyMDBtcyBmb3IgYm9vdHN0cmFwIHRvIGFuaW1hdGVcbiAgICAgICAgfTtcbiAgICB9O1xufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5ob21lJykuY29udHJvbGxlcignWWVzTm9Db250cm9sbGVyJywgWyckc2NvcGUnLCAnZGF0YScsICdjbG9zZScsIGZ1bmN0aW9uICgkc2NvcGUsIGRhdGEsIGNsb3NlKSB7XG4gICAgICAgICAgIFxuICAgICAgICAgICAgJHNjb3BlLnRpdGxlID0gZGF0YS50aXRsZTtcbiAgICAgICAgICAgICRzY29wZS5jb250ZW50ID0gZGF0YS5jb250ZW50O1xuICAgICAgICAgICBcbiAgICAgICAgICAgICRzY29wZS5jbG9zZSA9IGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICBjbG9zZShyZXN1bHQsIDIwMCk7IC8vIGNsb3NlLCBidXQgZ2l2ZSAyMDBtcyBmb3IgYm9vdHN0cmFwIHRvIGFuaW1hdGVcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1dKTtcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5ob21lJykuY29udHJvbGxlcignTWFya2Rvd25Db250cm9sbGVyJywgWyckc2NvcGUnLCAnZGF0YScsICdjbG9zZScsIE1hcmtkb3duQ29udHJvbGxlcl0pO1xuICAgIFxuICAgIGZ1bmN0aW9uIE1hcmtkb3duQ29udHJvbGxlcigkc2NvcGUsIGRhdGEsIGNsb3NlKSB7XG5cbiAgICAgICAgJHNjb3BlLnRpdGxlID0gZGF0YS5jYXJkLm5hbWU7XG4gICAgICAgICRzY29wZS5jb250ZW50ID0gZGF0YS5jYXJkLmNvbnRlbnQ7XG5cbiAgICAgICAgJHNjb3BlLmRpc21pc3NNb2RhbCA9IGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgIGNsb3NlKHJlc3VsdCwgMjAwKTsgLy8gY2xvc2UsIGJ1dCBnaXZlIDIwMG1zIGZvciBib290c3RyYXAgdG8gYW5pbWF0ZVxuICAgICAgICB9O1xuICAgIH07XG59KSgpOyIsIihmdW5jdGlvbigpIHtcblxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuc3RhY2tzJykuY29udHJvbGxlcignRWRpdFN0YWNrQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJyRlbGVtZW50JywgJ2RhdGEnLCAnY2xvc2UnLCBFZGl0U3RhY2tDb250cm9sbGVyXSk7XG4gICAgXG4gICAgZnVuY3Rpb24gRWRpdFN0YWNrQ29udHJvbGxlcigkc2NvcGUsICRlbGVtZW50LCBkYXRhLCBjbG9zZSkge1xuICAgICAgXG4gICAgICAgICRzY29wZS5mb3JtID0ge307XG4gICAgICAgICRzY29wZS5mb3JtLm5hbWUgPSBkYXRhLnN0YWNrLm5hbWU7XG4gICAgICAgICRzY29wZS5mb3JtLmNvbnRlbnQgPSBkYXRhLnN0YWNrLmRlc2NyaXB0aW9uO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBLZXkgZXZlbnQgKEVudGVyKVxuICAgICAgICAgKi9cbiAgICAgICAgJGVsZW1lbnQuZmluZCgnaW5wdXQnKS5iaW5kKFwia2V5ZG93biBrZXlwcmVzc1wiLCBmdW5jdGlvbiAoZXZlbnQpIHtcblxuICAgICAgICAgICAgaWYoZXZlbnQud2hpY2ggPT09IDEzKSB7XG4gICAgICAgICAgICAgICAgJGVsZW1lbnQubW9kYWwoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICAkc2NvcGUuY2xvc2UodHJ1ZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAkc2NvcGUuY2xvc2UgPSBmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgIFxuICAgICAgICAgICAgY2xvc2UocmVzdWx0LCAyMDApOyAvLyBjbG9zZSwgYnV0IGdpdmUgMjAwbXMgZm9yIGJvb3RzdHJhcCB0byBhbmltYXRlXG4gICAgICAgIH07XG4gICAgfTtcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuICAgIFxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuc3RhY2tzJykuY29udHJvbGxlcignTmV3U3RhY2tDb250cm9sbGVyJywgWyckc2NvcGUnLCAnJGVsZW1lbnQnLCAnY2xvc2UnLCBOZXdTdGFja0NvbnRyb2xsZXJdKTtcbiAgICBcbiAgICBmdW5jdGlvbiBOZXdTdGFja0NvbnRyb2xsZXIoJHNjb3BlLCAkZWxlbWVudCwgY2xvc2UpIHtcbiAgICAgICBcbiAgICAgICAgJHNjb3BlLmZvcm0gPSB7XG4gICAgICAgICAgICBuYW1lOiAnJyxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnJ1xuICAgICAgICB9O1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogS2V5IGV2ZW50IChFbnRlcilcbiAgICAgICAgICovXG4gICAgICAgICRlbGVtZW50LmZpbmQoJ2lucHV0JykuYmluZChcImtleWRvd24ga2V5cHJlc3NcIiwgZnVuY3Rpb24gKGV2ZW50KSB7XG5cbiAgICAgICAgICAgIGlmKGV2ZW50LndoaWNoID09PSAxMykge1xuICAgICAgICAgICAgICAgICRlbGVtZW50Lm1vZGFsKCdoaWRlJyk7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmNsb3NlKHRydWUpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICAkc2NvcGUuY2xvc2UgPSBmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgIFxuICAgICAgICAgICAgY2xvc2UocmVzdWx0LCAyMDApOyAvLyBjbG9zZSwgYnV0IGdpdmUgMjAwbXMgZm9yIGJvb3RzdHJhcCB0byBhbmltYXRlXG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgXG4gICAgfTtcbn0pKCk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
