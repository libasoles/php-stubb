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
                transclude: true,
                scope: {
                    card: "=data"
                },
                controller: ['$scope', '$rootScope', '$log', 'config', 'cardsFactory', 'ModalService',
                    function ($scope, $rootScope, $log, config, cardsFactory, ModalService) {

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
                        $scope.pinCard = function (item) {

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
                        $scope.delete = function (item) {

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
                        $scope.edit = function (item) {

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
                        $scope.viewAsMarkdownModal = function (item) {

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

                        /**
                         * On new tag added, push it to the list
                         */
                        $scope.$on('new-tag', function(evt, data) {
                            // add tag as the last visible of X tags
                            if(typeof($scope.card.tags) !== 'undefined'){
                                // add tag to the list
                                $scope.card.tags.splice($scope.max_num_tags-1, 0, data);
                            } else {
                                // create the list
                                $scope.card.tags = [data];
                            }
                        });
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

                    /**
                     * Submit form
                     * @returns void
                     */
                    $scope.createCard = function () {

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
    angular.module('app').directive('paginateCards', ['config',
        function (config) {
            
            return {
                restrict: 'EA',
                templateUrl: config.SRC_FOLDER + '/cards/templates/paginate-cards.html',
                transclude: true,
                scope: {
                    data: '='
                },
                controller: ['$scope', '$rootScope', function ($scope, $rootScope) {
                  
                    /**
                     * Draw widget when data is available
                     */
                    $scope.$on('cards-loaded', function(evt, data) {
                        $scope.pages = data;
                    })
                  
                    /**
                     * Broadcast changes
                     * @returns void
                     */
                    $scope.navigate = function ($event) {
                        
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
    
     angular.module('app').factory('queryFactory', ['$log', '$cookies', '$rootScope', 'cardsFactory', 'stacksFactory', queryFactory]);
    
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
            
            // persist params (but page number)
            if(typeof(params) !== 'undefined') {

                if(typeof(params.order) !== 'undefined') {

                    $cookies.putObject('order', angular.fromJson(params.order));   

                    params = params.order; // unwrap data                            
                }
            }
            
            // query
            return cardsFactory
                .query(params, function (response) {
                    
                    broadcast(response); // tell the world
                }, function(err) {
                    $log.error(err);
                });  
        };
        
        /**
         * get card by stack
         * 
         * @param json params
         * @returns stacksFactory
         * @broadcast cards list
         */
        factory.byStack = function (params) {
                  
            return stacksFactory.filter(params, function(response) {
                
                broadcast(response); // tell the world
            }, function(err) {
                $log.error(err);
            });
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
            console.log($scope.tag_filters);
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
    angular.module('app.home').directive('orderBy', ['config',
        function (config) {
            
            return {
                restrict: 'EA',
                templateUrl: config.SRC_FOLDER + '/home/templates/order-by.html',
                controller: ['$scope', '$rootScope', function ($scope, $rootScope) {
                       
                        // initial position
                        $scope.order = 'updated_at';
                        $scope.direction = 'desc';
                       
                        $scope.update = function() {
                            
                            let data = {
                                order: $scope.order,
                                direction: $scope.direction
                            }
                            $rootScope.$broadcast('order-changed', data); // emmit
                        }                        
                }]
            };
        }
    ]);
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
                templateUrl: config.SRC_FOLDER + 'stacks/templates/stack-list-panel.html',
                transclude: true,       
                link: function(scope, element, attrs) {
                    scope.img_folder = config.PROFILE_IMG_FOLDER;
                    
                    scope.current_stack = $cookies.get("stack");                
                },
                controller: ['$scope', '$rootScope', '$log', '$cookies', 'config', 'stacksFactory', 'ModalService', 
                    function($scope, $rootScope, $log, $cookies, config, stacksFactory, ModalService) {
                     
                        /**
                         * Get stack list
                         */
                        $scope.stacks = stacksFactory.query();

                        /**
                         * Create new stack
                         */
                        $scope.addNew = function() {
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
                        $scope.filter = function($event, stack) {
                            
                            $event.preventDefault();
                            $event.stopPropagation();
                            
                            let li = $($event.currentTarget);
                            
                            li.closest('ul').find('.list-group-item').removeClass('selected');
                            li.parent().addClass('selected');
                                                        
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
                    scope.show = function() { 
                        scope.display = true;
                        scope.visibility = 'visible'; // css class
                        setTimeout(function() {
                            element.find('input').focus();
                        }, 0.5); // time will vary according to css rule
                    }
                    
                    /**
                     * Hide widget
                     */
                    scope.hide = function() {
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
                    scope.addNew = function () {
                        
                        if(scope.tag.name) {
                            
                            let tag = {
                                card_id: scope.card.id,
                                name: scope.tag.name
                            };
                            
                            tagsFactory.save(tag, function(response) {
                                tag.id = response.id; // append tag id
                                scope.flashClass(element, 'ok'); // ux 
                                $rootScope.$broadcast('new-tag', tag);
                            }, function(err) {
                                scope.flashClass(element, 'error'); // ux 
                            });
                            scope.tag.name = ''; // reset field
                        }
                    };
                    
                    /**
                     * Key event (Enter)
                     */
                    element.bind("keydown keypress", function (event) {
                        if(event.which === 13) {
                            scope.addNew();
                            event.preventDefault();
                        }
                    });
                    
                    /**
                     * Adds and removes a class
                     * 
                     * @param string className
                     * @returns void
                     */
                    scope.flashClass = function(element, className) {
                       
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
                templateUrl: config.SRC_FOLDER + '/tags/templates/tag-cloud.html',
                controller: ['$scope', '$cookies', '$rootScope', 'reduceByFilter', function ($scope, $cookies, $rootScope, reduceByFilter) {

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
                    
                    $scope.filter = function(tag) {
                        
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC1jb25maWcuanMiLCJjYXJkcy9tb2R1bGUuanMiLCJjb21tb24vbW9kdWxlLmpzIiwiaG9tZS9tb2R1bGUuanMiLCJzdGFja3MvbW9kdWxlLmpzIiwidGFncy9tb2R1bGUuanMiLCJjYXJkcy9jYXJkcy1yb3V0ZS5qcyIsImNvbW1vbi9hcHAtcm91dGUuanMiLCJob21lL2hvbWUtcm91dGUuanMiLCJsb2dpbi9sb2dpbi5qcyIsInN0YWNrcy9ob21lLXJvdXRlLmpzIiwiY2FyZHMvZGlyZWN0aXZlcy9jYXJkLmpzIiwiY2FyZHMvZGlyZWN0aXZlcy9uZXctY2FyZC5qcyIsImNhcmRzL2RpcmVjdGl2ZXMvcGFnaW5hdGUtY2FyZHMuanMiLCJjYXJkcy9zZXJ2aWNlcy9jYXJkcy1mYWN0b3J5LmpzIiwiY29tbW9uL2NvbnRyb2xsZXJzL2hlYWRlci1jb250cm9sbGVycy5qcyIsImNvbW1vbi9jb250cm9sbGVycy9sYXlvdXQtY29udHJvbGxlcnMuanMiLCJjb21tb24vZGlyZWN0aXZlcy9hdXRvZm9jdXMuanMiLCJjb21tb24vZGlyZWN0aXZlcy9lbGFzdGljQXJlYS5qcyIsImNvbW1vbi9kaXJlY3RpdmVzL2hhc2h0YWdpZnkuanMiLCJjb21tb24vZGlyZWN0aXZlcy9zZXNzaW9uRHJvcGRvd24uanMiLCJjb21tb24vZGlyZWN0aXZlcy9zaG93TW9yZS5qcyIsImNvbW1vbi9maWx0ZXJzL3JlZHVjZUJ5LmpzIiwiY29tbW9uL3NlcnZpY2VzL3F1ZXJ5LWZhY3RvcnkuanMiLCJob21lL2NvbnRyb2xsZXJzL2hvbWUtY29udHJvbGxlci5qcyIsImhvbWUvY29udHJvbGxlcnMvbGlzdC1jb250cm9sbGVyLmpzIiwiaG9tZS9jb250cm9sbGVycy9zZWFyY2gtY29udHJvbGxlci5qcyIsImhvbWUvZGlyZWN0aXZlcy9vcmRlci1ieS5qcyIsImhvbWUvZmlsdGVycy9oaWdobGlnaHRUZXh0LmpzIiwiaG9tZS9zZXJ2aWNlcy9ob21lLWNvbnRleHQuanMiLCJzdGFja3MvZGlyZWN0aXZlcy9zdGFjay1saXN0LXBhbmVsLmpzIiwic3RhY2tzL3NlcnZpY2VzL3N0YWNrcy1mYWN0b3J5LmpzIiwidGFncy9kaXJlY3RpdmVzL25ldy10YWcuanMiLCJ0YWdzL2RpcmVjdGl2ZXMvdGFnLWNsb3VkLmpzIiwidGFncy9zZXJ2aWNlL3RhZ3MtZmFjdG9yeS5qcyIsImNhcmRzL2NvbnRyb2xsZXJzL21vZGFscy9lZGl0LWNhcmQtY29udHJvbGxlci5qcyIsImNvbW1vbi9jb250cm9sbGVycy9tb2RhbHMveWVzLW5vLWNvbnRyb2xsZXIuanMiLCJob21lL2NvbnRyb2xsZXJzL21vZGFscy9tYXJrZG93bi1jb250cm9sbGVyLmpzIiwic3RhY2tzL2NvbnRyb2xsZXJzL21vZGFscy9uZXctc3RhY2stY29udHJvbGxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FBR0EsUUFBQSxPQUFBLGNBQUE7S0FDQSxTQUFBLFVBQUE7UUFDQSxPQUFBO1FBQ0EsU0FBQTtRQUNBLGNBQUE7UUFDQSxjQUFBO1FBQ0Esc0JBQUE7OztBQ1RBLFFBQUEsT0FBQSxhQUFBOzs7QUNBQTs7QUFFQSxRQUFBLE9BQUEsT0FBQSxDQUFBLE1BQUEsV0FBQSxhQUFBLGNBQUEsWUFBQSx1QkFBQTs7Ozs7QUFLQSxRQUFBLE9BQUEsT0FBQSxPQUFBLENBQUEsaUJBQUEsZ0JBQUEsc0JBQUE7SUFDQSxVQUFBLGVBQUEsY0FBQSxvQkFBQSxRQUFBOzs7OztRQUtBLGNBQUEsU0FBQSxRQUFBLFNBQUE7WUFDQSxnQkFBQTtZQUNBLFVBQUE7WUFDQSxxQkFBQTtZQUNBLG9CQUFBO1lBQ0EsZ0JBQUEsUUFBQTs7Ozs7O1FBTUEsYUFBQSxhQUFBLE9BQUE7Ozs7O1FBS0EsbUJBQUEscUJBQUE7WUFDQSxRQUFBO1lBQ0EsUUFBQTs7O1FBR0EsbUJBQUE7UUFDQSxtQkFBQSxrQkFBQTtRQUNBLG1CQUFBLGlCQUFBO1FBQ0EsbUJBQUEseUJBQUE7OztBQUdBLFFBQUEsT0FBQSxPQUFBLElBQUEsQ0FBQSxZQUFBOzs7O0FDeENBLFFBQUEsT0FBQSxZQUFBLENBQUEsV0FBQSxjQUFBLGFBQUEsYUFBQSxjQUFBLFlBQUEsYUFBQTs7QUNBQSxRQUFBLE9BQUEsY0FBQSxDQUFBOztBQ0FBLFFBQUEsT0FBQSxZQUFBLENBQUE7O0FDQUEsUUFBQSxPQUFBLGFBQUEsMEJBQUEsU0FBQSxnQkFBQTs7O0FDQUEsQ0FBQSxZQUFBO0lBQ0EsUUFBQSxPQUFBLE9BQUEsT0FBQSxDQUFBLGtCQUFBLFVBQUEsU0FBQSxnQkFBQSxRQUFBOztNQUVBO1NBQ0EsS0FBQSxLQUFBO1lBQ0EsYUFBQSxPQUFBLGFBQUE7WUFDQSxZQUFBO1lBQ0EsY0FBQTs7O1NBR0EsVUFBQSxDQUFBLFlBQUE7OztBQ1ZBLFFBQUEsT0FBQSxZQUFBLDBCQUFBLFNBQUEsZ0JBQUE7Ozs7QUNDQSxFQUFBLFVBQUEsTUFBQSxZQUFBOzs7SUFHQSxFQUFBLGNBQUEsTUFBQSxZQUFBOztRQUVBLEVBQUEsUUFBQSxRQUFBLENBQUEsUUFBQSxVQUFBLFNBQUEsV0FBQTs7UUFFQSxHQUFBLE9BQUEsU0FBQSxZQUFBLFVBQUE7WUFDQSxRQUFBLFVBQUEsSUFBQSxZQUFBO2VBQ0E7WUFDQSxRQUFBLFVBQUEsSUFBQSxTQUFBOzs7UUFHQSxFQUFBLG9CQUFBOzs7O0FDZEEsUUFBQSxPQUFBLGNBQUEsMEJBQUEsU0FBQSxnQkFBQTs7O0FDQUEsQ0FBQSxZQUFBOztJQUVBLFFBQUEsT0FBQSxhQUFBLFVBQUE7UUFDQSxDQUFBLFVBQUEsVUFBQSxRQUFBO1lBQ0EsT0FBQTtnQkFDQSxhQUFBLE9BQUEsYUFBQTtnQkFDQSxVQUFBO2dCQUNBLFlBQUE7Z0JBQ0EsT0FBQTtvQkFDQSxNQUFBOztnQkFFQSxZQUFBLENBQUEsVUFBQSxjQUFBLFFBQUEsVUFBQSxnQkFBQTtvQkFDQSxVQUFBLFFBQUEsWUFBQSxNQUFBLFFBQUEsY0FBQSxjQUFBOzs7Ozt3QkFLQSxPQUFBLGVBQUE7Ozs7Ozs7O3dCQVFBLE9BQUEsVUFBQSxVQUFBLE1BQUE7OzRCQUVBLElBQUEsT0FBQTtnQ0FDQSxJQUFBLEtBQUE7Z0NBQ0EsUUFBQSxDQUFBLEtBQUE7Ozs7NEJBSUEsYUFBQSxPQUFBLE1BQUEsU0FBQSxLQUFBLFlBQUE7OztnQ0FHQSxXQUFBLFdBQUEsWUFBQTsrQkFDQSxVQUFBLEtBQUE7Z0NBQ0EsS0FBQSxNQUFBOzs7Ozs7Ozs7O3dCQVVBLE9BQUEsU0FBQSxVQUFBLE1BQUE7Ozs0QkFHQSxhQUFBLFVBQUE7Z0NBQ0EsYUFBQSxPQUFBLGFBQUE7Z0NBQ0EsWUFBQTtnQ0FDQSxRQUFBO29DQUNBLE1BQUE7d0NBQ0EsU0FBQTt3Q0FDQSxXQUFBOzs7K0JBR0EsS0FBQSxVQUFBLE9BQUE7Z0NBQ0EsTUFBQSxRQUFBO2dDQUNBLE1BQUEsTUFBQSxLQUFBLFVBQUEsUUFBQTs7b0NBRUEsSUFBQSxRQUFBOzt3Q0FFQSxhQUFBLE9BQUEsQ0FBQSxJQUFBLEtBQUEsS0FBQSxTQUFBLEtBQUEsWUFBQTs7OzRDQUdBLFdBQUEsV0FBQSxlQUFBOzJDQUNBLFVBQUEsS0FBQTs0Q0FDQSxLQUFBLE1BQUE7Ozs7Ozs7Ozs7Ozs7d0JBYUEsT0FBQSxPQUFBLFVBQUEsTUFBQTs7NEJBRUEsYUFBQSxVQUFBO2dDQUNBLGFBQUEsT0FBQSxhQUFBO2dDQUNBLFlBQUE7Z0NBQ0EsUUFBQTtvQ0FDQSxNQUFBO3dDQUNBLE1BQUE7OzsrQkFHQSxLQUFBLFVBQUEsT0FBQTtnQ0FDQSxNQUFBLFFBQUE7Z0NBQ0EsTUFBQSxNQUFBLEtBQUEsVUFBQSxRQUFBO29DQUNBLElBQUEsUUFBQTs7O3dDQUdBLElBQUEsT0FBQTs0Q0FDQSxJQUFBLEtBQUE7NENBQ0EsTUFBQSxNQUFBLE1BQUEsS0FBQTs0Q0FDQSxTQUFBLE1BQUEsTUFBQSxLQUFBOzs7O3dDQUlBLGFBQUEsT0FBQSxNQUFBLFNBQUEsS0FBQSxZQUFBOzs7NENBR0EsV0FBQSxXQUFBLGVBQUEsTUFBQTsyQ0FDQSxVQUFBLEtBQUE7NENBQ0EsS0FBQSxNQUFBOzs7Ozs7Ozs7Ozs7O3dCQWFBLE9BQUEsc0JBQUEsVUFBQSxNQUFBOzs7NEJBR0EsYUFBQSxVQUFBO2dDQUNBLGFBQUEsT0FBQSxhQUFBO2dDQUNBLFlBQUE7Z0NBQ0EsUUFBQTtvQ0FDQSxNQUFBO3dDQUNBLFFBQUE7OzsrQkFHQSxLQUFBLFVBQUEsT0FBQTtnQ0FDQSxNQUFBLFFBQUE7Ozs7Ozs7d0JBT0EsT0FBQSxJQUFBLFdBQUEsU0FBQSxLQUFBLE1BQUE7OzRCQUVBLEdBQUEsT0FBQSxPQUFBLEtBQUEsVUFBQSxZQUFBOztnQ0FFQSxPQUFBLEtBQUEsS0FBQSxPQUFBLE9BQUEsYUFBQSxHQUFBLEdBQUE7bUNBQ0E7O2dDQUVBLE9BQUEsS0FBQSxPQUFBLENBQUE7Ozs7Ozs7QUN2SkEsQ0FBQSxZQUFBOztJQUVBLFFBQUEsT0FBQSxhQUFBLFVBQUE7UUFDQSxDQUFBLFVBQUEsVUFBQSxRQUFBO1lBQ0EsT0FBQTtnQkFDQSxVQUFBO2dCQUNBLE9BQUE7b0JBQ0EsTUFBQTs7Z0JBRUEsU0FBQTtnQkFDQSxhQUFBLE9BQUEsYUFBQTtnQkFDQSxZQUFBLENBQUEsVUFBQSxjQUFBLFFBQUEsZ0JBQUEsVUFBQSxRQUFBLFlBQUEsTUFBQSxjQUFBOzs7Ozs7b0JBTUEsT0FBQSxhQUFBLFlBQUE7O3dCQUVBLElBQUEsT0FBQSxTQUFBOzs0QkFFQSxJQUFBLE9BQUE7Z0NBQ0EsTUFBQSxPQUFBO2dDQUNBLFNBQUEsT0FBQTs7OzRCQUdBLGFBQUEsS0FBQSxNQUFBLFNBQUEsS0FBQSxVQUFBLFVBQUE7Z0NBQ0EsS0FBQSxRQUFBO2dDQUNBLEtBQUEsS0FBQSxTQUFBO2dDQUNBLFdBQUEsV0FBQSxZQUFBOytCQUNBLFVBQUEsVUFBQTtnQ0FDQSxLQUFBLE1BQUE7Ozs0QkFHQSxPQUFBLFVBQUE7Ozs7Ozs7QUNsQ0EsQ0FBQSxZQUFBO0lBQ0EsUUFBQSxPQUFBLE9BQUEsVUFBQSxpQkFBQSxDQUFBO1FBQ0EsVUFBQSxRQUFBOztZQUVBLE9BQUE7Z0JBQ0EsVUFBQTtnQkFDQSxhQUFBLE9BQUEsYUFBQTtnQkFDQSxZQUFBO2dCQUNBLE9BQUE7b0JBQ0EsTUFBQTs7Z0JBRUEsWUFBQSxDQUFBLFVBQUEsY0FBQSxVQUFBLFFBQUEsWUFBQTs7Ozs7b0JBS0EsT0FBQSxJQUFBLGdCQUFBLFNBQUEsS0FBQSxNQUFBO3dCQUNBLE9BQUEsUUFBQTs7Ozs7OztvQkFPQSxPQUFBLFdBQUEsVUFBQSxRQUFBOzt3QkFFQSxPQUFBO3dCQUNBLE9BQUE7O3dCQUVBLElBQUEsU0FBQSxPQUFBOzt3QkFFQSxHQUFBLE9BQUEsT0FBQSxXQUFBLGlCQUFBLGVBQUEsQ0FBQSxPQUFBLFdBQUEsWUFBQSxPQUFBOzs0QkFFQSxXQUFBLFdBQUEsc0JBQUE7Z0NBQ0EsTUFBQSxPQUFBLFdBQUEsYUFBQTs7Ozt3QkFJQSxPQUFBOzs7Ozs7O0FDdENBLENBQUEsWUFBQTs7SUFFQSxRQUFBLE9BQUEsYUFBQSxRQUFBLGdCQUFBLENBQUEsYUFBQSxVQUFBLFNBQUEsV0FBQSxRQUFBOztRQUVBLE9BQUEsVUFBQSxPQUFBLE1BQUE7WUFDQTtnQkFDQSxJQUFBO2dCQUNBLE1BQUE7O1lBRUE7Z0JBQ0EsT0FBQTtvQkFDQSxLQUFBLE9BQUEsTUFBQTtvQkFDQSxTQUFBO29CQUNBLG1CQUFBLFVBQUEsVUFBQTt3QkFDQSxPQUFBLFFBQUEsU0FBQTs7O2dCQUdBLFFBQUE7a0JBQ0EsUUFBQTs7Ozs7OztBQ2xCQSxDQUFBLFlBQUE7O0lBRUEsUUFBQSxPQUFBLE9BQUEsV0FBQSxvQkFBQSxDQUFBLFVBQUE7O0lBRUEsU0FBQSxpQkFBQSxRQUFBOzs7Ozs7O0FDSkEsQ0FBQSxZQUFBOztJQUVBLFFBQUEsT0FBQSxPQUFBLFdBQUEsb0JBQUEsQ0FBQSxVQUFBLFFBQUE7O0lBRUEsU0FBQSxpQkFBQSxRQUFBLE1BQUE7O1FBRUEsT0FBQSxlQUFBLFNBQUEsR0FBQTtZQUNBLElBQUEsVUFBQSxFQUFBLE9BQUE7WUFDQSxNQUFBLDRCQUFBOzs7UUFHQSxPQUFBLGVBQUEsU0FBQSxHQUFBO1lBQ0EsSUFBQSxVQUFBLEVBQUEsT0FBQTtZQUNBLE1BQUEsNEJBQUE7Ozs7Ozs7O1FBUUEsT0FBQSxZQUFBLFNBQUEsTUFBQTs7Ozs7WUFLQSxPQUFBLEtBQUEsWUFBQTs7Ozs7OztBQzFCQSxDQUFBLFlBQUE7SUFDQSxRQUFBLE9BQUEsT0FBQSxVQUFBLGFBQUEsWUFBQTtRQUNBLE9BQUE7WUFDQSxVQUFBO1lBQ0EsTUFBQSxVQUFBLE9BQUEsU0FBQTtnQkFDQSxRQUFBLEdBQUE7Ozs7Ozs7QUNMQSxDQUFBLFlBQUE7OztJQUdBLFFBQUEsT0FBQSxPQUFBLFVBQUEsZUFBQSxZQUFBO1FBQ0EsT0FBQTtZQUNBLFVBQUE7WUFDQSxNQUFBLFVBQUEsT0FBQSxTQUFBLFlBQUE7Z0JBQ0EsSUFBQSxZQUFBO3dCQUNBLFlBQUEsUUFBQSxHQUFBO3dCQUNBLGNBQUEsUUFBQSxJQUFBO3dCQUNBLGVBQUEsUUFBQSxJQUFBOztnQkFFQSxJQUFBLFVBQUEsUUFBQSxRQUFBLGVBQUEsSUFBQTtvQkFDQSxVQUFBO29CQUNBLEtBQUEsQ0FBQTtvQkFDQSxNQUFBLENBQUE7b0JBQ0EsT0FBQSxRQUFBLEdBQUEsY0FBQSxTQUFBLGVBQUEsS0FBQSxTQUFBLGdCQUFBO29CQUNBLFVBQUEsUUFBQSxJQUFBO29CQUNBLFlBQUEsUUFBQSxJQUFBO29CQUNBLFlBQUEsUUFBQSxJQUFBO29CQUNBLFFBQUE7OztnQkFHQSxRQUFBLFFBQUEsU0FBQSxNQUFBLE9BQUE7O2dCQUVBLElBQUEsU0FBQSxZQUFBO29CQUNBLElBQUEsUUFBQSxVQUFBLFFBQUEsUUFBQTt3QkFDQSxLQUFBLElBQUEsSUFBQSxHQUFBLElBQUEsSUFBQSxJQUFBLFFBQUEsS0FBQTs0QkFDQSxLQUFBOzt3QkFFQSxPQUFBOzs7b0JBR0EsSUFBQSxNQUFBLFFBQUEsTUFBQSxRQUFBLE1BQUE7NkJBQ0EsUUFBQSxNQUFBOzZCQUNBLFFBQUEsTUFBQTs2QkFDQSxRQUFBLE9BQUE7NkJBQ0EsUUFBQSxPQUFBOzZCQUNBLFFBQUEsV0FBQSxVQUFBLE9BQUE7Z0NBQ0EsT0FBQSxNQUFBLFVBQUEsTUFBQSxTQUFBLEtBQUE7OztvQkFHQSxRQUFBLEtBQUE7O29CQUVBLFFBQUEsSUFBQSxVQUFBLEtBQUEsSUFBQSxRQUFBLEdBQUEsZUFBQSxX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QkFDQSxLQUFBLFFBQUEsS0FBQSxRQUFBLEtBQUEsUUFBQSxZQUFBO2dCQUNBLElBQUEsUUFBQSxPQUFBLFFBQUEsTUFBQSxRQUFBO2dCQUNBLE9BQUEsUUFBQSxNQUFBLE9BQUEsT0FBQTtnQkFDQSxPQUFBLFFBQUEsTUFBQSxRQUFBOzs7Ozs7O1FBT0EsT0FBQSxJQUFBLGVBQUEsU0FBQSxLQUFBLE1BQUE7WUFDQSxJQUFBLFFBQUEsT0FBQSxRQUFBLE1BQUEsUUFBQTtZQUNBLE9BQUEsUUFBQSxNQUFBLE9BQUEsT0FBQTs7Ozs7O1FBTUEsT0FBQSxJQUFBLGVBQUEsU0FBQSxLQUFBLFVBQUEsU0FBQTtZQUNBLElBQUEsUUFBQSxPQUFBLFFBQUEsTUFBQSxRQUFBO1lBQ0EsUUFBQSxPQUFBLE9BQUEsUUFBQSxNQUFBLFFBQUE7Ozs7OztRQU1BLE9BQUEsSUFBQSxrQkFBQSxTQUFBLEtBQUEsT0FBQTs7O1lBR0EsYUFBQSxRQUFBLENBQUEsVUFBQSxNQUFBOzs7WUFHQSxPQUFBLFFBQUEsUUFBQTs7O1lBR0EsU0FBQSxLQUFBLHNCQUFBLFNBQUE7Ozs7OztRQU1BLFNBQUEsR0FBQSxnRkFBQSxzQkFBQSxXQUFBO1lBQ0EsRUFBQSxNQUFBLFlBQUE7OztRQUdBLEdBQUEsU0FBQSxJQUFBLFVBQUE7OztZQUdBLE9BQUEsUUFBQSxRQUFBLFNBQUEsSUFBQTs7Ozs7O1FBTUEsT0FBQSxtQkFBQSxXQUFBOztZQUVBLElBQUEsa0JBQUEsU0FBQSxJQUFBO1lBQ0EsSUFBQSxPQUFBLHFCQUFBLGNBQUE7Z0JBQ0EsT0FBQSxjQUFBLFFBQUEsU0FBQTs7Ozs7UUFLQSxPQUFBLElBQUEsb0JBQUEsU0FBQSxLQUFBLEtBQUE7WUFDQSxPQUFBLFlBQUEsUUFBQTtZQUNBLFFBQUEsSUFBQSxPQUFBOzs7O1FBSUEsT0FBQTs7UUFFQSxPQUFBLGtCQUFBLFNBQUEsT0FBQSxPQUFBLEtBQUE7OztZQUdBLEVBQUEsTUFBQSxlQUFBLFFBQUEsTUFBQSxZQUFBO1lBQ0EsT0FBQSxZQUFBLE9BQUEsT0FBQTs7O1lBR0EsSUFB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O0lBQ0EsUUFBQSxPQUFBLFlBQUEsUUFBQSxlQUFBLENBQUEsYUFBQSxVQUFBLFVBQUEsV0FBQSxRQUFBO1FBQ0EsT0FBQSxVQUFBLE9BQUEsTUFBQSxhQUFBLEVBQUEsSUFBQSxPQUFBLFNBQUEsY0FBQTtZQUNBLE1BQUE7Z0JBQ0EsUUFBQTtnQkFDQSxLQUFBLE9BQUEsTUFBQTs7Ozs7OztBQ0xBLENBQUEsV0FBQTs7SUFFQSxRQUFBLE9BQUEsYUFBQSxXQUFBLHNCQUFBLENBQUEsVUFBQSxRQUFBLFNBQUE7O0lBRUEsU0FBQSxtQkFBQSxRQUFBLE1BQUEsT0FBQTs7UUFFQSxPQUFBLE9BQUE7UUFDQSxPQUFBLEtBQUEsT0FBQSxLQUFBLEtBQUE7UUFDQSxPQUFBLEtBQUEsVUFBQSxLQUFBLEtBQUE7O1FBRUEsT0FBQSxRQUFBLFVBQUEsUUFBQTs7WUFFQSxNQUFBLFFBQUE7O0tBRUE7O0FDZEEsQ0FBQSxZQUFBOztJQUVBLFFBQUEsT0FBQSxZQUFBLFdBQUEsbUJBQUEsQ0FBQSxVQUFBLFFBQUEsU0FBQSxVQUFBLFFBQUEsTUFBQSxPQUFBOztZQUVBLE9BQUEsUUFBQSxLQUFBO1lBQ0EsT0FBQSxVQUFBLEtBQUE7O1lBRUEsT0FBQSxRQUFBLFVBQUEsUUFBQTtnQkFDQSxNQUFBLFFBQUE7Ozs7QUNSQSxDQUFBLFdBQUE7O0lBRUEsUUFBQSxPQUFBLFlBQUEsV0FBQSxzQkFBQSxDQUFBLFVBQUEsUUFBQSxTQUFBOztJQUVBLFNBQUEsbUJBQUEsUUFBQSxNQUFBLE9BQUE7O1FBRUEsT0FBQSxRQUFBLEtBQUEsS0FBQTtRQUNBLE9BQUEsVUFBQSxLQUFBLEtBQUE7O1FBRUEsT0FBQSxlQUFBLFVBQUEsUUFBQTtZQUNBLE1BQUEsUUFBQTs7S0FFQTs7QUNaQSxDQUFBLFdBQUE7O0lBRUEsUUFBQSxPQUFBLGNBQUEsV0FBQSxzQkFBQSxDQUFBLFVBQUEsWUFBQSxTQUFBOztJQUVBLFNBQUEsbUJBQUEsUUFBQSxVQUFBLE9BQUE7O1FBRUEsT0FBQSxPQUFBO1lBQ0EsTUFBQTtZQUNBLGFBQUE7Ozs7OztRQU1BLFNBQUEsS0FBQSxTQUFBLEtBQUEsb0JBQUEsVUFBQSxPQUFBOztZQUVBLEdBQUEsTUFBQSxVQUFBLElBQUE7Z0JBQ0EsU0FBQSxNQUFBO2dCQUNBLE9BQUEsTUFBQTtnQkFDQSxPQUFBOzs7O1FBSUEsT0FBQSxRQUFBLFVBQUEsUUFBQTs7WUFFQSxNQUFBLFFBQUE7Ozs7S0FJQTtLQUNBIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogVGhpcyBjb25maWcgaXMgaW50ZW5kZWQgdG8gYmUgaW5qZWN0ZWQgaW4geW91ciBzcmNcbiAqL1xuYW5ndWxhci5tb2R1bGUoXCJhcHAuY29uZmlnXCIsIFtdKVxuICAgIC5jb25zdGFudChcImNvbmZpZ1wiLCB7XG4gICAgICAgIFwiYXBpXCI6IFwiaHR0cDovL2xvY2FsaG9zdDo4MDAxL2FwaS92MVwiLCBcbiAgICAgICAgXCJkZWJ1Z1wiOiB0cnVlLFxuICAgICAgICBcIlNSQ19GT0xERVJcIjogJy9zcmMvYXBwX21vZHVsZXMvJyxcbiAgICAgICAgXCJJTUdfRk9MREVSXCI6ICcvaW1nLycsXG4gICAgICAgIFwiUFJPRklMRV9JTUdfRk9MREVSXCI6ICcvaW1nL3Byb2ZpbGUvJ1xuICAgIH0pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcC5jYXJkcycsIFtdKTtcblxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5hbmd1bGFyLm1vZHVsZSgnYXBwJywgWyduZycsICduZ1JvdXRlJywgJ25nQ29va2llcycsICdhcHAuY29uZmlnJywgJ2FwcC5ob21lJywgJ2FuZ3VsYXJNb2RhbFNlcnZpY2UnLCAncGFzY2FscHJlY2h0LnRyYW5zbGF0ZSddKTtcbiAgXG4vKipcbiAqIFJlc3Qgb2YgdGhlIGdsb2JhbCBjb25maWcgY2FuIGJlIGZvdW5kIGluIGFwcC1jb25maWcgbW9kdWxlXG4gKi8gIFxuYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmNvbmZpZyhbJyRodHRwUHJvdmlkZXInLCAnJGxvZ1Byb3ZpZGVyJywgJyR0cmFuc2xhdGVQcm92aWRlcicsICdjb25maWcnLCBcbiAgICBmdW5jdGlvbiAoJGh0dHBQcm92aWRlciwgJGxvZ1Byb3ZpZGVyLCAkdHJhbnNsYXRlUHJvdmlkZXIsIGNvbmZpZykge1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFqYXggY2FsbHNcbiAgICAgICAgICovIFxuICAgICAgICAkaHR0cFByb3ZpZGVyLmRlZmF1bHRzLmhlYWRlcnMuY29tbW9uID0geyBcbiAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb247b2RhdGE9dmVyYm9zZScsXG4gICAgICAgICAgICAnWC1Mb2dpbi1BamF4LWNhbGwnOiAndHJ1ZScsXG4gICAgICAgICAgICAnWC1SZXF1ZXN0ZWQtV2l0aCc6IFwiWE1MSHR0cFJlcXVlc3RcIixcbiAgICAgICAgICAgICdYLUNTUkYtVE9LRU4nOiBMYXJhdmVsLmNzcmZUb2tlblxuICAgICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIERlYnVnZ2luZ1xuICAgICAgICAgKi8gXG4gICAgICAgICRsb2dQcm92aWRlci5kZWJ1Z0VuYWJsZWQoY29uZmlnLmRlYnVnKTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUcmFuc2xhdGlvbnNcbiAgICAgICAgICovICAgICBcbiAgICAgICAgJHRyYW5zbGF0ZVByb3ZpZGVyLnVzZVN0YXRpY0ZpbGVzTG9hZGVyKHtcbiAgICAgICAgICAgIHByZWZpeDogJy9pMThuL2xvY2FsZS0nLFxuICAgICAgICAgICAgc3VmZml4OiAnLmpzb24nXG4gICAgICAgIH0pO1xuXG4gICAgICAgICR0cmFuc2xhdGVQcm92aWRlci51c2VDb29raWVTdG9yYWdlKCk7XG4gICAgICAgICR0cmFuc2xhdGVQcm92aWRlci5wcmVmZXJyZWRMYW5ndWFnZSgnZW5fVVMnKTtcbiAgICAgICAgJHRyYW5zbGF0ZVByb3ZpZGVyLmZhbGxiYWNrTGFuZ3VhZ2UoJ2VuX1VTJyk7XG4gICAgICAgICR0cmFuc2xhdGVQcm92aWRlci51c2VTYW5pdGl6ZVZhbHVlU3RyYXRlZ3koJ2VzY2FwZScpO1xufV0pO1xuIFxuYW5ndWxhci5tb2R1bGUoJ2FwcCcpLnJ1bihbZnVuY3Rpb24gKCkge1xuIFxufV0pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcC5ob21lJywgWyduZ1JvdXRlJywgJ2FwcC5jb25maWcnLCAnbmdBbmltYXRlJywgJ2FwcC5jYXJkcycsICdhcHAuc3RhY2tzJywgJ2FwcC50YWdzJywgJ2hjLm1hcmtlZCcsICduZ1Nhbml0aXplJ10pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcC5zdGFja3MnLCBbJ25nUmVzb3VyY2UnXSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwLnRhZ3MnLCBbJ25nUmVzb3VyY2UnXSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwLmNhcmRzJykuY29uZmlnKGZ1bmN0aW9uKCRyb3V0ZVByb3ZpZGVyKSB7XG4gICBcbn0pOyIsIihmdW5jdGlvbiAoKSB7XG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmNvbmZpZyhbJyRyb3V0ZVByb3ZpZGVyJywgJ2NvbmZpZycsIGZ1bmN0aW9uKCRyb3V0ZVByb3ZpZGVyLCBjb25maWcpIHtcblxuICAgICAgJHJvdXRlUHJvdmlkZXJcbiAgICAgICAgLndoZW4oJy8nLCB7XG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogY29uZmlnLlNSQ19GT0xERVIgKyAnaG9tZS90ZW1wbGF0ZXMvaG9tZS10ZW1wbGF0ZS5odG1sJyxcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdIb21lQ29udHJvbGxlcicsXG4gICAgICAgICAgICBjb250cm9sbGVyQXM6ICdob21lJ1xuICAgICAgICB9KVxuXG4gICAgICAgIC5vdGhlcndpc2Uoe3JlZGlyZWN0VG86ICcvJ30pOyBcbiAgICB9XSk7XG59KSgpOyIsImFuZ3VsYXIubW9kdWxlKCdhcHAuaG9tZScpLmNvbmZpZyhmdW5jdGlvbigkcm91dGVQcm92aWRlcikge1xuXG59KTsiLCJcbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcblxuICAgIC8vIHN3aXRjaCBmb3Jtc1xuICAgICQoJy5tZXNzYWdlIGEnKS5jbGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgIFxuICAgICAgICAkKCdmb3JtJykuYW5pbWF0ZSh7aGVpZ2h0OiBcInRvZ2dsZVwiLCBvcGFjaXR5OiBcInRvZ2dsZVwifSwgXCJzbG93XCIpO1xuICAgICAgICBcbiAgICAgICAgaWYod2luZG93LmxvY2F0aW9uLnBhdGhuYW1lID09ICcvbG9naW4nKSB7XG4gICAgICAgICAgICBoaXN0b3J5LnB1c2hTdGF0ZSh7fSwgXCJSZWdpc3RlclwiLCBcIi9yZWdpc3RlclwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGhpc3RvcnkucHVzaFN0YXRlKHt9LCBcIkxvZ2luXCIsIFwiL2xvZ2luXCIpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAkKCdmb3JtIC5oZWxwLWJsb2NrJykuaGlkZSgpO1xuICAgIH0pO1xuXG59KTsiLCJhbmd1bGFyLm1vZHVsZSgnYXBwLnN0YWNrcycpLmNvbmZpZyhmdW5jdGlvbigkcm91dGVQcm92aWRlcikge1xuXG59KTsiLCIoZnVuY3Rpb24gKCkge1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5jYXJkcycpLmRpcmVjdGl2ZSgnY2FyZCcsXG4gICAgICAgIFsnY29uZmlnJywgZnVuY3Rpb24gKGNvbmZpZykge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogY29uZmlnLlNSQ19GT0xERVIgKyAnY2FyZHMvdGVtcGxhdGVzL2NhcmQuaHRtbCcsXG4gICAgICAgICAgICAgICAgcmVzdHJpY3Q6ICdBJyxcbiAgICAgICAgICAgICAgICB0cmFuc2NsdWRlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICAgICAgICAgIGNhcmQ6IFwiPWRhdGFcIlxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogWyckc2NvcGUnLCAnJHJvb3RTY29wZScsICckbG9nJywgJ2NvbmZpZycsICdjYXJkc0ZhY3RvcnknLCAnTW9kYWxTZXJ2aWNlJyxcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKCRzY29wZSwgJHJvb3RTY29wZSwgJGxvZywgY29uZmlnLCBjYXJkc0ZhY3RvcnksIE1vZGFsU2VydmljZSkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIERpc3BsYXkgb25seSBYIHRhZ3NcbiAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLm1heF9udW1fdGFncyA9IDM7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICogUGluIENhcmQgKG1ha2UgaXQgJ3N0aWNreScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIEBwYXJhbSBDYXJkIGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgICAgICAqIEByZXR1cm5zIHZvaWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnBpbkNhcmQgPSBmdW5jdGlvbiAoaXRlbSkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNhcmQgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBpdGVtLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGlja3k6ICFpdGVtLnN0aWNreVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFqYXggY2FsbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhcmRzRmFjdG9yeS51cGRhdGUoY2FyZCkuJHByb21pc2UudGhlbihmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZW1taXQgZXZlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdwaW4tY2FyZCcsIGl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJGxvZy5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBEZWxldGUgQ2FyZFxuICAgICAgICAgICAgICAgICAgICAgICAgICogXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBAcGFyYW0gQ2FyZCBpdGVtXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBAcmV0dXJucyB2b2lkXG4gICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5kZWxldGUgPSBmdW5jdGlvbiAoaXRlbSkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSnVzdCBwcm92aWRlIGEgdGVtcGxhdGUgdXJsLCBhIGNvbnRyb2xsZXIgYW5kIGNhbGwgJ3Nob3dNb2RhbCcuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTW9kYWxTZXJ2aWNlLnNob3dNb2RhbCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBjb25maWcuU1JDX0ZPTERFUiArIFwiY29tbW9uL3RlbXBsYXRlcy9tb2RhbHMvY29uZmlybS5odG1sXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IFwiWWVzTm9Db250cm9sbGVyXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0czoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICd0aXRsZSc6ICdEZWxldGUgY2FyZD8nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdjb250ZW50JzogXCJZb3UnbGwgbm90IGJlIGFibGUgdG8gcmVjb3ZlciBpdFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIChtb2RhbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RhbC5lbGVtZW50Lm1vZGFsKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFsLmNsb3NlLnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0KSB7ICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFqYXggY2FsbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhcmRzRmFjdG9yeS5kZWxldGUoe2lkOiBpdGVtLmlkfSkuJHByb21pc2UudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBlbW1pdCBldmVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ2RlbGV0ZS1jYXJkJywgaXRlbSk7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRsb2cuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIEVkaXQgQ2FyZFxuICAgICAgICAgICAgICAgICAgICAgICAgICogXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBAcGFyYW0gQ2FyZCBpdGVtXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBAcmV0dXJucyB2b2lkXG4gICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5lZGl0ID0gZnVuY3Rpb24gKGl0ZW0pIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1vZGFsU2VydmljZS5zaG93TW9kYWwoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogY29uZmlnLlNSQ19GT0xERVIgKyBcImNhcmRzL3RlbXBsYXRlcy9tb2RhbHMvZWRpdC1jYXJkLmh0bWxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogXCJFZGl0Q2FyZENvbnRyb2xsZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXRzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FyZDogaXRlbVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkudGhlbihmdW5jdGlvbiAobW9kYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWwuZWxlbWVudC5tb2RhbCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RhbC5jbG9zZS50aGVuKGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHByZXBhcmUgZGF0YSB0byBiZSBzZW5kIHRvIHNlcnZlciBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgY2FyZCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGl0ZW0uaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IG1vZGFsLnNjb3BlLmZvcm0ubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogbW9kYWwuc2NvcGUuZm9ybS5jb250ZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYWpheCBjYWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FyZHNGYWN0b3J5LnVwZGF0ZShjYXJkKS4kcHJvbWlzZS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGVtbWl0IGV2ZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgndXBkYXRlLWNhcmQnLCBpdGVtLCBjYXJkKTsgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJGxvZy5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICogVmlldyBjb250ZW50IGluIG1vZGFsYm94IHdpdGggTWFya2Rvd24gKHJpY2ggdGV4dCBtb2RlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICogXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBAcGFyYW0gQ2FyZCBpdGVtXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBAcmV0dXJucyB2b2lkXG4gICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS52aWV3QXNNYXJrZG93bk1vZGFsID0gZnVuY3Rpb24gKGl0ZW0pIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEp1c3QgcHJvdmlkZSBhIHRlbXBsYXRlIHVybCwgYSBjb250cm9sbGVyIGFuZCBjYWxsICdzaG93TW9kYWwnLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1vZGFsU2VydmljZS5zaG93TW9kYWwoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogY29uZmlnLlNSQ19GT0xERVIgKyBcImhvbWUvdGVtcGxhdGVzL21vZGFscy9tYXJrZG93bi5odG1sXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IFwiTWFya2Rvd25Db250cm9sbGVyXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0czoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdjYXJkJzogaXRlbVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkudGhlbihmdW5jdGlvbiAobW9kYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWwuZWxlbWVudC5tb2RhbCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBPbiBuZXcgdGFnIGFkZGVkLCBwdXNoIGl0IHRvIHRoZSBsaXN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS4kb24oJ25ldy10YWcnLCBmdW5jdGlvbihldnQsIGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhZGQgdGFnIGFzIHRoZSBsYXN0IHZpc2libGUgb2YgWCB0YWdzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYodHlwZW9mKCRzY29wZS5jYXJkLnRhZ3MpICE9PSAndW5kZWZpbmVkJyl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFkZCB0YWcgdG8gdGhlIGxpc3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmNhcmQudGFncy5zcGxpY2UoJHNjb3BlLm1heF9udW1fdGFncy0xLCAwLCBkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjcmVhdGUgdGhlIGxpc3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmNhcmQudGFncyA9IFtkYXRhXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XVxuICAgICAgICB9O1xuICAgIH1dKTtcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcblxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuY2FyZHMnKS5kaXJlY3RpdmUoJ25ld0NhcmRGb3JtJyxcbiAgICAgICAgWydjb25maWcnLCBmdW5jdGlvbiAoY29uZmlnKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgICAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgICAgICAgICAgY2FyZDogXCI9XCJcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IGNvbmZpZy5TUkNfRk9MREVSICsgJ2NhcmRzL3RlbXBsYXRlcy9uZXctZm9ybS5odG1sJyxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBbJyRzY29wZScsICckcm9vdFNjb3BlJywgJyRsb2cnLCAnY2FyZHNGYWN0b3J5JywgZnVuY3Rpb24gKCRzY29wZSwgJHJvb3RTY29wZSwgJGxvZywgY2FyZHNGYWN0b3J5KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFN1Ym1pdCBmb3JtXG4gICAgICAgICAgICAgICAgICAgICAqIEByZXR1cm5zIHZvaWRcbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5jcmVhdGVDYXJkID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoJHNjb3BlLmNvbnRlbnQpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBkYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAkc2NvcGUubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogJHNjb3BlLmNvbnRlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FyZHNGYWN0b3J5LnNhdmUoZGF0YSkuJHByb21pc2UudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jbGFzcyA9ICdoaWdobGlnaHRlZCc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuaWQgPSByZXNwb25zZS5pZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCduZXctY2FyZCcsIGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkbG9nLmVycm9yKHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmNvbnRlbnQgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdfVxuICAgICAgICB9XSk7XG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmRpcmVjdGl2ZSgncGFnaW5hdGVDYXJkcycsIFsnY29uZmlnJyxcbiAgICAgICAgZnVuY3Rpb24gKGNvbmZpZykge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHJlc3RyaWN0OiAnRUEnLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBjb25maWcuU1JDX0ZPTERFUiArICcvY2FyZHMvdGVtcGxhdGVzL3BhZ2luYXRlLWNhcmRzLmh0bWwnLFxuICAgICAgICAgICAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgICAgICAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogJz0nXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBbJyRzY29wZScsICckcm9vdFNjb3BlJywgZnVuY3Rpb24gKCRzY29wZSwgJHJvb3RTY29wZSkge1xuICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBEcmF3IHdpZGdldCB3aGVuIGRhdGEgaXMgYXZhaWxhYmxlXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuJG9uKCdjYXJkcy1sb2FkZWQnLCBmdW5jdGlvbihldnQsIGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5wYWdlcyA9IGRhdGE7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIEJyb2FkY2FzdCBjaGFuZ2VzXG4gICAgICAgICAgICAgICAgICAgICAqIEByZXR1cm5zIHZvaWRcbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5uYXZpZ2F0ZSA9IGZ1bmN0aW9uICgkZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgJGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAkZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHRhcmdldCA9ICRldmVudC5jdXJyZW50VGFyZ2V0O1xuICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBpZih0eXBlb2YodGFyZ2V0LmF0dHJpYnV0ZXNbJ2Rpc2FibGVkJ10pID09PSAndW5kZWZpbmVkJyB8fCAhdGFyZ2V0LmF0dHJpYnV0ZXNbJ2Rpc2FibGVkJ10udmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ2NhcmRzLXBhZ2UtY2hhbmdlZCcsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFnZTogdGFyZ2V0LmF0dHJpYnV0ZXNbJ2RhdGEtcGFnZSddLnZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7IC8vIGVtbWl0XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIF0pO1xufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5jYXJkcycpLmZhY3RvcnkoJ2NhcmRzRmFjdG9yeScsIFsnJHJlc291cmNlJywgJ2NvbmZpZycsIGZ1bmN0aW9uKCRyZXNvdXJjZSwgY29uZmlnKSB7XG5cbiAgICAgICAgcmV0dXJuICRyZXNvdXJjZShjb25maWcuYXBpICsgJy9jYXJkcy86aWQnLCBcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpZDogJ0BpZCcsXG4gICAgICAgICAgICAgICAgcGFnZTogJ0BwYWdlJ1xuICAgICAgICAgICAgfSwgXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcXVlcnk6IHtcbiAgICAgICAgICAgICAgICAgICAgdXJsOiBjb25maWcuYXBpICsgJy9jYXJkcy90YWdzL2FsbCcsXG4gICAgICAgICAgICAgICAgICAgIGlzQXJyYXk6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm1SZXNwb25zZTogZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYW5ndWxhci5mcm9tSnNvbihyZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHVwZGF0ZToge1xuICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnUFVUJyBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTsgXG4gICAgfV0pO1xufSkoKTtcblxuIiwiKGZ1bmN0aW9uICgpIHtcblxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAnKS5jb250cm9sbGVyKCdIZWFkZXJDb250cm9sbGVyJywgWyckc2NvcGUnLCBIZWFkZXJDb250cm9sbGVyXSk7XG5cbiAgICBmdW5jdGlvbiBIZWFkZXJDb250cm9sbGVyKCRzY29wZSkge1xuICAgICAgICBcbiAgICB9XG59KSgpO1xuXG5cbiIsIihmdW5jdGlvbiAoKSB7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwJykuY29udHJvbGxlcignTGF5b3V0Q29udHJvbGxlcicsIFsnJHNjb3BlJywgJyRzY2UnLCBMYXlvdXRDb250cm9sbGVyXSk7XG5cbiAgICBmdW5jdGlvbiBMYXlvdXRDb250cm9sbGVyKCRzY29wZSwgJHNjZSkge1xuXG4gICAgICAgICRzY29wZS50YWdVc2VyQ2xpY2sgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICB2YXIgdGFnVGV4dCA9IGUudGFyZ2V0LmlubmVyVGV4dDtcbiAgICAgICAgICAgIGFsZXJ0KCd0YWdVc2VyQ2xpY2ssIHRhZ1RleHQ6ICcgKyB0YWdUZXh0KTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgICRzY29wZS50YWdUZXJtQ2xpY2sgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICB2YXIgdGFnVGV4dCA9IGUudGFyZ2V0LmlubmVyVGV4dDtcbiAgICAgICAgICAgIGFsZXJ0KCd0YWdUZXJtQ2xpY2ssIHRhZ1RleHQ6ICcgKyB0YWdUZXh0KTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8vIFlvdSBjb3VsZCBkZWZpbmUgJ3RhZ1VzZXJDbGljaycgYW5kICd0YWdUZXJtQ2xpY2snXG4gICAgICAgIC8vIG9uIHRoZSAnJHJvb3RTY29wZScuIFRoaXMgd2F5IHlvdSBjYW4gaGFuZGxlIHdoYXRldmVyXG4gICAgICAgIC8vIGxvZ2ljIHlvdSB3YW50IGZvciBoYXNodGFncyBpbiBvbmUgcGxhY2UgcmF0aGVyIHRoYW5cbiAgICAgICAgLy8gaGF2aW5nIHRvIGRlZmluZSBpdCBpbiBlYWNoIGNvbnRyb2xsZXIuXG4gICAgICAgIFxuICAgICAgICAkc2NvcGUudHJ1c3RIdG1sID0gZnVuY3Rpb24oaHRtbCkge1xuICAgICAgICAgICAgLy8gU2FuaXRpemUgbWFudWFsbHkgaWYgbmVjZXNzYXJ5LiBJdCdzIGxpa2VseSB0aGlzXG4gICAgICAgICAgICAvLyBodG1sIGhhcyBhbHJlYWR5IGJlZW4gc2FuaXRpemVkIHNlcnZlciBzaWRlXG4gICAgICAgICAgICAvLyBiZWZvcmUgaXQgd2VudCBpbnRvIHlvdXIgZGF0YWJhc2UuXG4gICAgICAgICAgICAvLyBEb24ndCBob2xkIG1lIGxpYWJsZSBmb3IgWFNTLi4uIG5ldmVyIGFzc3VtZSA6filcbiAgICAgICAgICAgIHJldHVybiAkc2NlLnRydXN0QXNIdG1sKGh0bWwpO1xuICAgICAgICB9O1xuICAgIH1cbn0pKCk7XG5cblxuIiwiKGZ1bmN0aW9uICgpIHtcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwJykuZGlyZWN0aXZlKCdhdXRvZm9jdXMnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByZXN0cmljdDogJ0EnLFxuICAgICAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudFswXS5mb2N1cygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0pO1xufSkoKTtcblxuICAgICAiLCIoZnVuY3Rpb24gKCkge1xuICAgIC8vIEJlY2F1c2Ugb2YgdGhlIGFubWUgYW5kIEUgdHlwZSwgd29ya3MgYXV0b21hdGljYWxseSBmb3IgZXZlcnkgdGV4dGFyZWFcbiAgICAvLyByZWY6IGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL3Rob21zZWRkb24vNDcwMzk2OFxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAnKS5kaXJlY3RpdmUoJ2VsYXN0aWNBcmVhJywgZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmVzdHJpY3Q6ICdBJyxcbiAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cmlidXRlcykge1xuICAgICAgICAgICAgICAgIHZhciB0aHJlc2hvbGQgPSAzNSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbkhlaWdodCA9IGVsZW1lbnRbMF0ub2Zmc2V0SGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZ0xlZnQgPSBlbGVtZW50LmNzcygncGFkZGluZ0xlZnQnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmdSaWdodCA9IGVsZW1lbnQuY3NzKCdwYWRkaW5nUmlnaHQnKTtcblxuICAgICAgICAgICAgICAgIHZhciAkc2hhZG93ID0gYW5ndWxhci5lbGVtZW50KCc8ZGl2PjwvZGl2PicpLmNzcyh7XG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgICAgICAgICAgICAgICB0b3A6IC0xMDAwMCxcbiAgICAgICAgICAgICAgICAgICAgbGVmdDogLTEwMDAwLFxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogZWxlbWVudFswXS5vZmZzZXRXaWR0aCAtIHBhcnNlSW50KHBhZGRpbmdMZWZ0IHx8IDApIC0gcGFyc2VJbnQocGFkZGluZ1JpZ2h0IHx8IDApLFxuICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogZWxlbWVudC5jc3MoJ2ZvbnRTaXplJyksXG4gICAgICAgICAgICAgICAgICAgIGZvbnRGYW1pbHk6IGVsZW1lbnQuY3NzKCdmb250RmFtaWx5JyksXG4gICAgICAgICAgICAgICAgICAgIGxpbmVIZWlnaHQ6IGVsZW1lbnQuY3NzKCdsaW5lSGVpZ2h0JyksXG4gICAgICAgICAgICAgICAgICAgIHJlc2l6ZTogJ25vbmUnXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuYm9keSkuYXBwZW5kKCRzaGFkb3cpO1xuXG4gICAgICAgICAgICAgICAgdmFyIHVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRpbWVzID0gZnVuY3Rpb24gKHN0cmluZywgbnVtYmVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgciA9ICcnOyBpIDwgbnVtYmVyOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByICs9IHN0cmluZztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHZhbCA9IGVsZW1lbnQudmFsKCkucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8mL2csICcmYW1wOycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcbiQvLCAnPGJyLz4mbmJzcDsnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXG4vZywgJzxici8+JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxzezIsfS9nLCBmdW5jdGlvbiAoc3BhY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRpbWVzKCcmbmJzcDsnLCBzcGFjZS5sZW5ndGggLSAxKSArICcgJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAkc2hhZG93Lmh0bWwodmFsKTtcblxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmNzcygnaGVpZ2h0JywgTWF0aC5tYXgoJHNoYWRvd1swXS5vZmZzZXRIZWlnaHQgKyB0aHJlc2hvbGQsIG1pbkhlaWdodCkpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICRzaGFkb3cucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBlbGVtZW50LmJpbmQoJ2tleXVwIGtleWRvd24ga2V5cHJlc3MgY2hhbmdlJywgdXBkYXRlKTtcbiAgICAgICAgICAgICAgICB1cGRhdGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xufSkoKTsiLCIoZnVuY3Rpb24gKCkgeyBcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwJykuZGlyZWN0aXZlKCdoYXNodGFnaWZ5JywgWyckdGltZW91dCcsICckY29tcGlsZScsXG4gICAgICAgIGZ1bmN0aW9uKCR0aW1lb3V0LCAkY29tcGlsZSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICByZXN0cmljdDogJ0EnLFxuICAgICAgICAgICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICAgICAgICAgIHVDbGljazogJyZ1c2VyQ2xpY2snLFxuICAgICAgICAgICAgICAgICAgICB0Q2xpY2s6ICcmdGVybUNsaWNrJ1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGh0bWwgPSBlbGVtZW50Lmh0bWwoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGh0bWwgPT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXR0cnMudXNlckNsaWNrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaHRtbCA9IGh0bWwucmVwbGFjZSgvKHxcXHMpKkAoXFx3KykvZywgJyQxPGEgbmctY2xpY2s9XCJ1Q2xpY2soeyRldmVudDogJGV2ZW50fSlcIiBjbGFzcz1cImhhc2h0YWdcIj5AJDI8L2E+Jyk7IFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXR0cnMudGVybUNsaWNrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaHRtbCA9IGh0bWwucmVwbGFjZSgvKF58XFxzKSojKFxcdyspL2csICckMTxhIG5nLWNsaWNrPVwidENsaWNrKHskZXZlbnQ6ICRldmVudH0pXCIgY2xhc3M9XCJoYXNodGFnXCI+IyQyPC9hPicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50Lmh0bWwoaHRtbCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICRjb21waWxlKGVsZW1lbnQuY29udGVudHMoKSkoc2NvcGUpO1xuICAgICAgICAgICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgXSk7XG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmRpcmVjdGl2ZSgnc2Vzc2lvbkRyb3Bkb3duJywgWydjb25maWcnLFxuICAgICAgICBmdW5jdGlvbiAoY29uZmlnKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcmVzdHJpY3Q6ICdFQScsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IGNvbmZpZy5TUkNfRk9MREVSICsgJy9jb21tb24vdGVtcGxhdGVzL3Nlc3Npb24tZHJvcGRvd24uaHRtbCcsICAgXG4gICAgICAgICAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogXCI9XCJcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50cywgYXR0cnMpIHtcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuaW1nX2ZvbGRlciA9IGNvbmZpZy5QUk9GSUxFX0lNR19GT0xERVI7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBbJyRzY29wZScsIGZ1bmN0aW9uICgkc2NvcGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUudXNlciA9ICRzY29wZS5kYXRhO1xuICAgICAgICAgICAgICAgIH1dXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgXSk7ICAgICAgIFxufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmRpcmVjdGl2ZSgnc2hvd01vcmUnLFxuICAgICAgICBbJ2NvbmZpZycsIGZ1bmN0aW9uIChjb25maWcpIHtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogY29uZmlnLlNSQ19GT0xERVIgKyAnY29tbW9uL3RlbXBsYXRlcy9zaG93TW9yZS5odG1sJyxcbiAgICAgICAgICAgICAgICByZXN0cmljdDogJ0EnLFxuICAgICAgICAgICAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgICAgICAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgICAgICAgICAgJ3Nob3dNb3JlSGVpZ2h0JzogJ0AnXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBbJyRzY29wZScsICckZWxlbWVudCcsICckaW50ZXJ2YWwnLCBmdW5jdGlvbiAoJHNjb3BlLCAkZWxlbWVudCwgJGludGVydmFsKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5leHBhbmRlZCA9IGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAkaW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlclN0eWxlcygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgMzAwKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmV4cGFuZGFibGUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHJlbmRlclN0eWxlcygpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoJGVsZW1lbnQuaGVpZ2h0KCkgPj0gJHNjb3BlLnNob3dNb3JlSGVpZ2h0ICYmICRzY29wZS5leHBhbmRlZCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmV4cGFuZGFibGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnNob3dMZXNzU3R5bGUgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ21heC1oZWlnaHQnOiAkc2NvcGUuc2hvd01vcmVIZWlnaHQgKyAncHgnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdvdmVyZmxvdyc6ICdoaWRkZW4nXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIH1dXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XSk7XG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcCcpXG4gICAgICAgIC5maWx0ZXIoJ3JlZHVjZUJ5JywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGNvbGxlY3Rpb24sIGZpZWxkKSB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbGxlY3Rpb24ucmVkdWNlKGZ1bmN0aW9uKG91dHB1dCwgY3VycmVudCl7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZighZmllbGRFeGlzdHMob3V0cHV0LCBmaWVsZCwgY3VycmVudFtmaWVsZF0pKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBvdXRwdXQuY29uY2F0KGN1cnJlbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICAgICAgICAgICAgICAgICAgfSwgW10pO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBmaWVsZEV4aXN0cyhoYXlzdGFjaywgZmllbGROYW1lLCBmaWVsZFZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBoYXlzdGFjay5zb21lKGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVsW2ZpZWxkTmFtZV0gPT09IGZpZWxkVmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIH0pOyBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9OyAgICAgICAgICAgIFxuICAgICAgICB9KTtcbn0pKCk7XG5cbiIsIihmdW5jdGlvbiAoKSB7XG4gICAgXG4gICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAnKS5mYWN0b3J5KCdxdWVyeUZhY3RvcnknLCBbJyRsb2cnLCAnJGNvb2tpZXMnLCAnJHJvb3RTY29wZScsICdjYXJkc0ZhY3RvcnknLCAnc3RhY2tzRmFjdG9yeScsIHF1ZXJ5RmFjdG9yeV0pO1xuICAgIFxuICAgIGZ1bmN0aW9uIHF1ZXJ5RmFjdG9yeSgkbG9nLCAkY29va2llcywgJHJvb3RTY29wZSwgY2FyZHNGYWN0b3J5LCBzdGFja3NGYWN0b3J5KSB7XG4gICAgICAgIFxuICAgICAgICB2YXIgZmFjdG9yeSA9IHt9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIGdldCBhbGwgY2FyZHMgZnJvbSBzZXJ2ZXIgZm9yIGEgZ2l2ZW4gdXNlclxuICAgICAgICAgKiBcbiAgICAgICAgICogQHBhcmFtIGpzb24gcGFyYW1zXG4gICAgICAgICAqIEByZXR1cm5zIGNhcmRzRmFjdG9yeVxuICAgICAgICAgKiBAYnJvYWRjYXN0IGNhcmRzIGxpc3RcbiAgICAgICAgICovXG4gICAgICAgIGZhY3RvcnkuYWxsID0gZnVuY3Rpb24gKHBhcmFtcykge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBwZXJzaXN0IHBhcmFtcyAoYnV0IHBhZ2UgbnVtYmVyKVxuICAgICAgICAgICAgaWYodHlwZW9mKHBhcmFtcykgIT09ICd1bmRlZmluZWQnKSB7XG5cbiAgICAgICAgICAgICAgICBpZih0eXBlb2YocGFyYW1zLm9yZGVyKSAhPT0gJ3VuZGVmaW5lZCcpIHtcblxuICAgICAgICAgICAgICAgICAgICAkY29va2llcy5wdXRPYmplY3QoJ29yZGVyJywgYW5ndWxhci5mcm9tSnNvbihwYXJhbXMub3JkZXIpKTsgICBcblxuICAgICAgICAgICAgICAgICAgICBwYXJhbXMgPSBwYXJhbXMub3JkZXI7IC8vIHVud3JhcCBkYXRhICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gcXVlcnlcbiAgICAgICAgICAgIHJldHVybiBjYXJkc0ZhY3RvcnlcbiAgICAgICAgICAgICAgICAucXVlcnkocGFyYW1zLCBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGJyb2FkY2FzdChyZXNwb25zZSk7IC8vIHRlbGwgdGhlIHdvcmxkXG4gICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICRsb2cuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICB9KTsgIFxuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIGdldCBjYXJkIGJ5IHN0YWNrXG4gICAgICAgICAqIFxuICAgICAgICAgKiBAcGFyYW0ganNvbiBwYXJhbXNcbiAgICAgICAgICogQHJldHVybnMgc3RhY2tzRmFjdG9yeVxuICAgICAgICAgKiBAYnJvYWRjYXN0IGNhcmRzIGxpc3RcbiAgICAgICAgICovXG4gICAgICAgIGZhY3RvcnkuYnlTdGFjayA9IGZ1bmN0aW9uIChwYXJhbXMpIHtcbiAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIHN0YWNrc0ZhY3RvcnkuZmlsdGVyKHBhcmFtcywgZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBicm9hZGNhc3QocmVzcG9uc2UpOyAvLyB0ZWxsIHRoZSB3b3JsZFxuICAgICAgICAgICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgICAgJGxvZy5lcnJvcihlcnIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUZWxsIGV2ZXJ5Ym9keSB3ZSBoYXZlIGEgcmVub3ZhdGVkIGxpc3RcbiAgICAgICAgICovXG4gICAgICAgIGZ1bmN0aW9uIGJyb2FkY2FzdChkYXRhKSB7XG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ2NhcmRzLWxvYWRlZCcsIGRhdGEpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gZmFjdG9yeTtcbiAgICB9ICAgIFxufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5ob21lJykuY29udHJvbGxlcignSG9tZUNvbnRyb2xsZXInLCBbJyRzY29wZScsIEhvbWVDb250cm9sbGVyXSk7XG5cbiAgICBmdW5jdGlvbiBIb21lQ29udHJvbGxlcigkc2NvcGUpIHtcbiAgICAgICAgICBcbiAgICB9XG59KSgpO1xuXG5cbiIsIihmdW5jdGlvbigpe1xuICAgIFxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuaG9tZScpLmNvbnRyb2xsZXIoJ0xpc3RDb250cm9sbGVyJywgWyckc2NvcGUnLCAnJGxvZycsICckY29va2llcycsICckZWxlbWVudCcsICdxdWVyeUZhY3RvcnknLCAnSG9tZUNvbnRleHRTZXJ2aWNlJywgTGlzdENvbnRyb2xsZXJdKTtcbiAgICBcbiAgICBmdW5jdGlvbiBMaXN0Q29udHJvbGxlcigkc2NvcGUsICRsb2csICRjb29raWVzLCAkZWxlbWVudCwgcXVlcnlGYWN0b3J5LCBIb21lQ29udGV4dFNlcnZpY2Upe1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdheSB0byBrZWVwIHNpYmxpbmdzIGNvbm5lY3RlZCBhbmQgc2hhcmluZyBzY29wZVxuICAgICAgICAgKi9cbiAgICAgICAgJHNjb3BlLmNvbnRleHQgPSBIb21lQ29udGV4dFNlcnZpY2UuY29udGV4dDtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHZXQgY2FyZHMgbGlzdFxuICAgICAgICAgKi9cbiAgICAgICAgJHNjb3BlLmxvYWQgPSBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gZ2V0IGRhdGEgZnJvbSBzZXJ2ZXJcbiAgICAgICAgICAgIHF1ZXJ5RmFjdG9yeVxuICAgICAgICAgICAgICAgIC5hbGwocGFyYW1zKS4kcHJvbWlzZS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgJGxvZy5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgIH0pOyAgXG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAkc2NvcGUubG9hZCgpOyAvLyBydW4gYXQgcGFnZSBsb2FkXG4gICAgICAgIFxuICAgICAgICAkc2NvcGUuJG9uKCdjYXJkcy1sb2FkZWQnLCBmdW5jdGlvbihldnQsIHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAkc2NvcGUuY29udGV4dC5jYXJkcyA9IHJlc3BvbnNlLmRhdGE7IC8vIGNhcmRzIGxpc3RcbiAgICAgICAgICAgICRzY29wZS5jb250ZXh0LnBhZ2VzID0gcmVzcG9uc2U7IC8vIHBhZ2VzIGRhdGEgICBcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogSGFuZGxlIGxpc3Qgb3JkZXJcbiAgICAgICAgICovXG4gICAgICAgICRzY29wZS4kb24oJ29yZGVyLWNoYW5nZWQnLCBmdW5jdGlvbihldnQsIHBhcmFtcykgeyAgIFxuICAgICAgICAgICAgJHNjb3BlLmxvYWQoe29yZGVyOiBwYXJhbXN9KTsgLy8gcmVsb2FkIGNhcmRzXG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEhhbmRsZSBwYWdpbmF0aW9uXG4gICAgICAgICAqL1xuICAgICAgICAkc2NvcGUuJG9uKCdjYXJkcy1wYWdlLWNoYW5nZWQnLCBmdW5jdGlvbihldnQsIHBhcmFtcykge1xuICAgICAgICAgICAgJHNjb3BlLmxvYWQocGFyYW1zKTsgLy8gcmVsb2FkIGNhcmRzXG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENyZWF0ZSBjYXJkXG4gICAgICAgICAqL1xuICAgICAgICAkc2NvcGUuJG9uKCduZXctY2FyZCcsIGZ1bmN0aW9uKGV2dCwgaXRlbSkge1xuICAgICAgICAgICAgJHNjb3BlLmNvbnRleHQuY2FyZHMudW5zaGlmdChpdGVtKTtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogUGluIGNhcmRcbiAgICAgICAgICovXG4gICAgICAgICRzY29wZS4kb24oJ3Bpbi1jYXJkJywgZnVuY3Rpb24oZXZ0LCBpdGVtKSB7XG4gICAgICAgICAgIFxuICAgICAgICAgICAgaWYoaXRlbS5zdGlja3kpIHtcbiAgICAgICAgICAgICAgICAvLyBub3Qgc3RpY2t5IGFueW1vcmVcbiAgICAgICAgICAgICAgICBpdGVtLnN0aWNreSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGl0ZW0uY2xhc3MgPSBpdGVtLmNsYXNzID8gaXRlbS5jbGFzcy5yZXBsYWNlKFwic3RpY2t5XCIsIFwiXCIpIDogXCJcIjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gc3RpY2t5LiBQdXQgaXQgZmlyc3RcbiAgICAgICAgICAgICAgICBpdGVtLnN0aWNreSA9IHRydWU7XG4gICAgICAgICAgICAgICAgaXRlbS5jbGFzcyA9IGl0ZW0uY2xhc3MgPyBpdGVtLmNsYXNzICsgXCIgc3RpY2t5XCIgOiBcInN0aWNreVwiOyAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBsZXQgaW5kZXggPSAkc2NvcGUuY29udGV4dC5jYXJkcy5pbmRleE9mKGl0ZW0pO1xuICAgICAgICAgICAgICAgICRzY29wZS5jb250ZXh0LmNhcmRzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmNvbnRleHQuY2FyZHMudW5zaGlmdChpdGVtKTtcbiAgICAgICAgICAgIH0gXG4gICAgICAgIH0pO1xuICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogRGVsZXRlIGNhcmRcbiAgICAgICAgICovXG4gICAgICAgICRzY29wZS4kb24oJ2RlbGV0ZS1jYXJkJywgZnVuY3Rpb24oZXZ0LCBpdGVtKSB7XG4gICAgICAgICAgICBsZXQgaW5kZXggPSAkc2NvcGUuY29udGV4dC5jYXJkcy5pbmRleE9mKGl0ZW0pO1xuICAgICAgICAgICAgJHNjb3BlLmNvbnRleHQuY2FyZHMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogVXBkYXRlIGNhcmRcbiAgICAgICAgICovXG4gICAgICAgICRzY29wZS4kb24oJ3VwZGF0ZS1jYXJkJywgZnVuY3Rpb24oZXZ0LCBvcmlnaW5hbCwgbmV3Q2FyZCkge1xuICAgICAgICAgICAgbGV0IGluZGV4ID0gJHNjb3BlLmNvbnRleHQuY2FyZHMuaW5kZXhPZihvcmlnaW5hbCk7XG4gICAgICAgICAgICBhbmd1bGFyLmV4dGVuZCgkc2NvcGUuY29udGV4dC5jYXJkc1tpbmRleF0sIG5ld0NhcmQpO1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBGaWx0ZXIgYnkgc3RhY2tcbiAgICAgICAgICovXG4gICAgICAgICRzY29wZS4kb24oJ3N0YWNrLXNlbGVjdGVkJywgZnVuY3Rpb24oZXZ0LCBzdGFjaykge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBxdWVyeSByZXN1bHRzXG4gICAgICAgICAgICBxdWVyeUZhY3RvcnkuYnlTdGFjayh7c3RhY2tfaWQ6IHN0YWNrLmlkfSk7XG4gICAgICAgICAgXG4gICAgICAgICAgICAvLyBwcm92aWRlIGluZm8gdG8gdmlld1xuICAgICAgICAgICAgJHNjb3BlLmNvbnRleHQuc3RhY2sgPSBzdGFjaztcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gcmVmcmVzaCBhbmltYXRpb24gKHdoZW4gZWxlbWVudCBhbHJlYWR5IHZpc2libGUpXG4gICAgICAgICAgICAkZWxlbWVudC5maW5kKCcuc3RhY2stZGVzY3JpcHRpb24nKS5hZGRDbGFzcygnZmxpcEluWCcpO1xuICAgICAgICB9KTsgICAgXG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQ2xlYXIgc3RhY2sgZGVzY3JpcHRpb24gYW5pbWF0aW9uIGNsYXNzIHdoZW4gZmluaXNoZWRcbiAgICAgICAgICovXG4gICAgICAgICRlbGVtZW50Lm9uKCd3ZWJraXRBbmltYXRpb25FbmQgbW96QW5pbWF0aW9uRW5kIE1TQW5pbWF0aW9uRW5kIG9hbmltYXRpb25lbmQgYW5pbWF0aW9uZW5kJywgJy5zdGFjay1kZXNjcmlwdGlvbicsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcyhcImZsaXBJblhcIik7XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgaWYoJGNvb2tpZXMuZ2V0KFwic3RhY2tcIikpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gcHJvdmlkZSBpbmZvIHRvIHZpZXdcbiAgICAgICAgICAgICRzY29wZS5jb250ZXh0LnN0YWNrID0gJGNvb2tpZXMuZ2V0KFwic3RhY2tcIik7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDdXJyZW50IHRhZ3MgZmlsdGVyc1xuICAgICAgICAgKi9cbiAgICAgICAgJHNjb3BlLnByaW50Q3VycmVudFRhZ3MgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbGV0IGN1cnJlbnRfY29va2llcyA9ICRjb29raWVzLmdldCgndGFncycpO1xuICAgICAgICAgICAgaWYoIHR5cGVvZihjdXJyZW50X2Nvb2tpZXMpICE9PSAndW5kZWZpbmVkJyApIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUudGFnX2ZpbHRlcnMgPSBhbmd1bGFyLmZyb21Kc29uKGN1cnJlbnRfY29va2llcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIGFkZCBvbmUgbW9yZVxuICAgICAgICAkc2NvcGUuJG9uKCd0YWctZmlsdGVyLWFkZGVkJywgZnVuY3Rpb24oZXZ0LCB0YWcpIHtcbiAgICAgICAgICAgICRzY29wZS50YWdfZmlsdGVycy51bnNoaWZ0KHRhZyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygkc2NvcGUudGFnX2ZpbHRlcnMpO1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIC8vIERyYXcgdGFnIGZpbHRlcnMgb24gcGFnZSBsb2FkXG4gICAgICAgICRzY29wZS5wcmludEN1cnJlbnRUYWdzKCk7IFxuICAgICAgICBcbiAgICAgICAgJHNjb3BlLnJlbW92ZVRhZ0ZpbHRlciA9IGZ1bmN0aW9uKGV2ZW50LCBpbmRleCwgdGFnKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIHJlbW92ZSBmcm9tIHZpZXdcbiAgICAgICAgICAgICQoZXZlbnQuY3VycmVudFRhcmdldCkuY2xvc2VzdCgnbGknKS5yZW1vdmVDbGFzcygnYW5pbWF0ZWQgcHVsc2UnKTsgLy8gbm8gZW5kIGFuaW1hdGlvblxuICAgICAgICAgICAgJHNjb3BlLnRhZ19maWx0ZXJzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIHJlbW92ZSB0YWcgZnJvbSBjb29raWVzXG4gICAgICAgICAgICBsZXQgY3VycmVudF9jb29raWVzID0gYW5ndWxhci5mcm9tSnNvbigkY29va2llcy5nZXQoJ3RhZ3MnKSk7XG4gICAgICAgICAgICBsZXQgY29va2llX2luZGV4ID0gJC5pbkFycmF5KCB0YWcsIGN1cnJlbnRfY29va2llcyApO1xuICAgICAgICAgICAgY3VycmVudF9jb29raWVzLnNwbGljZShjb29raWVfaW5kZXgsIDEpO1xuICAgICAgICAgICAgJGNvb2tpZXMucHV0T2JqZWN0KCd0YWdzJywgY3VycmVudF9jb29raWVzKTtcbiAgICAgICAgfSAgICAgICBcbiAgICB9XG59KSgpOyIsIihmdW5jdGlvbigpe1xuICAgIFxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuaG9tZScpLmNvbnRyb2xsZXIoJ1NlYXJjaENvbnRyb2xsZXInLCBbJyRzY29wZScsICdIb21lQ29udGV4dFNlcnZpY2UnLCBTZWFyY2hDb250cm9sbGVyXSk7XG4gICAgXG4gICAgZnVuY3Rpb24gU2VhcmNoQ29udHJvbGxlcigkc2NvcGUsIEhvbWVDb250ZXh0U2VydmljZSl7XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogV2F5IHRvIGtlZXAgc2libGluZ3MgY29ubmVjdGVkIGFuZCBzaGFyaW5nIHNjb3BlXG4gICAgICAgICAqL1xuICAgICAgICAkc2NvcGUuY29udGV4dCA9IEhvbWVDb250ZXh0U2VydmljZS5jb250ZXh0O1xuICAgIH1cbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmhvbWUnKS5kaXJlY3RpdmUoJ29yZGVyQnknLCBbJ2NvbmZpZycsXG4gICAgICAgIGZ1bmN0aW9uIChjb25maWcpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICByZXN0cmljdDogJ0VBJyxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogY29uZmlnLlNSQ19GT0xERVIgKyAnL2hvbWUvdGVtcGxhdGVzL29yZGVyLWJ5Lmh0bWwnLFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJyRyb290U2NvcGUnLCBmdW5jdGlvbiAoJHNjb3BlLCAkcm9vdFNjb3BlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaW5pdGlhbCBwb3NpdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLm9yZGVyID0gJ3VwZGF0ZWRfYXQnO1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRpcmVjdGlvbiA9ICdkZXNjJztcbiAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUudXBkYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGRhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yZGVyOiAkc2NvcGUub3JkZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogJHNjb3BlLmRpcmVjdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ29yZGVyLWNoYW5nZWQnLCBkYXRhKTsgLy8gZW1taXRcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIF0pO1xufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuaG9tZScpXG4gICAgICAgIC5maWx0ZXIoJ2hpZ2hsaWdodFRleHQnLCBmdW5jdGlvbigkc2NlKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHRleHQsIHBocmFzZSkge1xuICAgICAgICAgICAgICAgIGxldCBoaWdobGlnaHRlZCA9IHBocmFzZVxuICAgICAgICAgICAgICAgICAgICAgICAgPyB0ZXh0LnJlcGxhY2UobmV3IFJlZ0V4cCgnKCcgKyBwaHJhc2UgKyAnKScsICdnaScpLCAnPHNwYW4gY2xhc3M9XCJoaWdobGlnaHQtdGV4dFwiPiQxPC9zcGFuPicpXG4gICAgICAgICAgICAgICAgICAgICAgICA6IHRleHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICByZXR1cm4gJHNjZS50cnVzdEFzSHRtbChoaWdobGlnaHRlZCk7XG4gICAgICAgICAgICB9OyAgICAgICAgICAgIFxuICAgICAgICB9KTtcbn0pKCk7XG5cbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAuaG9tZScpLnNlcnZpY2UoJ0hvbWVDb250ZXh0U2VydmljZScsIGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5jb250ZXh0ID0ge1xuICAgICAgICBjYXJkczogW10sXG4gICAgICAgIHF1ZXJ5OiAnJ1xuICAgIH07XG59KTsiLCIoZnVuY3Rpb24oKXtcbiAgICBcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLnN0YWNrcycpLmRpcmVjdGl2ZSgnc3RhY2tMaXN0UGFuZWwnLCBbJ2NvbmZpZycsICckY29va2llcycsIGZ1bmN0aW9uKGNvbmZpZywgJGNvb2tpZXMpe1xuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IGNvbmZpZy5TUkNfRk9MREVSICsgJ3N0YWNrcy90ZW1wbGF0ZXMvc3RhY2stbGlzdC1wYW5lbC5odG1sJyxcbiAgICAgICAgICAgICAgICB0cmFuc2NsdWRlOiB0cnVlLCAgICAgICBcbiAgICAgICAgICAgICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuaW1nX2ZvbGRlciA9IGNvbmZpZy5QUk9GSUxFX0lNR19GT0xERVI7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBzY29wZS5jdXJyZW50X3N0YWNrID0gJGNvb2tpZXMuZ2V0KFwic3RhY2tcIik7ICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogWyckc2NvcGUnLCAnJHJvb3RTY29wZScsICckbG9nJywgJyRjb29raWVzJywgJ2NvbmZpZycsICdzdGFja3NGYWN0b3J5JywgJ01vZGFsU2VydmljZScsIFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbigkc2NvcGUsICRyb290U2NvcGUsICRsb2csICRjb29raWVzLCBjb25maWcsIHN0YWNrc0ZhY3RvcnksIE1vZGFsU2VydmljZSkge1xuICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIEdldCBzdGFjayBsaXN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5zdGFja3MgPSBzdGFja3NGYWN0b3J5LnF1ZXJ5KCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICogQ3JlYXRlIG5ldyBzdGFja1xuICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuYWRkTmV3ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTW9kYWxTZXJ2aWNlLnNob3dNb2RhbCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBjb25maWcuU1JDX0ZPTERFUiArIFwic3RhY2tzL3RlbXBsYXRlcy9tb2RhbHMvbmV3LXN0YWNrLmh0bWxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogXCJOZXdTdGFja0NvbnRyb2xsZXJcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLnRoZW4oZnVuY3Rpb24obW9kYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWwuZWxlbWVudC5tb2RhbCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RhbC5jbG9zZS50aGVuKGZ1bmN0aW9uIChyZXN1bHQpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdCkgeyAgICBcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHByZXBhcmUgZGF0YSB0byBzdWJtaXQgdG8gc2VydmVyIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzdGFjayA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogbW9kYWwuc2NvcGUuZm9ybS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogbW9kYWwuc2NvcGUuZm9ybS5kZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YWNrc0ZhY3Rvcnkuc2F2ZShzdGFjaykuJHByb21pc2UudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZW1taXQgZXZlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhY2suaWQgPSByZXNwb25zZS5pZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCduZXctc3RhY2snLCBzdGFjayk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhZGQgdG8gc3RhY2tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnN0YWNrcy51bnNoaWZ0KHN0YWNrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJGxvZy5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIEZpbHRlciBieSBzdGFja1xuICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZmlsdGVyID0gZnVuY3Rpb24oJGV2ZW50LCBzdGFjaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgbGkgPSAkKCRldmVudC5jdXJyZW50VGFyZ2V0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaS5jbG9zZXN0KCd1bCcpLmZpbmQoJy5saXN0LWdyb3VwLWl0ZW0nKS5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaS5wYXJlbnQoKS5hZGRDbGFzcygnc2VsZWN0ZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcGVyc2lzdCBmaWx0ZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkY29va2llcy5wdXRPYmplY3QoJ3N0YWNrJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogc3RhY2suaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHN0YWNrLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBzdGFjay5kZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRlbGwgdGhlIHdvcmxkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdzdGFjay1zZWxlY3RlZCcsIHN0YWNrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgfTtcbiAgICB9XSk7XG59KSgpOyIsIihmdW5jdGlvbigpe1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuc3RhY2tzJykuZmFjdG9yeSgnc3RhY2tzRmFjdG9yeScsIFsnJHJlc291cmNlJywgJ2NvbmZpZycsIGZ1bmN0aW9uICgkcmVzb3VyY2UsIGNvbmZpZykge1xuICAgICAgICByZXR1cm4gJHJlc291cmNlKGNvbmZpZy5hcGkgKyAnL3N0YWNrcy86aWQnLCB7IGlkOiAnQF9pZCcsIHN0YWNrX2lkOiAnQHN0YWNrX2lkJyB9LCB7XG4gICAgICAgICAgICB1cGRhdGU6IHtcbiAgICAgICAgICAgICAgbWV0aG9kOiAnUFVUJyBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmaWx0ZXI6IHtcbiAgICAgICAgICAgICAgdXJsOiBjb25maWcuYXBpICsgJy9zdGFja3MvOnN0YWNrX2lkL2NhcmRzJywgXG4gICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcgXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pOyBcbiAgICB9XSk7XG59KSgpO1xuXG4iLCIoZnVuY3Rpb24gKCkge1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAudGFncycpLmRpcmVjdGl2ZSgnbmV3VGFnJywgWydjb25maWcnLCAndGFnc0ZhY3RvcnknLCAnJHJvb3RTY29wZScsICckYW5pbWF0ZScsXG4gICAgICAgIGZ1bmN0aW9uIChjb25maWcsIHRhZ3NGYWN0b3J5LCAkcm9vdFNjb3BlLCAkYW5pbWF0ZSkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHJlc3RyaWN0OiAnRUEnLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBjb25maWcuU1JDX0ZPTERFUiArICcvdGFncy90ZW1wbGF0ZXMvbmV3LXRhZy5odG1sJyxcbiAgICAgICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICAgICAgICAgIGNhcmQ6IFwiPWRhdGFcIlxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy8gYXJjaGV0eXBlXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLnRhZyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICcnXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogSW5pdGlhbCB3aWRnZXQgc3RhdGVcbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLmRpc3BsYXkgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBIaWRlIHdpZGdldFxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuc2hvdyA9IGZ1bmN0aW9uKCkgeyBcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLmRpc3BsYXkgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUudmlzaWJpbGl0eSA9ICd2aXNpYmxlJzsgLy8gY3NzIGNsYXNzXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuZmluZCgnaW5wdXQnKS5mb2N1cygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgMC41KTsgLy8gdGltZSB3aWxsIHZhcnkgYWNjb3JkaW5nIHRvIGNzcyBydWxlXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBIaWRlIHdpZGdldFxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuaGlkZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuZGlzcGxheSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUudmlzaWJpbGl0eSA9ICcnOyAvLyBjc3MgY2xhc3NcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLnRhZy5uYW1lID0gJyc7IC8vIHJlc2V0IGZpZWxkXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBjcmVhdGVzIGEgdGFnIGFuZCBhdHRhY2ggaXQgdG8gY3VycmVudCBjYXJkXG4gICAgICAgICAgICAgICAgICAgICAqIFxuICAgICAgICAgICAgICAgICAgICAgKiBAcmV0dXJucyB2b2lkXG4gICAgICAgICAgICAgICAgICAgICAqIEBicm9hZGNhc3RzIGV2ZW50XG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBzY29wZS5hZGROZXcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHNjb3BlLnRhZy5uYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHRhZyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FyZF9pZDogc2NvcGUuY2FyZC5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogc2NvcGUudGFnLm5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhZ3NGYWN0b3J5LnNhdmUodGFnLCBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWcuaWQgPSByZXNwb25zZS5pZDsgLy8gYXBwZW5kIHRhZyBpZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY29wZS5mbGFzaENsYXNzKGVsZW1lbnQsICdvaycpOyAvLyB1eCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCduZXctdGFnJywgdGFnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuZmxhc2hDbGFzcyhlbGVtZW50LCAnZXJyb3InKTsgLy8gdXggXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUudGFnLm5hbWUgPSAnJzsgLy8gcmVzZXQgZmllbGRcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBLZXkgZXZlbnQgKEVudGVyKVxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5iaW5kKFwia2V5ZG93biBrZXlwcmVzc1wiLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGV2ZW50LndoaWNoID09PSAxMykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLmFkZE5ldygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIEFkZHMgYW5kIHJlbW92ZXMgYSBjbGFzc1xuICAgICAgICAgICAgICAgICAgICAgKiBcbiAgICAgICAgICAgICAgICAgICAgICogQHBhcmFtIHN0cmluZyBjbGFzc05hbWVcbiAgICAgICAgICAgICAgICAgICAgICogQHJldHVybnMgdm9pZFxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuZmxhc2hDbGFzcyA9IGZ1bmN0aW9uKGVsZW1lbnQsIGNsYXNzTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICRhbmltYXRlLmFkZENsYXNzKGVsZW1lbnQsIGNsYXNzTmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRhbmltYXRlLnJlbW92ZUNsYXNzKGVsZW1lbnQsIGNsYXNzTmFtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIDUwMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgXSk7XG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5ob21lJykuZGlyZWN0aXZlKCd0YWdDbG91ZCcsIFsnY29uZmlnJywgXG4gICAgICAgIGZ1bmN0aW9uIChjb25maWcpIHtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICByZXN0cmljdDogJ0VBJyxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogY29uZmlnLlNSQ19GT0xERVIgKyAnL3RhZ3MvdGVtcGxhdGVzL3RhZy1jbG91ZC5odG1sJyxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBbJyRzY29wZScsICckY29va2llcycsICckcm9vdFNjb3BlJywgJ3JlZHVjZUJ5RmlsdGVyJywgZnVuY3Rpb24gKCRzY29wZSwgJGNvb2tpZXMsICRyb290U2NvcGUsIHJlZHVjZUJ5RmlsdGVyKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIEtlZXAgdHJhY2sgb2YgY2FyZCBsaXN0IGNoYW5nZXNcbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS4kb24oJ2NhcmRzLWxvYWRlZCcsIGZ1bmN0aW9uIChldnQsIGNvbGxlY3Rpb24pIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYodHlwZW9mKGNvbGxlY3Rpb24uZGF0YSkgPT09ICd1bmRlZmluZWQnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZXhjbHVkZSBjYXJkIHdpdGggbm8gdGFnc1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNhcmRzID0gY29sbGVjdGlvbi5kYXRhLmZpbHRlcihmdW5jdGlvbiAoY2FyZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjYXJkLnRhZ3MgPyBjYXJkLnRhZ3MubGVuZ3RoID4gMCA6IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBleHRyYWN0IHRhZ3MgZnJvbSBjYXJkXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdGFncyA9IGNhcmRzLm1hcChmdW5jdGlvbiAoY2FyZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKGFuZ3VsYXIudG9Kc29uKGNhcmQudGFncykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIG1lcmdlIHRhZ3MgaW4gZmxhdHRlbiBhcnJheVxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG1lcmdlZCA9IFtdLmNvbmNhdC5hcHBseShbXSwgdGFncyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBlbGltaW5hdGUgZHVwbGljYXRlcyBhbmQgc2VydmUgYXJyYXkgdG8gdmlld1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnRhZ3MgPSByZWR1Y2VCeUZpbHRlcihtZXJnZWQsICdpZCcpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5maWx0ZXIgPSBmdW5jdGlvbih0YWcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGN1cnJlbnRfY29va2llcyA9ICRjb29raWVzLmdldCgndGFncycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiggdHlwZW9mKGN1cnJlbnRfY29va2llcykgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZmlyc3Qgb25lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudF9jb29raWVzID0gW3RhZ107XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGF2b2lkIGR1cGxpY2F0ZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50X2Nvb2tpZXMgPSBhbmd1bGFyLmZyb21Kc29uKGN1cnJlbnRfY29va2llcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoIGN1cnJlbnRfY29va2llcy5tYXAoZnVuY3Rpb24oZSkgeyByZXR1cm4gZS5pZDsgfSkuaW5kZXhPZih0YWcuaWQpID09PSAtMSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudF9jb29raWVzLnB1c2godGFnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCd0YWctZmlsdGVyLWFkZGVkJywgdGFnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFkZCB0YWcgdG8gY3VycmVudCB0YWdzIGxpc3RcbiAgICAgICAgICAgICAgICAgICAgICAgICRjb29raWVzLnB1dE9iamVjdCgndGFncycsIGN1cnJlbnRfY29va2llcyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIF0pO1xufSkoKTsiLCIoZnVuY3Rpb24oKXtcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLnRhZ3MnKS5mYWN0b3J5KCd0YWdzRmFjdG9yeScsIFsnJHJlc291cmNlJywgJ2NvbmZpZycsIGZ1bmN0aW9uICgkcmVzb3VyY2UsIGNvbmZpZykge1xuICAgICAgICByZXR1cm4gJHJlc291cmNlKGNvbmZpZy5hcGkgKyAnL3RhZ3MvOmlkJywgeyBpZDogJ0BpZCcsIGNhcmRfaWQ6ICdAY2FyZF9pZCcgfSwge1xuICAgICAgICAgICAgc2F2ZToge1xuICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLCBcbiAgICAgICAgICAgICAgICB1cmw6IGNvbmZpZy5hcGkgKyAnL2NhcmRzLzpjYXJkX2lkL3RhZ3MnICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7IFxuICAgIH1dKTtcbn0pKCk7XG5cbiIsIihmdW5jdGlvbigpIHtcblxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuY2FyZHMnKS5jb250cm9sbGVyKCdFZGl0Q2FyZENvbnRyb2xsZXInLCBbJyRzY29wZScsICdkYXRhJywgJ2Nsb3NlJywgRWRpdENhcmRDb250cm9sbGVyXSk7XG4gICAgXG4gICAgZnVuY3Rpb24gRWRpdENhcmRDb250cm9sbGVyKCRzY29wZSwgZGF0YSwgY2xvc2UpIHtcblxuICAgICAgICAkc2NvcGUuZm9ybSA9IHt9O1xuICAgICAgICAkc2NvcGUuZm9ybS5uYW1lID0gZGF0YS5jYXJkLm5hbWU7XG4gICAgICAgICRzY29wZS5mb3JtLmNvbnRlbnQgPSBkYXRhLmNhcmQuY29udGVudDtcblxuICAgICAgICAkc2NvcGUuY2xvc2UgPSBmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgIFxuICAgICAgICAgICAgY2xvc2UocmVzdWx0LCAyMDApOyAvLyBjbG9zZSwgYnV0IGdpdmUgMjAwbXMgZm9yIGJvb3RzdHJhcCB0byBhbmltYXRlXG4gICAgICAgIH07XG4gICAgfTtcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcblxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuaG9tZScpLmNvbnRyb2xsZXIoJ1llc05vQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJ2RhdGEnLCAnY2xvc2UnLCBmdW5jdGlvbiAoJHNjb3BlLCBkYXRhLCBjbG9zZSkge1xuICAgICAgICAgICBcbiAgICAgICAgICAgICRzY29wZS50aXRsZSA9IGRhdGEudGl0bGU7XG4gICAgICAgICAgICAkc2NvcGUuY29udGVudCA9IGRhdGEuY29udGVudDtcbiAgICAgICAgICAgXG4gICAgICAgICAgICAkc2NvcGUuY2xvc2UgPSBmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgY2xvc2UocmVzdWx0LCAyMDApOyAvLyBjbG9zZSwgYnV0IGdpdmUgMjAwbXMgZm9yIGJvb3RzdHJhcCB0byBhbmltYXRlXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XSk7XG59KSgpOyIsIihmdW5jdGlvbigpIHtcblxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuaG9tZScpLmNvbnRyb2xsZXIoJ01hcmtkb3duQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJ2RhdGEnLCAnY2xvc2UnLCBNYXJrZG93bkNvbnRyb2xsZXJdKTtcbiAgICBcbiAgICBmdW5jdGlvbiBNYXJrZG93bkNvbnRyb2xsZXIoJHNjb3BlLCBkYXRhLCBjbG9zZSkge1xuXG4gICAgICAgICRzY29wZS50aXRsZSA9IGRhdGEuY2FyZC5uYW1lO1xuICAgICAgICAkc2NvcGUuY29udGVudCA9IGRhdGEuY2FyZC5jb250ZW50O1xuXG4gICAgICAgICRzY29wZS5kaXNtaXNzTW9kYWwgPSBmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgICBjbG9zZShyZXN1bHQsIDIwMCk7IC8vIGNsb3NlLCBidXQgZ2l2ZSAyMDBtcyBmb3IgYm9vdHN0cmFwIHRvIGFuaW1hdGVcbiAgICAgICAgfTtcbiAgICB9O1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG4gICAgXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5zdGFja3MnKS5jb250cm9sbGVyKCdOZXdTdGFja0NvbnRyb2xsZXInLCBbJyRzY29wZScsICckZWxlbWVudCcsICdjbG9zZScsIE5ld1N0YWNrQ29udHJvbGxlcl0pO1xuICAgIFxuICAgIGZ1bmN0aW9uIE5ld1N0YWNrQ29udHJvbGxlcigkc2NvcGUsICRlbGVtZW50LCBjbG9zZSkge1xuICAgICAgIFxuICAgICAgICAkc2NvcGUuZm9ybSA9IHtcbiAgICAgICAgICAgIG5hbWU6ICcnLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICcnXG4gICAgICAgIH07XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBLZXkgZXZlbnQgKEVudGVyKVxuICAgICAgICAgKi9cbiAgICAgICAgJGVsZW1lbnQuZmluZCgnaW5wdXQnKS5iaW5kKFwia2V5ZG93biBrZXlwcmVzc1wiLCBmdW5jdGlvbiAoZXZlbnQpIHtcblxuICAgICAgICAgICAgaWYoZXZlbnQud2hpY2ggPT09IDEzKSB7XG4gICAgICAgICAgICAgICAgJGVsZW1lbnQubW9kYWwoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICAkc2NvcGUuY2xvc2UodHJ1ZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgICRzY29wZS5jbG9zZSA9IGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgXG4gICAgICAgICAgICBjbG9zZShyZXN1bHQsIDIwMCk7IC8vIGNsb3NlLCBidXQgZ2l2ZSAyMDBtcyBmb3IgYm9vdHN0cmFwIHRvIGFuaW1hdGVcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICBcbiAgICB9O1xufSkoKTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
