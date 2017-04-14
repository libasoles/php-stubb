angular.module("app.config", [])
.constant("config", {
	"api": "http://localhost:8001/api/v1", 
	"debug": true
});

angular.module('app.cards', []);


'use strict';

angular.module('app', ['ngRoute', 'app.config', 'app.home']);
  
angular.module('app').config([function () {
    //Bloque config para configurar el resto de cosas que no son las rutas.
}])
 
angular.module('app').run([function () {
 
 
}]);
angular.module('app.home', ['ngRoute', 'app.config', 'ngAnimate', 'app.cards']);

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
         * Autoexpand form
         * @param event e
         * @returns void
         */
        $scope.autoExpand = function(e) {
            var element = typeof e === 'object' ? e.target : document.getElementById(e);
                    var scrollHeight = element.scrollHeight 
            element.style.height =  scrollHeight + "px";    
        };
        
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC1jb25maWcuanMiLCJjYXJkcy9tb2R1bGUuanMiLCJjb21tb24vbW9kdWxlLmpzIiwiaG9tZS9tb2R1bGUuanMiLCJjYXJkcy9jYXJkcy1yb3V0ZS5qcyIsImNvbW1vbi9hcHAtcm91dGUuanMiLCJob21lL2hvbWUtcm91dGUuanMiLCJsb2dpbi9sb2dpbi5qcyIsImNhcmRzL2NvbnRyb2xsZXJzL2NhcmRzLWNvbnRyb2xsZXIuanMiLCJjYXJkcy9zZXJ2aWNlcy9jYXJkcy1mYWN0b3J5LmpzIiwiY29tbW9uL2NvbnRyb2xsZXJzL2hlYWRlci1jb250cm9sbGVycy5qcyIsImNvbW1vbi9jb250cm9sbGVycy9sYXlvdXQtY29udHJvbGxlcnMuanMiLCJjb21tb24vZGlyZWN0aXZlcy9oYXNodGFnaWZ5LmpzIiwiY29tbW9uL2ZpbHRlcnMvcmVkdWNlQnkuanMiLCJob21lL2NvbnRyb2xsZXJzL2Zvcm0tY29udHJvbGxlci5qcyIsImhvbWUvY29udHJvbGxlcnMvaG9tZS1jb250cm9sbGVyLmpzIiwiaG9tZS9jb250cm9sbGVycy9saXN0LWNvbnRyb2xsZXIuanMiLCJob21lL2NvbnRyb2xsZXJzL3NlYXJjaC1jb250cm9sbGVyLmpzIiwiaG9tZS9jb250cm9sbGVycy9zdGFjay1jb250cm9sbGVyLmpzIiwiaG9tZS9jb250cm9sbGVycy90YWctY2xvdWQtY29udHJvbGxlci5qcyIsImhvbWUvZmlsdGVycy9oaWdobGlnaHRUZXh0LmpzIiwiaG9tZS9zZXJ2aWNlcy9ob21lLWNvbnRleHQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsUUFBQSxPQUFBLGNBQUE7Q0FDQSxTQUFBLFVBQUE7Q0FDQSxPQUFBO0NBQ0EsU0FBQTs7O0FDSEEsUUFBQSxPQUFBLGFBQUE7OztBQ0FBOztBQUVBLFFBQUEsT0FBQSxPQUFBLENBQUEsV0FBQSxjQUFBOztBQUVBLFFBQUEsT0FBQSxPQUFBLE9BQUEsQ0FBQSxZQUFBOzs7O0FBSUEsUUFBQSxPQUFBLE9BQUEsSUFBQSxDQUFBLFlBQUE7Ozs7QUNSQSxRQUFBLE9BQUEsWUFBQSxDQUFBLFdBQUEsY0FBQSxhQUFBOztBQ0FBLFFBQUEsT0FBQSxhQUFBLDBCQUFBLFNBQUEsZ0JBQUE7OztBQ0FBLFFBQUEsT0FBQSxPQUFBLE9BQUEsQ0FBQSxrQkFBQSxTQUFBLGdCQUFBOztFQUVBO0tBQ0EsS0FBQSxLQUFBO1FBQ0EsYUFBQTtRQUNBLFlBQUE7UUFDQSxjQUFBOzs7S0FHQSxVQUFBLENBQUEsWUFBQTs7QUNUQSxRQUFBLE9BQUEsWUFBQSwwQkFBQSxTQUFBLGdCQUFBOzs7O0FDQ0EsRUFBQSxVQUFBLE1BQUEsWUFBQTs7O0lBR0EsRUFBQSxjQUFBLE1BQUEsWUFBQTs7UUFFQSxFQUFBLFFBQUEsUUFBQSxDQUFBLFFBQUEsVUFBQSxTQUFBLFdBQUE7O1FBRUEsR0FBQSxPQUFBLFNBQUEsWUFBQSxVQUFBO1lBQ0EsUUFBQSxVQUFBLElBQUEsWUFBQTtlQUNBO1lBQ0EsUUFBQSxVQUFBLElBQUEsU0FBQTs7O1FBR0EsRUFBQSxvQkFBQTs7OztBQ2RBLENBQUEsVUFBQTs7Ozs7Ozs7Ozs7OztJQWFBLFFBQUEsT0FBQSxhQUFBLFdBQUEsbUJBQUEsQ0FBQSxVQUFBLGdCQUFBOztJQUVBLFNBQUEsZ0JBQUEsUUFBQSxhQUFBOztRQUVBLGFBQUEsV0FBQSxLQUFBLFNBQUEsU0FBQTtZQUNBLE9BQUEsUUFBQSxTQUFBOzs7UUFHQSxhQUFBLFdBQUE7WUFDQSxPQUFBLE1BQUEsS0FBQTtnQkFDQSxTQUFBO2dCQUNBLE1BQUE7b0JBQ0EsY0FBQTs7Ozs7OztBQ3pCQSxDQUFBLFlBQUE7O0lBRUEsUUFBQSxPQUFBLGFBQUEsUUFBQSxnQkFBQSxDQUFBLFNBQUEsTUFBQSxVQUFBOztJQUVBLFNBQUEsYUFBQSxPQUFBLElBQUEsUUFBQTs7UUFFQSxJQUFBLFVBQUE7UUFDQSxJQUFBLFdBQUE7UUFDQSxJQUFBOztRQUVBLFFBQUEsU0FBQSxZQUFBOztZQUVBLElBQUEsVUFBQSxHQUFBO1lBQ0EsSUFBQSxVQUFBLFFBQUE7O1lBRUEsUUFBQSxNQUFBLElBQUEsT0FBQSxNQUFBLFVBQUEsRUFBQSxPQUFBOztZQUVBLE1BQUEsS0FBQSxVQUFBLFVBQUE7Z0JBQ0EsUUFBQSxRQUFBO2VBQ0EsVUFBQSxLQUFBO2dCQUNBLFFBQUEsT0FBQTs7O1lBR0EsT0FBQTs7O1FBR0EsUUFBQSxPQUFBLFVBQUEsTUFBQTs7WUFFQSxJQUFBLFVBQUEsR0FBQTtZQUNBLElBQUEsVUFBQSxRQUFBOztZQUVBLE1BQUEsS0FBQSxPQUFBLE1BQUEsVUFBQSxNQUFBLEtBQUEsVUFBQSxVQUFBO2dCQUNBLFFBQUEsUUFBQTtlQUNBLFVBQUEsS0FBQTtnQkFDQSxRQUFBLE9BQUE7OztZQUdBLE9BQUE7OztRQUdBLFFBQUEsU0FBQSxVQUFBLElBQUE7O1lBRUEsSUFBQSxVQUFBLEdBQUE7WUFDQSxJQUFBLFVBQUEsUUFBQTs7WUFFQSxNQUFBLE9BQUEsT0FBQSxNQUFBLFdBQUEsTUFBQSxJQUFBLEtBQUEsVUFBQSxVQUFBO2dCQUNBLFFBQUEsUUFBQTtlQUNBLFVBQUEsS0FBQTtnQkFDQSxRQUFBLE9BQUE7OztZQUdBLE9BQUE7OztRQUdBLE9BQUE7Ozs7OztBQ3REQSxDQUFBLFlBQUE7O0lBRUEsUUFBQSxPQUFBLE9BQUEsV0FBQSxvQkFBQSxDQUFBLFVBQUE7O0lBRUEsU0FBQSxpQkFBQSxRQUFBOzs7Ozs7O0FDSkEsQ0FBQSxZQUFBOztJQUVBLFFBQUEsT0FBQSxPQUFBLFdBQUEsb0JBQUEsQ0FBQSxVQUFBLFFBQUE7O0lBRUEsU0FBQSxpQkFBQSxRQUFBLE1BQUE7O1FBRUEsT0FBQSxlQUFBO1lBQ0EsVUFBQTs7O1FBR0EsT0FBQSxlQUFBLFNBQUEsR0FBQTtZQUNBLElBQUEsVUFBQSxFQUFBLE9BQUE7WUFDQSxNQUFBLDRCQUFBOzs7UUFHQSxPQUFBLGVBQUEsU0FBQSxHQUFBO1lBQ0EsSUFBQSxVQUFBLEVBQUEsT0FBQTtZQUNBLE1BQUEsNEJBQUE7Ozs7Ozs7O1FBUUEsT0FBQSxZQUFBLFNBQUEsTUFBQTs7Ozs7WUFLQSxPQUFBLEtBQUEsWUFBQTs7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LE9BQUEsaUJBQUEsb0JBQUE7OztBQ3RDQSxDQUFBLFlBQUE7SUFDQSxRQUFBLE9BQUE7U0FDQSxPQUFBLDBCQUFBLFNBQUEsTUFBQTtZQUNBLE9BQUEsVUFBQSxNQUFBLFFBQUE7Z0JBQ0EsSUFBQSxjQUFBOzBCQUNBLEtBQUEsUUFBQSxJQUFBLE9BQUEsTUFBQSxTQUFBLEtBQUEsT0FBQTswQkFDQTs7Z0JBRUEsT0FBQSxLQUFBLFlBQUE7Ozs7OztBQ1JBLFFBQUEsT0FBQSxZQUFBLFFBQUEsc0JBQUEsVUFBQTtJQUNBLEtBQUEsVUFBQTtRQUNBLE9BQUE7UUFDQSxPQUFBOztHQUVBIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbImFuZ3VsYXIubW9kdWxlKFwiYXBwLmNvbmZpZ1wiLCBbXSlcbi5jb25zdGFudChcImNvbmZpZ1wiLCB7XG5cdFwiYXBpXCI6IFwiaHR0cDovL2xvY2FsaG9zdDo4MDAxL2FwaS92MVwiLCBcblx0XCJkZWJ1Z1wiOiB0cnVlXG59KTtcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAuY2FyZHMnLCBbXSk7XG5cbiIsIid1c2Ugc3RyaWN0JztcblxuYW5ndWxhci5tb2R1bGUoJ2FwcCcsIFsnbmdSb3V0ZScsICdhcHAuY29uZmlnJywgJ2FwcC5ob21lJ10pO1xuICBcbmFuZ3VsYXIubW9kdWxlKCdhcHAnKS5jb25maWcoW2Z1bmN0aW9uICgpIHtcbiAgICAvL0Jsb3F1ZSBjb25maWcgcGFyYSBjb25maWd1cmFyIGVsIHJlc3RvIGRlIGNvc2FzIHF1ZSBubyBzb24gbGFzIHJ1dGFzLlxufV0pXG4gXG5hbmd1bGFyLm1vZHVsZSgnYXBwJykucnVuKFtmdW5jdGlvbiAoKSB7XG4gXG4gXG59XSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcC5ob21lJywgWyduZ1JvdXRlJywgJ2FwcC5jb25maWcnLCAnbmdBbmltYXRlJywgJ2FwcC5jYXJkcyddKTtcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAuY2FyZHMnKS5jb25maWcoZnVuY3Rpb24oJHJvdXRlUHJvdmlkZXIpIHtcbiAgIFxufSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmNvbmZpZyhbJyRyb3V0ZVByb3ZpZGVyJywgZnVuY3Rpb24oJHJvdXRlUHJvdmlkZXIpIHtcbiAgICBcbiAgJHJvdXRlUHJvdmlkZXJcbiAgICAud2hlbignLycsIHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdzcmMvYXBwX21vZHVsZXMvaG9tZS90ZW1wbGF0ZXMvaG9tZS10ZW1wbGF0ZS5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0hvbWVDb250cm9sbGVyJyxcbiAgICAgICAgY29udHJvbGxlckFzOiAnaG9tZSdcbiAgICB9KVxuICAgIFxuICAgIC5vdGhlcndpc2Uoe3JlZGlyZWN0VG86ICcvJ30pOyBcbn1dKTsiLCJhbmd1bGFyLm1vZHVsZSgnYXBwLmhvbWUnKS5jb25maWcoZnVuY3Rpb24oJHJvdXRlUHJvdmlkZXIpIHtcblxufSk7IiwiXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XG5cbiAgICAvLyBzd2l0Y2ggZm9ybXNcbiAgICAkKCcubWVzc2FnZSBhJykuY2xpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICBcbiAgICAgICAgJCgnZm9ybScpLmFuaW1hdGUoe2hlaWdodDogXCJ0b2dnbGVcIiwgb3BhY2l0eTogXCJ0b2dnbGVcIn0sIFwic2xvd1wiKTtcbiAgICAgICAgXG4gICAgICAgIGlmKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSA9PSAnL2xvZ2luJykge1xuICAgICAgICAgICAgaGlzdG9yeS5wdXNoU3RhdGUoe30sIFwiUmVnaXN0ZXJcIiwgXCIvcmVnaXN0ZXJcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBoaXN0b3J5LnB1c2hTdGF0ZSh7fSwgXCJMb2dpblwiLCBcIi9sb2dpblwiKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgJCgnZm9ybSAuaGVscC1ibG9jaycpLmhpZGUoKTtcbiAgICB9KTtcblxufSk7IiwiKGZ1bmN0aW9uKCl7XG4gICAgICAgIFxuICAgIC8qKlxuICAgICAqIEZZSSwgY2FyZHMgbXVzdCBoYXZlIHRoaXMgYmFzaWMgc3RydWN0dXJlXG4gICAgICoge1xuICAgICAqICAgICAgXCJpZFwiOiAxLFxuICAgICAgICAgICAgXCJuYW1lXCI6IFwiQXV0IG1vZGkgcXVhc2kgY29ycnVwdGkgdmVyaXRhdGlzIHN1bnQgZG9sb3JlLlwiLFxuICAgICAgICAgICAgY29udGVudDpcIkxvcmVtIElwc3VtIGRvbG9yIGVzdCAjaW1wb3J0YW50LiAjbXl0YWdcIixcbiAgICAgICAgICAgIHRhZ3M6IFtcbiAgICAgICAgICAgICAgICBcIm15dGFnXCIsIFwiaW1wb3J0YW50XCJcbiAgICAgICAgICAgIF1cbiAgICAgICAgfVxuICAgICovXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5jYXJkcycpLmNvbnRyb2xsZXIoJ0NhcmRzQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJ2NhcmRzRmFjdG9yeScsIENhcmRzQ29udHJvbGxlcl0pO1xuXG4gICAgZnVuY3Rpb24gQ2FyZHNDb250cm9sbGVyKCRzY29wZSwgY2FyZHNGYWN0b3J5KXtcbiAgICAgICAgXG4gICAgICAgIGNhcmRzRmFjdG9yeS5nZXRDYXJkcygpLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpeyAgICAgICBcbiAgICAgICAgICAgICRzY29wZS5jYXJkcyA9IHJlc3BvbnNlLmRhdGE7XG4gICAgICAgIH0pOyAgICBcblxuICAgICAgICBjcmVhdGVDYXJkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAkc2NvcGUuY2FyZHMucHVzaCh7XG4gICAgICAgICAgICAgICAgY29udGVudDogXCJSZW5vbWJyYXIgcHJveWVjdG8gYSBjYXJkcy4gI2NvcmVjaGFuZ2VcIixcbiAgICAgICAgICAgICAgICB0YWdzOiBbXG4gICAgICAgICAgICAgICAgICAgIFwiY29yZWNoYW5nZVwiLCBcImltcG9ydGFudFwiXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgfVxufSkoKTtcbiIsIihmdW5jdGlvbiAoKSB7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmNhcmRzJykuZmFjdG9yeSgnY2FyZHNGYWN0b3J5JywgWyckaHR0cCcsICckcScsICdjb25maWcnLCBjYXJkc0ZhY3RvcnldKTtcblxuICAgIGZ1bmN0aW9uIGNhcmRzRmFjdG9yeSgkaHR0cCwgJHEsIGNvbmZpZykge1xuXG4gICAgICAgIHZhciBmYWN0b3J5ID0ge307XG4gICAgICAgIHZhciBlbmRwb2ludCA9IFwiL2NhcmRzXCI7XG4gICAgICAgIHZhciBjYXJkcztcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgZmFjdG9yeS5nZXRBbGwgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIHZhciBkZWZlcmVkID0gJHEuZGVmZXIoKTtcbiAgICAgICAgICAgIHZhciBwcm9taXNlID0gZGVmZXJlZC5wcm9taXNlO1xuXG4gICAgICAgICAgICBjYXJkcyA9ICRodHRwLmdldChjb25maWcuYXBpICsgZW5kcG9pbnQsIHsgY2FjaGU6IHRydWV9KTsgLy8gZ2V0IGxpc3RcblxuICAgICAgICAgICAgY2FyZHMudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICBkZWZlcmVkLnJlc29sdmUocmVzcG9uc2UpO1xuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgIGRlZmVyZWQucmVqZWN0KGVycik7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgICAgIH07XG5cbiAgICAgICAgZmFjdG9yeS5zYXZlID0gZnVuY3Rpb24gKGRhdGEpIHtcblxuICAgICAgICAgICAgdmFyIGRlZmVyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgICAgICAgdmFyIHByb21pc2UgPSBkZWZlcmVkLnByb21pc2U7XG5cbiAgICAgICAgICAgICRodHRwLnBvc3QoY29uZmlnLmFwaSArIGVuZHBvaW50LCBkYXRhKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIGRlZmVyZWQucmVzb2x2ZShyZXNwb25zZSk7XG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgZGVmZXJlZC5yZWplY3QoZXJyKTtcbiAgICAgICAgICAgIH0pO1xuIFxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgICAgIH1cblxuICAgICAgICBmYWN0b3J5LmRlbGV0ZSA9IGZ1bmN0aW9uIChpZCkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgZGVmZXJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICAgICAgICB2YXIgcHJvbWlzZSA9IGRlZmVyZWQucHJvbWlzZTtcblxuICAgICAgICAgICAgJGh0dHAuZGVsZXRlKGNvbmZpZy5hcGkgKyBlbmRwb2ludCArICcvJyArIGlkKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIGRlZmVyZWQucmVzb2x2ZShyZXNwb25zZSk7XG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgZGVmZXJlZC5yZWplY3QoZXJyKTtcbiAgICAgICAgICAgIH0pO1xuIFxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFjdG9yeTtcbiAgICB9XG5cbn0pKCk7XG5cbiIsIihmdW5jdGlvbiAoKSB7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwJykuY29udHJvbGxlcignSGVhZGVyQ29udHJvbGxlcicsIFsnJHNjb3BlJywgSGVhZGVyQ29udHJvbGxlcl0pO1xuXG4gICAgZnVuY3Rpb24gSGVhZGVyQ29udHJvbGxlcigkc2NvcGUpIHtcbiAgICAgICAgXG4gICAgfVxufSkoKTtcblxuXG4iLCIoZnVuY3Rpb24gKCkge1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmNvbnRyb2xsZXIoJ0xheW91dENvbnRyb2xsZXInLCBbJyRzY29wZScsICckc2NlJywgTGF5b3V0Q29udHJvbGxlcl0pO1xuXG4gICAgZnVuY3Rpb24gTGF5b3V0Q29udHJvbGxlcigkc2NvcGUsICRzY2UpIHtcblxuICAgICAgICAkc2NvcGUudHJhbnNsYXRpb25zID0ge1xuICAgICAgICAgICAgc3VidGl0bGU6ICdTaW1wbHkgaGFzaCB5b3VyIG5vdGVzIGFuZCBuYXZpZ2F0ZSB0aGVtJ1xuICAgICAgICB9OyAgICAgICAgICAgIFxuICAgICAgICBcbiAgICAgICAgJHNjb3BlLnRhZ1VzZXJDbGljayA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHZhciB0YWdUZXh0ID0gZS50YXJnZXQuaW5uZXJUZXh0O1xuICAgICAgICAgICAgYWxlcnQoJ3RhZ1VzZXJDbGljaywgdGFnVGV4dDogJyArIHRhZ1RleHQpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgJHNjb3BlLnRhZ1Rlcm1DbGljayA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHZhciB0YWdUZXh0ID0gZS50YXJnZXQuaW5uZXJUZXh0O1xuICAgICAgICAgICAgYWxlcnQoJ3RhZ1Rlcm1DbGljaywgdGFnVGV4dDogJyArIHRhZ1RleHQpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLy8gWW91IGNvdWxkIGRlZmluZSAndGFnVXNlckNsaWNrJyBhbmQgJ3RhZ1Rlcm1DbGljaydcbiAgICAgICAgLy8gb24gdGhlICckcm9vdFNjb3BlJy4gVGhpcyB3YXkgeW91IGNhbiBoYW5kbGUgd2hhdGV2ZXJcbiAgICAgICAgLy8gbG9naWMgeW91IHdhbnQgZm9yIGhhc2h0YWdzIGluIG9uZSBwbGFjZSByYXRoZXIgdGhhblxuICAgICAgICAvLyBoYXZpbmcgdG8gZGVmaW5lIGl0IGluIGVhY2ggY29udHJvbGxlci5cbiAgICAgICAgXG4gICAgICAgICRzY29wZS50cnVzdEh0bWwgPSBmdW5jdGlvbihodG1sKSB7XG4gICAgICAgICAgICAvLyBTYW5pdGl6ZSBtYW51YWxseSBpZiBuZWNlc3NhcnkuIEl0J3MgbGlrZWx5IHRoaXNcbiAgICAgICAgICAgIC8vIGh0bWwgaGFzIGFscmVhZHkgYmVlbiBzYW5pdGl6ZWQgc2VydmVyIHNpZGVcbiAgICAgICAgICAgIC8vIGJlZm9yZSBpdCB3ZW50IGludG8geW91ciBkYXRhYmFzZS5cbiAgICAgICAgICAgIC8vIERvbid0IGhvbGQgbWUgbGlhYmxlIGZvciBYU1MuLi4gbmV2ZXIgYXNzdW1lIDp+KVxuICAgICAgICAgICAgcmV0dXJuICRzY2UudHJ1c3RBc0h0bWwoaHRtbCk7XG4gICAgICAgIH07XG4gICAgfVxufSkoKTtcblxuXG4iLCIoZnVuY3Rpb24gKCkgeyBcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwJykuZGlyZWN0aXZlKCdoYXNodGFnaWZ5JywgWyckdGltZW91dCcsICckY29tcGlsZScsXG4gICAgICAgIGZ1bmN0aW9uKCR0aW1lb3V0LCAkY29tcGlsZSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICByZXN0cmljdDogJ0EnLFxuICAgICAgICAgICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICAgICAgICAgIHVDbGljazogJyZ1c2VyQ2xpY2snLFxuICAgICAgICAgICAgICAgICAgICB0Q2xpY2s6ICcmdGVybUNsaWNrJ1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGh0bWwgPSBlbGVtZW50Lmh0bWwoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGh0bWwgPT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXR0cnMudXNlckNsaWNrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaHRtbCA9IGh0bWwucmVwbGFjZSgvKHxcXHMpKkAoXFx3KykvZywgJyQxPGEgbmctY2xpY2s9XCJ1Q2xpY2soeyRldmVudDogJGV2ZW50fSlcIiBjbGFzcz1cImhhc2h0YWdcIj5AJDI8L2E+Jyk7IFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXR0cnMudGVybUNsaWNrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaHRtbCA9IGh0bWwucmVwbGFjZSgvKF58XFxzKSojKFxcdyspL2csICckMTxhIG5nLWNsaWNrPVwidENsaWNrKHskZXZlbnQ6ICRldmVudH0pXCIgY2xhc3M9XCJoYXNodGFnXCI+IyQyPC9hPicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50Lmh0bWwoaHRtbCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICRjb21waWxlKGVsZW1lbnQuY29udGVudHMoKSkoc2NvcGUpO1xuICAgICAgICAgICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgXSk7XG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcCcpXG4gICAgICAgIC5maWx0ZXIoJ3JlZHVjZUJ5JywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGNvbGxlY3Rpb24sIGZpZWxkKSB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbGxlY3Rpb24ucmVkdWNlKGZ1bmN0aW9uKG91dHB1dCwgY3VycmVudCl7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZighZmllbGRFeGlzdHMob3V0cHV0LCBmaWVsZCwgY3VycmVudFtmaWVsZF0pKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBvdXRwdXQuY29uY2F0KGN1cnJlbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICAgICAgICAgICAgICAgICAgfSwgW10pO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBmaWVsZEV4aXN0cyhoYXlzdGFjaywgZmllbGROYW1lLCBmaWVsZFZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBoYXlzdGFjay5zb21lKGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVsW2ZpZWxkTmFtZV0gPT09IGZpZWxkVmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIH0pOyBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9OyAgICAgICAgICAgIFxuICAgICAgICB9KTtcbn0pKCk7XG5cbiIsIihmdW5jdGlvbigpe1xuICAgIFxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuaG9tZScpLmNvbnRyb2xsZXIoJ0Zvcm1Db250cm9sbGVyJywgWyckc2NvcGUnLCAnY2FyZHNGYWN0b3J5JywgJ0hvbWVDb250ZXh0U2VydmljZScsIEZvcm1Db250cm9sbGVyXSk7XG4gICAgXG4gICAgZnVuY3Rpb24gRm9ybUNvbnRyb2xsZXIoJHNjb3BlLCBjYXJkc0ZhY3RvcnksIEhvbWVDb250ZXh0U2VydmljZSkge1xuICAgICAgICBcbiAgICAgICAgJHNjb3BlLnRyYW5zbGF0aW9ucy53cml0ZV9zb21ldGhpbmcgPSBcIldyaXRlIHNvbWV0aGluZyBhbmQgaGFzaCBpdC4uLlwiO1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdheSB0byBrZWVwIHNpYmxpbmdzIGNvbm5lY3RlZCBhbmQgc2hhcmluZyBzY29wZVxuICAgICAgICAgKi9cbiAgICAgICAgJHNjb3BlLmNvbnRleHQgPSBIb21lQ29udGV4dFNlcnZpY2UuY29udGV4dDtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBdXRvZXhwYW5kIGZvcm1cbiAgICAgICAgICogQHBhcmFtIGV2ZW50IGVcbiAgICAgICAgICogQHJldHVybnMgdm9pZFxuICAgICAgICAgKi9cbiAgICAgICAgJHNjb3BlLmF1dG9FeHBhbmQgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICB2YXIgZWxlbWVudCA9IHR5cGVvZiBlID09PSAnb2JqZWN0JyA/IGUudGFyZ2V0IDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZSk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzY3JvbGxIZWlnaHQgPSBlbGVtZW50LnNjcm9sbEhlaWdodCBcbiAgICAgICAgICAgIGVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gIHNjcm9sbEhlaWdodCArIFwicHhcIjsgICAgXG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogU3VibWl0IGZvcm1cbiAgICAgICAgICogQHJldHVybnMgdm9pZFxuICAgICAgICAgKi9cbiAgICAgICAgJHNjb3BlLmNyZWF0ZUNhcmQgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIGlmICgkc2NvcGUuY29udGVudCkge1xuXG4gICAgICAgICAgICAgICAgbGV0IGRhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICRzY29wZS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICBjb250ZW50OiAkc2NvcGUuY29udGVudFxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBjYXJkc0ZhY3Rvcnkuc2F2ZShkYXRhKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICBkYXRhLmNsYXNzID0gJ2hpZ2hsaWdodGVkJztcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmNvbnRleHQuY2FyZHMucHVzaChkYXRhKTtcbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgICAgICAkc2NvcGUuY29udGVudCA9ICcnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcblxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuaG9tZScpLmNvbnRyb2xsZXIoJ0hvbWVDb250cm9sbGVyJywgWyckc2NvcGUnLCBIb21lQ29udHJvbGxlcl0pO1xuXG4gICAgZnVuY3Rpb24gSG9tZUNvbnRyb2xsZXIoJHNjb3BlKSB7XG5cbiAgICAgICAgJHNjb3BlLnRyYW5zbGF0aW9ucyA9IHtcbiAgICAgICAgICAgIGhvbWU6IHt9XG4gICAgICAgIH07ICAgICAgICAgICAgXG4gICAgfVxufSkoKTtcblxuXG4iLCIoZnVuY3Rpb24oKXtcbiAgICBcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmhvbWUnKS5jb250cm9sbGVyKCdMaXN0Q29udHJvbGxlcicsIFsnJHNjb3BlJywgJ2NhcmRzRmFjdG9yeScsICdIb21lQ29udGV4dFNlcnZpY2UnLCBMaXN0Q29udHJvbGxlcl0pO1xuICAgIFxuICAgIGZ1bmN0aW9uIExpc3RDb250cm9sbGVyKCRzY29wZSwgY2FyZHNGYWN0b3J5LCBIb21lQ29udGV4dFNlcnZpY2Upe1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAkc2NvcGUudHJhbnNsYXRpb25zLm5vX3Jlc3VsdHMgPSBcIk5vIHJlc3VsdHNcIjsgICAgICAgIFxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdheSB0byBrZWVwIHNpYmxpbmdzIGNvbm5lY3RlZCBhbmQgc2hhcmluZyBzY29wZVxuICAgICAgICAgKi9cbiAgICAgICAgJHNjb3BlLmNvbnRleHQgPSBIb21lQ29udGV4dFNlcnZpY2UuY29udGV4dDtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHZXQgY2FyZHMgbGlzdFxuICAgICAgICAgKi9cbiAgICAgICAgY2FyZHNGYWN0b3J5XG4gICAgICAgICAgICAuZ2V0QWxsKClcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuXG4gICAgICAgICAgICAgICAgJHNjb3BlLmNvbnRleHQuY2FyZHMgPSBhbmd1bGFyLmZyb21Kc29uKHJlc3BvbnNlLmRhdGEpO1xuXG4gICAgICAgICAgICAgICAgJHNjb3BlLm9yZGVyQ2FyZHNCeSA9ICd1cGRhdGVkX2F0JztcblxuICAgICAgICAgICAgICAgICRzY29wZS5kaXJlY3Rpb24gPSAncmV2ZXJzZSc7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpOyAvLyBUT0RPOiBUcmF0YXIgZWwgZXJyb3JcbiAgICAgICAgICAgIH0pOyAgXG4gICAgICAgICAgICBcbiAgICAgICAgJHNjb3BlLmRlbGV0ZUNhcmQgPSBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNhcmRzRmFjdG9yeS5kZWxldGUoaXRlbS5pZCkudGhlbihmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIGxldCBpbmRleCA9ICRzY29wZS5jb250ZXh0LmNhcmRzLmluZGV4T2YoaXRlbSk7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmNvbnRleHQuY2FyZHMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCl7XG4gICAgXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5ob21lJykuY29udHJvbGxlcignU2VhcmNoQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJ0hvbWVDb250ZXh0U2VydmljZScsIFNlYXJjaENvbnRyb2xsZXJdKTtcbiAgICBcbiAgICBmdW5jdGlvbiBTZWFyY2hDb250cm9sbGVyKCRzY29wZSwgSG9tZUNvbnRleHRTZXJ2aWNlKXtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgJHNjb3BlLnRyYW5zbGF0aW9ucy5xdWlja19zZWFyY2ggPSBcIlF1aWNrIFNlYXJjaC4uLlwiOyAgICBcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBXYXkgdG8ga2VlcCBzaWJsaW5ncyBjb25uZWN0ZWQgYW5kIHNoYXJpbmcgc2NvcGVcbiAgICAgICAgICovXG4gICAgICAgICRzY29wZS5jb250ZXh0ID0gSG9tZUNvbnRleHRTZXJ2aWNlLmNvbnRleHQ7XG4gICAgfVxufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5ob21lJykuY29udHJvbGxlcignU3RhY2tDb250cm9sbGVyJywgWyckc2NvcGUnLCAnSG9tZUNvbnRleHRTZXJ2aWNlJywgU3RhY2tDb250cm9sbGVyXSk7XG5cbiAgICBmdW5jdGlvbiBTdGFja0NvbnRyb2xsZXIoJHNjb3BlLCBIb21lQ29udGV4dFNlcnZpY2UpIHtcblxuICAgICAgICAkc2NvcGUudHJhbnNsYXRpb25zLmhvbWUuc3RhY2tMaXN0ID0ge1xuICAgICAgICAgICAgdGl0bGU6IFwiU3RhY2tzXCJcbiAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogV2F5IHRvIGtlZXAgc2libGluZ3MgY29ubmVjdGVkIGFuZCBzaGFyaW5nIHNjb3BlXG4gICAgICAgICAqL1xuICAgICAgICAkc2NvcGUuY29udGV4dCA9IEhvbWVDb250ZXh0U2VydmljZS5jb250ZXh0O1xuXG4gICAgICAgICRzY29wZS5jb250ZXh0LnN0YWNrcyA9IFt7XG4gICAgICAgICAgICBpZDogMSxcbiAgICAgICAgICAgIG5hbWU6ICdVbml2ZXJzYWwnXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiAyLFxuICAgICAgICAgICAgbmFtZTogJ1NlY29uZCBzdGFjaycsXG4gICAgICAgICAgICBwYXJ0aWNpcGFudHM6IHtcbiAgICAgICAgICAgICAgICBjb3VudDogMSxcbiAgICAgICAgICAgICAgICBsaXN0OiB7XG4gICAgICAgICAgICAgICAgICAgICdKb2huIERvZSc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGltZzogJ3Byb2ZpbGUtcGljdHVyZS02MHg2MC5wbmcnXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiAzLFxuICAgICAgICAgICAgbmFtZTogJ0FuZCBzbyBvbicsXG4gICAgICAgICAgICBwYXJ0aWNpcGFudHM6IHtcbiAgICAgICAgICAgICAgICBjb3VudDogMTUsXG4gICAgICAgICAgICAgICAgbGlzdDoge1xuICAgICAgICAgICAgICAgICAgICAnSm9obiBEb2UnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbWc6ICdwcm9maWxlLXBpY3R1cmUtNjB4NjAucG5nJ1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAnQ2hhcmxlcyBEYXZpZHNvbic6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGltZzogJ3Byb2ZpbGUtcGljdHVyZS02MHg2MC5wbmcnXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICdBbGV4IFN0ZXdhcmQnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbWc6ICdwcm9maWxlLXBpY3R1cmUtNjB4NjAucG5nJ1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XTtcbiAgICB9XG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmhvbWUnKS5jb250cm9sbGVyKCdUYWdDb250cm9sbGVyJywgWyckc2NvcGUnLCAncmVkdWNlQnlGaWx0ZXInLCAnSG9tZUNvbnRleHRTZXJ2aWNlJywgVGFnQ2xvdWRDb250cm9sbGVyXSk7XG5cbiAgICBmdW5jdGlvbiBUYWdDbG91ZENvbnRyb2xsZXIoJHNjb3BlLCByZWR1Y2VCeUZpbHRlciwgSG9tZUNvbnRleHRTZXJ2aWNlKSB7XG5cbiAgICAgICAgICRzY29wZS50cmFuc2xhdGlvbnMuaG9tZS50YWdDbG91ZCA9IHtcbiAgICAgICAgICAgIHRpdGxlOiBcIkluIHRoaXMgcGFnZVwiXG4gICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdheSB0byBrZWVwIHNpYmxpbmdzIGNvbm5lY3RlZCBhbmQgc2hhcmluZyBzY29wZVxuICAgICAgICAgKi9cbiAgICAgICAgJHNjb3BlLmNvbnRleHQgPSBIb21lQ29udGV4dFNlcnZpY2UuY29udGV4dDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogS2VlcCB0cmFjayBvZiBjYXJkIGxpc3QgY2hhbmdlc1xuICAgICAgICAgKiBAcmV0dXJucyB2b2lkXG4gICAgICAgICAqL1xuICAgICAgICBmdW5jdGlvbiB1cGRhdGVUYWdDbG91ZCgpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gZXhjbHVkZSBjYXJkIHdpdGggbm8gdGFnc1xuICAgICAgICAgICAgbGV0IGNhcmRzID0gJHNjb3BlLmNvbnRleHQuZmlsdGVyZWQuZmlsdGVyKGZ1bmN0aW9uIChjYXJkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhcmQudGFncy5sZW5ndGggPiAwO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIGV4dHJhY3QgdGFncyBmcm9tIGNhcmRcbiAgICAgICAgICAgIGxldCB0YWdzID0gY2FyZHMubWFwKGZ1bmN0aW9uIChjYXJkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoYW5ndWxhci50b0pzb24oY2FyZC50YWdzKSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gbWVyZ2UgdGFncyBpbiBmbGF0dGVuIGFycmF5XG4gICAgICAgICAgICBsZXQgbWVyZ2VkID0gW10uY29uY2F0LmFwcGx5KFtdLCB0YWdzKTtcblxuICAgICAgICAgICAgLy8gZWxpbWluYXRlIGR1cGxpY2F0ZXMgYW5kIHNlcnZlIGFycmF5IHRvIHZpZXdcbiAgICAgICAgICAgICRzY29wZS5jb250ZXh0LnRhZ3MgPSByZWR1Y2VCeUZpbHRlcihtZXJnZWQsICdpZCcpO1xuICAgICAgICB9XG4gICAgICAgXG4gICAgICAgICRzY29wZS4kd2F0Y2hDb2xsZWN0aW9uKCdjb250ZXh0LmZpbHRlcmVkJywgdXBkYXRlVGFnQ2xvdWQgKTtcbiAgICB9XG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5ob21lJylcbiAgICAgICAgLmZpbHRlcignaGlnaGxpZ2h0VGV4dCcsIGZ1bmN0aW9uKCRzY2UpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAodGV4dCwgcGhyYXNlKSB7XG4gICAgICAgICAgICAgICAgbGV0IGhpZ2hsaWdodGVkID0gcGhyYXNlXG4gICAgICAgICAgICAgICAgICAgICAgICA/IHRleHQucmVwbGFjZShuZXcgUmVnRXhwKCcoJyArIHBocmFzZSArICcpJywgJ2dpJyksICc8c3BhbiBjbGFzcz1cImhpZ2hsaWdodC10ZXh0XCI+JDE8L3NwYW4+JylcbiAgICAgICAgICAgICAgICAgICAgICAgIDogdGV4dDtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHJldHVybiAkc2NlLnRydXN0QXNIdG1sKGhpZ2hsaWdodGVkKTtcbiAgICAgICAgICAgIH07ICAgICAgICAgICAgXG4gICAgICAgIH0pO1xufSkoKTtcblxuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcC5ob21lJykuc2VydmljZSgnSG9tZUNvbnRleHRTZXJ2aWNlJywgZnVuY3Rpb24oKXtcbiAgICB0aGlzLmNvbnRleHQgPSB7XG4gICAgICAgIGNhcmRzOiBbXSxcbiAgICAgICAgcXVlcnk6ICcnXG4gICAgfTtcbn0pOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
