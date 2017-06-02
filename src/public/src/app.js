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

angular.module('app', ['ng', 'ngCookies', 'ngRoute', 'app.config', 'app.home', 'angularModalService', 'pascalprecht.translate', 'angular-growl']);
  
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

        $translateProvider.useLocalStorage();
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
                            
                            // assign card to current tags
                            if( localStorage.getItem('tags[]') && localStorage.getItem('tags[]') !== 'null' ) {
                                data.tags = JSON.parse(localStorage.getItem('tags[]')).map(function(x){ return x.id; });
                            }
                            
                            // assign card to current stack
                            if( localStorage.getItem('stack') && localStorage.getItem('stack') !== 'null' ) {
                                data.stack = JSON.parse(localStorage.getItem('stack')).id;
                            }

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
                controller: ['$scope', '$rootScope', function ($scope, $rootScope) {
                       
                    $scope.events = {};
                       
                    let order = JSON.parse(localStorage.getItem('order'));
                       
                    // initial position
                    $scope.order = order && !angular.isUndefined(order.order) ? order.order : 'updated_at';
                    $scope.direction = order && !angular.isUndefined(order.direction) ? order.direction : 'desc';

                    $scope.events.update = function() {

                        let data = {
                            order: $scope.order,
                            direction: $scope.direction
                        }
                        
                        // persist
                        localStorage.setItem('order', JSON.stringify(data));
                        
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
    
     angular.module('app').factory('queryFactory', ['$log', '$rootScope', 'cardsFactory', 'stacksFactory', 'tagsFactory', queryFactory]);
    
    function queryFactory($log, $rootScope, cardsFactory, stacksFactory, tagsFactory) {
        
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
     
            if(filters.includes('tags') && localStorage.getItem('tags[]') !== null) {
                params['tags[]'] = JSON.parse(localStorage.getItem('tags[]')).map(function(x){ return x.id; });
            }
            if(filters.includes('stack') && localStorage.getItem('stack') !== null) {
                params.stack = JSON.parse(localStorage.getItem('stack')).id;
            }
            if(filters.includes('order') && localStorage.getItem('order') !== null) {
                params.order = JSON.parse(localStorage.getItem('order'));                
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
                controller: ['$scope', '$rootScope', '$log', '$element', 'growl', 'ModalService', 'stacksFactory',
                    function ($scope, $rootScope, $log, $element, growl, ModalService, stacksFactory) {
                       
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

                       if(localStorage.getItem("stack")) {

                           // provide info to view
                           $scope.context.stack = JSON.parse(localStorage.getItem("stack"));                           
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
    
    angular.module('app.stacks').directive('stackListPanel', ['config', 'queryFactory', function(config, queryFactory){
            
            return {
                restrict: 'E',
                scope: true,
                templateUrl: config.SRC_FOLDER + 'stacks/templates/stack-list-panel.html',
                replace: true,       
                link: function(scope, element, attrs) {
                    scope.context.img_folder = config.PROFILE_IMG_FOLDER;
                    
                    scope.context.current_stack = JSON.parse(localStorage.getItem("stack")); 
                    
                    /**
                     * On unselect stack
                     */
                    scope.$on('stack-unselected', function () {

                        // remove from UI
                        element.find('.list-group-item').removeClass('selected');

                        // remove from cookie
                        window.localStorage.removeItem('stack');

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
                        localStorage.setItem("stack", JSON.stringify(stack));  
                          
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
                        window.localStorage.removeItem("stack");  
                          
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
                controller: ['$scope', '$rootScope', '$log', 'config', 'growl', 'stacksFactory', 'queryFactory', 'ModalService', 
                    function($scope, $rootScope, $log, config, growl, stacksFactory, queryFactory, ModalService) {
                     
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
                            localStorage.setItem('stack', JSON.stringify({
                                id: stack.id,
                                name: stack.name,
                                description: stack.description
                            }));
                            
                            $scope.context.current_stack = JSON.parse(localStorage.getItem("stack")); 
                            
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
                controller: ['$scope', 'queryFactory', function ($scope, queryFactory) {
                        
                    $scope.events = {};
                        
                    /**
                     * Current tags filters
                     */
                    $scope.events.printCurrentTags = function () {
                        let current_cookies = JSON.parse(localStorage.getItem('tags[]'));
                        if (typeof (current_cookies) !== 'undefined') {
                            $scope.context.tag_filters = current_cookies;
                        }
                    }

                    // add one more
                    $scope.$on('tag-filter-added', function (evt, tag) {

                        queryFactory.byTags();

                        if ($scope.context.tag_filters && $scope.context.tag_filters.length !== 0) {

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
                       let current_cookies = JSON.parse(localStorage.getItem('tags[]'));
                       let cookie_index = $.inArray( tag, current_cookies );
                       current_cookies.splice(cookie_index, 1);
                       localStorage.setItem('tags[]', JSON.stringify(current_cookies));

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
                controller: ['$scope', '$rootScope', 'reduceByFilter', function ($scope, $rootScope, reduceByFilter) {

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
                        
                        let current_tags = JSON.parse(localStorage.getItem('tags[]'));
                                 
                        if( typeof(current_tags) === 'undefined' || current_tags === null) {
                            // first one
                            current_tags = [tag];
                        } else {
                            // avoid duplicates
                            current_tags = angular.fromJson(current_tags);
                            console.log(current_tags);
                            if( current_tags && current_tags.map(function(e) { return e.id; }).indexOf(tag.id) === -1 ) {
                                current_tags.push(tag);
                            }
                        }
                        
                        // add tag to current tags list
                        localStorage.setItem('tags[]', JSON.stringify(current_tags));
                        
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC1jb25maWcuanMiLCJjYXJkcy9tb2R1bGUuanMiLCJjb21tb24vbW9kdWxlLmpzIiwiaG9tZS9tb2R1bGUuanMiLCJzdGFja3MvbW9kdWxlLmpzIiwidGFncy9tb2R1bGUuanMiLCJjYXJkcy9jYXJkcy1yb3V0ZS5qcyIsImNvbW1vbi9hcHAtcm91dGUuanMiLCJob21lL2hvbWUtcm91dGUuanMiLCJsb2dpbi9sb2dpbi5qcyIsInN0YWNrcy9ob21lLXJvdXRlLmpzIiwiY2FyZHMvZGlyZWN0aXZlcy9jYXJkLmpzIiwiY2FyZHMvZGlyZWN0aXZlcy9uZXctY2FyZC5qcyIsImNhcmRzL2RpcmVjdGl2ZXMvb3JkZXItYnkuanMiLCJjYXJkcy9kaXJlY3RpdmVzL3BhZ2luYXRlLWNhcmRzLmpzIiwiY2FyZHMvc2VydmljZXMvY2FyZHMtZmFjdG9yeS5qcyIsImNvbW1vbi9jb250cm9sbGVycy9oZWFkZXItY29udHJvbGxlcnMuanMiLCJjb21tb24vY29udHJvbGxlcnMvbGF5b3V0LWNvbnRyb2xsZXJzLmpzIiwiY29tbW9uL2RpcmVjdGl2ZXMvYXV0b2ZvY3VzLmpzIiwiY29tbW9uL2RpcmVjdGl2ZXMvZWxhc3RpY0FyZWEuanMiLCJjb21tb24vZGlyZWN0aXZlcy9oYXNodGFnaWZ5LmpzIiwiY29tbW9uL2RpcmVjdGl2ZXMvc2Vzc2lvbkRyb3Bkb3duLmpzIiwiY29tbW9uL2RpcmVjdGl2ZXMvc2hvd01vcmUuanMiLCJjb21tb24vZGlyZWN0aXZlcy9zdWJtaXRPbksxMy5qcyIsImNvbW1vbi9maWx0ZXJzL3JlZHVjZUJ5LmpzIiwiY29tbW9uL3NlcnZpY2VzL3F1ZXJ5LWZhY3RvcnkuanMiLCJob21lL2NvbnRyb2xsZXJzL2hvbWUtY29udHJvbGxlci5qcyIsImhvbWUvY29udHJvbGxlcnMvbGlzdC1jb250cm9sbGVyLmpzIiwiaG9tZS9jb250cm9sbGVycy9zZWFyY2gtY29udHJvbGxlci5qcyIsImhvbWUvZmlsdGVycy9oaWdobGlnaHRUZXh0LmpzIiwiaG9tZS9zZXJ2aWNlcy9ob21lLWNvbnRleHQuanMiLCJzdGFja3MvZGlyZWN0aXZlcy9zdGFjay1kZXNjcmlwdGlvbi5qcyIsInN0YWNrcy9kaXJlY3RpdmVzL3N0YWNrLWxpc3QtcGFuZWwuanMiLCJzdGFja3Mvc2VydmljZXMvc3RhY2tzLWZhY3RvcnkuanMiLCJ0YWdzL2RpcmVjdGl2ZXMvY3VycmVudC10YWdzLmpzIiwidGFncy9kaXJlY3RpdmVzL25ldy10YWcuanMiLCJ0YWdzL2RpcmVjdGl2ZXMvdGFnLWNsb3VkLmpzIiwidGFncy9zZXJ2aWNlL3RhZ3MtZmFjdG9yeS5qcyIsImNhcmRzL2NvbnRyb2xsZXJzL21vZGFscy9lZGl0LWNhcmQtY29udHJvbGxlci5qcyIsImNvbW1vbi9jb250cm9sbGVycy9tb2RhbHMveWVzLW5vLWNvbnRyb2xsZXIuanMiLCJob21lL2NvbnRyb2xsZXJzL21vZGFscy9tYXJrZG93bi1jb250cm9sbGVyLmpzIiwic3RhY2tzL2NvbnRyb2xsZXJzL21vZGFscy9lZGl0LXN0YWNrLWNvbnRyb2xsZXIuanMiLCJzdGFja3MvY29udHJvbGxlcnMvbW9kYWxzL25ldy1zdGFjay1jb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUFHQSxRQUFBLE9BQUEsY0FBQTtLQUNBLFNBQUEsVUFBQTtRQUNBLE9BQUE7UUFDQSxTQUFBO1FBQ0EsY0FBQTtRQUNBLGNBQUE7UUFDQSxzQkFBQTs7O0FDVEEsUUFBQSxPQUFBLGFBQUE7OztBQ0FBOztBQUVBLFFBQUEsT0FBQSxPQUFBLENBQUEsTUFBQSxhQUFBLFdBQUEsY0FBQSxZQUFBLHVCQUFBLDBCQUFBOzs7OztBQUtBLFFBQUEsT0FBQSxPQUFBLE9BQUEsQ0FBQSxpQkFBQSxnQkFBQSxzQkFBQSxpQkFBQTtJQUNBLFVBQUEsZUFBQSxjQUFBLG9CQUFBLGVBQUEsUUFBQTs7Ozs7UUFLQSxjQUFBLFNBQUEsUUFBQSxTQUFBO1lBQ0EsZ0JBQUE7WUFDQSxVQUFBO1lBQ0EscUJBQUE7WUFDQSxv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QSxTQUFBLFFBQUEsUUFBQTs0QkFDQSxPQUFBOzs7Ozs7OztBQ2RBLENBQUEsWUFBQTtJQUNBLFFBQUEsT0FBQTtTQUNBLE9BQUEsWUFBQSxXQUFBO1lBQ0EsT0FBQSxVQUFBLFlBQUEsT0FBQTs7Z0JBRUEsT0FBQSxXQUFBLE9BQUEsU0FBQSxRQUFBLFFBQUE7d0JBQ0EsR0FBQSxDQUFBLFlBQUEsUUFBQSxPQUFBLFFBQUE7NEJBQ0EsT0FBQSxPQUFBLE9BQUE7d0JBQ0EsT0FBQTt1QkFDQTs7Z0JBRUEsU0FBQSxZQUFBLFVBQUEsV0FBQSxZQUFBO29CQUNBLE9BQUEsU0FBQSxLQUFBLFNBQUEsSUFBQTtzQkFDQSxPQUFBLEdBQUEsZUFBQTs7Ozs7Ozs7QUNiQSxDQUFBLFlBQUE7O0tBRUEsUUFBQSxPQUFBLE9BQUEsUUFBQSxnQkFBQSxDQUFBLFFBQUEsY0FBQSxnQkFBQSxpQkFBQSxlQUFBOztJQUVBLFNBQUEsYUFBQSxNQUFBLFlBQUEsY0FBQSxlQUFBLGFBQUE7O1FBRUEsSUFBQSxVQUFBOzs7Ozs7Ozs7UUFTQSxRQUFBLE1BQUEsVUFBQSxRQUFBOztZQUVBLFNBQUEsV0FBQSxRQUFBLENBQUEsU0FBQSxTQUFBOzs7WUFHQSxPQUFBO2lCQUNBLE1BQUEsUUFBQSxVQUFBLFVBQUE7O29CQUVBLFVBQUE7bUJBQ0EsU0FBQSxLQUFBO29CQUNBLEtBQUEsTUFBQTs7Ozs7Ozs7Ozs7UUFXQSxRQUFBLFVBQUEsVUFBQSxRQUFBOztZQUVBLFNBQUEsV0FBQSxRQUFBLENBQUEsU0FBQSxTQUFBOztZQUVBLE9BQUEsY0FBQSxPQUFBLFFBQUEsU0FBQSxVQUFBOztnQkFFQSxVQUFBO2VBQ0EsU0FBQSxLQUFBO2dCQUNBLEtBQUEsTUFBQTs7Ozs7Ozs7Ozs7UUFXQSxRQUFBLFNBQUEsVUFBQSxRQUFBOztZQUVBLFNBQUEsV0FBQSxRQUFBLENBQUEsU0FBQSxTQUFBOztZQUVBLE9BQUEsWUFBQSxPQUFBLFFBQUEsU0FBQSxVQUFBOztnQkFFQSxVQUFBO2VBQ0EsU0FBQSxLQUFBO2dCQUNBLEtBQUEsTUFBQTs7OztRQUlBLFNBQUEsV0FBQSxRQUFBLFNBQUE7O1lBRUEsR0FBQSxPQUFBLFlBQUEsYUFBQTtnQkFDQSxTQUFBOzs7WUFHQSxHQUFBLFFBQUEsU0FBQSxXQUFBLGFBQUEsUUFBQSxjQUFBLE1BQUE7Z0JBQ0EsT0FBQSxZQUFBLEtBQUEsTUFBQSxhQUFBLFFBQUEsV0FBQSxJQUFBLFNBQUEsRUFBQSxFQUFBLE9BQUEsRUFBQTs7WUFFQSxHQUFBLFFBQUEsU0FBQSxZQUFBLGFBQUEsUUFBQSxhQUFBLE1BQUE7Z0JBQ0EsT0FBQSxRQUFBLEtBQUEsTUFBQSxhQUFBLFFBQUEsVUFBQTs7WUFFQSxHQUFBLFFBQUEsU0FBQSxZQUFBLGFBQUEsUUFBQSxhQUFBLE1BQUE7Z0JBQ0EsT0FBQSxRQUFBLEtBQUEsTUFBQSxhQUFBLFFBQUE7OztZQUdBLE9BQUE7Ozs7OztRQU1BLFNBQUEsVUFBQSxNQUFBO1lBQ0EsV0FBQSxXQUFBLGdCQUFBOzs7UUFHQSxPQUFBOzs7QUM3RkEsQ0FBQSxZQUFBOztJQUVBLFFBQUEsT0FBQSxZQUFBLFdBQUEsa0JBQUEsQ0FBQSxVQUFBLFNBQUE7O0lBRUEsU0FBQSxlQUFBLFFBQUEsT0FBQTs7Ozs7OztBQ0pBLENBQUEsVUFBQTs7SUFFQSxRQUFBLE9BQUEsWUFBQSxXQUFBLGtCQUFBLENBQUEsVUFBQSxRQUFBLFNBQUEsZ0JBQUEsc0JBQUE7O0lBRUEsU0FBQSxlQUFBLFFBQUEsTUFBQSxPQUFBLGNBQUEsbUJBQUE7O1FBRUEsT0FBQSxTQUFBOzs7OztRQUtBLE9BQUEsVUFBQSxtQkFBQTs7Ozs7UUFLQSxPQUFBLE9BQUEsT0FBQSxTQUFBLFFBQUE7OztZQUdBO2lCQUNBLElBQUEsUUFBQSxTQUFBLEtBQUEsVUFBQSxVQUFBOzttQkFFQSxTQUFBLEtBQUE7b0JBQ0EsS0FBQSxNQUFBO29CQUNBLE1BQUEsTUFBQTs7OztRQUlBLE9BQUEsT0FBQTs7UUFFQSxPQUFBLElBQUEsZ0JBQUEsU0FBQSxLQUFBLFVBQUE7WUFDQSxPQUFBLFFBQUEsUUFBQSxTQUFBO1lBQ0EsT0FBQSxRQUFBLFFBQUE7Ozs7OztRQU1BLE9BQUEsSUFBQSxpQkFBQSxTQUFBLEtBQUEsUUFBQTtZQUNBLE9BQUEsT0FBQSxLQUFBLENBQUEsT0FBQTs7Ozs7O1FBTUEsT0FBQSxJQUFBLHNCQUFBLFNBQUEsS0FBQSxRQUFBO1lBQ0EsT0FBQSxPQUFBLEtBQUE7Ozs7OztRQU1BLE9BQUEsSUFBQSxZQUFBLFNBQUEsS0FBQSxNQUFBO1lBQ0EsT0FBQSxRQUFBLE1BQUEsUUFBQTs7Ozs7O1FBTUEsT0FBQSxJQUFBLFlBQUEsU0FBQSxLQUFBLE1BQUE7O1lBRUEsR0FBQSxLQUFBLFFBQUE7O2dCQUVBLEtBQUEsU0FBQTtnQkFDQSxLQUFBLFFBQUEsS0FBQSxRQUFBLEtBQUEsTUFBQSxRQUFBLFVBQUEsTUFBQTttQkFDQTs7Z0JBRUEsS0FBQSxTQUFBO2dCQUNBLEtBQUEsUUFBQSxLQUFBLFFBQUEsS0FBQSxRQUFBLFlBQUE7Z0JBQ0EsSUFBQSxRQUFBLE9BQUEsUUFBQSxNQUFBLFFBQUE7Z0JBQ0EsT0FBQSxRQUFBLE1BQUEsT0FBQSxPQUFBO2dCQUNBLE9BQUEsUUFBQSxNQUFBLFFBQUE7Ozs7Ozs7UUFPQSxPQUFBLElBQUEsZUFBQSxTQUFBLEtBQUEsTUFBQTtZQUNBLElBQUEsUUFBQSxPQUFBLFFBQUEsTUFBQSxRQUFBO1lBQ0EsT0FBQSxRQUFBLE1BQUEsT0FBQSxPQUFBOzs7Ozs7UUFNQSxPQUFBLElBQUEsZUFBQSxTQUFBLEtBQUEsVUFBQSxTQUFBO1lBQ0EsSUFBQSxRQUFBLE9BQUEsUUFBQSxNQUFBLFFBQUE7WUFDQSxRQUFBLE9BQUEsT0FBQSxRQUFBLE1BQUEsUUFBQTs7OztBQ3hGQSxDQUFBLFVBQUE7O0lBRUEsUUFBQSxPQUFBLFlBQUEsV0FBQSxvQkFBQSxDQUFBLFVBQUEsc0JBQUE7O0lBRUEsU0FBQSxpQkFBQSxRQUFBLG1CQUFBOzs7OztRQUtBLE9BQUEsVUFBQSxtQkFBQTs7O0FDVEEsQ0FBQSxZQUFBO0lBQ0EsUUFBQSxPQUFBO1NBQ0EsT0FBQSwwQkFBQSxTQUFBLE1BQUE7WUFDQSxPQUFBLFVB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QUVBLE9BQUEsUUFBQSxLQUFBLEtBQUE7UUFDQSxPQUFBLFVBQUEsS0FBQSxLQUFBOztRQUVBLE9BQUEsZUFBQSxVQUFBLFFBQUE7WUFDQSxNQUFBLFFBQUE7O0tBRUE7O0FDWkEsQ0FBQSxXQUFBOztJQUVBLFFBQUEsT0FBQSxjQUFBLFdBQUEsdUJBQUEsQ0FBQSxVQUFBLFlBQUEsUUFBQSxTQUFBOztJQUVBLFNBQUEsb0JBQUEsUUFBQSxVQUFBLE1BQUEsT0FBQTs7UUFFQSxPQUFBLE9BQUE7UUFDQSxPQUFBLEtBQUEsT0FBQSxLQUFBLE1BQUE7UUFDQSxPQUFBLEtBQUEsVUFBQSxLQUFBLE1BQUE7Ozs7O1FBS0EsU0FBQSxLQUFBLFNBQUEsS0FBQSxvQkFBQSxVQUFBLE9BQUE7O1lBRUEsR0FBQSxNQUFBLFVBQUEsSUFBQTtnQkFDQSxTQUFBLE1BQUE7Z0JBQ0EsT0FBQSxNQUFBO2dCQUNBLE9BQUE7Ozs7UUFJQSxPQUFBLFFBQUEsVUFBQSxRQUFBOztZQUVBLE1BQUEsUUFBQTs7S0FFQTs7QUMxQkEsQ0FBQSxXQUFBOztJQUVBLFFBQUEsT0FBQSxjQUFBLFdBQUEsc0JBQUEsQ0FBQSxVQUFBLFlBQUEsU0FBQTs7SUFFQSxTQUFBLG1CQUFBLFFBQUEsVUFBQSxPQUFBOztRQUVBLE9BQUEsT0FBQTtZQUNBLE1BQUE7WUFDQSxhQUFBOzs7Ozs7UUFNQSxTQUFBLEtBQUEsU0FBQSxLQUFBLG9CQUFBLFVBQUEsT0FBQTs7WUFFQSxHQUFBLE1BQUEsVUFBQSxJQUFBO2dCQUNBLFNBQUEsTUFBQTtnQkFDQSxPQUFBLE1BQUE7Z0JBQ0EsT0FBQTs7OztRQUlBLE9BQUEsUUFBQSxVQUFBLFFBQUE7O1lBRUEsTUFBQSxRQUFBOzs7O0tBSUE7S0FDQSIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFRoaXMgY29uZmlnIGlzIGludGVuZGVkIHRvIGJlIGluamVjdGVkIGluIHlvdXIgc3JjXG4gKi9cbmFuZ3VsYXIubW9kdWxlKFwiYXBwLmNvbmZpZ1wiLCBbXSlcbiAgICAuY29uc3RhbnQoXCJjb25maWdcIiwge1xuICAgICAgICBcImFwaVwiOiBcImh0dHA6Ly9sb2NhbGhvc3Q6ODAwMS9hcGkvdjFcIiwgXG4gICAgICAgIFwiZGVidWdcIjogdHJ1ZSxcbiAgICAgICAgXCJTUkNfRk9MREVSXCI6ICcvc3JjL2FwcF9tb2R1bGVzLycsXG4gICAgICAgIFwiSU1HX0ZPTERFUlwiOiAnL2ltZy8nLFxuICAgICAgICBcIlBST0ZJTEVfSU1HX0ZPTERFUlwiOiAnL2ltZy9wcm9maWxlLydcbiAgICB9KTtcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAuY2FyZHMnLCBbXSk7XG5cbiIsIid1c2Ugc3RyaWN0JztcblxuYW5ndWxhci5tb2R1bGUoJ2FwcCcsIFsnbmcnLCAnbmdDb29raWVzJywgJ25nUm91dGUnLCAnYXBwLmNvbmZpZycsICdhcHAuaG9tZScsICdhbmd1bGFyTW9kYWxTZXJ2aWNlJywgJ3Bhc2NhbHByZWNodC50cmFuc2xhdGUnLCAnYW5ndWxhci1ncm93bCddKTtcbiAgXG4vKipcbiAqIFJlc3Qgb2YgdGhlIGdsb2JhbCBjb25maWcgY2FuIGJlIGZvdW5kIGluIGFwcC1jb25maWcgbW9kdWxlXG4gKi8gIFxuYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmNvbmZpZyhbJyRodHRwUHJvdmlkZXInLCAnJGxvZ1Byb3ZpZGVyJywgJyR0cmFuc2xhdGVQcm92aWRlcicsICdncm93bFByb3ZpZGVyJywgJ2NvbmZpZycsIFxuICAgIGZ1bmN0aW9uICgkaHR0cFByb3ZpZGVyLCAkbG9nUHJvdmlkZXIsICR0cmFuc2xhdGVQcm92aWRlciwgZ3Jvd2xQcm92aWRlciwgY29uZmlnKSB7XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQWpheCBjYWxsc1xuICAgICAgICAgKi8gXG4gICAgICAgICRodHRwUHJvdmlkZXIuZGVmYXVsdHMuaGVhZGVycy5jb21tb24gPSB7IFxuICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vanNvbjtvZGF0YT12ZXJib3NlJyxcbiAgICAgICAgICAgICdYLUxvZ2luLUFqYXgtY2FsbCc6ICd0cnVlJyxcbiAgICAgICAgICAgICdYLVJlcXVlc3RlZC1XaXRoJzogXCJYTUxIdHRwUmVxdWVzdFwiLFxuICAgICAgICAgICAgJ1gtQ1NSRi1UT0tFTic6IExhcmF2ZWwuY3NyZlRva2VuXG4gICAgICAgICAgfTtcbiAgICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEdyb3dsIG1lc3NhZ2VzXG4gICAgICAgICAqL1xuICAgICAgICBncm93bFByb3ZpZGVyLm9ubHlVbmlxdWVNZXNzYWdlcyhmYWxzZSk7XG4gICAgICAgIGdyb3dsUHJvdmlkZXIuZ2xvYmFsUmV2ZXJzZWRPcmRlcih0cnVlKTtcbiAgICAgICAgZ3Jvd2xQcm92aWRlci5nbG9iYWxUaW1lVG9MaXZlKHtzdWNjZXNzOiAxMDAwLCBlcnJvcjogMTEyMDAwLCB3YXJuaW5nOiAzMDAwLCBpbmZvOiA0MDAwfSk7XG4gICAgICAgIGdyb3dsUHJvdmlkZXIuZ2xvYmFsRGlzYWJsZUNvdW50RG93bih0cnVlKTtcbiAgICAgICAgZ3Jvd2xQcm92aWRlci5nbG9iYWxEaXNhYmxlSWNvbnModHJ1ZSk7XG4gICAgICAgIGdyb3dsUHJvdmlkZXIuZ2xvYmFsUG9zaXRpb24oJ2JvdHRvbS1sZWZ0Jyk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIERlYnVnZ2luZ1xuICAgICAgICAgKi8gXG4gICAgICAgICRsb2dQcm92aWRlci5kZWJ1Z0VuYWJsZWQoY29uZmlnLmRlYnVnKTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUcmFuc2xhdGlvbnNcbiAgICAgICAgICovICAgICBcbiAgICAgICAgJHRyYW5zbGF0ZVByb3ZpZGVyLnVzZVN0YXRpY0ZpbGVzTG9hZGVyKHtcbiAgICAgICAgICAgIHByZWZpeDogJy9pMThuL2xvY2FsZS0nLFxuICAgICAgICAgICAgc3VmZml4OiAnLmpzb24nXG4gICAgICAgIH0pO1xuXG4gICAgICAgICR0cmFuc2xhdGVQcm92aWRlci51c2VMb2NhbFN0b3JhZ2UoKTtcbiAgICAgICAgJHRyYW5zbGF0ZVByb3ZpZGVyLnByZWZlcnJlZExhbmd1YWdlKCdlbl9VUycpO1xuICAgICAgICAkdHJhbnNsYXRlUHJvdmlkZXIuZmFsbGJhY2tMYW5ndWFnZSgnZW5fVVMnKTtcbiAgICAgICAgJHRyYW5zbGF0ZVByb3ZpZGVyLnVzZVNhbml0aXplVmFsdWVTdHJhdGVneSgnZXNjYXBlJyk7XG59XSk7XG4gXG5hbmd1bGFyLm1vZHVsZSgnYXBwJykucnVuKFtmdW5jdGlvbiAoKSB7XG4gXG59XSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwLmhvbWUnLCBbJ25nUm91dGUnLCAnYXBwLmNvbmZpZycsICduZ0FuaW1hdGUnLCAnYXBwLmNhcmRzJywgJ2FwcC5zdGFja3MnLCAnYXBwLnRhZ3MnLCAnaGMubWFya2VkJywgJ25nU2FuaXRpemUnXSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwLnN0YWNrcycsIFsnbmdSZXNvdXJjZSddKTtcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAudGFncycsIFsnbmdSZXNvdXJjZSddKTtcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAuY2FyZHMnKS5jb25maWcoZnVuY3Rpb24oJHJvdXRlUHJvdmlkZXIpIHtcbiAgIFxufSk7IiwiKGZ1bmN0aW9uICgpIHtcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwJykuY29uZmlnKFsnJHJvdXRlUHJvdmlkZXInLCAnY29uZmlnJywgZnVuY3Rpb24oJHJvdXRlUHJvdmlkZXIsIGNvbmZpZykge1xuXG4gICAgICAkcm91dGVQcm92aWRlclxuICAgICAgICAud2hlbignLycsIHtcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBjb25maWcuU1JDX0ZPTERFUiArICdob21lL3RlbXBsYXRlcy9ob21lLXRlbXBsYXRlLmh0bWwnLFxuICAgICAgICAgICAgY29udHJvbGxlcjogJ0hvbWVDb250cm9sbGVyJyxcbiAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ2hvbWUnXG4gICAgICAgIH0pXG5cbiAgICAgICAgLm90aGVyd2lzZSh7cmVkaXJlY3RUbzogJy8nfSk7IFxuICAgIH1dKTtcbn0pKCk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcC5ob21lJykuY29uZmlnKGZ1bmN0aW9uKCRyb3V0ZVByb3ZpZGVyKSB7XG5cbn0pOyIsIlxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xuXG4gICAgLy8gc3dpdGNoIGZvcm1zXG4gICAgJCgnLm1lc3NhZ2UgYScpLmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgXG4gICAgICAgICQoJ2Zvcm0nKS5hbmltYXRlKHtoZWlnaHQ6IFwidG9nZ2xlXCIsIG9wYWNpdHk6IFwidG9nZ2xlXCJ9LCBcInNsb3dcIik7XG4gICAgICAgIFxuICAgICAgICBpZih3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgPT0gJy9sb2dpbicpIHtcbiAgICAgICAgICAgIGhpc3RvcnkucHVzaFN0YXRlKHt9LCBcIlJlZ2lzdGVyXCIsIFwiL3JlZ2lzdGVyXCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaGlzdG9yeS5wdXNoU3RhdGUoe30sIFwiTG9naW5cIiwgXCIvbG9naW5cIik7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgICQoJ2Zvcm0gLmhlbHAtYmxvY2snKS5oaWRlKCk7XG4gICAgfSk7XG5cbn0pOyIsImFuZ3VsYXIubW9kdWxlKCdhcHAuc3RhY2tzJykuY29uZmlnKGZ1bmN0aW9uKCRyb3V0ZVByb3ZpZGVyKSB7XG5cbn0pOyIsIihmdW5jdGlvbiAoKSB7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmNhcmRzJykuZGlyZWN0aXZlKCdjYXJkJyxcbiAgICAgICAgWydjb25maWcnLCBmdW5jdGlvbiAoY29uZmlnKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBjb25maWcuU1JDX0ZPTERFUiArICdjYXJkcy90ZW1wbGF0ZXMvY2FyZC5odG1sJyxcbiAgICAgICAgICAgICAgICByZXN0cmljdDogJ0EnLFxuICAgICAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgICAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgICAgICAgICAgY2FyZDogXCI9ZGF0YVwiXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBbJyRzY29wZScsICckcm9vdFNjb3BlJywgJyRsb2cnLCAnY29uZmlnJywgJ2dyb3dsJywgJ2NhcmRzRmFjdG9yeScsICdNb2RhbFNlcnZpY2UnLFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoJHNjb3BlLCAkcm9vdFNjb3BlLCAkbG9nLCBjb25maWcsIGdyb3dsLCBjYXJkc0ZhY3RvcnksIE1vZGFsU2VydmljZSkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXZlbnRzID0ge307XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICogRGlzcGxheSBvbmx5IFggdGFnc1xuICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUubWF4X251bV90YWdzID0gMztcblxuICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBQaW4gQ2FyZCAobWFrZSBpdCAnc3RpY2t5JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIFxuICAgICAgICAgICAgICAgICAgICAgICAgICogQHBhcmFtIENhcmQgaXRlbVxuICAgICAgICAgICAgICAgICAgICAgICAgICogQHJldHVybnMgdm9pZFxuICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXZlbnRzLnBpbkNhcmQgPSBmdW5jdGlvbiAoaXRlbSkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNhcmQgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBpdGVtLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGlja3k6ICFpdGVtLnN0aWNreVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFqYXggY2FsbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhcmRzRmFjdG9yeS51cGRhdGUoY2FyZCkuJHByb21pc2UudGhlbihmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZW1taXQgZXZlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdwaW4tY2FyZCcsIGl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJGxvZy5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncm93bC5lcnJvcihcIlVwcywgZmFpbGVkLiBTb3JyeS5cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIERlbGV0ZSBDYXJkXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIEBwYXJhbSBDYXJkIGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgICAgICAqIEByZXR1cm5zIHZvaWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmV2ZW50cy5kZWxldGUgPSBmdW5jdGlvbiAoaXRlbSkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSnVzdCBwcm92aWRlIGEgdGVtcGxhdGUgdXJsLCBhIGNvbnRyb2xsZXIgYW5kIGNhbGwgJ3Nob3dNb2RhbCcuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTW9kYWxTZXJ2aWNlLnNob3dNb2RhbCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBjb25maWcuU1JDX0ZPTERFUiArIFwiY29tbW9uL3RlbXBsYXRlcy9tb2RhbHMvY29uZmlybS5odG1sXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IFwiWWVzTm9Db250cm9sbGVyXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0czoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICd0aXRsZSc6ICdEZWxldGUgY2FyZD8nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdjb250ZW50JzogXCJZb3UnbGwgbm90IGJlIGFibGUgdG8gcmVjb3ZlciBpdFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIChtb2RhbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RhbC5lbGVtZW50Lm1vZGFsKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFsLmNsb3NlLnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0KSB7ICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFqYXggY2FsbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhcmRzRmFjdG9yeS5kZWxldGUoe2lkOiBpdGVtLmlkfSkuJHByb21pc2UudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBlbW1pdCBldmVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ2RlbGV0ZS1jYXJkJywgaXRlbSk7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRsb2cuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3Jvd2wuZXJyb3IoXCJVcHMsIGZhaWxlZCBkZWxldGluZyBpdC5cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkbG9nLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3dsLmVycm9yKFwiVXBzLCBmYWlsZWQgb3BlbmluZyBkaWFsb2cuXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBFZGl0IENhcmRcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIFxuICAgICAgICAgICAgICAgICAgICAgICAgICogQHBhcmFtIENhcmQgaXRlbVxuICAgICAgICAgICAgICAgICAgICAgICAgICogQHJldHVybnMgdm9pZFxuICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXZlbnRzLmVkaXQgPSBmdW5jdGlvbiAoaXRlbSkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTW9kYWxTZXJ2aWNlLnNob3dNb2RhbCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBjb25maWcuU1JDX0ZPTERFUiArIFwiY2FyZHMvdGVtcGxhdGVzL21vZGFscy9lZGl0LWNhcmQuaHRtbFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBcIkVkaXRDYXJkQ29udHJvbGxlclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnB1dHM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXJkOiBpdGVtXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIChtb2RhbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RhbC5lbGVtZW50Lm1vZGFsKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFsLmNsb3NlLnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcHJlcGFyZSBkYXRhIHRvIGJlIHNlbmQgdG8gc2VydmVyIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjYXJkID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogaXRlbS5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogbW9kYWwuc2NvcGUuZm9ybS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBtb2RhbC5zY29wZS5mb3JtLmNvbnRlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhamF4IGNhbGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXJkc0ZhY3RvcnkudXBkYXRlKGNhcmQpLiRwcm9taXNlLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZW1taXQgZXZlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCd1cGRhdGUtY2FyZCcsIGl0ZW0sIGNhcmQpOyAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkbG9nLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3dsLmVycm9yKFwiVXBzLCBmYWlsZWQgc2F2aW5nIGNoYW5nZXMuXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJGxvZy5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncm93bC5lcnJvcihcIlVwcywgZmFpbGVkIG9wZW5pbmcgZm9ybS5cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIFZpZXcgY29udGVudCBpbiBtb2RhbGJveCB3aXRoIE1hcmtkb3duIChyaWNoIHRleHQgbW9kZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIFxuICAgICAgICAgICAgICAgICAgICAgICAgICogQHBhcmFtIENhcmQgaXRlbVxuICAgICAgICAgICAgICAgICAgICAgICAgICogQHJldHVybnMgdm9pZFxuICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXZlbnRzLnZpZXdBc01hcmtkb3duTW9kYWwgPSBmdW5jdGlvbiAoaXRlbSkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSnVzdCBwcm92aWRlIGEgdGVtcGxhdGUgdXJsLCBhIGNvbnRyb2xsZXIgYW5kIGNhbGwgJ3Nob3dNb2RhbCcuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTW9kYWxTZXJ2aWNlLnNob3dNb2RhbCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBjb25maWcuU1JDX0ZPTERFUiArIFwiaG9tZS90ZW1wbGF0ZXMvbW9kYWxzL21hcmtkb3duLmh0bWxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogXCJNYXJrZG93bkNvbnRyb2xsZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXRzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2NhcmQnOiBpdGVtXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIChtb2RhbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RhbC5lbGVtZW50Lm1vZGFsKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRsb2cuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3Jvd2wuZXJyb3IoXCJVcHMsIGZhaWxlZCBvcGVuaW5nIHZpZXcuXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XVxuICAgICAgICB9O1xuICAgIH1dKTtcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcblxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuY2FyZHMnKS5kaXJlY3RpdmUoJ25ld0NhcmRGb3JtJyxcbiAgICAgICAgWydjb25maWcnLCBmdW5jdGlvbiAoY29uZmlnKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgICAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgICAgICAgICAgY2FyZDogXCI9XCJcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IGNvbmZpZy5TUkNfRk9MREVSICsgJ2NhcmRzL3RlbXBsYXRlcy9uZXctZm9ybS5odG1sJyxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBbJyRzY29wZScsICckcm9vdFNjb3BlJywgJyRsb2cnLCAnZ3Jvd2wnLCAnY2FyZHNGYWN0b3J5JywgZnVuY3Rpb24gKCRzY29wZSwgJHJvb3RTY29wZSwgJGxvZywgZ3Jvd2wsIGNhcmRzRmFjdG9yeSkge1xuXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5ldmVudHMgPSB7fTtcblxuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogU3VibWl0IGZvcm1cbiAgICAgICAgICAgICAgICAgICAgICogQHJldHVybnMgdm9pZFxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmV2ZW50cy5jcmVhdGVDYXJkID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoJHNjb3BlLmNvbnRlbnQpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBkYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAkc2NvcGUubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogJHNjb3BlLmNvbnRlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFzc2lnbiBjYXJkIHRvIGN1cnJlbnQgdGFnc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKCBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndGFnc1tdJykgJiYgbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3RhZ3NbXScpICE9PSAnbnVsbCcgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEudGFncyA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3RhZ3NbXScpKS5tYXAoZnVuY3Rpb24oeCl7IHJldHVybiB4LmlkOyB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYXNzaWduIGNhcmQgdG8gY3VycmVudCBzdGFja1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKCBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnc3RhY2snKSAmJiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnc3RhY2snKSAhPT0gJ251bGwnICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnN0YWNrID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnc3RhY2snKSkuaWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FyZHNGYWN0b3J5LnNhdmUoZGF0YSkuJHByb21pc2UudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jbGFzcyA9ICdoaWdobGlnaHRlZCc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuaWQgPSByZXNwb25zZS5pZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCduZXctY2FyZCcsIGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkbG9nLmVycm9yKHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3Jvd2wuZXJyb3IoXCJVcHMsIGZhaWxlZCBzYXZpbmcuIFNvcnJ5LlwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmNvbnRlbnQgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdfVxuICAgICAgICB9XSk7XG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5jYXJkcycpLmRpcmVjdGl2ZSgnb3JkZXJCeScsIFsnY29uZmlnJyxcbiAgICAgICAgZnVuY3Rpb24gKGNvbmZpZykge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHJlc3RyaWN0OiAnRUEnLFxuICAgICAgICAgICAgICAgIHNjb3BlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBjb25maWcuU1JDX0ZPTERFUiArICcvY2FyZHMvdGVtcGxhdGVzL29yZGVyLWJ5Lmh0bWwnLFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJyRyb290U2NvcGUnLCBmdW5jdGlvbiAoJHNjb3BlLCAkcm9vdFNjb3BlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXZlbnRzID0ge307XG4gICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBsZXQgb3JkZXIgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdvcmRlcicpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vIGluaXRpYWwgcG9zaXRpb25cbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLm9yZGVyID0gb3JkZXIgJiYgIWFuZ3VsYXIuaXNVbmRlZmluZWQob3JkZXIub3JkZXIpID8gb3JkZXIub3JkZXIgOiAndXBkYXRlZF9hdCc7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5kaXJlY3Rpb24gPSBvcmRlciAmJiAhYW5ndWxhci5pc1VuZGVmaW5lZChvcmRlci5kaXJlY3Rpb24pID8gb3JkZXIuZGlyZWN0aW9uIDogJ2Rlc2MnO1xuXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5ldmVudHMudXBkYXRlID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBkYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yZGVyOiAkc2NvcGUub3JkZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0aW9uOiAkc2NvcGUuZGlyZWN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHBlcnNpc3RcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdvcmRlcicsIEpTT04uc3RyaW5naWZ5KGRhdGEpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdvcmRlci1jaGFuZ2VkJywgZGF0YSk7IC8vIGVtbWl0XG4gICAgICAgICAgICAgICAgICAgIH0gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIF0pO1xufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAnKS5kaXJlY3RpdmUoJ3BhZ2luYXRlQ2FyZHMnLCBbJ2NvbmZpZycsXG4gICAgICAgIGZ1bmN0aW9uIChjb25maWcpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICByZXN0cmljdDogJ0VBJyxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogY29uZmlnLlNSQ19GT0xERVIgKyAnL2NhcmRzL3RlbXBsYXRlcy9wYWdpbmF0ZS1jYXJkcy5odG1sJyxcbiAgICAgICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6ICc9J1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogWyckc2NvcGUnLCAnJHJvb3RTY29wZScsIGZ1bmN0aW9uICgkc2NvcGUsICRyb290U2NvcGUpIHtcbiAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuY29udGV4dCA9IHt9O1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXZlbnRzID0ge307XG4gICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIERyYXcgd2lkZ2V0IHdoZW4gZGF0YSBpcyBhdmFpbGFibGVcbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS4kb24oJ2NhcmRzLWxvYWRlZCcsIGZ1bmN0aW9uKGV2dCwgZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmNvbnRleHQucGFnZXMgPSBkYXRhOyBcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5jb250ZXh0LmRpc3BsYXkgPSBkYXRhLmRhdGEubGVuZ3RoICYmIChkYXRhLnByZXZfcGFnZV91cmwgIT09IG51bGwgfHwgZGF0YS5uZXh0X3BhZ2VfdXJsICE9PSBudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogQnJvYWRjYXN0IGNoYW5nZXNcbiAgICAgICAgICAgICAgICAgICAgICogQHJldHVybnMgdm9pZFxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmV2ZW50cy5uYXZpZ2F0ZSA9IGZ1bmN0aW9uICgkZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgJGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAkZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHRhcmdldCA9ICRldmVudC5jdXJyZW50VGFyZ2V0O1xuICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBpZih0eXBlb2YodGFyZ2V0LmF0dHJpYnV0ZXNbJ2Rpc2FibGVkJ10pID09PSAndW5kZWZpbmVkJyB8fCAhdGFyZ2V0LmF0dHJpYnV0ZXNbJ2Rpc2FibGVkJ10udmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ2NhcmRzLXBhZ2UtY2hhbmdlZCcsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFnZTogdGFyZ2V0LmF0dHJpYnV0ZXNbJ2RhdGEtcGFnZSddLnZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7IC8vIGVtbWl0XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIF0pO1xufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5jYXJkcycpLmZhY3RvcnkoJ2NhcmRzRmFjdG9yeScsIFsnJHJlc291cmNlJywgJ2NvbmZpZycsIGZ1bmN0aW9uKCRyZXNvdXJjZSwgY29uZmlnKSB7XG5cbiAgICAgICAgcmV0dXJuICRyZXNvdXJjZShjb25maWcuYXBpICsgJy9jYXJkcy86aWQnLCBcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpZDogJ0BpZCcsXG4gICAgICAgICAgICAgICAgcGFnZTogJ0BwYWdlJ1xuICAgICAgICAgICAgfSwgXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcXVlcnk6IHtcbiAgICAgICAgICAgICAgICAgICAgdXJsOiBjb25maWcuYXBpICsgJy9jYXJkcy90YWdzL2FsbCcsXG4gICAgICAgICAgICAgICAgICAgIGlzQXJyYXk6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm1SZXNwb25zZTogZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYW5ndWxhci5mcm9tSnNvbihyZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHVwZGF0ZToge1xuICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnUFVUJyBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTsgXG4gICAgfV0pO1xufSkoKTtcblxuIiwiKGZ1bmN0aW9uICgpIHtcblxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAnKS5jb250cm9sbGVyKCdIZWFkZXJDb250cm9sbGVyJywgWyckc2NvcGUnLCBIZWFkZXJDb250cm9sbGVyXSk7XG5cbiAgICBmdW5jdGlvbiBIZWFkZXJDb250cm9sbGVyKCRzY29wZSkge1xuICAgICAgICBcbiAgICB9XG59KSgpO1xuXG5cbiIsIihmdW5jdGlvbiAoKSB7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwJykuY29udHJvbGxlcignTGF5b3V0Q29udHJvbGxlcicsIFsnJHNjb3BlJywgJyRzY2UnLCBMYXlvdXRDb250cm9sbGVyXSk7XG5cbiAgICBmdW5jdGlvbiBMYXlvdXRDb250cm9sbGVyKCRzY29wZSwgJHNjZSkge1xuXG4gICAgICAgICRzY29wZS50YWdVc2VyQ2xpY2sgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICB2YXIgdGFnVGV4dCA9IGUudGFyZ2V0LmlubmVyVGV4dDtcbiAgICAgICAgICAgIGFsZXJ0KCd0YWdVc2VyQ2xpY2ssIHRhZ1RleHQ6ICcgKyB0YWdUZXh0KTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgICRzY29wZS50YWdUZXJtQ2xpY2sgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICB2YXIgdGFnVGV4dCA9IGUudGFyZ2V0LmlubmVyVGV4dDtcbiAgICAgICAgICAgIGFsZXJ0KCd0YWdUZXJtQ2xpY2ssIHRhZ1RleHQ6ICcgKyB0YWdUZXh0KTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8vIFlvdSBjb3VsZCBkZWZpbmUgJ3RhZ1VzZXJDbGljaycgYW5kICd0YWdUZXJtQ2xpY2snXG4gICAgICAgIC8vIG9uIHRoZSAnJHJvb3RTY29wZScuIFRoaXMgd2F5IHlvdSBjYW4gaGFuZGxlIHdoYXRldmVyXG4gICAgICAgIC8vIGxvZ2ljIHlvdSB3YW50IGZvciBoYXNodGFncyBpbiBvbmUgcGxhY2UgcmF0aGVyIHRoYW5cbiAgICAgICAgLy8gaGF2aW5nIHRvIGRlZmluZSBpdCBpbiBlYWNoIGNvbnRyb2xsZXIuXG4gICAgICAgIFxuICAgICAgICAkc2NvcGUudHJ1c3RIdG1sID0gZnVuY3Rpb24oaHRtbCkge1xuICAgICAgICAgICAgLy8gU2FuaXRpemUgbWFudWFsbHkgaWYgbmVjZXNzYXJ5LiBJdCdzIGxpa2VseSB0aGlzXG4gICAgICAgICAgICAvLyBodG1sIGhhcyBhbHJlYWR5IGJlZW4gc2FuaXRpemVkIHNlcnZlciBzaWRlXG4gICAgICAgICAgICAvLyBiZWZvcmUgaXQgd2VudCBpbnRvIHlvdXIgZGF0YWJhc2UuXG4gICAgICAgICAgICAvLyBEb24ndCBob2xkIG1lIGxpYWJsZSBmb3IgWFNTLi4uIG5ldmVyIGFzc3VtZSA6filcbiAgICAgICAgICAgIHJldHVybiAkc2NlLnRydXN0QXNIdG1sKGh0bWwpO1xuICAgICAgICB9O1xuICAgIH1cbn0pKCk7XG5cblxuIiwiKGZ1bmN0aW9uICgpIHtcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwJykuZGlyZWN0aXZlKCdhdXRvZm9jdXMnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByZXN0cmljdDogJ0EnLFxuICAgICAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudFswXS5mb2N1cygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0pO1xufSkoKTtcblxuICAgICAiLCIoZnVuY3Rpb24gKCkge1xuICAgIC8vIEJlY2F1c2Ugb2YgdGhlIGFubWUgYW5kIEUgdHlwZSwgd29ya3MgYXV0b21hdGljYWxseSBmb3IgZXZlcnkgdGV4dGFyZWFcbiAgICAvLyByZWY6IGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL3Rob21zZWRkb24vNDcwMzk2OFxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAnKS5kaXJlY3RpdmUoJ2VsYXN0aWNBcmVhJywgZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmVzdHJpY3Q6ICdBJyxcbiAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cmlidXRlcykge1xuICAgICAgICAgICAgICAgIHZhciB0aHJlc2hvbGQgPSAzNSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbkhlaWdodCA9IGVsZW1lbnRbMF0ub2Zmc2V0SGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZ0xlZnQgPSBlbGVtZW50LmNzcygncGFkZGluZ0xlZnQnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmdSaWdodCA9IGVsZW1lbnQuY3NzKCdwYWRkaW5nUmlnaHQnKTtcblxuICAgICAgICAgICAgICAgIHZhciAkc2hhZG93ID0gYW5ndWxhci5lbGVtZW50KCc8ZGl2PjwvZGl2PicpLmNzcyh7XG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgICAgICAgICAgICAgICB0b3A6IC0xMDAwMCxcbiAgICAgICAgICAgICAgICAgICAgbGVmdDogLTEwMDAwLFxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogZWxlbWVudFswXS5vZmZzZXRXaWR0aCAtIHBhcnNlSW50KHBhZGRpbmdMZWZ0IHx8IDApIC0gcGFyc2VJbnQocGFkZGluZ1JpZ2h0IHx8IDApLFxuICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogZWxlbWVudC5jc3MoJ2ZvbnRTaXplJyksXG4gICAgICAgICAgICAgICAgICAgIGZvbnRGYW1pbHk6IGVsZW1lbnQuY3NzKCdmb250RmFtaWx5JyksXG4gICAgICAgICAgICAgICAgICAgIGxpbmVIZWlnaHQ6IGVsZW1lbnQuY3NzKCdsaW5lSGVpZ2h0JyksXG4gICAgICAgICAgICAgICAgICAgIHJlc2l6ZTogJ25vbmUnXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuYm9keSkuYXBwZW5kKCRzaGFkb3cpO1xuXG4gICAgICAgICAgICAgICAgdmFyIHVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRpbWVzID0gZnVuY3Rpb24gKHN0cmluZywgbnVtYmVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgciA9ICcnOyBpIDwgbnVtYmVyOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByICs9IHN0cmluZztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHZhbCA9IGVsZW1lbnQudmFsKCkucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8mL2csICcmYW1wOycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcbiQvLCAnPGJyLz4mbmJzcDsnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXG4vZywgJzxici8+JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxzezIsfS9nLCBmdW5jdGlvbiAoc3BhY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRpbWVzKCcmbmJzcDsnLCBzcGFjZS5sZW5ndGggLSAxKSArICcgJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAkc2hhZG93Lmh0bWwodmFsKTtcblxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmNzcygnaGVpZ2h0JywgTWF0aC5tYXgoJHNoYWRvd1swXS5vZmZzZXRIZWlnaHQgKyB0aHJlc2hvbGQsIG1pbkhlaWdodCkpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICRzaGFkb3cucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBlbGVtZW50LmJpbmQoJ2tleXVwIGtleWRvd24ga2V5cHJlc3MgY2hhbmdlJywgdXBkYXRlKTtcbiAgICAgICAgICAgICAgICB1cGRhdGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xufSkoKTsiLCIoZnVuY3Rpb24gKCkgeyBcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwJykuZGlyZWN0aXZlKCdoYXNodGFnaWZ5JywgWyckdGltZW91dCcsICckY29tcGlsZScsXG4gICAgICAgIGZ1bmN0aW9uKCR0aW1lb3V0LCAkY29tcGlsZSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICByZXN0cmljdDogJ0EnLFxuICAgICAgICAgICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICAgICAgICAgIHVDbGljazogJyZ1c2VyQ2xpY2snLFxuICAgICAgICAgICAgICAgICAgICB0Q2xpY2s6ICcmdGVybUNsaWNrJ1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGh0bWwgPSBlbGVtZW50Lmh0bWwoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGh0bWwgPT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXR0cnMudXNlckNsaWNrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaHRtbCA9IGh0bWwucmVwbGFjZSgvKHxcXHMpKkAoXFx3KykvZywgJyQxPGEgbmctY2xpY2s9XCJ1Q2xpY2soeyRldmVudDogJGV2ZW50fSlcIiBjbGFzcz1cImhhc2h0YWdcIj5AJDI8L2E+Jyk7IFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXR0cnMudGVybUNsaWNrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaHRtbCA9IGh0bWwucmVwbGFjZSgvKF58XFxzKSojKFxcdyspL2csICckMTxhIG5nLWNsaWNrPVwidENsaWNrKHskZXZlbnQ6ICRldmVudH0pXCIgY2xhc3M9XCJoYXNodGFnXCI+IyQyPC9hPicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50Lmh0bWwoaHRtbCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICRjb21waWxlKGVsZW1lbnQuY29udGVudHMoKSkoc2NvcGUpO1xuICAgICAgICAgICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgXSk7XG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmRpcmVjdGl2ZSgnc2Vzc2lvbkRyb3Bkb3duJywgWydjb25maWcnLFxuICAgICAgICBmdW5jdGlvbiAoY29uZmlnKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcmVzdHJpY3Q6ICdFQScsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IGNvbmZpZy5TUkNfRk9MREVSICsgJy9jb21tb24vdGVtcGxhdGVzL3Nlc3Npb24tZHJvcGRvd24uaHRtbCcsICAgXG4gICAgICAgICAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogXCI9XCJcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50cywgYXR0cnMpIHtcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuaW1nX2ZvbGRlciA9IGNvbmZpZy5QUk9GSUxFX0lNR19GT0xERVI7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBbJyRzY29wZScsIGZ1bmN0aW9uICgkc2NvcGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUudXNlciA9ICRzY29wZS5kYXRhO1xuICAgICAgICAgICAgICAgIH1dXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgXSk7ICAgICAgIFxufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xuXG4gICAgLyoqXG4gICAgICogWW91IG1heSBwYXNzIGFueSBvZiB0aGVzZSB2YWx1ZTpcbiAgICAgKiBjb250cm9sOiB7XG4gICAgICogICBleHBhbmRlZDogYm9vbGVhbixcbiAgICAgKiAgIGV4cGFuZGFibGU6IGJvb2xlYW4sXG4gICAgICogICB0b2dnbGU6IGZuICAgICAgICAgLy8gYWN0dWFsbHksIHRoaXMgaXMgaGVyZSB0byBiZSBjYWxsZWQgZnJvbSB0aGUgb3V0c2lkZSwgbm90IG92ZXJyaWRlbi5cbiAgICAgKiAgIGhpZGVBcnJvdzogYm9vbGVhbiAvLyBoaWRlIG9yaWdpbmFsIGFycm93cz9cbiAgICAgKiB9LFxuICAgICAqIHNob3dNb3JlSGVpZ2h0OiAuLi5weFxuICAgICAqL1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAnKS5kaXJlY3RpdmUoJ3Nob3dNb3JlJyxcbiAgICAgICAgWydjb25maWcnLCBmdW5jdGlvbiAoY29uZmlnKSB7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IGNvbmZpZy5TUkNfRk9MREVSICsgJ2NvbW1vbi90ZW1wbGF0ZXMvc2hvd01vcmUuaHRtbCcsXG4gICAgICAgICAgICAgICAgcmVzdHJpY3Q6ICdBJyxcbiAgICAgICAgICAgICAgICB0cmFuc2NsdWRlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICAgICAgICAgICdjb250cm9sJzogJz0nLFxuICAgICAgICAgICAgICAgICAgICAnc2hvd01vcmVIZWlnaHQnOiAnQCdcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvLyBhY2Nlc3NpYmxlIGZyb20gdGhlIG91dHNpZGVcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUucHVibGljID0gc2NvcGUuY29udHJvbCB8fCB7fTsgXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvLyBpZiBwb3NzaWJsZSwgc2V0IHZhbHVlIGZyb20gdGhlIG91dHNpZGUuIFxuICAgICAgICAgICAgICAgICAgICBzY29wZS5wdWJsaWMuZXhwYW5kZWQgPSBzY29wZS5wdWJsaWMuZXhwYW5kZWQgfHwgZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvLyBVc2VmdWwgd2hlbiB5b3UgY2Fubm90IG1lYXN1cmUgdGhlIGhlaWdodCBvZiBlbGVtZW50IGF0IGZpcnN0LiBEZWNpZGUgdGhpcyBvdXRzaWRlLlxuICAgICAgICAgICAgICAgICAgICBzY29wZS5wdWJsaWMuZXhwYW5kYWJsZSA9IHNjb3BlLnB1YmxpYy5leHBhbmRhYmxlIHx8IGlzRXhwYW5kYWJsZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy8gVXNlZnVsIHdoZW4geW91IGNhbm5vdCBtZWFzdXJlIHRoZSBoZWlnaHQgb2YgZWxlbWVudCBhdCBmaXJzdC4gRGVjaWRlIHRoaXMgb3V0c2lkZS5cbiAgICAgICAgICAgICAgICAgICAgc2NvcGUucHVibGljLmhpZGVBcnJvdyA9IHNjb3BlLnB1YmxpYy5oaWRlQXJyb3cgfHwgZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBQdWJsaWMgbWV0aG9kc1xuICAgICAgICAgICAgICAgICAgICAgKi8gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBzY29wZS5wdWJsaWMudG9nZ2xlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUucHVibGljLmV4cGFuZGVkID0gIXNjb3BlLnB1YmxpYy5leHBhbmRlZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc0V4cGFuZGFibGUoKSAmJiBzY29wZS5wdWJsaWMuZXhwYW5kZWQgPT09IGZhbHNlKSB7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLnB1YmxpYy5leHBhbmRhYmxlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBQcml2YXRlIG1ldGhvZHNcbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGlzRXhwYW5kYWJsZSgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBlbGVtZW50LmhlaWdodCgpID49IHNjb3BlLnNob3dNb3JlSGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvLyBkaXJlY3RpdmUgc3R5bGUgXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLnNob3dMZXNzU3R5bGUgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAnbWF4LWhlaWdodCc6IHNjb3BlLnNob3dNb3JlSGVpZ2h0ICsgJ3B4JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdvdmVyZmxvdyc6ICdoaWRkZW4nXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfV0pO1xufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAnKS5kaXJlY3RpdmUoJ3N1Ym1pdE9uSzEzJywgWydjb25maWcnLFxuICAgICAgICBmdW5jdGlvbiAoY29uZmlnKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHJlc3RyaWN0OiAnQScsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogWyckc2NvcGUnLCAnJGVsZW1lbnQnLCBmdW5jdGlvbiAoJHNjb3BlLCAkZWxlbWVudCkge1xuXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBLZXkgZXZlbnQgKEVudGVyKVxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgJGVsZW1lbnQuYmluZChcImtleWRvd24ga2V5cHJlc3NcIiwgZnVuY3Rpb24gKGV2ZW50KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChldmVudC5jdXJyZW50VGFyZ2V0d2hpY2ggPT09IDEzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJGVsZW1lbnQuY2xvc2VzdCgnZm9ybScpLnN1Ym1pdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICBdKTtcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwJylcbiAgICAgICAgLmZpbHRlcigncmVkdWNlQnknLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoY29sbGVjdGlvbiwgZmllbGQpIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICByZXR1cm4gY29sbGVjdGlvbi5yZWR1Y2UoZnVuY3Rpb24ob3V0cHV0LCBjdXJyZW50KXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKCFmaWVsZEV4aXN0cyhvdXRwdXQsIGZpZWxkLCBjdXJyZW50W2ZpZWxkXSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG91dHB1dC5jb25jYXQoY3VycmVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gb3V0cHV0O1xuICAgICAgICAgICAgICAgICAgICB9LCBbXSk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGZpZWxkRXhpc3RzKGhheXN0YWNrLCBmaWVsZE5hbWUsIGZpZWxkVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGhheXN0YWNrLnNvbWUoZnVuY3Rpb24oZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZWxbZmllbGROYW1lXSA9PT0gZmllbGRWYWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgfSk7IFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07ICAgICAgICAgICAgXG4gICAgICAgIH0pO1xufSkoKTtcblxuIiwiKGZ1bmN0aW9uICgpIHtcbiAgICBcbiAgICAgYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmZhY3RvcnkoJ3F1ZXJ5RmFjdG9yeScsIFsnJGxvZycsICckcm9vdFNjb3BlJywgJ2NhcmRzRmFjdG9yeScsICdzdGFja3NGYWN0b3J5JywgJ3RhZ3NGYWN0b3J5JywgcXVlcnlGYWN0b3J5XSk7XG4gICAgXG4gICAgZnVuY3Rpb24gcXVlcnlGYWN0b3J5KCRsb2csICRyb290U2NvcGUsIGNhcmRzRmFjdG9yeSwgc3RhY2tzRmFjdG9yeSwgdGFnc0ZhY3RvcnkpIHtcbiAgICAgICAgXG4gICAgICAgIHZhciBmYWN0b3J5ID0ge307XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogZ2V0IGFsbCBjYXJkcyBmcm9tIHNlcnZlciBmb3IgYSBnaXZlbiB1c2VyXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAcGFyYW0ganNvbiBwYXJhbXNcbiAgICAgICAgICogQHJldHVybnMgY2FyZHNGYWN0b3J5XG4gICAgICAgICAqIEBicm9hZGNhc3QgY2FyZHMgbGlzdFxuICAgICAgICAgKi9cbiAgICAgICAgZmFjdG9yeS5hbGwgPSBmdW5jdGlvbiAocGFyYW1zKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHBhcmFtcyA9IGdldEZpbHRlcnMocGFyYW1zLCBbJ29yZGVyJywgJ3N0YWNrJywgJ3RhZ3MnXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIHF1ZXJ5XG4gICAgICAgICAgICByZXR1cm4gY2FyZHNGYWN0b3J5XG4gICAgICAgICAgICAgICAgLnF1ZXJ5KHBhcmFtcywgZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBicm9hZGNhc3QocmVzcG9uc2UpOyAvLyB0ZWxsIHRoZSB3b3JsZFxuICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgICAgICAkbG9nLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgfSk7ICBcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBnZXQgY2FyZHMgdXNpbmcgc3RhY2sgZmlsdGVyc1xuICAgICAgICAgKiBcbiAgICAgICAgICogQHBhcmFtIGpzb24gcGFyYW1zXG4gICAgICAgICAqIEByZXR1cm5zIHN0YWNrc0ZhY3RvcnlcbiAgICAgICAgICogQGJyb2FkY2FzdCBjYXJkcyBsaXN0XG4gICAgICAgICAqL1xuICAgICAgICBmYWN0b3J5LmJ5U3RhY2sgPSBmdW5jdGlvbiAocGFyYW1zKSB7XG4gICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHBhcmFtcyA9IGdldEZpbHRlcnMocGFyYW1zLCBbJ29yZGVyJywgJ3N0YWNrJywgJ3RhZ3MnXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gc3RhY2tzRmFjdG9yeS5maWx0ZXIocGFyYW1zLCBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGJyb2FkY2FzdChyZXNwb25zZSk7IC8vIHRlbGwgdGhlIHdvcmxkXG4gICAgICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICAkbG9nLmVycm9yKGVycik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIGdldCBjYXJkcyB1c2luZyBjdXJyZW50IGZpbHRlcnNcbiAgICAgICAgICogXG4gICAgICAgICAqIEBwYXJhbSBqc29uIHBhcmFtc1xuICAgICAgICAgKiBAcmV0dXJucyBzdGFja3NGYWN0b3J5XG4gICAgICAgICAqIEBicm9hZGNhc3QgY2FyZHMgbGlzdFxuICAgICAgICAgKi9cbiAgICAgICAgZmFjdG9yeS5ieVRhZ3MgPSBmdW5jdGlvbiAocGFyYW1zKSB7XG4gICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHBhcmFtcyA9IGdldEZpbHRlcnMocGFyYW1zLCBbJ29yZGVyJywgJ3N0YWNrJywgJ3RhZ3MnXSk7XG4gICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiB0YWdzRmFjdG9yeS5maWx0ZXIocGFyYW1zLCBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGJyb2FkY2FzdChyZXNwb25zZSk7IC8vIHRlbGwgdGhlIHdvcmxkXG4gICAgICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICAkbG9nLmVycm9yKGVycik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICAgICAgICBcbiAgICAgICAgZnVuY3Rpb24gZ2V0RmlsdGVycyhwYXJhbXMsIGZpbHRlcnMpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYodHlwZW9mKHBhcmFtcykgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgcGFyYW1zID0ge307XG4gICAgICAgICAgICB9XG4gICAgIFxuICAgICAgICAgICAgaWYoZmlsdGVycy5pbmNsdWRlcygndGFncycpICYmIGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0YWdzW10nKSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHBhcmFtc1sndGFnc1tdJ10gPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0YWdzW10nKSkubWFwKGZ1bmN0aW9uKHgpeyByZXR1cm4geC5pZDsgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZihmaWx0ZXJzLmluY2x1ZGVzKCdzdGFjaycpICYmIGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdzdGFjaycpICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcGFyYW1zLnN0YWNrID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnc3RhY2snKSkuaWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZihmaWx0ZXJzLmluY2x1ZGVzKCdvcmRlcicpICYmIGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdvcmRlcicpICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcGFyYW1zLm9yZGVyID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnb3JkZXInKSk7ICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIHBhcmFtcztcbiAgICAgICAgfVxuICAgICAgICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRlbGwgZXZlcnlib2R5IHdlIGhhdmUgYSByZW5vdmF0ZWQgbGlzdFxuICAgICAgICAgKi9cbiAgICAgICAgZnVuY3Rpb24gYnJvYWRjYXN0KGRhdGEpIHtcbiAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnY2FyZHMtbG9hZGVkJywgZGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBmYWN0b3J5O1xuICAgIH0gICAgXG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmhvbWUnKS5jb250cm9sbGVyKCdIb21lQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJ2dyb3dsJywgSG9tZUNvbnRyb2xsZXJdKTtcblxuICAgIGZ1bmN0aW9uIEhvbWVDb250cm9sbGVyKCRzY29wZSwgZ3Jvd2wpIHtcbiAgICAgICAgXG4gICAgfVxufSkoKTtcblxuXG4iLCIoZnVuY3Rpb24oKXtcbiAgICBcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmhvbWUnKS5jb250cm9sbGVyKCdMaXN0Q29udHJvbGxlcicsIFsnJHNjb3BlJywgJyRsb2cnLCAnZ3Jvd2wnLCAncXVlcnlGYWN0b3J5JywgJ0hvbWVDb250ZXh0U2VydmljZScsIExpc3RDb250cm9sbGVyXSk7XG4gICAgXG4gICAgZnVuY3Rpb24gTGlzdENvbnRyb2xsZXIoJHNjb3BlLCAkbG9nLCBncm93bCwgcXVlcnlGYWN0b3J5LCBIb21lQ29udGV4dFNlcnZpY2Upe1xuICAgICAgICBcbiAgICAgICAgJHNjb3BlLmV2ZW50cyA9IHt9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdheSB0byBrZWVwIHNpYmxpbmdzIGNvbm5lY3RlZCBhbmQgc2hhcmluZyBzY29wZVxuICAgICAgICAgKi9cbiAgICAgICAgJHNjb3BlLmNvbnRleHQgPSBIb21lQ29udGV4dFNlcnZpY2UuY29udGV4dDtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHZXQgY2FyZHMgbGlzdFxuICAgICAgICAgKi9cbiAgICAgICAgJHNjb3BlLmV2ZW50cy5sb2FkID0gZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIGdldCBkYXRhIGZyb20gc2VydmVyXG4gICAgICAgICAgICBxdWVyeUZhY3RvcnlcbiAgICAgICAgICAgICAgICAuYWxsKHBhcmFtcykuJHByb21pc2UudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICRsb2cuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgZ3Jvd2wuZXJyb3IoXCJVcHMsIGZhaWxlZCBsb2FkaW5nIGNhcmRzLlwiKTtcbiAgICAgICAgICAgICAgICB9KTsgIFxuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgJHNjb3BlLmV2ZW50cy5sb2FkKCk7IC8vIHJ1biBhdCBwYWdlIGxvYWRcbiAgICAgICAgXG4gICAgICAgICRzY29wZS4kb24oJ2NhcmRzLWxvYWRlZCcsIGZ1bmN0aW9uKGV2dCwgcmVzcG9uc2UpIHtcbiAgICAgICAgICAgICRzY29wZS5jb250ZXh0LmNhcmRzID0gcmVzcG9uc2UuZGF0YTsgLy8gY2FyZHMgbGlzdFxuICAgICAgICAgICAgJHNjb3BlLmNvbnRleHQucGFnZXMgPSByZXNwb25zZTsgLy8gcGFnZXMgZGF0YSAgIFxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBIYW5kbGUgbGlzdCBvcmRlclxuICAgICAgICAgKi9cbiAgICAgICAgJHNjb3BlLiRvbignb3JkZXItY2hhbmdlZCcsIGZ1bmN0aW9uKGV2dCwgcGFyYW1zKSB7ICAgXG4gICAgICAgICAgICAkc2NvcGUuZXZlbnRzLmxvYWQoe29yZGVyOiBwYXJhbXN9KTsgLy8gcmVsb2FkIGNhcmRzXG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEhhbmRsZSBwYWdpbmF0aW9uXG4gICAgICAgICAqL1xuICAgICAgICAkc2NvcGUuJG9uKCdjYXJkcy1wYWdlLWNoYW5nZWQnLCBmdW5jdGlvbihldnQsIHBhcmFtcykge1xuICAgICAgICAgICAgJHNjb3BlLmV2ZW50cy5sb2FkKHBhcmFtcyk7IC8vIHJlbG9hZCBjYXJkc1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDcmVhdGUgY2FyZFxuICAgICAgICAgKi9cbiAgICAgICAgJHNjb3BlLiRvbignbmV3LWNhcmQnLCBmdW5jdGlvbihldnQsIGl0ZW0pIHtcbiAgICAgICAgICAgICRzY29wZS5jb250ZXh0LmNhcmRzLnVuc2hpZnQoaXRlbSk7XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFBpbiBjYXJkXG4gICAgICAgICAqL1xuICAgICAgICAkc2NvcGUuJG9uKCdwaW4tY2FyZCcsIGZ1bmN0aW9uKGV2dCwgaXRlbSkge1xuICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKGl0ZW0uc3RpY2t5KSB7XG4gICAgICAgICAgICAgICAgLy8gbm90IHN0aWNreSBhbnltb3JlXG4gICAgICAgICAgICAgICAgaXRlbS5zdGlja3kgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpdGVtLmNsYXNzID0gaXRlbS5jbGFzcyA/IGl0ZW0uY2xhc3MucmVwbGFjZShcInN0aWNreVwiLCBcIlwiKSA6IFwiXCI7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIHN0aWNreS4gUHV0IGl0IGZpcnN0XG4gICAgICAgICAgICAgICAgaXRlbS5zdGlja3kgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGl0ZW0uY2xhc3MgPSBpdGVtLmNsYXNzID8gaXRlbS5jbGFzcyArIFwiIHN0aWNreVwiIDogXCJzdGlja3lcIjsgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgbGV0IGluZGV4ID0gJHNjb3BlLmNvbnRleHQuY2FyZHMuaW5kZXhPZihpdGVtKTtcbiAgICAgICAgICAgICAgICAkc2NvcGUuY29udGV4dC5jYXJkcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgICAgICRzY29wZS5jb250ZXh0LmNhcmRzLnVuc2hpZnQoaXRlbSk7XG4gICAgICAgICAgICB9IFxuICAgICAgICB9KTtcbiAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIERlbGV0ZSBjYXJkXG4gICAgICAgICAqL1xuICAgICAgICAkc2NvcGUuJG9uKCdkZWxldGUtY2FyZCcsIGZ1bmN0aW9uKGV2dCwgaXRlbSkge1xuICAgICAgICAgICAgbGV0IGluZGV4ID0gJHNjb3BlLmNvbnRleHQuY2FyZHMuaW5kZXhPZihpdGVtKTtcbiAgICAgICAgICAgICRzY29wZS5jb250ZXh0LmNhcmRzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFVwZGF0ZSBjYXJkXG4gICAgICAgICAqL1xuICAgICAgICAkc2NvcGUuJG9uKCd1cGRhdGUtY2FyZCcsIGZ1bmN0aW9uKGV2dCwgb3JpZ2luYWwsIG5ld0NhcmQpIHtcbiAgICAgICAgICAgIGxldCBpbmRleCA9ICRzY29wZS5jb250ZXh0LmNhcmRzLmluZGV4T2Yob3JpZ2luYWwpO1xuICAgICAgICAgICAgYW5ndWxhci5leHRlbmQoJHNjb3BlLmNvbnRleHQuY2FyZHNbaW5kZXhdLCBuZXdDYXJkKTtcbiAgICAgICAgfSk7XG4gICAgfVxufSkoKTsiLCIoZnVuY3Rpb24oKXtcbiAgICBcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmhvbWUnKS5jb250cm9sbGVyKCdTZWFyY2hDb250cm9sbGVyJywgWyckc2NvcGUnLCAnSG9tZUNvbnRleHRTZXJ2aWNlJywgU2VhcmNoQ29udHJvbGxlcl0pO1xuICAgIFxuICAgIGZ1bmN0aW9uIFNlYXJjaENvbnRyb2xsZXIoJHNjb3BlLCBIb21lQ29udGV4dFNlcnZpY2Upe1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdheSB0byBrZWVwIHNpYmxpbmdzIGNvbm5lY3RlZCBhbmQgc2hhcmluZyBzY29wZVxuICAgICAgICAgKi9cbiAgICAgICAgJHNjb3BlLmNvbnRleHQgPSBIb21lQ29udGV4dFNlcnZpY2UuY29udGV4dDtcbiAgICB9XG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5ob21lJylcbiAgICAgICAgLmZpbHRlcignaGlnaGxpZ2h0VGV4dCcsIGZ1bmN0aW9uKCRzY2UpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAodGV4dCwgcGhyYXNlKSB7XG4gICAgICAgICAgICAgICAgbGV0IGhpZ2hsaWdodGVkID0gcGhyYXNlXG4gICAgICAgICAgICAgICAgICAgICAgICA/IHRleHQucmVwbGFjZShuZXcgUmVnRXhwKCcoJyArIHBocmFzZSArICcpJywgJ2dpJyksICc8c3BhbiBjbGFzcz1cImhpZ2hsaWdodC10ZXh0XCI+JDE8L3NwYW4+JylcbiAgICAgICAgICAgICAgICAgICAgICAgIDogdGV4dDtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHJldHVybiAkc2NlLnRydXN0QXNIdG1sKGhpZ2hsaWdodGVkKTtcbiAgICAgICAgICAgIH07ICAgICAgICAgICAgXG4gICAgICAgIH0pO1xufSkoKTtcblxuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcC5ob21lJykuc2VydmljZSgnSG9tZUNvbnRleHRTZXJ2aWNlJywgZnVuY3Rpb24oKXtcbiAgICB0aGlzLmNvbnRleHQgPSB7XG4gICAgICAgIGNhcmRzOiBbXSxcbiAgICAgICAgcXVlcnk6ICcnXG4gICAgfTtcbn0pOyIsIihmdW5jdGlvbiAoKSB7XG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5zdGFja3MnKS5kaXJlY3RpdmUoJ3N0YWNrRGVzY3JpcHRpb24nLCBbJ2NvbmZpZycsXG4gICAgICAgIGZ1bmN0aW9uIChjb25maWcpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcmVzdHJpY3Q6ICdFQScsXG4gICAgICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogY29uZmlnLlNSQ19GT0xERVIgKyAnc3RhY2tzL3RlbXBsYXRlcy9zdGFjay1kZXNjcmlwdGlvbi5odG1sJyxcbiAgICAgICAgICAgICAgICBzY29wZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBbJyRzY29wZScsICckcm9vdFNjb3BlJywgJyRsb2cnLCAnJGVsZW1lbnQnLCAnZ3Jvd2wnLCAnTW9kYWxTZXJ2aWNlJywgJ3N0YWNrc0ZhY3RvcnknLFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoJHNjb3BlLCAkcm9vdFNjb3BlLCAkbG9nLCAkZWxlbWVudCwgZ3Jvd2wsIE1vZGFsU2VydmljZSwgc3RhY2tzRmFjdG9yeSkge1xuICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmV2ZW50cyA9IHt9O1xuICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAqIFNob3cgbW9yZSBiZWhhdmlvclxuICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnNob3dNb3JlID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhwYW5kZWQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBleHBhbmRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgaGlkZUFycm93OiB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgKiBGaWx0ZXIgYnkgc3RhY2tcbiAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICRzY29wZS4kb24oJ3N0YWNrLXNlbGVjdGVkJywgZnVuY3Rpb24oZXZ0LCBzdGFjaykge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBwcm92aWRlIGluZm8gdG8gdmlld1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmNvbnRleHQuc3RhY2sgPSBzdGFjaztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmVmcmVzaCBhbmltYXRpb24gKHdoZW4gZWxlbWVudCBhbHJlYWR5IHZpc2libGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAkZWxlbWVudC5maW5kKCcuc3RhY2stZGVzY3JpcHRpb24nKS5hZGRDbGFzcygnZmxpcEluWCcpO1xuICAgICAgICAgICAgICAgICAgICAgICB9KTsgICAgXG5cbiAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAqIENsZWFyIHN0YWNrIGRlc2NyaXB0aW9uIGFuaW1hdGlvbiBjbGFzcyB3aGVuIGZpbmlzaGVkXG4gICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAkZWxlbWVudC5vbignd2Via2l0QW5pbWF0aW9uRW5kIG1vekFuaW1hdGlvbkVuZCBNU0FuaW1hdGlvbkVuZCBvYW5pbWF0aW9uZW5kIGFuaW1hdGlvbmVuZCcsICcuc3RhY2stZGVzY3JpcHRpb24nLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoXCJmbGlwSW5YXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICBpZihsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcInN0YWNrXCIpKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHByb3ZpZGUgaW5mbyB0byB2aWV3XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuY29udGV4dC5zdGFjayA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJzdGFja1wiKSk7ICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgKiBVbmNoZWNrIGN1cnJlbnQgc3RhY2sgZmlsdGVyXG4gICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXZlbnRzLnJlbW92ZVN0YWNrRmlsdGVyID0gZnVuY3Rpb24oc3RhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnc3RhY2stdW5zZWxlY3RlZCcsIHN0YWNrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRvbignc3RhY2stdW5zZWxlY3RlZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmNvbnRleHQuc3RhY2sgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgKiBFZGl0IHN0YWNrXG4gICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmV2ZW50cy5lZGl0U3RhY2sgPSBmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1vZGFsU2VydmljZS5zaG93TW9kYWwoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogY29uZmlnLlNSQ19GT0xERVIgKyBcInN0YWNrcy90ZW1wbGF0ZXMvbW9kYWxzL2VkaXQtc3RhY2suaHRtbFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBcIkVkaXRTdGFja0NvbnRyb2xsZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXRzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhY2s6IGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKG1vZGFsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFsLmVsZW1lbnQubW9kYWwoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWwuY2xvc2UudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBwcmVwYXJlIGRhdGEgdG8gYmUgc2VuZCB0byBzZXJ2ZXIgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHN0YWNrID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogaXRlbS5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogbW9kYWwuc2NvcGUuZm9ybS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogbW9kYWwuc2NvcGUuZm9ybS5jb250ZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYWpheCBjYWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhY2tzRmFjdG9yeS51cGRhdGUoc3RhY2spLiRwcm9taXNlLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZW1taXQgZXZlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdzdGFjay11cGRhdGVkJywgaXRlbSwgc3RhY2spO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJGxvZy5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncm93bC5lcnJvcihcIlVwcywgZmFpbGVkIHNhdmluZy4gU29ycnkuXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJGxvZy5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncm93bC5lcnJvcihcIlVwcywgZmFpbGVkIG9wZW5pbmcgZm9ybS5cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHVwZGF0ZSBpbiB2aWV3XG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuJG9uKCdzdGFjay11cGRhdGVkJywgZnVuY3Rpb24oZXZ0LCBvcmlnaW5hbCwgc3RhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5jb250ZXh0LnN0YWNrID0gc3RhY2s7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBEZWxldGUgU3RhY2tcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIFxuICAgICAgICAgICAgICAgICAgICAgICAgICogQHBhcmFtIFN0YWNrIGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgICAgICAqIEByZXR1cm5zIHZvaWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmV2ZW50cy5kZWxldGVTdGFjayA9IGZ1bmN0aW9uIChpdGVtKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBKdXN0IHByb3ZpZGUgYSB0ZW1wbGF0ZSB1cmwsIGEgY29udHJvbGxlciBhbmQgY2FsbCAnc2hvd01vZGFsJy5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBNb2RhbFNlcnZpY2Uuc2hvd01vZGFsKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IGNvbmZpZy5TUkNfRk9MREVSICsgXCJjb21tb24vdGVtcGxhdGVzL21vZGFscy9jb25maXJtLmh0bWxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogXCJZZXNOb0NvbnRyb2xsZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXRzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3RpdGxlJzogJ0RlbGV0ZSBzdGFjaz8nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdjb250ZW50JzogXCJZb3VyIGNhcmRzIHdpbGwgbm90IGJlIGVyYXNlZCwgYnV0IHJlbWFpbiBvcnBoYW5zLlwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIChtb2RhbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RhbC5lbGVtZW50Lm1vZGFsKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFsLmNsb3NlLnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0KSB7ICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFqYXggY2FsbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YWNrc0ZhY3RvcnkuZGVsZXRlKHtpZDogaXRlbS5pZH0pLiRwcm9taXNlLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmNvbnRleHQuc3RhY2sgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZW1taXQgZXZlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdzdGFjay1kZWxldGVkJywgaXRlbSk7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRsb2cuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3Jvd2wuZXJyb3IoXCJVcHMsIGZhaWxlZCBkZWxldGluZyBpdC5cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkbG9nLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3dsLmVycm9yKFwiVXBzLCBmYWlsZWQgb3BlbmluZyBkaWFsb2cuXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIF0pO1xufSkoKTsiLCIoZnVuY3Rpb24oKXtcbiAgICBcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLnN0YWNrcycpLmRpcmVjdGl2ZSgnc3RhY2tMaXN0UGFuZWwnLCBbJ2NvbmZpZycsICdxdWVyeUZhY3RvcnknLCBmdW5jdGlvbihjb25maWcsIHF1ZXJ5RmFjdG9yeSl7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgICAgICAgICBzY29wZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogY29uZmlnLlNSQ19GT0xERVIgKyAnc3RhY2tzL3RlbXBsYXRlcy9zdGFjay1saXN0LXBhbmVsLmh0bWwnLFxuICAgICAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsICAgICAgIFxuICAgICAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgICAgICAgICAgICAgICBzY29wZS5jb250ZXh0LmltZ19mb2xkZXIgPSBjb25maWcuUFJPRklMRV9JTUdfRk9MREVSO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuY29udGV4dC5jdXJyZW50X3N0YWNrID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcInN0YWNrXCIpKTsgXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogT24gdW5zZWxlY3Qgc3RhY2tcbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLiRvbignc3RhY2stdW5zZWxlY3RlZCcsIGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmVtb3ZlIGZyb20gVUlcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuZmluZCgnLmxpc3QtZ3JvdXAtaXRlbScpLnJlbW92ZUNsYXNzKCdzZWxlY3RlZCcpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyByZW1vdmUgZnJvbSBjb29raWVcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnc3RhY2snKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmVtb3ZlIGZyb20gc2NvcGVcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLmNvbnRleHQuY3VycmVudF9zdGFjayA9IG51bGw7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHF1ZXJ5IG5ldyByZXN1bHRzXG4gICAgICAgICAgICAgICAgICAgICAgICBxdWVyeUZhY3RvcnkuYWxsKCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIE9uIHN0YWNrIGluZm8gZWRpdGVkXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBzY29wZS4kb24oJ3N0YWNrLXVwZGF0ZWQnLCBmdW5jdGlvbihldnQsIG9yaWdpbmFsLCBzdGFjaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB1cGRhdGUgY29va2llXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcInN0YWNrXCIsIEpTT04uc3RyaW5naWZ5KHN0YWNrKSk7ICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBmaW5kIHN0YWNrIGluIGxpc3RcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpdGVtID0gc2NvcGUuY29udGV4dC5zdGFja3MuZmlsdGVyKGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZS5pZCA9PSBzdGFjay5pZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaW5kZXggPSBzY29wZS5jb250ZXh0LnN0YWNrcy5pbmRleE9mKGl0ZW1bMF0pO1xuICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gdXBkYXRlIGl0ZW0gaW4gbGlzdFxuICAgICAgICAgICAgICAgICAgICAgICAgYW5ndWxhci5leHRlbmQoc2NvcGUuY29udGV4dC5zdGFja3NbaW5kZXhdLCBzdGFjayk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIE9uIHN0YWNrIGRlbGV0ZWRcbiAgICAgICAgICAgICAgICAgICAgICovICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuJG9uKCdzdGFjay1kZWxldGVkJywgZnVuY3Rpb24oZXZ0LCBzdGFjaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyByZW1vdmUgY29va2llXG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oXCJzdGFja1wiKTsgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGZpbmQgc3RhY2sgaW4gbGlzdFxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGl0ZW0gPSBzY29wZS5jb250ZXh0LnN0YWNrcy5maWx0ZXIoZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBlLmlkID09IHN0YWNrLmlkO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpbmRleCA9IHNjb3BlLmNvbnRleHQuc3RhY2tzLmluZGV4T2YoaXRlbVswXSk7XG4gICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJlbW92ZSBpdGVtIGZyb20gbGlzdFxuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuY29udGV4dC5zdGFja3Muc3BsaWNlKGluZGV4LCAxKTsgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBxdWVyeSBuZXcgcmVzdWx0c1xuICAgICAgICAgICAgICAgICAgICAgICAgcXVlcnlGYWN0b3J5LmFsbCgpO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogWyckc2NvcGUnLCAnJHJvb3RTY29wZScsICckbG9nJywgJ2NvbmZpZycsICdncm93bCcsICdzdGFja3NGYWN0b3J5JywgJ3F1ZXJ5RmFjdG9yeScsICdNb2RhbFNlcnZpY2UnLCBcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24oJHNjb3BlLCAkcm9vdFNjb3BlLCAkbG9nLCBjb25maWcsIGdyb3dsLCBzdGFja3NGYWN0b3J5LCBxdWVyeUZhY3RvcnksIE1vZGFsU2VydmljZSkge1xuICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuY29udGV4dCA9IHt9O1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmV2ZW50cyA9IHt9O1xuICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIEdldCBzdGFjayBsaXN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5jb250ZXh0LnN0YWNrcyA9IHN0YWNrc0ZhY3RvcnkucXVlcnkoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBDcmVhdGUgbmV3IHN0YWNrXG4gICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5ldmVudHMuYWRkTmV3ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTW9kYWxTZXJ2aWNlLnNob3dNb2RhbCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBjb25maWcuU1JDX0ZPTERFUiArIFwic3RhY2tzL3RlbXBsYXRlcy9tb2RhbHMvbmV3LXN0YWNrLmh0bWxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogXCJOZXdTdGFja0NvbnRyb2xsZXJcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLnRoZW4oZnVuY3Rpb24obW9kYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWwuZWxlbWVudC5tb2RhbCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RhbC5jbG9zZS50aGVuKGZ1bmN0aW9uIChyZXN1bHQpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdCkgeyAgICBcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHByZXBhcmUgZGF0YSB0byBzdWJtaXQgdG8gc2VydmVyIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzdGFjayA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogbW9kYWwuc2NvcGUuZm9ybS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogbW9kYWwuc2NvcGUuZm9ybS5kZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YWNrc0ZhY3Rvcnkuc2F2ZShzdGFjaykuJHByb21pc2UudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZW1taXQgZXZlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhY2suaWQgPSByZXNwb25zZS5pZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCduZXctc3RhY2snLCBzdGFjayk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhZGQgdG8gc3RhY2tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmNvbnRleHQuc3RhY2tzLnVuc2hpZnQoc3RhY2spO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkbG9nLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3dsLmVycm9yKFwiVXBzLCBmYWlsZWQgY3JlYXRpbmcgc3RhY2suXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJGxvZy5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncm93bC5lcnJvcihcIlVwcywgZmFpbGVkIG9wZW5pbmcgZm9ybS5cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICogRmlsdGVyIGJ5IHN0YWNrXG4gICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5ldmVudHMuZmlsdGVyID0gZnVuY3Rpb24oJGV2ZW50LCBzdGFjaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBsaW5rID0gJCgkZXZlbnQuY3VycmVudFRhcmdldCk7XG4gICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmsuY2xvc2VzdCgndWwnKS5maW5kKCcubGlzdC1ncm91cC1pdGVtJykucmVtb3ZlQ2xhc3MoJ3NlbGVjdGVkJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGluay5wYXJlbnQoKS5hZGRDbGFzcygnc2VsZWN0ZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcGVyc2lzdCBmaWx0ZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnc3RhY2snLCBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBzdGFjay5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogc3RhY2submFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHN0YWNrLmRlc2NyaXB0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5jb250ZXh0LmN1cnJlbnRfc3RhY2sgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwic3RhY2tcIikpOyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBxdWVyeSByZXN1bHRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVlcnlGYWN0b3J5LmJ5U3RhY2soe3N0YWNrX2lkOiBzdGFjay5pZH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRlbGwgdGhlIHdvcmxkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdzdGFjay1zZWxlY3RlZCcsIHN0YWNrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICogVW5zZWxlY3Qgc3RhY2tcbiAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmV2ZW50cy51bnNlbGVjdFN0YWNrRmlsdGVyID0gZnVuY3Rpb24gKCRldmVudCwgc3RhY2spIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ3N0YWNrLXVuc2VsZWN0ZWQnLCBzdGFjayk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9ICAgICAgICBcbiAgICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgfTtcbiAgICB9XSk7XG59KSgpOyIsIihmdW5jdGlvbigpe1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuc3RhY2tzJykuZmFjdG9yeSgnc3RhY2tzRmFjdG9yeScsIFsnJHJlc291cmNlJywgJ2NvbmZpZycsIGZ1bmN0aW9uICgkcmVzb3VyY2UsIGNvbmZpZykge1xuICAgICAgICByZXR1cm4gJHJlc291cmNlKGNvbmZpZy5hcGkgKyAnL3N0YWNrcy86aWQnLCB7IGlkOiAnQGlkJywgc3RhY2tfaWQ6ICdAc3RhY2tfaWQnIH0sIHtcbiAgICAgICAgICAgIHVwZGF0ZToge1xuICAgICAgICAgICAgICBtZXRob2Q6ICdQVVQnIFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZpbHRlcjoge1xuICAgICAgICAgICAgICB1cmw6IGNvbmZpZy5hcGkgKyAnL3N0YWNrcy86c3RhY2tfaWQvY2FyZHMnLCBcbiAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7IFxuICAgIH1dKTtcbn0pKCk7XG5cbiIsIihmdW5jdGlvbiAoKSB7XG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC50YWdzJykuZGlyZWN0aXZlKCdjdXJyZW50VGFncycsIFsnY29uZmlnJyxcbiAgICAgICAgZnVuY3Rpb24gKGNvbmZpZykge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICByZXN0cmljdDogJ0VBJyxcbiAgICAgICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBjb25maWcuU1JDX0ZPTERFUiArICd0YWdzL3RlbXBsYXRlcy9jdXJyZW50LXRhZ3MuaHRtbCcsXG4gICAgICAgICAgICAgICAgc2NvcGU6IHRydWUsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogWyckc2NvcGUnLCAncXVlcnlGYWN0b3J5JywgZnVuY3Rpb24gKCRzY29wZSwgcXVlcnlGYWN0b3J5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmV2ZW50cyA9IHt9O1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBDdXJyZW50IHRhZ3MgZmlsdGVyc1xuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmV2ZW50cy5wcmludEN1cnJlbnRUYWdzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGN1cnJlbnRfY29va2llcyA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3RhZ3NbXScpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgKGN1cnJlbnRfY29va2llcykgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmNvbnRleHQudGFnX2ZpbHRlcnMgPSBjdXJyZW50X2Nvb2tpZXM7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAvLyBhZGQgb25lIG1vcmVcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRvbigndGFnLWZpbHRlci1hZGRlZCcsIGZ1bmN0aW9uIChldnQsIHRhZykge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBxdWVyeUZhY3RvcnkuYnlUYWdzKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgkc2NvcGUuY29udGV4dC50YWdfZmlsdGVycyAmJiAkc2NvcGUuY29udGV4dC50YWdfZmlsdGVycy5sZW5ndGggIT09IDApIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5jb250ZXh0LnRhZ19maWx0ZXJzLnVuc2hpZnQodGFnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmNvbnRleHQudGFnX2ZpbHRlcnMgPSBbdGFnXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAvLyBEcmF3IHRhZyBmaWx0ZXJzIG9uIHBhZ2UgbG9hZFxuICAgICAgICAgICAgICAgICAgICRzY29wZS5ldmVudHMucHJpbnRDdXJyZW50VGFncygpOyBcblxuICAgICAgICAgICAgICAgICAgICRzY29wZS5ldmVudHMucmVtb3ZlVGFnRmlsdGVyID0gZnVuY3Rpb24oZXZlbnQsIGluZGV4LCB0YWcpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAvLyByZW1vdmUgZnJvbSB2aWV3XG4gICAgICAgICAgICAgICAgICAgICAgICQoZXZlbnQuY3VycmVudFRhcmdldCkuY2xvc2VzdCgnbGknKS5yZW1vdmVDbGFzcygnYW5pbWF0ZWQnKTsgLy8gbm8gaGlkZSBhbmltYXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmNvbnRleHQudGFnX2ZpbHRlcnMuc3BsaWNlKGluZGV4LCAxKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAvLyByZW1vdmUgdGFnIGZyb20gY29va2llc1xuICAgICAgICAgICAgICAgICAgICAgICBsZXQgY3VycmVudF9jb29raWVzID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndGFnc1tdJykpO1xuICAgICAgICAgICAgICAgICAgICAgICBsZXQgY29va2llX2luZGV4ID0gJC5pbkFycmF5KCB0YWcsIGN1cnJlbnRfY29va2llcyApO1xuICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50X2Nvb2tpZXMuc3BsaWNlKGNvb2tpZV9pbmRleCwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCd0YWdzW10nLCBKU09OLnN0cmluZ2lmeShjdXJyZW50X2Nvb2tpZXMpKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAvLyBxdWVyeVxuICAgICAgICAgICAgICAgICAgICAgICBxdWVyeUZhY3RvcnkuYnlUYWdzKCk7XG4gICAgICAgICAgICAgICAgICAgfSAgICAgXG4gICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICBdKTtcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLnRhZ3MnKS5kaXJlY3RpdmUoJ25ld1RhZycsIFsnY29uZmlnJywgJ3RhZ3NGYWN0b3J5JywgJyRyb290U2NvcGUnLCAnJGFuaW1hdGUnLFxuICAgICAgICBmdW5jdGlvbiAoY29uZmlnLCB0YWdzRmFjdG9yeSwgJHJvb3RTY29wZSwgJGFuaW1hdGUpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICByZXN0cmljdDogJ0VBJyxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogY29uZmlnLlNSQ19GT0xERVIgKyAnL3RhZ3MvdGVtcGxhdGVzL25ldy10YWcuaHRtbCcsXG4gICAgICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgICAgICAgICBjYXJkOiBcIj1kYXRhXCJcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLmV2ZW50cyA9IHt9O1xuICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vIGFyY2hldHlwZVxuICAgICAgICAgICAgICAgICAgICBzY29wZS50YWcgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAnJ1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIEluaXRpYWwgd2lkZ2V0IHN0YXRlXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBzY29wZS5kaXNwbGF5ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogSGlkZSB3aWRnZXRcbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLmV2ZW50cy5zaG93ID0gZnVuY3Rpb24oKSB7IFxuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuZGlzcGxheSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBzY29wZS52aXNpYmlsaXR5ID0gJ3Zpc2libGUnOyAvLyBjc3MgY2xhc3NcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5maW5kKCdpbnB1dCcpLmZvY3VzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCAwLjUpOyAvLyB0aW1lIHdpbGwgdmFyeSBhY2NvcmRpbmcgdG8gY3NzIHJ1bGVcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIEhpZGUgd2lkZ2V0XG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBzY29wZS5ldmVudHMuaGlkZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuZGlzcGxheSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUudmlzaWJpbGl0eSA9ICcnOyAvLyBjc3MgY2xhc3NcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLnRhZy5uYW1lID0gJyc7IC8vIHJlc2V0IGZpZWxkXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBjcmVhdGVzIGEgdGFnIGFuZCBhdHRhY2ggaXQgdG8gY3VycmVudCBjYXJkXG4gICAgICAgICAgICAgICAgICAgICAqIFxuICAgICAgICAgICAgICAgICAgICAgKiBAcmV0dXJucyB2b2lkXG4gICAgICAgICAgICAgICAgICAgICAqIEBicm9hZGNhc3RzIGV2ZW50XG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBzY29wZS5ldmVudHMuYWRkTmV3ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihzY29wZS50YWcubmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCB0YWcgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhcmRfaWQ6IHNjb3BlLmNhcmQuaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHNjb3BlLnRhZy5uYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWdzRmFjdG9yeS5zYXZlKHRhZywgZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFnLmlkID0gcmVzcG9uc2UuaWQ7IC8vIGFwcGVuZCB0YWcgaWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuZXZlbnRzLmZsYXNoQ2xhc3MoZWxlbWVudCwgJ29rJyk7IC8vIHV4IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYWRkIHRhZyBhcyB0aGUgbGFzdCB2aXNpYmxlIG9mIFggdGFnc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZih0eXBlb2Yoc2NvcGUuY2FyZC50YWdzKSAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYWRkIHRhZyB0byB0aGUgbGlzdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuY2FyZC50YWdzLnNwbGljZShzY29wZS5tYXhfbnVtX3RhZ3MtMSwgMCwgdGFnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNyZWF0ZSB0aGUgbGlzdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuY2FyZC50YWdzID0gW3RhZ107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLmV2ZW50cy5mbGFzaENsYXNzKGVsZW1lbnQsICdlcnJvcicpOyAvLyB1eCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY29wZS50YWcubmFtZSA9ICcnOyAvLyByZXNldCBmaWVsZFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIEtleSBldmVudCAoRW50ZXIpXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmJpbmQoXCJrZXlkb3duIGtleXByZXNzXCIsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoZXZlbnQud2hpY2ggPT09IDEzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuZXZlbnRzLmFkZE5ldygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIEFkZHMgYW5kIHJlbW92ZXMgYSBjbGFzc1xuICAgICAgICAgICAgICAgICAgICAgKiBcbiAgICAgICAgICAgICAgICAgICAgICogQHBhcmFtIHN0cmluZyBjbGFzc05hbWVcbiAgICAgICAgICAgICAgICAgICAgICogQHJldHVybnMgdm9pZFxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuZXZlbnRzLmZsYXNoQ2xhc3MgPSBmdW5jdGlvbihlbGVtZW50LCBjbGFzc05hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAkYW5pbWF0ZS5hZGRDbGFzcyhlbGVtZW50LCBjbGFzc05hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkYW5pbWF0ZS5yZW1vdmVDbGFzcyhlbGVtZW50LCBjbGFzc05hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVDbGFzcyhjbGFzc05hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCA2MDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIF0pO1xufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuaG9tZScpLmRpcmVjdGl2ZSgndGFnQ2xvdWQnLCBbJ2NvbmZpZycsIFxuICAgICAgICBmdW5jdGlvbiAoY29uZmlnKSB7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcmVzdHJpY3Q6ICdFQScsXG4gICAgICAgICAgICAgICAgc2NvcGU6IHRydWUsXG4gICAgICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSwgICAgIFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBjb25maWcuU1JDX0ZPTERFUiArICcvdGFncy90ZW1wbGF0ZXMvdGFnLWNsb3VkLmh0bWwnLFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJyRyb290U2NvcGUnLCAncmVkdWNlQnlGaWx0ZXInLCBmdW5jdGlvbiAoJHNjb3BlLCAkcm9vdFNjb3BlLCByZWR1Y2VCeUZpbHRlcikge1xuXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5ldmVudHMgPSB7fTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIEtlZXAgdHJhY2sgb2YgY2FyZCBsaXN0IGNoYW5nZXNcbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS4kb24oJ2NhcmRzLWxvYWRlZCcsIGZ1bmN0aW9uIChldnQsIGNvbGxlY3Rpb24pIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYodHlwZW9mKGNvbGxlY3Rpb24uZGF0YSkgPT09ICd1bmRlZmluZWQnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZXhjbHVkZSBjYXJkIHdpdGggbm8gdGFnc1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNhcmRzID0gY29sbGVjdGlvbi5kYXRhLmZpbHRlcihmdW5jdGlvbiAoY2FyZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjYXJkLnRhZ3MgPyBjYXJkLnRhZ3MubGVuZ3RoID4gMCA6IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBleHRyYWN0IHRhZ3MgZnJvbSBjYXJkXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdGFncyA9IGNhcmRzLm1hcChmdW5jdGlvbiAoY2FyZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKGFuZ3VsYXIudG9Kc29uKGNhcmQudGFncykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIG1lcmdlIHRhZ3MgaW4gZmxhdHRlbiBhcnJheVxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG1lcmdlZCA9IFtdLmNvbmNhdC5hcHBseShbXSwgdGFncyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBlbGltaW5hdGUgZHVwbGljYXRlcyBhbmQgc2VydmUgYXJyYXkgdG8gdmlld1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnRhZ3MgPSByZWR1Y2VCeUZpbHRlcihtZXJnZWQsICdpZCcpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5ldmVudHMuZmlsdGVyID0gZnVuY3Rpb24odGFnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjdXJyZW50X3RhZ3MgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0YWdzW10nKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKCB0eXBlb2YoY3VycmVudF90YWdzKSA9PT0gJ3VuZGVmaW5lZCcgfHwgY3VycmVudF90YWdzID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZmlyc3Qgb25lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudF90YWdzID0gW3RhZ107XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGF2b2lkIGR1cGxpY2F0ZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50X3RhZ3MgPSBhbmd1bGFyLmZyb21Kc29uKGN1cnJlbnRfdGFncyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coY3VycmVudF90YWdzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiggY3VycmVudF90YWdzICYmIGN1cnJlbnRfdGFncy5tYXAoZnVuY3Rpb24oZSkgeyByZXR1cm4gZS5pZDsgfSkuaW5kZXhPZih0YWcuaWQpID09PSAtMSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudF90YWdzLnB1c2godGFnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFkZCB0YWcgdG8gY3VycmVudCB0YWdzIGxpc3RcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCd0YWdzW10nLCBKU09OLnN0cmluZ2lmeShjdXJyZW50X3RhZ3MpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc29tZW9uZSBlbHNlIHdpbGwgbWFrZSB0aGUgcXVlcnlcbiAgICAgICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgndGFnLWZpbHRlci1hZGRlZCcsIHRhZyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIF0pO1xufSkoKTsiLCIoZnVuY3Rpb24oKXtcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLnRhZ3MnKS5mYWN0b3J5KCd0YWdzRmFjdG9yeScsIFsnJHJlc291cmNlJywgJ2NvbmZpZycsIGZ1bmN0aW9uICgkcmVzb3VyY2UsIGNvbmZpZykge1xuICAgICAgICByZXR1cm4gJHJlc291cmNlKGNvbmZpZy5hcGkgKyAnL3RhZ3MvOmlkJywgeyBpZDogJ0BpZCcsIGNhcmRfaWQ6ICdAY2FyZF9pZCcgfSwge1xuICAgICAgICAgICAgc2F2ZToge1xuICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLCBcbiAgICAgICAgICAgICAgICB1cmw6IGNvbmZpZy5hcGkgKyAnL2NhcmRzLzpjYXJkX2lkL3RhZ3MnICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZpbHRlcjoge1xuICAgICAgICAgICAgICB1cmw6IGNvbmZpZy5hcGkgKyAnL2NhcmRzL3RhZ3MvYWxsJywgXG4gICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcgXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pOyBcbiAgICB9XSk7XG59KSgpO1xuXG4iLCIoZnVuY3Rpb24oKSB7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmNhcmRzJykuY29udHJvbGxlcignRWRpdENhcmRDb250cm9sbGVyJywgWyckc2NvcGUnLCAnZGF0YScsICdjbG9zZScsIEVkaXRDYXJkQ29udHJvbGxlcl0pO1xuICAgIFxuICAgIGZ1bmN0aW9uIEVkaXRDYXJkQ29udHJvbGxlcigkc2NvcGUsIGRhdGEsIGNsb3NlKSB7XG5cbiAgICAgICAgJHNjb3BlLmZvcm0gPSB7fTtcbiAgICAgICAgJHNjb3BlLmZvcm0ubmFtZSA9IGRhdGEuY2FyZC5uYW1lO1xuICAgICAgICAkc2NvcGUuZm9ybS5jb250ZW50ID0gZGF0YS5jYXJkLmNvbnRlbnQ7XG5cbiAgICAgICAgJHNjb3BlLmNsb3NlID0gZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICBcbiAgICAgICAgICAgIGNsb3NlKHJlc3VsdCwgMjAwKTsgLy8gY2xvc2UsIGJ1dCBnaXZlIDIwMG1zIGZvciBib290c3RyYXAgdG8gYW5pbWF0ZVxuICAgICAgICB9O1xuICAgIH07XG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmhvbWUnKS5jb250cm9sbGVyKCdZZXNOb0NvbnRyb2xsZXInLCBbJyRzY29wZScsICdkYXRhJywgJ2Nsb3NlJywgZnVuY3Rpb24gKCRzY29wZSwgZGF0YSwgY2xvc2UpIHtcbiAgICAgICAgICAgXG4gICAgICAgICAgICAkc2NvcGUudGl0bGUgPSBkYXRhLnRpdGxlO1xuICAgICAgICAgICAgJHNjb3BlLmNvbnRlbnQgPSBkYXRhLmNvbnRlbnQ7XG4gICAgICAgICAgIFxuICAgICAgICAgICAgJHNjb3BlLmNsb3NlID0gZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgIGNsb3NlKHJlc3VsdCwgMjAwKTsgLy8gY2xvc2UsIGJ1dCBnaXZlIDIwMG1zIGZvciBib290c3RyYXAgdG8gYW5pbWF0ZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfV0pO1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmhvbWUnKS5jb250cm9sbGVyKCdNYXJrZG93bkNvbnRyb2xsZXInLCBbJyRzY29wZScsICdkYXRhJywgJ2Nsb3NlJywgTWFya2Rvd25Db250cm9sbGVyXSk7XG4gICAgXG4gICAgZnVuY3Rpb24gTWFya2Rvd25Db250cm9sbGVyKCRzY29wZSwgZGF0YSwgY2xvc2UpIHtcblxuICAgICAgICAkc2NvcGUudGl0bGUgPSBkYXRhLmNhcmQubmFtZTtcbiAgICAgICAgJHNjb3BlLmNvbnRlbnQgPSBkYXRhLmNhcmQuY29udGVudDtcblxuICAgICAgICAkc2NvcGUuZGlzbWlzc01vZGFsID0gZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgY2xvc2UocmVzdWx0LCAyMDApOyAvLyBjbG9zZSwgYnV0IGdpdmUgMjAwbXMgZm9yIGJvb3RzdHJhcCB0byBhbmltYXRlXG4gICAgICAgIH07XG4gICAgfTtcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5zdGFja3MnKS5jb250cm9sbGVyKCdFZGl0U3RhY2tDb250cm9sbGVyJywgWyckc2NvcGUnLCAnJGVsZW1lbnQnLCAnZGF0YScsICdjbG9zZScsIEVkaXRTdGFja0NvbnRyb2xsZXJdKTtcbiAgICBcbiAgICBmdW5jdGlvbiBFZGl0U3RhY2tDb250cm9sbGVyKCRzY29wZSwgJGVsZW1lbnQsIGRhdGEsIGNsb3NlKSB7XG4gICAgICBcbiAgICAgICAgJHNjb3BlLmZvcm0gPSB7fTtcbiAgICAgICAgJHNjb3BlLmZvcm0ubmFtZSA9IGRhdGEuc3RhY2submFtZTtcbiAgICAgICAgJHNjb3BlLmZvcm0uY29udGVudCA9IGRhdGEuc3RhY2suZGVzY3JpcHRpb247XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEtleSBldmVudCAoRW50ZXIpXG4gICAgICAgICAqL1xuICAgICAgICAkZWxlbWVudC5maW5kKCdpbnB1dCcpLmJpbmQoXCJrZXlkb3duIGtleXByZXNzXCIsIGZ1bmN0aW9uIChldmVudCkge1xuXG4gICAgICAgICAgICBpZihldmVudC53aGljaCA9PT0gMTMpIHtcbiAgICAgICAgICAgICAgICAkZWxlbWVudC5tb2RhbCgnaGlkZScpO1xuICAgICAgICAgICAgICAgICRzY29wZS5jbG9zZSh0cnVlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgICRzY29wZS5jbG9zZSA9IGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgXG4gICAgICAgICAgICBjbG9zZShyZXN1bHQsIDIwMCk7IC8vIGNsb3NlLCBidXQgZ2l2ZSAyMDBtcyBmb3IgYm9vdHN0cmFwIHRvIGFuaW1hdGVcbiAgICAgICAgfTtcbiAgICB9O1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG4gICAgXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5zdGFja3MnKS5jb250cm9sbGVyKCdOZXdTdGFja0NvbnRyb2xsZXInLCBbJyRzY29wZScsICckZWxlbWVudCcsICdjbG9zZScsIE5ld1N0YWNrQ29udHJvbGxlcl0pO1xuICAgIFxuICAgIGZ1bmN0aW9uIE5ld1N0YWNrQ29udHJvbGxlcigkc2NvcGUsICRlbGVtZW50LCBjbG9zZSkge1xuICAgICAgIFxuICAgICAgICAkc2NvcGUuZm9ybSA9IHtcbiAgICAgICAgICAgIG5hbWU6ICcnLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICcnXG4gICAgICAgIH07XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBLZXkgZXZlbnQgKEVudGVyKVxuICAgICAgICAgKi9cbiAgICAgICAgJGVsZW1lbnQuZmluZCgnaW5wdXQnKS5iaW5kKFwia2V5ZG93biBrZXlwcmVzc1wiLCBmdW5jdGlvbiAoZXZlbnQpIHtcblxuICAgICAgICAgICAgaWYoZXZlbnQud2hpY2ggPT09IDEzKSB7XG4gICAgICAgICAgICAgICAgJGVsZW1lbnQubW9kYWwoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICAkc2NvcGUuY2xvc2UodHJ1ZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgICRzY29wZS5jbG9zZSA9IGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgXG4gICAgICAgICAgICBjbG9zZShyZXN1bHQsIDIwMCk7IC8vIGNsb3NlLCBidXQgZ2l2ZSAyMDBtcyBmb3IgYm9vdHN0cmFwIHRvIGFuaW1hdGVcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICBcbiAgICB9O1xufSkoKTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
