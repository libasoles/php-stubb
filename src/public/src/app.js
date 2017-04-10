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
        templateUrl: 'src/app_modules/home/home-template.html',
        controller: 'HomeController',
        controllerAs: 'home'
    })
    
    .otherwise({redirectTo: '/'}); 
}]);
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

            cards = $http.get(config.api + endpoint); // get list

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

        return factory;
    }

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
                    content: $scope.content
                };

                cardsFactory.save(data).then(function (response) {
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

    angular.module('app.home').controller('HomeController', ['$scope', 'cardsFactory', HomeController]);

    function HomeController($scope, cardsFactory) {

        $scope.translations = {};            
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
angular.module('app.home').service('HomeContextService', function(){
    this.context = {
        cards: [],
        query: ''
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC1jb25maWcuanMiLCJjYXJkcy9tb2R1bGUuanMiLCJjb21tb24vbW9kdWxlLmpzIiwiaG9tZS9tb2R1bGUuanMiLCJjYXJkcy9jYXJkcy1yb3V0ZS5qcyIsImNvbW1vbi9hcHAtcm91dGUuanMiLCJob21lL2hvbWUtcm91dGUuanMiLCJjYXJkcy9jb250cm9sbGVycy9jYXJkcy1jb250cm9sbGVyLmpzIiwiY2FyZHMvc2VydmljZXMvY2FyZHMtZmFjdG9yeS5qcyIsImhvbWUvY29udHJvbGxlcnMvZm9ybS1jb250cm9sbGVyLmpzIiwiaG9tZS9jb250cm9sbGVycy9ob21lLWNvbnRyb2xsZXIuanMiLCJob21lL2NvbnRyb2xsZXJzL2xpc3QtY29udHJvbGxlci5qcyIsImhvbWUvY29udHJvbGxlcnMvc2VhcmNoLWNvbnRyb2xsZXIuanMiLCJob21lL3NlcnZpY2VzL2hvbWUtY29udGV4dC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxRQUFBLE9BQUEsY0FBQTtDQUNBLFNBQUEsVUFBQTtDQUNBLE9BQUE7Q0FDQSxTQUFBOzs7QUNIQSxRQUFBLE9BQUEsYUFBQTs7O0FDQUE7O0FBRUEsUUFBQSxPQUFBLE9BQUEsQ0FBQSxXQUFBLGNBQUE7O0FBRUEsUUFBQSxPQUFBLE9BQUEsT0FBQSxDQUFBLFlBQUE7Ozs7QUFJQSxRQUFBLE9BQUEsT0FBQSxJQUFBLENBQUEsWUFBQTs7OztBQ1JBLFFBQUEsT0FBQSxZQUFBLENBQUEsV0FBQSxjQUFBLGFBQUE7O0FDQUEsUUFBQSxPQUFBLGFBQUEsMEJBQUEsU0FBQSxnQkFBQTs7O0FDQUEsUUFBQSxPQUFBLE9BQUEsT0FBQSxDQUFBLGtCQUFBLFNBQUEsZ0JBQUE7O0VBRUE7S0FDQSxLQUFBLEtBQUE7UUFDQSxhQUFBO1FBQ0EsWUFBQTtRQUNBLGNBQUE7OztLQUdBLFVBQUEsQ0FBQSxZQUFBOztBQ1RBLFFBQUEsT0FBQSxZQUFBLDBCQUFBLFNBQUEsZ0JBQUE7OztBQ0FBLENBQUEsVUFBQTs7Ozs7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UUFDQSxPQUFBOztHQUVBIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbImFuZ3VsYXIubW9kdWxlKFwiYXBwLmNvbmZpZ1wiLCBbXSlcbi5jb25zdGFudChcImNvbmZpZ1wiLCB7XG5cdFwiYXBpXCI6IFwiaHR0cDovL2xvY2FsaG9zdDo4MDAxL2FwaS92MVwiLCBcblx0XCJkZWJ1Z1wiOiB0cnVlXG59KTtcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAuY2FyZHMnLCBbXSk7XG5cbiIsIid1c2Ugc3RyaWN0JztcblxuYW5ndWxhci5tb2R1bGUoJ2FwcCcsIFsnbmdSb3V0ZScsICdhcHAuY29uZmlnJywgJ2FwcC5ob21lJ10pO1xuICBcbmFuZ3VsYXIubW9kdWxlKCdhcHAnKS5jb25maWcoW2Z1bmN0aW9uICgpIHtcbiAgICAvL0Jsb3F1ZSBjb25maWcgcGFyYSBjb25maWd1cmFyIGVsIHJlc3RvIGRlIGNvc2FzIHF1ZSBubyBzb24gbGFzIHJ1dGFzLlxufV0pXG4gXG5hbmd1bGFyLm1vZHVsZSgnYXBwJykucnVuKFtmdW5jdGlvbiAoKSB7XG4gXG4gXG59XSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcC5ob21lJywgWyduZ1JvdXRlJywgJ2FwcC5jb25maWcnLCAnbmdBbmltYXRlJywgJ2FwcC5jYXJkcyddKTtcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAuY2FyZHMnKS5jb25maWcoZnVuY3Rpb24oJHJvdXRlUHJvdmlkZXIpIHtcbiAgIFxufSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmNvbmZpZyhbJyRyb3V0ZVByb3ZpZGVyJywgZnVuY3Rpb24oJHJvdXRlUHJvdmlkZXIpIHtcbiAgICBcbiAgJHJvdXRlUHJvdmlkZXJcbiAgICAud2hlbignLycsIHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdzcmMvYXBwX21vZHVsZXMvaG9tZS9ob21lLXRlbXBsYXRlLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnSG9tZUNvbnRyb2xsZXInLFxuICAgICAgICBjb250cm9sbGVyQXM6ICdob21lJ1xuICAgIH0pXG4gICAgXG4gICAgLm90aGVyd2lzZSh7cmVkaXJlY3RUbzogJy8nfSk7IFxufV0pOyIsImFuZ3VsYXIubW9kdWxlKCdhcHAuaG9tZScpLmNvbmZpZyhmdW5jdGlvbigkcm91dGVQcm92aWRlcikge1xuXG59KTsiLCIoZnVuY3Rpb24oKXtcbiAgICAgICAgXG4gICAgLyoqXG4gICAgICogRllJLCBjYXJkcyBtdXN0IGhhdmUgdGhpcyBiYXNpYyBzdHJ1Y3R1cmVcbiAgICAgKiB7XG4gICAgICogICAgICBcImlkXCI6IDEsXG4gICAgICAgICAgICBcIm5hbWVcIjogXCJBdXQgbW9kaSBxdWFzaSBjb3JydXB0aSB2ZXJpdGF0aXMgc3VudCBkb2xvcmUuXCIsXG4gICAgICAgICAgICBjb250ZW50OlwiTG9yZW0gSXBzdW0gZG9sb3IgZXN0ICNpbXBvcnRhbnQuICNteXRhZ1wiLFxuICAgICAgICAgICAgdGFnczogW1xuICAgICAgICAgICAgICAgIFwibXl0YWdcIiwgXCJpbXBvcnRhbnRcIlxuICAgICAgICAgICAgXVxuICAgICAgICB9XG4gICAgKi9cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmNhcmRzJykuY29udHJvbGxlcignQ2FyZHNDb250cm9sbGVyJywgWyckc2NvcGUnLCAnY2FyZHNGYWN0b3J5JywgQ2FyZHNDb250cm9sbGVyXSk7XG5cbiAgICBmdW5jdGlvbiBDYXJkc0NvbnRyb2xsZXIoJHNjb3BlLCBjYXJkc0ZhY3Rvcnkpe1xuICAgICAgICBcbiAgICAgICAgY2FyZHNGYWN0b3J5LmdldENhcmRzKCkudGhlbihmdW5jdGlvbihyZXNwb25zZSl7ICAgICAgIFxuICAgICAgICAgICAgJHNjb3BlLmNhcmRzID0gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgfSk7ICAgIFxuXG4gICAgICAgIGNyZWF0ZUNhcmQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICRzY29wZS5jYXJkcy5wdXNoKHtcbiAgICAgICAgICAgICAgICBjb250ZW50OiBcIlJlbm9tYnJhciBwcm95ZWN0byBhIGNhcmRzLiAjY29yZWNoYW5nZVwiLFxuICAgICAgICAgICAgICAgIHRhZ3M6IFtcbiAgICAgICAgICAgICAgICAgICAgXCJjb3JlY2hhbmdlXCIsIFwiaW1wb3J0YW50XCJcbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICB9XG59KSgpO1xuIiwiKGZ1bmN0aW9uICgpIHtcblxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuY2FyZHMnKS5mYWN0b3J5KCdjYXJkc0ZhY3RvcnknLCBbJyRodHRwJywgJyRxJywgJ2NvbmZpZycsIGNhcmRzRmFjdG9yeV0pO1xuXG4gICAgZnVuY3Rpb24gY2FyZHNGYWN0b3J5KCRodHRwLCAkcSwgY29uZmlnKSB7XG5cbiAgICAgICAgdmFyIGZhY3RvcnkgPSB7fTtcbiAgICAgICAgdmFyIGVuZHBvaW50ID0gXCIvY2FyZHNcIjtcbiAgICAgICAgdmFyIGNhcmRzO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBmYWN0b3J5LmdldEFsbCA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgdmFyIGRlZmVyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgICAgICAgdmFyIHByb21pc2UgPSBkZWZlcmVkLnByb21pc2U7XG5cbiAgICAgICAgICAgIGNhcmRzID0gJGh0dHAuZ2V0KGNvbmZpZy5hcGkgKyBlbmRwb2ludCk7IC8vIGdldCBsaXN0XG5cbiAgICAgICAgICAgIGNhcmRzLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgZGVmZXJlZC5yZXNvbHZlKHJlc3BvbnNlKTtcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICBkZWZlcmVkLnJlamVjdChlcnIpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgICAgICB9O1xuXG4gICAgICAgIGZhY3Rvcnkuc2F2ZSA9IGZ1bmN0aW9uIChkYXRhKSB7XG5cbiAgICAgICAgICAgIHZhciBkZWZlcmVkID0gJHEuZGVmZXIoKTtcbiAgICAgICAgICAgIHZhciBwcm9taXNlID0gZGVmZXJlZC5wcm9taXNlO1xuXG4gICAgICAgICAgICAkaHR0cC5wb3N0KGNvbmZpZy5hcGkgKyBlbmRwb2ludCwgZGF0YSkudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICBkZWZlcmVkLnJlc29sdmUocmVzcG9uc2UpO1xuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgIGRlZmVyZWQucmVqZWN0KGVycik7XG4gICAgICAgICAgICB9KTtcbiBcbiAgICAgICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhY3Rvcnk7XG4gICAgfVxuXG59KSgpO1xuXG4iLCIoZnVuY3Rpb24oKXtcbiAgICBcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmhvbWUnKS5jb250cm9sbGVyKCdGb3JtQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJ2NhcmRzRmFjdG9yeScsICdIb21lQ29udGV4dFNlcnZpY2UnLCBGb3JtQ29udHJvbGxlcl0pO1xuICAgIFxuICAgIGZ1bmN0aW9uIEZvcm1Db250cm9sbGVyKCRzY29wZSwgY2FyZHNGYWN0b3J5LCBIb21lQ29udGV4dFNlcnZpY2UpIHtcbiAgICAgICAgXG4gICAgICAgICRzY29wZS50cmFuc2xhdGlvbnMud3JpdGVfc29tZXRoaW5nID0gXCJXcml0ZSBzb21ldGhpbmcgYW5kIGhhc2ggaXQuLi5cIjtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBXYXkgdG8ga2VlcCBzaWJsaW5ncyBjb25uZWN0ZWQgYW5kIHNoYXJpbmcgc2NvcGVcbiAgICAgICAgICovXG4gICAgICAgICRzY29wZS5jb250ZXh0ID0gSG9tZUNvbnRleHRTZXJ2aWNlLmNvbnRleHQ7XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQXV0b2V4cGFuZCBmb3JtXG4gICAgICAgICAqIEBwYXJhbSBldmVudCBlXG4gICAgICAgICAqIEByZXR1cm5zIHZvaWRcbiAgICAgICAgICovXG4gICAgICAgICRzY29wZS5hdXRvRXhwYW5kID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgdmFyIGVsZW1lbnQgPSB0eXBlb2YgZSA9PT0gJ29iamVjdCcgPyBlLnRhcmdldCA6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGUpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgc2Nyb2xsSGVpZ2h0ID0gZWxlbWVudC5zY3JvbGxIZWlnaHQgXG4gICAgICAgICAgICBlbGVtZW50LnN0eWxlLmhlaWdodCA9ICBzY3JvbGxIZWlnaHQgKyBcInB4XCI7ICAgIFxuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFN1Ym1pdCBmb3JtXG4gICAgICAgICAqIEByZXR1cm5zIHZvaWRcbiAgICAgICAgICovXG4gICAgICAgICRzY29wZS5jcmVhdGVDYXJkID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICBpZiAoJHNjb3BlLmNvbnRlbnQpIHtcblxuICAgICAgICAgICAgICAgIGxldCBkYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICBjb250ZW50OiAkc2NvcGUuY29udGVudFxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBjYXJkc0ZhY3Rvcnkuc2F2ZShkYXRhKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuY29udGV4dC5jYXJkcy5wdXNoKGRhdGEpO1xuICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgICAgICRzY29wZS5jb250ZW50ID0gJyc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5ob21lJykuY29udHJvbGxlcignSG9tZUNvbnRyb2xsZXInLCBbJyRzY29wZScsICdjYXJkc0ZhY3RvcnknLCBIb21lQ29udHJvbGxlcl0pO1xuXG4gICAgZnVuY3Rpb24gSG9tZUNvbnRyb2xsZXIoJHNjb3BlLCBjYXJkc0ZhY3RvcnkpIHtcblxuICAgICAgICAkc2NvcGUudHJhbnNsYXRpb25zID0ge307ICAgICAgICAgICAgXG4gICAgfVxufSkoKTtcblxuXG4iLCIoZnVuY3Rpb24oKXtcbiAgICBcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmhvbWUnKS5jb250cm9sbGVyKCdMaXN0Q29udHJvbGxlcicsIFsnJHNjb3BlJywgJ2NhcmRzRmFjdG9yeScsICdIb21lQ29udGV4dFNlcnZpY2UnLCBMaXN0Q29udHJvbGxlcl0pO1xuICAgIFxuICAgIGZ1bmN0aW9uIExpc3RDb250cm9sbGVyKCRzY29wZSwgY2FyZHNGYWN0b3J5LCBIb21lQ29udGV4dFNlcnZpY2Upe1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAkc2NvcGUudHJhbnNsYXRpb25zLm5vX3Jlc3VsdHMgPSBcIk5vIHJlc3VsdHNcIjsgICAgICAgIFxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdheSB0byBrZWVwIHNpYmxpbmdzIGNvbm5lY3RlZCBhbmQgc2hhcmluZyBzY29wZVxuICAgICAgICAgKi9cbiAgICAgICAgJHNjb3BlLmNvbnRleHQgPSBIb21lQ29udGV4dFNlcnZpY2UuY29udGV4dDtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHZXQgY2FyZHMgbGlzdFxuICAgICAgICAgKi9cbiAgICAgICAgY2FyZHNGYWN0b3J5XG4gICAgICAgICAgICAuZ2V0QWxsKClcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuXG4gICAgICAgICAgICAgICAgJHNjb3BlLmNvbnRleHQuY2FyZHMgPSBhbmd1bGFyLmZyb21Kc29uKHJlc3BvbnNlLmRhdGEpO1xuXG4gICAgICAgICAgICAgICAgJHNjb3BlLm9yZGVyQ2FyZHNCeSA9ICd1cGRhdGVkX2F0JztcblxuICAgICAgICAgICAgICAgICRzY29wZS5kaXJlY3Rpb24gPSAncmV2ZXJzZSc7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpOyAvLyBUT0RPOiBUcmF0YXIgZWwgZXJyb3JcbiAgICAgICAgICAgIH0pOyAgXG4gICAgfVxufSkoKTsiLCIoZnVuY3Rpb24oKXtcbiAgICBcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmhvbWUnKS5jb250cm9sbGVyKCdTZWFyY2hDb250cm9sbGVyJywgWyckc2NvcGUnLCAnSG9tZUNvbnRleHRTZXJ2aWNlJywgU2VhcmNoQ29udHJvbGxlcl0pO1xuICAgIFxuICAgIGZ1bmN0aW9uIFNlYXJjaENvbnRyb2xsZXIoJHNjb3BlLCBIb21lQ29udGV4dFNlcnZpY2Upe1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAkc2NvcGUudHJhbnNsYXRpb25zLnF1aWNrX3NlYXJjaCA9IFwiUXVpY2sgU2VhcmNoLi4uXCI7ICAgIFxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdheSB0byBrZWVwIHNpYmxpbmdzIGNvbm5lY3RlZCBhbmQgc2hhcmluZyBzY29wZVxuICAgICAgICAgKi9cbiAgICAgICAgJHNjb3BlLmNvbnRleHQgPSBIb21lQ29udGV4dFNlcnZpY2UuY29udGV4dDtcbiAgICB9XG59KSgpOyIsImFuZ3VsYXIubW9kdWxlKCdhcHAuaG9tZScpLnNlcnZpY2UoJ0hvbWVDb250ZXh0U2VydmljZScsIGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5jb250ZXh0ID0ge1xuICAgICAgICBjYXJkczogW10sXG4gICAgICAgIHF1ZXJ5OiAnJ1xuICAgIH07XG59KTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
