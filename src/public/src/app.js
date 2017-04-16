angular.module("app.config", [])
.constant("config", {
	"api": "http://localhost:8001/api/v1", 
	"debug": true
});

angular.module('app.cards', []);


'use strict';

angular.module('app', ['ngRoute', 'app.config', 'app.home']);
  
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

angular.module('app').constant('IMG_FOLDER', 'src/app_modules/common/templates/');

angular.module('app.home', ['ngRoute', 'app.config', 'ngAnimate', 'app.cards', 'ngSanitize']);

angular.module('app.cards').config(["$routeProvider", function($routeProvider) {
   
}]);
angular.module('app').config(['$routeProvider', function($routeProvider) {
    
  $routeProvider
    .when('/', {
        templateUrl: 'src/app_modules/home/templates/home-template.html',
        controller: 'HomeController',
        controllerAs: 'home'
    })
    
    .otherwise({redirectTo: '/'}); 
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
angular.module('app.home').config(["$routeProvider", function($routeProvider) {

}]);
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
    angular.module('app').directive('textarea', function () {
        return {
            restrict: 'E',
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
            ["IMG_FOLDER", function (IMG_FOLDER) {
               
                return {
                    templateUrl: IMG_FOLDER + 'showMore.html',
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


(function(){
    
    angular.module('app.home').controller('FormController', ['$scope', 'cardsFactory', 'HomeContextService', FormController]);
    
    function FormController($scope, cardsFactory, HomeContextService) {
        
        $scope.translations.write_something = "Write something and hash it...";
        
        /**
         * Way to keep siblings connected and sharing scope
         */
        $scope.context = HomeContextService.context;
        
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
                    $scope.context.cards.push(data);
                }, function (response) {
                    console.log(response);
                })

                $scope.content = '';
            }
        };
    }
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
    
    angular.module('app.home').controller('ListController', ['$scope', 'cardsFactory', 'HomeContextService', ListController]);
    
    function ListController($scope, cardsFactory, HomeContextService){
                
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
            
        $scope.deleteCard = function(item) {
            
            cardsFactory.delete(item.id).then(function(){
                let index = $scope.context.cards.indexOf(item);
                $scope.context.cards.splice(index, 1);
            }, function(err) {
                console.log(err);
            });
        }
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
                return card.tags.length > 0;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC1jb25maWcuanMiLCJjYXJkcy9tb2R1bGUuanMiLCJjb21tb24vbW9kdWxlLmpzIiwiaG9tZS9tb2R1bGUuanMiLCJjYXJkcy9jYXJkcy1yb3V0ZS5qcyIsImNvbW1vbi9hcHAtcm91dGUuanMiLCJsb2dpbi9sb2dpbi5qcyIsImhvbWUvaG9tZS1yb3V0ZS5qcyIsImNhcmRzL2NvbnRyb2xsZXJzL2NhcmRzLWNvbnRyb2xsZXIuanMiLCJjYXJkcy9zZXJ2aWNlcy9jYXJkcy1mYWN0b3J5LmpzIiwiY29tbW9uL2NvbnRyb2xsZXJzL2hlYWRlci1jb250cm9sbGVycy5qcyIsImNvbW1vbi9jb250cm9sbGVycy9sYXlvdXQtY29udHJvbGxlcnMuanMiLCJjb21tb24vZGlyZWN0aXZlcy9lbGFzdGljQXJlYS5qcyIsImNvbW1vbi9kaXJlY3RpdmVzL2hhc2h0YWdpZnkuanMiLCJjb21tb24vZGlyZWN0aXZlcy9zaG93TW9yZS5qcyIsImNvbW1vbi9maWx0ZXJzL3JlZHVjZUJ5LmpzIiwiaG9tZS9jb250cm9sbGVycy9mb3JtLWNvbnRyb2xsZXIuanMiLCJob21lL2NvbnRyb2xsZXJzL2hvbWUtY29udHJvbGxlci5qcyIsImhvbWUvY29udHJvbGxlcnMvbGlzdC1jb250cm9sbGVyLmpzIiwiaG9tZS9jb250cm9sbGVycy9zZWFyY2gtY29udHJvbGxlci5qcyIsImhvbWUvY29udHJvbGxlcnMvc3RhY2stY29udHJvbGxlci5qcyIsImhvbWUvY29udHJvbGxlcnMvdGFnLWNsb3VkLWNvbnRyb2xsZXIuanMiLCJob21lL2ZpbHRlcnMvaGlnaGxpZ2h0VGV4dC5qcyIsImhvbWUvc2VydmljZXMvaG9tZS1jb250ZXh0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFFBQUEsT0FBQSxjQUFBO0NBQ0EsU0FBQSxVQUFBO0NBQ0EsT0FBQTtDQUNBLFNBQUE7OztBQ0hBLFFBQUEsT0FBQSxhQUFBOzs7QUNBQTs7QUFFQSxRQUFBLE9BQUEsT0FBQSxDQUFBLFdBQUEsY0FBQTs7QUFFQSxRQUFBLE9BQUEsT0FBQSxPQUFBLENBQUEsaUJBQUEsVUFBQSxlQUFBOztJQUVBLGNBQUEsU0FBQSxRQUFBLFNBQUE7UUFDQSxnQkFBQTtRQUNBLFVBQUE7UUFDQSxxQkFBQTtRQUNBLG9CQUFBO1FBQ0EsZ0JBQUEsUUFBQTs7OztBQUlBLFFBQUEsT0FBQSxPQUFBLElBQUEsQ0FBQSxZQUFBOzs7O0FBSUEsUUFBQSxPQUFBLE9BQUEsU0FBQSxjQUFBOztBQ25CQSxRQUFBLE9BQUEsWUFBQSxDQUFBLFdBQUEsY0FBQSxhQUFBLGFBQUE7O0FDQUEsUUFBQSxPQUFBLGFBQUEsMEJBQUEsU0FBQSxnQkFBQTs7O0FDQUEsUUFBQSxPQUFBLE9BQUEsT0FBQSxDQUFBLGtCQUFBLFNBQUEsZ0JBQUE7O0VBRUE7S0FDQSxLQUFBLEtBQUE7UUFDQSxhQUFBO1FBQ0EsWUFBQTtRQUNBLGNBQUE7OztLQUdBLFVBQUEsQ0FBQSxZQUFBOzs7QUNSQSxFQUFBLFVBQUEsTUFBQSxZQUFBOzs7SUFHQSxFQUFBLGNBQUEsTUFBQSxZQUFBOztRQUVBLEVBQUEsUUFBQSxRQUFBLENBQUEsUUFBQSxVQUFBLFNBQUEsV0FBQTs7UUFFQSxHQUFBLE9BQUEsU0FBQSxZQUFBLFVBQUE7WUFDQSxRQUFBLFVBQUEsSUFBQSxZQUFBO2VBQ0E7WUFDQSxRQUFBLFVBQUEsSUFBQSxTQUFBOzs7UUFHQSxFQUFBLG9CQUFBOzs7O0FDZEEsUUFBQSxPQUFBLFlBQUEsMEJBQUEsU0FBQSxnQkFBQTs7O0FDQUEsQ0FBQSxVQUFBOzs7Ozs7Ozs7Ozs7O0lBYUEsUUFBQSxPQUFBLGFBQUEsV0FBQSxtQkFBQSxDQUFBLFVBQUEsZ0JBQUE7O0lBRUEsU0FBQSxnQkFBQSxRQUFBLGFBQUE7O1FBRUEsYUFBQSxXQUFBLEtBQUEsU0FBQSxTQUFBO1lBQ0EsT0FBQSxRQUFBLFNBQUE7OztRQUdBLGFBQUEsV0FBQTtZQUNBLE9BQUEsTUFBQSxLQUFBO2dCQUNBLFNBQUE7Z0JBQ0EsTUFBQTtvQkFDQSxjQUFBOzs7Ozs7O0FDekJBLENBQUEsWUFBQTs7SUFFQSxRQUFBLE9BQUEsYUFBQSxRQUFBLGdCQUFBLENBQUEsU0FBQSxNQUFBLFVBQUE7O0lBRUEsU0FBQSxhQUFBLE9BQUEsSUFBQSxRQUFBOztRQUVBLElBQUEsVUFBQTtRQUNBLElBQUEsV0FBQTtRQUNBLElBQUE7O1FBRUEsUUFBQSxTQUFBLFlBQUE7O1lBRUEsSUFBQSxVQUFBLEdBQUE7WUFDQSxJQUFBLFVBQUEsUUFBQTs7WUFFQSxRQUFBLE1BQUEsSUFBQSxPQUFBLE1BQUEsVUFBQSxFQUFBLE9BQUE7O1lBRUEsTUFBQSxLQUFBLFVBQUEsVUFBQTtnQkFDQSxRQUFBLFFBQUE7ZUFDQSxVQUFBLEtBQUE7Z0JBQ0EsUUFBQSxPQUFBOzs7WUFHQSxPQUFBOzs7UUFHQSxRQUFBLE9BQUEsVUFBQSxNQUFBOztZQUVBLElBQUEsVUFBQSxHQUFBO1lBQ0EsSUFBQSxVQUFBLFFBQUE7O1lBRUEsTUFBQSxLQUFBLE9BQUEsTUFBQSxVQUFBLE1BQUEsS0FBQSxVQUFBLFVBQUE7Z0JBQ0EsUUFBQSxRQUFBO2VBQ0EsVUFBQSxLQUFBO2dCQUNBLFFBQUEsT0FBQTs7O1lBR0EsT0FBQTs7O1FBR0EsUUFBQSxTQUFBLFVBQUEsSUFBQTs7WUFFQSxJQUFBLFVBQUEsR0FBQTtZQUNBLElBQUEsVUFBQSxRQUFBOztZQUVBLE1BQUEsT0FBQSxPQUFBLE1BQUEsV0FBQSxNQUFBLElBQUEsS0FBQSxVQUFBLFVBQUE7Z0JBQ0EsUUFBQSxRQUFBO2VBQ0EsVUFBQSxLQUFBO2dCQUNBLFFBQUEsT0FBQTs7O1lBR0EsT0FBQTs7O1FBR0EsT0FBQTs7Ozs7O0FDdERBLENBQUEsWUFBQTs7SUFFQSxRQUFBLE9BQUEsT0FBQSxXQUFBLG9CQUFBLENBQUEsVUFBQTs7SUFFQSxTQUFBLGlCQUFBLFFBQUE7Ozs7Ozs7QUNKQSxDQUFBLFlBQUE7O0lBRUEsUUFBQSxPQUFBLE9BQUEsV0FBQSxvQkFBQSxDQUFBLFVBQUEsUUFBQTs7SUFFQSxTQUFBLGlCQUFBLFFBQUEsTUFBQTs7UUFFQSxPQUFBLGVBQUE7WUFD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O0FDMUNBLENBQUEsWUFBQTs7SUFFQSxRQUFBLE9BQUEsWUFBQSxXQUFBLGlCQUFBLENBQUEsVUFBQSxrQkFBQSxzQkFBQTs7SUFFQSxTQUFBLG1CQUFBLFFBQUEsZ0JBQUEsb0JBQUE7O1NBRUEsT0FBQSxhQUFBLEtBQUEsV0FBQTtZQUNBLE9BQUE7Ozs7OztRQU1BLE9BQUEsVUFBQSxtQkFBQTs7Ozs7O1FBTUEsU0FBQSxpQkFBQTs7O1lBR0EsSUFBQSxRQUFBLE9BQUEsUUFBQSxTQUFBLE9BQUEsVUFBQSxNQUFBO2dCQUNBLE9BQUEsS0FBQSxLQUFBLFNBQUE7Ozs7WUFJQSxJQUFBLE9BQUEsTUFBQSxJQUFBLFVBQUEsTUFBQTtnQkFDQSxPQUFBLEtBQUEsTUFBQSxRQUFBLE9BQUEsS0FBQTs7OztZQUlBLElBQUEsU0FBQSxHQUFBLE9BQUEsTUFBQSxJQUFBOzs7WUFHQSxPQUFBLFFBQUEsT0FBQSxlQUFBLFFBQUE7OztRQUdBLE9BQUEsaUJBQUEsb0JBQUE7OztBQ3RDQSxDQUFBLFlBQUE7SUFDQSxRQUFBLE9BQUE7U0FDQSxPQUFBLDBCQUFBLFNBQUEsTUFBQTtZQUNBLE9BQUEsVUFBQSxNQUFBLFFBQUE7Z0JBQ0EsSUFBQSxjQUFBOzBCQUNBLEtBQUEsUUFBQSxJQUFBLE9BQUEsTUFBQSxTQUFBLEtBQUEsT0FBQTswQkFDQTs7Z0JBRUEsT0FBQSxLQUFBLFlBQUE7Ozs7OztBQ1JBLFFBQUEsT0FBQSxZQUFBLFFBQUEsc0JBQUEsVUFBQTtJQUNBLEtBQUEsVUFBQTtRQUNBLE9BQUE7UUFDQSxPQUFBOztHQUVBIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbImFuZ3VsYXIubW9kdWxlKFwiYXBwLmNvbmZpZ1wiLCBbXSlcbi5jb25zdGFudChcImNvbmZpZ1wiLCB7XG5cdFwiYXBpXCI6IFwiaHR0cDovL2xvY2FsaG9zdDo4MDAxL2FwaS92MVwiLCBcblx0XCJkZWJ1Z1wiOiB0cnVlXG59KTtcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAuY2FyZHMnLCBbXSk7XG5cbiIsIid1c2Ugc3RyaWN0JztcblxuYW5ndWxhci5tb2R1bGUoJ2FwcCcsIFsnbmdSb3V0ZScsICdhcHAuY29uZmlnJywgJ2FwcC5ob21lJ10pO1xuICBcbmFuZ3VsYXIubW9kdWxlKCdhcHAnKS5jb25maWcoWyckaHR0cFByb3ZpZGVyJywgZnVuY3Rpb24gKCRodHRwUHJvdmlkZXIpIHtcbiAgICAgICAgXG4gICAgJGh0dHBQcm92aWRlci5kZWZhdWx0cy5oZWFkZXJzLmNvbW1vbiA9IHsgXG4gICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vanNvbjtvZGF0YT12ZXJib3NlJyxcbiAgICAgICAgJ1gtTG9naW4tQWpheC1jYWxsJzogJ3RydWUnLFxuICAgICAgICAnWC1SZXF1ZXN0ZWQtV2l0aCc6IFwiWE1MSHR0cFJlcXVlc3RcIixcbiAgICAgICAgJ1gtQ1NSRi1UT0tFTic6IExhcmF2ZWwuY3NyZlRva2VuLFxuICAgICAgfTtcbn1dKVxuIFxuYW5ndWxhci5tb2R1bGUoJ2FwcCcpLnJ1bihbZnVuY3Rpb24gKCkge1xuIFxufV0pO1xuXG5hbmd1bGFyLm1vZHVsZSgnYXBwJykuY29uc3RhbnQoJ0lNR19GT0xERVInLCAnc3JjL2FwcF9tb2R1bGVzL2NvbW1vbi90ZW1wbGF0ZXMvJyk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwLmhvbWUnLCBbJ25nUm91dGUnLCAnYXBwLmNvbmZpZycsICduZ0FuaW1hdGUnLCAnYXBwLmNhcmRzJywgJ25nU2FuaXRpemUnXSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwLmNhcmRzJykuY29uZmlnKGZ1bmN0aW9uKCRyb3V0ZVByb3ZpZGVyKSB7XG4gICBcbn0pOyIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKS5jb25maWcoWyckcm91dGVQcm92aWRlcicsIGZ1bmN0aW9uKCRyb3V0ZVByb3ZpZGVyKSB7XG4gICAgXG4gICRyb3V0ZVByb3ZpZGVyXG4gICAgLndoZW4oJy8nLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnc3JjL2FwcF9tb2R1bGVzL2hvbWUvdGVtcGxhdGVzL2hvbWUtdGVtcGxhdGUuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdIb21lQ29udHJvbGxlcicsXG4gICAgICAgIGNvbnRyb2xsZXJBczogJ2hvbWUnXG4gICAgfSlcbiAgICBcbiAgICAub3RoZXJ3aXNlKHtyZWRpcmVjdFRvOiAnLyd9KTsgXG59XSk7IiwiXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XG5cbiAgICAvLyBzd2l0Y2ggZm9ybXNcbiAgICAkKCcubWVzc2FnZSBhJykuY2xpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICBcbiAgICAgICAgJCgnZm9ybScpLmFuaW1hdGUoe2hlaWdodDogXCJ0b2dnbGVcIiwgb3BhY2l0eTogXCJ0b2dnbGVcIn0sIFwic2xvd1wiKTtcbiAgICAgICAgXG4gICAgICAgIGlmKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSA9PSAnL2xvZ2luJykge1xuICAgICAgICAgICAgaGlzdG9yeS5wdXNoU3RhdGUoe30sIFwiUmVnaXN0ZXJcIiwgXCIvcmVnaXN0ZXJcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBoaXN0b3J5LnB1c2hTdGF0ZSh7fSwgXCJMb2dpblwiLCBcIi9sb2dpblwiKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgJCgnZm9ybSAuaGVscC1ibG9jaycpLmhpZGUoKTtcbiAgICB9KTtcblxufSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcC5ob21lJykuY29uZmlnKGZ1bmN0aW9uKCRyb3V0ZVByb3ZpZGVyKSB7XG5cbn0pOyIsIihmdW5jdGlvbigpe1xuICAgICAgICBcbiAgICAvKipcbiAgICAgKiBGWUksIGNhcmRzIG11c3QgaGF2ZSB0aGlzIGJhc2ljIHN0cnVjdHVyZVxuICAgICAqIHtcbiAgICAgKiAgICAgIFwiaWRcIjogMSxcbiAgICAgICAgICAgIFwibmFtZVwiOiBcIkF1dCBtb2RpIHF1YXNpIGNvcnJ1cHRpIHZlcml0YXRpcyBzdW50IGRvbG9yZS5cIixcbiAgICAgICAgICAgIGNvbnRlbnQ6XCJMb3JlbSBJcHN1bSBkb2xvciBlc3QgI2ltcG9ydGFudC4gI215dGFnXCIsXG4gICAgICAgICAgICB0YWdzOiBbXG4gICAgICAgICAgICAgICAgXCJteXRhZ1wiLCBcImltcG9ydGFudFwiXG4gICAgICAgICAgICBdXG4gICAgICAgIH1cbiAgICAqL1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuY2FyZHMnKS5jb250cm9sbGVyKCdDYXJkc0NvbnRyb2xsZXInLCBbJyRzY29wZScsICdjYXJkc0ZhY3RvcnknLCBDYXJkc0NvbnRyb2xsZXJdKTtcblxuICAgIGZ1bmN0aW9uIENhcmRzQ29udHJvbGxlcigkc2NvcGUsIGNhcmRzRmFjdG9yeSl7XG4gICAgICAgIFxuICAgICAgICBjYXJkc0ZhY3RvcnkuZ2V0Q2FyZHMoKS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXsgICAgICAgXG4gICAgICAgICAgICAkc2NvcGUuY2FyZHMgPSByZXNwb25zZS5kYXRhO1xuICAgICAgICB9KTsgICAgXG5cbiAgICAgICAgY3JlYXRlQ2FyZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgJHNjb3BlLmNhcmRzLnB1c2goe1xuICAgICAgICAgICAgICAgIGNvbnRlbnQ6IFwiUmVub21icmFyIHByb3llY3RvIGEgY2FyZHMuICNjb3JlY2hhbmdlXCIsXG4gICAgICAgICAgICAgICAgdGFnczogW1xuICAgICAgICAgICAgICAgICAgICBcImNvcmVjaGFuZ2VcIiwgXCJpbXBvcnRhbnRcIlxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgIH1cbn0pKCk7XG4iLCIoZnVuY3Rpb24gKCkge1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5jYXJkcycpLmZhY3RvcnkoJ2NhcmRzRmFjdG9yeScsIFsnJGh0dHAnLCAnJHEnLCAnY29uZmlnJywgY2FyZHNGYWN0b3J5XSk7XG5cbiAgICBmdW5jdGlvbiBjYXJkc0ZhY3RvcnkoJGh0dHAsICRxLCBjb25maWcpIHtcblxuICAgICAgICB2YXIgZmFjdG9yeSA9IHt9O1xuICAgICAgICB2YXIgZW5kcG9pbnQgPSBcIi9jYXJkc1wiO1xuICAgICAgICB2YXIgY2FyZHM7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGZhY3RvcnkuZ2V0QWxsID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICB2YXIgZGVmZXJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICAgICAgICB2YXIgcHJvbWlzZSA9IGRlZmVyZWQucHJvbWlzZTtcblxuICAgICAgICAgICAgY2FyZHMgPSAkaHR0cC5nZXQoY29uZmlnLmFwaSArIGVuZHBvaW50LCB7IGNhY2hlOiB0cnVlfSk7IC8vIGdldCBsaXN0XG5cbiAgICAgICAgICAgIGNhcmRzLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgZGVmZXJlZC5yZXNvbHZlKHJlc3BvbnNlKTtcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICBkZWZlcmVkLnJlamVjdChlcnIpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgICAgICB9O1xuXG4gICAgICAgIGZhY3Rvcnkuc2F2ZSA9IGZ1bmN0aW9uIChkYXRhKSB7XG5cbiAgICAgICAgICAgIHZhciBkZWZlcmVkID0gJHEuZGVmZXIoKTtcbiAgICAgICAgICAgIHZhciBwcm9taXNlID0gZGVmZXJlZC5wcm9taXNlO1xuXG4gICAgICAgICAgICAkaHR0cC5wb3N0KGNvbmZpZy5hcGkgKyBlbmRwb2ludCwgZGF0YSkudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICBkZWZlcmVkLnJlc29sdmUocmVzcG9uc2UpO1xuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgIGRlZmVyZWQucmVqZWN0KGVycik7XG4gICAgICAgICAgICB9KTtcbiBcbiAgICAgICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgICAgICB9XG5cbiAgICAgICAgZmFjdG9yeS5kZWxldGUgPSBmdW5jdGlvbiAoaWQpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIGRlZmVyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgICAgICAgdmFyIHByb21pc2UgPSBkZWZlcmVkLnByb21pc2U7XG5cbiAgICAgICAgICAgICRodHRwLmRlbGV0ZShjb25maWcuYXBpICsgZW5kcG9pbnQgKyAnLycgKyBpZCkudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICBkZWZlcmVkLnJlc29sdmUocmVzcG9uc2UpO1xuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgIGRlZmVyZWQucmVqZWN0KGVycik7XG4gICAgICAgICAgICB9KTtcbiBcbiAgICAgICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhY3Rvcnk7XG4gICAgfVxuXG59KSgpO1xuXG4iLCIoZnVuY3Rpb24gKCkge1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmNvbnRyb2xsZXIoJ0hlYWRlckNvbnRyb2xsZXInLCBbJyRzY29wZScsIEhlYWRlckNvbnRyb2xsZXJdKTtcblxuICAgIGZ1bmN0aW9uIEhlYWRlckNvbnRyb2xsZXIoJHNjb3BlKSB7XG4gICAgICAgIFxuICAgIH1cbn0pKCk7XG5cblxuIiwiKGZ1bmN0aW9uICgpIHtcblxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAnKS5jb250cm9sbGVyKCdMYXlvdXRDb250cm9sbGVyJywgWyckc2NvcGUnLCAnJHNjZScsIExheW91dENvbnRyb2xsZXJdKTtcblxuICAgIGZ1bmN0aW9uIExheW91dENvbnRyb2xsZXIoJHNjb3BlLCAkc2NlKSB7XG5cbiAgICAgICAgJHNjb3BlLnRyYW5zbGF0aW9ucyA9IHtcbiAgICAgICAgICAgIHN1YnRpdGxlOiAnU2ltcGx5IGhhc2ggeW91ciBub3RlcyBhbmQgbmF2aWdhdGUgdGhlbSdcbiAgICAgICAgfTsgICAgICAgICAgICBcbiAgICAgICAgXG4gICAgICAgICRzY29wZS50YWdVc2VyQ2xpY2sgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICB2YXIgdGFnVGV4dCA9IGUudGFyZ2V0LmlubmVyVGV4dDtcbiAgICAgICAgICAgIGFsZXJ0KCd0YWdVc2VyQ2xpY2ssIHRhZ1RleHQ6ICcgKyB0YWdUZXh0KTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgICRzY29wZS50YWdUZXJtQ2xpY2sgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICB2YXIgdGFnVGV4dCA9IGUudGFyZ2V0LmlubmVyVGV4dDtcbiAgICAgICAgICAgIGFsZXJ0KCd0YWdUZXJtQ2xpY2ssIHRhZ1RleHQ6ICcgKyB0YWdUZXh0KTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8vIFlvdSBjb3VsZCBkZWZpbmUgJ3RhZ1VzZXJDbGljaycgYW5kICd0YWdUZXJtQ2xpY2snXG4gICAgICAgIC8vIG9uIHRoZSAnJHJvb3RTY29wZScuIFRoaXMgd2F5IHlvdSBjYW4gaGFuZGxlIHdoYXRldmVyXG4gICAgICAgIC8vIGxvZ2ljIHlvdSB3YW50IGZvciBoYXNodGFncyBpbiBvbmUgcGxhY2UgcmF0aGVyIHRoYW5cbiAgICAgICAgLy8gaGF2aW5nIHRvIGRlZmluZSBpdCBpbiBlYWNoIGNvbnRyb2xsZXIuXG4gICAgICAgIFxuICAgICAgICAkc2NvcGUudHJ1c3RIdG1sID0gZnVuY3Rpb24oaHRtbCkge1xuICAgICAgICAgICAgLy8gU2FuaXRpemUgbWFudWFsbHkgaWYgbmVjZXNzYXJ5LiBJdCdzIGxpa2VseSB0aGlzXG4gICAgICAgICAgICAvLyBodG1sIGhhcyBhbHJlYWR5IGJlZW4gc2FuaXRpemVkIHNlcnZlciBzaWRlXG4gICAgICAgICAgICAvLyBiZWZvcmUgaXQgd2VudCBpbnRvIHlvdXIgZGF0YWJhc2UuXG4gICAgICAgICAgICAvLyBEb24ndCBob2xkIG1lIGxpYWJsZSBmb3IgWFNTLi4uIG5ldmVyIGFzc3VtZSA6filcbiAgICAgICAgICAgIHJldHVybiAkc2NlLnRydXN0QXNIdG1sKGh0bWwpO1xuICAgICAgICB9O1xuICAgIH1cbn0pKCk7XG5cblxuIiwiKGZ1bmN0aW9uICgpIHtcbiAgICAvLyBCZWNhdXNlIG9mIHRoZSBhbm1lIGFuZCBFIHR5cGUsIHdvcmtzIGF1dG9tYXRpY2FsbHkgZm9yIGV2ZXJ5IHRleHRhcmVhXG4gICAgLy8gcmVmOiBodHRwczovL2dpc3QuZ2l0aHViLmNvbS90aG9tc2VkZG9uLzQ3MDM5NjhcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwJykuZGlyZWN0aXZlKCd0ZXh0YXJlYScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgICAgICAgICB2YXIgdGhyZXNob2xkID0gMzUsXG4gICAgICAgICAgICAgICAgICAgICAgICBtaW5IZWlnaHQgPSBlbGVtZW50WzBdLm9mZnNldEhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmdMZWZ0ID0gZWxlbWVudC5jc3MoJ3BhZGRpbmdMZWZ0JyksXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nUmlnaHQgPSBlbGVtZW50LmNzcygncGFkZGluZ1JpZ2h0Jyk7XG5cbiAgICAgICAgICAgICAgICB2YXIgJHNoYWRvdyA9IGFuZ3VsYXIuZWxlbWVudCgnPGRpdj48L2Rpdj4nKS5jc3Moe1xuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgICAgICAgICAgICAgICAgdG9wOiAtMTAwMDAsXG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6IC0xMDAwMCxcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IGVsZW1lbnRbMF0ub2Zmc2V0V2lkdGggLSBwYXJzZUludChwYWRkaW5nTGVmdCB8fCAwKSAtIHBhcnNlSW50KHBhZGRpbmdSaWdodCB8fCAwKSxcbiAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6IGVsZW1lbnQuY3NzKCdmb250U2l6ZScpLFxuICAgICAgICAgICAgICAgICAgICBmb250RmFtaWx5OiBlbGVtZW50LmNzcygnZm9udEZhbWlseScpLFxuICAgICAgICAgICAgICAgICAgICBsaW5lSGVpZ2h0OiBlbGVtZW50LmNzcygnbGluZUhlaWdodCcpLFxuICAgICAgICAgICAgICAgICAgICByZXNpemU6ICdub25lJ1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmJvZHkpLmFwcGVuZCgkc2hhZG93KTtcblxuICAgICAgICAgICAgICAgIHZhciB1cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB0aW1lcyA9IGZ1bmN0aW9uIChzdHJpbmcsIG51bWJlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIHIgPSAnJzsgaSA8IG51bWJlcjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgciArPSBzdHJpbmc7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcjtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHZhciB2YWwgPSBlbGVtZW50LnZhbCgpLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvJi9nLCAnJmFtcDsnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXG4kLywgJzxici8+Jm5ic3A7JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxuL2csICc8YnIvPicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcc3syLH0vZywgZnVuY3Rpb24gKHNwYWNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aW1lcygnJm5ic3A7Jywgc3BhY2UubGVuZ3RoIC0gMSkgKyAnICc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgJHNoYWRvdy5odG1sKHZhbCk7XG5cbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5jc3MoJ2hlaWdodCcsIE1hdGgubWF4KCRzaGFkb3dbMF0ub2Zmc2V0SGVpZ2h0ICsgdGhyZXNob2xkLCBtaW5IZWlnaHQpKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAkc2hhZG93LnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgZWxlbWVudC5iaW5kKCdrZXl1cCBrZXlkb3duIGtleXByZXNzIGNoYW5nZScsIHVwZGF0ZSk7XG4gICAgICAgICAgICAgICAgdXBkYXRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHsgXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmRpcmVjdGl2ZSgnaGFzaHRhZ2lmeScsIFsnJHRpbWVvdXQnLCAnJGNvbXBpbGUnLFxuICAgICAgICBmdW5jdGlvbigkdGltZW91dCwgJGNvbXBpbGUpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcmVzdHJpY3Q6ICdBJyxcbiAgICAgICAgICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgICAgICAgICB1Q2xpY2s6ICcmdXNlckNsaWNrJyxcbiAgICAgICAgICAgICAgICAgICAgdENsaWNrOiAnJnRlcm1DbGljaydcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBodG1sID0gZWxlbWVudC5odG1sKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChodG1sID09PSAnJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGF0dHJzLnVzZXJDbGljaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGh0bWwgPSBodG1sLnJlcGxhY2UoLyh8XFxzKSpAKFxcdyspL2csICckMTxhIG5nLWNsaWNrPVwidUNsaWNrKHskZXZlbnQ6ICRldmVudH0pXCIgY2xhc3M9XCJoYXNodGFnXCI+QCQyPC9hPicpOyBcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGF0dHJzLnRlcm1DbGljaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGh0bWwgPSBodG1sLnJlcGxhY2UoLyhefFxccykqIyhcXHcrKS9nLCAnJDE8YSBuZy1jbGljaz1cInRDbGljayh7JGV2ZW50OiAkZXZlbnR9KVwiIGNsYXNzPVwiaGFzaHRhZ1wiPiMkMjwvYT4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5odG1sKGh0bWwpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAkY29tcGlsZShlbGVtZW50LmNvbnRlbnRzKCkpKHNjb3BlKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIF0pO1xufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmRpcmVjdGl2ZSgnc2hvd01vcmUnLFxuICAgICAgICAgICAgZnVuY3Rpb24gKElNR19GT0xERVIpIHtcbiAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBJTUdfRk9MREVSICsgJ3Nob3dNb3JlLmh0bWwnLFxuICAgICAgICAgICAgICAgICAgICByZXN0cmljdDogJ0EnLFxuICAgICAgICAgICAgICAgICAgICB0cmFuc2NsdWRlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgJ3Nob3dNb3JlSGVpZ2h0JzogJ0AnXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJyRlbGVtZW50JywgJyRpbnRlcnZhbCcsIGZ1bmN0aW9uICgkc2NvcGUsICRlbGVtZW50LCAkaW50ZXJ2YWwpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5leHBhbmRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRpbnRlcnZhbChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlclN0eWxlcygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIDMwMCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXhwYW5kYWJsZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHJlbmRlclN0eWxlcygpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCRlbGVtZW50LmhlaWdodCgpID49ICRzY29wZS5zaG93TW9yZUhlaWdodCAmJiAkc2NvcGUuZXhwYW5kZWQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXhwYW5kYWJsZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuc2hvd0xlc3NTdHlsZSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ21heC1oZWlnaHQnOiAkc2NvcGUuc2hvd01vcmVIZWlnaHQgKyAncHgnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnb3ZlcmZsb3cnOiAnaGlkZGVuJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIH1dXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pO1xufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAnKVxuICAgICAgICAuZmlsdGVyKCdyZWR1Y2VCeScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChjb2xsZWN0aW9uLCBmaWVsZCkge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHJldHVybiBjb2xsZWN0aW9uLnJlZHVjZShmdW5jdGlvbihvdXRwdXQsIGN1cnJlbnQpe1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoIWZpZWxkRXhpc3RzKG91dHB1dCwgZmllbGQsIGN1cnJlbnRbZmllbGRdKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gb3V0cHV0LmNvbmNhdChjdXJyZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgICAgICAgICAgICAgICAgIH0sIFtdKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gZmllbGRFeGlzdHMoaGF5c3RhY2ssIGZpZWxkTmFtZSwgZmllbGRWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaGF5c3RhY2suc29tZShmdW5jdGlvbihlbCkge1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBlbFtmaWVsZE5hbWVdID09PSBmaWVsZFZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9KTsgXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTsgICAgICAgICAgICBcbiAgICAgICAgfSk7XG59KSgpO1xuXG4iLCIoZnVuY3Rpb24oKXtcbiAgICBcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmhvbWUnKS5jb250cm9sbGVyKCdGb3JtQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJ2NhcmRzRmFjdG9yeScsICdIb21lQ29udGV4dFNlcnZpY2UnLCBGb3JtQ29udHJvbGxlcl0pO1xuICAgIFxuICAgIGZ1bmN0aW9uIEZvcm1Db250cm9sbGVyKCRzY29wZSwgY2FyZHNGYWN0b3J5LCBIb21lQ29udGV4dFNlcnZpY2UpIHtcbiAgICAgICAgXG4gICAgICAgICRzY29wZS50cmFuc2xhdGlvbnMud3JpdGVfc29tZXRoaW5nID0gXCJXcml0ZSBzb21ldGhpbmcgYW5kIGhhc2ggaXQuLi5cIjtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBXYXkgdG8ga2VlcCBzaWJsaW5ncyBjb25uZWN0ZWQgYW5kIHNoYXJpbmcgc2NvcGVcbiAgICAgICAgICovXG4gICAgICAgICRzY29wZS5jb250ZXh0ID0gSG9tZUNvbnRleHRTZXJ2aWNlLmNvbnRleHQ7XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogU3VibWl0IGZvcm1cbiAgICAgICAgICogQHJldHVybnMgdm9pZFxuICAgICAgICAgKi9cbiAgICAgICAgJHNjb3BlLmNyZWF0ZUNhcmQgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIGlmICgkc2NvcGUuY29udGVudCkge1xuXG4gICAgICAgICAgICAgICAgbGV0IGRhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICRzY29wZS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICBjb250ZW50OiAkc2NvcGUuY29udGVudFxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBjYXJkc0ZhY3Rvcnkuc2F2ZShkYXRhKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICBkYXRhLmNsYXNzID0gJ2hpZ2hsaWdodGVkJztcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmNvbnRleHQuY2FyZHMucHVzaChkYXRhKTtcbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgICAgICAkc2NvcGUuY29udGVudCA9ICcnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcblxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuaG9tZScpLmNvbnRyb2xsZXIoJ0hvbWVDb250cm9sbGVyJywgWyckc2NvcGUnLCBIb21lQ29udHJvbGxlcl0pO1xuXG4gICAgZnVuY3Rpb24gSG9tZUNvbnRyb2xsZXIoJHNjb3BlKSB7XG5cbiAgICAgICAgJHNjb3BlLnRyYW5zbGF0aW9ucyA9IHtcbiAgICAgICAgICAgIGhvbWU6IHt9XG4gICAgICAgIH07ICAgICAgICAgICAgXG4gICAgfVxufSkoKTtcblxuXG4iLCIoZnVuY3Rpb24oKXtcbiAgICBcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmhvbWUnKS5jb250cm9sbGVyKCdMaXN0Q29udHJvbGxlcicsIFsnJHNjb3BlJywgJ2NhcmRzRmFjdG9yeScsICdIb21lQ29udGV4dFNlcnZpY2UnLCBMaXN0Q29udHJvbGxlcl0pO1xuICAgIFxuICAgIGZ1bmN0aW9uIExpc3RDb250cm9sbGVyKCRzY29wZSwgY2FyZHNGYWN0b3J5LCBIb21lQ29udGV4dFNlcnZpY2Upe1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAkc2NvcGUudHJhbnNsYXRpb25zLm5vX3Jlc3VsdHMgPSBcIk5vIHJlc3VsdHNcIjsgICAgICAgIFxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdheSB0byBrZWVwIHNpYmxpbmdzIGNvbm5lY3RlZCBhbmQgc2hhcmluZyBzY29wZVxuICAgICAgICAgKi9cbiAgICAgICAgJHNjb3BlLmNvbnRleHQgPSBIb21lQ29udGV4dFNlcnZpY2UuY29udGV4dDtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHZXQgY2FyZHMgbGlzdFxuICAgICAgICAgKi9cbiAgICAgICAgY2FyZHNGYWN0b3J5XG4gICAgICAgICAgICAuZ2V0QWxsKClcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuXG4gICAgICAgICAgICAgICAgJHNjb3BlLmNvbnRleHQuY2FyZHMgPSBhbmd1bGFyLmZyb21Kc29uKHJlc3BvbnNlLmRhdGEpO1xuXG4gICAgICAgICAgICAgICAgJHNjb3BlLm9yZGVyQ2FyZHNCeSA9ICd1cGRhdGVkX2F0JztcblxuICAgICAgICAgICAgICAgICRzY29wZS5kaXJlY3Rpb24gPSAncmV2ZXJzZSc7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpOyAvLyBUT0RPOiBUcmF0YXIgZWwgZXJyb3JcbiAgICAgICAgICAgIH0pOyAgXG4gICAgICAgICAgICBcbiAgICAgICAgJHNjb3BlLmRlbGV0ZUNhcmQgPSBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNhcmRzRmFjdG9yeS5kZWxldGUoaXRlbS5pZCkudGhlbihmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIGxldCBpbmRleCA9ICRzY29wZS5jb250ZXh0LmNhcmRzLmluZGV4T2YoaXRlbSk7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmNvbnRleHQuY2FyZHMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCl7XG4gICAgXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5ob21lJykuY29udHJvbGxlcignU2VhcmNoQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJ0hvbWVDb250ZXh0U2VydmljZScsIFNlYXJjaENvbnRyb2xsZXJdKTtcbiAgICBcbiAgICBmdW5jdGlvbiBTZWFyY2hDb250cm9sbGVyKCRzY29wZSwgSG9tZUNvbnRleHRTZXJ2aWNlKXtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgJHNjb3BlLnRyYW5zbGF0aW9ucy5xdWlja19zZWFyY2ggPSBcIlF1aWNrIFNlYXJjaC4uLlwiOyAgICBcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBXYXkgdG8ga2VlcCBzaWJsaW5ncyBjb25uZWN0ZWQgYW5kIHNoYXJpbmcgc2NvcGVcbiAgICAgICAgICovXG4gICAgICAgICRzY29wZS5jb250ZXh0ID0gSG9tZUNvbnRleHRTZXJ2aWNlLmNvbnRleHQ7XG4gICAgfVxufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5ob21lJykuY29udHJvbGxlcignU3RhY2tDb250cm9sbGVyJywgWyckc2NvcGUnLCAnSG9tZUNvbnRleHRTZXJ2aWNlJywgU3RhY2tDb250cm9sbGVyXSk7XG5cbiAgICBmdW5jdGlvbiBTdGFja0NvbnRyb2xsZXIoJHNjb3BlLCBIb21lQ29udGV4dFNlcnZpY2UpIHtcblxuICAgICAgICAkc2NvcGUudHJhbnNsYXRpb25zLmhvbWUuc3RhY2tMaXN0ID0ge1xuICAgICAgICAgICAgdGl0bGU6IFwiU3RhY2tzXCJcbiAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogV2F5IHRvIGtlZXAgc2libGluZ3MgY29ubmVjdGVkIGFuZCBzaGFyaW5nIHNjb3BlXG4gICAgICAgICAqL1xuICAgICAgICAkc2NvcGUuY29udGV4dCA9IEhvbWVDb250ZXh0U2VydmljZS5jb250ZXh0O1xuXG4gICAgICAgICRzY29wZS5jb250ZXh0LnN0YWNrcyA9IFt7XG4gICAgICAgICAgICBpZDogMSxcbiAgICAgICAgICAgIG5hbWU6ICdVbml2ZXJzYWwnXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiAyLFxuICAgICAgICAgICAgbmFtZTogJ1NlY29uZCBzdGFjaycsXG4gICAgICAgICAgICBwYXJ0aWNpcGFudHM6IHtcbiAgICAgICAgICAgICAgICBjb3VudDogMSxcbiAgICAgICAgICAgICAgICBsaXN0OiB7XG4gICAgICAgICAgICAgICAgICAgICdKb2huIERvZSc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGltZzogJ3Byb2ZpbGUtcGljdHVyZS02MHg2MC5wbmcnXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiAzLFxuICAgICAgICAgICAgbmFtZTogJ0FuZCBzbyBvbicsXG4gICAgICAgICAgICBwYXJ0aWNpcGFudHM6IHtcbiAgICAgICAgICAgICAgICBjb3VudDogMTUsXG4gICAgICAgICAgICAgICAgbGlzdDoge1xuICAgICAgICAgICAgICAgICAgICAnSm9obiBEb2UnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbWc6ICdwcm9maWxlLXBpY3R1cmUtNjB4NjAucG5nJ1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAnQ2hhcmxlcyBEYXZpZHNvbic6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGltZzogJ3Byb2ZpbGUtcGljdHVyZS02MHg2MC5wbmcnXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICdBbGV4IFN0ZXdhcmQnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbWc6ICdwcm9maWxlLXBpY3R1cmUtNjB4NjAucG5nJ1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XTtcbiAgICB9XG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmhvbWUnKS5jb250cm9sbGVyKCdUYWdDb250cm9sbGVyJywgWyckc2NvcGUnLCAncmVkdWNlQnlGaWx0ZXInLCAnSG9tZUNvbnRleHRTZXJ2aWNlJywgVGFnQ2xvdWRDb250cm9sbGVyXSk7XG5cbiAgICBmdW5jdGlvbiBUYWdDbG91ZENvbnRyb2xsZXIoJHNjb3BlLCByZWR1Y2VCeUZpbHRlciwgSG9tZUNvbnRleHRTZXJ2aWNlKSB7XG5cbiAgICAgICAgICRzY29wZS50cmFuc2xhdGlvbnMuaG9tZS50YWdDbG91ZCA9IHtcbiAgICAgICAgICAgIHRpdGxlOiBcIkluIHRoaXMgcGFnZVwiXG4gICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdheSB0byBrZWVwIHNpYmxpbmdzIGNvbm5lY3RlZCBhbmQgc2hhcmluZyBzY29wZVxuICAgICAgICAgKi9cbiAgICAgICAgJHNjb3BlLmNvbnRleHQgPSBIb21lQ29udGV4dFNlcnZpY2UuY29udGV4dDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogS2VlcCB0cmFjayBvZiBjYXJkIGxpc3QgY2hhbmdlc1xuICAgICAgICAgKiBAcmV0dXJucyB2b2lkXG4gICAgICAgICAqL1xuICAgICAgICBmdW5jdGlvbiB1cGRhdGVUYWdDbG91ZCgpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gZXhjbHVkZSBjYXJkIHdpdGggbm8gdGFnc1xuICAgICAgICAgICAgbGV0IGNhcmRzID0gJHNjb3BlLmNvbnRleHQuZmlsdGVyZWQuZmlsdGVyKGZ1bmN0aW9uIChjYXJkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhcmQudGFncy5sZW5ndGggPiAwO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIGV4dHJhY3QgdGFncyBmcm9tIGNhcmRcbiAgICAgICAgICAgIGxldCB0YWdzID0gY2FyZHMubWFwKGZ1bmN0aW9uIChjYXJkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoYW5ndWxhci50b0pzb24oY2FyZC50YWdzKSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gbWVyZ2UgdGFncyBpbiBmbGF0dGVuIGFycmF5XG4gICAgICAgICAgICBsZXQgbWVyZ2VkID0gW10uY29uY2F0LmFwcGx5KFtdLCB0YWdzKTtcblxuICAgICAgICAgICAgLy8gZWxpbWluYXRlIGR1cGxpY2F0ZXMgYW5kIHNlcnZlIGFycmF5IHRvIHZpZXdcbiAgICAgICAgICAgICRzY29wZS5jb250ZXh0LnRhZ3MgPSByZWR1Y2VCeUZpbHRlcihtZXJnZWQsICdpZCcpO1xuICAgICAgICB9XG4gICAgICAgXG4gICAgICAgICRzY29wZS4kd2F0Y2hDb2xsZWN0aW9uKCdjb250ZXh0LmZpbHRlcmVkJywgdXBkYXRlVGFnQ2xvdWQgKTtcbiAgICB9XG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5ob21lJylcbiAgICAgICAgLmZpbHRlcignaGlnaGxpZ2h0VGV4dCcsIGZ1bmN0aW9uKCRzY2UpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAodGV4dCwgcGhyYXNlKSB7XG4gICAgICAgICAgICAgICAgbGV0IGhpZ2hsaWdodGVkID0gcGhyYXNlXG4gICAgICAgICAgICAgICAgICAgICAgICA/IHRleHQucmVwbGFjZShuZXcgUmVnRXhwKCcoJyArIHBocmFzZSArICcpJywgJ2dpJyksICc8c3BhbiBjbGFzcz1cImhpZ2hsaWdodC10ZXh0XCI+JDE8L3NwYW4+JylcbiAgICAgICAgICAgICAgICAgICAgICAgIDogdGV4dDtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHJldHVybiAkc2NlLnRydXN0QXNIdG1sKGhpZ2hsaWdodGVkKTtcbiAgICAgICAgICAgIH07ICAgICAgICAgICAgXG4gICAgICAgIH0pO1xufSkoKTtcblxuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcC5ob21lJykuc2VydmljZSgnSG9tZUNvbnRleHRTZXJ2aWNlJywgZnVuY3Rpb24oKXtcbiAgICB0aGlzLmNvbnRleHQgPSB7XG4gICAgICAgIGNhcmRzOiBbXSxcbiAgICAgICAgcXVlcnk6ICcnXG4gICAgfTtcbn0pOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
