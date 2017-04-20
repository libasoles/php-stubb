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

angular.module('app.home', ['ngRoute', 'app.config', 'ngAnimate', 'app.cards', 'app.stacks', 'hc.marked', 'ngSanitize']);

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
                            cardsFactory.update(card).then(function () {

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

                                    if (result) {    
                                        // ajax call
                                        cardsFactory.delete(item.id).then(function () {
                                            
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
                                templateUrl: config.SRC_FOLDER + "home/modals/edit.html",
                                controller: "EditController",
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
                                        cardsFactory.update(card).then(function () {
                                            
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
                }
            ]}
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
        $scope.$on('new-card', function(evt, item) {
            $scope.context.cards.push(item);
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
            angular.copy(newCard, $scope.context.cards[index]);
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
(function(){
    
    angular.module('app.stacks').directive('stackListPanel', ['config', function(config){
            
            return {
                restrict: 'E',
                templateUrl: config.SRC_FOLDER + 'stacks/templates/stack-list-panel.html',
                transclude: true,
                scope: {
                    
                },
                controller: ['$scope', 'stacksFactory', function($scope, stacksFactory) {
                        
                    $scope.translations = {
                        home: {
                            stackList: {
                                title: "Stacks"
                            }
                        }    
                    }
                               
                    $scope.stacks = stacksFactory.query();
                }]
            };
    }]);
})();
(function(){
    angular.module('app.stacks').factory('stacksFactory', ['$resource', 'config', function ($resource, config) {
        return $resource(config.api + '/users-stacks/:id', { id: '@_id' }, {
            update: {
              method: 'PUT' 
            }
        }); 
    }]);
})();


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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC1jb25maWcuanMiLCJjYXJkcy9tb2R1bGUuanMiLCJjb21tb24vbW9kdWxlLmpzIiwiaG9tZS9tb2R1bGUuanMiLCJzdGFja3MvbW9kdWxlLmpzIiwiY2FyZHMvY2FyZHMtcm91dGUuanMiLCJjb21tb24vYXBwLXJvdXRlLmpzIiwiaG9tZS9ob21lLXJvdXRlLmpzIiwibG9naW4vbG9naW4uanMiLCJzdGFja3MvaG9tZS1yb3V0ZS5qcyIsImNhcmRzL2RpcmVjdGl2ZXMvY2FyZC5qcyIsImNhcmRzL2RpcmVjdGl2ZXMvbmV3LWNhcmQuanMiLCJjYXJkcy9zZXJ2aWNlcy9jYXJkcy1mYWN0b3J5LmpzIiwiY29tbW9uL2NvbnRyb2xsZXJzL2hlYWRlci1jb250cm9sbGVycy5qcyIsImNvbW1vbi9jb250cm9sbGVycy9sYXlvdXQtY29udHJvbGxlcnMuanMiLCJjb21tb24vZGlyZWN0aXZlcy9lbGFzdGljQXJlYS5qcyIsImNvbW1vbi9kaXJlY3RpdmVzL2hhc2h0YWdpZnkuanMiLCJjb21tb24vZGlyZWN0aXZlcy9zaG93TW9yZS5qcyIsImNvbW1vbi9maWx0ZXJzL3JlZHVjZUJ5LmpzIiwiaG9tZS9jb250cm9sbGVycy9ob21lLWNvbnRyb2xsZXIuanMiLCJob21lL2NvbnRyb2xsZXJzL2xpc3QtY29udHJvbGxlci5qcyIsImhvbWUvY29udHJvbGxlcnMvc2VhcmNoLWNvbnRyb2xsZXIuanMiLCJob21lL2NvbnRyb2xsZXJzL3RhZy1jbG91ZC1jb250cm9sbGVyLmpzIiwiaG9tZS9maWx0ZXJzL2hpZ2hsaWdodFRleHQuanMiLCJob21lL3NlcnZpY2VzL2hvbWUtY29udGV4dC5qcyIsInN0YWNrcy9kaXJlY3RpdmVzL3N0YWNrLWxpc3QtcGFuZWwuanMiLCJzdGFja3Mvc2VydmljZXMvc3RhY2tzLWZhY3RvcnkuanMiLCJob21lL2NvbnRyb2xsZXJzL21vZGFscy9lZGl0LWNvbnRyb2xsZXIuanMiLCJob21lL2NvbnRyb2xsZXJzL21vZGFscy9tYXJrZG93bi1jb250cm9sbGVyLmpzIiwiaG9tZS9jb250cm9sbGVycy9tb2RhbHMveWVzLW5vLWNvbnRyb2xsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsUUFBQSxPQUFBLGNBQUE7Q0FDQSxTQUFBLFVBQUE7Q0FDQSxPQUFBO0NBQ0EsU0FBQTtRQUNBLGNBQUE7OztBQ0pBLFFBQUEsT0FBQSxhQUFBOzs7QUNBQTs7QUFFQSxRQUFBLE9BQUEsT0FBQSxDQUFBLFdBQUEsY0FBQSxZQUFBOztBQUVBLFFBQUEsT0FBQSxPQUFBLE9BQUEsQ0FBQSxpQkFBQSxVQUFBLGVBQUE7O0lBRUEsY0FBQSxTQUFBLFFBQUEsU0FBQTtRQUNBLGdCQUFBO1FBQ0EsVUFBQTtRQUNBLHFCQUFBO1FBQ0Esb0JBQUE7UUFDQSxnQkFBQSxRQUFBOzs7O0FBSUEsUUFBQSxPQUFBLE9BQUEsSUFBQSxDQUFBLFlBQUE7Ozs7QUNmQSxRQUFBLE9BQUEsWUFBQSxDQUFBLFdBQUEsY0FBQSxhQUFBLGFBQUEsY0FBQSxhQUFBOztBQ0FBLFFBQUEsT0FBQSxjQUFBLENBQUE7O0FDQUEsUUFBQSxPQUFBLGFBQUEsMEJBQUEsU0FBQSxnQkFBQTs7O0FDQUEsQ0FBQSxZQUFBO0lBQ0EsUUFBQSxPQUFBLE9BQUEsT0FBQSxDQUFBLGtCQUFBLFVBQUEsU0FBQSxnQkFBQSxRQUFBOztNQUVBO1NBQ0EsS0FBQSxLQUFBO1lBQ0EsYUFBQSxPQUFBLGFBQUE7WUFDQSxZQUFBO1lBQ0EsY0FBQTs7O1NBR0EsVUFBQSxDQUFBLFlBQUE7OztBQ1ZBLFFBQUEsT0FBQSxZQUFBLDBCQUFBLFNBQUEsZ0JBQUE7Ozs7QUNDQSxFQUFBLFVBQUEsTUFBQSxZQUFBOzs7SUFHQSxFQUFBLGNBQUEsTUFBQSxZQUFBOztRQUVBLEVBQUEsUUFBQSxRQUFBLENBQUEsUUFBQSxVQUFBLFNBQUEsV0FBQTs7UUFFQSxHQUFBLE9BQUEsU0FBQSxZQUFBLFVBQUE7WUFDQSxRQUFBLFVBQUEsSUFBQSxZQUFBO2VBQ0E7WUFDQSxRQUFBLFVBQUEsSUFBQSxTQUFBOzs7UUFHQSxFQUFBLG9CQUFBOzs7O0FDZEEsUUFBQSxPQUFBLGNBQUEsMEJBQUEsU0FBQSxnQkFBQTs7O0FDQUEsQ0FBQSxZQUFBOztJQUVBLFFBQUEsT0FBQSxhQUFBLFVBQUE7UUFDQSxDQUFBLFVBQUEsVUFBQSxRQUFBO1lBQ0EsT0FBQTtnQkFDQSxhQUFBLE9BQUEsYUFBQTtnQkFDQSxVQUFBO2dCQUNBLFlBQUE7Z0JBQ0EsT0FBQTtvQkFDQSxNQUFBOztnQkFFQSxZQUFBLENBQUEsVUFBQSxjQUFBLFVBQUEsZ0JBQUE7b0JBQ0EsVUFBQSxRQUFBLFlBQUEsUUFBQSxjQUFBLGNBQUE7Ozs7Ozs7O3dCQVFBLE9BQUEsVUFBQSxVQUFBLE1BQUE7OzRCQUVBLElBQUEsT0FBQTtnQ0FDQSxJQUFBLEtBQUE7Z0NBQ0EsUUFBQSxDQUFBLEtBQUE7Ozs7NEJBSUEsYUFBQSxPQUFBLE1BQUEsS0FBQSxZQUFBOzs7Z0NBR0EsV0FBQSxXQUFBLFlBQUE7K0JBQ0EsVUFBQSxLQUFBO2dDQUNBLFFBQUEsSUFBQTs7Ozs7Ozs7Ozt3QkFVQSxPQUFBLFNBQUEsVUFBQSxNQUFBOzs7NEJBR0EsYUFBQSxVQUFBO2dDQUNBLGFBQUEsT0FBQSxhQUFBO2dDQUNBLFlBQUE7Z0NBQ0EsUUFBQTtvQ0FDQSxNQUFBO3dDQUNBLFNBQUE7d0NBQ0EsV0FBQTs7OytCQUdBLEtBQUEsVUFBQSxPQUFBO2dDQUNBLE1BQUEsUUFBQTtnQ0FDQSxNQUFBLE1BQUEsS0FBQSxVQUFBLFFBQUE7O29DQUVBLElBQUEsUUFBQTs7d0NBRUEsYUFBQSxPQUFBLEtBQUEsSUFBQSxLQUFBLFlBQUE7Ozs0Q0FHQSxXQUFBLFdBQUEsZUFBQTsyQ0FDQSxVQUFBLEtBQUE7NENBQ0EsUUFBQSxJQUFBOzs7Ozs7Ozs7Ozs7O3dCQWFBLE9BQUEsT0FBQSxVQUFBLE1BQUE7OzRCQUVBLGFBQUEsVUFBQTtnQ0FDQSxhQUFBLE9BQUEsYUFBQTtnQ0FDQSxZQUFBO2dDQUNBLFFBQUE7b0NBQ0EsTUFBQTt3Q0FDQSxNQUFBOzs7K0JBR0EsS0FBQSxVQUFBLE9BQUE7Z0NBQ0EsTUFBQSxRQUFBO2dDQUNBLE1BQUEsTUFBQSxLQUFBLFVBQUEsUUFBQTtvQ0FDQSxJQUFBLFFBQUE7Ozt3Q0FHQSxJQUFBLE9BQUE7NENBQ0EsSUFBQSxLQUFBOzRDQUNBLE1BQUEsTUFBQSxNQUFBLEtBQUE7NENBQ0EsU0FBQSxNQUFBLE1BQUEsS0FBQTs7Ozt3Q0FJQSxhQUFBLE9BQUEsTUFBQSxLQUFBLFlBQUE7Ozs0Q0FHQSxXQUFBLFdBQUEsZUFBQSxNQUFBOzJDQUNBLFVBQUEsS0FBQTs0Q0FDQSxRQUFBLElBQUE7Ozs7Ozs7Ozs7Ozs7d0JBYUEsT0FBQSxzQkFBQSxVQUFBLE1BQUE7Ozs0QkFHQSxhQUFBLFVBQUE7Z0NBQ0EsYUFBQSxPQUFBLGFBQUE7Z0NBQ0EsWUFBQTtnQ0FDQSxRQUFBO29DQUNBLE1BQUE7d0NBQ0EsUUFBQTs7OytCQUdBLEtBQUEsVUFBQSxPQUFBO2dDQUNBLE1BQUEsUUFBQTs7Ozs7OztBQ3BJQSxDQUFBLFlBQUE7O0lBRUEsUUFBQSxPQUFBLGFBQUEsVUFBQTtRQUNBLENBQUEsVUFBQSxVQUFBLFFBQUE7WUFDQSxPQUFBO2dCQUNBLFVBQUE7Z0JBQ0EsT0FBQTtvQkFDQSxNQUFBOztnQkFFQSxTQUFBO2dCQUNBLGFBQUEsT0FBQSxhQUFBO2dCQUNBLFlBQUEsQ0FBQSxVQUFBLGNBQUEsZ0JBQUEsVUFBQSxRQUFBLFlBQUEsY0FBQTs7b0JBRUEsT0FBQSxlQUFBO29CQUNBLE9BQUEsYUFBQSxrQkFBQTs7Ozs7O29CQU1BLE9BQUEsYUFBQSxZQUFBOzt3QkFFQSxJQUFBLE9BQUEsU0FBQTs7NEJBRUEsSUFBQSxPQUFBO2dDQUNBLE1BQUEsT0FBQTtnQ0FDQSxTQUFBLE9BQUE7Ozs0QkFHQSxhQUFBLEtBQUEsTUFBQSxLQUFBLFVBQUEsVUFBQTtnQ0FDQSxLQUFBLFFBQUE7Z0NBQ0EsS0FBQSxLQUFBLFNBQUEsS0FBQTtnQ0FDQSxXQUFBLFdBQUEsWUFBQTsrQkFDQSxVQUFBLFVBQUE7Z0NBQ0EsUUFBQSxJQUFBOzs7NEJBR0EsT0FBQSxVQUFBOzs7Ozs7O0FDckNBLENBQUEsWUFBQTs7SUFFQSxRQUFBLE9BQUEsYUFBQSxRQUFBLGdCQUFBLENBQUEsU0FBQSxNQUFBLFVBQUE7O0lBRUEsU0FBQSxhQUFBLE9BQUEsSUFBQSxRQUFBOztRQUVBLElBQUEsVUFBQTtRQUNBLElBQUEsV0FBQTtRQUNBLElBQUE7O1FBRUEsUUFBQSxTQUFBLFlBQUE7O1lBRUEsSUFBQSxVQUFBLEdBQUE7WUFDQSxJQUFBLFVBQUEsUUFBQTs7WUFFQSxRQUFBLE1BQUEsSUFBQSxPQUFBLE1BQUEsVUFBQSxFQUFBLE9BQUE7O1lBRUEsTUFBQSxLQUFBLFVBQUEsVUFBQTtnQkFDQSxRQUFBLFFBQUE7ZUFDQSxVQUFBLEtBQUE7Z0JBQ0EsUUFBQSxPQUFBOzs7WUFHQSxPQUFBOzs7UUFHQSxRQUFBLE9BQUEsVUFBQSxNQUFBOztZQUVBLElBQUEsVUFBQSxHQUFBO1lBQ0EsSUFBQSxVQUFBLFFBQUE7O1lBRUEsTUFBQSxLQUFBLE9BQUEsTUFBQSxVQUFBLE1BQUEsS0FBQSxVQUFBLFVBQUE7Z0JBQ0EsUUFBQSxRQUFBO2VBQ0EsVUFBQSxLQUFBO2dCQUNBLFFBQUEsT0FBQTs7O1lBR0EsT0FBQTs7O1FBR0EsUUFBQSxTQUFBLFVBQUEsTUFBQTs7WUFFQSxJQUFBLFVBQUEsR0FBQTtZQUNBLElBQUEsVUFBQSxRQUFBOztZQUVBLE1BQUEsSUFBQSxPQUFBLE1BQUEsV0FBQSxNQUFBLEtBQUEsSUFBQSxNQUFBLEtBQUEsVUFBQSxVQUFBO2dCQUNBLFFBQUEsUUFBQTtlQUNBLFVBQUEsS0FBQTtnQkFDQSxRQUFBLE9BQUE7OztZQUdBLE9BQUE7OztRQUdBLFFBQUEsU0FBQSxVQUFBLElBQUE7O1lBRUEsSUFBQSxVQUFBLEdBQUE7WUFDQSxJQUFBLFVBQUEsUUFBQTs7WUFFQSxNQUFBLE9BQUEsT0FBQSxNQUFBLFdBQUEsTUFBQSxJQUFBLEtBQUEsVUFBQSxVQUFBO2dCQUNBLFFBQUEsUUFBQTtlQUNBLFVBQUEsS0FBQTtnQkFDQSxRQUFBLE9BQUE7OztZQUdBLE9BQUE7OztRQUdBLE9BQUE7Ozs7OztBQ3BFQSxDQUFBLFlBQUE7O0lBRUEsUUFBQSxPQUFBLE9BQUEsV0FBQSxvQkFBQSxDQUFBLFVBQUE7O0lBRUEsU0FBQSxpQkFBQSxRQUFBOzs7Ozs7O0FDSkEsQ0FBQSxZQUFBOztJQUVBLFFBQUEsT0FBQSxPQUFBLFdBQUEsb0JBQUEsQ0FBQSxVQUFBLFFBQUE7O0lBRUEsU0FBQSxpQkFBQSxRQUFBLE1BQUE7O1FBRUEsT0FBQSxlQUFBO1lBQ0EsVUFBQTs7O1FBR0EsT0FBQSxlQUFBLFNBQUEsR0FBQTtZQUNBLElBQUEsVUFBQSxFQUFBLE9BQUE7WUFDQSxNQUFBLDRCQUFBOzs7UUFHQSxPQUFBLGVBQUEsU0FBQSxHQUFBO1lBQ0EsSUFBQSxVQUFBLEVBQUEsT0FBQTtZQUNBLE1BQUEsNEJBQUE7Ozs7Ozs7O1FBUUEsT0FBQSxZQUFBLFNBQUEsTUFBQTs7Ozs7WUFLQSxPQUFBLEtBQUEsWUFBQTs7Ozs7OztBQzlCQSxDQUFBLFlBQUE7OztJQUdBLFFBQUEsT0FBQSxPQUFBLFVBQUEsZUFBQSxZQUFBO1FBQ0EsT0FBQTtZQUNBLFVBQUE7WUFDQSxNQUFBLFVBQUEsT0FBQSxTQUFBLFlBQUE7Z0JBQ0EsSUFBQSxZQUFBO3dCQUNBLFlBQUEsUUFBQSxHQUFBO3dCQUNBLGNBQUEsUUFBQSxJQUFBO3dCQUNBLGVBQUEsUUFBQSxJQUFBOztnQkFFQSxJQUFBLFVBQUEsUUFBQSxRQUFBLGVBQUEsSUFBQTtvQkFDQSxVQUFBO29CQUNBLEtBQUEsQ0FBQTtvQkFDQSxNQUFBLENBQUE7b0JBQ0EsT0FBQSxRQUFBLEdBQUEsY0FBQSxTQUFBLGVBQUEsS0FBQSxTQUFBLGdCQUFBO29CQUNBLFVBQUEsUUFBQSxJQUFBO29CQUNBLFlBQUEsUUFBQSxJQUFBO29CQUNBLFlBQUEsUUFBQSxJQUFBO29CQUNBLFFBQUE7OztnQkFHQSxRQUFBLFFBQUEsU0FBQSxNQUFBLE9BQUE7O2dCQUVBLElBQUEsU0FBQSxZQUFBO29CQUNBLElBQUEsUUFBQSxVQUFBLFFBQUEsUUFBQTt3QkFDQSxLQUFBLElBQUEsSUFBQSxHQUFBLElBQUEsSUFBQSxJQUFBLFFBQUEsS0FBQTs0QkFDQSxLQUFBOzt3QkFFQSxPQUFBOzs7b0JBR0EsSUFBQSxNQUFBLFFBQUEsTUFBQSxRQUFBLE1BQUE7NkJBQ0EsUUFBQSxNQUFBOzZCQUNBLFFBQUEsTUFBQTs2QkFDQSxRQUFBLE9BQUE7NkJBQ0EsUUFBQSxPQUFBOzZCQUNBLFFBQUEsV0FBQSxVQUFBLE9BQUE7Z0NBQ0EsT0FBQSxNQUFBLFVBQUEsTUFBQSxTQUFBLEtBQUE7OztvQkFHQSxRQUFBLEtBQUE7O29CQUVBLFFBQUEsSUFBQSxVQUFBLEtBQUEsSUFBQSxRQUFBLEdBQUEsZUFBQSxXQUFBOzs7Z0JBR0EsTUFBQSxJQUFBLFlBQUEsWUFBQTtvQkFDQSxRQUFBOzs7Z0JBR0EsUUFBQSxLQUFBLGlDQUFBO2dCQUNBOzs7OztBQ3BEQSxDQUFBLFlBQUE7SUFDQSxRQUFBLE9BQUEsT0FBQSxVQUFBLGNBQUEsQ0FBQSxZQUFBO1FBQ0EsU0FBQSxVQUFBLFVBQUE7WUFDQSxPQUFBO2dCQUNBLFVBQUE7Z0JBQ0EsT0FBQTtvQkFDQSxRQUFBO29CQUNBLFFBQUE7O2dCQUVBLE1BQUEsU0FBQSxPQUFBLFNBQUEsT0FBQTtvQkFDQSxTQUFBLFdBQUE7d0JBQ0EsSUFBQSxPQUFBLFFBQUE7O3dCQUVBLElBQUEsU0FBQSxJQUFBOzRCQUNBLE9BQUE7Ozt3QkFHQSxJQUFBLE1BQUEsV0FBQTs0QkFDQSxPQUFBLEtBQUEsUUFBQSxpQkFBQTs7O3dCQUdBLElBQUEsTUFBQSxXQUFBOzRCQUNBLE9BQUEsS0FBQSxRQUFBLGtCQUFBOzs7d0JBR0EsUUFBQSxLQUFBOzt3QkFFQSxTQUFBLFFBQUEsWUFBQTt1QkFDQTs7Ozs7O0FDNUJBLENBQUEsWUFBQTs7SUFFQSxRQUFBLE9BQUEsT0FBQSxVQUFBO1FBQ0EsQ0FBQSxVQUFBLFVBQUEsUUFBQTs7WUFFQSxPQUFBO2dCQUNBLGFBQUEsT0FBQSxhQUFBO2dCQUNBLFVBQUE7Z0JBQ0EsWUFBQTtnQkFDQSxPQUFBO29CQUNBLGtCQUFBOztnQkFFQSxZQUFBLENBQUEsVUFBQSxZQUFBLGFBQUEsVUFBQSxRQUFBLFVBQUEsV0FBQTs7d0JBRUEsT0FBQSxXQUFBOzt3QkFFQSxVQUFBLFlBQUE7NEJBQ0E7MkJBQ0E7O3dCQUVBLE9BQUEsYUFBQTt3QkFDQSxTQUFBLGVBQUE7NEJBQ0EsSUFBQSxTQUFBLFlBQUEsT0FBQSxrQkFBQSxPQUFBLGFBQUEsT0FBQTtnQ0FDQSxPQUFBLGFBQUE7Ozs7d0JBSUEsT0FBQSxnQkFBQTs0QkFDQSxjQUFBLE9BQUEsaUJBQUE7NEJBQ0EsWUFBQTs7Ozs7OztBQzdCQSxDQUFBLFlBQUE7SUFDQSxRQUFBLE9BQUE7U0FDQSxPQUFBLFlBQUEsV0FBQTtZQUNBLE9BQUEsVUFBQSxZQUFBLE9BQUE7O2dCQUVBLE9BQUEsV0FBQSxPQUFBLFNBQUEsUUFBQSxRQUFBO3dCQUNBLEdBQUEsQ0FBQSxZQUFBLFFBQUEsT0FBQSxRQUFBOzRCQUNBLE9BQUEsT0FBQSxPQUFBO3dCQUNBLE9BQUE7dUJBQ0E7O2dCQUVBLFNBQUEsWUFBQSxVQUFBLFdBQUEsWUFBQTtvQkFDQSxPQUFBLFNBQUEsS0FBQSxTQUFBLElBQUE7c0JBQ0EsT0FBQSxHQUFBLGVBQUE7Ozs7Ozs7O0FDYkEsQ0FBQSxZQUFBOztJQUVBLFFBQUEsT0FBQSxZQUFBLFdBQUEsa0JBQUEsQ0FBQSxVQUFBOztJQUVBLFNBQUEsZUFBQSxRQUFBOztRQUVBLE9BQUEsZUFBQTtZQUNBLE1BQUE7Ozs7Ozs7QUNQQSxDQUFBLFVBQUE7O0lBRUEsUUFBQSxPQUFBLFlBQUEsV0FBQSxrQkFBQSxDQUFBLFVBQUEsVUFBQSxnQkFBQSxnQkFBQSxzQkFBQTs7SUFFQSxTQUFBLGVBQUEsUUFBQSxRQUFBLGNBQUEsY0FBQSxtQkFBQTs7UUFFQSxPQUFBLGFBQUEsYUFBQTs7Ozs7UUFLQSxPQUFBLFVBQUEsbUJBQUE7Ozs7O1FBS0E7YUFDQTthQUNBLEtBQUEsVUFBQSxVQUFBOztnQkFFQSxPQUFBLFFBQUEsUUFBQSxRQUFBLFNBQUEsU0FBQTs7Z0JBRUEsT0FBQSxlQUFBOztnQkFFQSxPQUFBLFlBQUE7O2FBRUEsTUFBQSxVQUFBLEtBQUE7Z0JBQ0EsUUFBQSxJQUFBOzs7Ozs7UUFNQSxPQUFBLElBQUEsWUFBQSxTQUFBLEtBQUEsTUFBQTtZQUNBLE9BQUEsUUFBQSxNQUFBLEtBQUE7Ozs7OztRQU1BLE9BQUEsSUFBQSxZQUFBLFNBQUEsS0FBQSxNQUFBOztZQUVBLEdBQUEsS0FBQSxRQUFBOztnQkFFQSxLQUFBLFNBQUE7Z0JBQ0EsS0FBQSxRQUFBLEtBQUEsUUFBQSxLQUFBLE1BQUEsUUFBQSxVQUFBLE1BQUE7bUJBQ0E7O2dCQUVBLEtBQUEsU0FBQTtnQkFDQSxLQUFBLFFBQUEsS0FBQSxRQUFBLEtBQUEsUUFBQSxZQUFBO2dCQUNBLElBQUEsUUFBQSxPQUFBLFFBQUEsTUFBQSxRQUFBO2dCQUNBLE9BQUEsUUFBQSxNQUFBLE9BQUEsT0FBQTtnQkFDQSxPQUFBLFFBQUEsTUFBQSxRQUFBOzs7Ozs7O1FBT0EsT0FBQSxJQUFBLGVBQUEsU0FBQSxLQUFBLE1BQUE7WUFDQSxJQUFBLFFBQUEsT0FBQSxRQUFBLE1BQUEsUUFBQTtZQUNBLE9BQUEsUUFBQSxNQUFBLE9BQUEsT0FBQTs7Ozs7O1FBTUEsT0FBQSxJQUFBLGVBQUEsU0FBQSxLQUFBLFVBQUEsU0FBQTtZQUNBLElBQUEsUUFBQSxPQUFBLFFBQUEsTUFBQSxRQUFBO1lBQ0EsUUFBQSxLQUFBLFNBQUEsT0FBQSxRQUFBLE1BQUE7Ozs7QUNyRUEsQ0FBQSxVQUFBOztJQUVBLFFBQUEsT0FBQSxZQUFBLFdBQUEsb0JBQUEsQ0FBQSxVQUFBLHNCQUFBOztJQUVBLFNBQUEsaUJBQUEsUUFBQSxtQkFBQTs7UUFFQSxPQUFBLGFBQUEsZUFBQTs7Ozs7UUFLQSxPQUFBLFVBQUEsbUJBQUE7OztBQ1hBLENBQUEsWUFBQTs7SUFFQSxRQUFBLE9BQUEsWUFBQSxXQUFBLGlCQUFBLENBQUEsVUFBQSxrQkFBQSxzQkFBQTs7SUFFQSxTQUFBLG1CQUFBLFFBQUEsZ0JBQUEsb0JBQUE7O1NBRUEsT0FBQSxhQUFBLEtBQUEsV0FBQTtZQUNBLE9BQUE7Ozs7OztRQU1BLE9BQUEsVUFBQSxtQkFBQTs7Ozs7O1FBTUEsU0FBQSxpQkFBQTs7O1lBR0EsSUFBQSxRQUFBLE9BQUEsUUFBQSxTQUFBLE9BQUEsVUFBQSxNQUFBO2dCQUNBLE9BQUEsS0FBQSxPQUFBLEtBQUEsS0FBQSxTQUFBLElBQUE7Ozs7WUFJQSxJQUFBLE9BQUEsTUFBQSxJQUFBLFVBQUEsTUFBQTtnQkFDQSxPQUFBLEtBQUEsTUFBQSxRQUFBLE9BQUEsS0FBQTs7OztZQUlBLElBQUEsU0FBQSxHQUFBLE9BQUEsTUFBQSxJQUFBOzs7WUFHQSxPQUFBLFFBQUEsT0FBQSxlQUFBLFFBQUE7OztRQUdBLE9BQUEsaUJBQUEsb0JBQUE7OztBQ3RDQSxDQUFBLFlBQUE7SUFDQSxRQUFBLE9BQUE7U0FDQSxPQUFBLDBCQUFBLFNBQUEsTUFBQTtZQUNBLE9BQUEsVUFBQSxNQUFBLFFBQUE7Z0JBQ0EsSUFBQSxjQUFBOzBCQUNBLEtBQUEsUUFBQSxJQUFBLE9BQUEsTUFBQSxTQUFBLEtBQUEsT0FBQTswQkFDQTs7Z0JBRUEsT0FBQSxLQUFBLFlBQUE7Ozs7OztBQ1JBLFFBQUEsT0FBQSxZQUFBLFFBQUEsc0JBQUEsVUFBQTtJQUNBLEtBQUEsVUFBQTtRQUNBLE9BQUE7UUFDQSxPQUFBOzs7QUNIQSxDQUFBLFVBQUE7O0lBRUEsUUFBQSxPQUFBLGNBQUEsVUFBQSxrQkFBQSxDQUFBLFVBQUEsU0FBQSxPQUFBOztZQUVBLE9BQUE7Z0JBQ0EsVUFBQTtnQkFDQSxhQUFBLE9BQUEsYUFBQTtnQkFDQSxZQUFBO2dCQUNBLE9BQUE7OztnQkFHQSxZQUFBLENBQUEsVUFBQSxpQkFBQSxTQUFBLFFBQUEsZUFBQTs7b0JBRUEsT0FBQSxlQUFBO3dCQUNBLE1BQUE7NEJBQ0EsV0FBQTtnQ0FDQSxPQUFBOzs7OztvQkFLQSxPQUFBLFNBQUEsY0FBQTs7Ozs7QUNyQkEsQ0FBQSxVQUFBO0lBQ0EsUUFBQSxPQUFBLGNBQUEsUUFBQSxpQkFBQSxDQUFBLGFBQUEsVUFBQSxVQUFBLFdBQUEsUUFBQTtRQUNBLE9BQUEsVUFBQSxPQUFBLE1BQUEscUJBQUEsRUFBQSxJQUFBLFVBQUE7WUFDQSxRQUFBO2NBQ0EsUUFBQTs7Ozs7OztBQ0pBLENBQUEsV0FBQTs7SUFFQSxRQUFBLE9BQUEsWUFBQSxXQUFBLGtCQUFBLENBQUEsVUFBQSxRQUFBLFNBQUE7O0lBRUEsU0FBQSxlQUFBLFFBQUEsTUFBQSxPQUFBOztRQUVBLE9BQUEsT0FBQTtRQUNBLE9BQUEsS0FBQSxPQUFBLEtBQUEsS0FBQTtRQUNBLE9BQUEsS0FBQSxVQUFBLEtBQUEsS0FBQTs7UUFFQSxPQUFBLFFBQUEsVUFBQSxRQUFBOztZQUVBLE1BQUEsUUFBQTs7S0FFQTs7QUNkQSxDQUFBLFdBQUE7O0lBRUEsUUFBQSxPQUFBLFlBQUEsV0FBQSxzQkFBQSxDQUFBLFVBQUEsUUFBQSxTQUFBOztJQUVBLFNBQUEsbUJBQUEsUUFBQSxNQUFBLE9BQUE7O1FBRUEsT0FBQSxRQUFBLEtBQUEsS0FBQTtRQUNBLE9BQUEsVUFBQSxLQUFBLEtBQUE7O1FBRUEsT0FBQSxlQUFBLFVBQUEsUUFBQTtZQUNBLE1BQUEsUUFBQTs7S0FFQTs7QUNaQSxDQUFBLFlBQUE7O0lBRUEsUUFBQSxPQUFBLFlBQUEsV0FBQSxtQkFBQSxDQUFBLFVBQUEsUUFBQSxTQUFBLFVBQUEsUUFBQSxNQUFBLE9BQUE7O1lBRUEsT0FBQSxRQUFBLEtBQUE7WUFDQSxPQUFBLFVBQUEsS0FBQTs7WUFFQSxPQUFBLFFBQUEsVUFBQSxRQUFBO2dCQUNBLE1BQUEsUUFBQTs7O0tBR0EiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiYW5ndWxhci5tb2R1bGUoXCJhcHAuY29uZmlnXCIsIFtdKVxuLmNvbnN0YW50KFwiY29uZmlnXCIsIHtcblx0XCJhcGlcIjogXCJodHRwOi8vbG9jYWxob3N0OjgwMDEvYXBpL3YxXCIsIFxuXHRcImRlYnVnXCI6IHRydWUsXG4gICAgICAgICdTUkNfRk9MREVSJzogJ3NyYy9hcHBfbW9kdWxlcy8nXG59KTtcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAuY2FyZHMnLCBbXSk7XG5cbiIsIid1c2Ugc3RyaWN0JztcblxuYW5ndWxhci5tb2R1bGUoJ2FwcCcsIFsnbmdSb3V0ZScsICdhcHAuY29uZmlnJywgJ2FwcC5ob21lJywgJ2FuZ3VsYXJNb2RhbFNlcnZpY2UnXSk7XG4gIFxuYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmNvbmZpZyhbJyRodHRwUHJvdmlkZXInLCBmdW5jdGlvbiAoJGh0dHBQcm92aWRlcikge1xuICAgICAgICBcbiAgICAkaHR0cFByb3ZpZGVyLmRlZmF1bHRzLmhlYWRlcnMuY29tbW9uID0geyBcbiAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uO29kYXRhPXZlcmJvc2UnLFxuICAgICAgICAnWC1Mb2dpbi1BamF4LWNhbGwnOiAndHJ1ZScsXG4gICAgICAgICdYLVJlcXVlc3RlZC1XaXRoJzogXCJYTUxIdHRwUmVxdWVzdFwiLFxuICAgICAgICAnWC1DU1JGLVRPS0VOJzogTGFyYXZlbC5jc3JmVG9rZW4sXG4gICAgICB9O1xufV0pXG4gXG5hbmd1bGFyLm1vZHVsZSgnYXBwJykucnVuKFtmdW5jdGlvbiAoKSB7XG4gXG59XSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwLmhvbWUnLCBbJ25nUm91dGUnLCAnYXBwLmNvbmZpZycsICduZ0FuaW1hdGUnLCAnYXBwLmNhcmRzJywgJ2FwcC5zdGFja3MnLCAnaGMubWFya2VkJywgJ25nU2FuaXRpemUnXSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwLnN0YWNrcycsIFsnbmdSZXNvdXJjZSddKTtcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAuY2FyZHMnKS5jb25maWcoZnVuY3Rpb24oJHJvdXRlUHJvdmlkZXIpIHtcbiAgIFxufSk7IiwiKGZ1bmN0aW9uICgpIHtcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwJykuY29uZmlnKFsnJHJvdXRlUHJvdmlkZXInLCAnY29uZmlnJywgZnVuY3Rpb24oJHJvdXRlUHJvdmlkZXIsIGNvbmZpZykge1xuXG4gICAgICAkcm91dGVQcm92aWRlclxuICAgICAgICAud2hlbignLycsIHtcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBjb25maWcuU1JDX0ZPTERFUiArICdob21lL3RlbXBsYXRlcy9ob21lLXRlbXBsYXRlLmh0bWwnLFxuICAgICAgICAgICAgY29udHJvbGxlcjogJ0hvbWVDb250cm9sbGVyJyxcbiAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ2hvbWUnXG4gICAgICAgIH0pXG5cbiAgICAgICAgLm90aGVyd2lzZSh7cmVkaXJlY3RUbzogJy8nfSk7IFxuICAgIH1dKTtcbn0pKCk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcC5ob21lJykuY29uZmlnKGZ1bmN0aW9uKCRyb3V0ZVByb3ZpZGVyKSB7XG5cbn0pOyIsIlxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xuXG4gICAgLy8gc3dpdGNoIGZvcm1zXG4gICAgJCgnLm1lc3NhZ2UgYScpLmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgXG4gICAgICAgICQoJ2Zvcm0nKS5hbmltYXRlKHtoZWlnaHQ6IFwidG9nZ2xlXCIsIG9wYWNpdHk6IFwidG9nZ2xlXCJ9LCBcInNsb3dcIik7XG4gICAgICAgIFxuICAgICAgICBpZih3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgPT0gJy9sb2dpbicpIHtcbiAgICAgICAgICAgIGhpc3RvcnkucHVzaFN0YXRlKHt9LCBcIlJlZ2lzdGVyXCIsIFwiL3JlZ2lzdGVyXCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaGlzdG9yeS5wdXNoU3RhdGUoe30sIFwiTG9naW5cIiwgXCIvbG9naW5cIik7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgICQoJ2Zvcm0gLmhlbHAtYmxvY2snKS5oaWRlKCk7XG4gICAgfSk7XG5cbn0pOyIsImFuZ3VsYXIubW9kdWxlKCdhcHAuc3RhY2tzJykuY29uZmlnKGZ1bmN0aW9uKCRyb3V0ZVByb3ZpZGVyKSB7XG5cbn0pOyIsIihmdW5jdGlvbiAoKSB7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmNhcmRzJykuZGlyZWN0aXZlKCdjYXJkJyxcbiAgICAgICAgWydjb25maWcnLCBmdW5jdGlvbiAoY29uZmlnKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBjb25maWcuU1JDX0ZPTERFUiArICdjYXJkcy90ZW1wbGF0ZXMvY2FyZC5odG1sJyxcbiAgICAgICAgICAgICAgICByZXN0cmljdDogJ0EnLFxuICAgICAgICAgICAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgICAgICAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgICAgICAgICAgY2FyZDogXCI9ZGF0YVwiXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBbJyRzY29wZScsICckcm9vdFNjb3BlJywgJ2NvbmZpZycsICdjYXJkc0ZhY3RvcnknLCAnTW9kYWxTZXJ2aWNlJyxcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKCRzY29wZSwgJHJvb3RTY29wZSwgY29uZmlnLCBjYXJkc0ZhY3RvcnksIE1vZGFsU2VydmljZSkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIFBpbiBDYXJkIChtYWtlIGl0ICdzdGlja3knKVxuICAgICAgICAgICAgICAgICAgICAgICAgICogXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBAcGFyYW0gQ2FyZCBpdGVtXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBAcmV0dXJucyB2b2lkXG4gICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5waW5DYXJkID0gZnVuY3Rpb24gKGl0ZW0pIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjYXJkID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogaXRlbS5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RpY2t5OiAhaXRlbS5zdGlja3lcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhamF4IGNhbGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXJkc0ZhY3RvcnkudXBkYXRlKGNhcmQpLnRoZW4oZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGVtbWl0IGV2ZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgncGluLWNhcmQnLCBpdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIERlbGV0ZSBDYXJkXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIEBwYXJhbSBDYXJkIGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgICAgICAqIEByZXR1cm5zIHZvaWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRlbGV0ZSA9IGZ1bmN0aW9uIChpdGVtKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBKdXN0IHByb3ZpZGUgYSB0ZW1wbGF0ZSB1cmwsIGEgY29udHJvbGxlciBhbmQgY2FsbCAnc2hvd01vZGFsJy5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBNb2RhbFNlcnZpY2Uuc2hvd01vZGFsKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IGNvbmZpZy5TUkNfRk9MREVSICsgXCJob21lL21vZGFscy9jb25maXJtLmh0bWxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogXCJZZXNOb0NvbnRyb2xsZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXRzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3RpdGxlJzogJ0RlbGV0ZSBjYXJkPycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2NvbnRlbnQnOiBcIllvdSdsbCBub3QgYmUgYWJsZSB0byByZWNvdmVyIGl0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKG1vZGFsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFsLmVsZW1lbnQubW9kYWwoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWwuY2xvc2UudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQpIHsgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYWpheCBjYWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FyZHNGYWN0b3J5LmRlbGV0ZShpdGVtLmlkKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGVtbWl0IGV2ZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnZGVsZXRlLWNhcmQnLCBpdGVtKTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIEVkaXQgQ2FyZFxuICAgICAgICAgICAgICAgICAgICAgICAgICogXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBAcGFyYW0gQ2FyZCBpdGVtXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBAcmV0dXJucyB2b2lkXG4gICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5lZGl0ID0gZnVuY3Rpb24gKGl0ZW0pIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1vZGFsU2VydmljZS5zaG93TW9kYWwoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogY29uZmlnLlNSQ19GT0xERVIgKyBcImhvbWUvbW9kYWxzL2VkaXQuaHRtbFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBcIkVkaXRDb250cm9sbGVyXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0czoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhcmQ6IGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKG1vZGFsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFsLmVsZW1lbnQubW9kYWwoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWwuY2xvc2UudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBwcmVwYXJlIGRhdGEgdG8gYmUgc2VuZCB0byBzZXJ2ZXIgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNhcmQgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBpdGVtLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBtb2RhbC5zY29wZS5mb3JtLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IG1vZGFsLnNjb3BlLmZvcm0uY29udGVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFqYXggY2FsbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhcmRzRmFjdG9yeS51cGRhdGUoY2FyZCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBlbW1pdCBldmVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ3VwZGF0ZS1jYXJkJywgaXRlbSwgY2FyZCk7ICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBWaWV3IGNvbnRlbnQgaW4gbW9kYWxib3ggd2l0aCBNYXJrZG93biAocmljaCB0ZXh0IG1vZGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAqIEBwYXJhbSBDYXJkIGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgICAgICAqIEByZXR1cm5zIHZvaWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnZpZXdBc01hcmtkb3duTW9kYWwgPSBmdW5jdGlvbiAoaXRlbSkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSnVzdCBwcm92aWRlIGEgdGVtcGxhdGUgdXJsLCBhIGNvbnRyb2xsZXIgYW5kIGNhbGwgJ3Nob3dNb2RhbCcuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTW9kYWxTZXJ2aWNlLnNob3dNb2RhbCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBjb25maWcuU1JDX0ZPTERFUiArIFwiaG9tZS9tb2RhbHMvbWFya2Rvd24uaHRtbFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBcIk1hcmtkb3duQ29udHJvbGxlclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnB1dHM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnY2FyZCc6IGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKG1vZGFsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFsLmVsZW1lbnQubW9kYWwoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH1dXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgfV0pO1xufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5jYXJkcycpLmRpcmVjdGl2ZSgnbmV3Q2FyZEZvcm0nLFxuICAgICAgICBbJ2NvbmZpZycsIGZ1bmN0aW9uIChjb25maWcpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgICAgICAgICBjYXJkOiBcIj1cIlxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogY29uZmlnLlNSQ19GT0xERVIgKyAnY2FyZHMvdGVtcGxhdGVzL25ldy1mb3JtLmh0bWwnLFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJyRyb290U2NvcGUnLCAnY2FyZHNGYWN0b3J5JywgZnVuY3Rpb24gKCRzY29wZSwgJHJvb3RTY29wZSwgY2FyZHNGYWN0b3J5KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnRyYW5zbGF0aW9ucyA9IHt9O1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUudHJhbnNsYXRpb25zLndyaXRlX3NvbWV0aGluZyA9IFwiV3JpdGUgc29tZXRoaW5nIGFuZCBoYXNoIGl0Li4uXCI7XG5cbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFN1Ym1pdCBmb3JtXG4gICAgICAgICAgICAgICAgICAgICAqIEByZXR1cm5zIHZvaWRcbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5jcmVhdGVDYXJkID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoJHNjb3BlLmNvbnRlbnQpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBkYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAkc2NvcGUubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogJHNjb3BlLmNvbnRlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FyZHNGYWN0b3J5LnNhdmUoZGF0YSkudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jbGFzcyA9ICdoaWdobGlnaHRlZCc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuaWQgPSByZXNwb25zZS5kYXRhLmlkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ25ldy1jYXJkJywgZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmNvbnRlbnQgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdfVxuICAgICAgICB9XSk7XG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmNhcmRzJykuZmFjdG9yeSgnY2FyZHNGYWN0b3J5JywgWyckaHR0cCcsICckcScsICdjb25maWcnLCBjYXJkc0ZhY3RvcnldKTtcblxuICAgIGZ1bmN0aW9uIGNhcmRzRmFjdG9yeSgkaHR0cCwgJHEsIGNvbmZpZykge1xuXG4gICAgICAgIHZhciBmYWN0b3J5ID0ge307XG4gICAgICAgIHZhciBlbmRwb2ludCA9IFwiL2NhcmRzXCI7XG4gICAgICAgIHZhciBjYXJkcztcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgZmFjdG9yeS5nZXRBbGwgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIHZhciBkZWZlcmVkID0gJHEuZGVmZXIoKTtcbiAgICAgICAgICAgIHZhciBwcm9taXNlID0gZGVmZXJlZC5wcm9taXNlO1xuXG4gICAgICAgICAgICBjYXJkcyA9ICRodHRwLmdldChjb25maWcuYXBpICsgZW5kcG9pbnQsIHsgY2FjaGU6IHRydWV9KTsgLy8gZ2V0IGxpc3RcblxuICAgICAgICAgICAgY2FyZHMudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICBkZWZlcmVkLnJlc29sdmUocmVzcG9uc2UpO1xuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgIGRlZmVyZWQucmVqZWN0KGVycik7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgICAgIH07XG5cbiAgICAgICAgZmFjdG9yeS5zYXZlID0gZnVuY3Rpb24gKGRhdGEpIHtcblxuICAgICAgICAgICAgdmFyIGRlZmVyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgICAgICAgdmFyIHByb21pc2UgPSBkZWZlcmVkLnByb21pc2U7XG5cbiAgICAgICAgICAgICRodHRwLnBvc3QoY29uZmlnLmFwaSArIGVuZHBvaW50LCBkYXRhKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIGRlZmVyZWQucmVzb2x2ZShyZXNwb25zZSk7XG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgZGVmZXJlZC5yZWplY3QoZXJyKTtcbiAgICAgICAgICAgIH0pO1xuIFxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGZhY3RvcnkudXBkYXRlID0gZnVuY3Rpb24gKGRhdGEpIHtcblxuICAgICAgICAgICAgdmFyIGRlZmVyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgICAgICAgdmFyIHByb21pc2UgPSBkZWZlcmVkLnByb21pc2U7XG5cbiAgICAgICAgICAgICRodHRwLnB1dChjb25maWcuYXBpICsgZW5kcG9pbnQgKyAnLycgKyBkYXRhLmlkLCBkYXRhKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIGRlZmVyZWQucmVzb2x2ZShyZXNwb25zZSk7XG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgZGVmZXJlZC5yZWplY3QoZXJyKTtcbiAgICAgICAgICAgIH0pO1xuIFxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgICAgIH1cblxuICAgICAgICBmYWN0b3J5LmRlbGV0ZSA9IGZ1bmN0aW9uIChpZCkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgZGVmZXJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICAgICAgICB2YXIgcHJvbWlzZSA9IGRlZmVyZWQucHJvbWlzZTtcblxuICAgICAgICAgICAgJGh0dHAuZGVsZXRlKGNvbmZpZy5hcGkgKyBlbmRwb2ludCArICcvJyArIGlkKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIGRlZmVyZWQucmVzb2x2ZShyZXNwb25zZSk7XG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgZGVmZXJlZC5yZWplY3QoZXJyKTtcbiAgICAgICAgICAgIH0pO1xuIFxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFjdG9yeTtcbiAgICB9XG5cbn0pKCk7XG5cbiIsIihmdW5jdGlvbiAoKSB7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwJykuY29udHJvbGxlcignSGVhZGVyQ29udHJvbGxlcicsIFsnJHNjb3BlJywgSGVhZGVyQ29udHJvbGxlcl0pO1xuXG4gICAgZnVuY3Rpb24gSGVhZGVyQ29udHJvbGxlcigkc2NvcGUpIHtcbiAgICAgICAgXG4gICAgfVxufSkoKTtcblxuXG4iLCIoZnVuY3Rpb24gKCkge1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmNvbnRyb2xsZXIoJ0xheW91dENvbnRyb2xsZXInLCBbJyRzY29wZScsICckc2NlJywgTGF5b3V0Q29udHJvbGxlcl0pO1xuXG4gICAgZnVuY3Rpb24gTGF5b3V0Q29udHJvbGxlcigkc2NvcGUsICRzY2UpIHtcblxuICAgICAgICAkc2NvcGUudHJhbnNsYXRpb25zID0ge1xuICAgICAgICAgICAgc3VidGl0bGU6ICdTaW1wbHkgaGFzaCB5b3VyIG5vdGVzIGFuZCBuYXZpZ2F0ZSB0aGVtJ1xuICAgICAgICB9OyAgICAgICAgICAgIFxuICAgICAgICBcbiAgICAgICAgJHNjb3BlLnRhZ1VzZXJDbGljayA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHZhciB0YWdUZXh0ID0gZS50YXJnZXQuaW5uZXJUZXh0O1xuICAgICAgICAgICAgYWxlcnQoJ3RhZ1VzZXJDbGljaywgdGFnVGV4dDogJyArIHRhZ1RleHQpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgJHNjb3BlLnRhZ1Rlcm1DbGljayA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHZhciB0YWdUZXh0ID0gZS50YXJnZXQuaW5uZXJUZXh0O1xuICAgICAgICAgICAgYWxlcnQoJ3RhZ1Rlcm1DbGljaywgdGFnVGV4dDogJyArIHRhZ1RleHQpO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLy8gWW91IGNvdWxkIGRlZmluZSAndGFnVXNlckNsaWNrJyBhbmQgJ3RhZ1Rlcm1DbGljaydcbiAgICAgICAgLy8gb24gdGhlICckcm9vdFNjb3BlJy4gVGhpcyB3YXkgeW91IGNhbiBoYW5kbGUgd2hhdGV2ZXJcbiAgICAgICAgLy8gbG9naWMgeW91IHdhbnQgZm9yIGhhc2h0YWdzIGluIG9uZSBwbGFjZSByYXRoZXIgdGhhblxuICAgICAgICAvLyBoYXZpbmcgdG8gZGVmaW5lIGl0IGluIGVhY2ggY29udHJvbGxlci5cbiAgICAgICAgXG4gICAgICAgICRzY29wZS50cnVzdEh0bWwgPSBmdW5jdGlvbihodG1sKSB7XG4gICAgICAgICAgICAvLyBTYW5pdGl6ZSBtYW51YWxseSBpZiBuZWNlc3NhcnkuIEl0J3MgbGlrZWx5IHRoaXNcbiAgICAgICAgICAgIC8vIGh0bWwgaGFzIGFscmVhZHkgYmVlbiBzYW5pdGl6ZWQgc2VydmVyIHNpZGVcbiAgICAgICAgICAgIC8vIGJlZm9yZSBpdCB3ZW50IGludG8geW91ciBkYXRhYmFzZS5cbiAgICAgICAgICAgIC8vIERvbid0IGhvbGQgbWUgbGlhYmxlIGZvciBYU1MuLi4gbmV2ZXIgYXNzdW1lIDp+KVxuICAgICAgICAgICAgcmV0dXJuICRzY2UudHJ1c3RBc0h0bWwoaHRtbCk7XG4gICAgICAgIH07XG4gICAgfVxufSkoKTtcblxuXG4iLCIoZnVuY3Rpb24gKCkge1xuICAgIC8vIEJlY2F1c2Ugb2YgdGhlIGFubWUgYW5kIEUgdHlwZSwgd29ya3MgYXV0b21hdGljYWxseSBmb3IgZXZlcnkgdGV4dGFyZWFcbiAgICAvLyByZWY6IGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL3Rob21zZWRkb24vNDcwMzk2OFxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAnKS5kaXJlY3RpdmUoJ2VsYXN0aWNBcmVhJywgZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmVzdHJpY3Q6ICdBJyxcbiAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cmlidXRlcykge1xuICAgICAgICAgICAgICAgIHZhciB0aHJlc2hvbGQgPSAzNSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbkhlaWdodCA9IGVsZW1lbnRbMF0ub2Zmc2V0SGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZ0xlZnQgPSBlbGVtZW50LmNzcygncGFkZGluZ0xlZnQnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmdSaWdodCA9IGVsZW1lbnQuY3NzKCdwYWRkaW5nUmlnaHQnKTtcblxuICAgICAgICAgICAgICAgIHZhciAkc2hhZG93ID0gYW5ndWxhci5lbGVtZW50KCc8ZGl2PjwvZGl2PicpLmNzcyh7XG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgICAgICAgICAgICAgICB0b3A6IC0xMDAwMCxcbiAgICAgICAgICAgICAgICAgICAgbGVmdDogLTEwMDAwLFxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogZWxlbWVudFswXS5vZmZzZXRXaWR0aCAtIHBhcnNlSW50KHBhZGRpbmdMZWZ0IHx8IDApIC0gcGFyc2VJbnQocGFkZGluZ1JpZ2h0IHx8IDApLFxuICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogZWxlbWVudC5jc3MoJ2ZvbnRTaXplJyksXG4gICAgICAgICAgICAgICAgICAgIGZvbnRGYW1pbHk6IGVsZW1lbnQuY3NzKCdmb250RmFtaWx5JyksXG4gICAgICAgICAgICAgICAgICAgIGxpbmVIZWlnaHQ6IGVsZW1lbnQuY3NzKCdsaW5lSGVpZ2h0JyksXG4gICAgICAgICAgICAgICAgICAgIHJlc2l6ZTogJ25vbmUnXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuYm9keSkuYXBwZW5kKCRzaGFkb3cpO1xuXG4gICAgICAgICAgICAgICAgdmFyIHVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRpbWVzID0gZnVuY3Rpb24gKHN0cmluZywgbnVtYmVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgciA9ICcnOyBpIDwgbnVtYmVyOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByICs9IHN0cmluZztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHZhbCA9IGVsZW1lbnQudmFsKCkucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8mL2csICcmYW1wOycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcbiQvLCAnPGJyLz4mbmJzcDsnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXG4vZywgJzxici8+JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxzezIsfS9nLCBmdW5jdGlvbiAoc3BhY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRpbWVzKCcmbmJzcDsnLCBzcGFjZS5sZW5ndGggLSAxKSArICcgJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAkc2hhZG93Lmh0bWwodmFsKTtcblxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmNzcygnaGVpZ2h0JywgTWF0aC5tYXgoJHNoYWRvd1swXS5vZmZzZXRIZWlnaHQgKyB0aHJlc2hvbGQsIG1pbkhlaWdodCkpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICRzaGFkb3cucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBlbGVtZW50LmJpbmQoJ2tleXVwIGtleWRvd24ga2V5cHJlc3MgY2hhbmdlJywgdXBkYXRlKTtcbiAgICAgICAgICAgICAgICB1cGRhdGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xufSkoKTsiLCIoZnVuY3Rpb24gKCkgeyBcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwJykuZGlyZWN0aXZlKCdoYXNodGFnaWZ5JywgWyckdGltZW91dCcsICckY29tcGlsZScsXG4gICAgICAgIGZ1bmN0aW9uKCR0aW1lb3V0LCAkY29tcGlsZSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICByZXN0cmljdDogJ0EnLFxuICAgICAgICAgICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICAgICAgICAgIHVDbGljazogJyZ1c2VyQ2xpY2snLFxuICAgICAgICAgICAgICAgICAgICB0Q2xpY2s6ICcmdGVybUNsaWNrJ1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGh0bWwgPSBlbGVtZW50Lmh0bWwoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGh0bWwgPT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXR0cnMudXNlckNsaWNrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaHRtbCA9IGh0bWwucmVwbGFjZSgvKHxcXHMpKkAoXFx3KykvZywgJyQxPGEgbmctY2xpY2s9XCJ1Q2xpY2soeyRldmVudDogJGV2ZW50fSlcIiBjbGFzcz1cImhhc2h0YWdcIj5AJDI8L2E+Jyk7IFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXR0cnMudGVybUNsaWNrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaHRtbCA9IGh0bWwucmVwbGFjZSgvKF58XFxzKSojKFxcdyspL2csICckMTxhIG5nLWNsaWNrPVwidENsaWNrKHskZXZlbnQ6ICRldmVudH0pXCIgY2xhc3M9XCJoYXNodGFnXCI+IyQyPC9hPicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50Lmh0bWwoaHRtbCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICRjb21waWxlKGVsZW1lbnQuY29udGVudHMoKSkoc2NvcGUpO1xuICAgICAgICAgICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgXSk7XG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwJykuZGlyZWN0aXZlKCdzaG93TW9yZScsXG4gICAgICAgIFsnY29uZmlnJywgZnVuY3Rpb24gKGNvbmZpZykge1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBjb25maWcuU1JDX0ZPTERFUiArICdjb21tb24vdGVtcGxhdGVzL3Nob3dNb3JlLmh0bWwnLFxuICAgICAgICAgICAgICAgIHJlc3RyaWN0OiAnQScsXG4gICAgICAgICAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgICAgICAgICAnc2hvd01vcmVIZWlnaHQnOiAnQCdcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJyRlbGVtZW50JywgJyRpbnRlcnZhbCcsIGZ1bmN0aW9uICgkc2NvcGUsICRlbGVtZW50LCAkaW50ZXJ2YWwpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmV4cGFuZGVkID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICRpbnRlcnZhbChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVuZGVyU3R5bGVzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCAzMDApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXhwYW5kYWJsZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gcmVuZGVyU3R5bGVzKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICgkZWxlbWVudC5oZWlnaHQoKSA+PSAkc2NvcGUuc2hvd01vcmVIZWlnaHQgJiYgJHNjb3BlLmV4cGFuZGVkID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXhwYW5kYWJsZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuc2hvd0xlc3NTdHlsZSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnbWF4LWhlaWdodCc6ICRzY29wZS5zaG93TW9yZUhlaWdodCArICdweCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ292ZXJmbG93JzogJ2hpZGRlbidcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1dKTtcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwJylcbiAgICAgICAgLmZpbHRlcigncmVkdWNlQnknLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoY29sbGVjdGlvbiwgZmllbGQpIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICByZXR1cm4gY29sbGVjdGlvbi5yZWR1Y2UoZnVuY3Rpb24ob3V0cHV0LCBjdXJyZW50KXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKCFmaWVsZEV4aXN0cyhvdXRwdXQsIGZpZWxkLCBjdXJyZW50W2ZpZWxkXSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG91dHB1dC5jb25jYXQoY3VycmVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gb3V0cHV0O1xuICAgICAgICAgICAgICAgICAgICB9LCBbXSk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGZpZWxkRXhpc3RzKGhheXN0YWNrLCBmaWVsZE5hbWUsIGZpZWxkVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGhheXN0YWNrLnNvbWUoZnVuY3Rpb24oZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZWxbZmllbGROYW1lXSA9PT0gZmllbGRWYWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgfSk7IFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07ICAgICAgICAgICAgXG4gICAgICAgIH0pO1xufSkoKTtcblxuIiwiKGZ1bmN0aW9uICgpIHtcblxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuaG9tZScpLmNvbnRyb2xsZXIoJ0hvbWVDb250cm9sbGVyJywgWyckc2NvcGUnLCBIb21lQ29udHJvbGxlcl0pO1xuXG4gICAgZnVuY3Rpb24gSG9tZUNvbnRyb2xsZXIoJHNjb3BlKSB7XG5cbiAgICAgICAgJHNjb3BlLnRyYW5zbGF0aW9ucyA9IHtcbiAgICAgICAgICAgIGhvbWU6IHt9XG4gICAgICAgIH07ICAgICAgICAgICAgXG4gICAgfVxufSkoKTtcblxuXG4iLCIoZnVuY3Rpb24oKXtcbiAgICBcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmhvbWUnKS5jb250cm9sbGVyKCdMaXN0Q29udHJvbGxlcicsIFsnJHNjb3BlJywgJ2NvbmZpZycsICdjYXJkc0ZhY3RvcnknLCAnTW9kYWxTZXJ2aWNlJywgJ0hvbWVDb250ZXh0U2VydmljZScsIExpc3RDb250cm9sbGVyXSk7XG4gICAgXG4gICAgZnVuY3Rpb24gTGlzdENvbnRyb2xsZXIoJHNjb3BlLCBjb25maWcsIGNhcmRzRmFjdG9yeSwgTW9kYWxTZXJ2aWNlLCBIb21lQ29udGV4dFNlcnZpY2Upe1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAkc2NvcGUudHJhbnNsYXRpb25zLm5vX3Jlc3VsdHMgPSBcIk5vIHJlc3VsdHNcIjsgICAgICAgIFxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdheSB0byBrZWVwIHNpYmxpbmdzIGNvbm5lY3RlZCBhbmQgc2hhcmluZyBzY29wZVxuICAgICAgICAgKi9cbiAgICAgICAgJHNjb3BlLmNvbnRleHQgPSBIb21lQ29udGV4dFNlcnZpY2UuY29udGV4dDtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHZXQgY2FyZHMgbGlzdFxuICAgICAgICAgKi9cbiAgICAgICAgY2FyZHNGYWN0b3J5XG4gICAgICAgICAgICAuZ2V0QWxsKClcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuXG4gICAgICAgICAgICAgICAgJHNjb3BlLmNvbnRleHQuY2FyZHMgPSBhbmd1bGFyLmZyb21Kc29uKHJlc3BvbnNlLmRhdGEpO1xuXG4gICAgICAgICAgICAgICAgJHNjb3BlLm9yZGVyQ2FyZHNCeSA9ICd1cGRhdGVkX2F0JztcblxuICAgICAgICAgICAgICAgICRzY29wZS5kaXJlY3Rpb24gPSAncmV2ZXJzZSc7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpOyAvLyBUT0RPOiBUcmF0YXIgZWwgZXJyb3JcbiAgICAgICAgICAgIH0pOyAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDcmVhdGUgY2FyZFxuICAgICAgICAgKi9cbiAgICAgICAgJHNjb3BlLiRvbignbmV3LWNhcmQnLCBmdW5jdGlvbihldnQsIGl0ZW0pIHtcbiAgICAgICAgICAgICRzY29wZS5jb250ZXh0LmNhcmRzLnB1c2goaXRlbSk7XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFBpbiBjYXJkXG4gICAgICAgICAqL1xuICAgICAgICAkc2NvcGUuJG9uKCdwaW4tY2FyZCcsIGZ1bmN0aW9uKGV2dCwgaXRlbSkge1xuICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKGl0ZW0uc3RpY2t5KSB7XG4gICAgICAgICAgICAgICAgLy8gbm90IHN0aWNreSBhbnltb3JlXG4gICAgICAgICAgICAgICAgaXRlbS5zdGlja3kgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpdGVtLmNsYXNzID0gaXRlbS5jbGFzcyA/IGl0ZW0uY2xhc3MucmVwbGFjZShcInN0aWNreVwiLCBcIlwiKSA6IFwiXCI7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIHN0aWNreS4gUHV0IGl0IGZpcnN0XG4gICAgICAgICAgICAgICAgaXRlbS5zdGlja3kgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGl0ZW0uY2xhc3MgPSBpdGVtLmNsYXNzID8gaXRlbS5jbGFzcyArIFwiIHN0aWNreVwiIDogXCJzdGlja3lcIjsgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgbGV0IGluZGV4ID0gJHNjb3BlLmNvbnRleHQuY2FyZHMuaW5kZXhPZihpdGVtKTtcbiAgICAgICAgICAgICAgICAkc2NvcGUuY29udGV4dC5jYXJkcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgICAgICRzY29wZS5jb250ZXh0LmNhcmRzLnVuc2hpZnQoaXRlbSk7XG4gICAgICAgICAgICB9IFxuICAgICAgICB9KTtcbiAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIERlbGV0ZSBjYXJkXG4gICAgICAgICAqL1xuICAgICAgICAkc2NvcGUuJG9uKCdkZWxldGUtY2FyZCcsIGZ1bmN0aW9uKGV2dCwgaXRlbSkge1xuICAgICAgICAgICAgbGV0IGluZGV4ID0gJHNjb3BlLmNvbnRleHQuY2FyZHMuaW5kZXhPZihpdGVtKTtcbiAgICAgICAgICAgICRzY29wZS5jb250ZXh0LmNhcmRzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFVwZGF0ZSBjYXJkXG4gICAgICAgICAqL1xuICAgICAgICAkc2NvcGUuJG9uKCd1cGRhdGUtY2FyZCcsIGZ1bmN0aW9uKGV2dCwgb3JpZ2luYWwsIG5ld0NhcmQpIHtcbiAgICAgICAgICAgIGxldCBpbmRleCA9ICRzY29wZS5jb250ZXh0LmNhcmRzLmluZGV4T2Yob3JpZ2luYWwpO1xuICAgICAgICAgICAgYW5ndWxhci5jb3B5KG5ld0NhcmQsICRzY29wZS5jb250ZXh0LmNhcmRzW2luZGV4XSk7XG4gICAgICAgIH0pO1xuICAgIH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCl7XG4gICAgXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5ob21lJykuY29udHJvbGxlcignU2VhcmNoQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJ0hvbWVDb250ZXh0U2VydmljZScsIFNlYXJjaENvbnRyb2xsZXJdKTtcbiAgICBcbiAgICBmdW5jdGlvbiBTZWFyY2hDb250cm9sbGVyKCRzY29wZSwgSG9tZUNvbnRleHRTZXJ2aWNlKXtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgJHNjb3BlLnRyYW5zbGF0aW9ucy5xdWlja19zZWFyY2ggPSBcIlF1aWNrIFNlYXJjaC4uLlwiOyAgICBcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBXYXkgdG8ga2VlcCBzaWJsaW5ncyBjb25uZWN0ZWQgYW5kIHNoYXJpbmcgc2NvcGVcbiAgICAgICAgICovXG4gICAgICAgICRzY29wZS5jb250ZXh0ID0gSG9tZUNvbnRleHRTZXJ2aWNlLmNvbnRleHQ7XG4gICAgfVxufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5ob21lJykuY29udHJvbGxlcignVGFnQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJ3JlZHVjZUJ5RmlsdGVyJywgJ0hvbWVDb250ZXh0U2VydmljZScsIFRhZ0Nsb3VkQ29udHJvbGxlcl0pO1xuXG4gICAgZnVuY3Rpb24gVGFnQ2xvdWRDb250cm9sbGVyKCRzY29wZSwgcmVkdWNlQnlGaWx0ZXIsIEhvbWVDb250ZXh0U2VydmljZSkge1xuXG4gICAgICAgICAkc2NvcGUudHJhbnNsYXRpb25zLmhvbWUudGFnQ2xvdWQgPSB7XG4gICAgICAgICAgICB0aXRsZTogXCJJbiB0aGlzIHBhZ2VcIlxuICAgICAgICB9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBXYXkgdG8ga2VlcCBzaWJsaW5ncyBjb25uZWN0ZWQgYW5kIHNoYXJpbmcgc2NvcGVcbiAgICAgICAgICovXG4gICAgICAgICRzY29wZS5jb250ZXh0ID0gSG9tZUNvbnRleHRTZXJ2aWNlLmNvbnRleHQ7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEtlZXAgdHJhY2sgb2YgY2FyZCBsaXN0IGNoYW5nZXNcbiAgICAgICAgICogQHJldHVybnMgdm9pZFxuICAgICAgICAgKi9cbiAgICAgICAgZnVuY3Rpb24gdXBkYXRlVGFnQ2xvdWQoKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIGV4Y2x1ZGUgY2FyZCB3aXRoIG5vIHRhZ3NcbiAgICAgICAgICAgIGxldCBjYXJkcyA9ICRzY29wZS5jb250ZXh0LmZpbHRlcmVkLmZpbHRlcihmdW5jdGlvbiAoY2FyZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjYXJkLnRhZ3MgPyBjYXJkLnRhZ3MubGVuZ3RoID4gMCA6IGZhbHNlO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIGV4dHJhY3QgdGFncyBmcm9tIGNhcmRcbiAgICAgICAgICAgIGxldCB0YWdzID0gY2FyZHMubWFwKGZ1bmN0aW9uIChjYXJkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoYW5ndWxhci50b0pzb24oY2FyZC50YWdzKSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gbWVyZ2UgdGFncyBpbiBmbGF0dGVuIGFycmF5XG4gICAgICAgICAgICBsZXQgbWVyZ2VkID0gW10uY29uY2F0LmFwcGx5KFtdLCB0YWdzKTtcblxuICAgICAgICAgICAgLy8gZWxpbWluYXRlIGR1cGxpY2F0ZXMgYW5kIHNlcnZlIGFycmF5IHRvIHZpZXdcbiAgICAgICAgICAgICRzY29wZS5jb250ZXh0LnRhZ3MgPSByZWR1Y2VCeUZpbHRlcihtZXJnZWQsICdpZCcpO1xuICAgICAgICB9XG4gICAgICAgXG4gICAgICAgICRzY29wZS4kd2F0Y2hDb2xsZWN0aW9uKCdjb250ZXh0LmZpbHRlcmVkJywgdXBkYXRlVGFnQ2xvdWQgKTtcbiAgICB9XG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5ob21lJylcbiAgICAgICAgLmZpbHRlcignaGlnaGxpZ2h0VGV4dCcsIGZ1bmN0aW9uKCRzY2UpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAodGV4dCwgcGhyYXNlKSB7XG4gICAgICAgICAgICAgICAgbGV0IGhpZ2hsaWdodGVkID0gcGhyYXNlXG4gICAgICAgICAgICAgICAgICAgICAgICA/IHRleHQucmVwbGFjZShuZXcgUmVnRXhwKCcoJyArIHBocmFzZSArICcpJywgJ2dpJyksICc8c3BhbiBjbGFzcz1cImhpZ2hsaWdodC10ZXh0XCI+JDE8L3NwYW4+JylcbiAgICAgICAgICAgICAgICAgICAgICAgIDogdGV4dDtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHJldHVybiAkc2NlLnRydXN0QXNIdG1sKGhpZ2hsaWdodGVkKTtcbiAgICAgICAgICAgIH07ICAgICAgICAgICAgXG4gICAgICAgIH0pO1xufSkoKTtcblxuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcC5ob21lJykuc2VydmljZSgnSG9tZUNvbnRleHRTZXJ2aWNlJywgZnVuY3Rpb24oKXtcbiAgICB0aGlzLmNvbnRleHQgPSB7XG4gICAgICAgIGNhcmRzOiBbXSxcbiAgICAgICAgcXVlcnk6ICcnXG4gICAgfTtcbn0pOyIsIihmdW5jdGlvbigpe1xuICAgIFxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuc3RhY2tzJykuZGlyZWN0aXZlKCdzdGFja0xpc3RQYW5lbCcsIFsnY29uZmlnJywgZnVuY3Rpb24oY29uZmlnKXtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBjb25maWcuU1JDX0ZPTERFUiArICdzdGFja3MvdGVtcGxhdGVzL3N0YWNrLWxpc3QtcGFuZWwuaHRtbCcsXG4gICAgICAgICAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJ3N0YWNrc0ZhY3RvcnknLCBmdW5jdGlvbigkc2NvcGUsIHN0YWNrc0ZhY3RvcnkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUudHJhbnNsYXRpb25zID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaG9tZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YWNrTGlzdDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogXCJTdGFja3NcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gICAgXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnN0YWNrcyA9IHN0YWNrc0ZhY3RvcnkucXVlcnkoKTtcbiAgICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgfTtcbiAgICB9XSk7XG59KSgpOyIsIihmdW5jdGlvbigpe1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuc3RhY2tzJykuZmFjdG9yeSgnc3RhY2tzRmFjdG9yeScsIFsnJHJlc291cmNlJywgJ2NvbmZpZycsIGZ1bmN0aW9uICgkcmVzb3VyY2UsIGNvbmZpZykge1xuICAgICAgICByZXR1cm4gJHJlc291cmNlKGNvbmZpZy5hcGkgKyAnL3VzZXJzLXN0YWNrcy86aWQnLCB7IGlkOiAnQF9pZCcgfSwge1xuICAgICAgICAgICAgdXBkYXRlOiB7XG4gICAgICAgICAgICAgIG1ldGhvZDogJ1BVVCcgXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pOyBcbiAgICB9XSk7XG59KSgpO1xuXG4iLCIoZnVuY3Rpb24oKSB7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmhvbWUnKS5jb250cm9sbGVyKCdFZGl0Q29udHJvbGxlcicsIFsnJHNjb3BlJywgJ2RhdGEnLCAnY2xvc2UnLCBFZGl0Q29udHJvbGxlcl0pO1xuICAgIFxuICAgIGZ1bmN0aW9uIEVkaXRDb250cm9sbGVyKCRzY29wZSwgZGF0YSwgY2xvc2UpIHtcblxuICAgICAgICAkc2NvcGUuZm9ybSA9IHt9O1xuICAgICAgICAkc2NvcGUuZm9ybS5uYW1lID0gZGF0YS5jYXJkLm5hbWU7XG4gICAgICAgICRzY29wZS5mb3JtLmNvbnRlbnQgPSBkYXRhLmNhcmQuY29udGVudDtcblxuICAgICAgICAkc2NvcGUuY2xvc2UgPSBmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgIFxuICAgICAgICAgICAgY2xvc2UocmVzdWx0LCAyMDApOyAvLyBjbG9zZSwgYnV0IGdpdmUgMjAwbXMgZm9yIGJvb3RzdHJhcCB0byBhbmltYXRlXG4gICAgICAgIH07XG4gICAgfTtcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5ob21lJykuY29udHJvbGxlcignTWFya2Rvd25Db250cm9sbGVyJywgWyckc2NvcGUnLCAnZGF0YScsICdjbG9zZScsIE1hcmtkb3duQ29udHJvbGxlcl0pO1xuICAgIFxuICAgIGZ1bmN0aW9uIE1hcmtkb3duQ29udHJvbGxlcigkc2NvcGUsIGRhdGEsIGNsb3NlKSB7XG5cbiAgICAgICAgJHNjb3BlLnRpdGxlID0gZGF0YS5jYXJkLm5hbWU7XG4gICAgICAgICRzY29wZS5jb250ZW50ID0gZGF0YS5jYXJkLmNvbnRlbnQ7XG5cbiAgICAgICAgJHNjb3BlLmRpc21pc3NNb2RhbCA9IGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgIGNsb3NlKHJlc3VsdCwgMjAwKTsgLy8gY2xvc2UsIGJ1dCBnaXZlIDIwMG1zIGZvciBib290c3RyYXAgdG8gYW5pbWF0ZVxuICAgICAgICB9O1xuICAgIH07XG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmhvbWUnKS5jb250cm9sbGVyKCdZZXNOb0NvbnRyb2xsZXInLCBbJyRzY29wZScsICdkYXRhJywgJ2Nsb3NlJywgZnVuY3Rpb24gKCRzY29wZSwgZGF0YSwgY2xvc2UpIHtcbiAgICAgICAgICAgXG4gICAgICAgICAgICAkc2NvcGUudGl0bGUgPSBkYXRhLnRpdGxlO1xuICAgICAgICAgICAgJHNjb3BlLmNvbnRlbnQgPSBkYXRhLmNvbnRlbnQ7XG4gICAgICAgICAgIFxuICAgICAgICAgICAgJHNjb3BlLmNsb3NlID0gZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgIGNsb3NlKHJlc3VsdCwgMjAwKTsgLy8gY2xvc2UsIGJ1dCBnaXZlIDIwMG1zIGZvciBib290c3RyYXAgdG8gYW5pbWF0ZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfV0pO1xufSkoKTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
