angular.module("app.config", [])
.constant("config", {
	"api": "http://localhost:8001/api/v1", 
	"debug": true,
        'SRC_FOLDER': 'src/app_modules/'
});

angular.module('app.cards', []);


'use strict';

angular.module('app', ['ngRoute', 'app.config', 'app.home', 'angularModalService']);
  
angular.module('app').config(['$httpProvider', function ($httpProvider) {
        
    $httpProvider.defaults.headers.common = { 
        'Content-Type': 'application/json',
        'Accept': 'application/json;odata=verbose',
        'X-Login-Ajax-call': 'true',
        'X-Requested-With': "XMLHttpRequest",
        'X-CSRF-TOKEN': Laravel.csrfToken,
      };
}])
 
angular.module('app').run([function () {
 
}]);

angular.module('app.home', ['ngRoute', 'ngCookies', 'app.config', 'ngAnimate', 'app.cards', 'app.stacks', 'hc.marked', 'ngSanitize']);

angular.module('app.stacks', ['ngResource']);

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
                controller: ['$scope', '$rootScope', 'config', 'cardsFactory', 'ModalService',
                    function ($scope, $rootScope, config, cardsFactory, ModalService) {

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
                                console.log(err);
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
                                            console.log(err);
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
                                            console.log(err);
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
                controller: ['$scope', '$rootScope', 'cardsFactory', function ($scope, $rootScope, cardsFactory) {

                    $scope.translations = {};
                    $scope.translations.write_something = "Write something and hash it...";

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
                                console.log(response);
                            })

                            $scope.content = '';
                        }
                    };
                }
            ]}
        }]);
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

        $scope.translations = {
            subtitle: 'Simply hash your notes and navigate them'
        };            
        
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
    angular.module('app').directive('paginateCards', ['config',
        function (config) {
            
            return {
                restrict: 'EA',
                templateUrl: config.SRC_FOLDER + '/common/templates/paginate-cards.html',
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
    angular.module('app').directive('sessionDropdown', ['config',
        function (config) {
            
            return {
                restrict: 'EA',
                templateUrl: config.SRC_FOLDER + '/common/templates/session-dropdown.html',   
                scope: {
                    data: "="
                },
                controller: ['$scope', function ($scope) {
                        
                    $scope.user = $scope.data;

                    $scope.translations = {
                        update_info: 'Update info',
                        logout: 'Logout',
                    }
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

    angular.module('app.home').controller('HomeController', ['$scope', HomeController]);

    function HomeController($scope) {

        $scope.translations = {
            home: {}
        };            
    }
})();



(function(){
    
    angular.module('app.home').controller('ListController', ['$scope', '$rootScope', '$cookies', 'cardsFactory', 'HomeContextService', ListController]);
    
    function ListController($scope, $rootScope, $cookies, cardsFactory, HomeContextService){
                
        $scope.translations.no_results = "No results";        
        
        /**
         * Way to keep siblings connected and sharing scope
         */
        $scope.context = HomeContextService.context;
        
        /**
         * Get cards list
         */
        $scope.load = function(params) {
            
            // get data from server
            cardsFactory
                .query(params, function (response) {
                    // all neat
                    $scope.context.cards = response.data; // cards list
                    $scope.context.pages = response; // pages data
                 
                    $rootScope.$broadcast('cards-loaded', response);
                }, function(err) {
                    console.log(err);
                });  
        };
        
        $scope.load(); // run at page load
        
        /**
         * Handle list order
         */
        $scope.$on('order-changed', function(evt, data) {
            $cookies.putObject('order', angular.fromJson(data));
            $scope.load(); // reload cards
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
    }
})();
(function(){
    
    angular.module('app.home').controller('SearchController', ['$scope', 'HomeContextService', SearchController]);
    
    function SearchController($scope, HomeContextService){
                
        $scope.translations.quick_search = "Quick Search...";    
        
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
    angular.module('app.home').directive('tagCloud', ['config', 
        function (config) {

            return {
                restrict: 'EA',
                templateUrl: config.SRC_FOLDER + '/home/templates/tag-cloud.html',
                controller: ['$scope', 'reduceByFilter', function ($scope, reduceByFilter) {

                    $scope.translations.home.tagCloud = {
                        title: "In this page"
                    };

                    /**
                     * Keep track of card list changes
                     */
                    $scope.$on('cards-loaded', function (evt, collection) {

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
    
    angular.module('app.stacks').directive('stackListPanel', ['config', function(config){
            
            return {
                restrict: 'E',
                templateUrl: config.SRC_FOLDER + 'stacks/templates/stack-list-panel.html',
                transclude: true,              
                controller: ['$scope', '$rootScope', 'stacksFactory', 'ModalService', 
                    function($scope, $rootScope, stacksFactory, ModalService) {
                        
                        $scope.translations = {
                            home: {
                                stackList: {
                                    title: "Stacks"
                                }
                            }    
                        }

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
                                console.log(err);
                            });
                        }
                }]
            };
    }]);
})();
(function(){
    angular.module('app.stacks').factory('stacksFactory', ['$resource', 'config', function ($resource, config) {
        return $resource(config.api + '/stacks/:id', { id: '@_id' }, {
            update: {
              method: 'PUT' 
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
    
    angular.module('app.stacks').controller('NewStackController', ['$scope', 'close', NewStackController]);
    
    function NewStackController($scope, close) {
       
        $scope.form = {
            name: '',
            description: '',
            placeholder: {
                name: 'Stack title...',
                description: 'Optional description...',
            }
        };
      
        $scope.close = function (result) {
           
            close(result, 200); // close, but give 200ms for bootstrap to animate
        };
    };
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC1jb25maWcuanMiLCJjYXJkcy9tb2R1bGUuanMiLCJjb21tb24vbW9kdWxlLmpzIiwiaG9tZS9tb2R1bGUuanMiLCJzdGFja3MvbW9kdWxlLmpzIiwiY2FyZHMvY2FyZHMtcm91dGUuanMiLCJjb21tb24vYXBwLXJvdXRlLmpzIiwiaG9tZS9ob21lLXJvdXRlLmpzIiwibG9naW4vbG9naW4uanMiLCJzdGFja3MvaG9tZS1yb3V0ZS5qcyIsImNhcmRzL2RpcmVjdGl2ZXMvY2FyZC5qcyIsImNhcmRzL2RpcmVjdGl2ZXMvbmV3LWNhcmQuanMiLCJjYXJkcy9zZXJ2aWNlcy9jYXJkcy1mYWN0b3J5LmpzIiwiY29tbW9uL2NvbnRyb2xsZXJzL2hlYWRlci1jb250cm9sbGVycy5qcyIsImNvbW1vbi9jb250cm9sbGVycy9sYXlvdXQtY29udHJvbGxlcnMuanMiLCJjb21tb24vZGlyZWN0aXZlcy9hdXRvZm9jdXMuanMiLCJjb21tb24vZGlyZWN0aXZlcy9lbGFzdGljQXJlYS5qcyIsImNvbW1vbi9kaXJlY3RpdmVzL2hhc2h0YWdpZnkuanMiLCJjb21tb24vZGlyZWN0aXZlcy9wYWdpbmF0ZS1jYXJkcy5qcyIsImNvbW1vbi9kaXJlY3RpdmVzL3Nlc3Npb25Ecm9wZG93bi5qcyIsImNvbW1vbi9kaXJlY3RpdmVzL3Nob3dNb3JlLmpzIiwiY29tbW9uL2ZpbHRlcnMvcmVkdWNlQnkuanMiLCJob21lL2NvbnRyb2xsZXJzL2hvbWUtY29udHJvbGxlci5qcyIsImhvbWUvY29udHJvbGxlcnMvbGlzdC1jb250cm9sbGVyLmpzIiwiaG9tZS9jb250cm9sbGVycy9zZWFyY2gtY29udHJvbGxlci5qcyIsImhvbWUvZGlyZWN0aXZlcy9vcmRlci1ieS5qcyIsImhvbWUvZGlyZWN0aXZlcy90YWctY2xvdWQuanMiLCJob21lL2ZpbHRlcnMvaGlnaGxpZ2h0VGV4dC5qcyIsImhvbWUvc2VydmljZXMvaG9tZS1jb250ZXh0LmpzIiwic3RhY2tzL2RpcmVjdGl2ZXMvc3RhY2stbGlzdC1wYW5lbC5qcyIsInN0YWNrcy9zZXJ2aWNlcy9zdGFja3MtZmFjdG9yeS5qcyIsImNhcmRzL2NvbnRyb2xsZXJzL21vZGFscy9lZGl0LWNhcmQtY29udHJvbGxlci5qcyIsImNvbW1vbi9jb250cm9sbGVycy9tb2RhbHMveWVzLW5vLWNvbnRyb2xsZXIuanMiLCJob21lL2NvbnRyb2xsZXJzL21vZGFscy9tYXJrZG93bi1jb250cm9sbGVyLmpzIiwic3RhY2tzL2NvbnRyb2xsZXJzL21vZGFscy9uZXctc3RhY2stY29udHJvbGxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxRQUFBLE9BQUEsY0FBQTtDQUNBLFNBQUEsVUFBQTtDQUNBLE9BQUE7Q0FDQSxTQUFBO1FBQ0EsY0FBQTs7O0FDSkEsUUFBQSxPQUFBLGFBQUE7OztBQ0FBOztBQUVBLFFBQUEsT0FBQSxPQUFBLENBQUEsV0FBQSxjQUFBLFlBQUE7O0FBRUEsUUFBQSxPQUFBLE9BQUEsT0FBQSxDQUFBLGlCQUFBLFVBQUEsZUFBQTs7SUFFQSxjQUFBLFNBQUEsUUFBQSxTQUFBO1FBQ0EsZ0JBQUE7UUFDQSxVQUFBO1FBQ0EscUJBQUE7UUFDQSxvQkFBQTtRQUNBLGdCQUFBLFFBQUE7Ozs7QUFJQSxRQUFBLE9BQUEsT0FBQSxJQUFBLENBQUEsWUFBQTs7OztBQ2ZBLFFBQUEsT0FBQSxZQUFBLENBQUEsV0FBQSxhQUFBLGNBQUEsYUFBQSxhQUFBLGNBQUEsYUFBQTs7QUNBQSxRQUFBLE9BQUEsY0FBQSxDQUFBOztBQ0FBLFFBQUEsT0FBQSxhQUFBLDBCQUFBLFNBQUEsZ0JBQUE7OztBQ0FBLENBQUEsWUFBQTtJQUNBLFFBQUEsT0FBQSxPQUFBLE9BQUEsQ0FBQSxrQkFBQSxVQUFBLFNBQUEsZ0JBQUEsUUFBQTs7TUFFQTtTQUNBLEtBQUEsS0FBQTtZQUNBLGFBQUEsT0FBQSxhQUFBO1lBQ0EsWUFBQTtZQUNBLGNBQUE7OztTQUdBLFVBQUEsQ0FBQSxZQUFBOzs7QUNWQSxRQUFBLE9BQUEsWUFBQSwwQkFBQSxTQUFB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QSxPQUFBLFVBQUEsYUFBQSxZQUFBO1FBQ0EsT0FBQTtZQUNBLFVBQUE7WUFDQSxNQUFBLFVBQUEsT0FBQSxTQUFBO2dCQUNBLFFBQUEsR0FBQTs7Ozs7OztBQ0xBLENBQUEsWUFBQTs7O0lBR0EsUUFBQSxPQUFBLE9BQUEsVUFBQSxlQUFBLFlBQUE7UUFDQSxPQUFBO1lBQ0EsVUFBQTtZQUNBLE1BQUEsVUFBQSxPQUFBLFNBQUEsWUFBQTtnQkFDQSxJQUFBLFlBQUE7d0JBQ0EsWUFBQSxRQUFBLEdBQUE7d0JBQ0EsY0FBQSxRQUFBLElBQUE7d0JBQ0EsZUFBQSxRQUFBLElBQUE7O2dCQUVBLElBQUEsVUFBQSxRQUFBLFFBQUEsZUFBQSxJQUFBO29CQUNBLFVBQUE7b0JBQ0EsS0FBQSxDQUFBO29CQUNBLE1BQUEsQ0FBQTtvQkFDQSxPQUFBLFFBQUEsR0FBQSxjQUFBLFNBQUEsZUFBQSxLQUFBLFNBQUEsZ0JBQUE7b0JBQ0EsVUFBQSxRQUFBLElBQUE7b0JBQ0EsWUFBQSxRQUFBLElBQUE7b0JBQ0EsWUFBQSxRQUFBLElBQUE7b0JBQ0EsUUFBQTs7O2dCQUdBLFFBQUEsUUFBQSxTQUFBLE1BQUEsT0FBQTs7Z0JBRUEsSUFBQSxTQUFBLFlBQUE7b0JBQ0EsSUFBQSxRQUFBLFVBQUEsUUFBQSxRQUFBO3dCQUNBLEtBQUEsSUFBQSxJQUFBLEdBQUEsSUFBQSxJQUFBLElBQUEsUUFBQSxLQUFBOzRCQUNBLEtBQUE7O3dCQUVBLE9BQUE7OztvQkFHQSxJQUFBLE1BQUEsUUFBQSxNQUFBLFFBQUEsTUFBQTs2QkFDQSxRQUFBLE1BQUE7NkJBQ0EsUUFBQSxNQUFBOzZCQUNBLFFBQUEsT0FBQTs2QkFDQSxRQUFBLE9BQUE7NkJBQ0EsUUFBQSxXQUFBLFVBQUEsT0FBQTtnQ0FDQSxPQUFBLE1BQUEsVUFBQSxNQUFBLFNBQUEsS0FBQTs7O29CQUdBLFFBQUEsS0FBQTs7b0JBRUEsUUFBQSxJQUFBLFVBQUEsS0FBQSxJQUFBLFFBQUEsR0FBQSxlQUFBLFdBQUE7OztnQkFHQSxNQUFBLElBQUEsWUFBQSxZQUFBO29C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QUEsS0FBQSxLQUFBO1FBQ0EsT0FBQSxVQUFBLEtBQUEsS0FBQTs7UUFFQSxPQUFBLGVBQUEsVUFBQSxRQUFBO1lBQ0EsTUFBQSxRQUFBOztLQUVBOztBQ1pBLENBQUEsV0FBQTs7SUFFQSxRQUFBLE9BQUEsY0FBQSxXQUFBLHNCQUFBLENBQUEsVUFBQSxTQUFBOztJQUVBLFNBQUEsbUJBQUEsUUFBQSxPQUFBOztRQUVBLE9BQUEsT0FBQTtZQUNBLE1BQUE7WUFDQSxhQUFBO1lBQ0EsYUFBQTtnQkFDQSxNQUFBO2dCQUNBLGFBQUE7Ozs7UUFJQSxPQUFBLFFBQUEsVUFBQSxRQUFBOztZQUVBLE1BQUEsUUFBQTs7S0FFQTtLQUNBIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbImFuZ3VsYXIubW9kdWxlKFwiYXBwLmNvbmZpZ1wiLCBbXSlcbi5jb25zdGFudChcImNvbmZpZ1wiLCB7XG5cdFwiYXBpXCI6IFwiaHR0cDovL2xvY2FsaG9zdDo4MDAxL2FwaS92MVwiLCBcblx0XCJkZWJ1Z1wiOiB0cnVlLFxuICAgICAgICAnU1JDX0ZPTERFUic6ICdzcmMvYXBwX21vZHVsZXMvJ1xufSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwLmNhcmRzJywgW10pO1xuXG4iLCIndXNlIHN0cmljdCc7XG5cbmFuZ3VsYXIubW9kdWxlKCdhcHAnLCBbJ25nUm91dGUnLCAnYXBwLmNvbmZpZycsICdhcHAuaG9tZScsICdhbmd1bGFyTW9kYWxTZXJ2aWNlJ10pO1xuICBcbmFuZ3VsYXIubW9kdWxlKCdhcHAnKS5jb25maWcoWyckaHR0cFByb3ZpZGVyJywgZnVuY3Rpb24gKCRodHRwUHJvdmlkZXIpIHtcbiAgICAgICAgXG4gICAgJGh0dHBQcm92aWRlci5kZWZhdWx0cy5oZWFkZXJzLmNvbW1vbiA9IHsgXG4gICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vanNvbjtvZGF0YT12ZXJib3NlJyxcbiAgICAgICAgJ1gtTG9naW4tQWpheC1jYWxsJzogJ3RydWUnLFxuICAgICAgICAnWC1SZXF1ZXN0ZWQtV2l0aCc6IFwiWE1MSHR0cFJlcXVlc3RcIixcbiAgICAgICAgJ1gtQ1NSRi1UT0tFTic6IExhcmF2ZWwuY3NyZlRva2VuLFxuICAgICAgfTtcbn1dKVxuIFxuYW5ndWxhci5tb2R1bGUoJ2FwcCcpLnJ1bihbZnVuY3Rpb24gKCkge1xuIFxufV0pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcC5ob21lJywgWyduZ1JvdXRlJywgJ25nQ29va2llcycsICdhcHAuY29uZmlnJywgJ25nQW5pbWF0ZScsICdhcHAuY2FyZHMnLCAnYXBwLnN0YWNrcycsICdoYy5tYXJrZWQnLCAnbmdTYW5pdGl6ZSddKTtcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAuc3RhY2tzJywgWyduZ1Jlc291cmNlJ10pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcC5jYXJkcycpLmNvbmZpZyhmdW5jdGlvbigkcm91dGVQcm92aWRlcikge1xuICAgXG59KTsiLCIoZnVuY3Rpb24gKCkge1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAnKS5jb25maWcoWyckcm91dGVQcm92aWRlcicsICdjb25maWcnLCBmdW5jdGlvbigkcm91dGVQcm92aWRlciwgY29uZmlnKSB7XG5cbiAgICAgICRyb3V0ZVByb3ZpZGVyXG4gICAgICAgIC53aGVuKCcvJywge1xuICAgICAgICAgICAgdGVtcGxhdGVVcmw6IGNvbmZpZy5TUkNfRk9MREVSICsgJ2hvbWUvdGVtcGxhdGVzL2hvbWUtdGVtcGxhdGUuaHRtbCcsXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnSG9tZUNvbnRyb2xsZXInLFxuICAgICAgICAgICAgY29udHJvbGxlckFzOiAnaG9tZSdcbiAgICAgICAgfSlcblxuICAgICAgICAub3RoZXJ3aXNlKHtyZWRpcmVjdFRvOiAnLyd9KTsgXG4gICAgfV0pO1xufSkoKTsiLCJhbmd1bGFyLm1vZHVsZSgnYXBwLmhvbWUnKS5jb25maWcoZnVuY3Rpb24oJHJvdXRlUHJvdmlkZXIpIHtcblxufSk7IiwiXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XG5cbiAgICAvLyBzd2l0Y2ggZm9ybXNcbiAgICAkKCcubWVzc2FnZSBhJykuY2xpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICBcbiAgICAgICAgJCgnZm9ybScpLmFuaW1hdGUoe2hlaWdodDogXCJ0b2dnbGVcIiwgb3BhY2l0eTogXCJ0b2dnbGVcIn0sIFwic2xvd1wiKTtcbiAgICAgICAgXG4gICAgICAgIGlmKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSA9PSAnL2xvZ2luJykge1xuICAgICAgICAgICAgaGlzdG9yeS5wdXNoU3RhdGUoe30sIFwiUmVnaXN0ZXJcIiwgXCIvcmVnaXN0ZXJcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBoaXN0b3J5LnB1c2hTdGF0ZSh7fSwgXCJMb2dpblwiLCBcIi9sb2dpblwiKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgJCgnZm9ybSAuaGVscC1ibG9jaycpLmhpZGUoKTtcbiAgICB9KTtcblxufSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcC5zdGFja3MnKS5jb25maWcoZnVuY3Rpb24oJHJvdXRlUHJvdmlkZXIpIHtcblxufSk7IiwiKGZ1bmN0aW9uICgpIHtcblxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuY2FyZHMnKS5kaXJlY3RpdmUoJ2NhcmQnLFxuICAgICAgICBbJ2NvbmZpZycsIGZ1bmN0aW9uIChjb25maWcpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IGNvbmZpZy5TUkNfRk9MREVSICsgJ2NhcmRzL3RlbXBsYXRlcy9jYXJkLmh0bWwnLFxuICAgICAgICAgICAgICAgIHJlc3RyaWN0OiAnQScsXG4gICAgICAgICAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgICAgICAgICBjYXJkOiBcIj1kYXRhXCJcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJyRyb290U2NvcGUnLCAnY29uZmlnJywgJ2NhcmRzRmFjdG9yeScsICdNb2RhbFNlcnZpY2UnLFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoJHNjb3BlLCAkcm9vdFNjb3BlLCBjb25maWcsIGNhcmRzRmFjdG9yeSwgTW9kYWxTZXJ2aWNlKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICogUGluIENhcmQgKG1ha2UgaXQgJ3N0aWNreScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIEBwYXJhbSBDYXJkIGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgICAgICAqIEByZXR1cm5zIHZvaWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnBpbkNhcmQgPSBmdW5jdGlvbiAoaXRlbSkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNhcmQgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBpdGVtLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGlja3k6ICFpdGVtLnN0aWNreVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFqYXggY2FsbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhcmRzRmFjdG9yeS51cGRhdGUoY2FyZCkuJHByb21pc2UudGhlbihmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZW1taXQgZXZlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdwaW4tY2FyZCcsIGl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICogRGVsZXRlIENhcmRcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIFxuICAgICAgICAgICAgICAgICAgICAgICAgICogQHBhcmFtIENhcmQgaXRlbVxuICAgICAgICAgICAgICAgICAgICAgICAgICogQHJldHVybnMgdm9pZFxuICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGVsZXRlID0gZnVuY3Rpb24gKGl0ZW0pIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEp1c3QgcHJvdmlkZSBhIHRlbXBsYXRlIHVybCwgYSBjb250cm9sbGVyIGFuZCBjYWxsICdzaG93TW9kYWwnLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1vZGFsU2VydmljZS5zaG93TW9kYWwoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogY29uZmlnLlNSQ19GT0xERVIgKyBcImNvbW1vbi90ZW1wbGF0ZXMvbW9kYWxzL2NvbmZpcm0uaHRtbFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBcIlllc05vQ29udHJvbGxlclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnB1dHM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAndGl0bGUnOiAnRGVsZXRlIGNhcmQ/JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnY29udGVudCc6IFwiWW91J2xsIG5vdCBiZSBhYmxlIHRvIHJlY292ZXIgaXRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkudGhlbihmdW5jdGlvbiAobW9kYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWwuZWxlbWVudC5tb2RhbCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RhbC5jbG9zZS50aGVuKGZ1bmN0aW9uIChyZXN1bHQpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdCkgeyAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhamF4IGNhbGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXJkc0ZhY3RvcnkuZGVsZXRlKHtpZDogaXRlbS5pZH0pLiRwcm9taXNlLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZW1taXQgZXZlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdkZWxldGUtY2FyZCcsIGl0ZW0pOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICogRWRpdCBDYXJkXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIEBwYXJhbSBDYXJkIGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgICAgICAqIEByZXR1cm5zIHZvaWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmVkaXQgPSBmdW5jdGlvbiAoaXRlbSkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTW9kYWxTZXJ2aWNlLnNob3dNb2RhbCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBjb25maWcuU1JDX0ZPTERFUiArIFwiY2FyZHMvdGVtcGxhdGVzL21vZGFscy9lZGl0LWNhcmQuaHRtbFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBcIkVkaXRDYXJkQ29udHJvbGxlclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnB1dHM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXJkOiBpdGVtXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIChtb2RhbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RhbC5lbGVtZW50Lm1vZGFsKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFsLmNsb3NlLnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcHJlcGFyZSBkYXRhIHRvIGJlIHNlbmQgdG8gc2VydmVyIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjYXJkID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogaXRlbS5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogbW9kYWwuc2NvcGUuZm9ybS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBtb2RhbC5zY29wZS5mb3JtLmNvbnRlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhamF4IGNhbGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXJkc0ZhY3RvcnkudXBkYXRlKGNhcmQpLiRwcm9taXNlLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZW1taXQgZXZlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCd1cGRhdGUtY2FyZCcsIGl0ZW0sIGNhcmQpOyAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICogVmlldyBjb250ZW50IGluIG1vZGFsYm94IHdpdGggTWFya2Rvd24gKHJpY2ggdGV4dCBtb2RlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICogXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBAcGFyYW0gQ2FyZCBpdGVtXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBAcmV0dXJucyB2b2lkXG4gICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS52aWV3QXNNYXJrZG93bk1vZGFsID0gZnVuY3Rpb24gKGl0ZW0pIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEp1c3QgcHJvdmlkZSBhIHRlbXBsYXRlIHVybCwgYSBjb250cm9sbGVyIGFuZCBjYWxsICdzaG93TW9kYWwnLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1vZGFsU2VydmljZS5zaG93TW9kYWwoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogY29uZmlnLlNSQ19GT0xERVIgKyBcImhvbWUvdGVtcGxhdGVzL21vZGFscy9tYXJrZG93bi5odG1sXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IFwiTWFya2Rvd25Db250cm9sbGVyXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0czoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdjYXJkJzogaXRlbVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkudGhlbihmdW5jdGlvbiAobW9kYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWwuZWxlbWVudC5tb2RhbCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XSk7XG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmNhcmRzJykuZGlyZWN0aXZlKCduZXdDYXJkRm9ybScsXG4gICAgICAgIFsnY29uZmlnJywgZnVuY3Rpb24gKGNvbmZpZykge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICAgICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICAgICAgICAgIGNhcmQ6IFwiPVwiXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBjb25maWcuU1JDX0ZPTERFUiArICdjYXJkcy90ZW1wbGF0ZXMvbmV3LWZvcm0uaHRtbCcsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogWyckc2NvcGUnLCAnJHJvb3RTY29wZScsICdjYXJkc0ZhY3RvcnknLCBmdW5jdGlvbiAoJHNjb3BlLCAkcm9vdFNjb3BlLCBjYXJkc0ZhY3RvcnkpIHtcblxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUudHJhbnNsYXRpb25zID0ge307XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS50cmFuc2xhdGlvbnMud3JpdGVfc29tZXRoaW5nID0gXCJXcml0ZSBzb21ldGhpbmcgYW5kIGhhc2ggaXQuLi5cIjtcblxuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogU3VibWl0IGZvcm1cbiAgICAgICAgICAgICAgICAgICAgICogQHJldHVybnMgdm9pZFxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmNyZWF0ZUNhcmQgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgkc2NvcGUuY29udGVudCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGRhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICRzY29wZS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiAkc2NvcGUuY29udGVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXJkc0ZhY3Rvcnkuc2F2ZShkYXRhKS4kcHJvbWlzZS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNsYXNzID0gJ2hpZ2hsaWdodGVkJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5pZCA9IHJlc3BvbnNlLmlkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ25ldy1jYXJkJywgZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmNvbnRlbnQgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdfVxuICAgICAgICB9XSk7XG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmNhcmRzJykuZmFjdG9yeSgnY2FyZHNGYWN0b3J5JywgWyckcmVzb3VyY2UnLCAnY29uZmlnJywgZnVuY3Rpb24oJHJlc291cmNlLCBjb25maWcpIHtcblxuICAgICAgICByZXR1cm4gJHJlc291cmNlKGNvbmZpZy5hcGkgKyAnL2NhcmRzLzppZCcsIFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGlkOiAnQGlkJyxcbiAgICAgICAgICAgICAgICBwYWdlOiAnQHBhZ2UnXG4gICAgICAgICAgICB9LCBcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBxdWVyeToge1xuICAgICAgICAgICAgICAgICAgICB1cmw6IGNvbmZpZy5hcGkgKyAnL2NhcmRzL3RhZ3MvYWxsJyxcbiAgICAgICAgICAgICAgICAgICAgaXNBcnJheTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybVJlc3BvbnNlOiBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhbmd1bGFyLmZyb21Kc29uKHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdXBkYXRlOiB7XG4gICAgICAgICAgICAgICAgICBtZXRob2Q6ICdQVVQnIFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pOyBcbiAgICB9XSk7XG59KSgpO1xuXG4iLCIoZnVuY3Rpb24gKCkge1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmNvbnRyb2xsZXIoJ0hlYWRlckNvbnRyb2xsZXInLCBbJyRzY29wZScsIEhlYWRlckNvbnRyb2xsZXJdKTtcblxuICAgIGZ1bmN0aW9uIEhlYWRlckNvbnRyb2xsZXIoJHNjb3BlKSB7XG4gICAgICAgIFxuICAgIH1cbn0pKCk7XG5cblxuIiwiKGZ1bmN0aW9uICgpIHtcblxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAnKS5jb250cm9sbGVyKCdMYXlvdXRDb250cm9sbGVyJywgWyckc2NvcGUnLCAnJHNjZScsIExheW91dENvbnRyb2xsZXJdKTtcblxuICAgIGZ1bmN0aW9uIExheW91dENvbnRyb2xsZXIoJHNjb3BlLCAkc2NlKSB7XG5cbiAgICAgICAgJHNjb3BlLnRyYW5zbGF0aW9ucyA9IHtcbiAgICAgICAgICAgIHN1YnRpdGxlOiAnU2ltcGx5IGhhc2ggeW91ciBub3RlcyBhbmQgbmF2aWdhdGUgdGhlbSdcbiAgICAgICAgfTsgICAgICAgICAgICBcbiAgICAgICAgXG4gICAgICAgICRzY29wZS50YWdVc2VyQ2xpY2sgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICB2YXIgdGFnVGV4dCA9IGUudGFyZ2V0LmlubmVyVGV4dDtcbiAgICAgICAgICAgIGFsZXJ0KCd0YWdVc2VyQ2xpY2ssIHRhZ1RleHQ6ICcgKyB0YWdUZXh0KTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgICRzY29wZS50YWdUZXJtQ2xpY2sgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICB2YXIgdGFnVGV4dCA9IGUudGFyZ2V0LmlubmVyVGV4dDtcbiAgICAgICAgICAgIGFsZXJ0KCd0YWdUZXJtQ2xpY2ssIHRhZ1RleHQ6ICcgKyB0YWdUZXh0KTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8vIFlvdSBjb3VsZCBkZWZpbmUgJ3RhZ1VzZXJDbGljaycgYW5kICd0YWdUZXJtQ2xpY2snXG4gICAgICAgIC8vIG9uIHRoZSAnJHJvb3RTY29wZScuIFRoaXMgd2F5IHlvdSBjYW4gaGFuZGxlIHdoYXRldmVyXG4gICAgICAgIC8vIGxvZ2ljIHlvdSB3YW50IGZvciBoYXNodGFncyBpbiBvbmUgcGxhY2UgcmF0aGVyIHRoYW5cbiAgICAgICAgLy8gaGF2aW5nIHRvIGRlZmluZSBpdCBpbiBlYWNoIGNvbnRyb2xsZXIuXG4gICAgICAgIFxuICAgICAgICAkc2NvcGUudHJ1c3RIdG1sID0gZnVuY3Rpb24oaHRtbCkge1xuICAgICAgICAgICAgLy8gU2FuaXRpemUgbWFudWFsbHkgaWYgbmVjZXNzYXJ5LiBJdCdzIGxpa2VseSB0aGlzXG4gICAgICAgICAgICAvLyBodG1sIGhhcyBhbHJlYWR5IGJlZW4gc2FuaXRpemVkIHNlcnZlciBzaWRlXG4gICAgICAgICAgICAvLyBiZWZvcmUgaXQgd2VudCBpbnRvIHlvdXIgZGF0YWJhc2UuXG4gICAgICAgICAgICAvLyBEb24ndCBob2xkIG1lIGxpYWJsZSBmb3IgWFNTLi4uIG5ldmVyIGFzc3VtZSA6filcbiAgICAgICAgICAgIHJldHVybiAkc2NlLnRydXN0QXNIdG1sKGh0bWwpO1xuICAgICAgICB9O1xuICAgIH1cbn0pKCk7XG5cblxuIiwiKGZ1bmN0aW9uICgpIHtcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwJykuZGlyZWN0aXZlKCdhdXRvZm9jdXMnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByZXN0cmljdDogJ0EnLFxuICAgICAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudFswXS5mb2N1cygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0pO1xufSkoKTtcblxuICAgICAiLCIoZnVuY3Rpb24gKCkge1xuICAgIC8vIEJlY2F1c2Ugb2YgdGhlIGFubWUgYW5kIEUgdHlwZSwgd29ya3MgYXV0b21hdGljYWxseSBmb3IgZXZlcnkgdGV4dGFyZWFcbiAgICAvLyByZWY6IGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL3Rob21zZWRkb24vNDcwMzk2OFxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAnKS5kaXJlY3RpdmUoJ2VsYXN0aWNBcmVhJywgZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmVzdHJpY3Q6ICdBJyxcbiAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cmlidXRlcykge1xuICAgICAgICAgICAgICAgIHZhciB0aHJlc2hvbGQgPSAzNSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbkhlaWdodCA9IGVsZW1lbnRbMF0ub2Zmc2V0SGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZ0xlZnQgPSBlbGVtZW50LmNzcygncGFkZGluZ0xlZnQnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmdSaWdodCA9IGVsZW1lbnQuY3NzKCdwYWRkaW5nUmlnaHQnKTtcblxuICAgICAgICAgICAgICAgIHZhciAkc2hhZG93ID0gYW5ndWxhci5lbGVtZW50KCc8ZGl2PjwvZGl2PicpLmNzcyh7XG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgICAgICAgICAgICAgICB0b3A6IC0xMDAwMCxcbiAgICAgICAgICAgICAgICAgICAgbGVmdDogLTEwMDAwLFxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogZWxlbWVudFswXS5vZmZzZXRXaWR0aCAtIHBhcnNlSW50KHBhZGRpbmdMZWZ0IHx8IDApIC0gcGFyc2VJbnQocGFkZGluZ1JpZ2h0IHx8IDApLFxuICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogZWxlbWVudC5jc3MoJ2ZvbnRTaXplJyksXG4gICAgICAgICAgICAgICAgICAgIGZvbnRGYW1pbHk6IGVsZW1lbnQuY3NzKCdmb250RmFtaWx5JyksXG4gICAgICAgICAgICAgICAgICAgIGxpbmVIZWlnaHQ6IGVsZW1lbnQuY3NzKCdsaW5lSGVpZ2h0JyksXG4gICAgICAgICAgICAgICAgICAgIHJlc2l6ZTogJ25vbmUnXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuYm9keSkuYXBwZW5kKCRzaGFkb3cpO1xuXG4gICAgICAgICAgICAgICAgdmFyIHVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRpbWVzID0gZnVuY3Rpb24gKHN0cmluZywgbnVtYmVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgciA9ICcnOyBpIDwgbnVtYmVyOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByICs9IHN0cmluZztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHZhbCA9IGVsZW1lbnQudmFsKCkucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8mL2csICcmYW1wOycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcbiQvLCAnPGJyLz4mbmJzcDsnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXG4vZywgJzxici8+JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxzezIsfS9nLCBmdW5jdGlvbiAoc3BhY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRpbWVzKCcmbmJzcDsnLCBzcGFjZS5sZW5ndGggLSAxKSArICcgJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAkc2hhZG93Lmh0bWwodmFsKTtcblxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmNzcygnaGVpZ2h0JywgTWF0aC5tYXgoJHNoYWRvd1swXS5vZmZzZXRIZWlnaHQgKyB0aHJlc2hvbGQsIG1pbkhlaWdodCkpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICRzaGFkb3cucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBlbGVtZW50LmJpbmQoJ2tleXVwIGtleWRvd24ga2V5cHJlc3MgY2hhbmdlJywgdXBkYXRlKTtcbiAgICAgICAgICAgICAgICB1cGRhdGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xufSkoKTsiLCIoZnVuY3Rpb24gKCkgeyBcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwJykuZGlyZWN0aXZlKCdoYXNodGFnaWZ5JywgWyckdGltZW91dCcsICckY29tcGlsZScsXG4gICAgICAgIGZ1bmN0aW9uKCR0aW1lb3V0LCAkY29tcGlsZSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICByZXN0cmljdDogJ0EnLFxuICAgICAgICAgICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICAgICAgICAgIHVDbGljazogJyZ1c2VyQ2xpY2snLFxuICAgICAgICAgICAgICAgICAgICB0Q2xpY2s6ICcmdGVybUNsaWNrJ1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGh0bWwgPSBlbGVtZW50Lmh0bWwoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGh0bWwgPT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXR0cnMudXNlckNsaWNrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaHRtbCA9IGh0bWwucmVwbGFjZSgvKHxcXHMpKkAoXFx3KykvZywgJyQxPGEgbmctY2xpY2s9XCJ1Q2xpY2soeyRldmVudDogJGV2ZW50fSlcIiBjbGFzcz1cImhhc2h0YWdcIj5AJDI8L2E+Jyk7IFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXR0cnMudGVybUNsaWNrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaHRtbCA9IGh0bWwucmVwbGFjZSgvKF58XFxzKSojKFxcdyspL2csICckMTxhIG5nLWNsaWNrPVwidENsaWNrKHskZXZlbnQ6ICRldmVudH0pXCIgY2xhc3M9XCJoYXNodGFnXCI+IyQyPC9hPicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50Lmh0bWwoaHRtbCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICRjb21waWxlKGVsZW1lbnQuY29udGVudHMoKSkoc2NvcGUpO1xuICAgICAgICAgICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgXSk7XG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmRpcmVjdGl2ZSgncGFnaW5hdGVDYXJkcycsIFsnY29uZmlnJyxcbiAgICAgICAgZnVuY3Rpb24gKGNvbmZpZykge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHJlc3RyaWN0OiAnRUEnLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBjb25maWcuU1JDX0ZPTERFUiArICcvY29tbW9uL3RlbXBsYXRlcy9wYWdpbmF0ZS1jYXJkcy5odG1sJyxcbiAgICAgICAgICAgICAgICB0cmFuc2NsdWRlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6ICc9J1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogWyckc2NvcGUnLCAnJHJvb3RTY29wZScsIGZ1bmN0aW9uICgkc2NvcGUsICRyb290U2NvcGUpIHtcbiAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogRHJhdyB3aWRnZXQgd2hlbiBkYXRhIGlzIGF2YWlsYWJsZVxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRvbignY2FyZHMtbG9hZGVkJywgZnVuY3Rpb24oZXZ0LCBkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUucGFnZXMgPSBkYXRhO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBCcm9hZGNhc3QgY2hhbmdlc1xuICAgICAgICAgICAgICAgICAgICAgKiBAcmV0dXJucyB2b2lkXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUubmF2aWdhdGUgPSBmdW5jdGlvbiAoJGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgJGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCB0YXJnZXQgPSAkZXZlbnQuY3VycmVudFRhcmdldDtcbiAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYodHlwZW9mKHRhcmdldC5hdHRyaWJ1dGVzWydkaXNhYmxlZCddKSA9PT0gJ3VuZGVmaW5lZCcgfHwgIXRhcmdldC5hdHRyaWJ1dGVzWydkaXNhYmxlZCddLnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdjYXJkcy1wYWdlLWNoYW5nZWQnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZ2U6IHRhcmdldC5hdHRyaWJ1dGVzWydkYXRhLXBhZ2UnXS52YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pOyAvLyBlbW1pdFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICBdKTtcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwJykuZGlyZWN0aXZlKCdzZXNzaW9uRHJvcGRvd24nLCBbJ2NvbmZpZycsXG4gICAgICAgIGZ1bmN0aW9uIChjb25maWcpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICByZXN0cmljdDogJ0VBJyxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogY29uZmlnLlNSQ19GT0xERVIgKyAnL2NvbW1vbi90ZW1wbGF0ZXMvc2Vzc2lvbi1kcm9wZG93bi5odG1sJywgICBcbiAgICAgICAgICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiBcIj1cIlxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogWyckc2NvcGUnLCBmdW5jdGlvbiAoJHNjb3BlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnVzZXIgPSAkc2NvcGUuZGF0YTtcblxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUudHJhbnNsYXRpb25zID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlX2luZm86ICdVcGRhdGUgaW5mbycsXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2dvdXQ6ICdMb2dvdXQnLFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICBdKTsgICAgICAgXG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwJykuZGlyZWN0aXZlKCdzaG93TW9yZScsXG4gICAgICAgIFsnY29uZmlnJywgZnVuY3Rpb24gKGNvbmZpZykge1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBjb25maWcuU1JDX0ZPTERFUiArICdjb21tb24vdGVtcGxhdGVzL3Nob3dNb3JlLmh0bWwnLFxuICAgICAgICAgICAgICAgIHJlc3RyaWN0OiAnQScsXG4gICAgICAgICAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgICAgICAgICAnc2hvd01vcmVIZWlnaHQnOiAnQCdcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJyRlbGVtZW50JywgJyRpbnRlcnZhbCcsIGZ1bmN0aW9uICgkc2NvcGUsICRlbGVtZW50LCAkaW50ZXJ2YWwpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmV4cGFuZGVkID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICRpbnRlcnZhbChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVuZGVyU3R5bGVzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCAzMDApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXhwYW5kYWJsZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gcmVuZGVyU3R5bGVzKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICgkZWxlbWVudC5oZWlnaHQoKSA+PSAkc2NvcGUuc2hvd01vcmVIZWlnaHQgJiYgJHNjb3BlLmV4cGFuZGVkID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXhwYW5kYWJsZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuc2hvd0xlc3NTdHlsZSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnbWF4LWhlaWdodCc6ICRzY29wZS5zaG93TW9yZUhlaWdodCArICdweCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ292ZXJmbG93JzogJ2hpZGRlbidcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1dKTtcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwJylcbiAgICAgICAgLmZpbHRlcigncmVkdWNlQnknLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoY29sbGVjdGlvbiwgZmllbGQpIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICByZXR1cm4gY29sbGVjdGlvbi5yZWR1Y2UoZnVuY3Rpb24ob3V0cHV0LCBjdXJyZW50KXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKCFmaWVsZEV4aXN0cyhvdXRwdXQsIGZpZWxkLCBjdXJyZW50W2ZpZWxkXSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG91dHB1dC5jb25jYXQoY3VycmVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gb3V0cHV0O1xuICAgICAgICAgICAgICAgICAgICB9LCBbXSk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGZpZWxkRXhpc3RzKGhheXN0YWNrLCBmaWVsZE5hbWUsIGZpZWxkVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGhheXN0YWNrLnNvbWUoZnVuY3Rpb24oZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZWxbZmllbGROYW1lXSA9PT0gZmllbGRWYWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgfSk7IFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07ICAgICAgICAgICAgXG4gICAgICAgIH0pO1xufSkoKTtcblxuIiwiKGZ1bmN0aW9uICgpIHtcblxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuaG9tZScpLmNvbnRyb2xsZXIoJ0hvbWVDb250cm9sbGVyJywgWyckc2NvcGUnLCBIb21lQ29udHJvbGxlcl0pO1xuXG4gICAgZnVuY3Rpb24gSG9tZUNvbnRyb2xsZXIoJHNjb3BlKSB7XG5cbiAgICAgICAgJHNjb3BlLnRyYW5zbGF0aW9ucyA9IHtcbiAgICAgICAgICAgIGhvbWU6IHt9XG4gICAgICAgIH07ICAgICAgICAgICAgXG4gICAgfVxufSkoKTtcblxuXG4iLCIoZnVuY3Rpb24oKXtcbiAgICBcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmhvbWUnKS5jb250cm9sbGVyKCdMaXN0Q29udHJvbGxlcicsIFsnJHNjb3BlJywgJyRyb290U2NvcGUnLCAnJGNvb2tpZXMnLCAnY2FyZHNGYWN0b3J5JywgJ0hvbWVDb250ZXh0U2VydmljZScsIExpc3RDb250cm9sbGVyXSk7XG4gICAgXG4gICAgZnVuY3Rpb24gTGlzdENvbnRyb2xsZXIoJHNjb3BlLCAkcm9vdFNjb3BlLCAkY29va2llcywgY2FyZHNGYWN0b3J5LCBIb21lQ29udGV4dFNlcnZpY2Upe1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAkc2NvcGUudHJhbnNsYXRpb25zLm5vX3Jlc3VsdHMgPSBcIk5vIHJlc3VsdHNcIjsgICAgICAgIFxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdheSB0byBrZWVwIHNpYmxpbmdzIGNvbm5lY3RlZCBhbmQgc2hhcmluZyBzY29wZVxuICAgICAgICAgKi9cbiAgICAgICAgJHNjb3BlLmNvbnRleHQgPSBIb21lQ29udGV4dFNlcnZpY2UuY29udGV4dDtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHZXQgY2FyZHMgbGlzdFxuICAgICAgICAgKi9cbiAgICAgICAgJHNjb3BlLmxvYWQgPSBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gZ2V0IGRhdGEgZnJvbSBzZXJ2ZXJcbiAgICAgICAgICAgIGNhcmRzRmFjdG9yeVxuICAgICAgICAgICAgICAgIC5xdWVyeShwYXJhbXMsIGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBhbGwgbmVhdFxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuY29udGV4dC5jYXJkcyA9IHJlc3BvbnNlLmRhdGE7IC8vIGNhcmRzIGxpc3RcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmNvbnRleHQucGFnZXMgPSByZXNwb25zZTsgLy8gcGFnZXMgZGF0YVxuICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdjYXJkcy1sb2FkZWQnLCByZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgICAgICAgfSk7ICBcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgICRzY29wZS5sb2FkKCk7IC8vIHJ1biBhdCBwYWdlIGxvYWRcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBIYW5kbGUgbGlzdCBvcmRlclxuICAgICAgICAgKi9cbiAgICAgICAgJHNjb3BlLiRvbignb3JkZXItY2hhbmdlZCcsIGZ1bmN0aW9uKGV2dCwgZGF0YSkge1xuICAgICAgICAgICAgJGNvb2tpZXMucHV0T2JqZWN0KCdvcmRlcicsIGFuZ3VsYXIuZnJvbUpzb24oZGF0YSkpO1xuICAgICAgICAgICAgJHNjb3BlLmxvYWQoKTsgLy8gcmVsb2FkIGNhcmRzXG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEhhbmRsZSBwYWdpbmF0aW9uXG4gICAgICAgICAqL1xuICAgICAgICAkc2NvcGUuJG9uKCdjYXJkcy1wYWdlLWNoYW5nZWQnLCBmdW5jdGlvbihldnQsIHBhcmFtcykge1xuICAgICAgICAgICAgJHNjb3BlLmxvYWQocGFyYW1zKTsgLy8gcmVsb2FkIGNhcmRzXG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENyZWF0ZSBjYXJkXG4gICAgICAgICAqL1xuICAgICAgICAkc2NvcGUuJG9uKCduZXctY2FyZCcsIGZ1bmN0aW9uKGV2dCwgaXRlbSkge1xuICAgICAgICAgICAgJHNjb3BlLmNvbnRleHQuY2FyZHMudW5zaGlmdChpdGVtKTtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogUGluIGNhcmRcbiAgICAgICAgICovXG4gICAgICAgICRzY29wZS4kb24oJ3Bpbi1jYXJkJywgZnVuY3Rpb24oZXZ0LCBpdGVtKSB7XG4gICAgICAgICAgIFxuICAgICAgICAgICAgaWYoaXRlbS5zdGlja3kpIHtcbiAgICAgICAgICAgICAgICAvLyBub3Qgc3RpY2t5IGFueW1vcmVcbiAgICAgICAgICAgICAgICBpdGVtLnN0aWNreSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGl0ZW0uY2xhc3MgPSBpdGVtLmNsYXNzID8gaXRlbS5jbGFzcy5yZXBsYWNlKFwic3RpY2t5XCIsIFwiXCIpIDogXCJcIjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gc3RpY2t5LiBQdXQgaXQgZmlyc3RcbiAgICAgICAgICAgICAgICBpdGVtLnN0aWNreSA9IHRydWU7XG4gICAgICAgICAgICAgICAgaXRlbS5jbGFzcyA9IGl0ZW0uY2xhc3MgPyBpdGVtLmNsYXNzICsgXCIgc3RpY2t5XCIgOiBcInN0aWNreVwiOyAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBsZXQgaW5kZXggPSAkc2NvcGUuY29udGV4dC5jYXJkcy5pbmRleE9mKGl0ZW0pO1xuICAgICAgICAgICAgICAgICRzY29wZS5jb250ZXh0LmNhcmRzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmNvbnRleHQuY2FyZHMudW5zaGlmdChpdGVtKTtcbiAgICAgICAgICAgIH0gXG4gICAgICAgIH0pO1xuICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogRGVsZXRlIGNhcmRcbiAgICAgICAgICovXG4gICAgICAgICRzY29wZS4kb24oJ2RlbGV0ZS1jYXJkJywgZnVuY3Rpb24oZXZ0LCBpdGVtKSB7XG4gICAgICAgICAgICBsZXQgaW5kZXggPSAkc2NvcGUuY29udGV4dC5jYXJkcy5pbmRleE9mKGl0ZW0pO1xuICAgICAgICAgICAgJHNjb3BlLmNvbnRleHQuY2FyZHMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogVXBkYXRlIGNhcmRcbiAgICAgICAgICovXG4gICAgICAgICRzY29wZS4kb24oJ3VwZGF0ZS1jYXJkJywgZnVuY3Rpb24oZXZ0LCBvcmlnaW5hbCwgbmV3Q2FyZCkge1xuICAgICAgICAgICAgbGV0IGluZGV4ID0gJHNjb3BlLmNvbnRleHQuY2FyZHMuaW5kZXhPZihvcmlnaW5hbCk7XG4gICAgICAgICAgICBhbmd1bGFyLmV4dGVuZCgkc2NvcGUuY29udGV4dC5jYXJkc1tpbmRleF0sIG5ld0NhcmQpO1xuICAgICAgICB9KTtcbiAgICB9XG59KSgpOyIsIihmdW5jdGlvbigpe1xuICAgIFxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuaG9tZScpLmNvbnRyb2xsZXIoJ1NlYXJjaENvbnRyb2xsZXInLCBbJyRzY29wZScsICdIb21lQ29udGV4dFNlcnZpY2UnLCBTZWFyY2hDb250cm9sbGVyXSk7XG4gICAgXG4gICAgZnVuY3Rpb24gU2VhcmNoQ29udHJvbGxlcigkc2NvcGUsIEhvbWVDb250ZXh0U2VydmljZSl7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICRzY29wZS50cmFuc2xhdGlvbnMucXVpY2tfc2VhcmNoID0gXCJRdWljayBTZWFyY2guLi5cIjsgICAgXG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogV2F5IHRvIGtlZXAgc2libGluZ3MgY29ubmVjdGVkIGFuZCBzaGFyaW5nIHNjb3BlXG4gICAgICAgICAqL1xuICAgICAgICAkc2NvcGUuY29udGV4dCA9IEhvbWVDb250ZXh0U2VydmljZS5jb250ZXh0O1xuICAgIH1cbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmhvbWUnKS5kaXJlY3RpdmUoJ29yZGVyQnknLCBbJ2NvbmZpZycsXG4gICAgICAgIGZ1bmN0aW9uIChjb25maWcpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICByZXN0cmljdDogJ0VBJyxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogY29uZmlnLlNSQ19GT0xERVIgKyAnL2hvbWUvdGVtcGxhdGVzL29yZGVyLWJ5Lmh0bWwnLFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJyRyb290U2NvcGUnLCBmdW5jdGlvbiAoJHNjb3BlLCAkcm9vdFNjb3BlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaW5pdGlhbCBwb3NpdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLm9yZGVyID0gJ3VwZGF0ZWRfYXQnO1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRpcmVjdGlvbiA9ICdkZXNjJztcbiAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUudXBkYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGRhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yZGVyOiAkc2NvcGUub3JkZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogJHNjb3BlLmRpcmVjdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ29yZGVyLWNoYW5nZWQnLCBkYXRhKTsgLy8gZW1taXRcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIF0pO1xufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuaG9tZScpLmRpcmVjdGl2ZSgndGFnQ2xvdWQnLCBbJ2NvbmZpZycsIFxuICAgICAgICBmdW5jdGlvbiAoY29uZmlnKSB7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcmVzdHJpY3Q6ICdFQScsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IGNvbmZpZy5TUkNfRk9MREVSICsgJy9ob21lL3RlbXBsYXRlcy90YWctY2xvdWQuaHRtbCcsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogWyckc2NvcGUnLCAncmVkdWNlQnlGaWx0ZXInLCBmdW5jdGlvbiAoJHNjb3BlLCByZWR1Y2VCeUZpbHRlcikge1xuXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS50cmFuc2xhdGlvbnMuaG9tZS50YWdDbG91ZCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBcIkluIHRoaXMgcGFnZVwiXG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIEtlZXAgdHJhY2sgb2YgY2FyZCBsaXN0IGNoYW5nZXNcbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS4kb24oJ2NhcmRzLWxvYWRlZCcsIGZ1bmN0aW9uIChldnQsIGNvbGxlY3Rpb24pIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZXhjbHVkZSBjYXJkIHdpdGggbm8gdGFnc1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNhcmRzID0gY29sbGVjdGlvbi5kYXRhLmZpbHRlcihmdW5jdGlvbiAoY2FyZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjYXJkLnRhZ3MgPyBjYXJkLnRhZ3MubGVuZ3RoID4gMCA6IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBleHRyYWN0IHRhZ3MgZnJvbSBjYXJkXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdGFncyA9IGNhcmRzLm1hcChmdW5jdGlvbiAoY2FyZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKGFuZ3VsYXIudG9Kc29uKGNhcmQudGFncykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIG1lcmdlIHRhZ3MgaW4gZmxhdHRlbiBhcnJheVxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG1lcmdlZCA9IFtdLmNvbmNhdC5hcHBseShbXSwgdGFncyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBlbGltaW5hdGUgZHVwbGljYXRlcyBhbmQgc2VydmUgYXJyYXkgdG8gdmlld1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnRhZ3MgPSByZWR1Y2VCeUZpbHRlcihtZXJnZWQsICdpZCcpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIF0pO1xufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuaG9tZScpXG4gICAgICAgIC5maWx0ZXIoJ2hpZ2hsaWdodFRleHQnLCBmdW5jdGlvbigkc2NlKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHRleHQsIHBocmFzZSkge1xuICAgICAgICAgICAgICAgIGxldCBoaWdobGlnaHRlZCA9IHBocmFzZVxuICAgICAgICAgICAgICAgICAgICAgICAgPyB0ZXh0LnJlcGxhY2UobmV3IFJlZ0V4cCgnKCcgKyBwaHJhc2UgKyAnKScsICdnaScpLCAnPHNwYW4gY2xhc3M9XCJoaWdobGlnaHQtdGV4dFwiPiQxPC9zcGFuPicpXG4gICAgICAgICAgICAgICAgICAgICAgICA6IHRleHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICByZXR1cm4gJHNjZS50cnVzdEFzSHRtbChoaWdobGlnaHRlZCk7XG4gICAgICAgICAgICB9OyAgICAgICAgICAgIFxuICAgICAgICB9KTtcbn0pKCk7XG5cbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAuaG9tZScpLnNlcnZpY2UoJ0hvbWVDb250ZXh0U2VydmljZScsIGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5jb250ZXh0ID0ge1xuICAgICAgICBjYXJkczogW10sXG4gICAgICAgIHF1ZXJ5OiAnJ1xuICAgIH07XG59KTsiLCIoZnVuY3Rpb24oKXtcbiAgICBcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLnN0YWNrcycpLmRpcmVjdGl2ZSgnc3RhY2tMaXN0UGFuZWwnLCBbJ2NvbmZpZycsIGZ1bmN0aW9uKGNvbmZpZyl7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogY29uZmlnLlNSQ19GT0xERVIgKyAnc3RhY2tzL3RlbXBsYXRlcy9zdGFjay1saXN0LXBhbmVsLmh0bWwnLFxuICAgICAgICAgICAgICAgIHRyYW5zY2x1ZGU6IHRydWUsICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBbJyRzY29wZScsICckcm9vdFNjb3BlJywgJ3N0YWNrc0ZhY3RvcnknLCAnTW9kYWxTZXJ2aWNlJywgXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKCRzY29wZSwgJHJvb3RTY29wZSwgc3RhY2tzRmFjdG9yeSwgTW9kYWxTZXJ2aWNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS50cmFuc2xhdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaG9tZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFja0xpc3Q6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBcIlN0YWNrc1wiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIEdldCBzdGFjayBsaXN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5zdGFja3MgPSBzdGFja3NGYWN0b3J5LnF1ZXJ5KCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICogQ3JlYXRlIG5ldyBzdGFja1xuICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuYWRkTmV3ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTW9kYWxTZXJ2aWNlLnNob3dNb2RhbCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBjb25maWcuU1JDX0ZPTERFUiArIFwic3RhY2tzL3RlbXBsYXRlcy9tb2RhbHMvbmV3LXN0YWNrLmh0bWxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogXCJOZXdTdGFja0NvbnRyb2xsZXJcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLnRoZW4oZnVuY3Rpb24obW9kYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWwuZWxlbWVudC5tb2RhbCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RhbC5jbG9zZS50aGVuKGZ1bmN0aW9uIChyZXN1bHQpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdCkgeyAgICBcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHByZXBhcmUgZGF0YSB0byBzdWJtaXQgdG8gc2VydmVyIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzdGFjayA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogbW9kYWwuc2NvcGUuZm9ybS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogbW9kYWwuc2NvcGUuZm9ybS5kZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YWNrc0ZhY3Rvcnkuc2F2ZShzdGFjaykuJHByb21pc2UudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZW1taXQgZXZlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhY2suaWQgPSByZXNwb25zZS5pZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCduZXctc3RhY2snLCBzdGFjayk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhZGQgdG8gc3RhY2tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnN0YWNrcy51bnNoaWZ0KHN0YWNrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgfTtcbiAgICB9XSk7XG59KSgpOyIsIihmdW5jdGlvbigpe1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuc3RhY2tzJykuZmFjdG9yeSgnc3RhY2tzRmFjdG9yeScsIFsnJHJlc291cmNlJywgJ2NvbmZpZycsIGZ1bmN0aW9uICgkcmVzb3VyY2UsIGNvbmZpZykge1xuICAgICAgICByZXR1cm4gJHJlc291cmNlKGNvbmZpZy5hcGkgKyAnL3N0YWNrcy86aWQnLCB7IGlkOiAnQF9pZCcgfSwge1xuICAgICAgICAgICAgdXBkYXRlOiB7XG4gICAgICAgICAgICAgIG1ldGhvZDogJ1BVVCcgXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pOyBcbiAgICB9XSk7XG59KSgpO1xuXG4iLCIoZnVuY3Rpb24oKSB7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmNhcmRzJykuY29udHJvbGxlcignRWRpdENhcmRDb250cm9sbGVyJywgWyckc2NvcGUnLCAnZGF0YScsICdjbG9zZScsIEVkaXRDYXJkQ29udHJvbGxlcl0pO1xuICAgIFxuICAgIGZ1bmN0aW9uIEVkaXRDYXJkQ29udHJvbGxlcigkc2NvcGUsIGRhdGEsIGNsb3NlKSB7XG5cbiAgICAgICAgJHNjb3BlLmZvcm0gPSB7fTtcbiAgICAgICAgJHNjb3BlLmZvcm0ubmFtZSA9IGRhdGEuY2FyZC5uYW1lO1xuICAgICAgICAkc2NvcGUuZm9ybS5jb250ZW50ID0gZGF0YS5jYXJkLmNvbnRlbnQ7XG5cbiAgICAgICAgJHNjb3BlLmNsb3NlID0gZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICBcbiAgICAgICAgICAgIGNsb3NlKHJlc3VsdCwgMjAwKTsgLy8gY2xvc2UsIGJ1dCBnaXZlIDIwMG1zIGZvciBib290c3RyYXAgdG8gYW5pbWF0ZVxuICAgICAgICB9O1xuICAgIH07XG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmhvbWUnKS5jb250cm9sbGVyKCdZZXNOb0NvbnRyb2xsZXInLCBbJyRzY29wZScsICdkYXRhJywgJ2Nsb3NlJywgZnVuY3Rpb24gKCRzY29wZSwgZGF0YSwgY2xvc2UpIHtcbiAgICAgICAgICAgXG4gICAgICAgICAgICAkc2NvcGUudGl0bGUgPSBkYXRhLnRpdGxlO1xuICAgICAgICAgICAgJHNjb3BlLmNvbnRlbnQgPSBkYXRhLmNvbnRlbnQ7XG4gICAgICAgICAgIFxuICAgICAgICAgICAgJHNjb3BlLmNsb3NlID0gZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgIGNsb3NlKHJlc3VsdCwgMjAwKTsgLy8gY2xvc2UsIGJ1dCBnaXZlIDIwMG1zIGZvciBib290c3RyYXAgdG8gYW5pbWF0ZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfV0pO1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmhvbWUnKS5jb250cm9sbGVyKCdNYXJrZG93bkNvbnRyb2xsZXInLCBbJyRzY29wZScsICdkYXRhJywgJ2Nsb3NlJywgTWFya2Rvd25Db250cm9sbGVyXSk7XG4gICAgXG4gICAgZnVuY3Rpb24gTWFya2Rvd25Db250cm9sbGVyKCRzY29wZSwgZGF0YSwgY2xvc2UpIHtcblxuICAgICAgICAkc2NvcGUudGl0bGUgPSBkYXRhLmNhcmQubmFtZTtcbiAgICAgICAgJHNjb3BlLmNvbnRlbnQgPSBkYXRhLmNhcmQuY29udGVudDtcblxuICAgICAgICAkc2NvcGUuZGlzbWlzc01vZGFsID0gZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgY2xvc2UocmVzdWx0LCAyMDApOyAvLyBjbG9zZSwgYnV0IGdpdmUgMjAwbXMgZm9yIGJvb3RzdHJhcCB0byBhbmltYXRlXG4gICAgICAgIH07XG4gICAgfTtcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuICAgIFxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuc3RhY2tzJykuY29udHJvbGxlcignTmV3U3RhY2tDb250cm9sbGVyJywgWyckc2NvcGUnLCAnY2xvc2UnLCBOZXdTdGFja0NvbnRyb2xsZXJdKTtcbiAgICBcbiAgICBmdW5jdGlvbiBOZXdTdGFja0NvbnRyb2xsZXIoJHNjb3BlLCBjbG9zZSkge1xuICAgICAgIFxuICAgICAgICAkc2NvcGUuZm9ybSA9IHtcbiAgICAgICAgICAgIG5hbWU6ICcnLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICcnLFxuICAgICAgICAgICAgcGxhY2Vob2xkZXI6IHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnU3RhY2sgdGl0bGUuLi4nLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnT3B0aW9uYWwgZGVzY3JpcHRpb24uLi4nLFxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgXG4gICAgICAgICRzY29wZS5jbG9zZSA9IGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgXG4gICAgICAgICAgICBjbG9zZShyZXN1bHQsIDIwMCk7IC8vIGNsb3NlLCBidXQgZ2l2ZSAyMDBtcyBmb3IgYm9vdHN0cmFwIHRvIGFuaW1hdGVcbiAgICAgICAgfTtcbiAgICB9O1xufSkoKTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
