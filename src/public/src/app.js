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
        };
        
        $scope.pinCard = function(item) {
            
            let index = $scope.context.cards.indexOf(item);
            $scope.context.cards.splice(index, 1);
            item.sticky = true;
            item.class = item.class ? item.class + " sticky" : "sticky";
            $scope.context.cards.unshift(item);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC1jb25maWcuanMiLCJjYXJkcy9tb2R1bGUuanMiLCJjb21tb24vbW9kdWxlLmpzIiwiaG9tZS9tb2R1bGUuanMiLCJjYXJkcy9jYXJkcy1yb3V0ZS5qcyIsImNvbW1vbi9hcHAtcm91dGUuanMiLCJob21lL2hvbWUtcm91dGUuanMiLCJsb2dpbi9sb2dpbi5qcyIsImNhcmRzL2NvbnRyb2xsZXJzL2NhcmRzLWNvbnRyb2xsZXIuanMiLCJjYXJkcy9zZXJ2aWNlcy9jYXJkcy1mYWN0b3J5LmpzIiwiY29tbW9uL2NvbnRyb2xsZXJzL2hlYWRlci1jb250cm9sbGVycy5qcyIsImNvbW1vbi9jb250cm9sbGVycy9sYXlvdXQtY29udHJvbGxlcnMuanMiLCJjb21tb24vZGlyZWN0aXZlcy9lbGFzdGljQXJlYS5qcyIsImNvbW1vbi9kaXJlY3RpdmVzL2hhc2h0YWdpZnkuanMiLCJjb21tb24vZGlyZWN0aXZlcy9zaG93TW9yZS5qcyIsImNvbW1vbi9maWx0ZXJzL3JlZHVjZUJ5LmpzIiwiaG9tZS9jb250cm9sbGVycy9mb3JtLWNvbnRyb2xsZXIuanMiLCJob21lL2NvbnRyb2xsZXJzL2hvbWUtY29udHJvbGxlci5qcyIsImhvbWUvY29udHJvbGxlcnMvbGlzdC1jb250cm9sbGVyLmpzIiwiaG9tZS9jb250cm9sbGVycy9zZWFyY2gtY29udHJvbGxlci5qcyIsImhvbWUvY29udHJvbGxlcnMvc3RhY2stY29udHJvbGxlci5qcyIsImhvbWUvY29udHJvbGxlcnMvdGFnLWNsb3VkLWNvbnRyb2xsZXIuanMiLCJob21lL2ZpbHRlcnMvaGlnaGxpZ2h0VGV4dC5qcyIsImhvbWUvc2VydmljZXMvaG9tZS1jb250ZXh0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFFBQUEsT0FBQSxjQUFBO0NBQ0EsU0FBQSxVQUFBO0NBQ0EsT0FBQTtDQUNBLFNBQUE7OztBQ0hBLFFBQUEsT0FBQSxhQUFBOzs7QUNBQTs7QUFFQSxRQUFBLE9BQUEsT0FBQSxDQUFBLFdBQUEsY0FBQTs7QUFFQSxRQUFBLE9BQUEsT0FBQSxPQUFBLENBQUEsaUJBQUEsVUFBQSxlQUFBOztJQUVBLGNBQUEsU0FBQSxRQUFBLFNBQUE7UUFDQSxnQkFBQTtRQUNBLFVBQUE7UUFDQSxxQkFBQTtRQUNBLG9CQUFBO1FBQ0EsZ0JBQUEsUUFBQTs7OztBQUlBLFFBQUEsT0FBQSxPQUFBLElBQUEsQ0FBQSxZQUFBOzs7O0FBSUEsUUFBQSxPQUFBLE9BQUEsU0FBQSxjQUFBOztBQ25CQSxRQUFBLE9BQUEsWUFBQSxDQUFBLFdBQUEsY0FBQSxhQUFBLGFBQUE7O0FDQUEsUUFBQSxPQUFBLGFBQUEsMEJBQUEsU0FBQSxnQkFBQTs7O0FDQUEsUUFBQSxPQUFBLE9BQUEsT0FBQSxDQUFBLGtCQUFBLFNBQUEsZ0JBQUE7O0VBRUE7S0FDQSxLQUFBLEtBQUE7UUFDQSxhQUFBO1FBQ0EsWUFBQTtRQUNBLGNBQUE7OztLQUdBLFVBQUEsQ0FBQSxZQUFBOztBQ1RBLFFBQUEsT0FBQSxZQUFBLDBCQUFBLFNBQUEsZ0JBQUE7Ozs7QUNDQSxFQUFBLFVBQUEsTUFBQSxZQUFBOzs7SUFHQSxFQUFBLGNBQUEsTUFBQSxZQUFBOztRQUVBLEVBQUEsUUFBQSxRQUFBLENBQUEsUUFBQSxVQUFBLFNBQUEsV0FBQTs7UUFFQSxHQUFBLE9BQUEsU0FBQSxZQUFBLFVBQUE7WUFDQSxRQUFBLFVBQUEsSUFBQSxZQUFBO2VBQ0E7WUFDQSxRQUFBLFVBQUEsSUFBQSxTQUFBOzs7UUFHQSxFQUFBLG9CQUFBOzs7O0FDZEEsQ0FBQSxVQUFBOzs7Ozs7Ozs7Ozs7O0lBYUEsUUFBQSxPQUFBLGFBQUEsV0FBQSxtQkFBQSxDQUFBLFVBQUEsZ0JBQUE7O0lBRUEsU0FBQSxnQkFBQSxRQUFBLGFBQUE7O1FBRUEsYUFBQSxXQUFBLEtBQUEsU0FBQSxTQUFBO1lBQ0EsT0FBQSxRQUFBLFNBQUE7OztRQUdBLGFBQUEsV0FBQTtZQUNBLE9BQUEsTUFBQSxLQUFBO2dCQUNBLFNBQUE7Z0JBQ0EsTUFBQTtvQkFDQSxjQUFBOzs7Ozs7O0FDekJBLENBQUEsWUFBQTs7SUFFQSxRQUFBLE9BQUEsYUFBQSxRQUFBLGdCQUFBLENBQUEsU0FBQSxNQUFBLFVBQUE7O0lBRUEsU0FBQSxhQUFBLE9BQUEsSUFBQSxRQUFBOztRQUVBLElBQUEsVUFBQTtRQUNBLElBQUEsV0FBQTtRQUNBLElBQUE7O1FBRUEsUUFBQSxTQUFBLFlBQUE7O1lBRUEsSUFBQSxVQUFBLEdBQUE7WUFDQSxJQUFBLFVBQUEsUUFBQTs7WUFFQSxRQUFBLE1BQUEsSUFBQSxPQUFBLE1BQUEsVUFBQSxFQUFBLE9BQUE7O1lBRUEsTUFBQSxLQUFBLFVBQUEsVUFBQTtnQkFDQSxRQUFBLFFBQUE7ZUFDQSxVQUFBLEtBQUE7Z0JBQ0EsUUFBQSxPQUFBOzs7WUFHQSxPQUFBOzs7UUFHQSxRQUFBLE9BQUEsVUFBQSxNQUFBOztZQUVBLElBQUEsVUFBQSxHQUFBO1lBQ0EsSUFBQSxVQUFBLFFBQUE7O1lBRUEsTUFBQSxLQUFBLE9BQUEsTUFBQSxVQUFBLE1BQUEsS0FBQSxVQUFBLFVBQUE7Z0JBQ0EsUUFBQSxRQUFBO2VBQ0EsVUFBQSxLQUFBO2dCQUNBLFFBQUEsT0FBQTs7O1lBR0EsT0FBQTs7O1FBR0EsUUFBQSxTQUFBLFVBQUEsSUFBQTs7WUFFQSxJQUFBLFVBQUEsR0FBQTtZQUNBLElBQUEsVUFBQSxRQUFBOztZQUVBLE1BQUEsT0FBQSxPQUFBLE1BQUEsV0FBQSxNQUFBLElBQUEsS0FBQSxVQUFBLFVBQUE7Z0JBQ0EsUUFBQSxRQUFBO2VBQ0EsVUFBQSxLQUFBO2dCQUNBLFFBQUEsT0FBQTs7O1lBR0EsT0FBQTs7O1FBR0EsT0FBQTs7Ozs7O0FDdERBLENBQUEsWUFBQTs7SUFFQSxRQUFBLE9BQUEsT0FBQSxXQUFBLG9CQUFBLENBQUEsVUFBQTs7SUFFQSxTQUFBLGlCQUFBLFFBQUE7Ozs7Ozs7QUNKQSxDQUFBLFlBQUE7O0lBRUEsUUFBQSxPQUFBLE9BQUEsV0FBQSxvQkFBQSxDQUFBLFVBQUEsUUFBQTs7SUFFQSxTQUFBLGlCQUFBLFFBQUEsTUFBQTs7UUFFQSxPQUFBLGVBQUE7WUFD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T0FBQSxhQUFBLGFBQUE7Ozs7O1FBS0EsT0FBQSxVQUFBLG1CQUFBOzs7OztRQUtBO2FBQ0E7YUFDQSxLQUFBLFVBQUEsVUFBQTs7Z0JBRUEsT0FBQSxRQUFBLFFBQUEsUUFBQSxTQUFBLFNBQUE7O2dCQUVBLE9BQUEsZUFBQTs7Z0JBRUEsT0FBQSxZQUFBOzthQUVBLE1BQUEsVUFBQSxLQUFBO2dCQUNBLFFBQUEsSUFBQTs7O1FBR0EsT0FBQSxhQUFBLFNBQUEsTUFBQTs7WUFFQSxhQUFBLE9BQUEsS0FBQSxJQUFBLEtBQUEsVUFBQTtnQkFDQSxJQUFBLFFBQUEsT0FBQSxRQUFBLE1BQUEsUUFBQTtnQkFDQSxPQUFBLFFBQUEsTUFBQSxPQUFBLE9BQUE7ZUFDQSxTQUFBLEtBQUE7Z0JBQ0EsUUFBQSxJQUFBOzs7O1FBSUEsT0FBQSxVQUFBLFNBQUEsTUFBQTs7WUFFQSxJQUFBLFFBQUEsT0FBQSxRQUFBLE1BQUEsUUFBQTtZQUNBLE9BQUEsUUFBQSxNQUFBLE9BQUEsT0FBQTtZQUNBLEtBQUEsU0FBQTtZQUNBLEtBQUEsUUFBQSxLQUFBLFFBQUEsS0FBQSxRQUFBLFlBQUE7WUFDQSxPQUFBLFFBQUEsTUFBQSxRQUFBOzs7O0FDOUNBLENBQUEsVUFBQTs7SUFFQSxRQUFBLE9BQUEsWUFBQSxXQUFBLG9CQUFBLENBQUEsVUFBQSxzQkFBQTs7SUFFQSxTQUFBLGlCQUFBLFFBQUEsbUJBQUE7O1FBRUEsT0FBQSxhQUFBLGVBQUE7Ozs7O1FBS0EsT0FBQSxVQUFBLG1CQUFBOzs7QUNYQSxDQUFBLFlBQUE7O0lBRUEsUUFBQSxPQUFBLFlBQUEsV0FBQSxtQkFBQSxDQUFBLFVBQUEsc0JBQUE7O0lBRUEsU0FBQSxnQkFBQSxRQUFBLG9CQUFBOztRQUVBLE9BQUEsYUFBQSxLQUFBLFlBQUE7WUFDQSxPQUFBOzs7Ozs7UUFNQSxPQUFBLFVBQUEsbUJBQUE7O1FBRUEsT0FBQSxRQUFBLFNBQUEsQ0FBQTtZQUNBLElBQUE7WUFDQSxNQUFBO1dBQ0E7WUFDQSxJQUFBO1lBQ0EsTUFBQTtZQUNBLGNBQUE7Z0JBQ0EsT0FBQTtnQkFDQSxNQUFBO29CQUNBLFlBQUE7d0JBQ0EsS0FBQTs7OztXQUlBO1lBQ0EsSUFBQTtZQUNBLE1BQUE7WUFDQSxjQUFBO2dCQUNBLE9BQUE7Z0JBQ0EsTUFBQTtvQkFDQSxZQUFBO3dCQUNBLEtBQUE7O29CQUVBLG9CQUFBO3dCQUNBLEtBQUE7O29CQUVBLGdCQUFBO3dCQUNBLEtBQUE7Ozs7Ozs7QUMxQ0EsQ0FBQSxZQUFBOztJQUVBLFFBQUEsT0FBQSxZQUFBLFdBQUEsaUJBQUEsQ0FBQSxVQUFBLGtCQUFBLHNCQUFBOztJQUVBLFNBQUEsbUJBQUEsUUFBQSxnQkFBQSxvQkFBQTs7U0FFQSxPQUFBLGFBQUEsS0FBQSxXQUFBO1lBQ0EsT0FBQTs7Ozs7O1FBTUEsT0FBQSxVQUFBLG1CQUFBOzs7Ozs7UUFNQSxTQUFBLGlCQUFBOzs7WUFHQSxJQUFBLFFBQUEsT0FBQSxRQUFBLFNBQUEsT0FBQSxVQUFBLE1BQUE7Z0JBQ0EsT0FBQSxLQUFBLEtBQUEsU0FBQTs7OztZQUlBLElBQUEsT0FBQSxNQUFBLElBQUEsVUFBQSxNQUFBO2dCQUNBLE9BQUEsS0FBQSxNQUFBLFFBQUEsT0FBQSxLQUFBOzs7O1lBSUEsSUFBQSxTQUFBLEdBQUEsT0FBQSxNQUFBLElBQUE7OztZQUdBLE9BQUEsUUFBQSxPQUFBLGVBQUEsUUFBQTs7O1FBR0EsT0FBQSxpQkFBQSxvQkFBQTs7O0FDdENBLENBQUEsWUFBQTtJQUNBLFFBQUEsT0FBQTtTQUNBLE9BQUEsMEJBQUEsU0FBQSxNQUFBO1lBQ0EsT0FBQSxVQUFBLE1BQUEsUUFBQTtnQkFDQSxJQUFBLGNBQUE7MEJBQ0EsS0FBQSxRQUFBLElBQUEsT0FBQSxNQUFBLFNBQUEsS0FBQSxPQUFBOzBCQUNBOztnQkFFQSxPQUFBLEtBQUEsWUFBQTs7Ozs7O0FDUkEsUUFBQSxPQUFBLFlBQUEsUUFBQSxzQkFBQSxVQUFBO0lBQ0EsS0FBQSxVQUFBO1FBQ0EsT0FBQTtRQUNBLE9BQUE7O0dBRUEiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiYW5ndWxhci5tb2R1bGUoXCJhcHAuY29uZmlnXCIsIFtdKVxuLmNvbnN0YW50KFwiY29uZmlnXCIsIHtcblx0XCJhcGlcIjogXCJodHRwOi8vbG9jYWxob3N0OjgwMDEvYXBpL3YxXCIsIFxuXHRcImRlYnVnXCI6IHRydWVcbn0pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcC5jYXJkcycsIFtdKTtcblxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5hbmd1bGFyLm1vZHVsZSgnYXBwJywgWyduZ1JvdXRlJywgJ2FwcC5jb25maWcnLCAnYXBwLmhvbWUnXSk7XG4gIFxuYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmNvbmZpZyhbJyRodHRwUHJvdmlkZXInLCBmdW5jdGlvbiAoJGh0dHBQcm92aWRlcikge1xuICAgICAgICBcbiAgICAkaHR0cFByb3ZpZGVyLmRlZmF1bHRzLmhlYWRlcnMuY29tbW9uID0geyBcbiAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uO29kYXRhPXZlcmJvc2UnLFxuICAgICAgICAnWC1Mb2dpbi1BamF4LWNhbGwnOiAndHJ1ZScsXG4gICAgICAgICdYLVJlcXVlc3RlZC1XaXRoJzogXCJYTUxIdHRwUmVxdWVzdFwiLFxuICAgICAgICAnWC1DU1JGLVRPS0VOJzogTGFyYXZlbC5jc3JmVG9rZW4sXG4gICAgICB9O1xufV0pXG4gXG5hbmd1bGFyLm1vZHVsZSgnYXBwJykucnVuKFtmdW5jdGlvbiAoKSB7XG4gXG59XSk7XG5cbmFuZ3VsYXIubW9kdWxlKCdhcHAnKS5jb25zdGFudCgnSU1HX0ZPTERFUicsICdzcmMvYXBwX21vZHVsZXMvY29tbW9uL3RlbXBsYXRlcy8nKTtcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAuaG9tZScsIFsnbmdSb3V0ZScsICdhcHAuY29uZmlnJywgJ25nQW5pbWF0ZScsICdhcHAuY2FyZHMnLCAnbmdTYW5pdGl6ZSddKTtcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAuY2FyZHMnKS5jb25maWcoZnVuY3Rpb24oJHJvdXRlUHJvdmlkZXIpIHtcbiAgIFxufSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmNvbmZpZyhbJyRyb3V0ZVByb3ZpZGVyJywgZnVuY3Rpb24oJHJvdXRlUHJvdmlkZXIpIHtcbiAgICBcbiAgJHJvdXRlUHJvdmlkZXJcbiAgICAud2hlbignLycsIHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdzcmMvYXBwX21vZHVsZXMvaG9tZS90ZW1wbGF0ZXMvaG9tZS10ZW1wbGF0ZS5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0hvbWVDb250cm9sbGVyJyxcbiAgICAgICAgY29udHJvbGxlckFzOiAnaG9tZSdcbiAgICB9KVxuICAgIFxuICAgIC5vdGhlcndpc2Uoe3JlZGlyZWN0VG86ICcvJ30pOyBcbn1dKTsiLCJhbmd1bGFyLm1vZHVsZSgnYXBwLmhvbWUnKS5jb25maWcoZnVuY3Rpb24oJHJvdXRlUHJvdmlkZXIpIHtcblxufSk7IiwiXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XG5cbiAgICAvLyBzd2l0Y2ggZm9ybXNcbiAgICAkKCcubWVzc2FnZSBhJykuY2xpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICBcbiAgICAgICAgJCgnZm9ybScpLmFuaW1hdGUoe2hlaWdodDogXCJ0b2dnbGVcIiwgb3BhY2l0eTogXCJ0b2dnbGVcIn0sIFwic2xvd1wiKTtcbiAgICAgICAgXG4gICAgICAgIGlmKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSA9PSAnL2xvZ2luJykge1xuICAgICAgICAgICAgaGlzdG9yeS5wdXNoU3RhdGUoe30sIFwiUmVnaXN0ZXJcIiwgXCIvcmVnaXN0ZXJcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBoaXN0b3J5LnB1c2hTdGF0ZSh7fSwgXCJMb2dpblwiLCBcIi9sb2dpblwiKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgJCgnZm9ybSAuaGVscC1ibG9jaycpLmhpZGUoKTtcbiAgICB9KTtcblxufSk7IiwiKGZ1bmN0aW9uKCl7XG4gICAgICAgIFxuICAgIC8qKlxuICAgICAqIEZZSSwgY2FyZHMgbXVzdCBoYXZlIHRoaXMgYmFzaWMgc3RydWN0dXJlXG4gICAgICoge1xuICAgICAqICAgICAgXCJpZFwiOiAxLFxuICAgICAgICAgICAgXCJuYW1lXCI6IFwiQXV0IG1vZGkgcXVhc2kgY29ycnVwdGkgdmVyaXRhdGlzIHN1bnQgZG9sb3JlLlwiLFxuICAgICAgICAgICAgY29udGVudDpcIkxvcmVtIElwc3VtIGRvbG9yIGVzdCAjaW1wb3J0YW50LiAjbXl0YWdcIixcbiAgICAgICAgICAgIHRhZ3M6IFtcbiAgICAgICAgICAgICAgICBcIm15dGFnXCIsIFwiaW1wb3J0YW50XCJcbiAgICAgICAgICAgIF1cbiAgICAgICAgfVxuICAgICovXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5jYXJkcycpLmNvbnRyb2xsZXIoJ0NhcmRzQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJ2NhcmRzRmFjdG9yeScsIENhcmRzQ29udHJvbGxlcl0pO1xuXG4gICAgZnVuY3Rpb24gQ2FyZHNDb250cm9sbGVyKCRzY29wZSwgY2FyZHNGYWN0b3J5KXtcbiAgICAgICAgXG4gICAgICAgIGNhcmRzRmFjdG9yeS5nZXRDYXJkcygpLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpeyAgICAgICBcbiAgICAgICAgICAgICRzY29wZS5jYXJkcyA9IHJlc3BvbnNlLmRhdGE7XG4gICAgICAgIH0pOyAgICBcblxuICAgICAgICBjcmVhdGVDYXJkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAkc2NvcGUuY2FyZHMucHVzaCh7XG4gICAgICAgICAgICAgICAgY29udGVudDogXCJSZW5vbWJyYXIgcHJveWVjdG8gYSBjYXJkcy4gI2NvcmVjaGFuZ2VcIixcbiAgICAgICAgICAgICAgICB0YWdzOiBbXG4gICAgICAgICAgICAgICAgICAgIFwiY29yZWNoYW5nZVwiLCBcImltcG9ydGFudFwiXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgfVxufSkoKTtcbiIsIihmdW5jdGlvbiAoKSB7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmNhcmRzJykuZmFjdG9yeSgnY2FyZHNGYWN0b3J5JywgWyckaHR0cCcsICckcScsICdjb25maWcnLCBjYXJkc0ZhY3RvcnldKTtcblxuICAgIGZ1bmN0aW9uIGNhcmRzRmFjdG9yeSgkaHR0cCwgJHEsIGNvbmZpZykge1xuXG4gICAgICAgIHZhciBmYWN0b3J5ID0ge307XG4gICAgICAgIHZhciBlbmRwb2ludCA9IFwiL2NhcmRzXCI7XG4gICAgICAgIHZhciBjYXJkcztcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgZmFjdG9yeS5nZXRBbGwgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIHZhciBkZWZlcmVkID0gJHEuZGVmZXIoKTtcbiAgICAgICAgICAgIHZhciBwcm9taXNlID0gZGVmZXJlZC5wcm9taXNlO1xuXG4gICAgICAgICAgICBjYXJkcyA9ICRodHRwLmdldChjb25maWcuYXBpICsgZW5kcG9pbnQsIHsgY2FjaGU6IHRydWV9KTsgLy8gZ2V0IGxpc3RcblxuICAgICAgICAgICAgY2FyZHMudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICBkZWZlcmVkLnJlc29sdmUocmVzcG9uc2UpO1xuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgIGRlZmVyZWQucmVqZWN0KGVycik7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgICAgIH07XG5cbiAgICAgICAgZmFjdG9yeS5zYXZlID0gZnVuY3Rpb24gKGRhdGEpIHtcblxuICAgICAgICAgICAgdmFyIGRlZmVyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgICAgICAgdmFyIHByb21pc2UgPSBkZWZlcmVkLnByb21pc2U7XG5cbiAgICAgICAgICAgICRodHRwLnBvc3QoY29uZmlnLmFwaSArIGVuZHBvaW50LCBkYXRhKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIGRlZmVyZWQucmVzb2x2ZShyZXNwb25zZSk7XG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgZGVmZXJlZC5yZWplY3QoZXJyKTtcbiAgICAgICAgICAgIH0pO1xuIFxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgICAgIH1cblxuICAgICAgICBmYWN0b3J5LmRlbGV0ZSA9IGZ1bmN0aW9uIChpZCkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgZGVmZXJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICAgICAgICB2YXIgcHJvbWlzZSA9IGRlZmVyZWQucHJvbWlzZTtcblxuICAgICAgICAgICAgJGh0dHAuZGVsZXRlKGNvbmZpZy5hcGkgKyBlbmRwb2ludCArICcvJyArIGlkKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIGRlZmVyZWQucmVzb2x2ZShyZXNwb25zZSk7XG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgZGVmZXJlZC5yZWplY3QoZXJyKTtcbiAgICAgICAgICAgIH0pO1xuIFxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFjdG9yeTtcbiAgICB9XG5cbn0pKCk7XG5cbiIsIihmdW5jdGlvbiAoKSB7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwJykuY29udHJvbGxlcignSGVhZGVyQ29udHJvbGxlcicsIFsnJHNjb3BlJywgSGVhZGVyQ29udHJvbGxlcl0pO1xuXG4gICAgZnVuY3Rpb24gSGVhZGVyQ29udHJvbGxlcigkc2NvcGUpIHtcbiAgICAgICAgXG4gICAgfVxufSkoKTtcblxuXG4iLCIoZnVuY3Rpb24gKCkge1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmNvbnRyb2xsZXIoJ0xheW91dENvbnRyb2xsZXInLCBbJyRzY29wZScsICckc2NlJywgTGF5b3V0Q29udHJvbGxlcl0pO1xuXG4gICAgZnVuY3Rpb24gTGF5b3V0Q29udHJvbGxlcigkc2NvcGUsICRzY2UpIHtcblxuICAgICAgICAkc2NvcGUudHJhbnNsYXRpb25zID0ge1xuICAgICAgICAgICAgc3VidGl0bGU6ICdTaW1wbHkgaGFzaCB5b3VyIG5vdGVzIGFuZCBuYXZpZ2F0ZSB0aGVtJ1xuICAgICAgICB9OyAgICAgICAgICAgIFxuICAgICAgICBcbiAgICAgICAgJHNjb3BlLnRhZ1VzZXJDbGljayA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHZhciB0YWdUZXh0ID0gZS50YXJnZXQuaW5uZXJUZXh0O1xuICAgICAgICAgICAgYWxlcnQoJ3RhZ1VzZXJDbGljaywgdGFnVGV4dDogJyArIHRhZ1RleHQpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgJHNjb3BlLnRhZ1Rlcm1DbGljayA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHZhciB0YWdUZXh0ID0gZS50YXJnZXQuaW5uZXJUZXh0O1xuICAgICAgICAgICAgYWxlcnQoJ3RhZ1Rlcm1DbGljaywgdGFnVGV4dDogJyArIHRhZ1RleHQpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLy8gWW91IGNvdWxkIGRlZmluZSAndGFnVXNlckNsaWNrJyBhbmQgJ3RhZ1Rlcm1DbGljaydcbiAgICAgICAgLy8gb24gdGhlICckcm9vdFNjb3BlJy4gVGhpcyB3YXkgeW91IGNhbiBoYW5kbGUgd2hhdGV2ZXJcbiAgICAgICAgLy8gbG9naWMgeW91IHdhbnQgZm9yIGhhc2h0YWdzIGluIG9uZSBwbGFjZSByYXRoZXIgdGhhblxuICAgICAgICAvLyBoYXZpbmcgdG8gZGVmaW5lIGl0IGluIGVhY2ggY29udHJvbGxlci5cbiAgICAgICAgXG4gICAgICAgICRzY29wZS50cnVzdEh0bWwgPSBmdW5jdGlvbihodG1sKSB7XG4gICAgICAgICAgICAvLyBTYW5pdGl6ZSBtYW51YWxseSBpZiBuZWNlc3NhcnkuIEl0J3MgbGlrZWx5IHRoaXNcbiAgICAgICAgICAgIC8vIGh0bWwgaGFzIGFscmVhZHkgYmVlbiBzYW5pdGl6ZWQgc2VydmVyIHNpZGVcbiAgICAgICAgICAgIC8vIGJlZm9yZSBpdCB3ZW50IGludG8geW91ciBkYXRhYmFzZS5cbiAgICAgICAgICAgIC8vIERvbid0IGhvbGQgbWUgbGlhYmxlIGZvciBYU1MuLi4gbmV2ZXIgYXNzdW1lIDp+KVxuICAgICAgICAgICAgcmV0dXJuICRzY2UudHJ1c3RBc0h0bWwoaHRtbCk7XG4gICAgICAgIH07XG4gICAgfVxufSkoKTtcblxuXG4iLCIoZnVuY3Rpb24gKCkge1xuICAgIC8vIEJlY2F1c2Ugb2YgdGhlIGFubWUgYW5kIEUgdHlwZSwgd29ya3MgYXV0b21hdGljYWxseSBmb3IgZXZlcnkgdGV4dGFyZWFcbiAgICAvLyByZWY6IGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL3Rob21zZWRkb24vNDcwMzk2OFxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAnKS5kaXJlY3RpdmUoJ3RleHRhcmVhJywgZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cmlidXRlcykge1xuICAgICAgICAgICAgICAgIHZhciB0aHJlc2hvbGQgPSAzNSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbkhlaWdodCA9IGVsZW1lbnRbMF0ub2Zmc2V0SGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZ0xlZnQgPSBlbGVtZW50LmNzcygncGFkZGluZ0xlZnQnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmdSaWdodCA9IGVsZW1lbnQuY3NzKCdwYWRkaW5nUmlnaHQnKTtcblxuICAgICAgICAgICAgICAgIHZhciAkc2hhZG93ID0gYW5ndWxhci5lbGVtZW50KCc8ZGl2PjwvZGl2PicpLmNzcyh7XG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgICAgICAgICAgICAgICB0b3A6IC0xMDAwMCxcbiAgICAgICAgICAgICAgICAgICAgbGVmdDogLTEwMDAwLFxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogZWxlbWVudFswXS5vZmZzZXRXaWR0aCAtIHBhcnNlSW50KHBhZGRpbmdMZWZ0IHx8IDApIC0gcGFyc2VJbnQocGFkZGluZ1JpZ2h0IHx8IDApLFxuICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogZWxlbWVudC5jc3MoJ2ZvbnRTaXplJyksXG4gICAgICAgICAgICAgICAgICAgIGZvbnRGYW1pbHk6IGVsZW1lbnQuY3NzKCdmb250RmFtaWx5JyksXG4gICAgICAgICAgICAgICAgICAgIGxpbmVIZWlnaHQ6IGVsZW1lbnQuY3NzKCdsaW5lSGVpZ2h0JyksXG4gICAgICAgICAgICAgICAgICAgIHJlc2l6ZTogJ25vbmUnXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuYm9keSkuYXBwZW5kKCRzaGFkb3cpO1xuXG4gICAgICAgICAgICAgICAgdmFyIHVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRpbWVzID0gZnVuY3Rpb24gKHN0cmluZywgbnVtYmVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgciA9ICcnOyBpIDwgbnVtYmVyOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByICs9IHN0cmluZztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHZhbCA9IGVsZW1lbnQudmFsKCkucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8mL2csICcmYW1wOycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcbiQvLCAnPGJyLz4mbmJzcDsnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXG4vZywgJzxici8+JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxzezIsfS9nLCBmdW5jdGlvbiAoc3BhY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRpbWVzKCcmbmJzcDsnLCBzcGFjZS5sZW5ndGggLSAxKSArICcgJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAkc2hhZG93Lmh0bWwodmFsKTtcblxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmNzcygnaGVpZ2h0JywgTWF0aC5tYXgoJHNoYWRvd1swXS5vZmZzZXRIZWlnaHQgKyB0aHJlc2hvbGQsIG1pbkhlaWdodCkpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICRzaGFkb3cucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBlbGVtZW50LmJpbmQoJ2tleXVwIGtleWRvd24ga2V5cHJlc3MgY2hhbmdlJywgdXBkYXRlKTtcbiAgICAgICAgICAgICAgICB1cGRhdGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xufSkoKTsiLCIoZnVuY3Rpb24gKCkgeyBcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwJykuZGlyZWN0aXZlKCdoYXNodGFnaWZ5JywgWyckdGltZW91dCcsICckY29tcGlsZScsXG4gICAgICAgIGZ1bmN0aW9uKCR0aW1lb3V0LCAkY29tcGlsZSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICByZXN0cmljdDogJ0EnLFxuICAgICAgICAgICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICAgICAgICAgIHVDbGljazogJyZ1c2VyQ2xpY2snLFxuICAgICAgICAgICAgICAgICAgICB0Q2xpY2s6ICcmdGVybUNsaWNrJ1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGh0bWwgPSBlbGVtZW50Lmh0bWwoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGh0bWwgPT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXR0cnMudXNlckNsaWNrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaHRtbCA9IGh0bWwucmVwbGFjZSgvKHxcXHMpKkAoXFx3KykvZywgJyQxPGEgbmctY2xpY2s9XCJ1Q2xpY2soeyRldmVudDogJGV2ZW50fSlcIiBjbGFzcz1cImhhc2h0YWdcIj5AJDI8L2E+Jyk7IFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXR0cnMudGVybUNsaWNrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaHRtbCA9IGh0bWwucmVwbGFjZSgvKF58XFxzKSojKFxcdyspL2csICckMTxhIG5nLWNsaWNrPVwidENsaWNrKHskZXZlbnQ6ICRldmVudH0pXCIgY2xhc3M9XCJoYXNodGFnXCI+IyQyPC9hPicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50Lmh0bWwoaHRtbCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICRjb21waWxlKGVsZW1lbnQuY29udGVudHMoKSkoc2NvcGUpO1xuICAgICAgICAgICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgXSk7XG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwJykuZGlyZWN0aXZlKCdzaG93TW9yZScsXG4gICAgICAgICAgICBmdW5jdGlvbiAoSU1HX0ZPTERFUikge1xuICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IElNR19GT0xERVIgKyAnc2hvd01vcmUuaHRtbCcsXG4gICAgICAgICAgICAgICAgICAgIHJlc3RyaWN0OiAnQScsXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAnc2hvd01vcmVIZWlnaHQnOiAnQCdcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogWyckc2NvcGUnLCAnJGVsZW1lbnQnLCAnJGludGVydmFsJywgZnVuY3Rpb24gKCRzY29wZSwgJGVsZW1lbnQsICRpbnRlcnZhbCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmV4cGFuZGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJGludGVydmFsKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVuZGVyU3R5bGVzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgMzAwKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5leHBhbmRhYmxlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gcmVuZGVyU3R5bGVzKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoJGVsZW1lbnQuaGVpZ2h0KCkgPj0gJHNjb3BlLnNob3dNb3JlSGVpZ2h0ICYmICRzY29wZS5leHBhbmRlZCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5leHBhbmRhYmxlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5zaG93TGVzc1N0eWxlID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnbWF4LWhlaWdodCc6ICRzY29wZS5zaG93TW9yZUhlaWdodCArICdweCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdvdmVyZmxvdyc6ICdoaWRkZW4nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSk7XG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcCcpXG4gICAgICAgIC5maWx0ZXIoJ3JlZHVjZUJ5JywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGNvbGxlY3Rpb24sIGZpZWxkKSB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbGxlY3Rpb24ucmVkdWNlKGZ1bmN0aW9uKG91dHB1dCwgY3VycmVudCl7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZighZmllbGRFeGlzdHMob3V0cHV0LCBmaWVsZCwgY3VycmVudFtmaWVsZF0pKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBvdXRwdXQuY29uY2F0KGN1cnJlbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICAgICAgICAgICAgICAgICAgfSwgW10pO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBmaWVsZEV4aXN0cyhoYXlzdGFjaywgZmllbGROYW1lLCBmaWVsZFZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBoYXlzdGFjay5zb21lKGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVsW2ZpZWxkTmFtZV0gPT09IGZpZWxkVmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIH0pOyBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9OyAgICAgICAgICAgIFxuICAgICAgICB9KTtcbn0pKCk7XG5cbiIsIihmdW5jdGlvbigpe1xuICAgIFxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuaG9tZScpLmNvbnRyb2xsZXIoJ0Zvcm1Db250cm9sbGVyJywgWyckc2NvcGUnLCAnY2FyZHNGYWN0b3J5JywgJ0hvbWVDb250ZXh0U2VydmljZScsIEZvcm1Db250cm9sbGVyXSk7XG4gICAgXG4gICAgZnVuY3Rpb24gRm9ybUNvbnRyb2xsZXIoJHNjb3BlLCBjYXJkc0ZhY3RvcnksIEhvbWVDb250ZXh0U2VydmljZSkge1xuICAgICAgICBcbiAgICAgICAgJHNjb3BlLnRyYW5zbGF0aW9ucy53cml0ZV9zb21ldGhpbmcgPSBcIldyaXRlIHNvbWV0aGluZyBhbmQgaGFzaCBpdC4uLlwiO1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdheSB0byBrZWVwIHNpYmxpbmdzIGNvbm5lY3RlZCBhbmQgc2hhcmluZyBzY29wZVxuICAgICAgICAgKi9cbiAgICAgICAgJHNjb3BlLmNvbnRleHQgPSBIb21lQ29udGV4dFNlcnZpY2UuY29udGV4dDtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTdWJtaXQgZm9ybVxuICAgICAgICAgKiBAcmV0dXJucyB2b2lkXG4gICAgICAgICAqL1xuICAgICAgICAkc2NvcGUuY3JlYXRlQ2FyZCA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgaWYgKCRzY29wZS5jb250ZW50KSB7XG5cbiAgICAgICAgICAgICAgICBsZXQgZGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJHNjb3BlLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6ICRzY29wZS5jb250ZW50XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIGNhcmRzRmFjdG9yeS5zYXZlKGRhdGEpLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGEuY2xhc3MgPSAnaGlnaGxpZ2h0ZWQnO1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuY29udGV4dC5jYXJkcy5wdXNoKGRhdGEpO1xuICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgICAgICRzY29wZS5jb250ZW50ID0gJyc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5ob21lJykuY29udHJvbGxlcignSG9tZUNvbnRyb2xsZXInLCBbJyRzY29wZScsIEhvbWVDb250cm9sbGVyXSk7XG5cbiAgICBmdW5jdGlvbiBIb21lQ29udHJvbGxlcigkc2NvcGUpIHtcblxuICAgICAgICAkc2NvcGUudHJhbnNsYXRpb25zID0ge1xuICAgICAgICAgICAgaG9tZToge31cbiAgICAgICAgfTsgICAgICAgICAgICBcbiAgICB9XG59KSgpO1xuXG5cbiIsIihmdW5jdGlvbigpe1xuICAgIFxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuaG9tZScpLmNvbnRyb2xsZXIoJ0xpc3RDb250cm9sbGVyJywgWyckc2NvcGUnLCAnY2FyZHNGYWN0b3J5JywgJ0hvbWVDb250ZXh0U2VydmljZScsIExpc3RDb250cm9sbGVyXSk7XG4gICAgXG4gICAgZnVuY3Rpb24gTGlzdENvbnRyb2xsZXIoJHNjb3BlLCBjYXJkc0ZhY3RvcnksIEhvbWVDb250ZXh0U2VydmljZSl7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICRzY29wZS50cmFuc2xhdGlvbnMubm9fcmVzdWx0cyA9IFwiTm8gcmVzdWx0c1wiOyAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogV2F5IHRvIGtlZXAgc2libGluZ3MgY29ubmVjdGVkIGFuZCBzaGFyaW5nIHNjb3BlXG4gICAgICAgICAqL1xuICAgICAgICAkc2NvcGUuY29udGV4dCA9IEhvbWVDb250ZXh0U2VydmljZS5jb250ZXh0O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEdldCBjYXJkcyBsaXN0XG4gICAgICAgICAqL1xuICAgICAgICBjYXJkc0ZhY3RvcnlcbiAgICAgICAgICAgIC5nZXRBbGwoKVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG5cbiAgICAgICAgICAgICAgICAkc2NvcGUuY29udGV4dC5jYXJkcyA9IGFuZ3VsYXIuZnJvbUpzb24ocmVzcG9uc2UuZGF0YSk7XG5cbiAgICAgICAgICAgICAgICAkc2NvcGUub3JkZXJDYXJkc0J5ID0gJ3VwZGF0ZWRfYXQnO1xuXG4gICAgICAgICAgICAgICAgJHNjb3BlLmRpcmVjdGlvbiA9ICdyZXZlcnNlJztcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7IC8vIFRPRE86IFRyYXRhciBlbCBlcnJvclxuICAgICAgICAgICAgfSk7ICBcbiAgICAgICAgICAgIFxuICAgICAgICAkc2NvcGUuZGVsZXRlQ2FyZCA9IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY2FyZHNGYWN0b3J5LmRlbGV0ZShpdGVtLmlkKS50aGVuKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgbGV0IGluZGV4ID0gJHNjb3BlLmNvbnRleHQuY2FyZHMuaW5kZXhPZihpdGVtKTtcbiAgICAgICAgICAgICAgICAkc2NvcGUuY29udGV4dC5jYXJkcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgJHNjb3BlLnBpbkNhcmQgPSBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGxldCBpbmRleCA9ICRzY29wZS5jb250ZXh0LmNhcmRzLmluZGV4T2YoaXRlbSk7XG4gICAgICAgICAgICAkc2NvcGUuY29udGV4dC5jYXJkcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgaXRlbS5zdGlja3kgPSB0cnVlO1xuICAgICAgICAgICAgaXRlbS5jbGFzcyA9IGl0ZW0uY2xhc3MgPyBpdGVtLmNsYXNzICsgXCIgc3RpY2t5XCIgOiBcInN0aWNreVwiO1xuICAgICAgICAgICAgJHNjb3BlLmNvbnRleHQuY2FyZHMudW5zaGlmdChpdGVtKTtcbiAgICAgICAgfTsgICAgICAgIFxuICAgIH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCl7XG4gICAgXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5ob21lJykuY29udHJvbGxlcignU2VhcmNoQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJ0hvbWVDb250ZXh0U2VydmljZScsIFNlYXJjaENvbnRyb2xsZXJdKTtcbiAgICBcbiAgICBmdW5jdGlvbiBTZWFyY2hDb250cm9sbGVyKCRzY29wZSwgSG9tZUNvbnRleHRTZXJ2aWNlKXtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgJHNjb3BlLnRyYW5zbGF0aW9ucy5xdWlja19zZWFyY2ggPSBcIlF1aWNrIFNlYXJjaC4uLlwiOyAgICBcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBXYXkgdG8ga2VlcCBzaWJsaW5ncyBjb25uZWN0ZWQgYW5kIHNoYXJpbmcgc2NvcGVcbiAgICAgICAgICovXG4gICAgICAgICRzY29wZS5jb250ZXh0ID0gSG9tZUNvbnRleHRTZXJ2aWNlLmNvbnRleHQ7XG4gICAgfVxufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5ob21lJykuY29udHJvbGxlcignU3RhY2tDb250cm9sbGVyJywgWyckc2NvcGUnLCAnSG9tZUNvbnRleHRTZXJ2aWNlJywgU3RhY2tDb250cm9sbGVyXSk7XG5cbiAgICBmdW5jdGlvbiBTdGFja0NvbnRyb2xsZXIoJHNjb3BlLCBIb21lQ29udGV4dFNlcnZpY2UpIHtcblxuICAgICAgICAkc2NvcGUudHJhbnNsYXRpb25zLmhvbWUuc3RhY2tMaXN0ID0ge1xuICAgICAgICAgICAgdGl0bGU6IFwiU3RhY2tzXCJcbiAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogV2F5IHRvIGtlZXAgc2libGluZ3MgY29ubmVjdGVkIGFuZCBzaGFyaW5nIHNjb3BlXG4gICAgICAgICAqL1xuICAgICAgICAkc2NvcGUuY29udGV4dCA9IEhvbWVDb250ZXh0U2VydmljZS5jb250ZXh0O1xuXG4gICAgICAgICRzY29wZS5jb250ZXh0LnN0YWNrcyA9IFt7XG4gICAgICAgICAgICBpZDogMSxcbiAgICAgICAgICAgIG5hbWU6ICdVbml2ZXJzYWwnXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiAyLFxuICAgICAgICAgICAgbmFtZTogJ1NlY29uZCBzdGFjaycsXG4gICAgICAgICAgICBwYXJ0aWNpcGFudHM6IHtcbiAgICAgICAgICAgICAgICBjb3VudDogMSxcbiAgICAgICAgICAgICAgICBsaXN0OiB7XG4gICAgICAgICAgICAgICAgICAgICdKb2huIERvZSc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGltZzogJ3Byb2ZpbGUtcGljdHVyZS02MHg2MC5wbmcnXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiAzLFxuICAgICAgICAgICAgbmFtZTogJ0FuZCBzbyBvbicsXG4gICAgICAgICAgICBwYXJ0aWNpcGFudHM6IHtcbiAgICAgICAgICAgICAgICBjb3VudDogMTUsXG4gICAgICAgICAgICAgICAgbGlzdDoge1xuICAgICAgICAgICAgICAgICAgICAnSm9obiBEb2UnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbWc6ICdwcm9maWxlLXBpY3R1cmUtNjB4NjAucG5nJ1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAnQ2hhcmxlcyBEYXZpZHNvbic6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGltZzogJ3Byb2ZpbGUtcGljdHVyZS02MHg2MC5wbmcnXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICdBbGV4IFN0ZXdhcmQnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbWc6ICdwcm9maWxlLXBpY3R1cmUtNjB4NjAucG5nJ1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XTtcbiAgICB9XG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmhvbWUnKS5jb250cm9sbGVyKCdUYWdDb250cm9sbGVyJywgWyckc2NvcGUnLCAncmVkdWNlQnlGaWx0ZXInLCAnSG9tZUNvbnRleHRTZXJ2aWNlJywgVGFnQ2xvdWRDb250cm9sbGVyXSk7XG5cbiAgICBmdW5jdGlvbiBUYWdDbG91ZENvbnRyb2xsZXIoJHNjb3BlLCByZWR1Y2VCeUZpbHRlciwgSG9tZUNvbnRleHRTZXJ2aWNlKSB7XG5cbiAgICAgICAgICRzY29wZS50cmFuc2xhdGlvbnMuaG9tZS50YWdDbG91ZCA9IHtcbiAgICAgICAgICAgIHRpdGxlOiBcIkluIHRoaXMgcGFnZVwiXG4gICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdheSB0byBrZWVwIHNpYmxpbmdzIGNvbm5lY3RlZCBhbmQgc2hhcmluZyBzY29wZVxuICAgICAgICAgKi9cbiAgICAgICAgJHNjb3BlLmNvbnRleHQgPSBIb21lQ29udGV4dFNlcnZpY2UuY29udGV4dDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogS2VlcCB0cmFjayBvZiBjYXJkIGxpc3QgY2hhbmdlc1xuICAgICAgICAgKiBAcmV0dXJucyB2b2lkXG4gICAgICAgICAqL1xuICAgICAgICBmdW5jdGlvbiB1cGRhdGVUYWdDbG91ZCgpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gZXhjbHVkZSBjYXJkIHdpdGggbm8gdGFnc1xuICAgICAgICAgICAgbGV0IGNhcmRzID0gJHNjb3BlLmNvbnRleHQuZmlsdGVyZWQuZmlsdGVyKGZ1bmN0aW9uIChjYXJkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhcmQudGFncy5sZW5ndGggPiAwO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIGV4dHJhY3QgdGFncyBmcm9tIGNhcmRcbiAgICAgICAgICAgIGxldCB0YWdzID0gY2FyZHMubWFwKGZ1bmN0aW9uIChjYXJkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoYW5ndWxhci50b0pzb24oY2FyZC50YWdzKSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gbWVyZ2UgdGFncyBpbiBmbGF0dGVuIGFycmF5XG4gICAgICAgICAgICBsZXQgbWVyZ2VkID0gW10uY29uY2F0LmFwcGx5KFtdLCB0YWdzKTtcblxuICAgICAgICAgICAgLy8gZWxpbWluYXRlIGR1cGxpY2F0ZXMgYW5kIHNlcnZlIGFycmF5IHRvIHZpZXdcbiAgICAgICAgICAgICRzY29wZS5jb250ZXh0LnRhZ3MgPSByZWR1Y2VCeUZpbHRlcihtZXJnZWQsICdpZCcpO1xuICAgICAgICB9XG4gICAgICAgXG4gICAgICAgICRzY29wZS4kd2F0Y2hDb2xsZWN0aW9uKCdjb250ZXh0LmZpbHRlcmVkJywgdXBkYXRlVGFnQ2xvdWQgKTtcbiAgICB9XG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5ob21lJylcbiAgICAgICAgLmZpbHRlcignaGlnaGxpZ2h0VGV4dCcsIGZ1bmN0aW9uKCRzY2UpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAodGV4dCwgcGhyYXNlKSB7XG4gICAgICAgICAgICAgICAgbGV0IGhpZ2hsaWdodGVkID0gcGhyYXNlXG4gICAgICAgICAgICAgICAgICAgICAgICA/IHRleHQucmVwbGFjZShuZXcgUmVnRXhwKCcoJyArIHBocmFzZSArICcpJywgJ2dpJyksICc8c3BhbiBjbGFzcz1cImhpZ2hsaWdodC10ZXh0XCI+JDE8L3NwYW4+JylcbiAgICAgICAgICAgICAgICAgICAgICAgIDogdGV4dDtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHJldHVybiAkc2NlLnRydXN0QXNIdG1sKGhpZ2hsaWdodGVkKTtcbiAgICAgICAgICAgIH07ICAgICAgICAgICAgXG4gICAgICAgIH0pO1xufSkoKTtcblxuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcC5ob21lJykuc2VydmljZSgnSG9tZUNvbnRleHRTZXJ2aWNlJywgZnVuY3Rpb24oKXtcbiAgICB0aGlzLmNvbnRleHQgPSB7XG4gICAgICAgIGNhcmRzOiBbXSxcbiAgICAgICAgcXVlcnk6ICcnXG4gICAgfTtcbn0pOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
