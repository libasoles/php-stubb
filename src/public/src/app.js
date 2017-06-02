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
      
            if(filters.includes('tags') && localStorage.getItem('tags[]') != 'null') {
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
                        
                        let current_cookies = JSON.parse(localStorage.getItem('tags[]'));
                                 
                        if( typeof(current_cookies) === 'undefined') {
                            // first one
                            current_cookies = [tag];
                        } else {
                            // avoid duplicates
                            current_cookies = angular.fromJson(current_cookies);
                            if( current_cookies && current_cookies.map(function(e) { return e.id; }).indexOf(tag.id) === -1 ) {
                                current_cookies.push(tag);
                            }
                        }
                        
                        // add tag to current tags list
                        localStorage.setItem('tags[]', JSON.stringify(current_cookies));
                        
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC1jb25maWcuanMiLCJjYXJkcy9tb2R1bGUuanMiLCJjb21tb24vbW9kdWxlLmpzIiwiaG9tZS9tb2R1bGUuanMiLCJzdGFja3MvbW9kdWxlLmpzIiwidGFncy9tb2R1bGUuanMiLCJjYXJkcy9jYXJkcy1yb3V0ZS5qcyIsImNvbW1vbi9hcHAtcm91dGUuanMiLCJob21lL2hvbWUtcm91dGUuanMiLCJsb2dpbi9sb2dpbi5qcyIsInN0YWNrcy9ob21lLXJvdXRlLmpzIiwiY2FyZHMvZGlyZWN0aXZlcy9jYXJkLmpzIiwiY2FyZHMvZGlyZWN0aXZlcy9uZXctY2FyZC5qcyIsImNhcmRzL2RpcmVjdGl2ZXMvb3JkZXItYnkuanMiLCJjYXJkcy9kaXJlY3RpdmVzL3BhZ2luYXRlLWNhcmRzLmpzIiwiY2FyZHMvc2VydmljZXMvY2FyZHMtZmFjdG9yeS5qcyIsImNvbW1vbi9jb250cm9sbGVycy9oZWFkZXItY29udHJvbGxlcnMuanMiLCJjb21tb24vY29udHJvbGxlcnMvbGF5b3V0LWNvbnRyb2xsZXJzLmpzIiwiY29tbW9uL2RpcmVjdGl2ZXMvYXV0b2ZvY3VzLmpzIiwiY29tbW9uL2RpcmVjdGl2ZXMvZWxhc3RpY0FyZWEuanMiLCJjb21tb24vZGlyZWN0aXZlcy9oYXNodGFnaWZ5LmpzIiwiY29tbW9uL2RpcmVjdGl2ZXMvc2Vzc2lvbkRyb3Bkb3duLmpzIiwiY29tbW9uL2RpcmVjdGl2ZXMvc2hvd01vcmUuanMiLCJjb21tb24vZGlyZWN0aXZlcy9zdWJtaXRPbksxMy5qcyIsImNvbW1vbi9maWx0ZXJzL3JlZHVjZUJ5LmpzIiwiY29tbW9uL3NlcnZpY2VzL3F1ZXJ5LWZhY3RvcnkuanMiLCJob21lL2NvbnRyb2xsZXJzL2hvbWUtY29udHJvbGxlci5qcyIsImhvbWUvY29udHJvbGxlcnMvbGlzdC1jb250cm9sbGVyLmpzIiwiaG9tZS9jb250cm9sbGVycy9zZWFyY2gtY29udHJvbGxlci5qcyIsImhvbWUvZmlsdGVycy9oaWdobGlnaHRUZXh0LmpzIiwiaG9tZS9zZXJ2aWNlcy9ob21lLWNvbnRleHQuanMiLCJzdGFja3MvZGlyZWN0aXZlcy9zdGFjay1kZXNjcmlwdGlvbi5qcyIsInN0YWNrcy9kaXJlY3RpdmVzL3N0YWNrLWxpc3QtcGFuZWwuanMiLCJzdGFja3Mvc2VydmljZXMvc3RhY2tzLWZhY3RvcnkuanMiLCJ0YWdzL2RpcmVjdGl2ZXMvY3VycmVudC10YWdzLmpzIiwidGFncy9kaXJlY3RpdmVzL25ldy10YWcuanMiLCJ0YWdzL2RpcmVjdGl2ZXMvdGFnLWNsb3VkLmpzIiwidGFncy9zZXJ2aWNlL3RhZ3MtZmFjdG9yeS5qcyIsImNhcmRzL2NvbnRyb2xsZXJzL21vZGFscy9lZGl0LWNhcmQtY29udHJvbGxlci5qcyIsImNvbW1vbi9jb250cm9sbGVycy9tb2RhbHMveWVzLW5vLWNvbnRyb2xsZXIuanMiLCJob21lL2NvbnRyb2xsZXJzL21vZGFscy9tYXJrZG93bi1jb250cm9sbGVyLmpzIiwic3RhY2tzL2NvbnRyb2xsZXJzL21vZGFscy9lZGl0LXN0YWNrLWNvbnRyb2xsZXIuanMiLCJzdGFja3MvY29udHJvbGxlcnMvbW9kYWxzL25ldy1zdGFjay1jb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUFHQSxRQUFBLE9BQUEsY0FBQTtLQUNBLFNBQUEsVUFBQTtRQUNBLE9BQUE7UUFDQSxTQUFBO1FBQ0EsY0FBQTtRQUNBLGNBQUE7UUFDQSxzQkFBQTs7O0FDVEEsUUFBQSxPQUFBLGFBQUE7OztBQ0FBOztBQUVBLFFBQUEsT0FBQSxPQUFBLENBQUEsTUFBQSxhQUFBLFdBQUEsY0FBQSxZQUFBLHVCQUFBLDBCQUFBOzs7OztBQUtBLFFBQUEsT0FBQSxPQUFBLE9BQUEsQ0FBQSxpQkFBQSxnQkFBQSxzQkFBQSxpQkFBQTtJQUNBLFVBQUEsZUFBQSxjQUFBLG9CQUFBLGVBQUEsUUFBQTs7Ozs7UUFLQSxjQUFBLFNBQUEsUUFBQSxTQUFBO1lBQ0EsZ0JBQUE7WUFDQSxVQUFBO1lBQ0EscUJBQUE7WUFDQSxv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QUdBLE9BQUEsZUFBQSxTQUFBLEdBQUE7WUFDQSxJQUFBLFVBQUEsRUFBQSxPQUFBO1lBQ0EsTUFBQSw0QkFBQTs7Ozs7Ozs7UUFRQSxPQUFBLFlBQUEsU0FBQSxNQUFBOzs7OztZQUtBLE9BQUEsS0FBQSxZQUFBOzs7Ozs7O0FDMUJBLENBQUEsWUFBQTtJQUNBLFFBQUEsT0FBQSxPQUFBLFVBQUEsYUFBQSxZQUFBO1FBQ0EsT0FBQTtZQUNBLFVBQUE7WUFDQSxNQUFBLFVBQUEsT0FBQSxTQUFBO2dCQUNBLFFBQUEsR0FBQTs7Ozs7OztBQ0xBLENBQUEsWUFBQTs7O0lBR0EsUUFBQSxPQUFBLE9BQUEsVUFBQSxlQUFBLFlBQUE7UUFDQSxPQUFBO1lBQ0EsVUFBQTtZQUNBLE1BQUEsVUFBQSxPQUFBLFNBQUEsWUFBQTtnQkFDQSxJQUFBLFlBQUE7d0JBQ0EsWUFBQSxRQUFBLEdBQUE7d0JBQ0EsY0FBQSxRQUFBLElBQUE7d0JBQ0EsZUFBQSxRQUFBLElBQUE7O2dCQUVBLElBQUEsVUFBQSxRQUFBLFFBQUEsZUFBQSxJQUFBO29CQUNBLFVBQUE7b0JBQ0EsS0FBQSxDQUFBO29CQUNBLE1BQUEsQ0FBQTtvQkFDQSxPQUFBLFFBQUEsR0FBQSxjQUFBLFNBQUEsZUFBQSxLQUFBLFNBQUEsZ0JBQUE7b0JBQ0EsVUFBQSxRQUFBLElBQUE7b0JBQ0EsWUFBQSxRQUFBLElBQUE7b0JBQ0EsWUFBQSxRQUFBLElBQUE7b0JBQ0EsUUFBQTs7O2dCQUdBLFFBQUEsUUFBQSxTQUFBLE1BQUEsT0FBQTs7Z0JBRUEsSUFBQSxTQUFBLFlBQUE7b0JBQ0EsSUFBQSxRQUFBLFVBQUEsUUFBQSxRQUFBO3dCQUNBLEtBQUEsSUFBQSxJQUFBLEdBQUEsSUFBQSxJQUFBLElBQUEsUUFBQSxLQUFBOzRCQUNBLEtBQUE7O3dCQUVBLE9BQUE7OztvQkFHQSxJQUFBLE1BQUEsUUFBQSxNQUFBLFFBQUEsTUFBQTs2QkFDQSxRQUFBLE1BQUE7NkJBQ0EsUUFBQSxNQUFBOzZCQUNBLFFBQUEsT0FBQTs2QkFDQSxRQUFBLE9BQUE7NkJBQ0Es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T0FBQTt1QkFDQTs7Z0JBRUEsU0FBQSxZQUFBLFVBQUEsV0FBQSxZQUFBO29CQUNBLE9BQUEsU0FBQSxLQUFBLFNBQUEsSUFBQTtzQkFDQSxPQUFBLEdBQUEsZUFBQTs7Ozs7Ozs7QUNiQSxDQUFBLFlBQUE7O0tBRUEsUUFBQSxPQUFBLE9BQUEsUUFBQSxnQkFBQSxDQUFBLFFBQUEsY0FBQSxnQkFBQSxpQkFBQSxlQUFBOztJQUVBLFNBQUEsYUFBQSxNQUFBLFlBQUEsY0FBQSxlQUFBLGFBQUE7O1FBRUEsSUFBQSxVQUFBOzs7Ozs7Ozs7UUFTQSxRQUFBLE1BQUEsVUFBQSxRQUFBOztZQUVBLFNBQUEsV0FBQSxRQUFBLENBQUEsU0FBQSxTQUFBOzs7WUFHQSxPQUFBO2lCQUNBLE1BQUEsUUFBQSxVQUFBLFVBQUE7O29CQUVBLFVBQUE7bUJBQ0EsU0FBQSxLQUFBO29CQUNBLEtBQUEsTUFBQTs7Ozs7Ozs7Ozs7UUFXQSxRQUFBLFVBQUEsVUFBQSxRQUFBOztZQUVBLFNBQUEsV0FBQSxRQUFBLENBQUEsU0FBQSxTQUFBOztZQUVBLE9BQUEsY0FBQSxPQUFBLFFBQUEsU0FBQSxVQUFBOztnQkFFQSxVQUFBO2VBQ0EsU0FBQSxLQUFBO2dCQUNBLEtBQUEsTUFBQTs7Ozs7Ozs7Ozs7UUFXQSxRQUFBLFNBQUEsVUFBQSxRQUFBOztZQUVBLFNBQUEsV0FBQSxRQUFBLENBQUEsU0FBQSxTQUFBOztZQUVBLE9BQUEsWUFBQSxPQUFBLFFBQUEsU0FBQSxVQUFBOztnQkFFQSxVQUFBO2VBQ0EsU0FBQSxLQUFBO2dCQUNBLEtBQUEsTUFBQTs7OztRQUlBLFNBQUEsV0FBQSxRQUFBLFNBQUE7O1lBRUEsR0FBQSxPQUFBLFlBQUEsYUFBQTtnQkFDQSxTQUFBOzs7WUFHQSxHQUFBLFFBQUEsU0FBQSxXQUFBLGFBQUEsUUFBQSxhQUFBLFFBQUE7Z0JBQ0EsT0FBQSxZQUFBLEtBQUEsTUFBQSxhQUFBLFFBQUEsV0FBQSxJQUFBLFNBQUEsRUFBQSxFQUFBLE9BQUEsRUFBQTs7WUFFQSxHQUFBLFFBQUEsU0FBQSxZQUFBLGFB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LGFBQUEsVUFBQSxVQUFBLFdBQUEsUUFBQTtRQUNBLE9BQUEsVUFBQSxPQUFBLE1BQUEsYUFBQSxFQUFBLElBQUEsT0FBQSxTQUFBLGNBQUE7WUFDQSxNQUFBO2dCQUNBLFFBQUE7Z0JBQ0EsS0FBQSxPQUFBLE1BQUE7O1lBRUEsUUFBQTtjQUNBLEtBQUEsT0FBQSxNQUFBO2NBQ0EsUUFBQTs7Ozs7OztBQ1RBLENBQUEsV0FBQTs7SUFFQSxRQUFBLE9BQUEsYUFBQSxXQUFBLHNCQUFBLENBQUEsVUFBQSxRQUFBLFNBQUE7O0lBRUEsU0FBQSxtQkFBQSxRQUFBLE1BQUEsT0FBQTs7UUFFQSxPQUFBLE9BQUE7UUFDQSxPQUFBLEtBQUEsT0FBQSxLQUFBLEtBQUE7UUFDQSxPQUFBLEtBQUEsVUFBQSxLQUFBLEtBQUE7O1FBRUEsT0FBQSxRQUFBLFVBQUEsUUFBQTs7WUFFQSxNQUFBLFFBQUE7O0tBRUE7O0FDZEEsQ0FBQSxZQUFBOztJQUVBLFFBQUEsT0FBQSxZQUFBLFdBQUEsbUJBQUEsQ0FBQSxVQUFBLFFBQUEsU0FBQSxVQUFBLFFBQUEsTUFBQSxPQUFBOztZQUVBLE9BQUEsUUFBQSxLQUFBO1lBQ0EsT0FBQSxVQUFBLEtBQUE7O1lBRUEsT0FBQSxRQUFBLFVBQUEsUUFBQTtnQkFDQSxNQUFBLFFBQUE7Ozs7QUNSQSxDQUFBLFdBQUE7O0lBRUEsUUFBQSxPQUFBLFlBQUEsV0FBQSxzQkFBQSxDQUFBLFVBQUEsUUFBQSxTQUFBOztJQUVBLFNBQUEsbUJBQUEsUUFBQSxNQUFBLE9BQUE7O1FBRUEsT0FBQSxRQUFBLEtBQUEsS0FBQTtRQUNBLE9BQUEsVUFBQSxLQUFBLEtBQUE7O1FBRUEsT0FBQSxlQUFBLFVBQUEsUUFBQTtZQUNBLE1BQUEsUUFBQTs7S0FFQTs7QUNaQSxDQUFBLFdBQUE7O0lBRUEsUUFBQSxPQUFBLGNBQUEsV0FBQSx1QkFBQSxDQUFBLFVBQUEsWUFBQSxRQUFBLFNBQUE7O0lBRUEsU0FBQSxvQkFBQSxRQUFBLFVBQUEsTUFBQSxPQUFBOztRQUVBLE9BQUEsT0FBQTtRQUNBLE9BQUEsS0FBQSxPQUFBLEtBQUEsTUFBQTtRQUNBLE9BQUEsS0FBQSxVQUFBLEtBQUEsTUFBQTs7Ozs7UUFLQSxTQUFBLEtBQUEsU0FBQSxLQUFBLG9CQUFBLFVBQUEsT0FBQTs7WUFFQSxHQUFBLE1BQUEsVUFBQSxJQUFBO2dCQUNBLFNBQUEsTUFBQTtnQkFDQSxPQUFBLE1BQUE7Z0JBQ0EsT0FBQTs7OztRQUlBLE9BQUEsUUFBQSxVQUFBLFFBQUE7O1lBRUEsTUFBQSxRQUFBOztLQUVBOztBQzFCQSxDQUFBLFdBQUE7O0lBRUEsUUFBQSxPQUFBLGNBQUEsV0FBQSxzQkFBQSxDQUFBLFVBQUEsWUFBQSxTQUFBOztJQUVBLFNBQUEsbUJBQUEsUUFBQSxVQUFBLE9BQUE7O1FBRUEsT0FBQSxPQUFBO1lBQ0EsTUFBQTtZQUNBLGFBQUE7Ozs7OztRQU1BLFNBQUEsS0FBQSxTQUFBLEtBQUEsb0JBQUEsVUFBQSxPQUFBOztZQUVBLEdBQUEsTUFBQSxVQUFBLElBQUE7Z0JBQ0EsU0FBQSxNQUFBO2dCQUNBLE9BQUEsTUFBQTtnQkFDQSxPQUFBOzs7O1FBSUEsT0FBQSxRQUFBLFVBQUEsUUFBQTs7WUFFQSxNQUFBLFFBQUE7Ozs7S0FJQTtLQUNBIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogVGhpcyBjb25maWcgaXMgaW50ZW5kZWQgdG8gYmUgaW5qZWN0ZWQgaW4geW91ciBzcmNcbiAqL1xuYW5ndWxhci5tb2R1bGUoXCJhcHAuY29uZmlnXCIsIFtdKVxuICAgIC5jb25zdGFudChcImNvbmZpZ1wiLCB7XG4gICAgICAgIFwiYXBpXCI6IFwiaHR0cDovL2xvY2FsaG9zdDo4MDAxL2FwaS92MVwiLCBcbiAgICAgICAgXCJkZWJ1Z1wiOiB0cnVlLFxuICAgICAgICBcIlNSQ19GT0xERVJcIjogJy9zcmMvYXBwX21vZHVsZXMvJyxcbiAgICAgICAgXCJJTUdfRk9MREVSXCI6ICcvaW1nLycsXG4gICAgICAgIFwiUFJPRklMRV9JTUdfRk9MREVSXCI6ICcvaW1nL3Byb2ZpbGUvJ1xuICAgIH0pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcC5jYXJkcycsIFtdKTtcblxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5hbmd1bGFyLm1vZHVsZSgnYXBwJywgWyduZycsICduZ0Nvb2tpZXMnLCAnbmdSb3V0ZScsICdhcHAuY29uZmlnJywgJ2FwcC5ob21lJywgJ2FuZ3VsYXJNb2RhbFNlcnZpY2UnLCAncGFzY2FscHJlY2h0LnRyYW5zbGF0ZScsICdhbmd1bGFyLWdyb3dsJ10pO1xuICBcbi8qKlxuICogUmVzdCBvZiB0aGUgZ2xvYmFsIGNvbmZpZyBjYW4gYmUgZm91bmQgaW4gYXBwLWNvbmZpZyBtb2R1bGVcbiAqLyAgXG5hbmd1bGFyLm1vZHVsZSgnYXBwJykuY29uZmlnKFsnJGh0dHBQcm92aWRlcicsICckbG9nUHJvdmlkZXInLCAnJHRyYW5zbGF0ZVByb3ZpZGVyJywgJ2dyb3dsUHJvdmlkZXInLCAnY29uZmlnJywgXG4gICAgZnVuY3Rpb24gKCRodHRwUHJvdmlkZXIsICRsb2dQcm92aWRlciwgJHRyYW5zbGF0ZVByb3ZpZGVyLCBncm93bFByb3ZpZGVyLCBjb25maWcpIHtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBamF4IGNhbGxzXG4gICAgICAgICAqLyBcbiAgICAgICAgJGh0dHBQcm92aWRlci5kZWZhdWx0cy5oZWFkZXJzLmNvbW1vbiA9IHsgXG4gICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uO29kYXRhPXZlcmJvc2UnLFxuICAgICAgICAgICAgJ1gtTG9naW4tQWpheC1jYWxsJzogJ3RydWUnLFxuICAgICAgICAgICAgJ1gtUmVxdWVzdGVkLVdpdGgnOiBcIlhNTEh0dHBSZXF1ZXN0XCIsXG4gICAgICAgICAgICAnWC1DU1JGLVRPS0VOJzogTGFyYXZlbC5jc3JmVG9rZW5cbiAgICAgICAgICB9O1xuICAgICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogR3Jvd2wgbWVzc2FnZXNcbiAgICAgICAgICovXG4gICAgICAgIGdyb3dsUHJvdmlkZXIub25seVVuaXF1ZU1lc3NhZ2VzKGZhbHNlKTtcbiAgICAgICAgZ3Jvd2xQcm92aWRlci5nbG9iYWxSZXZlcnNlZE9yZGVyKHRydWUpO1xuICAgICAgICBncm93bFByb3ZpZGVyLmdsb2JhbFRpbWVUb0xpdmUoe3N1Y2Nlc3M6IDEwMDAsIGVycm9yOiAxMTIwMDAsIHdhcm5pbmc6IDMwMDAsIGluZm86IDQwMDB9KTtcbiAgICAgICAgZ3Jvd2xQcm92aWRlci5nbG9iYWxEaXNhYmxlQ291bnREb3duKHRydWUpO1xuICAgICAgICBncm93bFByb3ZpZGVyLmdsb2JhbERpc2FibGVJY29ucyh0cnVlKTtcbiAgICAgICAgZ3Jvd2xQcm92aWRlci5nbG9iYWxQb3NpdGlvbignYm90dG9tLWxlZnQnKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogRGVidWdnaW5nXG4gICAgICAgICAqLyBcbiAgICAgICAgJGxvZ1Byb3ZpZGVyLmRlYnVnRW5hYmxlZChjb25maWcuZGVidWcpO1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRyYW5zbGF0aW9uc1xuICAgICAgICAgKi8gICAgIFxuICAgICAgICAkdHJhbnNsYXRlUHJvdmlkZXIudXNlU3RhdGljRmlsZXNMb2FkZXIoe1xuICAgICAgICAgICAgcHJlZml4OiAnL2kxOG4vbG9jYWxlLScsXG4gICAgICAgICAgICBzdWZmaXg6ICcuanNvbidcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJHRyYW5zbGF0ZVByb3ZpZGVyLnVzZUxvY2FsU3RvcmFnZSgpO1xuICAgICAgICAkdHJhbnNsYXRlUHJvdmlkZXIucHJlZmVycmVkTGFuZ3VhZ2UoJ2VuX1VTJyk7XG4gICAgICAgICR0cmFuc2xhdGVQcm92aWRlci5mYWxsYmFja0xhbmd1YWdlKCdlbl9VUycpO1xuICAgICAgICAkdHJhbnNsYXRlUHJvdmlkZXIudXNlU2FuaXRpemVWYWx1ZVN0cmF0ZWd5KCdlc2NhcGUnKTtcbn1dKTtcbiBcbmFuZ3VsYXIubW9kdWxlKCdhcHAnKS5ydW4oW2Z1bmN0aW9uICgpIHtcbiBcbn1dKTtcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAuaG9tZScsIFsnbmdSb3V0ZScsICdhcHAuY29uZmlnJywgJ25nQW5pbWF0ZScsICdhcHAuY2FyZHMnLCAnYXBwLnN0YWNrcycsICdhcHAudGFncycsICdoYy5tYXJrZWQnLCAnbmdTYW5pdGl6ZSddKTtcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAuc3RhY2tzJywgWyduZ1Jlc291cmNlJ10pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcC50YWdzJywgWyduZ1Jlc291cmNlJ10pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcC5jYXJkcycpLmNvbmZpZyhmdW5jdGlvbigkcm91dGVQcm92aWRlcikge1xuICAgXG59KTsiLCIoZnVuY3Rpb24gKCkge1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAnKS5jb25maWcoWyckcm91dGVQcm92aWRlcicsICdjb25maWcnLCBmdW5jdGlvbigkcm91dGVQcm92aWRlciwgY29uZmlnKSB7XG5cbiAgICAgICRyb3V0ZVByb3ZpZGVyXG4gICAgICAgIC53aGVuKCcvJywge1xuICAgICAgICAgICAgdGVtcGxhdGVVcmw6IGNvbmZpZy5TUkNfRk9MREVSICsgJ2hvbWUvdGVtcGxhdGVzL2hvbWUtdGVtcGxhdGUuaHRtbCcsXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnSG9tZUNvbnRyb2xsZXInLFxuICAgICAgICAgICAgY29udHJvbGxlckFzOiAnaG9tZSdcbiAgICAgICAgfSlcblxuICAgICAgICAub3RoZXJ3aXNlKHtyZWRpcmVjdFRvOiAnLyd9KTsgXG4gICAgfV0pO1xufSkoKTsiLCJhbmd1bGFyLm1vZHVsZSgnYXBwLmhvbWUnKS5jb25maWcoZnVuY3Rpb24oJHJvdXRlUHJvdmlkZXIpIHtcblxufSk7IiwiXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XG5cbiAgICAvLyBzd2l0Y2ggZm9ybXNcbiAgICAkKCcubWVzc2FnZSBhJykuY2xpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICBcbiAgICAgICAgJCgnZm9ybScpLmFuaW1hdGUoe2hlaWdodDogXCJ0b2dnbGVcIiwgb3BhY2l0eTogXCJ0b2dnbGVcIn0sIFwic2xvd1wiKTtcbiAgICAgICAgXG4gICAgICAgIGlmKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSA9PSAnL2xvZ2luJykge1xuICAgICAgICAgICAgaGlzdG9yeS5wdXNoU3RhdGUoe30sIFwiUmVnaXN0ZXJcIiwgXCIvcmVnaXN0ZXJcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBoaXN0b3J5LnB1c2hTdGF0ZSh7fSwgXCJMb2dpblwiLCBcIi9sb2dpblwiKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgJCgnZm9ybSAuaGVscC1ibG9jaycpLmhpZGUoKTtcbiAgICB9KTtcblxufSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcC5zdGFja3MnKS5jb25maWcoZnVuY3Rpb24oJHJvdXRlUHJvdmlkZXIpIHtcblxufSk7IiwiKGZ1bmN0aW9uICgpIHtcblxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuY2FyZHMnKS5kaXJlY3RpdmUoJ2NhcmQnLFxuICAgICAgICBbJ2NvbmZpZycsIGZ1bmN0aW9uIChjb25maWcpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IGNvbmZpZy5TUkNfRk9MREVSICsgJ2NhcmRzL3RlbXBsYXRlcy9jYXJkLmh0bWwnLFxuICAgICAgICAgICAgICAgIHJlc3RyaWN0OiAnQScsXG4gICAgICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgICAgICAgICBjYXJkOiBcIj1kYXRhXCJcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJyRyb290U2NvcGUnLCAnJGxvZycsICdjb25maWcnLCAnZ3Jvd2wnLCAnY2FyZHNGYWN0b3J5JywgJ01vZGFsU2VydmljZScsXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgkc2NvcGUsICRyb290U2NvcGUsICRsb2csIGNvbmZpZywgZ3Jvd2wsIGNhcmRzRmFjdG9yeSwgTW9kYWxTZXJ2aWNlKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5ldmVudHMgPSB7fTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBEaXNwbGF5IG9ubHkgWCB0YWdzXG4gICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5tYXhfbnVtX3RhZ3MgPSAzO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIFBpbiBDYXJkIChtYWtlIGl0ICdzdGlja3knKVxuICAgICAgICAgICAgICAgICAgICAgICAgICogXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBAcGFyYW0gQ2FyZCBpdGVtXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBAcmV0dXJucyB2b2lkXG4gICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5ldmVudHMucGluQ2FyZCA9IGZ1bmN0aW9uIChpdGVtKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgY2FyZCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGl0ZW0uaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0aWNreTogIWl0ZW0uc3RpY2t5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYWpheCBjYWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FyZHNGYWN0b3J5LnVwZGF0ZShjYXJkKS4kcHJvbWlzZS50aGVuKGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBlbW1pdCBldmVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ3Bpbi1jYXJkJywgaXRlbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkbG9nLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3dsLmVycm9yKFwiVXBzLCBmYWlsZWQuIFNvcnJ5LlwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICogRGVsZXRlIENhcmRcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIFxuICAgICAgICAgICAgICAgICAgICAgICAgICogQHBhcmFtIENhcmQgaXRlbVxuICAgICAgICAgICAgICAgICAgICAgICAgICogQHJldHVybnMgdm9pZFxuICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXZlbnRzLmRlbGV0ZSA9IGZ1bmN0aW9uIChpdGVtKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBKdXN0IHByb3ZpZGUgYSB0ZW1wbGF0ZSB1cmwsIGEgY29udHJvbGxlciBhbmQgY2FsbCAnc2hvd01vZGFsJy5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBNb2RhbFNlcnZpY2Uuc2hvd01vZGFsKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IGNvbmZpZy5TUkNfRk9MREVSICsgXCJjb21tb24vdGVtcGxhdGVzL21vZGFscy9jb25maXJtLmh0bWxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogXCJZZXNOb0NvbnRyb2xsZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXRzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3RpdGxlJzogJ0RlbGV0ZSBjYXJkPycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2NvbnRlbnQnOiBcIllvdSdsbCBub3QgYmUgYWJsZSB0byByZWNvdmVyIGl0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKG1vZGFsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFsLmVsZW1lbnQubW9kYWwoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWwuY2xvc2UudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQpIHsgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYWpheCBjYWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FyZHNGYWN0b3J5LmRlbGV0ZSh7aWQ6IGl0ZW0uaWR9KS4kcHJvbWlzZS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGVtbWl0IGV2ZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnZGVsZXRlLWNhcmQnLCBpdGVtKTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJGxvZy5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncm93bC5lcnJvcihcIlVwcywgZmFpbGVkIGRlbGV0aW5nIGl0LlwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRsb2cuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3Jvd2wuZXJyb3IoXCJVcHMsIGZhaWxlZCBvcGVuaW5nIGRpYWxvZy5cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIEVkaXQgQ2FyZFxuICAgICAgICAgICAgICAgICAgICAgICAgICogXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBAcGFyYW0gQ2FyZCBpdGVtXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBAcmV0dXJucyB2b2lkXG4gICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5ldmVudHMuZWRpdCA9IGZ1bmN0aW9uIChpdGVtKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBNb2RhbFNlcnZpY2Uuc2hvd01vZGFsKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IGNvbmZpZy5TUkNfRk9MREVSICsgXCJjYXJkcy90ZW1wbGF0ZXMvbW9kYWxzL2VkaXQtY2FyZC5odG1sXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IFwiRWRpdENhcmRDb250cm9sbGVyXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0czoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhcmQ6IGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKG1vZGFsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFsLmVsZW1lbnQubW9kYWwoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWwuY2xvc2UudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBwcmVwYXJlIGRhdGEgdG8gYmUgc2VuZCB0byBzZXJ2ZXIgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNhcmQgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBpdGVtLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBtb2RhbC5zY29wZS5mb3JtLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IG1vZGFsLnNjb3BlLmZvcm0uY29udGVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFqYXggY2FsbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhcmRzRmFjdG9yeS51cGRhdGUoY2FyZCkuJHByb21pc2UudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBlbW1pdCBldmVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ3VwZGF0ZS1jYXJkJywgaXRlbSwgY2FyZCk7ICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRsb2cuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3Jvd2wuZXJyb3IoXCJVcHMsIGZhaWxlZCBzYXZpbmcgY2hhbmdlcy5cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkbG9nLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3dsLmVycm9yKFwiVXBzLCBmYWlsZWQgb3BlbmluZyBmb3JtLlwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICogVmlldyBjb250ZW50IGluIG1vZGFsYm94IHdpdGggTWFya2Rvd24gKHJpY2ggdGV4dCBtb2RlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICogXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBAcGFyYW0gQ2FyZCBpdGVtXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBAcmV0dXJucyB2b2lkXG4gICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5ldmVudHMudmlld0FzTWFya2Rvd25Nb2RhbCA9IGZ1bmN0aW9uIChpdGVtKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBKdXN0IHByb3ZpZGUgYSB0ZW1wbGF0ZSB1cmwsIGEgY29udHJvbGxlciBhbmQgY2FsbCAnc2hvd01vZGFsJy5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBNb2RhbFNlcnZpY2Uuc2hvd01vZGFsKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IGNvbmZpZy5TUkNfRk9MREVSICsgXCJob21lL3RlbXBsYXRlcy9tb2RhbHMvbWFya2Rvd24uaHRtbFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBcIk1hcmtkb3duQ29udHJvbGxlclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnB1dHM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnY2FyZCc6IGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKG1vZGFsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFsLmVsZW1lbnQubW9kYWwoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJGxvZy5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncm93bC5lcnJvcihcIlVwcywgZmFpbGVkIG9wZW5pbmcgdmlldy5cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1dXG4gICAgICAgIH07XG4gICAgfV0pO1xufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5jYXJkcycpLmRpcmVjdGl2ZSgnbmV3Q2FyZEZvcm0nLFxuICAgICAgICBbJ2NvbmZpZycsIGZ1bmN0aW9uIChjb25maWcpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgICAgICAgICBjYXJkOiBcIj1cIlxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogY29uZmlnLlNSQ19GT0xERVIgKyAnY2FyZHMvdGVtcGxhdGVzL25ldy1mb3JtLmh0bWwnLFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJyRyb290U2NvcGUnLCAnJGxvZycsICdncm93bCcsICdjYXJkc0ZhY3RvcnknLCBmdW5jdGlvbiAoJHNjb3BlLCAkcm9vdFNjb3BlLCAkbG9nLCBncm93bCwgY2FyZHNGYWN0b3J5KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmV2ZW50cyA9IHt9O1xuXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBTdWJtaXQgZm9ybVxuICAgICAgICAgICAgICAgICAgICAgKiBAcmV0dXJucyB2b2lkXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXZlbnRzLmNyZWF0ZUNhcmQgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgkc2NvcGUuY29udGVudCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGRhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICRzY29wZS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiAkc2NvcGUuY29udGVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXJkc0ZhY3Rvcnkuc2F2ZShkYXRhKS4kcHJvbWlzZS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNsYXNzID0gJ2hpZ2hsaWdodGVkJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5pZCA9IHJlc3BvbnNlLmlkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ25ldy1jYXJkJywgZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRsb2cuZXJyb3IocmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncm93bC5lcnJvcihcIlVwcywgZmFpbGVkIHNhdmluZy4gU29ycnkuXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuY29udGVudCA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF19XG4gICAgICAgIH1dKTtcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmNhcmRzJykuZGlyZWN0aXZlKCdvcmRlckJ5JywgWydjb25maWcnLFxuICAgICAgICBmdW5jdGlvbiAoY29uZmlnKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcmVzdHJpY3Q6ICdFQScsXG4gICAgICAgICAgICAgICAgc2NvcGU6IHRydWUsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IGNvbmZpZy5TUkNfRk9MREVSICsgJy9jYXJkcy90ZW1wbGF0ZXMvb3JkZXItYnkuaHRtbCcsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogWyckc2NvcGUnLCAnJHJvb3RTY29wZScsIGZ1bmN0aW9uICgkc2NvcGUsICRyb290U2NvcGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5ldmVudHMgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGxldCBvcmRlciA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ29yZGVyJykpO1xuICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy8gaW5pdGlhbCBwb3NpdGlvblxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUub3JkZXIgPSBvcmRlciAmJiAhYW5ndWxhci5pc1VuZGVmaW5lZChvcmRlci5vcmRlcikgPyBvcmRlci5vcmRlciA6ICd1cGRhdGVkX2F0JztcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRpcmVjdGlvbiA9IG9yZGVyICYmICFhbmd1bGFyLmlzVW5kZWZpbmVkKG9yZGVyLmRpcmVjdGlvbikgPyBvcmRlci5kaXJlY3Rpb24gOiAnZGVzYyc7XG5cbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmV2ZW50cy51cGRhdGUgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGRhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JkZXI6ICRzY29wZS5vcmRlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXJlY3Rpb246ICRzY29wZS5kaXJlY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcGVyc2lzdFxuICAgICAgICAgICAgICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ29yZGVyJywgSlNPTi5zdHJpbmdpZnkoZGF0YSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ29yZGVyLWNoYW5nZWQnLCBkYXRhKTsgLy8gZW1taXRcbiAgICAgICAgICAgICAgICAgICAgfSAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH1dXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgXSk7XG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmRpcmVjdGl2ZSgncGFnaW5hdGVDYXJkcycsIFsnY29uZmlnJyxcbiAgICAgICAgZnVuY3Rpb24gKGNvbmZpZykge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHJlc3RyaWN0OiAnRUEnLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBjb25maWcuU1JDX0ZPTERFUiArICcvY2FyZHMvdGVtcGxhdGVzL3BhZ2luYXRlLWNhcmRzLmh0bWwnLFxuICAgICAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgICAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogJz0nXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBbJyRzY29wZScsICckcm9vdFNjb3BlJywgZnVuY3Rpb24gKCRzY29wZSwgJHJvb3RTY29wZSkge1xuICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5jb250ZXh0ID0ge307XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5ldmVudHMgPSB7fTtcbiAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogRHJhdyB3aWRnZXQgd2hlbiBkYXRhIGlzIGF2YWlsYWJsZVxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRvbignY2FyZHMtbG9hZGVkJywgZnVuY3Rpb24oZXZ0LCBkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuY29udGV4dC5wYWdlcyA9IGRhdGE7IFxuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmNvbnRleHQuZGlzcGxheSA9IGRhdGEuZGF0YS5sZW5ndGggJiYgKGRhdGEucHJldl9wYWdlX3VybCAhPT0gbnVsbCB8fCBkYXRhLm5leHRfcGFnZV91cmwgIT09IG51bGwpO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBCcm9hZGNhc3QgY2hhbmdlc1xuICAgICAgICAgICAgICAgICAgICAgKiBAcmV0dXJucyB2b2lkXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXZlbnRzLm5hdmlnYXRlID0gZnVuY3Rpb24gKCRldmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAkZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICRldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdGFyZ2V0ID0gJGV2ZW50LmN1cnJlbnRUYXJnZXQ7XG4gICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHR5cGVvZih0YXJnZXQuYXR0cmlidXRlc1snZGlzYWJsZWQnXSkgPT09ICd1bmRlZmluZWQnIHx8ICF0YXJnZXQuYXR0cmlidXRlc1snZGlzYWJsZWQnXS52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnY2FyZHMtcGFnZS1jaGFuZ2VkJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWdlOiB0YXJnZXQuYXR0cmlidXRlc1snZGF0YS1wYWdlJ10udmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTsgLy8gZW1taXRcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1dXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgXSk7XG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmNhcmRzJykuZmFjdG9yeSgnY2FyZHNGYWN0b3J5JywgWyckcmVzb3VyY2UnLCAnY29uZmlnJywgZnVuY3Rpb24oJHJlc291cmNlLCBjb25maWcpIHtcblxuICAgICAgICByZXR1cm4gJHJlc291cmNlKGNvbmZpZy5hcGkgKyAnL2NhcmRzLzppZCcsIFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGlkOiAnQGlkJyxcbiAgICAgICAgICAgICAgICBwYWdlOiAnQHBhZ2UnXG4gICAgICAgICAgICB9LCBcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBxdWVyeToge1xuICAgICAgICAgICAgICAgICAgICB1cmw6IGNvbmZpZy5hcGkgKyAnL2NhcmRzL3RhZ3MvYWxsJyxcbiAgICAgICAgICAgICAgICAgICAgaXNBcnJheTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybVJlc3BvbnNlOiBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhbmd1bGFyLmZyb21Kc29uKHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdXBkYXRlOiB7XG4gICAgICAgICAgICAgICAgICBtZXRob2Q6ICdQVVQnIFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pOyBcbiAgICB9XSk7XG59KSgpO1xuXG4iLCIoZnVuY3Rpb24gKCkge1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmNvbnRyb2xsZXIoJ0hlYWRlckNvbnRyb2xsZXInLCBbJyRzY29wZScsIEhlYWRlckNvbnRyb2xsZXJdKTtcblxuICAgIGZ1bmN0aW9uIEhlYWRlckNvbnRyb2xsZXIoJHNjb3BlKSB7XG4gICAgICAgIFxuICAgIH1cbn0pKCk7XG5cblxuIiwiKGZ1bmN0aW9uICgpIHtcblxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAnKS5jb250cm9sbGVyKCdMYXlvdXRDb250cm9sbGVyJywgWyckc2NvcGUnLCAnJHNjZScsIExheW91dENvbnRyb2xsZXJdKTtcblxuICAgIGZ1bmN0aW9uIExheW91dENvbnRyb2xsZXIoJHNjb3BlLCAkc2NlKSB7XG5cbiAgICAgICAgJHNjb3BlLnRhZ1VzZXJDbGljayA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHZhciB0YWdUZXh0ID0gZS50YXJnZXQuaW5uZXJUZXh0O1xuICAgICAgICAgICAgYWxlcnQoJ3RhZ1VzZXJDbGljaywgdGFnVGV4dDogJyArIHRhZ1RleHQpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgJHNjb3BlLnRhZ1Rlcm1DbGljayA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHZhciB0YWdUZXh0ID0gZS50YXJnZXQuaW5uZXJUZXh0O1xuICAgICAgICAgICAgYWxlcnQoJ3RhZ1Rlcm1DbGljaywgdGFnVGV4dDogJyArIHRhZ1RleHQpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLy8gWW91IGNvdWxkIGRlZmluZSAndGFnVXNlckNsaWNrJyBhbmQgJ3RhZ1Rlcm1DbGljaydcbiAgICAgICAgLy8gb24gdGhlICckcm9vdFNjb3BlJy4gVGhpcyB3YXkgeW91IGNhbiBoYW5kbGUgd2hhdGV2ZXJcbiAgICAgICAgLy8gbG9naWMgeW91IHdhbnQgZm9yIGhhc2h0YWdzIGluIG9uZSBwbGFjZSByYXRoZXIgdGhhblxuICAgICAgICAvLyBoYXZpbmcgdG8gZGVmaW5lIGl0IGluIGVhY2ggY29udHJvbGxlci5cbiAgICAgICAgXG4gICAgICAgICRzY29wZS50cnVzdEh0bWwgPSBmdW5jdGlvbihodG1sKSB7XG4gICAgICAgICAgICAvLyBTYW5pdGl6ZSBtYW51YWxseSBpZiBuZWNlc3NhcnkuIEl0J3MgbGlrZWx5IHRoaXNcbiAgICAgICAgICAgIC8vIGh0bWwgaGFzIGFscmVhZHkgYmVlbiBzYW5pdGl6ZWQgc2VydmVyIHNpZGVcbiAgICAgICAgICAgIC8vIGJlZm9yZSBpdCB3ZW50IGludG8geW91ciBkYXRhYmFzZS5cbiAgICAgICAgICAgIC8vIERvbid0IGhvbGQgbWUgbGlhYmxlIGZvciBYU1MuLi4gbmV2ZXIgYXNzdW1lIDp+KVxuICAgICAgICAgICAgcmV0dXJuICRzY2UudHJ1c3RBc0h0bWwoaHRtbCk7XG4gICAgICAgIH07XG4gICAgfVxufSkoKTtcblxuXG4iLCIoZnVuY3Rpb24gKCkge1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAnKS5kaXJlY3RpdmUoJ2F1dG9mb2N1cycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnQScsXG4gICAgICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50WzBdLmZvY3VzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSk7XG59KSgpO1xuXG4gICAgICIsIihmdW5jdGlvbiAoKSB7XG4gICAgLy8gQmVjYXVzZSBvZiB0aGUgYW5tZSBhbmQgRSB0eXBlLCB3b3JrcyBhdXRvbWF0aWNhbGx5IGZvciBldmVyeSB0ZXh0YXJlYVxuICAgIC8vIHJlZjogaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vdGhvbXNlZGRvbi80NzAzOTY4XG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmRpcmVjdGl2ZSgnZWxhc3RpY0FyZWEnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByZXN0cmljdDogJ0EnLFxuICAgICAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRyaWJ1dGVzKSB7XG4gICAgICAgICAgICAgICAgdmFyIHRocmVzaG9sZCA9IDM1LFxuICAgICAgICAgICAgICAgICAgICAgICAgbWluSGVpZ2h0ID0gZWxlbWVudFswXS5vZmZzZXRIZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nTGVmdCA9IGVsZW1lbnQuY3NzKCdwYWRkaW5nTGVmdCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZ1JpZ2h0ID0gZWxlbWVudC5jc3MoJ3BhZGRpbmdSaWdodCcpO1xuXG4gICAgICAgICAgICAgICAgdmFyICRzaGFkb3cgPSBhbmd1bGFyLmVsZW1lbnQoJzxkaXY+PC9kaXY+JykuY3NzKHtcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgICAgICAgICAgICAgICAgIHRvcDogLTEwMDAwLFxuICAgICAgICAgICAgICAgICAgICBsZWZ0OiAtMTAwMDAsXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiBlbGVtZW50WzBdLm9mZnNldFdpZHRoIC0gcGFyc2VJbnQocGFkZGluZ0xlZnQgfHwgMCkgLSBwYXJzZUludChwYWRkaW5nUmlnaHQgfHwgMCksXG4gICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiBlbGVtZW50LmNzcygnZm9udFNpemUnKSxcbiAgICAgICAgICAgICAgICAgICAgZm9udEZhbWlseTogZWxlbWVudC5jc3MoJ2ZvbnRGYW1pbHknKSxcbiAgICAgICAgICAgICAgICAgICAgbGluZUhlaWdodDogZWxlbWVudC5jc3MoJ2xpbmVIZWlnaHQnKSxcbiAgICAgICAgICAgICAgICAgICAgcmVzaXplOiAnbm9uZSdcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5ib2R5KS5hcHBlbmQoJHNoYWRvdyk7XG5cbiAgICAgICAgICAgICAgICB2YXIgdXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdGltZXMgPSBmdW5jdGlvbiAoc3RyaW5nLCBudW1iZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCByID0gJyc7IGkgPCBudW1iZXI7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHIgKz0gc3RyaW5nO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHI7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB2YXIgdmFsID0gZWxlbWVudC52YWwoKS5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLyYvZywgJyZhbXA7JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxuJC8sICc8YnIvPiZuYnNwOycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcbi9nLCAnPGJyLz4nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXHN7Mix9L2csIGZ1bmN0aW9uIChzcGFjZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGltZXMoJyZuYnNwOycsIHNwYWNlLmxlbmd0aCAtIDEpICsgJyAnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICRzaGFkb3cuaHRtbCh2YWwpO1xuXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuY3NzKCdoZWlnaHQnLCBNYXRoLm1heCgkc2hhZG93WzBdLm9mZnNldEhlaWdodCArIHRocmVzaG9sZCwgbWluSGVpZ2h0KSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgJHNoYWRvdy5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGVsZW1lbnQuYmluZCgna2V5dXAga2V5ZG93biBrZXlwcmVzcyBjaGFuZ2UnLCB1cGRhdGUpO1xuICAgICAgICAgICAgICAgIHVwZGF0ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG59KSgpOyIsIihmdW5jdGlvbiAoKSB7IFxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAnKS5kaXJlY3RpdmUoJ2hhc2h0YWdpZnknLCBbJyR0aW1lb3V0JywgJyRjb21waWxlJyxcbiAgICAgICAgZnVuY3Rpb24oJHRpbWVvdXQsICRjb21waWxlKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHJlc3RyaWN0OiAnQScsXG4gICAgICAgICAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgICAgICAgICAgdUNsaWNrOiAnJnVzZXJDbGljaycsXG4gICAgICAgICAgICAgICAgICAgIHRDbGljazogJyZ0ZXJtQ2xpY2snXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaHRtbCA9IGVsZW1lbnQuaHRtbCgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaHRtbCA9PT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhdHRycy51c2VyQ2xpY2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBodG1sID0gaHRtbC5yZXBsYWNlKC8ofFxccykqQChcXHcrKS9nLCAnJDE8YSBuZy1jbGljaz1cInVDbGljayh7JGV2ZW50OiAkZXZlbnR9KVwiIGNsYXNzPVwiaGFzaHRhZ1wiPkAkMjwvYT4nKTsgXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhdHRycy50ZXJtQ2xpY2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBodG1sID0gaHRtbC5yZXBsYWNlKC8oXnxcXHMpKiMoXFx3KykvZywgJyQxPGEgbmctY2xpY2s9XCJ0Q2xpY2soeyRldmVudDogJGV2ZW50fSlcIiBjbGFzcz1cImhhc2h0YWdcIj4jJDI8L2E+Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuaHRtbChodG1sKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgJGNvbXBpbGUoZWxlbWVudC5jb250ZW50cygpKShzY29wZSk7XG4gICAgICAgICAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICBdKTtcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwJykuZGlyZWN0aXZlKCdzZXNzaW9uRHJvcGRvd24nLCBbJ2NvbmZpZycsXG4gICAgICAgIGZ1bmN0aW9uIChjb25maWcpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICByZXN0cmljdDogJ0VBJyxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogY29uZmlnLlNSQ19GT0xERVIgKyAnL2NvbW1vbi90ZW1wbGF0ZXMvc2Vzc2lvbi1kcm9wZG93bi5odG1sJywgICBcbiAgICAgICAgICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiBcIj1cIlxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnRzLCBhdHRycykge1xuICAgICAgICAgICAgICAgICAgICBzY29wZS5pbWdfZm9sZGVyID0gY29uZmlnLlBST0ZJTEVfSU1HX0ZPTERFUjtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgZnVuY3Rpb24gKCRzY29wZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS51c2VyID0gJHNjb3BlLmRhdGE7XG4gICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICBdKTsgICAgICAgXG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XG5cbiAgICAvKipcbiAgICAgKiBZb3UgbWF5IHBhc3MgYW55IG9mIHRoZXNlIHZhbHVlOlxuICAgICAqIGNvbnRyb2w6IHtcbiAgICAgKiAgIGV4cGFuZGVkOiBib29sZWFuLFxuICAgICAqICAgZXhwYW5kYWJsZTogYm9vbGVhbixcbiAgICAgKiAgIHRvZ2dsZTogZm4gICAgICAgICAvLyBhY3R1YWxseSwgdGhpcyBpcyBoZXJlIHRvIGJlIGNhbGxlZCBmcm9tIHRoZSBvdXRzaWRlLCBub3Qgb3ZlcnJpZGVuLlxuICAgICAqICAgaGlkZUFycm93OiBib29sZWFuIC8vIGhpZGUgb3JpZ2luYWwgYXJyb3dzP1xuICAgICAqIH0sXG4gICAgICogc2hvd01vcmVIZWlnaHQ6IC4uLnB4XG4gICAgICovXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmRpcmVjdGl2ZSgnc2hvd01vcmUnLFxuICAgICAgICBbJ2NvbmZpZycsIGZ1bmN0aW9uIChjb25maWcpIHtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogY29uZmlnLlNSQ19GT0xERVIgKyAnY29tbW9uL3RlbXBsYXRlcy9zaG93TW9yZS5odG1sJyxcbiAgICAgICAgICAgICAgICByZXN0cmljdDogJ0EnLFxuICAgICAgICAgICAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgICAgICAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgICAgICAgICAgJ2NvbnRyb2wnOiAnPScsXG4gICAgICAgICAgICAgICAgICAgICdzaG93TW9yZUhlaWdodCc6ICdAJ1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vIGFjY2Vzc2libGUgZnJvbSB0aGUgb3V0c2lkZVxuICAgICAgICAgICAgICAgICAgICBzY29wZS5wdWJsaWMgPSBzY29wZS5jb250cm9sIHx8IHt9OyBcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vIGlmIHBvc3NpYmxlLCBzZXQgdmFsdWUgZnJvbSB0aGUgb3V0c2lkZS4gXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLnB1YmxpYy5leHBhbmRlZCA9IHNjb3BlLnB1YmxpYy5leHBhbmRlZCB8fCBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vIFVzZWZ1bCB3aGVuIHlvdSBjYW5ub3QgbWVhc3VyZSB0aGUgaGVpZ2h0IG9mIGVsZW1lbnQgYXQgZmlyc3QuIERlY2lkZSB0aGlzIG91dHNpZGUuXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLnB1YmxpYy5leHBhbmRhYmxlID0gc2NvcGUucHVibGljLmV4cGFuZGFibGUgfHwgaXNFeHBhbmRhYmxlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvLyBVc2VmdWwgd2hlbiB5b3UgY2Fubm90IG1lYXN1cmUgdGhlIGhlaWdodCBvZiBlbGVtZW50IGF0IGZpcnN0LiBEZWNpZGUgdGhpcyBvdXRzaWRlLlxuICAgICAgICAgICAgICAgICAgICBzY29wZS5wdWJsaWMuaGlkZUFycm93ID0gc2NvcGUucHVibGljLmhpZGVBcnJvdyB8fCBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFB1YmxpYyBtZXRob2RzXG4gICAgICAgICAgICAgICAgICAgICAqLyAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLnB1YmxpYy50b2dnbGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzY29wZS5wdWJsaWMuZXhwYW5kZWQgPSAhc2NvcGUucHVibGljLmV4cGFuZGVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzRXhwYW5kYWJsZSgpICYmIHNjb3BlLnB1YmxpYy5leHBhbmRlZCA9PT0gZmFsc2UpIHsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUucHVibGljLmV4cGFuZGFibGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFByaXZhdGUgbWV0aG9kc1xuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gaXNFeHBhbmRhYmxlKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQuaGVpZ2h0KCkgPj0gc2NvcGUuc2hvd01vcmVIZWlnaHQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vIGRpcmVjdGl2ZSBzdHlsZSBcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuc2hvd0xlc3NTdHlsZSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICdtYXgtaGVpZ2h0Jzogc2NvcGUuc2hvd01vcmVIZWlnaHQgKyAncHgnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ292ZXJmbG93JzogJ2hpZGRlbidcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XSk7XG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmRpcmVjdGl2ZSgnc3VibWl0T25LMTMnLCBbJ2NvbmZpZycsXG4gICAgICAgIGZ1bmN0aW9uIChjb25maWcpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcmVzdHJpY3Q6ICdBJyxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBbJyRzY29wZScsICckZWxlbWVudCcsIGZ1bmN0aW9uICgkc2NvcGUsICRlbGVtZW50KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIEtleSBldmVudCAoRW50ZXIpXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAkZWxlbWVudC5iaW5kKFwia2V5ZG93biBrZXlwcmVzc1wiLCBmdW5jdGlvbiAoZXZlbnQpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGV2ZW50LmN1cnJlbnRUYXJnZXR3aGljaCA9PT0gMTMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkZWxlbWVudC5jbG9zZXN0KCdmb3JtJykuc3VibWl0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIF0pO1xufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAnKVxuICAgICAgICAuZmlsdGVyKCdyZWR1Y2VCeScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChjb2xsZWN0aW9uLCBmaWVsZCkge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHJldHVybiBjb2xsZWN0aW9uLnJlZHVjZShmdW5jdGlvbihvdXRwdXQsIGN1cnJlbnQpe1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoIWZpZWxkRXhpc3RzKG91dHB1dCwgZmllbGQsIGN1cnJlbnRbZmllbGRdKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gb3V0cHV0LmNvbmNhdChjdXJyZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgICAgICAgICAgICAgICAgIH0sIFtdKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gZmllbGRFeGlzdHMoaGF5c3RhY2ssIGZpZWxkTmFtZSwgZmllbGRWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaGF5c3RhY2suc29tZShmdW5jdGlvbihlbCkge1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBlbFtmaWVsZE5hbWVdID09PSBmaWVsZFZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9KTsgXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTsgICAgICAgICAgICBcbiAgICAgICAgfSk7XG59KSgpO1xuXG4iLCIoZnVuY3Rpb24gKCkge1xuICAgIFxuICAgICBhbmd1bGFyLm1vZHVsZSgnYXBwJykuZmFjdG9yeSgncXVlcnlGYWN0b3J5JywgWyckbG9nJywgJyRyb290U2NvcGUnLCAnY2FyZHNGYWN0b3J5JywgJ3N0YWNrc0ZhY3RvcnknLCAndGFnc0ZhY3RvcnknLCBxdWVyeUZhY3RvcnldKTtcbiAgICBcbiAgICBmdW5jdGlvbiBxdWVyeUZhY3RvcnkoJGxvZywgJHJvb3RTY29wZSwgY2FyZHNGYWN0b3J5LCBzdGFja3NGYWN0b3J5LCB0YWdzRmFjdG9yeSkge1xuICAgICAgICBcbiAgICAgICAgdmFyIGZhY3RvcnkgPSB7fTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBnZXQgYWxsIGNhcmRzIGZyb20gc2VydmVyIGZvciBhIGdpdmVuIHVzZXJcbiAgICAgICAgICogXG4gICAgICAgICAqIEBwYXJhbSBqc29uIHBhcmFtc1xuICAgICAgICAgKiBAcmV0dXJucyBjYXJkc0ZhY3RvcnlcbiAgICAgICAgICogQGJyb2FkY2FzdCBjYXJkcyBsaXN0XG4gICAgICAgICAqL1xuICAgICAgICBmYWN0b3J5LmFsbCA9IGZ1bmN0aW9uIChwYXJhbXMpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcGFyYW1zID0gZ2V0RmlsdGVycyhwYXJhbXMsIFsnb3JkZXInLCAnc3RhY2snLCAndGFncyddKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gcXVlcnlcbiAgICAgICAgICAgIHJldHVybiBjYXJkc0ZhY3RvcnlcbiAgICAgICAgICAgICAgICAucXVlcnkocGFyYW1zLCBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGJyb2FkY2FzdChyZXNwb25zZSk7IC8vIHRlbGwgdGhlIHdvcmxkXG4gICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICRsb2cuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICB9KTsgIFxuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIGdldCBjYXJkcyB1c2luZyBzdGFjayBmaWx0ZXJzXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAcGFyYW0ganNvbiBwYXJhbXNcbiAgICAgICAgICogQHJldHVybnMgc3RhY2tzRmFjdG9yeVxuICAgICAgICAgKiBAYnJvYWRjYXN0IGNhcmRzIGxpc3RcbiAgICAgICAgICovXG4gICAgICAgIGZhY3RvcnkuYnlTdGFjayA9IGZ1bmN0aW9uIChwYXJhbXMpIHtcbiAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgcGFyYW1zID0gZ2V0RmlsdGVycyhwYXJhbXMsIFsnb3JkZXInLCAnc3RhY2snLCAndGFncyddKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiBzdGFja3NGYWN0b3J5LmZpbHRlcihwYXJhbXMsIGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgYnJvYWRjYXN0KHJlc3BvbnNlKTsgLy8gdGVsbCB0aGUgd29ybGRcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgICRsb2cuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogZ2V0IGNhcmRzIHVzaW5nIGN1cnJlbnQgZmlsdGVyc1xuICAgICAgICAgKiBcbiAgICAgICAgICogQHBhcmFtIGpzb24gcGFyYW1zXG4gICAgICAgICAqIEByZXR1cm5zIHN0YWNrc0ZhY3RvcnlcbiAgICAgICAgICogQGJyb2FkY2FzdCBjYXJkcyBsaXN0XG4gICAgICAgICAqL1xuICAgICAgICBmYWN0b3J5LmJ5VGFncyA9IGZ1bmN0aW9uIChwYXJhbXMpIHtcbiAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgcGFyYW1zID0gZ2V0RmlsdGVycyhwYXJhbXMsIFsnb3JkZXInLCAnc3RhY2snLCAndGFncyddKTtcbiAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIHRhZ3NGYWN0b3J5LmZpbHRlcihwYXJhbXMsIGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgYnJvYWRjYXN0KHJlc3BvbnNlKTsgLy8gdGVsbCB0aGUgd29ybGRcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgICRsb2cuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgICAgICAgIFxuICAgICAgICBmdW5jdGlvbiBnZXRGaWx0ZXJzKHBhcmFtcywgZmlsdGVycykge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZih0eXBlb2YocGFyYW1zKSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICBwYXJhbXMgPSB7fTtcbiAgICAgICAgICAgIH1cbiAgICAgIFxuICAgICAgICAgICAgaWYoZmlsdGVycy5pbmNsdWRlcygndGFncycpICYmIGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0YWdzW10nKSAhPSAnbnVsbCcpIHtcbiAgICAgICAgICAgICAgICBwYXJhbXNbJ3RhZ3NbXSddID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndGFnc1tdJykpLm1hcChmdW5jdGlvbih4KXsgcmV0dXJuIHguaWQ7IH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYoZmlsdGVycy5pbmNsdWRlcygnc3RhY2snKSAmJiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnc3RhY2snKSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHBhcmFtcy5zdGFjayA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3N0YWNrJykpLmlkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYoZmlsdGVycy5pbmNsdWRlcygnb3JkZXInKSAmJiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnb3JkZXInKSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHBhcmFtcy5vcmRlciA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ29yZGVyJykpOyAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiBwYXJhbXM7XG4gICAgICAgIH1cbiAgICAgICAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUZWxsIGV2ZXJ5Ym9keSB3ZSBoYXZlIGEgcmVub3ZhdGVkIGxpc3RcbiAgICAgICAgICovXG4gICAgICAgIGZ1bmN0aW9uIGJyb2FkY2FzdChkYXRhKSB7XG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ2NhcmRzLWxvYWRlZCcsIGRhdGEpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gZmFjdG9yeTtcbiAgICB9ICAgIFxufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5ob21lJykuY29udHJvbGxlcignSG9tZUNvbnRyb2xsZXInLCBbJyRzY29wZScsICdncm93bCcsIEhvbWVDb250cm9sbGVyXSk7XG5cbiAgICBmdW5jdGlvbiBIb21lQ29udHJvbGxlcigkc2NvcGUsIGdyb3dsKSB7XG4gICAgICAgIFxuICAgIH1cbn0pKCk7XG5cblxuIiwiKGZ1bmN0aW9uKCl7XG4gICAgXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5ob21lJykuY29udHJvbGxlcignTGlzdENvbnRyb2xsZXInLCBbJyRzY29wZScsICckbG9nJywgJ2dyb3dsJywgJ3F1ZXJ5RmFjdG9yeScsICdIb21lQ29udGV4dFNlcnZpY2UnLCBMaXN0Q29udHJvbGxlcl0pO1xuICAgIFxuICAgIGZ1bmN0aW9uIExpc3RDb250cm9sbGVyKCRzY29wZSwgJGxvZywgZ3Jvd2wsIHF1ZXJ5RmFjdG9yeSwgSG9tZUNvbnRleHRTZXJ2aWNlKXtcbiAgICAgICAgXG4gICAgICAgICRzY29wZS5ldmVudHMgPSB7fTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBXYXkgdG8ga2VlcCBzaWJsaW5ncyBjb25uZWN0ZWQgYW5kIHNoYXJpbmcgc2NvcGVcbiAgICAgICAgICovXG4gICAgICAgICRzY29wZS5jb250ZXh0ID0gSG9tZUNvbnRleHRTZXJ2aWNlLmNvbnRleHQ7XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogR2V0IGNhcmRzIGxpc3RcbiAgICAgICAgICovXG4gICAgICAgICRzY29wZS5ldmVudHMubG9hZCA9IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBnZXQgZGF0YSBmcm9tIHNlcnZlclxuICAgICAgICAgICAgcXVlcnlGYWN0b3J5XG4gICAgICAgICAgICAgICAgLmFsbChwYXJhbXMpLiRwcm9taXNlLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgICAgICAkbG9nLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgICAgIGdyb3dsLmVycm9yKFwiVXBzLCBmYWlsZWQgbG9hZGluZyBjYXJkcy5cIik7XG4gICAgICAgICAgICAgICAgfSk7ICBcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgICRzY29wZS5ldmVudHMubG9hZCgpOyAvLyBydW4gYXQgcGFnZSBsb2FkXG4gICAgICAgIFxuICAgICAgICAkc2NvcGUuJG9uKCdjYXJkcy1sb2FkZWQnLCBmdW5jdGlvbihldnQsIHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAkc2NvcGUuY29udGV4dC5jYXJkcyA9IHJlc3BvbnNlLmRhdGE7IC8vIGNhcmRzIGxpc3RcbiAgICAgICAgICAgICRzY29wZS5jb250ZXh0LnBhZ2VzID0gcmVzcG9uc2U7IC8vIHBhZ2VzIGRhdGEgICBcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogSGFuZGxlIGxpc3Qgb3JkZXJcbiAgICAgICAgICovXG4gICAgICAgICRzY29wZS4kb24oJ29yZGVyLWNoYW5nZWQnLCBmdW5jdGlvbihldnQsIHBhcmFtcykgeyAgIFxuICAgICAgICAgICAgJHNjb3BlLmV2ZW50cy5sb2FkKHtvcmRlcjogcGFyYW1zfSk7IC8vIHJlbG9hZCBjYXJkc1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBIYW5kbGUgcGFnaW5hdGlvblxuICAgICAgICAgKi9cbiAgICAgICAgJHNjb3BlLiRvbignY2FyZHMtcGFnZS1jaGFuZ2VkJywgZnVuY3Rpb24oZXZ0LCBwYXJhbXMpIHtcbiAgICAgICAgICAgICRzY29wZS5ldmVudHMubG9hZChwYXJhbXMpOyAvLyByZWxvYWQgY2FyZHNcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQ3JlYXRlIGNhcmRcbiAgICAgICAgICovXG4gICAgICAgICRzY29wZS4kb24oJ25ldy1jYXJkJywgZnVuY3Rpb24oZXZ0LCBpdGVtKSB7XG4gICAgICAgICAgICAkc2NvcGUuY29udGV4dC5jYXJkcy51bnNoaWZ0KGl0ZW0pO1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBQaW4gY2FyZFxuICAgICAgICAgKi9cbiAgICAgICAgJHNjb3BlLiRvbigncGluLWNhcmQnLCBmdW5jdGlvbihldnQsIGl0ZW0pIHtcbiAgICAgICAgICAgXG4gICAgICAgICAgICBpZihpdGVtLnN0aWNreSkge1xuICAgICAgICAgICAgICAgIC8vIG5vdCBzdGlja3kgYW55bW9yZVxuICAgICAgICAgICAgICAgIGl0ZW0uc3RpY2t5ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaXRlbS5jbGFzcyA9IGl0ZW0uY2xhc3MgPyBpdGVtLmNsYXNzLnJlcGxhY2UoXCJzdGlja3lcIiwgXCJcIikgOiBcIlwiO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBzdGlja3kuIFB1dCBpdCBmaXJzdFxuICAgICAgICAgICAgICAgIGl0ZW0uc3RpY2t5ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBpdGVtLmNsYXNzID0gaXRlbS5jbGFzcyA/IGl0ZW0uY2xhc3MgKyBcIiBzdGlja3lcIiA6IFwic3RpY2t5XCI7ICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGxldCBpbmRleCA9ICRzY29wZS5jb250ZXh0LmNhcmRzLmluZGV4T2YoaXRlbSk7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmNvbnRleHQuY2FyZHMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgICAgICAkc2NvcGUuY29udGV4dC5jYXJkcy51bnNoaWZ0KGl0ZW0pO1xuICAgICAgICAgICAgfSBcbiAgICAgICAgfSk7XG4gICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBEZWxldGUgY2FyZFxuICAgICAgICAgKi9cbiAgICAgICAgJHNjb3BlLiRvbignZGVsZXRlLWNhcmQnLCBmdW5jdGlvbihldnQsIGl0ZW0pIHtcbiAgICAgICAgICAgIGxldCBpbmRleCA9ICRzY29wZS5jb250ZXh0LmNhcmRzLmluZGV4T2YoaXRlbSk7XG4gICAgICAgICAgICAkc2NvcGUuY29udGV4dC5jYXJkcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBVcGRhdGUgY2FyZFxuICAgICAgICAgKi9cbiAgICAgICAgJHNjb3BlLiRvbigndXBkYXRlLWNhcmQnLCBmdW5jdGlvbihldnQsIG9yaWdpbmFsLCBuZXdDYXJkKSB7XG4gICAgICAgICAgICBsZXQgaW5kZXggPSAkc2NvcGUuY29udGV4dC5jYXJkcy5pbmRleE9mKG9yaWdpbmFsKTtcbiAgICAgICAgICAgIGFuZ3VsYXIuZXh0ZW5kKCRzY29wZS5jb250ZXh0LmNhcmRzW2luZGV4XSwgbmV3Q2FyZCk7XG4gICAgICAgIH0pO1xuICAgIH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCl7XG4gICAgXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5ob21lJykuY29udHJvbGxlcignU2VhcmNoQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJ0hvbWVDb250ZXh0U2VydmljZScsIFNlYXJjaENvbnRyb2xsZXJdKTtcbiAgICBcbiAgICBmdW5jdGlvbiBTZWFyY2hDb250cm9sbGVyKCRzY29wZSwgSG9tZUNvbnRleHRTZXJ2aWNlKXtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBXYXkgdG8ga2VlcCBzaWJsaW5ncyBjb25uZWN0ZWQgYW5kIHNoYXJpbmcgc2NvcGVcbiAgICAgICAgICovXG4gICAgICAgICRzY29wZS5jb250ZXh0ID0gSG9tZUNvbnRleHRTZXJ2aWNlLmNvbnRleHQ7XG4gICAgfVxufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuaG9tZScpXG4gICAgICAgIC5maWx0ZXIoJ2hpZ2hsaWdodFRleHQnLCBmdW5jdGlvbigkc2NlKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHRleHQsIHBocmFzZSkge1xuICAgICAgICAgICAgICAgIGxldCBoaWdobGlnaHRlZCA9IHBocmFzZVxuICAgICAgICAgICAgICAgICAgICAgICAgPyB0ZXh0LnJlcGxhY2UobmV3IFJlZ0V4cCgnKCcgKyBwaHJhc2UgKyAnKScsICdnaScpLCAnPHNwYW4gY2xhc3M9XCJoaWdobGlnaHQtdGV4dFwiPiQxPC9zcGFuPicpXG4gICAgICAgICAgICAgICAgICAgICAgICA6IHRleHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICByZXR1cm4gJHNjZS50cnVzdEFzSHRtbChoaWdobGlnaHRlZCk7XG4gICAgICAgICAgICB9OyAgICAgICAgICAgIFxuICAgICAgICB9KTtcbn0pKCk7XG5cbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAuaG9tZScpLnNlcnZpY2UoJ0hvbWVDb250ZXh0U2VydmljZScsIGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5jb250ZXh0ID0ge1xuICAgICAgICBjYXJkczogW10sXG4gICAgICAgIHF1ZXJ5OiAnJ1xuICAgIH07XG59KTsiLCIoZnVuY3Rpb24gKCkge1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuc3RhY2tzJykuZGlyZWN0aXZlKCdzdGFja0Rlc2NyaXB0aW9uJywgWydjb25maWcnLFxuICAgICAgICBmdW5jdGlvbiAoY29uZmlnKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHJlc3RyaWN0OiAnRUEnLFxuICAgICAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IGNvbmZpZy5TUkNfRk9MREVSICsgJ3N0YWNrcy90ZW1wbGF0ZXMvc3RhY2stZGVzY3JpcHRpb24uaHRtbCcsXG4gICAgICAgICAgICAgICAgc2NvcGU6IHRydWUsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogWyckc2NvcGUnLCAnJHJvb3RTY29wZScsICckbG9nJywgJyRlbGVtZW50JywgJ2dyb3dsJywgJ01vZGFsU2VydmljZScsICdzdGFja3NGYWN0b3J5JyxcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKCRzY29wZSwgJHJvb3RTY29wZSwgJGxvZywgJGVsZW1lbnQsIGdyb3dsLCBNb2RhbFNlcnZpY2UsIHN0YWNrc0ZhY3RvcnkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5ldmVudHMgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgKiBTaG93IG1vcmUgYmVoYXZpb3JcbiAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5zaG93TW9yZSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4cGFuZGVkOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhwYW5kYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGhpZGVBcnJvdzogdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICogRmlsdGVyIGJ5IHN0YWNrXG4gICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuJG9uKCdzdGFjay1zZWxlY3RlZCcsIGZ1bmN0aW9uKGV2dCwgc3RhY2spIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcHJvdmlkZSBpbmZvIHRvIHZpZXdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5jb250ZXh0LnN0YWNrID0gc3RhY2s7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJlZnJlc2ggYW5pbWF0aW9uICh3aGVuIGVsZW1lbnQgYWxyZWFkeSB2aXNpYmxlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgJGVsZW1lbnQuZmluZCgnLnN0YWNrLWRlc2NyaXB0aW9uJykuYWRkQ2xhc3MoJ2ZsaXBJblgnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgfSk7ICAgIFxuXG4gICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgKiBDbGVhciBzdGFjayBkZXNjcmlwdGlvbiBhbmltYXRpb24gY2xhc3Mgd2hlbiBmaW5pc2hlZFxuICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgJGVsZW1lbnQub24oJ3dlYmtpdEFuaW1hdGlvbkVuZCBtb3pBbmltYXRpb25FbmQgTVNBbmltYXRpb25FbmQgb2FuaW1hdGlvbmVuZCBhbmltYXRpb25lbmQnLCAnLnN0YWNrLWRlc2NyaXB0aW9uJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKFwiZmxpcEluWFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgaWYobG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJzdGFja1wiKSkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBwcm92aWRlIGluZm8gdG8gdmlld1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmNvbnRleHQuc3RhY2sgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwic3RhY2tcIikpOyAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICogVW5jaGVjayBjdXJyZW50IHN0YWNrIGZpbHRlclxuICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmV2ZW50cy5yZW1vdmVTdGFja0ZpbHRlciA9IGZ1bmN0aW9uKHN0YWNrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ3N0YWNrLXVuc2VsZWN0ZWQnLCBzdGFjayk7XG4gICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICRzY29wZS4kb24oJ3N0YWNrLXVuc2VsZWN0ZWQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5jb250ZXh0LnN0YWNrID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICogRWRpdCBzdGFja1xuICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5ldmVudHMuZWRpdFN0YWNrID0gZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBNb2RhbFNlcnZpY2Uuc2hvd01vZGFsKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IGNvbmZpZy5TUkNfRk9MREVSICsgXCJzdGFja3MvdGVtcGxhdGVzL21vZGFscy9lZGl0LXN0YWNrLmh0bWxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogXCJFZGl0U3RhY2tDb250cm9sbGVyXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0czoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YWNrOiBpdGVtXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIChtb2RhbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RhbC5lbGVtZW50Lm1vZGFsKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFsLmNsb3NlLnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcHJlcGFyZSBkYXRhIHRvIGJlIHNlbmQgdG8gc2VydmVyIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzdGFjayA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGl0ZW0uaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IG1vZGFsLnNjb3BlLmZvcm0ubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IG1vZGFsLnNjb3BlLmZvcm0uY29udGVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFqYXggY2FsbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YWNrc0ZhY3RvcnkudXBkYXRlKHN0YWNrKS4kcHJvbWlzZS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGVtbWl0IGV2ZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnc3RhY2stdXBkYXRlZCcsIGl0ZW0sIHN0YWNrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRsb2cuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3Jvd2wuZXJyb3IoXCJVcHMsIGZhaWxlZCBzYXZpbmcuIFNvcnJ5LlwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRsb2cuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3Jvd2wuZXJyb3IoXCJVcHMsIGZhaWxlZCBvcGVuaW5nIGZvcm0uXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB1cGRhdGUgaW4gdmlld1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRvbignc3RhY2stdXBkYXRlZCcsIGZ1bmN0aW9uKGV2dCwgb3JpZ2luYWwsIHN0YWNrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuY29udGV4dC5zdGFjayA9IHN0YWNrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICogRGVsZXRlIFN0YWNrXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIEBwYXJhbSBTdGFjayBpdGVtXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBAcmV0dXJucyB2b2lkXG4gICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5ldmVudHMuZGVsZXRlU3RhY2sgPSBmdW5jdGlvbiAoaXRlbSkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSnVzdCBwcm92aWRlIGEgdGVtcGxhdGUgdXJsLCBhIGNvbnRyb2xsZXIgYW5kIGNhbGwgJ3Nob3dNb2RhbCcuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTW9kYWxTZXJ2aWNlLnNob3dNb2RhbCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBjb25maWcuU1JDX0ZPTERFUiArIFwiY29tbW9uL3RlbXBsYXRlcy9tb2RhbHMvY29uZmlybS5odG1sXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IFwiWWVzTm9Db250cm9sbGVyXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0czoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICd0aXRsZSc6ICdEZWxldGUgc3RhY2s/JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnY29udGVudCc6IFwiWW91ciBjYXJkcyB3aWxsIG5vdCBiZSBlcmFzZWQsIGJ1dCByZW1haW4gb3JwaGFucy5cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkudGhlbihmdW5jdGlvbiAobW9kYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWwuZWxlbWVudC5tb2RhbCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RhbC5jbG9zZS50aGVuKGZ1bmN0aW9uIChyZXN1bHQpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdCkgeyAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhamF4IGNhbGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFja3NGYWN0b3J5LmRlbGV0ZSh7aWQ6IGl0ZW0uaWR9KS4kcHJvbWlzZS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5jb250ZXh0LnN0YWNrID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGVtbWl0IGV2ZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnc3RhY2stZGVsZXRlZCcsIGl0ZW0pOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkbG9nLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3dsLmVycm9yKFwiVXBzLCBmYWlsZWQgZGVsZXRpbmcgaXQuXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJGxvZy5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncm93bC5lcnJvcihcIlVwcywgZmFpbGVkIG9wZW5pbmcgZGlhbG9nLlwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICBdKTtcbn0pKCk7IiwiKGZ1bmN0aW9uKCl7XG4gICAgXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5zdGFja3MnKS5kaXJlY3RpdmUoJ3N0YWNrTGlzdFBhbmVsJywgWydjb25maWcnLCAncXVlcnlGYWN0b3J5JywgZnVuY3Rpb24oY29uZmlnLCBxdWVyeUZhY3Rvcnkpe1xuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgICAgICAgICAgc2NvcGU6IHRydWUsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IGNvbmZpZy5TUkNfRk9MREVSICsgJ3N0YWNrcy90ZW1wbGF0ZXMvc3RhY2stbGlzdC1wYW5lbC5odG1sJyxcbiAgICAgICAgICAgICAgICByZXBsYWNlOiB0cnVlLCAgICAgICBcbiAgICAgICAgICAgICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuY29udGV4dC5pbWdfZm9sZGVyID0gY29uZmlnLlBST0ZJTEVfSU1HX0ZPTERFUjtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLmNvbnRleHQuY3VycmVudF9zdGFjayA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJzdGFja1wiKSk7IFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIE9uIHVuc2VsZWN0IHN0YWNrXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBzY29wZS4kb24oJ3N0YWNrLXVuc2VsZWN0ZWQnLCBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJlbW92ZSBmcm9tIFVJXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmZpbmQoJy5saXN0LWdyb3VwLWl0ZW0nKS5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmVtb3ZlIGZyb20gY29va2llXG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ3N0YWNrJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJlbW92ZSBmcm9tIHNjb3BlXG4gICAgICAgICAgICAgICAgICAgICAgICBzY29wZS5jb250ZXh0LmN1cnJlbnRfc3RhY2sgPSBudWxsO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBxdWVyeSBuZXcgcmVzdWx0c1xuICAgICAgICAgICAgICAgICAgICAgICAgcXVlcnlGYWN0b3J5LmFsbCgpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBPbiBzdGFjayBpbmZvIGVkaXRlZFxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuJG9uKCdzdGFjay11cGRhdGVkJywgZnVuY3Rpb24oZXZ0LCBvcmlnaW5hbCwgc3RhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gdXBkYXRlIGNvb2tpZVxuICAgICAgICAgICAgICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJzdGFja1wiLCBKU09OLnN0cmluZ2lmeShzdGFjaykpOyAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZmluZCBzdGFjayBpbiBsaXN0XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaXRlbSA9IHNjb3BlLmNvbnRleHQuc3RhY2tzLmZpbHRlcihmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGUuaWQgPT0gc3RhY2suaWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGluZGV4ID0gc2NvcGUuY29udGV4dC5zdGFja3MuaW5kZXhPZihpdGVtWzBdKTtcbiAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHVwZGF0ZSBpdGVtIGluIGxpc3RcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZXh0ZW5kKHNjb3BlLmNvbnRleHQuc3RhY2tzW2luZGV4XSwgc3RhY2spO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBPbiBzdGFjayBkZWxldGVkXG4gICAgICAgICAgICAgICAgICAgICAqLyAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLiRvbignc3RhY2stZGVsZXRlZCcsIGZ1bmN0aW9uKGV2dCwgc3RhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmVtb3ZlIGNvb2tpZVxuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKFwic3RhY2tcIik7ICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBmaW5kIHN0YWNrIGluIGxpc3RcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpdGVtID0gc2NvcGUuY29udGV4dC5zdGFja3MuZmlsdGVyKGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZS5pZCA9PSBzdGFjay5pZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaW5kZXggPSBzY29wZS5jb250ZXh0LnN0YWNrcy5pbmRleE9mKGl0ZW1bMF0pO1xuICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyByZW1vdmUgaXRlbSBmcm9tIGxpc3RcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLmNvbnRleHQuc3RhY2tzLnNwbGljZShpbmRleCwgMSk7ICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcXVlcnkgbmV3IHJlc3VsdHNcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXJ5RmFjdG9yeS5hbGwoKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJyRyb290U2NvcGUnLCAnJGxvZycsICdjb25maWcnLCAnZ3Jvd2wnLCAnc3RhY2tzRmFjdG9yeScsICdxdWVyeUZhY3RvcnknLCAnTW9kYWxTZXJ2aWNlJywgXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKCRzY29wZSwgJHJvb3RTY29wZSwgJGxvZywgY29uZmlnLCBncm93bCwgc3RhY2tzRmFjdG9yeSwgcXVlcnlGYWN0b3J5LCBNb2RhbFNlcnZpY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmNvbnRleHQgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5ldmVudHMgPSB7fTtcbiAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBHZXQgc3RhY2sgbGlzdFxuICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuY29udGV4dC5zdGFja3MgPSBzdGFja3NGYWN0b3J5LnF1ZXJ5KCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICogQ3JlYXRlIG5ldyBzdGFja1xuICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXZlbnRzLmFkZE5ldyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1vZGFsU2VydmljZS5zaG93TW9kYWwoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogY29uZmlnLlNSQ19GT0xERVIgKyBcInN0YWNrcy90ZW1wbGF0ZXMvbW9kYWxzL25ldy1zdGFjay5odG1sXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IFwiTmV3U3RhY2tDb250cm9sbGVyXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uKG1vZGFsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFsLmVsZW1lbnQubW9kYWwoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWwuY2xvc2UudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQpIHsgICAgXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBwcmVwYXJlIGRhdGEgdG8gc3VibWl0IHRvIHNlcnZlciBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgc3RhY2sgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IG1vZGFsLnNjb3BlLmZvcm0ubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IG1vZGFsLnNjb3BlLmZvcm0uZGVzY3JpcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFja3NGYWN0b3J5LnNhdmUoc3RhY2spLiRwcm9taXNlLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGVtbWl0IGV2ZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YWNrLmlkID0gcmVzcG9uc2UuaWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnbmV3LXN0YWNrJywgc3RhY2spO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYWRkIHRvIHN0YWNrXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5jb250ZXh0LnN0YWNrcy51bnNoaWZ0KHN0YWNrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJGxvZy5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncm93bC5lcnJvcihcIlVwcywgZmFpbGVkIGNyZWF0aW5nIHN0YWNrLlwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRsb2cuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3Jvd2wuZXJyb3IoXCJVcHMsIGZhaWxlZCBvcGVuaW5nIGZvcm0uXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIEZpbHRlciBieSBzdGFja1xuICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXZlbnRzLmZpbHRlciA9IGZ1bmN0aW9uKCRldmVudCwgc3RhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgbGluayA9ICQoJGV2ZW50LmN1cnJlbnRUYXJnZXQpO1xuICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaW5rLmNsb3Nlc3QoJ3VsJykuZmluZCgnLmxpc3QtZ3JvdXAtaXRlbScpLnJlbW92ZUNsYXNzKCdzZWxlY3RlZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmsucGFyZW50KCkuYWRkQ2xhc3MoJ3NlbGVjdGVkJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHBlcnNpc3QgZmlsdGVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3N0YWNrJywgSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogc3RhY2suaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHN0YWNrLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBzdGFjay5kZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuY29udGV4dC5jdXJyZW50X3N0YWNrID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcInN0YWNrXCIpKTsgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcXVlcnkgcmVzdWx0c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXJ5RmFjdG9yeS5ieVN0YWNrKHtzdGFja19pZDogc3RhY2suaWR9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB0ZWxsIHRoZSB3b3JsZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnc3RhY2stc2VsZWN0ZWQnLCBzdGFjayk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9ICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIFVuc2VsZWN0IHN0YWNrXG4gICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5ldmVudHMudW5zZWxlY3RTdGFja0ZpbHRlciA9IGZ1bmN0aW9uICgkZXZlbnQsIHN0YWNrKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdzdGFjay11bnNlbGVjdGVkJywgc3RhY2spO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSAgICAgICAgXG4gICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgIH07XG4gICAgfV0pO1xufSkoKTsiLCIoZnVuY3Rpb24oKXtcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLnN0YWNrcycpLmZhY3RvcnkoJ3N0YWNrc0ZhY3RvcnknLCBbJyRyZXNvdXJjZScsICdjb25maWcnLCBmdW5jdGlvbiAoJHJlc291cmNlLCBjb25maWcpIHtcbiAgICAgICAgcmV0dXJuICRyZXNvdXJjZShjb25maWcuYXBpICsgJy9zdGFja3MvOmlkJywgeyBpZDogJ0BpZCcsIHN0YWNrX2lkOiAnQHN0YWNrX2lkJyB9LCB7XG4gICAgICAgICAgICB1cGRhdGU6IHtcbiAgICAgICAgICAgICAgbWV0aG9kOiAnUFVUJyBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmaWx0ZXI6IHtcbiAgICAgICAgICAgICAgdXJsOiBjb25maWcuYXBpICsgJy9zdGFja3MvOnN0YWNrX2lkL2NhcmRzJywgXG4gICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcgXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pOyBcbiAgICB9XSk7XG59KSgpO1xuXG4iLCIoZnVuY3Rpb24gKCkge1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAudGFncycpLmRpcmVjdGl2ZSgnY3VycmVudFRhZ3MnLCBbJ2NvbmZpZycsXG4gICAgICAgIGZ1bmN0aW9uIChjb25maWcpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcmVzdHJpY3Q6ICdFQScsXG4gICAgICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogY29uZmlnLlNSQ19GT0xERVIgKyAndGFncy90ZW1wbGF0ZXMvY3VycmVudC10YWdzLmh0bWwnLFxuICAgICAgICAgICAgICAgIHNjb3BlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJ3F1ZXJ5RmFjdG9yeScsIGZ1bmN0aW9uICgkc2NvcGUsIHF1ZXJ5RmFjdG9yeSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5ldmVudHMgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogQ3VycmVudCB0YWdzIGZpbHRlcnNcbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5ldmVudHMucHJpbnRDdXJyZW50VGFncyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjdXJyZW50X2Nvb2tpZXMgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0YWdzW10nKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIChjdXJyZW50X2Nvb2tpZXMpICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5jb250ZXh0LnRhZ19maWx0ZXJzID0gY3VycmVudF9jb29raWVzO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gYWRkIG9uZSBtb3JlXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS4kb24oJ3RhZy1maWx0ZXItYWRkZWQnLCBmdW5jdGlvbiAoZXZ0LCB0YWcpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgcXVlcnlGYWN0b3J5LmJ5VGFncygpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoJHNjb3BlLmNvbnRleHQudGFnX2ZpbHRlcnMgJiYgJHNjb3BlLmNvbnRleHQudGFnX2ZpbHRlcnMubGVuZ3RoICE9PSAwKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuY29udGV4dC50YWdfZmlsdGVycy51bnNoaWZ0KHRhZyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5jb250ZXh0LnRhZ19maWx0ZXJzID0gW3RhZ107XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgLy8gRHJhdyB0YWcgZmlsdGVycyBvbiBwYWdlIGxvYWRcbiAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXZlbnRzLnByaW50Q3VycmVudFRhZ3MoKTsgXG5cbiAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXZlbnRzLnJlbW92ZVRhZ0ZpbHRlciA9IGZ1bmN0aW9uKGV2ZW50LCBpbmRleCwgdGFnKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgLy8gcmVtb3ZlIGZyb20gdmlld1xuICAgICAgICAgICAgICAgICAgICAgICAkKGV2ZW50LmN1cnJlbnRUYXJnZXQpLmNsb3Nlc3QoJ2xpJykucmVtb3ZlQ2xhc3MoJ2FuaW1hdGVkJyk7IC8vIG5vIGhpZGUgYW5pbWF0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5jb250ZXh0LnRhZ19maWx0ZXJzLnNwbGljZShpbmRleCwgMSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgLy8gcmVtb3ZlIHRhZyBmcm9tIGNvb2tpZXNcbiAgICAgICAgICAgICAgICAgICAgICAgbGV0IGN1cnJlbnRfY29va2llcyA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3RhZ3NbXScpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNvb2tpZV9pbmRleCA9ICQuaW5BcnJheSggdGFnLCBjdXJyZW50X2Nvb2tpZXMgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudF9jb29raWVzLnNwbGljZShjb29raWVfaW5kZXgsIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgndGFnc1tdJywgSlNPTi5zdHJpbmdpZnkoY3VycmVudF9jb29raWVzKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgLy8gcXVlcnlcbiAgICAgICAgICAgICAgICAgICAgICAgcXVlcnlGYWN0b3J5LmJ5VGFncygpO1xuICAgICAgICAgICAgICAgICAgIH0gICAgIFxuICAgICAgICAgICAgICAgIH1dXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgXSk7XG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC50YWdzJykuZGlyZWN0aXZlKCduZXdUYWcnLCBbJ2NvbmZpZycsICd0YWdzRmFjdG9yeScsICckcm9vdFNjb3BlJywgJyRhbmltYXRlJyxcbiAgICAgICAgZnVuY3Rpb24gKGNvbmZpZywgdGFnc0ZhY3RvcnksICRyb290U2NvcGUsICRhbmltYXRlKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcmVzdHJpY3Q6ICdFQScsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IGNvbmZpZy5TUkNfRk9MREVSICsgJy90YWdzL3RlbXBsYXRlcy9uZXctdGFnLmh0bWwnLFxuICAgICAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgICAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgICAgICAgICAgY2FyZDogXCI9ZGF0YVwiXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBzY29wZS5ldmVudHMgPSB7fTtcbiAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvLyBhcmNoZXR5cGVcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUudGFnID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogJydcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBJbml0aWFsIHdpZGdldCBzdGF0ZVxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuZGlzcGxheSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIEhpZGUgd2lkZ2V0XG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBzY29wZS5ldmVudHMuc2hvdyA9IGZ1bmN0aW9uKCkgeyBcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLmRpc3BsYXkgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUudmlzaWJpbGl0eSA9ICd2aXNpYmxlJzsgLy8gY3NzIGNsYXNzXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuZmluZCgnaW5wdXQnKS5mb2N1cygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgMC41KTsgLy8gdGltZSB3aWxsIHZhcnkgYWNjb3JkaW5nIHRvIGNzcyBydWxlXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBIaWRlIHdpZGdldFxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuZXZlbnRzLmhpZGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLmRpc3BsYXkgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLnZpc2liaWxpdHkgPSAnJzsgLy8gY3NzIGNsYXNzXG4gICAgICAgICAgICAgICAgICAgICAgICBzY29wZS50YWcubmFtZSA9ICcnOyAvLyByZXNldCBmaWVsZFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogY3JlYXRlcyBhIHRhZyBhbmQgYXR0YWNoIGl0IHRvIGN1cnJlbnQgY2FyZFxuICAgICAgICAgICAgICAgICAgICAgKiBcbiAgICAgICAgICAgICAgICAgICAgICogQHJldHVybnMgdm9pZFxuICAgICAgICAgICAgICAgICAgICAgKiBAYnJvYWRjYXN0cyBldmVudFxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuZXZlbnRzLmFkZE5ldyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoc2NvcGUudGFnLm5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgdGFnID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXJkX2lkOiBzY29wZS5jYXJkLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBzY29wZS50YWcubmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFnc0ZhY3Rvcnkuc2F2ZSh0YWcsIGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhZy5pZCA9IHJlc3BvbnNlLmlkOyAvLyBhcHBlbmQgdGFnIGlkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLmV2ZW50cy5mbGFzaENsYXNzKGVsZW1lbnQsICdvaycpOyAvLyB1eCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFkZCB0YWcgYXMgdGhlIGxhc3QgdmlzaWJsZSBvZiBYIHRhZ3NcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYodHlwZW9mKHNjb3BlLmNhcmQudGFncykgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFkZCB0YWcgdG8gdGhlIGxpc3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLmNhcmQudGFncy5zcGxpY2Uoc2NvcGUubWF4X251bV90YWdzLTEsIDAsIHRhZyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjcmVhdGUgdGhlIGxpc3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLmNhcmQudGFncyA9IFt0YWddO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY29wZS5ldmVudHMuZmxhc2hDbGFzcyhlbGVtZW50LCAnZXJyb3InKTsgLy8gdXggXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUudGFnLm5hbWUgPSAnJzsgLy8gcmVzZXQgZmllbGRcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBLZXkgZXZlbnQgKEVudGVyKVxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5iaW5kKFwia2V5ZG93biBrZXlwcmVzc1wiLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGV2ZW50LndoaWNoID09PSAxMykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLmV2ZW50cy5hZGROZXcoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBBZGRzIGFuZCByZW1vdmVzIGEgY2xhc3NcbiAgICAgICAgICAgICAgICAgICAgICogXG4gICAgICAgICAgICAgICAgICAgICAqIEBwYXJhbSBzdHJpbmcgY2xhc3NOYW1lXG4gICAgICAgICAgICAgICAgICAgICAqIEByZXR1cm5zIHZvaWRcbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLmV2ZW50cy5mbGFzaENsYXNzID0gZnVuY3Rpb24oZWxlbWVudCwgY2xhc3NOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgJGFuaW1hdGUuYWRkQ2xhc3MoZWxlbWVudCwgY2xhc3NOYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJGFuaW1hdGUucmVtb3ZlQ2xhc3MoZWxlbWVudCwgY2xhc3NOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlQ2xhc3MoY2xhc3NOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgNjAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICBdKTtcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmhvbWUnKS5kaXJlY3RpdmUoJ3RhZ0Nsb3VkJywgWydjb25maWcnLCBcbiAgICAgICAgZnVuY3Rpb24gKGNvbmZpZykge1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHJlc3RyaWN0OiAnRUEnLFxuICAgICAgICAgICAgICAgIHNjb3BlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsICAgICBcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogY29uZmlnLlNSQ19GT0xERVIgKyAnL3RhZ3MvdGVtcGxhdGVzL3RhZy1jbG91ZC5odG1sJyxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBbJyRzY29wZScsICckcm9vdFNjb3BlJywgJ3JlZHVjZUJ5RmlsdGVyJywgZnVuY3Rpb24gKCRzY29wZSwgJHJvb3RTY29wZSwgcmVkdWNlQnlGaWx0ZXIpIHtcblxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXZlbnRzID0ge307XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBLZWVwIHRyYWNrIG9mIGNhcmQgbGlzdCBjaGFuZ2VzXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuJG9uKCdjYXJkcy1sb2FkZWQnLCBmdW5jdGlvbiAoZXZ0LCBjb2xsZWN0aW9uKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHR5cGVvZihjb2xsZWN0aW9uLmRhdGEpID09PSAndW5kZWZpbmVkJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGV4Y2x1ZGUgY2FyZCB3aXRoIG5vIHRhZ3NcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjYXJkcyA9IGNvbGxlY3Rpb24uZGF0YS5maWx0ZXIoZnVuY3Rpb24gKGNhcmQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2FyZC50YWdzID8gY2FyZC50YWdzLmxlbmd0aCA+IDAgOiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZXh0cmFjdCB0YWdzIGZyb20gY2FyZFxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHRhZ3MgPSBjYXJkcy5tYXAoZnVuY3Rpb24gKGNhcmQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShhbmd1bGFyLnRvSnNvbihjYXJkLnRhZ3MpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBtZXJnZSB0YWdzIGluIGZsYXR0ZW4gYXJyYXlcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBtZXJnZWQgPSBbXS5jb25jYXQuYXBwbHkoW10sIHRhZ3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZWxpbWluYXRlIGR1cGxpY2F0ZXMgYW5kIHNlcnZlIGFycmF5IHRvIHZpZXdcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS50YWdzID0gcmVkdWNlQnlGaWx0ZXIobWVyZ2VkLCAnaWQnKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXZlbnRzLmZpbHRlciA9IGZ1bmN0aW9uKHRhZykge1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY3VycmVudF9jb29raWVzID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndGFnc1tdJykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiggdHlwZW9mKGN1cnJlbnRfY29va2llcykgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZmlyc3Qgb25lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudF9jb29raWVzID0gW3RhZ107XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGF2b2lkIGR1cGxpY2F0ZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50X2Nvb2tpZXMgPSBhbmd1bGFyLmZyb21Kc29uKGN1cnJlbnRfY29va2llcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoIGN1cnJlbnRfY29va2llcyAmJiBjdXJyZW50X2Nvb2tpZXMubWFwKGZ1bmN0aW9uKGUpIHsgcmV0dXJuIGUuaWQ7IH0pLmluZGV4T2YodGFnLmlkKSA9PT0gLTEgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRfY29va2llcy5wdXNoKHRhZyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBhZGQgdGFnIHRvIGN1cnJlbnQgdGFncyBsaXN0XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgndGFnc1tdJywgSlNPTi5zdHJpbmdpZnkoY3VycmVudF9jb29raWVzKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNvbWVvbmUgZWxzZSB3aWxsIG1ha2UgdGhlIHF1ZXJ5XG4gICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ3RhZy1maWx0ZXItYWRkZWQnLCB0YWcpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICBdKTtcbn0pKCk7IiwiKGZ1bmN0aW9uKCl7XG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC50YWdzJykuZmFjdG9yeSgndGFnc0ZhY3RvcnknLCBbJyRyZXNvdXJjZScsICdjb25maWcnLCBmdW5jdGlvbiAoJHJlc291cmNlLCBjb25maWcpIHtcbiAgICAgICAgcmV0dXJuICRyZXNvdXJjZShjb25maWcuYXBpICsgJy90YWdzLzppZCcsIHsgaWQ6ICdAaWQnLCBjYXJkX2lkOiAnQGNhcmRfaWQnIH0sIHtcbiAgICAgICAgICAgIHNhdmU6IHtcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJywgXG4gICAgICAgICAgICAgICAgdXJsOiBjb25maWcuYXBpICsgJy9jYXJkcy86Y2FyZF9pZC90YWdzJyAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmaWx0ZXI6IHtcbiAgICAgICAgICAgICAgdXJsOiBjb25maWcuYXBpICsgJy9jYXJkcy90YWdzL2FsbCcsIFxuICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnIFxuICAgICAgICAgICAgfVxuICAgICAgICB9KTsgXG4gICAgfV0pO1xufSkoKTtcblxuIiwiKGZ1bmN0aW9uKCkge1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5jYXJkcycpLmNvbnRyb2xsZXIoJ0VkaXRDYXJkQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJ2RhdGEnLCAnY2xvc2UnLCBFZGl0Q2FyZENvbnRyb2xsZXJdKTtcbiAgICBcbiAgICBmdW5jdGlvbiBFZGl0Q2FyZENvbnRyb2xsZXIoJHNjb3BlLCBkYXRhLCBjbG9zZSkge1xuXG4gICAgICAgICRzY29wZS5mb3JtID0ge307XG4gICAgICAgICRzY29wZS5mb3JtLm5hbWUgPSBkYXRhLmNhcmQubmFtZTtcbiAgICAgICAgJHNjb3BlLmZvcm0uY29udGVudCA9IGRhdGEuY2FyZC5jb250ZW50O1xuXG4gICAgICAgICRzY29wZS5jbG9zZSA9IGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgXG4gICAgICAgICAgICBjbG9zZShyZXN1bHQsIDIwMCk7IC8vIGNsb3NlLCBidXQgZ2l2ZSAyMDBtcyBmb3IgYm9vdHN0cmFwIHRvIGFuaW1hdGVcbiAgICAgICAgfTtcbiAgICB9O1xufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5ob21lJykuY29udHJvbGxlcignWWVzTm9Db250cm9sbGVyJywgWyckc2NvcGUnLCAnZGF0YScsICdjbG9zZScsIGZ1bmN0aW9uICgkc2NvcGUsIGRhdGEsIGNsb3NlKSB7XG4gICAgICAgICAgIFxuICAgICAgICAgICAgJHNjb3BlLnRpdGxlID0gZGF0YS50aXRsZTtcbiAgICAgICAgICAgICRzY29wZS5jb250ZW50ID0gZGF0YS5jb250ZW50O1xuICAgICAgICAgICBcbiAgICAgICAgICAgICRzY29wZS5jbG9zZSA9IGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICBjbG9zZShyZXN1bHQsIDIwMCk7IC8vIGNsb3NlLCBidXQgZ2l2ZSAyMDBtcyBmb3IgYm9vdHN0cmFwIHRvIGFuaW1hdGVcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1dKTtcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5ob21lJykuY29udHJvbGxlcignTWFya2Rvd25Db250cm9sbGVyJywgWyckc2NvcGUnLCAnZGF0YScsICdjbG9zZScsIE1hcmtkb3duQ29udHJvbGxlcl0pO1xuICAgIFxuICAgIGZ1bmN0aW9uIE1hcmtkb3duQ29udHJvbGxlcigkc2NvcGUsIGRhdGEsIGNsb3NlKSB7XG5cbiAgICAgICAgJHNjb3BlLnRpdGxlID0gZGF0YS5jYXJkLm5hbWU7XG4gICAgICAgICRzY29wZS5jb250ZW50ID0gZGF0YS5jYXJkLmNvbnRlbnQ7XG5cbiAgICAgICAgJHNjb3BlLmRpc21pc3NNb2RhbCA9IGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgIGNsb3NlKHJlc3VsdCwgMjAwKTsgLy8gY2xvc2UsIGJ1dCBnaXZlIDIwMG1zIGZvciBib290c3RyYXAgdG8gYW5pbWF0ZVxuICAgICAgICB9O1xuICAgIH07XG59KSgpOyIsIihmdW5jdGlvbigpIHtcblxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuc3RhY2tzJykuY29udHJvbGxlcignRWRpdFN0YWNrQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJyRlbGVtZW50JywgJ2RhdGEnLCAnY2xvc2UnLCBFZGl0U3RhY2tDb250cm9sbGVyXSk7XG4gICAgXG4gICAgZnVuY3Rpb24gRWRpdFN0YWNrQ29udHJvbGxlcigkc2NvcGUsICRlbGVtZW50LCBkYXRhLCBjbG9zZSkge1xuICAgICAgXG4gICAgICAgICRzY29wZS5mb3JtID0ge307XG4gICAgICAgICRzY29wZS5mb3JtLm5hbWUgPSBkYXRhLnN0YWNrLm5hbWU7XG4gICAgICAgICRzY29wZS5mb3JtLmNvbnRlbnQgPSBkYXRhLnN0YWNrLmRlc2NyaXB0aW9uO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBLZXkgZXZlbnQgKEVudGVyKVxuICAgICAgICAgKi9cbiAgICAgICAgJGVsZW1lbnQuZmluZCgnaW5wdXQnKS5iaW5kKFwia2V5ZG93biBrZXlwcmVzc1wiLCBmdW5jdGlvbiAoZXZlbnQpIHtcblxuICAgICAgICAgICAgaWYoZXZlbnQud2hpY2ggPT09IDEzKSB7XG4gICAgICAgICAgICAgICAgJGVsZW1lbnQubW9kYWwoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICAkc2NvcGUuY2xvc2UodHJ1ZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAkc2NvcGUuY2xvc2UgPSBmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgIFxuICAgICAgICAgICAgY2xvc2UocmVzdWx0LCAyMDApOyAvLyBjbG9zZSwgYnV0IGdpdmUgMjAwbXMgZm9yIGJvb3RzdHJhcCB0byBhbmltYXRlXG4gICAgICAgIH07XG4gICAgfTtcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuICAgIFxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuc3RhY2tzJykuY29udHJvbGxlcignTmV3U3RhY2tDb250cm9sbGVyJywgWyckc2NvcGUnLCAnJGVsZW1lbnQnLCAnY2xvc2UnLCBOZXdTdGFja0NvbnRyb2xsZXJdKTtcbiAgICBcbiAgICBmdW5jdGlvbiBOZXdTdGFja0NvbnRyb2xsZXIoJHNjb3BlLCAkZWxlbWVudCwgY2xvc2UpIHtcbiAgICAgICBcbiAgICAgICAgJHNjb3BlLmZvcm0gPSB7XG4gICAgICAgICAgICBuYW1lOiAnJyxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnJ1xuICAgICAgICB9O1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogS2V5IGV2ZW50IChFbnRlcilcbiAgICAgICAgICovXG4gICAgICAgICRlbGVtZW50LmZpbmQoJ2lucHV0JykuYmluZChcImtleWRvd24ga2V5cHJlc3NcIiwgZnVuY3Rpb24gKGV2ZW50KSB7XG5cbiAgICAgICAgICAgIGlmKGV2ZW50LndoaWNoID09PSAxMykge1xuICAgICAgICAgICAgICAgICRlbGVtZW50Lm1vZGFsKCdoaWRlJyk7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmNsb3NlKHRydWUpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICAkc2NvcGUuY2xvc2UgPSBmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgIFxuICAgICAgICAgICAgY2xvc2UocmVzdWx0LCAyMDApOyAvLyBjbG9zZSwgYnV0IGdpdmUgMjAwbXMgZm9yIGJvb3RzdHJhcCB0byBhbmltYXRlXG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgXG4gICAgfTtcbn0pKCk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
