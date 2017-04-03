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
angular.module('app.home', ['ngRoute', 'app.config', 'app.cards']);

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
                if(response.status == 200){
                    $scope.cards = angular.fromJson(response.data.data);  
                }
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




//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC1jb25maWcuanMiLCJjYXJkcy9tb2R1bGUuanMiLCJjb21tb24vbW9kdWxlLmpzIiwiaG9tZS9tb2R1bGUuanMiLCJjYXJkcy9jYXJkcy1yb3V0ZS5qcyIsImNvbW1vbi9hcHAtcm91dGUuanMiLCJob21lL2hvbWUtcm91dGUuanMiLCJjYXJkcy9jb250cm9sbGVycy9jYXJkcy1jb250cm9sbGVyLmpzIiwiY2FyZHMvc2VydmljZXMvY2FyZHMtZmFjdG9yeS5qcyIsImhvbWUvY29udHJvbGxlcnMvaG9tZS1jb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFFBQUEsT0FBQSxjQUFBO0NBQ0EsU0FBQSxVQUFBO0NBQ0EsT0FBQTtDQUNBLFNBQUE7OztBQ0hBLFFBQUEsT0FBQSxhQUFBOzs7QUNBQTs7QUFFQSxRQUFBLE9BQUEsT0FBQSxDQUFBLFdBQUEsY0FBQTs7QUFFQSxRQUFBLE9BQUEsT0FBQSxPQUFBLENBQUEsWUFBQTs7OztBQUlBLFFBQUEsT0FBQSxPQUFBLElBQUEsQ0FBQSxZQUFBOzs7O0FDUkEsUUFBQSxPQUFBLFlBQUEsQ0FBQSxXQUFBLGNBQUE7O0FDQUEsUUFBQSxPQUFBLGFBQUEsMEJBQUEsU0FBQSxnQkFBQTs7O0FDQUEsUUFBQSxPQUFBLE9BQUEsT0FBQSxDQUFBLGtCQUFBLFNBQUEsZ0JBQUE7O0VBRUE7S0FDQSxLQUFBLEtBQUE7UUFDQSxhQUFBO1FBQ0EsWUFBQTtRQUNBLGNBQUE7OztLQUdBLFVBQUEsQ0FBQSxZQUFBOztBQ1RBLFFBQUEsT0FBQSxZQUFBLDBCQUFBLFNBQUEsZ0JBQUE7OztBQ0FBLENBQUEsVUFBQTs7Ozs7Ozs7Ozs7OztJQWFBLFFBQUEsT0FBQSxhQUFBLFdBQUEsbUJBQUEsQ0FBQSxVQUFBLGdCQUFBOztJQUVBLFNBQUEsZ0JBQUEsUUFBQSxhQUFBOztRQUVBLGFBQUEsV0FBQSxLQUFBLFNBQUEsU0FBQTtZQUNBLE9BQUEsUUFBQSxTQUFBOzs7UUFHQSxhQUFBLFdBQUE7WUFDQSxPQUFBLE1BQUEsS0FBQTtnQkFDQSxTQUFBO2dCQUNBLE1BQUE7b0JBQ0EsY0FBQTs7Ozs7OztBQ3pCQSxDQUFBLFlBQUE7O0lBRUEsUUFBQSxPQUFBLGFBQUEsUUFBQSxnQkFBQSxDQUFBLFNBQUEsTUFBQSxVQUFBOztJQUVBLFNBQUEsYUFBQSxPQUFBLElBQUEsUUFBQTs7UUFFQSxJQUFBLFVBQUE7UUFDQSxJQUFBLFdBQUE7O1FBRUEsUUFBQSxTQUFBLFlBQUE7O1lBRUEsSUFBQSxVQUFBLEdBQUE7WUFDQSxJQUFBLFVBQUEsUUFBQTs7WUFFQSxJQUFBLFFBQUEsTUFBQSxJQUFBLE9BQUEsTUFBQTs7WUFFQSxNQUFBLEtBQUEsVUFBQSxNQUFBO2dCQUNBLFFBQUEsUUFBQTtlQUNBLFVBQUEsS0FBQTtvQkFDQSxRQUFBLE9BQUE7OztZQUdBLE9BQUE7OztRQUdBLFFBQUEsT0FBQSxZQUFBOztZQUVBLElBQUEsVUFBQSxHQUFBO1lBQ0EsSUFBQSxVQUFBLFFBQUE7O1lBRUEsTUFBQSxLQUFBLFdBQUE7WUFDQSxNQUFBLEtBQUEsVUFBQSxVQUFBO2dCQUNBLFFBQUEsUUFBQTtlQUNBLFVBQUEsS0FBQTtvQkFDQSxRQUFBLE9BQUE7OztZQUdBLE9BQUE7OztRQUdBLE9BQUE7Ozs7OztBQ3hDQSxDQUFBLFlBQUE7O0lBRUEsUUFBQSxPQUFBLFlBQUEsV0FBQSxrQkFBQSxDQUFBLFVBQUEsU0FBQSxnQkFBQTs7SUFFQSxTQUFBLGVBQUEsUUFBQSxPQUFBLGNBQUE7O1FBRUEsT0FBQSxRQUFBOztRQUVBLE9BQUEsZUFBQTtZQUNBLGNBQUE7OztRQUdBO2FBQ0E7YUFDQSxLQUFBLFVBQUEsVUFBQTtnQkFDQSxHQUFBLFNBQUEsVUFBQSxJQUFBO29CQUNBLE9BQUEsUUFBQSxRQUFBLFNBQUEsU0FBQSxLQUFBOzs7YUFHQSxNQUFBLFNBQUEsS0FBQTtnQkFDQSxRQUFBLElBQUE7OztRQUdBLE9BQUEsYUFBQSxXQUFBOztZQUVBLElBQUEsT0FBQSxNQUFBOztnQkFFQSxhQUFBLE9BQUEsS0FBQSxTQUFBLFNBQUE7b0JBQ0EsT0FBQSxNQUFBLEtBQUEsU0FBQTs7O2dCQUdBLE9BQUEsT0FBQTs7Ozs7Ozs7QUFRQSIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyJhbmd1bGFyLm1vZHVsZShcImFwcC5jb25maWdcIiwgW10pXG4uY29uc3RhbnQoXCJjb25maWdcIiwge1xuXHRcImFwaVwiOiBcImh0dHA6Ly9zdHViYi5sb2NhbDo4MDAxL2FwaVwiLCAvLyAvdjFcblx0XCJkZWJ1Z1wiOiB0cnVlXG59KTtcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAuY2FyZHMnLCBbXSk7XG5cbiIsIid1c2Ugc3RyaWN0JztcblxuYW5ndWxhci5tb2R1bGUoJ2FwcCcsIFsnbmdSb3V0ZScsICdhcHAuY29uZmlnJywgJ2FwcC5ob21lJ10pO1xuICBcbmFuZ3VsYXIubW9kdWxlKCdhcHAnKS5jb25maWcoW2Z1bmN0aW9uICgpIHtcbiAgICAvL0Jsb3F1ZSBjb25maWcgcGFyYSBjb25maWd1cmFyIGVsIHJlc3RvIGRlIGNvc2FzIHF1ZSBubyBzb24gbGFzIHJ1dGFzLlxufV0pXG4gXG5hbmd1bGFyLm1vZHVsZSgnYXBwJykucnVuKFtmdW5jdGlvbiAoKSB7XG4gXG4gXG59XSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcC5ob21lJywgWyduZ1JvdXRlJywgJ2FwcC5jb25maWcnLCAnYXBwLmNhcmRzJ10pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcC5jYXJkcycpLmNvbmZpZyhmdW5jdGlvbigkcm91dGVQcm92aWRlcikge1xuICAgXG59KTsiLCJhbmd1bGFyLm1vZHVsZSgnYXBwJykuY29uZmlnKFsnJHJvdXRlUHJvdmlkZXInLCBmdW5jdGlvbigkcm91dGVQcm92aWRlcikge1xuICAgIFxuICAkcm91dGVQcm92aWRlclxuICAgIC53aGVuKCcvJywge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL3NyYy9ob21lL2hvbWUtdGVtcGxhdGUuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdIb21lQ29udHJvbGxlcicsXG4gICAgICAgIGNvbnRyb2xsZXJBczogJ2hvbWUnXG4gICAgfSlcbiAgICBcbiAgICAub3RoZXJ3aXNlKHtyZWRpcmVjdFRvOiAnLyd9KTsgXG59XSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcC5ob21lJykuY29uZmlnKGZ1bmN0aW9uKCRyb3V0ZVByb3ZpZGVyKSB7XG5cbn0pOyIsIihmdW5jdGlvbigpe1xuICAgICAgICBcbiAgICAvKipcbiAgICAgKiBGWUksIGNhcmRzIG11c3QgaGF2ZSB0aGlzIGJhc2ljIHN0cnVjdHVyZVxuICAgICAqIHtcbiAgICAgKiAgICAgIFwiaWRcIjogMSxcbiAgICAgICAgICAgIFwibmFtZVwiOiBcIkF1dCBtb2RpIHF1YXNpIGNvcnJ1cHRpIHZlcml0YXRpcyBzdW50IGRvbG9yZS5cIixcbiAgICAgICAgICAgIGNvbnRlbnQ6XCJMb3JlbSBJcHN1bSBkb2xvciBlc3QgI2ltcG9ydGFudC4gI215dGFnXCIsXG4gICAgICAgICAgICB0YWdzOiBbXG4gICAgICAgICAgICAgICAgXCJteXRhZ1wiLCBcImltcG9ydGFudFwiXG4gICAgICAgICAgICBdXG4gICAgICAgIH1cbiAgICAqL1xuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuY2FyZHMnKS5jb250cm9sbGVyKCdDYXJkc0NvbnRyb2xsZXInLCBbJyRzY29wZScsICdjYXJkc0ZhY3RvcnknLCBDYXJkc0NvbnRyb2xsZXJdKTtcblxuICAgIGZ1bmN0aW9uIENhcmRzQ29udHJvbGxlcigkc2NvcGUsIGNhcmRzRmFjdG9yeSl7XG4gICAgICAgIFxuICAgICAgICBjYXJkc0ZhY3RvcnkuZ2V0Q2FyZHMoKS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXsgICAgICAgXG4gICAgICAgICAgICAkc2NvcGUuY2FyZHMgPSByZXNwb25zZS5kYXRhO1xuICAgICAgICB9KTsgICAgXG5cbiAgICAgICAgY3JlYXRlQ2FyZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgJHNjb3BlLmNhcmRzLnB1c2goe1xuICAgICAgICAgICAgICAgIGNvbnRlbnQ6IFwiUmVub21icmFyIHByb3llY3RvIGEgY2FyZHMuICNjb3JlY2hhbmdlXCIsXG4gICAgICAgICAgICAgICAgdGFnczogW1xuICAgICAgICAgICAgICAgICAgICBcImNvcmVjaGFuZ2VcIiwgXCJpbXBvcnRhbnRcIlxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgIH1cbn0pKCk7XG4iLCIoZnVuY3Rpb24gKCkge1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5jYXJkcycpLmZhY3RvcnkoJ2NhcmRzRmFjdG9yeScsIFsnJGh0dHAnLCAnJHEnLCAnY29uZmlnJywgY2FyZHNGYWN0b3J5XSk7XG5cbiAgICBmdW5jdGlvbiBjYXJkc0ZhY3RvcnkoJGh0dHAsICRxLCBjb25maWcpIHtcblxuICAgICAgICB2YXIgZmFjdG9yeSA9IHt9O1xuICAgICAgICB2YXIgZW5kcG9pbnQgPSBcIi9jYXJkc1wiO1xuXG4gICAgICAgIGZhY3RvcnkuZ2V0QWxsID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICB2YXIgZGVmZXJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICAgICAgICB2YXIgcHJvbWlzZSA9IGRlZmVyZWQucHJvbWlzZTtcblxuICAgICAgICAgICAgdmFyIGNhcmRzID0gJGh0dHAuZ2V0KGNvbmZpZy5hcGkgKyBlbmRwb2ludCk7IC8vIGdldCBsaXN0XG5cbiAgICAgICAgICAgIGNhcmRzLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICBkZWZlcmVkLnJlc29sdmUoZGF0YSk7XG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlZmVyZWQucmVqZWN0KGVycilcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICAgICAgfTtcblxuICAgICAgICBmYWN0b3J5LnNhdmUgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIHZhciBkZWZlcmVkID0gJHEuZGVmZXIoKTtcbiAgICAgICAgICAgIHZhciBwcm9taXNlID0gZGVmZXJlZC5wcm9taXNlO1xuXG4gICAgICAgICAgICAkaHR0cC5wb3N0KGVuZHBvaW50ICsgXCIvc2F2ZVwiKVxuICAgICAgICAgICAgY2FyZHMudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICBkZWZlcmVkLnJlc29sdmUocmVzcG9uc2UpO1xuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgICAgICBkZWZlcmVkLnJlamVjdChlcnIpXG4gICAgICAgICAgICB9KTtcbiBcbiAgICAgICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhY3Rvcnk7XG4gICAgfVxuXG59KSgpO1xuXG4iLCIoZnVuY3Rpb24gKCkge1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5ob21lJykuY29udHJvbGxlcignSG9tZUNvbnRyb2xsZXInLCBbJyRzY29wZScsICckaHR0cCcsICdjYXJkc0ZhY3RvcnknLCBIb21lQ29udHJvbGxlcl0pO1xuXG4gICAgZnVuY3Rpb24gSG9tZUNvbnRyb2xsZXIoJHNjb3BlLCAkaHR0cCwgY2FyZHNGYWN0b3J5KSB7XG5cbiAgICAgICAgJHNjb3BlLmNhcmRzID0gW107XG5cbiAgICAgICAgJHNjb3BlLnRyYW5zbGF0aW9ucyA9IHtcbiAgICAgICAgICAgIFwibm9fcmVzdWx0c1wiOiBcIlNpbiBSZXN1bHRhZG9zXCJcbiAgICAgICAgfTtcblxuICAgICAgICBjYXJkc0ZhY3RvcnlcbiAgICAgICAgICAgIC5nZXRBbGwoKVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgaWYocmVzcG9uc2Uuc3RhdHVzID09IDIwMCl7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5jYXJkcyA9IGFuZ3VsYXIuZnJvbUpzb24ocmVzcG9uc2UuZGF0YS5kYXRhKTsgIFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24oZXJyKSB7ICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7IC8vIFRPRE86IFRyYXRhciBlbCBlcnJvclxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgJHNjb3BlLmNyZWF0ZUNhcmQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgIFxuICAgICAgICAgICAgaWYgKCRzY29wZS5jb3B5KSB7XG4gICAgICAgICAgXG4gICAgICAgICAgICAgICAgY2FyZHNGYWN0b3J5LnNhdmUoKS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmNhcmRzLnB1c2gocmVzcG9uc2UuZGF0YSk7XG4gICAgICAgICAgICAgICAgfSkgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICRzY29wZS5jb3B5ID0gJyc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07ICAgIFxuICAgIH1cbn0pKCk7XG5cblxuXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
