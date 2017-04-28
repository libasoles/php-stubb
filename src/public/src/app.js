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
    
    angular.module('app.home').controller('ListController', ['$scope', '$log', '$cookieStore', '$element', 'queryFactory', 'HomeContextService', ListController]);
    
    function ListController($scope, $log, $cookieStore, $element, queryFactory, HomeContextService){
        
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
        
        if($cookieStore.get("stack")) {
            
            // provide info to view
            $scope.context.stack = $cookieStore.get("stack");
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
    
    angular.module('app.stacks').directive('stackListPanel', ['config', '$rootScope', '$cookieStore', function(config, $rootScope, $cookieStore){
            
            return {
                restrict: 'E',
                templateUrl: config.SRC_FOLDER + 'stacks/templates/stack-list-panel.html',
                transclude: true,       
                link: function(scope, element, attrs) {
                    scope.img_folder = config.PROFILE_IMG_FOLDER;
                    
                    scope.current_stack = $cookieStore.get("stack");                
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
                controller: ['$scope', 'reduceByFilter', function ($scope, reduceByFilter) {

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC1jb25maWcuanMiLCJjYXJkcy9tb2R1bGUuanMiLCJjb21tb24vbW9kdWxlLmpzIiwiaG9tZS9tb2R1bGUuanMiLCJzdGFja3MvbW9kdWxlLmpzIiwidGFncy9tb2R1bGUuanMiLCJjYXJkcy9jYXJkcy1yb3V0ZS5qcyIsImNvbW1vbi9hcHAtcm91dGUuanMiLCJob21lL2hvbWUtcm91dGUuanMiLCJsb2dpbi9sb2dpbi5qcyIsInN0YWNrcy9ob21lLXJvdXRlLmpzIiwiY2FyZHMvZGlyZWN0aXZlcy9jYXJkLmpzIiwiY2FyZHMvZGlyZWN0aXZlcy9uZXctY2FyZC5qcyIsImNhcmRzL2RpcmVjdGl2ZXMvcGFnaW5hdGUtY2FyZHMuanMiLCJjYXJkcy9zZXJ2aWNlcy9jYXJkcy1mYWN0b3J5LmpzIiwiY29tbW9uL2NvbnRyb2xsZXJzL2hlYWRlci1jb250cm9sbGVycy5qcyIsImNvbW1vbi9jb250cm9sbGVycy9sYXlvdXQtY29udHJvbGxlcnMuanMiLCJjb21tb24vZGlyZWN0aXZlcy9hdXRvZm9jdXMuanMiLCJjb21tb24vZGlyZWN0aXZlcy9lbGFzdGljQXJlYS5qcyIsImNvbW1vbi9kaXJlY3RpdmVzL2hhc2h0YWdpZnkuanMiLCJjb21tb24vZGlyZWN0aXZlcy9zZXNzaW9uRHJvcGRvd24uanMiLCJjb21tb24vZGlyZWN0aXZlcy9zaG93TW9yZS5qcyIsImNvbW1vbi9maWx0ZXJzL3JlZHVjZUJ5LmpzIiwiY29tbW9uL3NlcnZpY2VzL3F1ZXJ5LWZhY3RvcnkuanMiLCJob21lL2NvbnRyb2xsZXJzL2hvbWUtY29udHJvbGxlci5qcyIsImhvbWUvY29udHJvbGxlcnMvbGlzdC1jb250cm9sbGVyLmpzIiwiaG9tZS9jb250cm9sbGVycy9zZWFyY2gtY29udHJvbGxlci5qcyIsImhvbWUvZGlyZWN0aXZlcy9vcmRlci1ieS5qcyIsImhvbWUvZmlsdGVycy9oaWdobGlnaHRUZXh0LmpzIiwiaG9tZS9zZXJ2aWNlcy9ob21lLWNvbnRleHQuanMiLCJzdGFja3MvZGlyZWN0aXZlcy9zdGFjay1saXN0LXBhbmVsLmpzIiwic3RhY2tzL3NlcnZpY2VzL3N0YWNrcy1mYWN0b3J5LmpzIiwidGFncy9kaXJlY3RpdmVzL25ldy10YWcuanMiLCJ0YWdzL2RpcmVjdGl2ZXMvdGFnLWNsb3VkLmpzIiwidGFncy9zZXJ2aWNlL3RhZ3MtZmFjdG9yeS5qcyIsImNhcmRzL2NvbnRyb2xsZXJzL21vZGFscy9lZGl0LWNhcmQtY29udHJvbGxlci5qcyIsImNvbW1vbi9jb250cm9sbGVycy9tb2RhbHMveWVzLW5vLWNvbnRyb2xsZXIuanMiLCJob21lL2NvbnRyb2xsZXJzL21vZGFscy9tYXJrZG93bi1jb250cm9sbGVyLmpzIiwic3RhY2tzL2NvbnRyb2xsZXJzL21vZGFscy9uZXctc3RhY2stY29udHJvbGxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FBR0EsUUFBQSxPQUFBLGNBQUE7S0FDQSxTQUFBLFVBQUE7UUFDQSxPQUFBO1FBQ0EsU0FBQTtRQUNBLGNBQUE7UUFDQSxjQUFBO1FBQ0Esc0JBQUE7OztBQ1RBLFFBQUEsT0FBQSxhQUFBOzs7QUNBQTs7QUFFQSxRQUFBLE9BQUEsT0FBQSxDQUFBLE1BQUEsV0FBQSxhQUFBLGNBQUEsWUFBQSx1QkFBQTs7Ozs7QUFLQSxRQUFBLE9BQUEsT0FBQSxPQUFBLENBQUEsaUJBQUEsZ0JBQUEsc0JBQUE7SUFDQSxVQUFBLGVBQUEsY0FBQSxvQkFBQSxRQUFBOzs7OztRQUtBLGNBQUEsU0FBQSxRQUFBLFNBQUE7WUFDQSxnQkFBQTtZQUNBLFVBQUE7WUFDQSxxQkFBQTtZQUNBLG9CQUFBO1lBQ0EsZ0JBQUEsUUFBQTs7Ozs7O1FBTUEsYUFBQSxhQUFBLE9BQUE7Ozs7O1FBS0EsbUJBQUEscUJBQUE7WUFDQSxRQUFBO1lBQ0EsUUFBQTs7O1FBR0EsbUJBQUE7UUFDQSxtQkFBQSxrQkFBQTtRQUNBLG1CQUFBLGlCQUFBO1FBQ0EsbUJBQUEseUJBQUE7OztBQUdBLFFBQUEsT0FBQSxPQUFBLElBQUEsQ0FB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Ozs7OztBQzFCQSxDQUFBLFlBQUE7SUFDQSxRQUFBLE9BQUEsT0FBQSxVQUFBLGFBQUEsWUFBQTtRQUNBLE9BQUE7WUFDQSxVQUFBO1lBQ0EsTUFBQSxVQUFBLE9BQUEsU0FBQTtnQkFDQSxRQUFBLEdBQUE7Ozs7Ozs7QUNMQSxDQUFBLFlBQUE7OztJQUdBLFFBQUEsT0FBQSxPQUFBLFVBQUEsZUFBQSxZQUFBO1FBQ0EsT0FBQTtZQUNBLFVBQUE7WUFDQSxNQUFBLFVBQUEsT0FBQSxTQUFBLFlBQUE7Z0JBQ0EsSUFBQSxZQUFBO3dCQUNBLFlBQUEsUUFBQSxHQUFBO3dCQUNBLGNBQUEsUUFBQSxJQUFBO3dCQUNBLGVBQUEsUUFBQSxJQUFBOztnQkFFQSxJQUFBLFVBQUEsUUFBQSxRQUFBLGVBQUEsSUFBQTtvQkFDQSxVQUFBO29CQUNBLEtBQUEsQ0FBQTtvQkFDQSxNQUFBLENBQUE7b0JBQ0EsT0FBQSxRQUFBLEdBQUEsY0FBQSxTQUFBLGVBQUEsS0FBQSxTQUFBLGdCQUFBO29CQUNBLFVBQUEsUUFBQSxJQUFBO29CQUNBLFlBQUEsUUFBQSxJQUFBO29CQUNBLFlBQUEsUUFBQSxJQUFBO29CQUNBLFFBQUE7OztnQkFHQSxRQUFBLFFBQUEsU0FBQSxNQUFBLE9BQUE7O2dCQUVBLElBQUEsU0FBQSxZQUFBO29CQUNBLElBQUEsUUFBQSxVQUFBLFFBQUEsUUFBQTt3QkFDQSxLQUFBLElBQUEsSUFBQSxHQUFBLElBQUEsSUFBQSxJQUFBLFFBQUEsS0FBQTs0QkFDQSxLQUFBOzt3QkFFQSxPQUFBOzs7b0JBR0EsSUFBQSxNQUFBLFFBQUEsTUFBQSxRQUFBLE1BQUE7NkJBQ0EsUUFBQSxNQUFBOzZCQUNBLFFBQUEsTUFBQTs2QkFDQSxRQUFBLE9BQUE7NkJBQ0EsUUFBQSxPQUFBOzZCQUNBLFFBQUEsV0FBQSxVQUFBLE9BQUE7Z0NBQ0EsT0FBQSxNQUFBLFVBQUEsTUFBQSxTQUFBLEtBQUE7OztvQkFHQSxRQUFBLEtBQUE7O29CQUVBLFFBQUEsSUFBQSxVQUFBLEtBQUEsSUFBQSxRQUFBLEdBQUEsZUFBQSxX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UUFBQSxTQUFBLFVBQUE7O2dCQUVBLFVBQUE7ZUFDQSxTQUFBLEtBQUE7Z0JBQ0EsS0FBQSxNQUFBOzs7Ozs7O1FBT0EsU0FBQSxVQUFBLE1BQUE7WUFDQSxXQUFBLFdBQUEsZ0JBQUE7OztRQUdBLE9BQUE7OztBQzlEQSxDQUFBLFlBQUE7O0lBRUEsUUFBQSxPQUFBLFlBQUEsV0FBQSxrQkFBQSxDQUFBLFVBQUE7O0lBRUEsU0FBQSxlQUFBLFFBQUE7Ozs7Ozs7QUNKQSxDQUFBLFVBQUE7O0lBRUEsUUFBQSxPQUFBLFlBQUEsV0FBQSxrQkFBQSxDQUFBLFVBQUEsUUFBQSxnQkFBQSxZQUFBLGdCQUFBLHNCQUFBOztJQUVBLFNBQUEsZUFBQSxRQUFBLE1BQUEsY0FBQSxVQUFBLGNBQUEsbUJBQUE7Ozs7O1FBS0EsT0FBQSxVQUFBLG1CQUFBOzs7OztRQUtBLE9BQUEsT0FBQSxTQUFBLFFBQUE7OztZQUdBO2lCQUNBLElBQUEsUUFBQSxTQUFBLEtBQUEsVUFBQSxVQUFBOzttQkFFQSxTQUFBLEtBQUE7b0JBQ0EsS0FBQSxNQUFBOzs7O1FBSUEsT0FBQTs7UUFFQSxPQUFBLElBQUEsZ0JBQUEsU0FBQSxLQUFBLFVBQUE7WUFDQSxPQUFBLFFBQUEsUUFBQSxTQUFBO1lBQ0EsT0FBQSxRQUFBLFFBQUE7Ozs7OztRQU1BLE9BQUEsSUFBQSxpQkFBQSxTQUFBLEtBQUEsUUFBQTtZQUNBLE9BQUEsS0FBQSxDQUFBLE9BQUE7Ozs7OztRQU1BLE9BQUEsSUFBQSxzQkFBQSxTQUFBLEtBQUEsUUFBQTtZQUNBLE9BQUEsS0FBQTs7Ozs7O1FBTUEsT0FBQSxJQUFBLFlBQUEsU0FBQSxLQUFBLE1BQUE7WUFDQSxPQUFBLFFBQUEsTUFBQSxRQUFBOzs7Ozs7UUFNQSxPQUFBLElBQUEsWUFBQSxTQUFBLEtBQUEsTUFBQTs7WUFFQSxHQUFBLEtBQUEsUUFBQTs7Z0JBRUEsS0FBQSxTQUFBO2dCQUNBLEtBQUEsUUFBQSxLQUFBLFFBQUEsS0FBQSxNQUFBLFFBQUEsVUFBQSxNQUFBO21CQUNBOztnQkFFQSxLQUFBLFNBQUE7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LFVBQUEsTUFBQTs0QkFDQSxPQUFBLEtBQUEsT0FBQSxLQUFBLEtBQUEsU0FBQSxJQUFBOzs7O3dCQUlBLElBQUEsT0FBQSxNQUFBLElBQUEsVUFBQSxNQUFBOzRCQUNBLE9BQUEsS0FBQSxNQUFBLFFBQUEsT0FBQSxLQUFBOzs7O3dCQUlBLElBQUEsU0FBQSxHQUFBLE9BQUEsTUFBQSxJQUFBOzt3QkFFQSxPQUFBLE9BQUEsZUFBQSxRQUFBOzs7Ozs7O0FDOUJBLENBQUEsVUFBQTtJQUNBLFFBQUEsT0FBQSxZQUFBLFFBQUEsZUFBQSxDQUFBLGFBQUEsVUFBQSxVQUFBLFdBQUEsUUFBQTtRQUNBLE9BQUEsVUFBQSxPQUFBLE1BQUEsYUFBQSxFQUFBLElBQUEsT0FBQSxTQUFBLGNBQUE7WUFDQSxNQUFBO2dCQUNBLFFBQUE7Z0JBQ0EsS0FBQSxPQUFBLE1BQUE7Ozs7Ozs7QUNMQSxDQUFBLFdBQUE7O0lBRUEsUUFBQSxPQUFBLGFBQUEsV0FBQSxzQkFBQSxDQUFBLFVBQUEsUUFBQSxTQUFBOztJQUVBLFNBQUEsbUJBQUEsUUFBQSxNQUFBLE9BQUE7O1FBRUEsT0FBQSxPQUFBO1FBQ0EsT0FBQSxLQUFBLE9BQUEsS0FBQSxLQUFBO1FBQ0EsT0FBQSxLQUFBLFVBQUEsS0FBQSxLQUFBOztRQUVBLE9BQUEsUUFBQSxVQUFBLFFBQUE7O1lBRUEsTUFBQSxRQUFBOztLQUVBOztBQ2RBLENBQUEsWUFBQTs7SUFFQSxRQUFBLE9BQUEsWUFBQSxXQUFBLG1CQUFBLENBQUEsVUFBQSxRQUFBLFNBQUEsVUFBQSxRQUFBLE1BQUEsT0FBQTs7WUFFQSxPQUFBLFFBQUEsS0FBQTtZQUNBLE9BQUEsVUFBQSxLQUFBOztZQUVBLE9BQUEsUUFBQSxVQUFBLFFBQUE7Z0JBQ0EsTUFBQSxRQUFBOzs7O0FDUkEsQ0FBQSxXQUFBOztJQUVBLFFBQUEsT0FBQSxZQUFBLFdBQUEsc0JBQUEsQ0FBQSxVQUFBLFFBQUEsU0FBQTs7SUFFQSxTQUFBLG1CQUFBLFFBQUEsTUFBQSxPQUFBOztRQUVBLE9BQUEsUUFBQSxLQUFBLEtBQUE7UUFDQSxPQUFBLFVBQUEsS0FBQSxLQUFBOztRQUVBLE9BQUEsZUFBQSxVQUFBLFFBQUE7WUFDQSxNQUFBLFFBQUE7O0tBRUE7O0FDWkEsQ0FBQSxXQUFBOztJQUVBLFFBQUEsT0FBQSxjQUFBLFdBQUEsc0JBQUEsQ0FBQSxVQUFBLFlBQUEsU0FBQTs7SUFFQSxTQUFBLG1CQUFBLFFBQUEsVUFBQSxPQUFBOztRQUVBLE9BQUEsT0FBQTtZQUNBLE1BQUE7WUFDQSxhQUFBOzs7Ozs7UUFNQSxTQUFBLEtBQUEsU0FBQSxLQUFBLG9CQUFBLFVBQUEsT0FBQTs7WUFFQSxHQUFBLE1BQUEsVUFBQSxJQUFBO2dCQUNBLFNBQUEsTUFBQTtnQkFDQSxPQUFBLE1BQUE7Z0JBQ0EsT0FBQTs7OztRQUlBLE9BQUEsUUFBQSxVQUFBLFFBQUE7O1lBRUEsTUFBQSxRQUFBOzs7O0tBSUE7S0FDQSIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFRoaXMgY29uZmlnIGlzIGludGVuZGVkIHRvIGJlIGluamVjdGVkIGluIHlvdXIgc3JjXG4gKi9cbmFuZ3VsYXIubW9kdWxlKFwiYXBwLmNvbmZpZ1wiLCBbXSlcbiAgICAuY29uc3RhbnQoXCJjb25maWdcIiwge1xuICAgICAgICBcImFwaVwiOiBcImh0dHA6Ly9sb2NhbGhvc3Q6ODAwMS9hcGkvdjFcIiwgXG4gICAgICAgIFwiZGVidWdcIjogdHJ1ZSxcbiAgICAgICAgXCJTUkNfRk9MREVSXCI6ICcvc3JjL2FwcF9tb2R1bGVzLycsXG4gICAgICAgIFwiSU1HX0ZPTERFUlwiOiAnL2ltZy8nLFxuICAgICAgICBcIlBST0ZJTEVfSU1HX0ZPTERFUlwiOiAnL2ltZy9wcm9maWxlLydcbiAgICB9KTtcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAuY2FyZHMnLCBbXSk7XG5cbiIsIid1c2Ugc3RyaWN0JztcblxuYW5ndWxhci5tb2R1bGUoJ2FwcCcsIFsnbmcnLCAnbmdSb3V0ZScsICduZ0Nvb2tpZXMnLCAnYXBwLmNvbmZpZycsICdhcHAuaG9tZScsICdhbmd1bGFyTW9kYWxTZXJ2aWNlJywgJ3Bhc2NhbHByZWNodC50cmFuc2xhdGUnXSk7XG4gIFxuLyoqXG4gKiBSZXN0IG9mIHRoZSBnbG9iYWwgY29uZmlnIGNhbiBiZSBmb3VuZCBpbiBhcHAtY29uZmlnIG1vZHVsZVxuICovICBcbmFuZ3VsYXIubW9kdWxlKCdhcHAnKS5jb25maWcoWyckaHR0cFByb3ZpZGVyJywgJyRsb2dQcm92aWRlcicsICckdHJhbnNsYXRlUHJvdmlkZXInLCAnY29uZmlnJywgXG4gICAgZnVuY3Rpb24gKCRodHRwUHJvdmlkZXIsICRsb2dQcm92aWRlciwgJHRyYW5zbGF0ZVByb3ZpZGVyLCBjb25maWcpIHtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBamF4IGNhbGxzXG4gICAgICAgICAqLyBcbiAgICAgICAgJGh0dHBQcm92aWRlci5kZWZhdWx0cy5oZWFkZXJzLmNvbW1vbiA9IHsgXG4gICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uO29kYXRhPXZlcmJvc2UnLFxuICAgICAgICAgICAgJ1gtTG9naW4tQWpheC1jYWxsJzogJ3RydWUnLFxuICAgICAgICAgICAgJ1gtUmVxdWVzdGVkLVdpdGgnOiBcIlhNTEh0dHBSZXF1ZXN0XCIsXG4gICAgICAgICAgICAnWC1DU1JGLVRPS0VOJzogTGFyYXZlbC5jc3JmVG9rZW5cbiAgICAgICAgICB9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBEZWJ1Z2dpbmdcbiAgICAgICAgICovIFxuICAgICAgICAkbG9nUHJvdmlkZXIuZGVidWdFbmFibGVkKGNvbmZpZy5kZWJ1Zyk7XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogVHJhbnNsYXRpb25zXG4gICAgICAgICAqLyAgICAgXG4gICAgICAgICR0cmFuc2xhdGVQcm92aWRlci51c2VTdGF0aWNGaWxlc0xvYWRlcih7XG4gICAgICAgICAgICBwcmVmaXg6ICcvaTE4bi9sb2NhbGUtJyxcbiAgICAgICAgICAgIHN1ZmZpeDogJy5qc29uJ1xuICAgICAgICB9KTtcblxuICAgICAgICAkdHJhbnNsYXRlUHJvdmlkZXIudXNlQ29va2llU3RvcmFnZSgpO1xuICAgICAgICAkdHJhbnNsYXRlUHJvdmlkZXIucHJlZmVycmVkTGFuZ3VhZ2UoJ2VuX1VTJyk7XG4gICAgICAgICR0cmFuc2xhdGVQcm92aWRlci5mYWxsYmFja0xhbmd1YWdlKCdlbl9VUycpO1xuICAgICAgICAkdHJhbnNsYXRlUHJvdmlkZXIudXNlU2FuaXRpemVWYWx1ZVN0cmF0ZWd5KCdlc2NhcGUnKTtcbn1dKTtcbiBcbmFuZ3VsYXIubW9kdWxlKCdhcHAnKS5ydW4oW2Z1bmN0aW9uICgpIHtcbiBcbn1dKTtcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAuaG9tZScsIFsnbmdSb3V0ZScsICdhcHAuY29uZmlnJywgJ25nQW5pbWF0ZScsICdhcHAuY2FyZHMnLCAnYXBwLnN0YWNrcycsICdhcHAudGFncycsICdoYy5tYXJrZWQnLCAnbmdTYW5pdGl6ZSddKTtcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAuc3RhY2tzJywgWyduZ1Jlc291cmNlJ10pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcC50YWdzJywgWyduZ1Jlc291cmNlJ10pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcC5jYXJkcycpLmNvbmZpZyhmdW5jdGlvbigkcm91dGVQcm92aWRlcikge1xuICAgXG59KTsiLCIoZnVuY3Rpb24gKCkge1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAnKS5jb25maWcoWyckcm91dGVQcm92aWRlcicsICdjb25maWcnLCBmdW5jdGlvbigkcm91dGVQcm92aWRlciwgY29uZmlnKSB7XG5cbiAgICAgICRyb3V0ZVByb3ZpZGVyXG4gICAgICAgIC53aGVuKCcvJywge1xuICAgICAgICAgICAgdGVtcGxhdGVVcmw6IGNvbmZpZy5TUkNfRk9MREVSICsgJ2hvbWUvdGVtcGxhdGVzL2hvbWUtdGVtcGxhdGUuaHRtbCcsXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnSG9tZUNvbnRyb2xsZXInLFxuICAgICAgICAgICAgY29udHJvbGxlckFzOiAnaG9tZSdcbiAgICAgICAgfSlcblxuICAgICAgICAub3RoZXJ3aXNlKHtyZWRpcmVjdFRvOiAnLyd9KTsgXG4gICAgfV0pO1xufSkoKTsiLCJhbmd1bGFyLm1vZHVsZSgnYXBwLmhvbWUnKS5jb25maWcoZnVuY3Rpb24oJHJvdXRlUHJvdmlkZXIpIHtcblxufSk7IiwiXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XG5cbiAgICAvLyBzd2l0Y2ggZm9ybXNcbiAgICAkKCcubWVzc2FnZSBhJykuY2xpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICBcbiAgICAgICAgJCgnZm9ybScpLmFuaW1hdGUoe2hlaWdodDogXCJ0b2dnbGVcIiwgb3BhY2l0eTogXCJ0b2dnbGVcIn0sIFwic2xvd1wiKTtcbiAgICAgICAgXG4gICAgICAgIGlmKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSA9PSAnL2xvZ2luJykge1xuICAgICAgICAgICAgaGlzdG9yeS5wdXNoU3RhdGUoe30sIFwiUmVnaXN0ZXJcIiwgXCIvcmVnaXN0ZXJcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBoaXN0b3J5LnB1c2hTdGF0ZSh7fSwgXCJMb2dpblwiLCBcIi9sb2dpblwiKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgJCgnZm9ybSAuaGVscC1ibG9jaycpLmhpZGUoKTtcbiAgICB9KTtcblxufSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcC5zdGFja3MnKS5jb25maWcoZnVuY3Rpb24oJHJvdXRlUHJvdmlkZXIpIHtcblxufSk7IiwiKGZ1bmN0aW9uICgpIHtcblxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuY2FyZHMnKS5kaXJlY3RpdmUoJ2NhcmQnLFxuICAgICAgICBbJ2NvbmZpZycsIGZ1bmN0aW9uIChjb25maWcpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IGNvbmZpZy5TUkNfRk9MREVSICsgJ2NhcmRzL3RlbXBsYXRlcy9jYXJkLmh0bWwnLFxuICAgICAgICAgICAgICAgIHJlc3RyaWN0OiAnQScsXG4gICAgICAgICAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgICAgICAgICBjYXJkOiBcIj1kYXRhXCJcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJyRyb290U2NvcGUnLCAnJGxvZycsICdjb25maWcnLCAnY2FyZHNGYWN0b3J5JywgJ01vZGFsU2VydmljZScsXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgkc2NvcGUsICRyb290U2NvcGUsICRsb2csIGNvbmZpZywgY2FyZHNGYWN0b3J5LCBNb2RhbFNlcnZpY2UpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBEaXNwbGF5IG9ubHkgWCB0YWdzXG4gICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5tYXhfbnVtX3RhZ3MgPSAzO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIFBpbiBDYXJkIChtYWtlIGl0ICdzdGlja3knKVxuICAgICAgICAgICAgICAgICAgICAgICAgICogXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBAcGFyYW0gQ2FyZCBpdGVtXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBAcmV0dXJucyB2b2lkXG4gICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5waW5DYXJkID0gZnVuY3Rpb24gKGl0ZW0pIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjYXJkID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogaXRlbS5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RpY2t5OiAhaXRlbS5zdGlja3lcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhamF4IGNhbGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXJkc0ZhY3RvcnkudXBkYXRlKGNhcmQpLiRwcm9taXNlLnRoZW4oZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGVtbWl0IGV2ZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgncGluLWNhcmQnLCBpdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRsb2cuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICogRGVsZXRlIENhcmRcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIFxuICAgICAgICAgICAgICAgICAgICAgICAgICogQHBhcmFtIENhcmQgaXRlbVxuICAgICAgICAgICAgICAgICAgICAgICAgICogQHJldHVybnMgdm9pZFxuICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGVsZXRlID0gZnVuY3Rpb24gKGl0ZW0pIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEp1c3QgcHJvdmlkZSBhIHRlbXBsYXRlIHVybCwgYSBjb250cm9sbGVyIGFuZCBjYWxsICdzaG93TW9kYWwnLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1vZGFsU2VydmljZS5zaG93TW9kYWwoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogY29uZmlnLlNSQ19GT0xERVIgKyBcImNvbW1vbi90ZW1wbGF0ZXMvbW9kYWxzL2NvbmZpcm0uaHRtbFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBcIlllc05vQ29udHJvbGxlclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnB1dHM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAndGl0bGUnOiAnRGVsZXRlIGNhcmQ/JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnY29udGVudCc6IFwiWW91J2xsIG5vdCBiZSBhYmxlIHRvIHJlY292ZXIgaXRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkudGhlbihmdW5jdGlvbiAobW9kYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWwuZWxlbWVudC5tb2RhbCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RhbC5jbG9zZS50aGVuKGZ1bmN0aW9uIChyZXN1bHQpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdCkgeyAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhamF4IGNhbGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXJkc0ZhY3RvcnkuZGVsZXRlKHtpZDogaXRlbS5pZH0pLiRwcm9taXNlLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZW1taXQgZXZlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdkZWxldGUtY2FyZCcsIGl0ZW0pOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkbG9nLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBFZGl0IENhcmRcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIFxuICAgICAgICAgICAgICAgICAgICAgICAgICogQHBhcmFtIENhcmQgaXRlbVxuICAgICAgICAgICAgICAgICAgICAgICAgICogQHJldHVybnMgdm9pZFxuICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZWRpdCA9IGZ1bmN0aW9uIChpdGVtKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBNb2RhbFNlcnZpY2Uuc2hvd01vZGFsKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IGNvbmZpZy5TUkNfRk9MREVSICsgXCJjYXJkcy90ZW1wbGF0ZXMvbW9kYWxzL2VkaXQtY2FyZC5odG1sXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IFwiRWRpdENhcmRDb250cm9sbGVyXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0czoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhcmQ6IGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKG1vZGFsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFsLmVsZW1lbnQubW9kYWwoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWwuY2xvc2UudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBwcmVwYXJlIGRhdGEgdG8gYmUgc2VuZCB0byBzZXJ2ZXIgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNhcmQgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBpdGVtLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBtb2RhbC5zY29wZS5mb3JtLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IG1vZGFsLnNjb3BlLmZvcm0uY29udGVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFqYXggY2FsbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhcmRzRmFjdG9yeS51cGRhdGUoY2FyZCkuJHByb21pc2UudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBlbW1pdCBldmVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ3VwZGF0ZS1jYXJkJywgaXRlbSwgY2FyZCk7ICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRsb2cuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIFZpZXcgY29udGVudCBpbiBtb2RhbGJveCB3aXRoIE1hcmtkb3duIChyaWNoIHRleHQgbW9kZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIFxuICAgICAgICAgICAgICAgICAgICAgICAgICogQHBhcmFtIENhcmQgaXRlbVxuICAgICAgICAgICAgICAgICAgICAgICAgICogQHJldHVybnMgdm9pZFxuICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUudmlld0FzTWFya2Rvd25Nb2RhbCA9IGZ1bmN0aW9uIChpdGVtKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBKdXN0IHByb3ZpZGUgYSB0ZW1wbGF0ZSB1cmwsIGEgY29udHJvbGxlciBhbmQgY2FsbCAnc2hvd01vZGFsJy5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBNb2RhbFNlcnZpY2Uuc2hvd01vZGFsKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IGNvbmZpZy5TUkNfRk9MREVSICsgXCJob21lL3RlbXBsYXRlcy9tb2RhbHMvbWFya2Rvd24uaHRtbFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBcIk1hcmtkb3duQ29udHJvbGxlclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnB1dHM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnY2FyZCc6IGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKG1vZGFsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFsLmVsZW1lbnQubW9kYWwoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICogT24gbmV3IHRhZyBhZGRlZCwgcHVzaCBpdCB0byB0aGUgbGlzdFxuICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuJG9uKCduZXctdGFnJywgZnVuY3Rpb24oZXZ0LCBkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYWRkIHRhZyBhcyB0aGUgbGFzdCB2aXNpYmxlIG9mIFggdGFnc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKHR5cGVvZigkc2NvcGUuY2FyZC50YWdzKSAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhZGQgdGFnIHRvIHRoZSBsaXN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5jYXJkLnRhZ3Muc3BsaWNlKCRzY29wZS5tYXhfbnVtX3RhZ3MtMSwgMCwgZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY3JlYXRlIHRoZSBsaXN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5jYXJkLnRhZ3MgPSBbZGF0YV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfV1cbiAgICAgICAgfTtcbiAgICB9XSk7XG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmNhcmRzJykuZGlyZWN0aXZlKCduZXdDYXJkRm9ybScsXG4gICAgICAgIFsnY29uZmlnJywgZnVuY3Rpb24gKGNvbmZpZykge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICAgICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICAgICAgICAgIGNhcmQ6IFwiPVwiXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBjb25maWcuU1JDX0ZPTERFUiArICdjYXJkcy90ZW1wbGF0ZXMvbmV3LWZvcm0uaHRtbCcsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogWyckc2NvcGUnLCAnJHJvb3RTY29wZScsICckbG9nJywgJ2NhcmRzRmFjdG9yeScsIGZ1bmN0aW9uICgkc2NvcGUsICRyb290U2NvcGUsICRsb2csIGNhcmRzRmFjdG9yeSkge1xuXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBTdWJtaXQgZm9ybVxuICAgICAgICAgICAgICAgICAgICAgKiBAcmV0dXJucyB2b2lkXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuY3JlYXRlQ2FyZCA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCRzY29wZS5jb250ZW50KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgZGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogJHNjb3BlLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6ICRzY29wZS5jb250ZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhcmRzRmFjdG9yeS5zYXZlKGRhdGEpLiRwcm9taXNlLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY2xhc3MgPSAnaGlnaGxpZ2h0ZWQnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmlkID0gcmVzcG9uc2UuaWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnbmV3LWNhcmQnLCBkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJGxvZy5lcnJvcihyZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5jb250ZW50ID0gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXX1cbiAgICAgICAgfV0pO1xufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAnKS5kaXJlY3RpdmUoJ3BhZ2luYXRlQ2FyZHMnLCBbJ2NvbmZpZycsXG4gICAgICAgIGZ1bmN0aW9uIChjb25maWcpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICByZXN0cmljdDogJ0VBJyxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogY29uZmlnLlNSQ19GT0xERVIgKyAnL2NhcmRzL3RlbXBsYXRlcy9wYWdpbmF0ZS1jYXJkcy5odG1sJyxcbiAgICAgICAgICAgICAgICB0cmFuc2NsdWRlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6ICc9J1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogWyckc2NvcGUnLCAnJHJvb3RTY29wZScsIGZ1bmN0aW9uICgkc2NvcGUsICRyb290U2NvcGUpIHtcbiAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogRHJhdyB3aWRnZXQgd2hlbiBkYXRhIGlzIGF2YWlsYWJsZVxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRvbignY2FyZHMtbG9hZGVkJywgZnVuY3Rpb24oZXZ0LCBkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUucGFnZXMgPSBkYXRhO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBCcm9hZGNhc3QgY2hhbmdlc1xuICAgICAgICAgICAgICAgICAgICAgKiBAcmV0dXJucyB2b2lkXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUubmF2aWdhdGUgPSBmdW5jdGlvbiAoJGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgJGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCB0YXJnZXQgPSAkZXZlbnQuY3VycmVudFRhcmdldDtcbiAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYodHlwZW9mKHRhcmdldC5hdHRyaWJ1dGVzWydkaXNhYmxlZCddKSA9PT0gJ3VuZGVmaW5lZCcgfHwgIXRhcmdldC5hdHRyaWJ1dGVzWydkaXNhYmxlZCddLnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdjYXJkcy1wYWdlLWNoYW5nZWQnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZ2U6IHRhcmdldC5hdHRyaWJ1dGVzWydkYXRhLXBhZ2UnXS52YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pOyAvLyBlbW1pdFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICBdKTtcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcblxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuY2FyZHMnKS5mYWN0b3J5KCdjYXJkc0ZhY3RvcnknLCBbJyRyZXNvdXJjZScsICdjb25maWcnLCBmdW5jdGlvbigkcmVzb3VyY2UsIGNvbmZpZykge1xuXG4gICAgICAgIHJldHVybiAkcmVzb3VyY2UoY29uZmlnLmFwaSArICcvY2FyZHMvOmlkJywgXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaWQ6ICdAaWQnLFxuICAgICAgICAgICAgICAgIHBhZ2U6ICdAcGFnZSdcbiAgICAgICAgICAgIH0sIFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHF1ZXJ5OiB7XG4gICAgICAgICAgICAgICAgICAgIHVybDogY29uZmlnLmFwaSArICcvY2FyZHMvdGFncy9hbGwnLFxuICAgICAgICAgICAgICAgICAgICBpc0FycmF5OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtUmVzcG9uc2U6IGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFuZ3VsYXIuZnJvbUpzb24ocmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB1cGRhdGU6IHtcbiAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BVVCcgXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7IFxuICAgIH1dKTtcbn0pKCk7XG5cbiIsIihmdW5jdGlvbiAoKSB7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwJykuY29udHJvbGxlcignSGVhZGVyQ29udHJvbGxlcicsIFsnJHNjb3BlJywgSGVhZGVyQ29udHJvbGxlcl0pO1xuXG4gICAgZnVuY3Rpb24gSGVhZGVyQ29udHJvbGxlcigkc2NvcGUpIHtcbiAgICAgICAgXG4gICAgfVxufSkoKTtcblxuXG4iLCIoZnVuY3Rpb24gKCkge1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmNvbnRyb2xsZXIoJ0xheW91dENvbnRyb2xsZXInLCBbJyRzY29wZScsICckc2NlJywgTGF5b3V0Q29udHJvbGxlcl0pO1xuXG4gICAgZnVuY3Rpb24gTGF5b3V0Q29udHJvbGxlcigkc2NvcGUsICRzY2UpIHtcblxuICAgICAgICAkc2NvcGUudGFnVXNlckNsaWNrID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgdmFyIHRhZ1RleHQgPSBlLnRhcmdldC5pbm5lclRleHQ7XG4gICAgICAgICAgICBhbGVydCgndGFnVXNlckNsaWNrLCB0YWdUZXh0OiAnICsgdGFnVGV4dCk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAkc2NvcGUudGFnVGVybUNsaWNrID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgdmFyIHRhZ1RleHQgPSBlLnRhcmdldC5pbm5lclRleHQ7XG4gICAgICAgICAgICBhbGVydCgndGFnVGVybUNsaWNrLCB0YWdUZXh0OiAnICsgdGFnVGV4dCk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvLyBZb3UgY291bGQgZGVmaW5lICd0YWdVc2VyQ2xpY2snIGFuZCAndGFnVGVybUNsaWNrJ1xuICAgICAgICAvLyBvbiB0aGUgJyRyb290U2NvcGUnLiBUaGlzIHdheSB5b3UgY2FuIGhhbmRsZSB3aGF0ZXZlclxuICAgICAgICAvLyBsb2dpYyB5b3Ugd2FudCBmb3IgaGFzaHRhZ3MgaW4gb25lIHBsYWNlIHJhdGhlciB0aGFuXG4gICAgICAgIC8vIGhhdmluZyB0byBkZWZpbmUgaXQgaW4gZWFjaCBjb250cm9sbGVyLlxuICAgICAgICBcbiAgICAgICAgJHNjb3BlLnRydXN0SHRtbCA9IGZ1bmN0aW9uKGh0bWwpIHtcbiAgICAgICAgICAgIC8vIFNhbml0aXplIG1hbnVhbGx5IGlmIG5lY2Vzc2FyeS4gSXQncyBsaWtlbHkgdGhpc1xuICAgICAgICAgICAgLy8gaHRtbCBoYXMgYWxyZWFkeSBiZWVuIHNhbml0aXplZCBzZXJ2ZXIgc2lkZVxuICAgICAgICAgICAgLy8gYmVmb3JlIGl0IHdlbnQgaW50byB5b3VyIGRhdGFiYXNlLlxuICAgICAgICAgICAgLy8gRG9uJ3QgaG9sZCBtZSBsaWFibGUgZm9yIFhTUy4uLiBuZXZlciBhc3N1bWUgOn4pXG4gICAgICAgICAgICByZXR1cm4gJHNjZS50cnVzdEFzSHRtbChodG1sKTtcbiAgICAgICAgfTtcbiAgICB9XG59KSgpO1xuXG5cbiIsIihmdW5jdGlvbiAoKSB7XG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmRpcmVjdGl2ZSgnYXV0b2ZvY3VzJywgZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmVzdHJpY3Q6ICdBJyxcbiAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCkge1xuICAgICAgICAgICAgICAgIGVsZW1lbnRbMF0uZm9jdXMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9KTtcbn0pKCk7XG5cbiAgICAgIiwiKGZ1bmN0aW9uICgpIHtcbiAgICAvLyBCZWNhdXNlIG9mIHRoZSBhbm1lIGFuZCBFIHR5cGUsIHdvcmtzIGF1dG9tYXRpY2FsbHkgZm9yIGV2ZXJ5IHRleHRhcmVhXG4gICAgLy8gcmVmOiBodHRwczovL2dpc3QuZ2l0aHViLmNvbS90aG9tc2VkZG9uLzQ3MDM5NjhcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwJykuZGlyZWN0aXZlKCdlbGFzdGljQXJlYScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnQScsXG4gICAgICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgICAgICAgICB2YXIgdGhyZXNob2xkID0gMzUsXG4gICAgICAgICAgICAgICAgICAgICAgICBtaW5IZWlnaHQgPSBlbGVtZW50WzBdLm9mZnNldEhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmdMZWZ0ID0gZWxlbWVudC5jc3MoJ3BhZGRpbmdMZWZ0JyksXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nUmlnaHQgPSBlbGVtZW50LmNzcygncGFkZGluZ1JpZ2h0Jyk7XG5cbiAgICAgICAgICAgICAgICB2YXIgJHNoYWRvdyA9IGFuZ3VsYXIuZWxlbWVudCgnPGRpdj48L2Rpdj4nKS5jc3Moe1xuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgICAgICAgICAgICAgICAgdG9wOiAtMTAwMDAsXG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6IC0xMDAwMCxcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IGVsZW1lbnRbMF0ub2Zmc2V0V2lkdGggLSBwYXJzZUludChwYWRkaW5nTGVmdCB8fCAwKSAtIHBhcnNlSW50KHBhZGRpbmdSaWdodCB8fCAwKSxcbiAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6IGVsZW1lbnQuY3NzKCdmb250U2l6ZScpLFxuICAgICAgICAgICAgICAgICAgICBmb250RmFtaWx5OiBlbGVtZW50LmNzcygnZm9udEZhbWlseScpLFxuICAgICAgICAgICAgICAgICAgICBsaW5lSGVpZ2h0OiBlbGVtZW50LmNzcygnbGluZUhlaWdodCcpLFxuICAgICAgICAgICAgICAgICAgICByZXNpemU6ICdub25lJ1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmJvZHkpLmFwcGVuZCgkc2hhZG93KTtcblxuICAgICAgICAgICAgICAgIHZhciB1cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB0aW1lcyA9IGZ1bmN0aW9uIChzdHJpbmcsIG51bWJlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIHIgPSAnJzsgaSA8IG51bWJlcjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgciArPSBzdHJpbmc7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcjtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHZhciB2YWwgPSBlbGVtZW50LnZhbCgpLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvJi9nLCAnJmFtcDsnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXG4kLywgJzxici8+Jm5ic3A7JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxuL2csICc8YnIvPicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcc3syLH0vZywgZnVuY3Rpb24gKHNwYWNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aW1lcygnJm5ic3A7Jywgc3BhY2UubGVuZ3RoIC0gMSkgKyAnICc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgJHNoYWRvdy5odG1sKHZhbCk7XG5cbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5jc3MoJ2hlaWdodCcsIE1hdGgubWF4KCRzaGFkb3dbMF0ub2Zmc2V0SGVpZ2h0ICsgdGhyZXNob2xkLCBtaW5IZWlnaHQpKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAkc2hhZG93LnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgZWxlbWVudC5iaW5kKCdrZXl1cCBrZXlkb3duIGtleXByZXNzIGNoYW5nZScsIHVwZGF0ZSk7XG4gICAgICAgICAgICAgICAgdXBkYXRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHsgXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmRpcmVjdGl2ZSgnaGFzaHRhZ2lmeScsIFsnJHRpbWVvdXQnLCAnJGNvbXBpbGUnLFxuICAgICAgICBmdW5jdGlvbigkdGltZW91dCwgJGNvbXBpbGUpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcmVzdHJpY3Q6ICdBJyxcbiAgICAgICAgICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgICAgICAgICB1Q2xpY2s6ICcmdXNlckNsaWNrJyxcbiAgICAgICAgICAgICAgICAgICAgdENsaWNrOiAnJnRlcm1DbGljaydcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBodG1sID0gZWxlbWVudC5odG1sKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChodG1sID09PSAnJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGF0dHJzLnVzZXJDbGljaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGh0bWwgPSBodG1sLnJlcGxhY2UoLyh8XFxzKSpAKFxcdyspL2csICckMTxhIG5nLWNsaWNrPVwidUNsaWNrKHskZXZlbnQ6ICRldmVudH0pXCIgY2xhc3M9XCJoYXNodGFnXCI+QCQyPC9hPicpOyBcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGF0dHJzLnRlcm1DbGljaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGh0bWwgPSBodG1sLnJlcGxhY2UoLyhefFxccykqIyhcXHcrKS9nLCAnJDE8YSBuZy1jbGljaz1cInRDbGljayh7JGV2ZW50OiAkZXZlbnR9KVwiIGNsYXNzPVwiaGFzaHRhZ1wiPiMkMjwvYT4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5odG1sKGh0bWwpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAkY29tcGlsZShlbGVtZW50LmNvbnRlbnRzKCkpKHNjb3BlKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIF0pO1xufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAnKS5kaXJlY3RpdmUoJ3Nlc3Npb25Ecm9wZG93bicsIFsnY29uZmlnJyxcbiAgICAgICAgZnVuY3Rpb24gKGNvbmZpZykge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHJlc3RyaWN0OiAnRUEnLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBjb25maWcuU1JDX0ZPTERFUiArICcvY29tbW9uL3RlbXBsYXRlcy9zZXNzaW9uLWRyb3Bkb3duLmh0bWwnLCAgIFxuICAgICAgICAgICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IFwiPVwiXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudHMsIGF0dHJzKSB7XG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLmltZ19mb2xkZXIgPSBjb25maWcuUFJPRklMRV9JTUdfRk9MREVSO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogWyckc2NvcGUnLCBmdW5jdGlvbiAoJHNjb3BlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnVzZXIgPSAkc2NvcGUuZGF0YTtcbiAgICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIF0pOyAgICAgICBcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcblxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAnKS5kaXJlY3RpdmUoJ3Nob3dNb3JlJyxcbiAgICAgICAgWydjb25maWcnLCBmdW5jdGlvbiAoY29uZmlnKSB7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IGNvbmZpZy5TUkNfRk9MREVSICsgJ2NvbW1vbi90ZW1wbGF0ZXMvc2hvd01vcmUuaHRtbCcsXG4gICAgICAgICAgICAgICAgcmVzdHJpY3Q6ICdBJyxcbiAgICAgICAgICAgICAgICB0cmFuc2NsdWRlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICAgICAgICAgICdzaG93TW9yZUhlaWdodCc6ICdAJ1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogWyckc2NvcGUnLCAnJGVsZW1lbnQnLCAnJGludGVydmFsJywgZnVuY3Rpb24gKCRzY29wZSwgJGVsZW1lbnQsICRpbnRlcnZhbCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXhwYW5kZWQgPSBmYWxzZTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgJGludGVydmFsKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW5kZXJTdHlsZXMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIDMwMCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5leHBhbmRhYmxlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiByZW5kZXJTdHlsZXMoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCRlbGVtZW50LmhlaWdodCgpID49ICRzY29wZS5zaG93TW9yZUhlaWdodCAmJiAkc2NvcGUuZXhwYW5kZWQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5leHBhbmRhYmxlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5zaG93TGVzc1N0eWxlID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdtYXgtaGVpZ2h0JzogJHNjb3BlLnNob3dNb3JlSGVpZ2h0ICsgJ3B4JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnb3ZlcmZsb3cnOiAnaGlkZGVuJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfV0pO1xufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAnKVxuICAgICAgICAuZmlsdGVyKCdyZWR1Y2VCeScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChjb2xsZWN0aW9uLCBmaWVsZCkge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHJldHVybiBjb2xsZWN0aW9uLnJlZHVjZShmdW5jdGlvbihvdXRwdXQsIGN1cnJlbnQpe1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoIWZpZWxkRXhpc3RzKG91dHB1dCwgZmllbGQsIGN1cnJlbnRbZmllbGRdKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gb3V0cHV0LmNvbmNhdChjdXJyZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgICAgICAgICAgICAgICAgIH0sIFtdKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gZmllbGRFeGlzdHMoaGF5c3RhY2ssIGZpZWxkTmFtZSwgZmllbGRWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaGF5c3RhY2suc29tZShmdW5jdGlvbihlbCkge1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBlbFtmaWVsZE5hbWVdID09PSBmaWVsZFZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9KTsgXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTsgICAgICAgICAgICBcbiAgICAgICAgfSk7XG59KSgpO1xuXG4iLCIoZnVuY3Rpb24gKCkge1xuICAgIFxuICAgICBhbmd1bGFyLm1vZHVsZSgnYXBwJykuZmFjdG9yeSgncXVlcnlGYWN0b3J5JywgWyckbG9nJywgJyRjb29raWVzJywgJyRyb290U2NvcGUnLCAnY2FyZHNGYWN0b3J5JywgJ3N0YWNrc0ZhY3RvcnknLCBxdWVyeUZhY3RvcnldKTtcbiAgICBcbiAgICBmdW5jdGlvbiBxdWVyeUZhY3RvcnkoJGxvZywgJGNvb2tpZXMsICRyb290U2NvcGUsIGNhcmRzRmFjdG9yeSwgc3RhY2tzRmFjdG9yeSkge1xuICAgICAgICBcbiAgICAgICAgdmFyIGZhY3RvcnkgPSB7fTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBnZXQgYWxsIGNhcmRzIGZyb20gc2VydmVyIGZvciBhIGdpdmVuIHVzZXJcbiAgICAgICAgICogXG4gICAgICAgICAqIEBwYXJhbSBqc29uIHBhcmFtc1xuICAgICAgICAgKiBAcmV0dXJucyBjYXJkc0ZhY3RvcnlcbiAgICAgICAgICogQGJyb2FkY2FzdCBjYXJkcyBsaXN0XG4gICAgICAgICAqL1xuICAgICAgICBmYWN0b3J5LmFsbCA9IGZ1bmN0aW9uIChwYXJhbXMpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gcGVyc2lzdCBwYXJhbXMgKGJ1dCBwYWdlIG51bWJlcilcbiAgICAgICAgICAgIGlmKHR5cGVvZihwYXJhbXMpICE9PSAndW5kZWZpbmVkJykge1xuXG4gICAgICAgICAgICAgICAgaWYodHlwZW9mKHBhcmFtcy5vcmRlcikgIT09ICd1bmRlZmluZWQnKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgJGNvb2tpZXMucHV0T2JqZWN0KCdvcmRlcicsIGFuZ3VsYXIuZnJvbUpzb24ocGFyYW1zLm9yZGVyKSk7ICAgXG5cbiAgICAgICAgICAgICAgICAgICAgcGFyYW1zID0gcGFyYW1zLm9yZGVyOyAvLyB1bndyYXAgZGF0YSAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIHF1ZXJ5XG4gICAgICAgICAgICByZXR1cm4gY2FyZHNGYWN0b3J5XG4gICAgICAgICAgICAgICAgLnF1ZXJ5KHBhcmFtcywgZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBicm9hZGNhc3QocmVzcG9uc2UpOyAvLyB0ZWxsIHRoZSB3b3JsZFxuICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgICAgICAkbG9nLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgfSk7ICBcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBnZXQgY2FyZCBieSBzdGFja1xuICAgICAgICAgKiBcbiAgICAgICAgICogQHBhcmFtIGpzb24gcGFyYW1zXG4gICAgICAgICAqIEByZXR1cm5zIHN0YWNrc0ZhY3RvcnlcbiAgICAgICAgICogQGJyb2FkY2FzdCBjYXJkcyBsaXN0XG4gICAgICAgICAqL1xuICAgICAgICBmYWN0b3J5LmJ5U3RhY2sgPSBmdW5jdGlvbiAocGFyYW1zKSB7XG4gICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiBzdGFja3NGYWN0b3J5LmZpbHRlcihwYXJhbXMsIGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgYnJvYWRjYXN0KHJlc3BvbnNlKTsgLy8gdGVsbCB0aGUgd29ybGRcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgICRsb2cuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogVGVsbCBldmVyeWJvZHkgd2UgaGF2ZSBhIHJlbm92YXRlZCBsaXN0XG4gICAgICAgICAqL1xuICAgICAgICBmdW5jdGlvbiBicm9hZGNhc3QoZGF0YSkge1xuICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdjYXJkcy1sb2FkZWQnLCBkYXRhKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGZhY3Rvcnk7XG4gICAgfSAgICBcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcblxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuaG9tZScpLmNvbnRyb2xsZXIoJ0hvbWVDb250cm9sbGVyJywgWyckc2NvcGUnLCBIb21lQ29udHJvbGxlcl0pO1xuXG4gICAgZnVuY3Rpb24gSG9tZUNvbnRyb2xsZXIoJHNjb3BlKSB7XG4gICAgICAgICAgXG4gICAgfVxufSkoKTtcblxuXG4iLCIoZnVuY3Rpb24oKXtcbiAgICBcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmhvbWUnKS5jb250cm9sbGVyKCdMaXN0Q29udHJvbGxlcicsIFsnJHNjb3BlJywgJyRsb2cnLCAnJGNvb2tpZVN0b3JlJywgJyRlbGVtZW50JywgJ3F1ZXJ5RmFjdG9yeScsICdIb21lQ29udGV4dFNlcnZpY2UnLCBMaXN0Q29udHJvbGxlcl0pO1xuICAgIFxuICAgIGZ1bmN0aW9uIExpc3RDb250cm9sbGVyKCRzY29wZSwgJGxvZywgJGNvb2tpZVN0b3JlLCAkZWxlbWVudCwgcXVlcnlGYWN0b3J5LCBIb21lQ29udGV4dFNlcnZpY2Upe1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdheSB0byBrZWVwIHNpYmxpbmdzIGNvbm5lY3RlZCBhbmQgc2hhcmluZyBzY29wZVxuICAgICAgICAgKi9cbiAgICAgICAgJHNjb3BlLmNvbnRleHQgPSBIb21lQ29udGV4dFNlcnZpY2UuY29udGV4dDtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHZXQgY2FyZHMgbGlzdFxuICAgICAgICAgKi9cbiAgICAgICAgJHNjb3BlLmxvYWQgPSBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gZ2V0IGRhdGEgZnJvbSBzZXJ2ZXJcbiAgICAgICAgICAgIHF1ZXJ5RmFjdG9yeVxuICAgICAgICAgICAgICAgIC5hbGwocGFyYW1zKS4kcHJvbWlzZS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgJGxvZy5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgIH0pOyAgXG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAkc2NvcGUubG9hZCgpOyAvLyBydW4gYXQgcGFnZSBsb2FkXG4gICAgICAgIFxuICAgICAgICAkc2NvcGUuJG9uKCdjYXJkcy1sb2FkZWQnLCBmdW5jdGlvbihldnQsIHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAkc2NvcGUuY29udGV4dC5jYXJkcyA9IHJlc3BvbnNlLmRhdGE7IC8vIGNhcmRzIGxpc3RcbiAgICAgICAgICAgICRzY29wZS5jb250ZXh0LnBhZ2VzID0gcmVzcG9uc2U7IC8vIHBhZ2VzIGRhdGEgICBcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogSGFuZGxlIGxpc3Qgb3JkZXJcbiAgICAgICAgICovXG4gICAgICAgICRzY29wZS4kb24oJ29yZGVyLWNoYW5nZWQnLCBmdW5jdGlvbihldnQsIHBhcmFtcykgeyAgIFxuICAgICAgICAgICAgJHNjb3BlLmxvYWQoe29yZGVyOiBwYXJhbXN9KTsgLy8gcmVsb2FkIGNhcmRzXG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEhhbmRsZSBwYWdpbmF0aW9uXG4gICAgICAgICAqL1xuICAgICAgICAkc2NvcGUuJG9uKCdjYXJkcy1wYWdlLWNoYW5nZWQnLCBmdW5jdGlvbihldnQsIHBhcmFtcykge1xuICAgICAgICAgICAgJHNjb3BlLmxvYWQocGFyYW1zKTsgLy8gcmVsb2FkIGNhcmRzXG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENyZWF0ZSBjYXJkXG4gICAgICAgICAqL1xuICAgICAgICAkc2NvcGUuJG9uKCduZXctY2FyZCcsIGZ1bmN0aW9uKGV2dCwgaXRlbSkge1xuICAgICAgICAgICAgJHNjb3BlLmNvbnRleHQuY2FyZHMudW5zaGlmdChpdGVtKTtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogUGluIGNhcmRcbiAgICAgICAgICovXG4gICAgICAgICRzY29wZS4kb24oJ3Bpbi1jYXJkJywgZnVuY3Rpb24oZXZ0LCBpdGVtKSB7XG4gICAgICAgICAgIFxuICAgICAgICAgICAgaWYoaXRlbS5zdGlja3kpIHtcbiAgICAgICAgICAgICAgICAvLyBub3Qgc3RpY2t5IGFueW1vcmVcbiAgICAgICAgICAgICAgICBpdGVtLnN0aWNreSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGl0ZW0uY2xhc3MgPSBpdGVtLmNsYXNzID8gaXRlbS5jbGFzcy5yZXBsYWNlKFwic3RpY2t5XCIsIFwiXCIpIDogXCJcIjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gc3RpY2t5LiBQdXQgaXQgZmlyc3RcbiAgICAgICAgICAgICAgICBpdGVtLnN0aWNreSA9IHRydWU7XG4gICAgICAgICAgICAgICAgaXRlbS5jbGFzcyA9IGl0ZW0uY2xhc3MgPyBpdGVtLmNsYXNzICsgXCIgc3RpY2t5XCIgOiBcInN0aWNreVwiOyAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBsZXQgaW5kZXggPSAkc2NvcGUuY29udGV4dC5jYXJkcy5pbmRleE9mKGl0ZW0pO1xuICAgICAgICAgICAgICAgICRzY29wZS5jb250ZXh0LmNhcmRzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmNvbnRleHQuY2FyZHMudW5zaGlmdChpdGVtKTtcbiAgICAgICAgICAgIH0gXG4gICAgICAgIH0pO1xuICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogRGVsZXRlIGNhcmRcbiAgICAgICAgICovXG4gICAgICAgICRzY29wZS4kb24oJ2RlbGV0ZS1jYXJkJywgZnVuY3Rpb24oZXZ0LCBpdGVtKSB7XG4gICAgICAgICAgICBsZXQgaW5kZXggPSAkc2NvcGUuY29udGV4dC5jYXJkcy5pbmRleE9mKGl0ZW0pO1xuICAgICAgICAgICAgJHNjb3BlLmNvbnRleHQuY2FyZHMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogVXBkYXRlIGNhcmRcbiAgICAgICAgICovXG4gICAgICAgICRzY29wZS4kb24oJ3VwZGF0ZS1jYXJkJywgZnVuY3Rpb24oZXZ0LCBvcmlnaW5hbCwgbmV3Q2FyZCkge1xuICAgICAgICAgICAgbGV0IGluZGV4ID0gJHNjb3BlLmNvbnRleHQuY2FyZHMuaW5kZXhPZihvcmlnaW5hbCk7XG4gICAgICAgICAgICBhbmd1bGFyLmV4dGVuZCgkc2NvcGUuY29udGV4dC5jYXJkc1tpbmRleF0sIG5ld0NhcmQpO1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBGaWx0ZXIgYnkgc3RhY2tcbiAgICAgICAgICovXG4gICAgICAgICRzY29wZS4kb24oJ3N0YWNrLXNlbGVjdGVkJywgZnVuY3Rpb24oZXZ0LCBzdGFjaykge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBxdWVyeSByZXN1bHRzXG4gICAgICAgICAgICBxdWVyeUZhY3RvcnkuYnlTdGFjayh7c3RhY2tfaWQ6IHN0YWNrLmlkfSk7XG4gICAgICAgICAgXG4gICAgICAgICAgICAvLyBwcm92aWRlIGluZm8gdG8gdmlld1xuICAgICAgICAgICAgJHNjb3BlLmNvbnRleHQuc3RhY2sgPSBzdGFjaztcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gcmVmcmVzaCBhbmltYXRpb24gKHdoZW4gZWxlbWVudCBhbHJlYWR5IHZpc2libGUpXG4gICAgICAgICAgICAkZWxlbWVudC5maW5kKCcuc3RhY2stZGVzY3JpcHRpb24nKS5hZGRDbGFzcygnZmxpcEluWCcpO1xuICAgICAgICB9KTsgICAgXG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQ2xlYXIgc3RhY2sgZGVzY3JpcHRpb24gYW5pbWF0aW9uIGNsYXNzIHdoZW4gZmluaXNoZWRcbiAgICAgICAgICovXG4gICAgICAgICRlbGVtZW50Lm9uKCd3ZWJraXRBbmltYXRpb25FbmQgbW96QW5pbWF0aW9uRW5kIE1TQW5pbWF0aW9uRW5kIG9hbmltYXRpb25lbmQgYW5pbWF0aW9uZW5kJywgJy5zdGFjay1kZXNjcmlwdGlvbicsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcyhcImZsaXBJblhcIik7XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgaWYoJGNvb2tpZVN0b3JlLmdldChcInN0YWNrXCIpKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIHByb3ZpZGUgaW5mbyB0byB2aWV3XG4gICAgICAgICAgICAkc2NvcGUuY29udGV4dC5zdGFjayA9ICRjb29raWVTdG9yZS5nZXQoXCJzdGFja1wiKTtcbiAgICAgICAgfVxuICAgIH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCl7XG4gICAgXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5ob21lJykuY29udHJvbGxlcignU2VhcmNoQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJ0hvbWVDb250ZXh0U2VydmljZScsIFNlYXJjaENvbnRyb2xsZXJdKTtcbiAgICBcbiAgICBmdW5jdGlvbiBTZWFyY2hDb250cm9sbGVyKCRzY29wZSwgSG9tZUNvbnRleHRTZXJ2aWNlKXtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBXYXkgdG8ga2VlcCBzaWJsaW5ncyBjb25uZWN0ZWQgYW5kIHNoYXJpbmcgc2NvcGVcbiAgICAgICAgICovXG4gICAgICAgICRzY29wZS5jb250ZXh0ID0gSG9tZUNvbnRleHRTZXJ2aWNlLmNvbnRleHQ7XG4gICAgfVxufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuaG9tZScpLmRpcmVjdGl2ZSgnb3JkZXJCeScsIFsnY29uZmlnJyxcbiAgICAgICAgZnVuY3Rpb24gKGNvbmZpZykge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHJlc3RyaWN0OiAnRUEnLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBjb25maWcuU1JDX0ZPTERFUiArICcvaG9tZS90ZW1wbGF0ZXMvb3JkZXItYnkuaHRtbCcsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogWyckc2NvcGUnLCAnJHJvb3RTY29wZScsIGZ1bmN0aW9uICgkc2NvcGUsICRyb290U2NvcGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpbml0aWFsIHBvc2l0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUub3JkZXIgPSAndXBkYXRlZF9hdCc7XG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGlyZWN0aW9uID0gJ2Rlc2MnO1xuICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS51cGRhdGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgZGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JkZXI6ICRzY29wZS5vcmRlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0aW9uOiAkc2NvcGUuZGlyZWN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnb3JkZXItY2hhbmdlZCcsIGRhdGEpOyAvLyBlbW1pdFxuICAgICAgICAgICAgICAgICAgICAgICAgfSAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH1dXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgXSk7XG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5ob21lJylcbiAgICAgICAgLmZpbHRlcignaGlnaGxpZ2h0VGV4dCcsIGZ1bmN0aW9uKCRzY2UpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAodGV4dCwgcGhyYXNlKSB7XG4gICAgICAgICAgICAgICAgbGV0IGhpZ2hsaWdodGVkID0gcGhyYXNlXG4gICAgICAgICAgICAgICAgICAgICAgICA/IHRleHQucmVwbGFjZShuZXcgUmVnRXhwKCcoJyArIHBocmFzZSArICcpJywgJ2dpJyksICc8c3BhbiBjbGFzcz1cImhpZ2hsaWdodC10ZXh0XCI+JDE8L3NwYW4+JylcbiAgICAgICAgICAgICAgICAgICAgICAgIDogdGV4dDtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHJldHVybiAkc2NlLnRydXN0QXNIdG1sKGhpZ2hsaWdodGVkKTtcbiAgICAgICAgICAgIH07ICAgICAgICAgICAgXG4gICAgICAgIH0pO1xufSkoKTtcblxuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcC5ob21lJykuc2VydmljZSgnSG9tZUNvbnRleHRTZXJ2aWNlJywgZnVuY3Rpb24oKXtcbiAgICB0aGlzLmNvbnRleHQgPSB7XG4gICAgICAgIGNhcmRzOiBbXSxcbiAgICAgICAgcXVlcnk6ICcnXG4gICAgfTtcbn0pOyIsIihmdW5jdGlvbigpe1xuICAgIFxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuc3RhY2tzJykuZGlyZWN0aXZlKCdzdGFja0xpc3RQYW5lbCcsIFsnY29uZmlnJywgJyRyb290U2NvcGUnLCAnJGNvb2tpZVN0b3JlJywgZnVuY3Rpb24oY29uZmlnLCAkcm9vdFNjb3BlLCAkY29va2llU3RvcmUpe1xuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IGNvbmZpZy5TUkNfRk9MREVSICsgJ3N0YWNrcy90ZW1wbGF0ZXMvc3RhY2stbGlzdC1wYW5lbC5odG1sJyxcbiAgICAgICAgICAgICAgICB0cmFuc2NsdWRlOiB0cnVlLCAgICAgICBcbiAgICAgICAgICAgICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuaW1nX2ZvbGRlciA9IGNvbmZpZy5QUk9GSUxFX0lNR19GT0xERVI7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBzY29wZS5jdXJyZW50X3N0YWNrID0gJGNvb2tpZVN0b3JlLmdldChcInN0YWNrXCIpOyAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJyRyb290U2NvcGUnLCAnJGxvZycsICckY29va2llcycsICdjb25maWcnLCAnc3RhY2tzRmFjdG9yeScsICdNb2RhbFNlcnZpY2UnLCBcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24oJHNjb3BlLCAkcm9vdFNjb3BlLCAkbG9nLCAkY29va2llcywgY29uZmlnLCBzdGFja3NGYWN0b3J5LCBNb2RhbFNlcnZpY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBHZXQgc3RhY2sgbGlzdFxuICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuc3RhY2tzID0gc3RhY2tzRmFjdG9yeS5xdWVyeSgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIENyZWF0ZSBuZXcgc3RhY2tcbiAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmFkZE5ldyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1vZGFsU2VydmljZS5zaG93TW9kYWwoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogY29uZmlnLlNSQ19GT0xERVIgKyBcInN0YWNrcy90ZW1wbGF0ZXMvbW9kYWxzL25ldy1zdGFjay5odG1sXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IFwiTmV3U3RhY2tDb250cm9sbGVyXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uKG1vZGFsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFsLmVsZW1lbnQubW9kYWwoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWwuY2xvc2UudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQpIHsgICAgXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBwcmVwYXJlIGRhdGEgdG8gc3VibWl0IHRvIHNlcnZlciBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgc3RhY2sgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IG1vZGFsLnNjb3BlLmZvcm0ubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IG1vZGFsLnNjb3BlLmZvcm0uZGVzY3JpcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFja3NGYWN0b3J5LnNhdmUoc3RhY2spLiRwcm9taXNlLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGVtbWl0IGV2ZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YWNrLmlkID0gcmVzcG9uc2UuaWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnbmV3LXN0YWNrJywgc3RhY2spO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYWRkIHRvIHN0YWNrXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5zdGFja3MudW5zaGlmdChzdGFjayk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24oZXJyKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRsb2cuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBGaWx0ZXIgYnkgc3RhY2tcbiAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmZpbHRlciA9IGZ1bmN0aW9uKCRldmVudCwgc3RhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGxpID0gJCgkZXZlbnQuY3VycmVudFRhcmdldCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGkuY2xvc2VzdCgndWwnKS5maW5kKCcubGlzdC1ncm91cC1pdGVtJykucmVtb3ZlQ2xhc3MoJ3NlbGVjdGVkJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGkucGFyZW50KCkuYWRkQ2xhc3MoJ3NlbGVjdGVkJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHBlcnNpc3QgZmlsdGVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJGNvb2tpZXMucHV0T2JqZWN0KCdzdGFjaycsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHN0YWNrLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBzdGFjay5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogc3RhY2suZGVzY3JpcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB0ZWxsIHRoZSB3b3JsZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnc3RhY2stc2VsZWN0ZWQnLCBzdGFjayk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgIH07XG4gICAgfV0pO1xufSkoKTsiLCIoZnVuY3Rpb24oKXtcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLnN0YWNrcycpLmZhY3RvcnkoJ3N0YWNrc0ZhY3RvcnknLCBbJyRyZXNvdXJjZScsICdjb25maWcnLCBmdW5jdGlvbiAoJHJlc291cmNlLCBjb25maWcpIHtcbiAgICAgICAgcmV0dXJuICRyZXNvdXJjZShjb25maWcuYXBpICsgJy9zdGFja3MvOmlkJywgeyBpZDogJ0BfaWQnLCBzdGFja19pZDogJ0BzdGFja19pZCcgfSwge1xuICAgICAgICAgICAgdXBkYXRlOiB7XG4gICAgICAgICAgICAgIG1ldGhvZDogJ1BVVCcgXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZmlsdGVyOiB7XG4gICAgICAgICAgICAgIHVybDogY29uZmlnLmFwaSArICcvc3RhY2tzLzpzdGFja19pZC9jYXJkcycsIFxuICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnIFxuICAgICAgICAgICAgfVxuICAgICAgICB9KTsgXG4gICAgfV0pO1xufSkoKTtcblxuIiwiKGZ1bmN0aW9uICgpIHtcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLnRhZ3MnKS5kaXJlY3RpdmUoJ25ld1RhZycsIFsnY29uZmlnJywgJ3RhZ3NGYWN0b3J5JywgJyRyb290U2NvcGUnLCAnJGFuaW1hdGUnLFxuICAgICAgICBmdW5jdGlvbiAoY29uZmlnLCB0YWdzRmFjdG9yeSwgJHJvb3RTY29wZSwgJGFuaW1hdGUpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICByZXN0cmljdDogJ0VBJyxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogY29uZmlnLlNSQ19GT0xERVIgKyAnL3RhZ3MvdGVtcGxhdGVzL25ldy10YWcuaHRtbCcsXG4gICAgICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgICAgICAgICBjYXJkOiBcIj1kYXRhXCJcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vIGFyY2hldHlwZVxuICAgICAgICAgICAgICAgICAgICBzY29wZS50YWcgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAnJ1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIEluaXRpYWwgd2lkZ2V0IHN0YXRlXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBzY29wZS5kaXNwbGF5ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogSGlkZSB3aWRnZXRcbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLnNob3cgPSBmdW5jdGlvbigpIHsgXG4gICAgICAgICAgICAgICAgICAgICAgICBzY29wZS5kaXNwbGF5ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLnZpc2liaWxpdHkgPSAndmlzaWJsZSc7IC8vIGNzcyBjbGFzc1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmZpbmQoJ2lucHV0JykuZm9jdXMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIDAuNSk7IC8vIHRpbWUgd2lsbCB2YXJ5IGFjY29yZGluZyB0byBjc3MgcnVsZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogSGlkZSB3aWRnZXRcbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLmhpZGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLmRpc3BsYXkgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLnZpc2liaWxpdHkgPSAnJzsgLy8gY3NzIGNsYXNzXG4gICAgICAgICAgICAgICAgICAgICAgICBzY29wZS50YWcubmFtZSA9ICcnOyAvLyByZXNldCBmaWVsZFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogY3JlYXRlcyBhIHRhZyBhbmQgYXR0YWNoIGl0IHRvIGN1cnJlbnQgY2FyZFxuICAgICAgICAgICAgICAgICAgICAgKiBcbiAgICAgICAgICAgICAgICAgICAgICogQHJldHVybnMgdm9pZFxuICAgICAgICAgICAgICAgICAgICAgKiBAYnJvYWRjYXN0cyBldmVudFxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuYWRkTmV3ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihzY29wZS50YWcubmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCB0YWcgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhcmRfaWQ6IHNjb3BlLmNhcmQuaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHNjb3BlLnRhZy5uYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWdzRmFjdG9yeS5zYXZlKHRhZywgZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFnLmlkID0gcmVzcG9uc2UuaWQ7IC8vIGFwcGVuZCB0YWcgaWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuZmxhc2hDbGFzcyhlbGVtZW50LCAnb2snKTsgLy8gdXggXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnbmV3LXRhZycsIHRhZyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLmZsYXNoQ2xhc3MoZWxlbWVudCwgJ2Vycm9yJyk7IC8vIHV4IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLnRhZy5uYW1lID0gJyc7IC8vIHJlc2V0IGZpZWxkXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogS2V5IGV2ZW50IChFbnRlcilcbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuYmluZChcImtleWRvd24ga2V5cHJlc3NcIiwgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihldmVudC53aGljaCA9PT0gMTMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY29wZS5hZGROZXcoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBBZGRzIGFuZCByZW1vdmVzIGEgY2xhc3NcbiAgICAgICAgICAgICAgICAgICAgICogXG4gICAgICAgICAgICAgICAgICAgICAqIEBwYXJhbSBzdHJpbmcgY2xhc3NOYW1lXG4gICAgICAgICAgICAgICAgICAgICAqIEByZXR1cm5zIHZvaWRcbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLmZsYXNoQ2xhc3MgPSBmdW5jdGlvbihlbGVtZW50LCBjbGFzc05hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAkYW5pbWF0ZS5hZGRDbGFzcyhlbGVtZW50LCBjbGFzc05hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkYW5pbWF0ZS5yZW1vdmVDbGFzcyhlbGVtZW50LCBjbGFzc05hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCA1MDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIF0pO1xufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuaG9tZScpLmRpcmVjdGl2ZSgndGFnQ2xvdWQnLCBbJ2NvbmZpZycsIFxuICAgICAgICBmdW5jdGlvbiAoY29uZmlnKSB7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcmVzdHJpY3Q6ICdFQScsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IGNvbmZpZy5TUkNfRk9MREVSICsgJy90YWdzL3RlbXBsYXRlcy90YWctY2xvdWQuaHRtbCcsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogWyckc2NvcGUnLCAncmVkdWNlQnlGaWx0ZXInLCBmdW5jdGlvbiAoJHNjb3BlLCByZWR1Y2VCeUZpbHRlcikge1xuXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBLZWVwIHRyYWNrIG9mIGNhcmQgbGlzdCBjaGFuZ2VzXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuJG9uKCdjYXJkcy1sb2FkZWQnLCBmdW5jdGlvbiAoZXZ0LCBjb2xsZWN0aW9uKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHR5cGVvZihjb2xsZWN0aW9uLmRhdGEpID09PSAndW5kZWZpbmVkJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGV4Y2x1ZGUgY2FyZCB3aXRoIG5vIHRhZ3NcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjYXJkcyA9IGNvbGxlY3Rpb24uZGF0YS5maWx0ZXIoZnVuY3Rpb24gKGNhcmQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2FyZC50YWdzID8gY2FyZC50YWdzLmxlbmd0aCA+IDAgOiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZXh0cmFjdCB0YWdzIGZyb20gY2FyZFxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHRhZ3MgPSBjYXJkcy5tYXAoZnVuY3Rpb24gKGNhcmQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShhbmd1bGFyLnRvSnNvbihjYXJkLnRhZ3MpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBtZXJnZSB0YWdzIGluIGZsYXR0ZW4gYXJyYXlcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBtZXJnZWQgPSBbXS5jb25jYXQuYXBwbHkoW10sIHRhZ3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZWxpbWluYXRlIGR1cGxpY2F0ZXMgYW5kIHNlcnZlIGFycmF5IHRvIHZpZXdcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS50YWdzID0gcmVkdWNlQnlGaWx0ZXIobWVyZ2VkLCAnaWQnKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICBdKTtcbn0pKCk7IiwiKGZ1bmN0aW9uKCl7XG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC50YWdzJykuZmFjdG9yeSgndGFnc0ZhY3RvcnknLCBbJyRyZXNvdXJjZScsICdjb25maWcnLCBmdW5jdGlvbiAoJHJlc291cmNlLCBjb25maWcpIHtcbiAgICAgICAgcmV0dXJuICRyZXNvdXJjZShjb25maWcuYXBpICsgJy90YWdzLzppZCcsIHsgaWQ6ICdAaWQnLCBjYXJkX2lkOiAnQGNhcmRfaWQnIH0sIHtcbiAgICAgICAgICAgIHNhdmU6IHtcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJywgXG4gICAgICAgICAgICAgICAgdXJsOiBjb25maWcuYXBpICsgJy9jYXJkcy86Y2FyZF9pZC90YWdzJyAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pOyBcbiAgICB9XSk7XG59KSgpO1xuXG4iLCIoZnVuY3Rpb24oKSB7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmNhcmRzJykuY29udHJvbGxlcignRWRpdENhcmRDb250cm9sbGVyJywgWyckc2NvcGUnLCAnZGF0YScsICdjbG9zZScsIEVkaXRDYXJkQ29udHJvbGxlcl0pO1xuICAgIFxuICAgIGZ1bmN0aW9uIEVkaXRDYXJkQ29udHJvbGxlcigkc2NvcGUsIGRhdGEsIGNsb3NlKSB7XG5cbiAgICAgICAgJHNjb3BlLmZvcm0gPSB7fTtcbiAgICAgICAgJHNjb3BlLmZvcm0ubmFtZSA9IGRhdGEuY2FyZC5uYW1lO1xuICAgICAgICAkc2NvcGUuZm9ybS5jb250ZW50ID0gZGF0YS5jYXJkLmNvbnRlbnQ7XG5cbiAgICAgICAgJHNjb3BlLmNsb3NlID0gZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICBcbiAgICAgICAgICAgIGNsb3NlKHJlc3VsdCwgMjAwKTsgLy8gY2xvc2UsIGJ1dCBnaXZlIDIwMG1zIGZvciBib290c3RyYXAgdG8gYW5pbWF0ZVxuICAgICAgICB9O1xuICAgIH07XG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmhvbWUnKS5jb250cm9sbGVyKCdZZXNOb0NvbnRyb2xsZXInLCBbJyRzY29wZScsICdkYXRhJywgJ2Nsb3NlJywgZnVuY3Rpb24gKCRzY29wZSwgZGF0YSwgY2xvc2UpIHtcbiAgICAgICAgICAgXG4gICAgICAgICAgICAkc2NvcGUudGl0bGUgPSBkYXRhLnRpdGxlO1xuICAgICAgICAgICAgJHNjb3BlLmNvbnRlbnQgPSBkYXRhLmNvbnRlbnQ7XG4gICAgICAgICAgIFxuICAgICAgICAgICAgJHNjb3BlLmNsb3NlID0gZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgIGNsb3NlKHJlc3VsdCwgMjAwKTsgLy8gY2xvc2UsIGJ1dCBnaXZlIDIwMG1zIGZvciBib290c3RyYXAgdG8gYW5pbWF0ZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfV0pO1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmhvbWUnKS5jb250cm9sbGVyKCdNYXJrZG93bkNvbnRyb2xsZXInLCBbJyRzY29wZScsICdkYXRhJywgJ2Nsb3NlJywgTWFya2Rvd25Db250cm9sbGVyXSk7XG4gICAgXG4gICAgZnVuY3Rpb24gTWFya2Rvd25Db250cm9sbGVyKCRzY29wZSwgZGF0YSwgY2xvc2UpIHtcblxuICAgICAgICAkc2NvcGUudGl0bGUgPSBkYXRhLmNhcmQubmFtZTtcbiAgICAgICAgJHNjb3BlLmNvbnRlbnQgPSBkYXRhLmNhcmQuY29udGVudDtcblxuICAgICAgICAkc2NvcGUuZGlzbWlzc01vZGFsID0gZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgY2xvc2UocmVzdWx0LCAyMDApOyAvLyBjbG9zZSwgYnV0IGdpdmUgMjAwbXMgZm9yIGJvb3RzdHJhcCB0byBhbmltYXRlXG4gICAgICAgIH07XG4gICAgfTtcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuICAgIFxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuc3RhY2tzJykuY29udHJvbGxlcignTmV3U3RhY2tDb250cm9sbGVyJywgWyckc2NvcGUnLCAnJGVsZW1lbnQnLCAnY2xvc2UnLCBOZXdTdGFja0NvbnRyb2xsZXJdKTtcbiAgICBcbiAgICBmdW5jdGlvbiBOZXdTdGFja0NvbnRyb2xsZXIoJHNjb3BlLCAkZWxlbWVudCwgY2xvc2UpIHtcbiAgICAgICBcbiAgICAgICAgJHNjb3BlLmZvcm0gPSB7XG4gICAgICAgICAgICBuYW1lOiAnJyxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnJ1xuICAgICAgICB9O1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogS2V5IGV2ZW50IChFbnRlcilcbiAgICAgICAgICovXG4gICAgICAgICRlbGVtZW50LmZpbmQoJ2lucHV0JykuYmluZChcImtleWRvd24ga2V5cHJlc3NcIiwgZnVuY3Rpb24gKGV2ZW50KSB7XG5cbiAgICAgICAgICAgIGlmKGV2ZW50LndoaWNoID09PSAxMykge1xuICAgICAgICAgICAgICAgICRlbGVtZW50Lm1vZGFsKCdoaWRlJyk7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmNsb3NlKHRydWUpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICAkc2NvcGUuY2xvc2UgPSBmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgIFxuICAgICAgICAgICAgY2xvc2UocmVzdWx0LCAyMDApOyAvLyBjbG9zZSwgYnV0IGdpdmUgMjAwbXMgZm9yIGJvb3RzdHJhcCB0byBhbmltYXRlXG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgXG4gICAgfTtcbn0pKCk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
