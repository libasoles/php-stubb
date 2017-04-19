angular.module("app.config", [])
.constant("config", {
	"api": "http://localhost:8001/api/v1", 
	"debug": true,
        'IMG_FOLDER': 'src/app_modules/common/templates/',
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

angular.module('app.home', ['ngRoute', 'app.config', 'ngAnimate', 'app.cards', 'hc.marked', 'ngSanitize']);

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
(function(){
        
    /**
     * FYI, cards must have this basic structure
     * {
     *      "id": 1,
            "name": "Aut modi quasi corrupti veritatis sunt dolore.",
            content:"Lorem Ipsum dolor est #important. #mytag",
            tags: [
                "mytag", "important"
            ]
        }
    */
    angular.module('app.cards').controller('CardsController', ['$scope', 'cardsFactory', CardsController]);

    function CardsController($scope, cardsFactory){
        
        cardsFactory.getCards().then(function(response){       
            $scope.cards = response.data;
        });    

        createCard = function() {
            $scope.cards.push({
                content: "Renombrar proyecto a cards. #corechange",
                tags: [
                    "corechange", "important"
                ]
            });
        };
    }
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
                controller: ["$scope", "$rootScope", "cardsFactory", function ($scope, $rootScope, cardsFactory) {

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

                            cardsFactory.save(data).then(function (response) {
                                data.class = 'highlighted';
                                data.id = response.data.id;
                                $rootScope.$broadcast('new-card', data);
                            }, function (response) {
                                console.log(response);
                            })

                            $scope.content = '';
                        }
                    };
                }]
            }
        }]);
})();
(function () {

    angular.module('app.cards').factory('cardsFactory', ['$http', '$q', 'config', cardsFactory]);

    function cardsFactory($http, $q, config) {

        var factory = {};
        var endpoint = "/cards";
        var cards;
                
        factory.getAll = function () {

            var defered = $q.defer();
            var promise = defered.promise;

            cards = $http.get(config.api + endpoint, { cache: true}); // get list

            cards.then(function (response) {
                defered.resolve(response);
            }, function (err) {
                defered.reject(err);
            });

            return promise;
        };

        factory.save = function (data) {

            var defered = $q.defer();
            var promise = defered.promise;

            $http.post(config.api + endpoint, data).then(function (response) {
                defered.resolve(response);
            }, function (err) {
                defered.reject(err);
            });
 
            return promise;
        }
        
        factory.update = function (data) {

            var defered = $q.defer();
            var promise = defered.promise;

            $http.put(config.api + endpoint + '/' + data.id, data).then(function (response) {
                defered.resolve(response);
            }, function (err) {
                defered.reject(err);
            });
 
            return promise;
        }

        factory.delete = function (id) {
            
            var defered = $q.defer();
            var promise = defered.promise;

            $http.delete(config.api + endpoint + '/' + id).then(function (response) {
                defered.resolve(response);
            }, function (err) {
                defered.reject(err);
            });
 
            return promise;
        }

        return factory;
    }

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
    // Because of the anme and E type, works automatically for every textarea
    // ref: https://gist.github.com/thomseddon/4703968
    angular.module('app').directive('elasticarea', function () {
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

    angular.module('app').directive('showMore',
        ['config', function (config) {

            return {
                templateUrl: config.IMG_FOLDER + 'showMore.html',
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
    
    angular.module('app.home').controller('ListController', ['$scope', 'config', 'cardsFactory', 'ModalService', 'HomeContextService', ListController]);
    
    function ListController($scope, config, cardsFactory, ModalService, HomeContextService){
                
        $scope.translations.no_results = "No results";        
        
        /**
         * Way to keep siblings connected and sharing scope
         */
        $scope.context = HomeContextService.context;
        
        /**
         * Get cards list
         */
        cardsFactory
            .getAll()
            .then(function (response) {

                $scope.context.cards = angular.fromJson(response.data);

                $scope.orderCardsBy = 'updated_at';

                $scope.direction = 'reverse';
            })
            .catch(function (err) {
                console.log(err); // TODO: Tratar el error
            });  
                
        /**
         * Create card
         */
        $scope.$on('new-card', function(evt, data) {
            $scope.context.cards.push(data);
        });
        
        $scope.pinCard = function(item) {
            
            let index = $scope.context.cards.indexOf(item);
            
            let card = {
                id: item.id,
                sticky: !item.sticky
            }

            cardsFactory.update(card).then(function() {

                if(item.sticky) {
                    // not sticky anymore
                    item.sticky = false;
                    item.class = item.class ? item.class.replace("sticky", "") : "";
                } else {
                    // sticky. Put it first
                    item.sticky = true;
                    item.class = item.class ? item.class + " sticky" : "sticky";
                    $scope.context.cards.splice(index, 1);
                    $scope.context.cards.unshift(item);
                } 
            }, function(err) {
                console.log(err);
            });
        };  
            
        $scope.delete = function(item) {
                        
            // Just provide a template url, a controller and call 'showModal'.
            ModalService.showModal({
                templateUrl: config.SRC_FOLDER + "home/modals/confirm.html",
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
                       
                    if(result) {
                        cardsFactory.delete(item.id).then(function(){
                            let index = $scope.context.cards.indexOf(item);
                            $scope.context.cards.splice(index, 1);
                        }, function(err) {
                            console.log(err);
                        });
                    } 
                });
            });
        };
        
        $scope.edit = function(item){
            
            ModalService.showModal({
                templateUrl: config.SRC_FOLDER + "home/modals/edit.html",
                controller: "EditController",
                inputs: {
                    data: {
                        card: item
                    }
                }
            }).then(function (modal) {
                modal.element.modal();
                modal.close.then(function (result){
                    if(result) {
                        
                        let card = {
                            id: item.id,
                            name: modal.scope.form.name,
                            content: modal.scope.form.content,
                        }
                      
                        cardsFactory.update(card).then(function() {
                            
                            let index = $scope.context.cards.indexOf(item);
                            angular.copy(card, $scope.context.cards[index]);
                        }, function(err) {
                            console.log(err);
                        });
                    }
                });
            });
        };
        
        $scope.viewAsMarkdownModal = function (item) {

            // Just provide a template url, a controller and call 'showModal'.
            ModalService.showModal({
                templateUrl: config.SRC_FOLDER + "home/modals/markdown.html",
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

    angular.module('app.home').controller('StackController', ['$scope', 'HomeContextService', StackController]);

    function StackController($scope, HomeContextService) {

        $scope.translations.home.stackList = {
            title: "Stacks"
        };

        /**
         * Way to keep siblings connected and sharing scope
         */
        $scope.context = HomeContextService.context;

        $scope.context.stacks = [{
            id: 1,
            name: 'Universal'
        }, {
            id: 2,
            name: 'Second stack',
            participants: {
                count: 1,
                list: {
                    'John Doe': {
                        img: 'profile-picture-60x60.png'
                    }
                }
            }
        }, {
            id: 3,
            name: 'And so on',
            participants: {
                count: 15,
                list: {
                    'John Doe': {
                        img: 'profile-picture-60x60.png'
                    },
                    'Charles Davidson': {
                        img: 'profile-picture-60x60.png'
                    },
                    'Alex Steward': {
                        img: 'profile-picture-60x60.png'
                    }
                }
            }
        }];
    }
})();
(function () {

    angular.module('app.home').controller('TagController', ['$scope', 'reduceByFilter', 'HomeContextService', TagCloudController]);

    function TagCloudController($scope, reduceByFilter, HomeContextService) {

         $scope.translations.home.tagCloud = {
            title: "In this page"
        };

        /**
         * Way to keep siblings connected and sharing scope
         */
        $scope.context = HomeContextService.context;

        /**
         * Keep track of card list changes
         * @returns void
         */
        function updateTagCloud() {
            
            // exclude card with no tags
            let cards = $scope.context.filtered.filter(function (card) {
                return card.tags ? card.tags.length > 0 : false;
            });

            // extract tags from card
            let tags = cards.map(function (card) {
                return JSON.parse(angular.toJson(card.tags));
            });

            // merge tags in flatten array
            let merged = [].concat.apply([], tags);

            // eliminate duplicates and serve array to view
            $scope.context.tags = reduceByFilter(merged, 'id');
        }
       
        $scope.$watchCollection('context.filtered', updateTagCloud );
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
(function() {

    angular.module('app.home').controller('EditController', ['$scope', 'data', 'close', EditController]);
    
    function EditController($scope, data, close) {

        $scope.form = {};
        $scope.form.name = data.card.name;
        $scope.form.content = data.card.content;

        $scope.close = function (result) {
           
            close(result, 200); // close, but give 200ms for bootstrap to animate
        };
    };
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
(function () {

    angular.module('app.home').controller('YesNoController', ['$scope', 'data', 'close', function ($scope, data, close) {
           
            $scope.title = data.title;
            $scope.content = data.content;
           
            $scope.close = function (result) {
                close(result, 200); // close, but give 200ms for bootstrap to animate
            };
        }]);
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC1jb25maWcuanMiLCJjYXJkcy9tb2R1bGUuanMiLCJjb21tb24vbW9kdWxlLmpzIiwiaG9tZS9tb2R1bGUuanMiLCJjYXJkcy9jYXJkcy1yb3V0ZS5qcyIsImNvbW1vbi9hcHAtcm91dGUuanMiLCJob21lL2hvbWUtcm91dGUuanMiLCJsb2dpbi9sb2dpbi5qcyIsImNhcmRzL2NvbnRyb2xsZXJzL2NhcmRzLWNvbnRyb2xsZXIuanMiLCJjYXJkcy9kaXJlY3RpdmVzL25ldy1jYXJkLmpzIiwiY2FyZHMvc2VydmljZXMvY2FyZHMtZmFjdG9yeS5qcyIsImNvbW1vbi9jb250cm9sbGVycy9oZWFkZXItY29udHJvbGxlcnMuanMiLCJjb21tb24vY29udHJvbGxlcnMvbGF5b3V0LWNvbnRyb2xsZXJzLmpzIiwiY29tbW9uL2RpcmVjdGl2ZXMvZWxhc3RpY0FyZWEuanMiLCJjb21tb24vZGlyZWN0aXZlcy9oYXNodGFnaWZ5LmpzIiwiY29tbW9uL2RpcmVjdGl2ZXMvc2hvd01vcmUuanMiLCJjb21tb24vZmlsdGVycy9yZWR1Y2VCeS5qcyIsImhvbWUvY29udHJvbGxlcnMvaG9tZS1jb250cm9sbGVyLmpzIiwiaG9tZS9jb250cm9sbGVycy9saXN0LWNvbnRyb2xsZXIuanMiLCJob21lL2NvbnRyb2xsZXJzL3NlYXJjaC1jb250cm9sbGVyLmpzIiwiaG9tZS9jb250cm9sbGVycy9zdGFjay1jb250cm9sbGVyLmpzIiwiaG9tZS9jb250cm9sbGVycy90YWctY2xvdWQtY29udHJvbGxlci5qcyIsImhvbWUvZmlsdGVycy9oaWdobGlnaHRUZXh0LmpzIiwiaG9tZS9zZXJ2aWNlcy9ob21lLWNvbnRleHQuanMiLCJob21lL2NvbnRyb2xsZXJzL21vZGFscy9lZGl0LWNvbnRyb2xsZXIuanMiLCJob21lL2NvbnRyb2xsZXJzL21vZGFscy9tYXJrZG93bi1jb250cm9sbGVyLmpzIiwiaG9tZS9jb250cm9sbGVycy9tb2RhbHMveWVzLW5vLWNvbnRyb2xsZXIuanMi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VUFBQTtnQkFDQSxRQUFBLFFBQUE7ZUFDQSxVQUFBLEtBQUE7Z0JBQ0EsUUFBQSxPQUFBOzs7WUFHQSxPQUFBOzs7UUFHQSxRQUFBLE9BQUEsVUFBQSxNQUFBOztZQUVBLElBQUEsVUFBQSxHQUFBO1lBQ0EsSUFBQSxVQUFBLFFBQUE7O1lBRUEsTUFBQSxLQUFBLE9BQUEsTUFBQSxVQUFBLE1BQUEsS0FBQSxVQUFBLFVBQUE7Z0JBQ0EsUUFBQSxRQUFBO2VBQ0EsVUFBQSxLQUFBO2dCQUNBLFFBQUEsT0FBQTs7O1lBR0EsT0FBQTs7O1FBR0EsUUFBQSxTQUFBLFVBQUEsTUFBQTs7WUFFQSxJQUFBLFVBQUEsR0FBQTtZQUNBLElBQUEsVUFBQSxRQUFBOztZQUVBLE1BQUEsSUFBQSxPQUFBLE1BQUEsV0FBQSxNQUFBLEtBQUEsSUFBQSxNQUFBLEtBQUEsVUFBQSxVQUFBO2dCQUNBLFFBQUEsUUFBQTtlQUNBLFVBQUEsS0FBQTtnQkFDQSxRQUFBLE9BQUE7OztZQUdBLE9BQUE7OztRQUdBLFFBQUEsU0FBQSxVQUFBLElBQUE7O1lBRUEsSUFBQSxVQUFBLEdBQUE7WUFDQSxJQUFBLFVBQUEsUUFBQTs7WUFFQSxNQUFBLE9BQUEsT0FBQSxNQUFBLFdBQUEsTUFBQSxJQUFBLEtBQUEsVUFBQSxVQUFBO2dCQUNBLFFBQUEsUUFBQTtlQUNBLFVBQUEsS0FBQTtnQkFDQSxRQUFBLE9BQUE7OztZQUdBLE9BQUE7OztRQUdBLE9BQUE7Ozs7OztBQ3BFQSxDQUFBLFlBQUE7O0lBRUEsUUFBQSxPQUFBLE9BQUEsV0FBQSxvQkFBQSxDQUFBLFVBQUE7O0lBRUEsU0FBQSxpQkFBQSxRQUFBOzs7Ozs7O0FDSkEsQ0FBQSxZQUFBOztJQUVBLFFBQUEsT0FBQSxPQUFBLFdBQUEsb0JBQUEsQ0FBQSxVQUFBLFFBQUE7O0lBRUEsU0FBQSxpQkFBQSxRQUFBLE1BQUE7O1FBRUEsT0FBQSxlQUFBO1lBQ0EsVUFBQTs7O1FBR0EsT0FBQSxlQUFBLFNBQUEsR0FBQTtZQUNBLElBQUEsVUFBQSxFQUFBLE9BQUE7WUFDQSxNQUFBLDRCQUFBOzs7UUFHQSxPQUFBLGVBQUEsU0FBQSxHQUFBO1lBQ0EsSUFBQSxVQUFBLEVBQUEsT0FBQTtZQUNBLE1BQUEsNEJBQUE7Ozs7Ozs7O1FBUUEsT0FBQSxZQUFBLFNBQUEsTUFBQTs7Ozs7WUFLQSxPQUFBLEtBQUEsWUFBQTs7Ozs7OztBQzlCQSxDQUFBLFlBQUE7OztJQUdBLFFBQUEsT0FBQSxPQUFBLFVBQUEsZUFBQSxZQUFBO1FBQ0EsT0FBQTtZQUNBLFVBQUE7WUFDQSxNQUFBLFVBQUEsT0FBQSxTQUFBLFlBQUE7Z0JBQ0EsSUFBQSxZQUFBO3dCQUNBLFlBQUEsUUFBQSxHQUFBO3dCQUNBLGNBQUEsUUFBQSxJQUFBO3dCQUNBLGVBQUEsUUFBQSxJQUFBOztnQkFFQSxJQUFBLFVBQUEsUUFBQSxRQUFBLGVBQUEsSUFBQTtvQkFDQSxVQUFBO29CQUNBLEtBQUEsQ0FBQTtvQkFDQSxNQUFBLENBQUE7b0JBQ0EsT0FBQSxRQUFBLEdBQUEsY0FBQSxTQUFBLGVBQUEsS0FBQSxTQUFBLGdCQUFBO29CQUNBLFVBQUEsUUFBQSxJQUFBO29CQUNBLFlBQUEsUUFBQSxJQUFBO29CQUNBLFlBQUEsUUFBQSxJQUFBO29CQUNBLFFBQUE7OztnQkFHQSxRQUFBLFFBQUEsU0FBQSxNQUFBLE9BQUE7O2dCQUVBLElBQUEsU0FBQSxZQUFBO29CQUNBLElBQUEsUUFBQSxVQUFBLFFBQUEsUUFBQTt3QkFDQSxLQUFBLElBQUEsSUFBQSxHQUFBLElBQUEsSUFBQSxJQUFBLFFBQUEsS0FBQTs0QkFDQSxLQUFBOzt3QkFFQSxPQUFBOzs7b0JBR0EsSUFBQSxNQUFBLFFBQUEsTUFBQSxRQUFBLE1BQUE7NkJBQ0EsUUFBQSxNQUFBOzZCQUNBLFFBQUEsTUFBQTs2QkFDQSxRQUFBLE9BQUE7NkJBQ0EsUUFBQSxPQUFBOzZCQUNBLFFBQUEsV0FBQSxVQUFBLE9BQUE7Z0NBQ0EsT0FBQSxNQUFBLFVBQUEsTUFBQSxTQUFBLEtBQUE7OztvQkFHQSxRQUFBLEtBQUE7O29CQUVBLFFBQUEsSUFBQSxVQUFBLEtBQUEsSUFBQSxRQUFB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U0FFQSxPQUFBLGFBQUEsS0FBQSxXQUFBO1lBQ0EsT0FBQTs7Ozs7O1FBTUEsT0FBQSxVQUFBLG1CQUFBOzs7Ozs7UUFNQSxTQUFBLGlCQUFBOzs7WUFHQSxJQUFBLFFBQUEsT0FBQSxRQUFBLFNBQUEsT0FBQSxVQUFBLE1BQUE7Z0JBQ0EsT0FBQSxLQUFBLE9BQUEsS0FBQSxLQUFBLFNBQUEsSUFBQTs7OztZQUlBLElBQUEsT0FBQSxNQUFBLElBQUEsVUFBQSxNQUFBO2dCQUNBLE9BQUEsS0FBQSxNQUFBLFFBQUEsT0FBQSxLQUFBOzs7O1lBSUEsSUFBQSxTQUFBLEdBQUEsT0FBQSxNQUFBLElBQUE7OztZQUdBLE9BQUEsUUFBQSxPQUFBLGVBQUEsUUFBQTs7O1FBR0EsT0FBQSxpQkFBQSxvQkFBQTs7O0FDdENBLENBQUEsWUFBQTtJQUNBLFFBQUEsT0FBQTtTQUNBLE9BQUEsMEJBQUEsU0FBQSxNQUFBO1lBQ0EsT0FBQSxVQUFBLE1BQUEsUUFBQTtnQkFDQSxJQUFBLGNBQUE7MEJBQ0EsS0FBQSxRQUFBLElBQUEsT0FBQSxNQUFBLFNBQUEsS0FBQSxPQUFBOzBCQUNBOztnQkFFQSxPQUFBLEtBQUEsWUFBQTs7Ozs7O0FDUkEsUUFBQSxPQUFBLFlBQUEsUUFBQSxzQkFBQSxVQUFBO0lBQ0EsS0FBQSxVQUFBO1FBQ0EsT0FBQTtRQUNBLE9BQUE7OztBQ0hBLENBQUEsV0FBQTs7SUFFQSxRQUFBLE9BQUEsWUFBQSxXQUFBLGtCQUFBLENBQUEsVUFBQSxRQUFBLFNBQUE7O0lBRUEsU0FBQSxlQUFBLFFBQUEsTUFBQSxPQUFBOztRQUVBLE9BQUEsT0FBQTtRQUNBLE9BQUEsS0FBQSxPQUFBLEtBQUEsS0FBQTtRQUNBLE9BQUEsS0FBQSxVQUFBLEtBQUEsS0FBQTs7UUFFQSxPQUFBLFFBQUEsVUFBQSxRQUFBOztZQUVBLE1BQUEsUUFBQTs7S0FFQTs7QUNkQSxDQUFBLFdBQUE7O0lBRUEsUUFBQSxPQUFBLFlBQUEsV0FBQSxzQkFBQSxDQUFBLFVBQUEsUUFBQSxTQUFBOztJQUVBLFNBQUEsbUJBQUEsUUFBQSxNQUFBLE9BQUE7O1FBRUEsT0FBQSxRQUFBLEtBQUEsS0FBQTtRQUNBLE9BQUEsVUFBQSxLQUFBLEtBQUE7O1FBRUEsT0FBQSxlQUFBLFVBQUEsUUFBQTtZQUNBLE1BQUEsUUFBQTs7S0FFQTs7QUNaQSxDQUFBLFlBQUE7O0lBRUEsUUFBQSxPQUFBLFlBQUEsV0FBQSxtQkFBQSxDQUFBLFVBQUEsUUFBQSxTQUFBLFVBQUEsUUFBQSxNQUFBLE9BQUE7O1lBRUEsT0FBQSxRQUFBLEtBQUE7WUFDQSxPQUFBLFVBQUEsS0FBQTs7WUFFQSxPQUFBLFFBQUEsVUFBQSxRQUFBO2dCQUNBLE1BQUEsUUFBQTs7O0tBR0EiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiYW5ndWxhci5tb2R1bGUoXCJhcHAuY29uZmlnXCIsIFtdKVxuLmNvbnN0YW50KFwiY29uZmlnXCIsIHtcblx0XCJhcGlcIjogXCJodHRwOi8vbG9jYWxob3N0OjgwMDEvYXBpL3YxXCIsIFxuXHRcImRlYnVnXCI6IHRydWUsXG4gICAgICAgICdJTUdfRk9MREVSJzogJ3NyYy9hcHBfbW9kdWxlcy9jb21tb24vdGVtcGxhdGVzLycsXG4gICAgICAgICdTUkNfRk9MREVSJzogJ3NyYy9hcHBfbW9kdWxlcy8nXG59KTtcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAuY2FyZHMnLCBbXSk7XG5cbiIsIid1c2Ugc3RyaWN0JztcblxuYW5ndWxhci5tb2R1bGUoJ2FwcCcsIFsnbmdSb3V0ZScsICdhcHAuY29uZmlnJywgJ2FwcC5ob21lJywgJ2FuZ3VsYXJNb2RhbFNlcnZpY2UnXSk7XG4gIFxuYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmNvbmZpZyhbJyRodHRwUHJvdmlkZXInLCBmdW5jdGlvbiAoJGh0dHBQcm92aWRlcikge1xuICAgICAgICBcbiAgICAkaHR0cFByb3ZpZGVyLmRlZmF1bHRzLmhlYWRlcnMuY29tbW9uID0geyBcbiAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uO29kYXRhPXZlcmJvc2UnLFxuICAgICAgICAnWC1Mb2dpbi1BamF4LWNhbGwnOiAndHJ1ZScsXG4gICAgICAgICdYLVJlcXVlc3RlZC1XaXRoJzogXCJYTUxIdHRwUmVxdWVzdFwiLFxuICAgICAgICAnWC1DU1JGLVRPS0VOJzogTGFyYXZlbC5jc3JmVG9rZW4sXG4gICAgICB9O1xufV0pXG4gXG5hbmd1bGFyLm1vZHVsZSgnYXBwJykucnVuKFtmdW5jdGlvbiAoKSB7XG4gXG59XSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwLmhvbWUnLCBbJ25nUm91dGUnLCAnYXBwLmNvbmZpZycsICduZ0FuaW1hdGUnLCAnYXBwLmNhcmRzJywgJ2hjLm1hcmtlZCcsICduZ1Nhbml0aXplJ10pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcC5jYXJkcycpLmNvbmZpZyhmdW5jdGlvbigkcm91dGVQcm92aWRlcikge1xuICAgXG59KTsiLCIoZnVuY3Rpb24gKCkge1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAnKS5jb25maWcoWyckcm91dGVQcm92aWRlcicsICdjb25maWcnLCBmdW5jdGlvbigkcm91dGVQcm92aWRlciwgY29uZmlnKSB7XG5cbiAgICAgICRyb3V0ZVByb3ZpZGVyXG4gICAgICAgIC53aGVuKCcvJywge1xuICAgICAgICAgICAgdGVtcGxhdGVVcmw6IGNvbmZpZy5TUkNfRk9MREVSICsgJ2hvbWUvdGVtcGxhdGVzL2hvbWUtdGVtcGxhdGUuaHRtbCcsXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnSG9tZUNvbnRyb2xsZXInLFxuICAgICAgICAgICAgY29udHJvbGxlckFzOiAnaG9tZSdcbiAgICAgICAgfSlcblxuICAgICAgICAub3RoZXJ3aXNlKHtyZWRpcmVjdFRvOiAnLyd9KTsgXG4gICAgfV0pO1xufSkoKTsiLCJhbmd1bGFyLm1vZHVsZSgnYXBwLmhvbWUnKS5jb25maWcoZnVuY3Rpb24oJHJvdXRlUHJvdmlkZXIpIHtcblxufSk7IiwiXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XG5cbiAgICAvLyBzd2l0Y2ggZm9ybXNcbiAgICAkKCcubWVzc2FnZSBhJykuY2xpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICBcbiAgICAgICAgJCgnZm9ybScpLmFuaW1hdGUoe2hlaWdodDogXCJ0b2dnbGVcIiwgb3BhY2l0eTogXCJ0b2dnbGVcIn0sIFwic2xvd1wiKTtcbiAgICAgICAgXG4gICAgICAgIGlmKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSA9PSAnL2xvZ2luJykge1xuICAgICAgICAgICAgaGlzdG9yeS5wdXNoU3RhdGUoe30sIFwiUmVnaXN0ZXJcIiwgXCIvcmVnaXN0ZXJcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBoaXN0b3J5LnB1c2hTdGF0ZSh7fSwgXCJMb2dpblwiLCBcIi9sb2dpblwiKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgJCgnZm9ybSAuaGVscC1ibG9jaycpLmhpZGUoKTtcbiAgICB9KTtcblxufSk7IiwiKGZ1bmN0aW9uKCl7XG4gICAgICAgIFxuICAgIC8qKlxuICAgICAqIEZZSSwgY2FyZHMgbXVzdCBoYXZlIHRoaXMgYmFzaWMgc3RydWN0dXJlXG4gICAgICoge1xuICAgICAqICAgICAgXCJpZFwiOiAxLFxuICAgICAgICAgICAgXCJuYW1lXCI6IFwiQXV0IG1vZGkgcXVhc2kgY29ycnVwdGkgdmVyaXRhdGlzIHN1bnQgZG9sb3JlLlwiLFxuICAgICAgICAgICAgY29udGVudDpcIkxvcmVtIElwc3VtIGRvbG9yIGVzdCAjaW1wb3J0YW50LiAjbXl0YWdcIixcbiAgICAgICAgICAgIHRhZ3M6IFtcbiAgICAgICAgICAgICAgICBcIm15dGFnXCIsIFwiaW1wb3J0YW50XCJcbiAgICAgICAgICAgIF1cbiAgICAgICAgfVxuICAgICovXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5jYXJkcycpLmNvbnRyb2xsZXIoJ0NhcmRzQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJ2NhcmRzRmFjdG9yeScsIENhcmRzQ29udHJvbGxlcl0pO1xuXG4gICAgZnVuY3Rpb24gQ2FyZHNDb250cm9sbGVyKCRzY29wZSwgY2FyZHNGYWN0b3J5KXtcbiAgICAgICAgXG4gICAgICAgIGNhcmRzRmFjdG9yeS5nZXRDYXJkcygpLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpeyAgICAgICBcbiAgICAgICAgICAgICRzY29wZS5jYXJkcyA9IHJlc3BvbnNlLmRhdGE7XG4gICAgICAgIH0pOyAgICBcblxuICAgICAgICBjcmVhdGVDYXJkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAkc2NvcGUuY2FyZHMucHVzaCh7XG4gICAgICAgICAgICAgICAgY29udGVudDogXCJSZW5vbWJyYXIgcHJveWVjdG8gYSBjYXJkcy4gI2NvcmVjaGFuZ2VcIixcbiAgICAgICAgICAgICAgICB0YWdzOiBbXG4gICAgICAgICAgICAgICAgICAgIFwiY29yZWNoYW5nZVwiLCBcImltcG9ydGFudFwiXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgfVxufSkoKTtcbiIsIihmdW5jdGlvbiAoKSB7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmNhcmRzJykuZGlyZWN0aXZlKCduZXdDYXJkRm9ybScsXG4gICAgICAgIFsnY29uZmlnJywgZnVuY3Rpb24gKGNvbmZpZykge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICAgICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICAgICAgICAgIGNhcmQ6IFwiPVwiXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBjb25maWcuU1JDX0ZPTERFUiArICdjYXJkcy90ZW1wbGF0ZXMvbmV3LWZvcm0uaHRtbCcsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24gKCRzY29wZSwgJHJvb3RTY29wZSwgY2FyZHNGYWN0b3J5KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnRyYW5zbGF0aW9ucyA9IHt9O1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUudHJhbnNsYXRpb25zLndyaXRlX3NvbWV0aGluZyA9IFwiV3JpdGUgc29tZXRoaW5nIGFuZCBoYXNoIGl0Li4uXCI7XG5cbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFN1Ym1pdCBmb3JtXG4gICAgICAgICAgICAgICAgICAgICAqIEByZXR1cm5zIHZvaWRcbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5jcmVhdGVDYXJkID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoJHNjb3BlLmNvbnRlbnQpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBkYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAkc2NvcGUubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogJHNjb3BlLmNvbnRlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FyZHNGYWN0b3J5LnNhdmUoZGF0YSkudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jbGFzcyA9ICdoaWdobGlnaHRlZCc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuaWQgPSByZXNwb25zZS5kYXRhLmlkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ25ldy1jYXJkJywgZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmNvbnRlbnQgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1dKTtcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcblxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuY2FyZHMnKS5mYWN0b3J5KCdjYXJkc0ZhY3RvcnknLCBbJyRodHRwJywgJyRxJywgJ2NvbmZpZycsIGNhcmRzRmFjdG9yeV0pO1xuXG4gICAgZnVuY3Rpb24gY2FyZHNGYWN0b3J5KCRodHRwLCAkcSwgY29uZmlnKSB7XG5cbiAgICAgICAgdmFyIGZhY3RvcnkgPSB7fTtcbiAgICAgICAgdmFyIGVuZHBvaW50ID0gXCIvY2FyZHNcIjtcbiAgICAgICAgdmFyIGNhcmRzO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBmYWN0b3J5LmdldEFsbCA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgdmFyIGRlZmVyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgICAgICAgdmFyIHByb21pc2UgPSBkZWZlcmVkLnByb21pc2U7XG5cbiAgICAgICAgICAgIGNhcmRzID0gJGh0dHAuZ2V0KGNvbmZpZy5hcGkgKyBlbmRwb2ludCwgeyBjYWNoZTogdHJ1ZX0pOyAvLyBnZXQgbGlzdFxuXG4gICAgICAgICAgICBjYXJkcy50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIGRlZmVyZWQucmVzb2x2ZShyZXNwb25zZSk7XG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgZGVmZXJlZC5yZWplY3QoZXJyKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICAgICAgfTtcblxuICAgICAgICBmYWN0b3J5LnNhdmUgPSBmdW5jdGlvbiAoZGF0YSkge1xuXG4gICAgICAgICAgICB2YXIgZGVmZXJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICAgICAgICB2YXIgcHJvbWlzZSA9IGRlZmVyZWQucHJvbWlzZTtcblxuICAgICAgICAgICAgJGh0dHAucG9zdChjb25maWcuYXBpICsgZW5kcG9pbnQsIGRhdGEpLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgZGVmZXJlZC5yZXNvbHZlKHJlc3BvbnNlKTtcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICBkZWZlcmVkLnJlamVjdChlcnIpO1xuICAgICAgICAgICAgfSk7XG4gXG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZmFjdG9yeS51cGRhdGUgPSBmdW5jdGlvbiAoZGF0YSkge1xuXG4gICAgICAgICAgICB2YXIgZGVmZXJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICAgICAgICB2YXIgcHJvbWlzZSA9IGRlZmVyZWQucHJvbWlzZTtcblxuICAgICAgICAgICAgJGh0dHAucHV0KGNvbmZpZy5hcGkgKyBlbmRwb2ludCArICcvJyArIGRhdGEuaWQsIGRhdGEpLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgZGVmZXJlZC5yZXNvbHZlKHJlc3BvbnNlKTtcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICBkZWZlcmVkLnJlamVjdChlcnIpO1xuICAgICAgICAgICAgfSk7XG4gXG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZhY3RvcnkuZGVsZXRlID0gZnVuY3Rpb24gKGlkKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBkZWZlcmVkID0gJHEuZGVmZXIoKTtcbiAgICAgICAgICAgIHZhciBwcm9taXNlID0gZGVmZXJlZC5wcm9taXNlO1xuXG4gICAgICAgICAgICAkaHR0cC5kZWxldGUoY29uZmlnLmFwaSArIGVuZHBvaW50ICsgJy8nICsgaWQpLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgZGVmZXJlZC5yZXNvbHZlKHJlc3BvbnNlKTtcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICBkZWZlcmVkLnJlamVjdChlcnIpO1xuICAgICAgICAgICAgfSk7XG4gXG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWN0b3J5O1xuICAgIH1cblxufSkoKTtcblxuIiwiKGZ1bmN0aW9uICgpIHtcblxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAnKS5jb250cm9sbGVyKCdIZWFkZXJDb250cm9sbGVyJywgWyckc2NvcGUnLCBIZWFkZXJDb250cm9sbGVyXSk7XG5cbiAgICBmdW5jdGlvbiBIZWFkZXJDb250cm9sbGVyKCRzY29wZSkge1xuICAgICAgICBcbiAgICB9XG59KSgpO1xuXG5cbiIsIihmdW5jdGlvbiAoKSB7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwJykuY29udHJvbGxlcignTGF5b3V0Q29udHJvbGxlcicsIFsnJHNjb3BlJywgJyRzY2UnLCBMYXlvdXRDb250cm9sbGVyXSk7XG5cbiAgICBmdW5jdGlvbiBMYXlvdXRDb250cm9sbGVyKCRzY29wZSwgJHNjZSkge1xuXG4gICAgICAgICRzY29wZS50cmFuc2xhdGlvbnMgPSB7XG4gICAgICAgICAgICBzdWJ0aXRsZTogJ1NpbXBseSBoYXNoIHlvdXIgbm90ZXMgYW5kIG5hdmlnYXRlIHRoZW0nXG4gICAgICAgIH07ICAgICAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAkc2NvcGUudGFnVXNlckNsaWNrID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgdmFyIHRhZ1RleHQgPSBlLnRhcmdldC5pbm5lclRleHQ7XG4gICAgICAgICAgICBhbGVydCgndGFnVXNlckNsaWNrLCB0YWdUZXh0OiAnICsgdGFnVGV4dCk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAkc2NvcGUudGFnVGVybUNsaWNrID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgdmFyIHRhZ1RleHQgPSBlLnRhcmdldC5pbm5lclRleHQ7XG4gICAgICAgICAgICBhbGVydCgndGFnVGVybUNsaWNrLCB0YWdUZXh0OiAnICsgdGFnVGV4dCk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvLyBZb3UgY291bGQgZGVmaW5lICd0YWdVc2VyQ2xpY2snIGFuZCAndGFnVGVybUNsaWNrJ1xuICAgICAgICAvLyBvbiB0aGUgJyRyb290U2NvcGUnLiBUaGlzIHdheSB5b3UgY2FuIGhhbmRsZSB3aGF0ZXZlclxuICAgICAgICAvLyBsb2dpYyB5b3Ugd2FudCBmb3IgaGFzaHRhZ3MgaW4gb25lIHBsYWNlIHJhdGhlciB0aGFuXG4gICAgICAgIC8vIGhhdmluZyB0byBkZWZpbmUgaXQgaW4gZWFjaCBjb250cm9sbGVyLlxuICAgICAgICBcbiAgICAgICAgJHNjb3BlLnRydXN0SHRtbCA9IGZ1bmN0aW9uKGh0bWwpIHtcbiAgICAgICAgICAgIC8vIFNhbml0aXplIG1hbnVhbGx5IGlmIG5lY2Vzc2FyeS4gSXQncyBsaWtlbHkgdGhpc1xuICAgICAgICAgICAgLy8gaHRtbCBoYXMgYWxyZWFkeSBiZWVuIHNhbml0aXplZCBzZXJ2ZXIgc2lkZVxuICAgICAgICAgICAgLy8gYmVmb3JlIGl0IHdlbnQgaW50byB5b3VyIGRhdGFiYXNlLlxuICAgICAgICAgICAgLy8gRG9uJ3QgaG9sZCBtZSBsaWFibGUgZm9yIFhTUy4uLiBuZXZlciBhc3N1bWUgOn4pXG4gICAgICAgICAgICByZXR1cm4gJHNjZS50cnVzdEFzSHRtbChodG1sKTtcbiAgICAgICAgfTtcbiAgICB9XG59KSgpO1xuXG5cbiIsIihmdW5jdGlvbiAoKSB7XG4gICAgLy8gQmVjYXVzZSBvZiB0aGUgYW5tZSBhbmQgRSB0eXBlLCB3b3JrcyBhdXRvbWF0aWNhbGx5IGZvciBldmVyeSB0ZXh0YXJlYVxuICAgIC8vIHJlZjogaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vdGhvbXNlZGRvbi80NzAzOTY4XG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmRpcmVjdGl2ZSgnZWxhc3RpY2FyZWEnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByZXN0cmljdDogJ0EnLFxuICAgICAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRyaWJ1dGVzKSB7XG4gICAgICAgICAgICAgICAgdmFyIHRocmVzaG9sZCA9IDM1LFxuICAgICAgICAgICAgICAgICAgICAgICAgbWluSGVpZ2h0ID0gZWxlbWVudFswXS5vZmZzZXRIZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nTGVmdCA9IGVsZW1lbnQuY3NzKCdwYWRkaW5nTGVmdCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZ1JpZ2h0ID0gZWxlbWVudC5jc3MoJ3BhZGRpbmdSaWdodCcpO1xuXG4gICAgICAgICAgICAgICAgdmFyICRzaGFkb3cgPSBhbmd1bGFyLmVsZW1lbnQoJzxkaXY+PC9kaXY+JykuY3NzKHtcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgICAgICAgICAgICAgICAgIHRvcDogLTEwMDAwLFxuICAgICAgICAgICAgICAgICAgICBsZWZ0OiAtMTAwMDAsXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiBlbGVtZW50WzBdLm9mZnNldFdpZHRoIC0gcGFyc2VJbnQocGFkZGluZ0xlZnQgfHwgMCkgLSBwYXJzZUludChwYWRkaW5nUmlnaHQgfHwgMCksXG4gICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiBlbGVtZW50LmNzcygnZm9udFNpemUnKSxcbiAgICAgICAgICAgICAgICAgICAgZm9udEZhbWlseTogZWxlbWVudC5jc3MoJ2ZvbnRGYW1pbHknKSxcbiAgICAgICAgICAgICAgICAgICAgbGluZUhlaWdodDogZWxlbWVudC5jc3MoJ2xpbmVIZWlnaHQnKSxcbiAgICAgICAgICAgICAgICAgICAgcmVzaXplOiAnbm9uZSdcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5ib2R5KS5hcHBlbmQoJHNoYWRvdyk7XG5cbiAgICAgICAgICAgICAgICB2YXIgdXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdGltZXMgPSBmdW5jdGlvbiAoc3RyaW5nLCBudW1iZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCByID0gJyc7IGkgPCBudW1iZXI7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHIgKz0gc3RyaW5nO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHI7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB2YXIgdmFsID0gZWxlbWVudC52YWwoKS5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLyYvZywgJyZhbXA7JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxuJC8sICc8YnIvPiZuYnNwOycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcbi9nLCAnPGJyLz4nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXHN7Mix9L2csIGZ1bmN0aW9uIChzcGFjZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGltZXMoJyZuYnNwOycsIHNwYWNlLmxlbmd0aCAtIDEpICsgJyAnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICRzaGFkb3cuaHRtbCh2YWwpO1xuXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuY3NzKCdoZWlnaHQnLCBNYXRoLm1heCgkc2hhZG93WzBdLm9mZnNldEhlaWdodCArIHRocmVzaG9sZCwgbWluSGVpZ2h0KSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgJHNoYWRvdy5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGVsZW1lbnQuYmluZCgna2V5dXAga2V5ZG93biBrZXlwcmVzcyBjaGFuZ2UnLCB1cGRhdGUpO1xuICAgICAgICAgICAgICAgIHVwZGF0ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG59KSgpOyIsIihmdW5jdGlvbiAoKSB7IFxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAnKS5kaXJlY3RpdmUoJ2hhc2h0YWdpZnknLCBbJyR0aW1lb3V0JywgJyRjb21waWxlJyxcbiAgICAgICAgZnVuY3Rpb24oJHRpbWVvdXQsICRjb21waWxlKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHJlc3RyaWN0OiAnQScsXG4gICAgICAgICAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgICAgICAgICAgdUNsaWNrOiAnJnVzZXJDbGljaycsXG4gICAgICAgICAgICAgICAgICAgIHRDbGljazogJyZ0ZXJtQ2xpY2snXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaHRtbCA9IGVsZW1lbnQuaHRtbCgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaHRtbCA9PT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhdHRycy51c2VyQ2xpY2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBodG1sID0gaHRtbC5yZXBsYWNlKC8ofFxccykqQChcXHcrKS9nLCAnJDE8YSBuZy1jbGljaz1cInVDbGljayh7JGV2ZW50OiAkZXZlbnR9KVwiIGNsYXNzPVwiaGFzaHRhZ1wiPkAkMjwvYT4nKTsgXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhdHRycy50ZXJtQ2xpY2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBodG1sID0gaHRtbC5yZXBsYWNlKC8oXnxcXHMpKiMoXFx3KykvZywgJyQxPGEgbmctY2xpY2s9XCJ0Q2xpY2soeyRldmVudDogJGV2ZW50fSlcIiBjbGFzcz1cImhhc2h0YWdcIj4jJDI8L2E+Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuaHRtbChodG1sKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgJGNvbXBpbGUoZWxlbWVudC5jb250ZW50cygpKShzY29wZSk7XG4gICAgICAgICAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICBdKTtcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcblxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAnKS5kaXJlY3RpdmUoJ3Nob3dNb3JlJyxcbiAgICAgICAgWydjb25maWcnLCBmdW5jdGlvbiAoY29uZmlnKSB7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IGNvbmZpZy5JTUdfRk9MREVSICsgJ3Nob3dNb3JlLmh0bWwnLFxuICAgICAgICAgICAgICAgIHJlc3RyaWN0OiAnQScsXG4gICAgICAgICAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgICAgICAgICAnc2hvd01vcmVIZWlnaHQnOiAnQCdcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJyRlbGVtZW50JywgJyRpbnRlcnZhbCcsIGZ1bmN0aW9uICgkc2NvcGUsICRlbGVtZW50LCAkaW50ZXJ2YWwpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmV4cGFuZGVkID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICRpbnRlcnZhbChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVuZGVyU3R5bGVzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCAzMDApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXhwYW5kYWJsZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gcmVuZGVyU3R5bGVzKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICgkZWxlbWVudC5oZWlnaHQoKSA+PSAkc2NvcGUuc2hvd01vcmVIZWlnaHQgJiYgJHNjb3BlLmV4cGFuZGVkID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXhwYW5kYWJsZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuc2hvd0xlc3NTdHlsZSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnbWF4LWhlaWdodCc6ICRzY29wZS5zaG93TW9yZUhlaWdodCArICdweCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ292ZXJmbG93JzogJ2hpZGRlbidcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1dKTtcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwJylcbiAgICAgICAgLmZpbHRlcigncmVkdWNlQnknLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoY29sbGVjdGlvbiwgZmllbGQpIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICByZXR1cm4gY29sbGVjdGlvbi5yZWR1Y2UoZnVuY3Rpb24ob3V0cHV0LCBjdXJyZW50KXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKCFmaWVsZEV4aXN0cyhvdXRwdXQsIGZpZWxkLCBjdXJyZW50W2ZpZWxkXSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG91dHB1dC5jb25jYXQoY3VycmVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gb3V0cHV0O1xuICAgICAgICAgICAgICAgICAgICB9LCBbXSk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGZpZWxkRXhpc3RzKGhheXN0YWNrLCBmaWVsZE5hbWUsIGZpZWxkVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGhheXN0YWNrLnNvbWUoZnVuY3Rpb24oZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZWxbZmllbGROYW1lXSA9PT0gZmllbGRWYWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgfSk7IFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07ICAgICAgICAgICAgXG4gICAgICAgIH0pO1xufSkoKTtcblxuIiwiKGZ1bmN0aW9uICgpIHtcblxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuaG9tZScpLmNvbnRyb2xsZXIoJ0hvbWVDb250cm9sbGVyJywgWyckc2NvcGUnLCBIb21lQ29udHJvbGxlcl0pO1xuXG4gICAgZnVuY3Rpb24gSG9tZUNvbnRyb2xsZXIoJHNjb3BlKSB7XG5cbiAgICAgICAgJHNjb3BlLnRyYW5zbGF0aW9ucyA9IHtcbiAgICAgICAgICAgIGhvbWU6IHt9XG4gICAgICAgIH07ICAgICAgICAgICAgXG4gICAgfVxufSkoKTtcblxuXG4iLCIoZnVuY3Rpb24oKXtcbiAgICBcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmhvbWUnKS5jb250cm9sbGVyKCdMaXN0Q29udHJvbGxlcicsIFsnJHNjb3BlJywgJ2NvbmZpZycsICdjYXJkc0ZhY3RvcnknLCAnTW9kYWxTZXJ2aWNlJywgJ0hvbWVDb250ZXh0U2VydmljZScsIExpc3RDb250cm9sbGVyXSk7XG4gICAgXG4gICAgZnVuY3Rpb24gTGlzdENvbnRyb2xsZXIoJHNjb3BlLCBjb25maWcsIGNhcmRzRmFjdG9yeSwgTW9kYWxTZXJ2aWNlLCBIb21lQ29udGV4dFNlcnZpY2Upe1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAkc2NvcGUudHJhbnNsYXRpb25zLm5vX3Jlc3VsdHMgPSBcIk5vIHJlc3VsdHNcIjsgICAgICAgIFxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdheSB0byBrZWVwIHNpYmxpbmdzIGNvbm5lY3RlZCBhbmQgc2hhcmluZyBzY29wZVxuICAgICAgICAgKi9cbiAgICAgICAgJHNjb3BlLmNvbnRleHQgPSBIb21lQ29udGV4dFNlcnZpY2UuY29udGV4dDtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHZXQgY2FyZHMgbGlzdFxuICAgICAgICAgKi9cbiAgICAgICAgY2FyZHNGYWN0b3J5XG4gICAgICAgICAgICAuZ2V0QWxsKClcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuXG4gICAgICAgICAgICAgICAgJHNjb3BlLmNvbnRleHQuY2FyZHMgPSBhbmd1bGFyLmZyb21Kc29uKHJlc3BvbnNlLmRhdGEpO1xuXG4gICAgICAgICAgICAgICAgJHNjb3BlLm9yZGVyQ2FyZHNCeSA9ICd1cGRhdGVkX2F0JztcblxuICAgICAgICAgICAgICAgICRzY29wZS5kaXJlY3Rpb24gPSAncmV2ZXJzZSc7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpOyAvLyBUT0RPOiBUcmF0YXIgZWwgZXJyb3JcbiAgICAgICAgICAgIH0pOyAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDcmVhdGUgY2FyZFxuICAgICAgICAgKi9cbiAgICAgICAgJHNjb3BlLiRvbignbmV3LWNhcmQnLCBmdW5jdGlvbihldnQsIGRhdGEpIHtcbiAgICAgICAgICAgICRzY29wZS5jb250ZXh0LmNhcmRzLnB1c2goZGF0YSk7XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgJHNjb3BlLnBpbkNhcmQgPSBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGxldCBpbmRleCA9ICRzY29wZS5jb250ZXh0LmNhcmRzLmluZGV4T2YoaXRlbSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGxldCBjYXJkID0ge1xuICAgICAgICAgICAgICAgIGlkOiBpdGVtLmlkLFxuICAgICAgICAgICAgICAgIHN0aWNreTogIWl0ZW0uc3RpY2t5XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNhcmRzRmFjdG9yeS51cGRhdGUoY2FyZCkudGhlbihmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgICAgIGlmKGl0ZW0uc3RpY2t5KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIG5vdCBzdGlja3kgYW55bW9yZVxuICAgICAgICAgICAgICAgICAgICBpdGVtLnN0aWNreSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBpdGVtLmNsYXNzID0gaXRlbS5jbGFzcyA/IGl0ZW0uY2xhc3MucmVwbGFjZShcInN0aWNreVwiLCBcIlwiKSA6IFwiXCI7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gc3RpY2t5LiBQdXQgaXQgZmlyc3RcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5zdGlja3kgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBpdGVtLmNsYXNzID0gaXRlbS5jbGFzcyA/IGl0ZW0uY2xhc3MgKyBcIiBzdGlja3lcIiA6IFwic3RpY2t5XCI7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5jb250ZXh0LmNhcmRzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5jb250ZXh0LmNhcmRzLnVuc2hpZnQoaXRlbSk7XG4gICAgICAgICAgICAgICAgfSBcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTsgIFxuICAgICAgICAgICAgXG4gICAgICAgICRzY29wZS5kZWxldGUgPSBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIEp1c3QgcHJvdmlkZSBhIHRlbXBsYXRlIHVybCwgYSBjb250cm9sbGVyIGFuZCBjYWxsICdzaG93TW9kYWwnLlxuICAgICAgICAgICAgTW9kYWxTZXJ2aWNlLnNob3dNb2RhbCh7XG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IGNvbmZpZy5TUkNfRk9MREVSICsgXCJob21lL21vZGFscy9jb25maXJtLmh0bWxcIixcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBcIlllc05vQ29udHJvbGxlclwiLFxuICAgICAgICAgICAgICAgIGlucHV0czoge1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAndGl0bGUnOiAnRGVsZXRlIGNhcmQ/JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdjb250ZW50JzogXCJZb3UnbGwgbm90IGJlIGFibGUgdG8gcmVjb3ZlciBpdFwiIFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkudGhlbihmdW5jdGlvbiAobW9kYWwpIHtcbiAgICAgICAgICAgICAgICBtb2RhbC5lbGVtZW50Lm1vZGFsKCk7XG4gICAgICAgICAgICAgICAgbW9kYWwuY2xvc2UudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBpZihyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhcmRzRmFjdG9yeS5kZWxldGUoaXRlbS5pZCkudGhlbihmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpbmRleCA9ICRzY29wZS5jb250ZXh0LmNhcmRzLmluZGV4T2YoaXRlbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmNvbnRleHQuY2FyZHMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSBcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgJHNjb3BlLmVkaXQgPSBmdW5jdGlvbihpdGVtKXtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgTW9kYWxTZXJ2aWNlLnNob3dNb2RhbCh7XG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IGNvbmZpZy5TUkNfRk9MREVSICsgXCJob21lL21vZGFscy9lZGl0Lmh0bWxcIixcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBcIkVkaXRDb250cm9sbGVyXCIsXG4gICAgICAgICAgICAgICAgaW5wdXRzOiB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhcmQ6IGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKG1vZGFsKSB7XG4gICAgICAgICAgICAgICAgbW9kYWwuZWxlbWVudC5tb2RhbCgpO1xuICAgICAgICAgICAgICAgIG1vZGFsLmNsb3NlLnRoZW4oZnVuY3Rpb24gKHJlc3VsdCl7XG4gICAgICAgICAgICAgICAgICAgIGlmKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY2FyZCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogaXRlbS5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBtb2RhbC5zY29wZS5mb3JtLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogbW9kYWwuc2NvcGUuZm9ybS5jb250ZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgY2FyZHNGYWN0b3J5LnVwZGF0ZShjYXJkKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpbmRleCA9ICRzY29wZS5jb250ZXh0LmNhcmRzLmluZGV4T2YoaXRlbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5ndWxhci5jb3B5KGNhcmQsICRzY29wZS5jb250ZXh0LmNhcmRzW2luZGV4XSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgJHNjb3BlLnZpZXdBc01hcmtkb3duTW9kYWwgPSBmdW5jdGlvbiAoaXRlbSkge1xuXG4gICAgICAgICAgICAvLyBKdXN0IHByb3ZpZGUgYSB0ZW1wbGF0ZSB1cmwsIGEgY29udHJvbGxlciBhbmQgY2FsbCAnc2hvd01vZGFsJy5cbiAgICAgICAgICAgIE1vZGFsU2VydmljZS5zaG93TW9kYWwoe1xuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBjb25maWcuU1JDX0ZPTERFUiArIFwiaG9tZS9tb2RhbHMvbWFya2Rvd24uaHRtbFwiLFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IFwiTWFya2Rvd25Db250cm9sbGVyXCIsXG4gICAgICAgICAgICAgICAgaW5wdXRzOiB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICdjYXJkJzogaXRlbVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkudGhlbihmdW5jdGlvbiAobW9kYWwpIHtcbiAgICAgICAgICAgICAgICBtb2RhbC5lbGVtZW50Lm1vZGFsKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICB9XG59KSgpOyIsIihmdW5jdGlvbigpe1xuICAgIFxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuaG9tZScpLmNvbnRyb2xsZXIoJ1NlYXJjaENvbnRyb2xsZXInLCBbJyRzY29wZScsICdIb21lQ29udGV4dFNlcnZpY2UnLCBTZWFyY2hDb250cm9sbGVyXSk7XG4gICAgXG4gICAgZnVuY3Rpb24gU2VhcmNoQ29udHJvbGxlcigkc2NvcGUsIEhvbWVDb250ZXh0U2VydmljZSl7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICRzY29wZS50cmFuc2xhdGlvbnMucXVpY2tfc2VhcmNoID0gXCJRdWljayBTZWFyY2guLi5cIjsgICAgXG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogV2F5IHRvIGtlZXAgc2libGluZ3MgY29ubmVjdGVkIGFuZCBzaGFyaW5nIHNjb3BlXG4gICAgICAgICAqL1xuICAgICAgICAkc2NvcGUuY29udGV4dCA9IEhvbWVDb250ZXh0U2VydmljZS5jb250ZXh0O1xuICAgIH1cbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcblxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuaG9tZScpLmNvbnRyb2xsZXIoJ1N0YWNrQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJ0hvbWVDb250ZXh0U2VydmljZScsIFN0YWNrQ29udHJvbGxlcl0pO1xuXG4gICAgZnVuY3Rpb24gU3RhY2tDb250cm9sbGVyKCRzY29wZSwgSG9tZUNvbnRleHRTZXJ2aWNlKSB7XG5cbiAgICAgICAgJHNjb3BlLnRyYW5zbGF0aW9ucy5ob21lLnN0YWNrTGlzdCA9IHtcbiAgICAgICAgICAgIHRpdGxlOiBcIlN0YWNrc1wiXG4gICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdheSB0byBrZWVwIHNpYmxpbmdzIGNvbm5lY3RlZCBhbmQgc2hhcmluZyBzY29wZVxuICAgICAgICAgKi9cbiAgICAgICAgJHNjb3BlLmNvbnRleHQgPSBIb21lQ29udGV4dFNlcnZpY2UuY29udGV4dDtcblxuICAgICAgICAkc2NvcGUuY29udGV4dC5zdGFja3MgPSBbe1xuICAgICAgICAgICAgaWQ6IDEsXG4gICAgICAgICAgICBuYW1lOiAnVW5pdmVyc2FsJ1xuICAgICAgICB9LCB7XG4gICAgICAgICAgICBpZDogMixcbiAgICAgICAgICAgIG5hbWU6ICdTZWNvbmQgc3RhY2snLFxuICAgICAgICAgICAgcGFydGljaXBhbnRzOiB7XG4gICAgICAgICAgICAgICAgY291bnQ6IDEsXG4gICAgICAgICAgICAgICAgbGlzdDoge1xuICAgICAgICAgICAgICAgICAgICAnSm9obiBEb2UnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbWc6ICdwcm9maWxlLXBpY3R1cmUtNjB4NjAucG5nJ1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBpZDogMyxcbiAgICAgICAgICAgIG5hbWU6ICdBbmQgc28gb24nLFxuICAgICAgICAgICAgcGFydGljaXBhbnRzOiB7XG4gICAgICAgICAgICAgICAgY291bnQ6IDE1LFxuICAgICAgICAgICAgICAgIGxpc3Q6IHtcbiAgICAgICAgICAgICAgICAgICAgJ0pvaG4gRG9lJzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW1nOiAncHJvZmlsZS1waWN0dXJlLTYweDYwLnBuZydcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgJ0NoYXJsZXMgRGF2aWRzb24nOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbWc6ICdwcm9maWxlLXBpY3R1cmUtNjB4NjAucG5nJ1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAnQWxleCBTdGV3YXJkJzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW1nOiAncHJvZmlsZS1waWN0dXJlLTYweDYwLnBuZydcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfV07XG4gICAgfVxufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5ob21lJykuY29udHJvbGxlcignVGFnQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJ3JlZHVjZUJ5RmlsdGVyJywgJ0hvbWVDb250ZXh0U2VydmljZScsIFRhZ0Nsb3VkQ29udHJvbGxlcl0pO1xuXG4gICAgZnVuY3Rpb24gVGFnQ2xvdWRDb250cm9sbGVyKCRzY29wZSwgcmVkdWNlQnlGaWx0ZXIsIEhvbWVDb250ZXh0U2VydmljZSkge1xuXG4gICAgICAgICAkc2NvcGUudHJhbnNsYXRpb25zLmhvbWUudGFnQ2xvdWQgPSB7XG4gICAgICAgICAgICB0aXRsZTogXCJJbiB0aGlzIHBhZ2VcIlxuICAgICAgICB9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBXYXkgdG8ga2VlcCBzaWJsaW5ncyBjb25uZWN0ZWQgYW5kIHNoYXJpbmcgc2NvcGVcbiAgICAgICAgICovXG4gICAgICAgICRzY29wZS5jb250ZXh0ID0gSG9tZUNvbnRleHRTZXJ2aWNlLmNvbnRleHQ7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEtlZXAgdHJhY2sgb2YgY2FyZCBsaXN0IGNoYW5nZXNcbiAgICAgICAgICogQHJldHVybnMgdm9pZFxuICAgICAgICAgKi9cbiAgICAgICAgZnVuY3Rpb24gdXBkYXRlVGFnQ2xvdWQoKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIGV4Y2x1ZGUgY2FyZCB3aXRoIG5vIHRhZ3NcbiAgICAgICAgICAgIGxldCBjYXJkcyA9ICRzY29wZS5jb250ZXh0LmZpbHRlcmVkLmZpbHRlcihmdW5jdGlvbiAoY2FyZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjYXJkLnRhZ3MgPyBjYXJkLnRhZ3MubGVuZ3RoID4gMCA6IGZhbHNlO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIGV4dHJhY3QgdGFncyBmcm9tIGNhcmRcbiAgICAgICAgICAgIGxldCB0YWdzID0gY2FyZHMubWFwKGZ1bmN0aW9uIChjYXJkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoYW5ndWxhci50b0pzb24oY2FyZC50YWdzKSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gbWVyZ2UgdGFncyBpbiBmbGF0dGVuIGFycmF5XG4gICAgICAgICAgICBsZXQgbWVyZ2VkID0gW10uY29uY2F0LmFwcGx5KFtdLCB0YWdzKTtcblxuICAgICAgICAgICAgLy8gZWxpbWluYXRlIGR1cGxpY2F0ZXMgYW5kIHNlcnZlIGFycmF5IHRvIHZpZXdcbiAgICAgICAgICAgICRzY29wZS5jb250ZXh0LnRhZ3MgPSByZWR1Y2VCeUZpbHRlcihtZXJnZWQsICdpZCcpO1xuICAgICAgICB9XG4gICAgICAgXG4gICAgICAgICRzY29wZS4kd2F0Y2hDb2xsZWN0aW9uKCdjb250ZXh0LmZpbHRlcmVkJywgdXBkYXRlVGFnQ2xvdWQgKTtcbiAgICB9XG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5ob21lJylcbiAgICAgICAgLmZpbHRlcignaGlnaGxpZ2h0VGV4dCcsIGZ1bmN0aW9uKCRzY2UpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAodGV4dCwgcGhyYXNlKSB7XG4gICAgICAgICAgICAgICAgbGV0IGhpZ2hsaWdodGVkID0gcGhyYXNlXG4gICAgICAgICAgICAgICAgICAgICAgICA/IHRleHQucmVwbGFjZShuZXcgUmVnRXhwKCcoJyArIHBocmFzZSArICcpJywgJ2dpJyksICc8c3BhbiBjbGFzcz1cImhpZ2hsaWdodC10ZXh0XCI+JDE8L3NwYW4+JylcbiAgICAgICAgICAgICAgICAgICAgICAgIDogdGV4dDtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHJldHVybiAkc2NlLnRydXN0QXNIdG1sKGhpZ2hsaWdodGVkKTtcbiAgICAgICAgICAgIH07ICAgICAgICAgICAgXG4gICAgICAgIH0pO1xufSkoKTtcblxuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcC5ob21lJykuc2VydmljZSgnSG9tZUNvbnRleHRTZXJ2aWNlJywgZnVuY3Rpb24oKXtcbiAgICB0aGlzLmNvbnRleHQgPSB7XG4gICAgICAgIGNhcmRzOiBbXSxcbiAgICAgICAgcXVlcnk6ICcnXG4gICAgfTtcbn0pOyIsIihmdW5jdGlvbigpIHtcblxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuaG9tZScpLmNvbnRyb2xsZXIoJ0VkaXRDb250cm9sbGVyJywgWyckc2NvcGUnLCAnZGF0YScsICdjbG9zZScsIEVkaXRDb250cm9sbGVyXSk7XG4gICAgXG4gICAgZnVuY3Rpb24gRWRpdENvbnRyb2xsZXIoJHNjb3BlLCBkYXRhLCBjbG9zZSkge1xuXG4gICAgICAgICRzY29wZS5mb3JtID0ge307XG4gICAgICAgICRzY29wZS5mb3JtLm5hbWUgPSBkYXRhLmNhcmQubmFtZTtcbiAgICAgICAgJHNjb3BlLmZvcm0uY29udGVudCA9IGRhdGEuY2FyZC5jb250ZW50O1xuXG4gICAgICAgICRzY29wZS5jbG9zZSA9IGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgXG4gICAgICAgICAgICBjbG9zZShyZXN1bHQsIDIwMCk7IC8vIGNsb3NlLCBidXQgZ2l2ZSAyMDBtcyBmb3IgYm9vdHN0cmFwIHRvIGFuaW1hdGVcbiAgICAgICAgfTtcbiAgICB9O1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmhvbWUnKS5jb250cm9sbGVyKCdNYXJrZG93bkNvbnRyb2xsZXInLCBbJyRzY29wZScsICdkYXRhJywgJ2Nsb3NlJywgTWFya2Rvd25Db250cm9sbGVyXSk7XG4gICAgXG4gICAgZnVuY3Rpb24gTWFya2Rvd25Db250cm9sbGVyKCRzY29wZSwgZGF0YSwgY2xvc2UpIHtcblxuICAgICAgICAkc2NvcGUudGl0bGUgPSBkYXRhLmNhcmQubmFtZTtcbiAgICAgICAgJHNjb3BlLmNvbnRlbnQgPSBkYXRhLmNhcmQuY29udGVudDtcblxuICAgICAgICAkc2NvcGUuZGlzbWlzc01vZGFsID0gZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgY2xvc2UocmVzdWx0LCAyMDApOyAvLyBjbG9zZSwgYnV0IGdpdmUgMjAwbXMgZm9yIGJvb3RzdHJhcCB0byBhbmltYXRlXG4gICAgICAgIH07XG4gICAgfTtcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcblxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuaG9tZScpLmNvbnRyb2xsZXIoJ1llc05vQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJ2RhdGEnLCAnY2xvc2UnLCBmdW5jdGlvbiAoJHNjb3BlLCBkYXRhLCBjbG9zZSkge1xuICAgICAgICAgICBcbiAgICAgICAgICAgICRzY29wZS50aXRsZSA9IGRhdGEudGl0bGU7XG4gICAgICAgICAgICAkc2NvcGUuY29udGVudCA9IGRhdGEuY29udGVudDtcbiAgICAgICAgICAgXG4gICAgICAgICAgICAkc2NvcGUuY2xvc2UgPSBmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgY2xvc2UocmVzdWx0LCAyMDApOyAvLyBjbG9zZSwgYnV0IGdpdmUgMjAwbXMgZm9yIGJvb3RzdHJhcCB0byBhbmltYXRlXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XSk7XG59KSgpOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
