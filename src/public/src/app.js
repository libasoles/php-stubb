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
        
        $scope.pinCard = function(item) {
            
            let index = $scope.context.cards.indexOf(item);
            
            if(item.sticky) {
                
                item.sticky = false;
                item.class = item.class ? item.class.replace("sticky", "") : "";
            } else {
                // put it first
                item.sticky = true;
                item.class = item.class ? item.class + " sticky" : "sticky";
                $scope.context.cards.splice(index, 1);
                $scope.context.cards.unshift(item);
            }            
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC1jb25maWcuanMiLCJjYXJkcy9tb2R1bGUuanMiLCJjb21tb24vbW9kdWxlLmpzIiwiaG9tZS9tb2R1bGUuanMiLCJjYXJkcy9jYXJkcy1yb3V0ZS5qcyIsImNvbW1vbi9hcHAtcm91dGUuanMiLCJob21lL2hvbWUtcm91dGUuanMiLCJsb2dpbi9sb2dpbi5qcyIsImNhcmRzL2NvbnRyb2xsZXJzL2NhcmRzLWNvbnRyb2xsZXIuanMiLCJjYXJkcy9zZXJ2aWNlcy9jYXJkcy1mYWN0b3J5LmpzIiwiY29tbW9uL2NvbnRyb2xsZXJzL2hlYWRlci1jb250cm9sbGVycy5qcyIsImNvbW1vbi9jb250cm9sbGVycy9sYXlvdXQtY29udHJvbGxlcnMuanMiLCJjb21tb24vZGlyZWN0aXZlcy9lbGFzdGljQXJlYS5qcyIsImNvbW1vbi9kaXJlY3RpdmVzL2hhc2h0YWdpZnkuanMiLCJjb21tb24vZGlyZWN0aXZlcy9zaG93TW9yZS5qcyIsImNvbW1vbi9maWx0ZXJzL3JlZHVjZUJ5LmpzIiwiaG9tZS9jb250cm9sbGVycy9mb3JtLWNvbnRyb2xsZXIuanMiLCJob21lL2NvbnRyb2xsZXJzL2hvbWUtY29udHJvbGxlci5qcyIsImhvbWUvY29udHJvbGxlcnMvbGlzdC1jb250cm9sbGVyLmpzIiwiaG9tZS9jb250cm9sbGVycy9zZWFyY2gtY29udHJvbGxlci5qcyIsImhvbWUvY29udHJvbGxlcnMvc3RhY2stY29udHJvbGxlci5qcyIsImhvbWUvY29udHJvbGxlcnMvdGFnLWNsb3VkLWNvbnRyb2xsZXIuanMiLCJob21lL2ZpbHRlcnMvaGlnaGxpZ2h0VGV4dC5qcyIsImhvbWUvc2VydmljZXMvaG9tZS1jb250ZXh0LmpzIiwiaG9tZS9jb250cm9sbGVycy9tb2RhbHMvZWRpdC1jb250cm9sbGVyLmpzIiwiaG9tZS9jb250cm9sbGVycy9tb2RhbHMvbWFya2Rvd24tY29udHJvbGxlci5qcyIsImhvbWUvY29udHJvbGxlcnMvbW9kYWxzL3llcy1uby1jb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFFBQUEsT0FBQSxjQUFBO0NBQ0EsU0FBQSxVQUFBO0NBQ0EsT0FBQTtDQUNBLFNBQUE7UUFDQSxjQUFBO1FBQ0EsY0FBQTs7O0FDTEEsUUFBQSxPQUFBLGFBQUE7OztBQ0FBOztBQUVBLFFBQUEsT0FBQSxPQUFBLENBQUEsV0FBQSxjQUFBLFlBQUE7O0FBRUEsUUFBQSxPQUFBLE9BQUEsT0FBQSxDQUFBLGlCQUFBLFVBQUEsZUFBQTs7SUFFQSxjQUFBLFNBQUEsUUFBQSxTQUFBO1FBQ0EsZ0JBQUE7UUFDQSxVQUFBO1FBQ0EscUJBQUE7UUFDQSxvQkFBQTtRQUNBLGdCQUFBLFFBQUE7Ozs7QUFJQSxRQUFBLE9BQUEsT0FBQSxJQUFBLENBQUEsWUFBQTs7OztBQ2ZBLFFBQUEsT0FBQSxZQUFBLENBQUEsV0FBQSxjQUFBLGFBQUEsYUFBQSxhQUFBOztBQ0FBLFFBQUEsT0FBQSxhQUFBLDBCQUFBLFNBQUEsZ0JBQUE7OztBQ0FBLENBQUEsWUFBQTtJQUNBLFFBQUEsT0FBQSxPQUFBLE9BQUEsQ0FBQSxrQkFBQSxVQUFBLFNBQUEsZ0JBQUEsUUFBQTs7TUFFQTtTQUNBLEtBQUEsS0FBQTtZQUNBLGFBQUEsT0FBQSxhQUFBO1lBQ0EsWUFBQTtZQUNBLGNBQUE7OztTQUdBLFVBQUEsQ0FBQSxZQUFBOzs7QUNWQSxRQUFBLE9BQUEsWUFBQSwwQkFBQSxTQUFBLGdCQUFBOzs7O0FDQ0EsRUFBQSxVQUFBLE1BQUEsWUFBQTs7O0lBR0EsRUFBQSxjQUFBLE1BQUEsWUFBQTs7UUFFQSxFQUFBLFFBQUEsUUFBQSxDQUFBLFFBQUEsVUFBQSxTQUFBLFdBQUE7O1FBRUEsR0FBQSxPQUFBLFNBQUEsWUFBQSxVQUFBO1lBQ0EsUUFBQSxVQUFBLElBQUEsWUFBQTtlQUNBO1lBQ0EsUUFBQSxVQUFBLElBQUEsU0FBQTs7O1FBR0EsRUFBQSxvQkFBQTs7OztBQ2RBLENBQUEsVUFBQTs7Ozs7Ozs7Ozs7OztJQWFBLFFBQUEsT0FBQSxhQUFBLFdBQUEsbUJBQUEsQ0FBQSxVQUFBLGdCQUFBOztJQUVBLFNBQUEsZ0JBQUEsUUFBQSxhQUFBOztRQUVBLGFBQUEsV0FBQSxLQUFBLFNBQUEsU0FBQTtZQUNBLE9BQUEsUUFBQSxTQUFBOzs7UUFHQSxhQUFBLFdBQUE7WUFDQSxPQUFBLE1BQUEsS0FBQTtnQkFDQSxTQUFBO2dCQUNBLE1BQUE7b0JBQ0EsY0FBQTs7Ozs7OztBQ3pCQSxDQUFBLFlBQUE7O0lBRUEsUUFBQSxPQUFBLGFBQUEsUUFBQSxnQkFBQSxDQUFBLFNBQUEsTUFBQSxVQUFBOztJQUVBLFNBQUEsYUFBQSxPQUFBLElBQUEsUUFBQTs7UUFFQSxJQUFBLFVBQUE7UUFDQSxJQUFBLFdBQUE7UUFDQSxJQUFBOztRQUVBLFFBQUEsU0FBQSxZQUFBOztZQUVBLElBQUEsVUFBQSxHQUFBO1lBQ0EsSUFBQSxVQUFBLFFBQUE7O1lBRUEsUUFBQSxNQUFBLElBQUEsT0FBQSxNQUFBLFVBQUEsRUFBQSxPQUFBOztZQUVBLE1BQUEsS0FBQSxVQUFBLFVBQUE7Z0JBQ0EsUUFBQSxRQUFBO2VBQ0EsVUFBQSxLQUFBO2dCQUNBLFFBQUEsT0FBQTs7O1lBR0EsT0FBQTs7O1FBR0EsUUFBQSxPQUFBLFVBQUEsTUFBQTs7WUFFQSxJQUFBLFVBQUEsR0FBQTtZQUNBLElBQUEsVUFBQSxRQUFBOztZQUVBLE1BQUEsS0FBQSxPQUFBLE1BQUEsVUFBQSxNQUFBLEtBQUEsVUFBQSxVQUFBO2dCQUNBLFFBQUEsUUFBQTtlQUNBLFVBQUEsS0FBQTtnQkFDQSxRQUFBLE9BQUE7OztZQUdBLE9BQUE7OztRQUdBLFFBQUEsU0FBQSxVQUFBLE1BQUE7O1lBRUEsSUFBQSxVQUFBLEdBQUE7WUFDQSxJQUFBLFVBQUEsUUFBQTs7WUFFQSxNQUFBLElBQUEsT0FBQSxNQUFBLFdBQUEsTUFBQSxLQUFBLElBQUEsTUFBQSxLQUFBLFVBQUEsVUFBQTtnQkFDQSxRQUFBLFFBQUE7ZUFDQSxVQUFBLEtBQUE7Z0JBQ0EsUUFBQSxPQUFBOzs7WUFHQSxPQUFBOzs7UUFHQSxRQUFBLFNBQUEsVUFBQSxJQUFB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OztLQUdBIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbImFuZ3VsYXIubW9kdWxlKFwiYXBwLmNvbmZpZ1wiLCBbXSlcbi5jb25zdGFudChcImNvbmZpZ1wiLCB7XG5cdFwiYXBpXCI6IFwiaHR0cDovL2xvY2FsaG9zdDo4MDAxL2FwaS92MVwiLCBcblx0XCJkZWJ1Z1wiOiB0cnVlLFxuICAgICAgICAnSU1HX0ZPTERFUic6ICdzcmMvYXBwX21vZHVsZXMvY29tbW9uL3RlbXBsYXRlcy8nLFxuICAgICAgICAnU1JDX0ZPTERFUic6ICdzcmMvYXBwX21vZHVsZXMvJ1xufSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwLmNhcmRzJywgW10pO1xuXG4iLCIndXNlIHN0cmljdCc7XG5cbmFuZ3VsYXIubW9kdWxlKCdhcHAnLCBbJ25nUm91dGUnLCAnYXBwLmNvbmZpZycsICdhcHAuaG9tZScsICdhbmd1bGFyTW9kYWxTZXJ2aWNlJ10pO1xuICBcbmFuZ3VsYXIubW9kdWxlKCdhcHAnKS5jb25maWcoWyckaHR0cFByb3ZpZGVyJywgZnVuY3Rpb24gKCRodHRwUHJvdmlkZXIpIHtcbiAgICAgICAgXG4gICAgJGh0dHBQcm92aWRlci5kZWZhdWx0cy5oZWFkZXJzLmNvbW1vbiA9IHsgXG4gICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vanNvbjtvZGF0YT12ZXJib3NlJyxcbiAgICAgICAgJ1gtTG9naW4tQWpheC1jYWxsJzogJ3RydWUnLFxuICAgICAgICAnWC1SZXF1ZXN0ZWQtV2l0aCc6IFwiWE1MSHR0cFJlcXVlc3RcIixcbiAgICAgICAgJ1gtQ1NSRi1UT0tFTic6IExhcmF2ZWwuY3NyZlRva2VuLFxuICAgICAgfTtcbn1dKVxuIFxuYW5ndWxhci5tb2R1bGUoJ2FwcCcpLnJ1bihbZnVuY3Rpb24gKCkge1xuIFxufV0pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcC5ob21lJywgWyduZ1JvdXRlJywgJ2FwcC5jb25maWcnLCAnbmdBbmltYXRlJywgJ2FwcC5jYXJkcycsICdoYy5tYXJrZWQnLCAnbmdTYW5pdGl6ZSddKTtcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAuY2FyZHMnKS5jb25maWcoZnVuY3Rpb24oJHJvdXRlUHJvdmlkZXIpIHtcbiAgIFxufSk7IiwiKGZ1bmN0aW9uICgpIHtcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwJykuY29uZmlnKFsnJHJvdXRlUHJvdmlkZXInLCAnY29uZmlnJywgZnVuY3Rpb24oJHJvdXRlUHJvdmlkZXIsIGNvbmZpZykge1xuXG4gICAgICAkcm91dGVQcm92aWRlclxuICAgICAgICAud2hlbignLycsIHtcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBjb25maWcuU1JDX0ZPTERFUiArICdob21lL3RlbXBsYXRlcy9ob21lLXRlbXBsYXRlLmh0bWwnLFxuICAgICAgICAgICAgY29udHJvbGxlcjogJ0hvbWVDb250cm9sbGVyJyxcbiAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ2hvbWUnXG4gICAgICAgIH0pXG5cbiAgICAgICAgLm90aGVyd2lzZSh7cmVkaXJlY3RUbzogJy8nfSk7IFxuICAgIH1dKTtcbn0pKCk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcC5ob21lJykuY29uZmlnKGZ1bmN0aW9uKCRyb3V0ZVByb3ZpZGVyKSB7XG5cbn0pOyIsIlxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xuXG4gICAgLy8gc3dpdGNoIGZvcm1zXG4gICAgJCgnLm1lc3NhZ2UgYScpLmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgXG4gICAgICAgICQoJ2Zvcm0nKS5hbmltYXRlKHtoZWlnaHQ6IFwidG9nZ2xlXCIsIG9wYWNpdHk6IFwidG9nZ2xlXCJ9LCBcInNsb3dcIik7XG4gICAgICAgIFxuICAgICAgICBpZih3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgPT0gJy9sb2dpbicpIHtcbiAgICAgICAgICAgIGhpc3RvcnkucHVzaFN0YXRlKHt9LCBcIlJlZ2lzdGVyXCIsIFwiL3JlZ2lzdGVyXCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaGlzdG9yeS5wdXNoU3RhdGUoe30sIFwiTG9naW5cIiwgXCIvbG9naW5cIik7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgICQoJ2Zvcm0gLmhlbHAtYmxvY2snKS5oaWRlKCk7XG4gICAgfSk7XG5cbn0pOyIsIihmdW5jdGlvbigpe1xuICAgICAgICBcbiAgICAvKipcbiAgICAgKiBGWUksIGNhcmRzIG11c3QgaGF2ZSB0aGlzIGJhc2ljIHN0cnVjdHVyZVxuICAgICAqIHtcbiAgICAgKiAgICAgIFwiaWRcIjogMSxcbiAgICAgICAgICAgIFwibmFtZVwiOiBcIkF1dCBtb2RpIHF1YXNpIGNvcnJ1cHRpIHZlcml0YXRpcyBzdW50IGRvbG9yZS5cIixcbiAgICAgICAgICAgIGNvbnRlbnQ6XCJMb3JlbSBJcHN1bSBkb2xvciBlc3QgI2ltcG9ydGFudC4gI215dGFnXCIsXG4gICAgICAgICAgICB0YWdzOiBbXG4gICAgICAgICAgICAgICAgXCJteXRhZ1wiLCBcImltcG9ydGFudFwiXG4gICAgICAgICAgICBdXG4gICAgICAgIH1cbiAgICAqL1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuY2FyZHMnKS5jb250cm9sbGVyKCdDYXJkc0NvbnRyb2xsZXInLCBbJyRzY29wZScsICdjYXJkc0ZhY3RvcnknLCBDYXJkc0NvbnRyb2xsZXJdKTtcblxuICAgIGZ1bmN0aW9uIENhcmRzQ29udHJvbGxlcigkc2NvcGUsIGNhcmRzRmFjdG9yeSl7XG4gICAgICAgIFxuICAgICAgICBjYXJkc0ZhY3RvcnkuZ2V0Q2FyZHMoKS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXsgICAgICAgXG4gICAgICAgICAgICAkc2NvcGUuY2FyZHMgPSByZXNwb25zZS5kYXRhO1xuICAgICAgICB9KTsgICAgXG5cbiAgICAgICAgY3JlYXRlQ2FyZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgJHNjb3BlLmNhcmRzLnB1c2goe1xuICAgICAgICAgICAgICAgIGNvbnRlbnQ6IFwiUmVub21icmFyIHByb3llY3RvIGEgY2FyZHMuICNjb3JlY2hhbmdlXCIsXG4gICAgICAgICAgICAgICAgdGFnczogW1xuICAgICAgICAgICAgICAgICAgICBcImNvcmVjaGFuZ2VcIiwgXCJpbXBvcnRhbnRcIlxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgIH1cbn0pKCk7XG4iLCIoZnVuY3Rpb24gKCkge1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5jYXJkcycpLmZhY3RvcnkoJ2NhcmRzRmFjdG9yeScsIFsnJGh0dHAnLCAnJHEnLCAnY29uZmlnJywgY2FyZHNGYWN0b3J5XSk7XG5cbiAgICBmdW5jdGlvbiBjYXJkc0ZhY3RvcnkoJGh0dHAsICRxLCBjb25maWcpIHtcblxuICAgICAgICB2YXIgZmFjdG9yeSA9IHt9O1xuICAgICAgICB2YXIgZW5kcG9pbnQgPSBcIi9jYXJkc1wiO1xuICAgICAgICB2YXIgY2FyZHM7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGZhY3RvcnkuZ2V0QWxsID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICB2YXIgZGVmZXJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICAgICAgICB2YXIgcHJvbWlzZSA9IGRlZmVyZWQucHJvbWlzZTtcblxuICAgICAgICAgICAgY2FyZHMgPSAkaHR0cC5nZXQoY29uZmlnLmFwaSArIGVuZHBvaW50LCB7IGNhY2hlOiB0cnVlfSk7IC8vIGdldCBsaXN0XG5cbiAgICAgICAgICAgIGNhcmRzLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgZGVmZXJlZC5yZXNvbHZlKHJlc3BvbnNlKTtcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICBkZWZlcmVkLnJlamVjdChlcnIpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgICAgICB9O1xuXG4gICAgICAgIGZhY3Rvcnkuc2F2ZSA9IGZ1bmN0aW9uIChkYXRhKSB7XG5cbiAgICAgICAgICAgIHZhciBkZWZlcmVkID0gJHEuZGVmZXIoKTtcbiAgICAgICAgICAgIHZhciBwcm9taXNlID0gZGVmZXJlZC5wcm9taXNlO1xuXG4gICAgICAgICAgICAkaHR0cC5wb3N0KGNvbmZpZy5hcGkgKyBlbmRwb2ludCwgZGF0YSkudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICBkZWZlcmVkLnJlc29sdmUocmVzcG9uc2UpO1xuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgIGRlZmVyZWQucmVqZWN0KGVycik7XG4gICAgICAgICAgICB9KTtcbiBcbiAgICAgICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBmYWN0b3J5LnVwZGF0ZSA9IGZ1bmN0aW9uIChkYXRhKSB7XG5cbiAgICAgICAgICAgIHZhciBkZWZlcmVkID0gJHEuZGVmZXIoKTtcbiAgICAgICAgICAgIHZhciBwcm9taXNlID0gZGVmZXJlZC5wcm9taXNlO1xuXG4gICAgICAgICAgICAkaHR0cC5wdXQoY29uZmlnLmFwaSArIGVuZHBvaW50ICsgJy8nICsgZGF0YS5pZCwgZGF0YSkudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICBkZWZlcmVkLnJlc29sdmUocmVzcG9uc2UpO1xuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgIGRlZmVyZWQucmVqZWN0KGVycik7XG4gICAgICAgICAgICB9KTtcbiBcbiAgICAgICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgICAgICB9XG5cbiAgICAgICAgZmFjdG9yeS5kZWxldGUgPSBmdW5jdGlvbiAoaWQpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIGRlZmVyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgICAgICAgdmFyIHByb21pc2UgPSBkZWZlcmVkLnByb21pc2U7XG5cbiAgICAgICAgICAgICRodHRwLmRlbGV0ZShjb25maWcuYXBpICsgZW5kcG9pbnQgKyAnLycgKyBpZCkudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICBkZWZlcmVkLnJlc29sdmUocmVzcG9uc2UpO1xuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgIGRlZmVyZWQucmVqZWN0KGVycik7XG4gICAgICAgICAgICB9KTtcbiBcbiAgICAgICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhY3Rvcnk7XG4gICAgfVxuXG59KSgpO1xuXG4iLCIoZnVuY3Rpb24gKCkge1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmNvbnRyb2xsZXIoJ0hlYWRlckNvbnRyb2xsZXInLCBbJyRzY29wZScsIEhlYWRlckNvbnRyb2xsZXJdKTtcblxuICAgIGZ1bmN0aW9uIEhlYWRlckNvbnRyb2xsZXIoJHNjb3BlKSB7XG4gICAgICAgIFxuICAgIH1cbn0pKCk7XG5cblxuIiwiKGZ1bmN0aW9uICgpIHtcblxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAnKS5jb250cm9sbGVyKCdMYXlvdXRDb250cm9sbGVyJywgWyckc2NvcGUnLCAnJHNjZScsIExheW91dENvbnRyb2xsZXJdKTtcblxuICAgIGZ1bmN0aW9uIExheW91dENvbnRyb2xsZXIoJHNjb3BlLCAkc2NlKSB7XG5cbiAgICAgICAgJHNjb3BlLnRyYW5zbGF0aW9ucyA9IHtcbiAgICAgICAgICAgIHN1YnRpdGxlOiAnU2ltcGx5IGhhc2ggeW91ciBub3RlcyBhbmQgbmF2aWdhdGUgdGhlbSdcbiAgICAgICAgfTsgICAgICAgICAgICBcbiAgICAgICAgXG4gICAgICAgICRzY29wZS50YWdVc2VyQ2xpY2sgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICB2YXIgdGFnVGV4dCA9IGUudGFyZ2V0LmlubmVyVGV4dDtcbiAgICAgICAgICAgIGFsZXJ0KCd0YWdVc2VyQ2xpY2ssIHRhZ1RleHQ6ICcgKyB0YWdUZXh0KTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgICRzY29wZS50YWdUZXJtQ2xpY2sgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICB2YXIgdGFnVGV4dCA9IGUudGFyZ2V0LmlubmVyVGV4dDtcbiAgICAgICAgICAgIGFsZXJ0KCd0YWdUZXJtQ2xpY2ssIHRhZ1RleHQ6ICcgKyB0YWdUZXh0KTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8vIFlvdSBjb3VsZCBkZWZpbmUgJ3RhZ1VzZXJDbGljaycgYW5kICd0YWdUZXJtQ2xpY2snXG4gICAgICAgIC8vIG9uIHRoZSAnJHJvb3RTY29wZScuIFRoaXMgd2F5IHlvdSBjYW4gaGFuZGxlIHdoYXRldmVyXG4gICAgICAgIC8vIGxvZ2ljIHlvdSB3YW50IGZvciBoYXNodGFncyBpbiBvbmUgcGxhY2UgcmF0aGVyIHRoYW5cbiAgICAgICAgLy8gaGF2aW5nIHRvIGRlZmluZSBpdCBpbiBlYWNoIGNvbnRyb2xsZXIuXG4gICAgICAgIFxuICAgICAgICAkc2NvcGUudHJ1c3RIdG1sID0gZnVuY3Rpb24oaHRtbCkge1xuICAgICAgICAgICAgLy8gU2FuaXRpemUgbWFudWFsbHkgaWYgbmVjZXNzYXJ5LiBJdCdzIGxpa2VseSB0aGlzXG4gICAgICAgICAgICAvLyBodG1sIGhhcyBhbHJlYWR5IGJlZW4gc2FuaXRpemVkIHNlcnZlciBzaWRlXG4gICAgICAgICAgICAvLyBiZWZvcmUgaXQgd2VudCBpbnRvIHlvdXIgZGF0YWJhc2UuXG4gICAgICAgICAgICAvLyBEb24ndCBob2xkIG1lIGxpYWJsZSBmb3IgWFNTLi4uIG5ldmVyIGFzc3VtZSA6filcbiAgICAgICAgICAgIHJldHVybiAkc2NlLnRydXN0QXNIdG1sKGh0bWwpO1xuICAgICAgICB9O1xuICAgIH1cbn0pKCk7XG5cblxuIiwiKGZ1bmN0aW9uICgpIHtcbiAgICAvLyBCZWNhdXNlIG9mIHRoZSBhbm1lIGFuZCBFIHR5cGUsIHdvcmtzIGF1dG9tYXRpY2FsbHkgZm9yIGV2ZXJ5IHRleHRhcmVhXG4gICAgLy8gcmVmOiBodHRwczovL2dpc3QuZ2l0aHViLmNvbS90aG9tc2VkZG9uLzQ3MDM5NjhcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwJykuZGlyZWN0aXZlKCdlbGFzdGljYXJlYScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnQScsXG4gICAgICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgICAgICAgICB2YXIgdGhyZXNob2xkID0gMzUsXG4gICAgICAgICAgICAgICAgICAgICAgICBtaW5IZWlnaHQgPSBlbGVtZW50WzBdLm9mZnNldEhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmdMZWZ0ID0gZWxlbWVudC5jc3MoJ3BhZGRpbmdMZWZ0JyksXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nUmlnaHQgPSBlbGVtZW50LmNzcygncGFkZGluZ1JpZ2h0Jyk7XG5cbiAgICAgICAgICAgICAgICB2YXIgJHNoYWRvdyA9IGFuZ3VsYXIuZWxlbWVudCgnPGRpdj48L2Rpdj4nKS5jc3Moe1xuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgICAgICAgICAgICAgICAgdG9wOiAtMTAwMDAsXG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6IC0xMDAwMCxcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IGVsZW1lbnRbMF0ub2Zmc2V0V2lkdGggLSBwYXJzZUludChwYWRkaW5nTGVmdCB8fCAwKSAtIHBhcnNlSW50KHBhZGRpbmdSaWdodCB8fCAwKSxcbiAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6IGVsZW1lbnQuY3NzKCdmb250U2l6ZScpLFxuICAgICAgICAgICAgICAgICAgICBmb250RmFtaWx5OiBlbGVtZW50LmNzcygnZm9udEZhbWlseScpLFxuICAgICAgICAgICAgICAgICAgICBsaW5lSGVpZ2h0OiBlbGVtZW50LmNzcygnbGluZUhlaWdodCcpLFxuICAgICAgICAgICAgICAgICAgICByZXNpemU6ICdub25lJ1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmJvZHkpLmFwcGVuZCgkc2hhZG93KTtcblxuICAgICAgICAgICAgICAgIHZhciB1cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB0aW1lcyA9IGZ1bmN0aW9uIChzdHJpbmcsIG51bWJlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIHIgPSAnJzsgaSA8IG51bWJlcjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgciArPSBzdHJpbmc7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcjtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHZhciB2YWwgPSBlbGVtZW50LnZhbCgpLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvJi9nLCAnJmFtcDsnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXG4kLywgJzxici8+Jm5ic3A7JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxuL2csICc8YnIvPicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcc3syLH0vZywgZnVuY3Rpb24gKHNwYWNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aW1lcygnJm5ic3A7Jywgc3BhY2UubGVuZ3RoIC0gMSkgKyAnICc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgJHNoYWRvdy5odG1sKHZhbCk7XG5cbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5jc3MoJ2hlaWdodCcsIE1hdGgubWF4KCRzaGFkb3dbMF0ub2Zmc2V0SGVpZ2h0ICsgdGhyZXNob2xkLCBtaW5IZWlnaHQpKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAkc2hhZG93LnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgZWxlbWVudC5iaW5kKCdrZXl1cCBrZXlkb3duIGtleXByZXNzIGNoYW5nZScsIHVwZGF0ZSk7XG4gICAgICAgICAgICAgICAgdXBkYXRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHsgXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmRpcmVjdGl2ZSgnaGFzaHRhZ2lmeScsIFsnJHRpbWVvdXQnLCAnJGNvbXBpbGUnLFxuICAgICAgICBmdW5jdGlvbigkdGltZW91dCwgJGNvbXBpbGUpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcmVzdHJpY3Q6ICdBJyxcbiAgICAgICAgICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgICAgICAgICB1Q2xpY2s6ICcmdXNlckNsaWNrJyxcbiAgICAgICAgICAgICAgICAgICAgdENsaWNrOiAnJnRlcm1DbGljaydcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBodG1sID0gZWxlbWVudC5odG1sKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChodG1sID09PSAnJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGF0dHJzLnVzZXJDbGljaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGh0bWwgPSBodG1sLnJlcGxhY2UoLyh8XFxzKSpAKFxcdyspL2csICckMTxhIG5nLWNsaWNrPVwidUNsaWNrKHskZXZlbnQ6ICRldmVudH0pXCIgY2xhc3M9XCJoYXNodGFnXCI+QCQyPC9hPicpOyBcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGF0dHJzLnRlcm1DbGljaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGh0bWwgPSBodG1sLnJlcGxhY2UoLyhefFxccykqIyhcXHcrKS9nLCAnJDE8YSBuZy1jbGljaz1cInRDbGljayh7JGV2ZW50OiAkZXZlbnR9KVwiIGNsYXNzPVwiaGFzaHRhZ1wiPiMkMjwvYT4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5odG1sKGh0bWwpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAkY29tcGlsZShlbGVtZW50LmNvbnRlbnRzKCkpKHNjb3BlKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIF0pO1xufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmRpcmVjdGl2ZSgnc2hvd01vcmUnLFxuICAgICAgICBbJ2NvbmZpZycsIGZ1bmN0aW9uIChjb25maWcpIHtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogY29uZmlnLklNR19GT0xERVIgKyAnc2hvd01vcmUuaHRtbCcsXG4gICAgICAgICAgICAgICAgcmVzdHJpY3Q6ICdBJyxcbiAgICAgICAgICAgICAgICB0cmFuc2NsdWRlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICAgICAgICAgICdzaG93TW9yZUhlaWdodCc6ICdAJ1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogWyckc2NvcGUnLCAnJGVsZW1lbnQnLCAnJGludGVydmFsJywgZnVuY3Rpb24gKCRzY29wZSwgJGVsZW1lbnQsICRpbnRlcnZhbCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXhwYW5kZWQgPSBmYWxzZTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgJGludGVydmFsKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW5kZXJTdHlsZXMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIDMwMCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5leHBhbmRhYmxlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiByZW5kZXJTdHlsZXMoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCRlbGVtZW50LmhlaWdodCgpID49ICRzY29wZS5zaG93TW9yZUhlaWdodCAmJiAkc2NvcGUuZXhwYW5kZWQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5leHBhbmRhYmxlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5zaG93TGVzc1N0eWxlID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdtYXgtaGVpZ2h0JzogJHNjb3BlLnNob3dNb3JlSGVpZ2h0ICsgJ3B4JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnb3ZlcmZsb3cnOiAnaGlkZGVuJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfV0pO1xufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAnKVxuICAgICAgICAuZmlsdGVyKCdyZWR1Y2VCeScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChjb2xsZWN0aW9uLCBmaWVsZCkge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHJldHVybiBjb2xsZWN0aW9uLnJlZHVjZShmdW5jdGlvbihvdXRwdXQsIGN1cnJlbnQpe1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoIWZpZWxkRXhpc3RzKG91dHB1dCwgZmllbGQsIGN1cnJlbnRbZmllbGRdKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gb3V0cHV0LmNvbmNhdChjdXJyZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgICAgICAgICAgICAgICAgIH0sIFtdKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gZmllbGRFeGlzdHMoaGF5c3RhY2ssIGZpZWxkTmFtZSwgZmllbGRWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaGF5c3RhY2suc29tZShmdW5jdGlvbihlbCkge1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBlbFtmaWVsZE5hbWVdID09PSBmaWVsZFZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9KTsgXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTsgICAgICAgICAgICBcbiAgICAgICAgfSk7XG59KSgpO1xuXG4iLCIoZnVuY3Rpb24oKXtcbiAgICBcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmhvbWUnKS5jb250cm9sbGVyKCdGb3JtQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJ2NhcmRzRmFjdG9yeScsICdIb21lQ29udGV4dFNlcnZpY2UnLCBGb3JtQ29udHJvbGxlcl0pO1xuICAgIFxuICAgIGZ1bmN0aW9uIEZvcm1Db250cm9sbGVyKCRzY29wZSwgY2FyZHNGYWN0b3J5LCBIb21lQ29udGV4dFNlcnZpY2UpIHtcbiAgICAgICAgXG4gICAgICAgICRzY29wZS50cmFuc2xhdGlvbnMud3JpdGVfc29tZXRoaW5nID0gXCJXcml0ZSBzb21ldGhpbmcgYW5kIGhhc2ggaXQuLi5cIjtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBXYXkgdG8ga2VlcCBzaWJsaW5ncyBjb25uZWN0ZWQgYW5kIHNoYXJpbmcgc2NvcGVcbiAgICAgICAgICovXG4gICAgICAgICRzY29wZS5jb250ZXh0ID0gSG9tZUNvbnRleHRTZXJ2aWNlLmNvbnRleHQ7XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogU3VibWl0IGZvcm1cbiAgICAgICAgICogQHJldHVybnMgdm9pZFxuICAgICAgICAgKi9cbiAgICAgICAgJHNjb3BlLmNyZWF0ZUNhcmQgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIGlmICgkc2NvcGUuY29udGVudCkge1xuXG4gICAgICAgICAgICAgICAgbGV0IGRhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICRzY29wZS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICBjb250ZW50OiAkc2NvcGUuY29udGVudFxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBjYXJkc0ZhY3Rvcnkuc2F2ZShkYXRhKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICBkYXRhLmNsYXNzID0gJ2hpZ2hsaWdodGVkJztcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmNvbnRleHQuY2FyZHMucHVzaChkYXRhKTtcbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgICAgICAkc2NvcGUuY29udGVudCA9ICcnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcblxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuaG9tZScpLmNvbnRyb2xsZXIoJ0hvbWVDb250cm9sbGVyJywgWyckc2NvcGUnLCBIb21lQ29udHJvbGxlcl0pO1xuXG4gICAgZnVuY3Rpb24gSG9tZUNvbnRyb2xsZXIoJHNjb3BlKSB7XG5cbiAgICAgICAgJHNjb3BlLnRyYW5zbGF0aW9ucyA9IHtcbiAgICAgICAgICAgIGhvbWU6IHt9XG4gICAgICAgIH07ICAgICAgICAgICAgXG4gICAgfVxufSkoKTtcblxuXG4iLCIoZnVuY3Rpb24oKXtcbiAgICBcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmhvbWUnKS5jb250cm9sbGVyKCdMaXN0Q29udHJvbGxlcicsIFsnJHNjb3BlJywgJ2NvbmZpZycsICdjYXJkc0ZhY3RvcnknLCAnTW9kYWxTZXJ2aWNlJywgJ0hvbWVDb250ZXh0U2VydmljZScsIExpc3RDb250cm9sbGVyXSk7XG4gICAgXG4gICAgZnVuY3Rpb24gTGlzdENvbnRyb2xsZXIoJHNjb3BlLCBjb25maWcsIGNhcmRzRmFjdG9yeSwgTW9kYWxTZXJ2aWNlLCBIb21lQ29udGV4dFNlcnZpY2Upe1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAkc2NvcGUudHJhbnNsYXRpb25zLm5vX3Jlc3VsdHMgPSBcIk5vIHJlc3VsdHNcIjsgICAgICAgIFxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdheSB0byBrZWVwIHNpYmxpbmdzIGNvbm5lY3RlZCBhbmQgc2hhcmluZyBzY29wZVxuICAgICAgICAgKi9cbiAgICAgICAgJHNjb3BlLmNvbnRleHQgPSBIb21lQ29udGV4dFNlcnZpY2UuY29udGV4dDtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHZXQgY2FyZHMgbGlzdFxuICAgICAgICAgKi9cbiAgICAgICAgY2FyZHNGYWN0b3J5XG4gICAgICAgICAgICAuZ2V0QWxsKClcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuXG4gICAgICAgICAgICAgICAgJHNjb3BlLmNvbnRleHQuY2FyZHMgPSBhbmd1bGFyLmZyb21Kc29uKHJlc3BvbnNlLmRhdGEpO1xuXG4gICAgICAgICAgICAgICAgJHNjb3BlLm9yZGVyQ2FyZHNCeSA9ICd1cGRhdGVkX2F0JztcblxuICAgICAgICAgICAgICAgICRzY29wZS5kaXJlY3Rpb24gPSAncmV2ZXJzZSc7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpOyAvLyBUT0RPOiBUcmF0YXIgZWwgZXJyb3JcbiAgICAgICAgICAgIH0pOyAgXG4gICAgICAgIFxuICAgICAgICAkc2NvcGUucGluQ2FyZCA9IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbGV0IGluZGV4ID0gJHNjb3BlLmNvbnRleHQuY2FyZHMuaW5kZXhPZihpdGVtKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYoaXRlbS5zdGlja3kpIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpdGVtLnN0aWNreSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGl0ZW0uY2xhc3MgPSBpdGVtLmNsYXNzID8gaXRlbS5jbGFzcy5yZXBsYWNlKFwic3RpY2t5XCIsIFwiXCIpIDogXCJcIjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gcHV0IGl0IGZpcnN0XG4gICAgICAgICAgICAgICAgaXRlbS5zdGlja3kgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGl0ZW0uY2xhc3MgPSBpdGVtLmNsYXNzID8gaXRlbS5jbGFzcyArIFwiIHN0aWNreVwiIDogXCJzdGlja3lcIjtcbiAgICAgICAgICAgICAgICAkc2NvcGUuY29udGV4dC5jYXJkcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgICAgICRzY29wZS5jb250ZXh0LmNhcmRzLnVuc2hpZnQoaXRlbSk7XG4gICAgICAgICAgICB9ICAgICAgICAgICAgXG4gICAgICAgIH07ICBcbiAgICAgICAgICAgIFxuICAgICAgICAkc2NvcGUuZGVsZXRlID0gZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBKdXN0IHByb3ZpZGUgYSB0ZW1wbGF0ZSB1cmwsIGEgY29udHJvbGxlciBhbmQgY2FsbCAnc2hvd01vZGFsJy5cbiAgICAgICAgICAgIE1vZGFsU2VydmljZS5zaG93TW9kYWwoe1xuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBjb25maWcuU1JDX0ZPTERFUiArIFwiaG9tZS9tb2RhbHMvY29uZmlybS5odG1sXCIsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogXCJZZXNOb0NvbnRyb2xsZXJcIixcbiAgICAgICAgICAgICAgICBpbnB1dHM6IHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgJ3RpdGxlJzogJ0RlbGV0ZSBjYXJkPycsXG4gICAgICAgICAgICAgICAgICAgICAgICAnY29udGVudCc6IFwiWW91J2xsIG5vdCBiZSBhYmxlIHRvIHJlY292ZXIgaXRcIiBcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKG1vZGFsKSB7XG4gICAgICAgICAgICAgICAgbW9kYWwuZWxlbWVudC5tb2RhbCgpO1xuICAgICAgICAgICAgICAgIG1vZGFsLmNsb3NlLnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgaWYocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXJkc0ZhY3RvcnkuZGVsZXRlKGl0ZW0uaWQpLnRoZW4oZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgaW5kZXggPSAkc2NvcGUuY29udGV4dC5jYXJkcy5pbmRleE9mKGl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5jb250ZXh0LmNhcmRzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0gXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgICRzY29wZS5lZGl0ID0gZnVuY3Rpb24oaXRlbSl7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIE1vZGFsU2VydmljZS5zaG93TW9kYWwoe1xuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBjb25maWcuU1JDX0ZPTERFUiArIFwiaG9tZS9tb2RhbHMvZWRpdC5odG1sXCIsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogXCJFZGl0Q29udHJvbGxlclwiLFxuICAgICAgICAgICAgICAgIGlucHV0czoge1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXJkOiBpdGVtXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIChtb2RhbCkge1xuICAgICAgICAgICAgICAgIG1vZGFsLmVsZW1lbnQubW9kYWwoKTtcbiAgICAgICAgICAgICAgICBtb2RhbC5jbG9zZS50aGVuKGZ1bmN0aW9uIChyZXN1bHQpe1xuICAgICAgICAgICAgICAgICAgICBpZihyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNhcmQgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGl0ZW0uaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogbW9kYWwuc2NvcGUuZm9ybS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IG1vZGFsLnNjb3BlLmZvcm0uY29udGVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhcmRzRmFjdG9yeS51cGRhdGUoY2FyZCkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgaW5kZXggPSAkc2NvcGUuY29udGV4dC5jYXJkcy5pbmRleE9mKGl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuY29weShjYXJkLCAkc2NvcGUuY29udGV4dC5jYXJkc1tpbmRleF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgICRzY29wZS52aWV3QXNNYXJrZG93bk1vZGFsID0gZnVuY3Rpb24gKGl0ZW0pIHtcblxuICAgICAgICAgICAgLy8gSnVzdCBwcm92aWRlIGEgdGVtcGxhdGUgdXJsLCBhIGNvbnRyb2xsZXIgYW5kIGNhbGwgJ3Nob3dNb2RhbCcuXG4gICAgICAgICAgICBNb2RhbFNlcnZpY2Uuc2hvd01vZGFsKHtcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogY29uZmlnLlNSQ19GT0xERVIgKyBcImhvbWUvbW9kYWxzL21hcmtkb3duLmh0bWxcIixcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBcIk1hcmtkb3duQ29udHJvbGxlclwiLFxuICAgICAgICAgICAgICAgIGlucHV0czoge1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAnY2FyZCc6IGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKG1vZGFsKSB7XG4gICAgICAgICAgICAgICAgbW9kYWwuZWxlbWVudC5tb2RhbCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgfVxufSkoKTsiLCIoZnVuY3Rpb24oKXtcbiAgICBcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmhvbWUnKS5jb250cm9sbGVyKCdTZWFyY2hDb250cm9sbGVyJywgWyckc2NvcGUnLCAnSG9tZUNvbnRleHRTZXJ2aWNlJywgU2VhcmNoQ29udHJvbGxlcl0pO1xuICAgIFxuICAgIGZ1bmN0aW9uIFNlYXJjaENvbnRyb2xsZXIoJHNjb3BlLCBIb21lQ29udGV4dFNlcnZpY2Upe1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAkc2NvcGUudHJhbnNsYXRpb25zLnF1aWNrX3NlYXJjaCA9IFwiUXVpY2sgU2VhcmNoLi4uXCI7ICAgIFxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdheSB0byBrZWVwIHNpYmxpbmdzIGNvbm5lY3RlZCBhbmQgc2hhcmluZyBzY29wZVxuICAgICAgICAgKi9cbiAgICAgICAgJHNjb3BlLmNvbnRleHQgPSBIb21lQ29udGV4dFNlcnZpY2UuY29udGV4dDtcbiAgICB9XG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmhvbWUnKS5jb250cm9sbGVyKCdTdGFja0NvbnRyb2xsZXInLCBbJyRzY29wZScsICdIb21lQ29udGV4dFNlcnZpY2UnLCBTdGFja0NvbnRyb2xsZXJdKTtcblxuICAgIGZ1bmN0aW9uIFN0YWNrQ29udHJvbGxlcigkc2NvcGUsIEhvbWVDb250ZXh0U2VydmljZSkge1xuXG4gICAgICAgICRzY29wZS50cmFuc2xhdGlvbnMuaG9tZS5zdGFja0xpc3QgPSB7XG4gICAgICAgICAgICB0aXRsZTogXCJTdGFja3NcIlxuICAgICAgICB9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBXYXkgdG8ga2VlcCBzaWJsaW5ncyBjb25uZWN0ZWQgYW5kIHNoYXJpbmcgc2NvcGVcbiAgICAgICAgICovXG4gICAgICAgICRzY29wZS5jb250ZXh0ID0gSG9tZUNvbnRleHRTZXJ2aWNlLmNvbnRleHQ7XG5cbiAgICAgICAgJHNjb3BlLmNvbnRleHQuc3RhY2tzID0gW3tcbiAgICAgICAgICAgIGlkOiAxLFxuICAgICAgICAgICAgbmFtZTogJ1VuaXZlcnNhbCdcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDIsXG4gICAgICAgICAgICBuYW1lOiAnU2Vjb25kIHN0YWNrJyxcbiAgICAgICAgICAgIHBhcnRpY2lwYW50czoge1xuICAgICAgICAgICAgICAgIGNvdW50OiAxLFxuICAgICAgICAgICAgICAgIGxpc3Q6IHtcbiAgICAgICAgICAgICAgICAgICAgJ0pvaG4gRG9lJzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW1nOiAncHJvZmlsZS1waWN0dXJlLTYweDYwLnBuZydcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDMsXG4gICAgICAgICAgICBuYW1lOiAnQW5kIHNvIG9uJyxcbiAgICAgICAgICAgIHBhcnRpY2lwYW50czoge1xuICAgICAgICAgICAgICAgIGNvdW50OiAxNSxcbiAgICAgICAgICAgICAgICBsaXN0OiB7XG4gICAgICAgICAgICAgICAgICAgICdKb2huIERvZSc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGltZzogJ3Byb2ZpbGUtcGljdHVyZS02MHg2MC5wbmcnXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICdDaGFybGVzIERhdmlkc29uJzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW1nOiAncHJvZmlsZS1waWN0dXJlLTYweDYwLnBuZydcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgJ0FsZXggU3Rld2FyZCc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGltZzogJ3Byb2ZpbGUtcGljdHVyZS02MHg2MC5wbmcnXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1dO1xuICAgIH1cbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcblxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuaG9tZScpLmNvbnRyb2xsZXIoJ1RhZ0NvbnRyb2xsZXInLCBbJyRzY29wZScsICdyZWR1Y2VCeUZpbHRlcicsICdIb21lQ29udGV4dFNlcnZpY2UnLCBUYWdDbG91ZENvbnRyb2xsZXJdKTtcblxuICAgIGZ1bmN0aW9uIFRhZ0Nsb3VkQ29udHJvbGxlcigkc2NvcGUsIHJlZHVjZUJ5RmlsdGVyLCBIb21lQ29udGV4dFNlcnZpY2UpIHtcblxuICAgICAgICAgJHNjb3BlLnRyYW5zbGF0aW9ucy5ob21lLnRhZ0Nsb3VkID0ge1xuICAgICAgICAgICAgdGl0bGU6IFwiSW4gdGhpcyBwYWdlXCJcbiAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogV2F5IHRvIGtlZXAgc2libGluZ3MgY29ubmVjdGVkIGFuZCBzaGFyaW5nIHNjb3BlXG4gICAgICAgICAqL1xuICAgICAgICAkc2NvcGUuY29udGV4dCA9IEhvbWVDb250ZXh0U2VydmljZS5jb250ZXh0O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBLZWVwIHRyYWNrIG9mIGNhcmQgbGlzdCBjaGFuZ2VzXG4gICAgICAgICAqIEByZXR1cm5zIHZvaWRcbiAgICAgICAgICovXG4gICAgICAgIGZ1bmN0aW9uIHVwZGF0ZVRhZ0Nsb3VkKCkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBleGNsdWRlIGNhcmQgd2l0aCBubyB0YWdzXG4gICAgICAgICAgICBsZXQgY2FyZHMgPSAkc2NvcGUuY29udGV4dC5maWx0ZXJlZC5maWx0ZXIoZnVuY3Rpb24gKGNhcmQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FyZC50YWdzLmxlbmd0aCA+IDA7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gZXh0cmFjdCB0YWdzIGZyb20gY2FyZFxuICAgICAgICAgICAgbGV0IHRhZ3MgPSBjYXJkcy5tYXAoZnVuY3Rpb24gKGNhcmQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShhbmd1bGFyLnRvSnNvbihjYXJkLnRhZ3MpKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBtZXJnZSB0YWdzIGluIGZsYXR0ZW4gYXJyYXlcbiAgICAgICAgICAgIGxldCBtZXJnZWQgPSBbXS5jb25jYXQuYXBwbHkoW10sIHRhZ3MpO1xuXG4gICAgICAgICAgICAvLyBlbGltaW5hdGUgZHVwbGljYXRlcyBhbmQgc2VydmUgYXJyYXkgdG8gdmlld1xuICAgICAgICAgICAgJHNjb3BlLmNvbnRleHQudGFncyA9IHJlZHVjZUJ5RmlsdGVyKG1lcmdlZCwgJ2lkJyk7XG4gICAgICAgIH1cbiAgICAgICBcbiAgICAgICAgJHNjb3BlLiR3YXRjaENvbGxlY3Rpb24oJ2NvbnRleHQuZmlsdGVyZWQnLCB1cGRhdGVUYWdDbG91ZCApO1xuICAgIH1cbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmhvbWUnKVxuICAgICAgICAuZmlsdGVyKCdoaWdobGlnaHRUZXh0JywgZnVuY3Rpb24oJHNjZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh0ZXh0LCBwaHJhc2UpIHtcbiAgICAgICAgICAgICAgICBsZXQgaGlnaGxpZ2h0ZWQgPSBwaHJhc2VcbiAgICAgICAgICAgICAgICAgICAgICAgID8gdGV4dC5yZXBsYWNlKG5ldyBSZWdFeHAoJygnICsgcGhyYXNlICsgJyknLCAnZ2knKSwgJzxzcGFuIGNsYXNzPVwiaGlnaGxpZ2h0LXRleHRcIj4kMTwvc3Bhbj4nKVxuICAgICAgICAgICAgICAgICAgICAgICAgOiB0ZXh0O1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcmV0dXJuICRzY2UudHJ1c3RBc0h0bWwoaGlnaGxpZ2h0ZWQpO1xuICAgICAgICAgICAgfTsgICAgICAgICAgICBcbiAgICAgICAgfSk7XG59KSgpO1xuXG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwLmhvbWUnKS5zZXJ2aWNlKCdIb21lQ29udGV4dFNlcnZpY2UnLCBmdW5jdGlvbigpe1xuICAgIHRoaXMuY29udGV4dCA9IHtcbiAgICAgICAgY2FyZHM6IFtdLFxuICAgICAgICBxdWVyeTogJydcbiAgICB9O1xufSk7IiwiKGZ1bmN0aW9uKCkge1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5ob21lJykuY29udHJvbGxlcignRWRpdENvbnRyb2xsZXInLCBbJyRzY29wZScsICdkYXRhJywgJ2Nsb3NlJywgRWRpdENvbnRyb2xsZXJdKTtcbiAgICBcbiAgICBmdW5jdGlvbiBFZGl0Q29udHJvbGxlcigkc2NvcGUsIGRhdGEsIGNsb3NlKSB7XG5cbiAgICAgICAgJHNjb3BlLmZvcm0gPSB7fTtcbiAgICAgICAgJHNjb3BlLmZvcm0ubmFtZSA9IGRhdGEuY2FyZC5uYW1lO1xuICAgICAgICAkc2NvcGUuZm9ybS5jb250ZW50ID0gZGF0YS5jYXJkLmNvbnRlbnQ7XG5cbiAgICAgICAgJHNjb3BlLmNsb3NlID0gZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICBcbiAgICAgICAgICAgIGNsb3NlKHJlc3VsdCwgMjAwKTsgLy8gY2xvc2UsIGJ1dCBnaXZlIDIwMG1zIGZvciBib290c3RyYXAgdG8gYW5pbWF0ZVxuICAgICAgICB9O1xuICAgIH07XG59KSgpOyIsIihmdW5jdGlvbigpIHtcblxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuaG9tZScpLmNvbnRyb2xsZXIoJ01hcmtkb3duQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJ2RhdGEnLCAnY2xvc2UnLCBNYXJrZG93bkNvbnRyb2xsZXJdKTtcbiAgICBcbiAgICBmdW5jdGlvbiBNYXJrZG93bkNvbnRyb2xsZXIoJHNjb3BlLCBkYXRhLCBjbG9zZSkge1xuXG4gICAgICAgICRzY29wZS50aXRsZSA9IGRhdGEuY2FyZC5uYW1lO1xuICAgICAgICAkc2NvcGUuY29udGVudCA9IGRhdGEuY2FyZC5jb250ZW50O1xuXG4gICAgICAgICRzY29wZS5kaXNtaXNzTW9kYWwgPSBmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgICBjbG9zZShyZXN1bHQsIDIwMCk7IC8vIGNsb3NlLCBidXQgZ2l2ZSAyMDBtcyBmb3IgYm9vdHN0cmFwIHRvIGFuaW1hdGVcbiAgICAgICAgfTtcbiAgICB9O1xufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5ob21lJykuY29udHJvbGxlcignWWVzTm9Db250cm9sbGVyJywgWyckc2NvcGUnLCAnZGF0YScsICdjbG9zZScsIGZ1bmN0aW9uICgkc2NvcGUsIGRhdGEsIGNsb3NlKSB7XG4gICAgICAgICAgIFxuICAgICAgICAgICAgJHNjb3BlLnRpdGxlID0gZGF0YS50aXRsZTtcbiAgICAgICAgICAgICRzY29wZS5jb250ZW50ID0gZGF0YS5jb250ZW50O1xuICAgICAgICAgICBcbiAgICAgICAgICAgICRzY29wZS5jbG9zZSA9IGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICBjbG9zZShyZXN1bHQsIDIwMCk7IC8vIGNsb3NlLCBidXQgZ2l2ZSAyMDBtcyBmb3IgYm9vdHN0cmFwIHRvIGFuaW1hdGVcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1dKTtcbn0pKCk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
