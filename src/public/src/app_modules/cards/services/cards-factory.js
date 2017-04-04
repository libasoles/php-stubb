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

