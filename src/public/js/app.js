angular.module("app.config", [])
.constant("config", {
	"api": "http://stubb.local:8001/api", // /v1
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
        templateUrl: 'js/src/home/home-template.html',
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

        factory.getAll = function () {

            var defered = $q.defer();
            var promise = defered.promise;

            var cards = $http.get(config.api + endpoint); // get list

            cards.then(function (data) {
                defered.resolve(data);
            }, function (err) {
                    defered.reject(err)
            });

            return promise;
        };

        factory.save = function () {

            var defered = $q.defer();
            var promise = defered.promise;

            $http.post(endpoint + "/save")
            cards.then(function (response) {
                defered.resolve(response);
            }, function (err) {
                    defered.reject(err)
            });
 
            return promise;
        }

        return factory;
    }

})();


(function () {

    angular.module('app.home').controller('HomeController', ['$scope', '$http', 'cardsFactory', HomeController]);

    function HomeController($scope, $http, cardsFactory) {

        $scope.cards = [];

        $scope.translations = {
            "no_results": "Sin Resultados"
        };

        cardsFactory
            .getAll()
            .then(function (response) {
                $scope.cards = angular.fromJson(response.data.data);  
        
                $scope.orderCardsBy = 'updated_at';
            })
            .catch(function(err) {                
                console.log(err); // TODO: Tratar el error
            });

        $scope.createCard = function() {
         
            if ($scope.copy) {
          
                cardsFactory.save().then(function(response){
                    $scope.cards.push(response.data);
                })                 
                
                $scope.copy = '';
            }
        };    
    }
})();




//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC1jb25maWcuanMiLCJjYXJkcy9tb2R1bGUuanMiLCJjb21tb24vbW9kdWxlLmpzIiwiaG9tZS9tb2R1bGUuanMiLCJjYXJkcy9jYXJkcy1yb3V0ZS5qcyIsImNvbW1vbi9hcHAtcm91dGUuanMiLCJob21lL2hvbWUtcm91dGUuanMiLCJjYXJkcy9jb250cm9sbGVycy9jYXJkcy1jb250cm9sbGVyLmpzIiwiY2FyZHMvc2VydmljZXMvY2FyZHMtZmFjdG9yeS5qcyIsImhvbWUvY29udHJvbGxlcnMvaG9tZS1jb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFFBQUEsT0FBQSxjQUFBO0NBQ0EsU0FBQSxVQUFBO0NBQ0EsT0FBQTtDQUNBLFNBQUE7OztBQ0hBLFFBQUEsT0FBQSxhQUFBOzs7QUNBQTs7QUFFQSxRQUFBLE9BQUEsT0FBQSxDQUFBLFdBQUEsY0FBQTs7QUFFQSxRQUFBLE9BQUEsT0FBQSxPQUFBLENBQUEsWUFBQTs7OztBQUlBLFFBQUEsT0FBQSxPQUFBLElBQUEsQ0FBQSxZQUFBOzs7O0FDUkEsUUFBQSxPQUFBLFlBQUEsQ0FBQSxXQUFBLGNBQUEsYUFBQTs7QUNBQSxRQUFBLE9BQUEsYUFBQSwwQkFBQSxTQUFBLGdCQUFBOzs7QUNBQSxRQUFBLE9BQUEsT0FBQSxPQUFBLENBQUEsa0JBQUEsU0FBQSxnQkFBQTs7RUFFQTtLQUNBLEtBQUEsS0FBQTtRQUNBLGFBQUE7UUFDQSxZQUFBO1FBQ0EsY0FBQTs7O0tBR0EsVUFBQSxDQUFBLFlBQUE7O0FDVEEsUUFBQSxPQUFBLFlBQUEsMEJBQUEsU0FBQSxnQkFBQTs7O0FDQUEsQ0FBQSxVQUFBOzs7Ozs7Ozs7Ozs7O0lBYUEsUUFBQSxPQUFBLGFBQUEsV0FBQSxtQkFBQSxDQUFBLFVBQUEsZ0JBQUE7O0lBRUEsU0FBQSxnQkFBQSxRQUFBLGFBQUE7O1FBRUEsYUFBQSxXQUFBLEtBQUEsU0FBQSxTQUFBO1lBQ0EsT0FBQSxRQUFBLFNBQUE7OztRQUdBLGFBQUEsV0FBQTtZQUNBLE9BQUEsTUFBQSxLQUFBO2dCQUNBLFNBQUE7Z0JBQ0EsTUFBQTtvQkFDQSxjQUFBOzs7Ozs7O0FDekJBLENBQUEsWUFBQTs7SUFFQSxRQUFBLE9BQUEsYUFBQSxRQUFBLGdCQUFBLENBQUEsU0FBQSxNQUFBLFVBQUE7O0lBRUEsU0FBQSxhQUFBLE9BQUEsSUFBQSxRQUFBOztRQUVBLElBQUEsVUFBQTtRQUNBLElBQUEsV0FBQTs7UUFFQSxRQUFBLFNBQUEsWUFBQTs7WUFFQSxJQUFBLFVBQUEsR0FBQTtZQUNBLElBQUEsVUFBQSxRQUFBOztZQUVBLElBQUEsUUFBQSxNQUFBLElBQUEsT0FBQSxNQUFBOztZQUVBLE1BQUEsS0FBQSxVQUFBLE1BQUE7Z0JBQ0EsUUFBQSxRQUFBO2VBQ0EsVUFBQSxLQUFBO29CQUNBLFFBQUEsT0FBQTs7O1lBR0EsT0FBQTs7O1FBR0EsUUFBQSxPQUFBLFlBQUE7O1lBRUEsSUFBQSxVQUFBLEdBQUE7WUFDQSxJQUFBLFVBQUEsUUFBQTs7WUFFQSxNQUFBLEtBQUEsV0FBQTtZQUNBLE1BQUEsS0FBQSxVQUFBLFVBQUE7Z0JBQ0EsUUFBQSxRQUFBO2VBQ0EsVUFBQSxLQUFBO29CQUNBLFFBQUEsT0FBQTs7O1lBR0EsT0FBQTs7O1FBR0EsT0FBQTs7Ozs7O0FDeENBLENBQUEsWUFBQTs7SUFFQSxRQUFBLE9BQUEsWUFBQSxXQUFBLGtCQUFBLENBQUEsVUFBQSxTQUFBLGdCQUFBOztJQUVBLFNBQUEsZUFBQSxRQUFBLE9BQUEsY0FBQTs7UUFFQSxPQUFBLFFBQUE7O1FBRUEsT0FBQSxlQUFBO1lBQ0EsY0FBQTs7O1FBR0E7YUFDQTthQUNBLEtBQUEsVUFBQSxVQUFBO2dCQUNBLE9BQUEsUUFBQSxRQUFBLFNBQUEsU0FBQSxLQUFBOztnQkFFQSxPQUFBLGVBQUE7O2FBRUEsTUFBQSxTQUFBLEtBQUE7Z0JBQ0EsUUFBQSxJQUFBOzs7UUFHQSxPQUFBLGFBQUEsV0FBQTs7WUFFQSxJQUFBLE9BQUEsTUFBQTs7Z0JBRUEsYUFBQSxPQUFBLEtBQUEsU0FBQSxTQUFBO29CQUNBLE9BQUEsTUFBQSxLQUFBLFNBQUE7OztnQkFHQSxPQUFBLE9BQUE7Ozs7Ozs7O0FBUUEiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiYW5ndWxhci5tb2R1bGUoXCJhcHAuY29uZmlnXCIsIFtdKVxuLmNvbnN0YW50KFwiY29uZmlnXCIsIHtcblx0XCJhcGlcIjogXCJodHRwOi8vc3R1YmIubG9jYWw6ODAwMS9hcGlcIiwgLy8gL3YxXG5cdFwiZGVidWdcIjogdHJ1ZVxufSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwLmNhcmRzJywgW10pO1xuXG4iLCIndXNlIHN0cmljdCc7XG5cbmFuZ3VsYXIubW9kdWxlKCdhcHAnLCBbJ25nUm91dGUnLCAnYXBwLmNvbmZpZycsICdhcHAuaG9tZSddKTtcbiAgXG5hbmd1bGFyLm1vZHVsZSgnYXBwJykuY29uZmlnKFtmdW5jdGlvbiAoKSB7XG4gICAgLy9CbG9xdWUgY29uZmlnIHBhcmEgY29uZmlndXJhciBlbCByZXN0byBkZSBjb3NhcyBxdWUgbm8gc29uIGxhcyBydXRhcy5cbn1dKVxuIFxuYW5ndWxhci5tb2R1bGUoJ2FwcCcpLnJ1bihbZnVuY3Rpb24gKCkge1xuIFxuIFxufV0pOyIsImFuZ3VsYXIubW9kdWxlKCdhcHAuaG9tZScsIFsnbmdSb3V0ZScsICdhcHAuY29uZmlnJywgJ25nQW5pbWF0ZScsICdhcHAuY2FyZHMnXSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwLmNhcmRzJykuY29uZmlnKGZ1bmN0aW9uKCRyb3V0ZVByb3ZpZGVyKSB7XG4gICBcbn0pOyIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKS5jb25maWcoWyckcm91dGVQcm92aWRlcicsIGZ1bmN0aW9uKCRyb3V0ZVByb3ZpZGVyKSB7XG4gICAgXG4gICRyb3V0ZVByb3ZpZGVyXG4gICAgLndoZW4oJy8nLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvc3JjL2hvbWUvaG9tZS10ZW1wbGF0ZS5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0hvbWVDb250cm9sbGVyJyxcbiAgICAgICAgY29udHJvbGxlckFzOiAnaG9tZSdcbiAgICB9KVxuICAgIFxuICAgIC5vdGhlcndpc2Uoe3JlZGlyZWN0VG86ICcvJ30pOyBcbn1dKTsiLCJhbmd1bGFyLm1vZHVsZSgnYXBwLmhvbWUnKS5jb25maWcoZnVuY3Rpb24oJHJvdXRlUHJvdmlkZXIpIHtcblxufSk7IiwiKGZ1bmN0aW9uKCl7XG4gICAgICAgIFxuICAgIC8qKlxuICAgICAqIEZZSSwgY2FyZHMgbXVzdCBoYXZlIHRoaXMgYmFzaWMgc3RydWN0dXJlXG4gICAgICoge1xuICAgICAqICAgICAgXCJpZFwiOiAxLFxuICAgICAgICAgICAgXCJuYW1lXCI6IFwiQXV0IG1vZGkgcXVhc2kgY29ycnVwdGkgdmVyaXRhdGlzIHN1bnQgZG9sb3JlLlwiLFxuICAgICAgICAgICAgY29udGVudDpcIkxvcmVtIElwc3VtIGRvbG9yIGVzdCAjaW1wb3J0YW50LiAjbXl0YWdcIixcbiAgICAgICAgICAgIHRhZ3M6IFtcbiAgICAgICAgICAgICAgICBcIm15dGFnXCIsIFwiaW1wb3J0YW50XCJcbiAgICAgICAgICAgIF1cbiAgICAgICAgfVxuICAgICovXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5jYXJkcycpLmNvbnRyb2xsZXIoJ0NhcmRzQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJ2NhcmRzRmFjdG9yeScsIENhcmRzQ29udHJvbGxlcl0pO1xuXG4gICAgZnVuY3Rpb24gQ2FyZHNDb250cm9sbGVyKCRzY29wZSwgY2FyZHNGYWN0b3J5KXtcbiAgICAgICAgXG4gICAgICAgIGNhcmRzRmFjdG9yeS5nZXRDYXJkcygpLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpeyAgICAgICBcbiAgICAgICAgICAgICRzY29wZS5jYXJkcyA9IHJlc3BvbnNlLmRhdGE7XG4gICAgICAgIH0pOyAgICBcblxuICAgICAgICBjcmVhdGVDYXJkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAkc2NvcGUuY2FyZHMucHVzaCh7XG4gICAgICAgICAgICAgICAgY29udGVudDogXCJSZW5vbWJyYXIgcHJveWVjdG8gYSBjYXJkcy4gI2NvcmVjaGFuZ2VcIixcbiAgICAgICAgICAgICAgICB0YWdzOiBbXG4gICAgICAgICAgICAgICAgICAgIFwiY29yZWNoYW5nZVwiLCBcImltcG9ydGFudFwiXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgfVxufSkoKTtcbiIsIihmdW5jdGlvbiAoKSB7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmNhcmRzJykuZmFjdG9yeSgnY2FyZHNGYWN0b3J5JywgWyckaHR0cCcsICckcScsICdjb25maWcnLCBjYXJkc0ZhY3RvcnldKTtcblxuICAgIGZ1bmN0aW9uIGNhcmRzRmFjdG9yeSgkaHR0cCwgJHEsIGNvbmZpZykge1xuXG4gICAgICAgIHZhciBmYWN0b3J5ID0ge307XG4gICAgICAgIHZhciBlbmRwb2ludCA9IFwiL2NhcmRzXCI7XG5cbiAgICAgICAgZmFjdG9yeS5nZXRBbGwgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIHZhciBkZWZlcmVkID0gJHEuZGVmZXIoKTtcbiAgICAgICAgICAgIHZhciBwcm9taXNlID0gZGVmZXJlZC5wcm9taXNlO1xuXG4gICAgICAgICAgICB2YXIgY2FyZHMgPSAkaHR0cC5nZXQoY29uZmlnLmFwaSArIGVuZHBvaW50KTsgLy8gZ2V0IGxpc3RcblxuICAgICAgICAgICAgY2FyZHMudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgIGRlZmVyZWQucmVzb2x2ZShkYXRhKTtcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJlZC5yZWplY3QoZXJyKVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgICAgICB9O1xuXG4gICAgICAgIGZhY3Rvcnkuc2F2ZSA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgdmFyIGRlZmVyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgICAgICAgdmFyIHByb21pc2UgPSBkZWZlcmVkLnByb21pc2U7XG5cbiAgICAgICAgICAgICRodHRwLnBvc3QoZW5kcG9pbnQgKyBcIi9zYXZlXCIpXG4gICAgICAgICAgICBjYXJkcy50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIGRlZmVyZWQucmVzb2x2ZShyZXNwb25zZSk7XG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlZmVyZWQucmVqZWN0KGVycilcbiAgICAgICAgICAgIH0pO1xuIFxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFjdG9yeTtcbiAgICB9XG5cbn0pKCk7XG5cbiIsIihmdW5jdGlvbiAoKSB7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmhvbWUnKS5jb250cm9sbGVyKCdIb21lQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJyRodHRwJywgJ2NhcmRzRmFjdG9yeScsIEhvbWVDb250cm9sbGVyXSk7XG5cbiAgICBmdW5jdGlvbiBIb21lQ29udHJvbGxlcigkc2NvcGUsICRodHRwLCBjYXJkc0ZhY3RvcnkpIHtcblxuICAgICAgICAkc2NvcGUuY2FyZHMgPSBbXTtcblxuICAgICAgICAkc2NvcGUudHJhbnNsYXRpb25zID0ge1xuICAgICAgICAgICAgXCJub19yZXN1bHRzXCI6IFwiU2luIFJlc3VsdGFkb3NcIlxuICAgICAgICB9O1xuXG4gICAgICAgIGNhcmRzRmFjdG9yeVxuICAgICAgICAgICAgLmdldEFsbCgpXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUuY2FyZHMgPSBhbmd1bGFyLmZyb21Kc29uKHJlc3BvbnNlLmRhdGEuZGF0YSk7ICBcbiAgICAgICAgXG4gICAgICAgICAgICAgICAgJHNjb3BlLm9yZGVyQ2FyZHNCeSA9ICd1cGRhdGVkX2F0JztcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24oZXJyKSB7ICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7IC8vIFRPRE86IFRyYXRhciBlbCBlcnJvclxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgJHNjb3BlLmNyZWF0ZUNhcmQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgIFxuICAgICAgICAgICAgaWYgKCRzY29wZS5jb3B5KSB7XG4gICAgICAgICAgXG4gICAgICAgICAgICAgICAgY2FyZHNGYWN0b3J5LnNhdmUoKS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmNhcmRzLnB1c2gocmVzcG9uc2UuZGF0YSk7XG4gICAgICAgICAgICAgICAgfSkgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICRzY29wZS5jb3B5ID0gJyc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07ICAgIFxuICAgIH1cbn0pKCk7XG5cblxuXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
