(function () {

    angular.module('app.cards').factory('cardsFactory', ['$resource', 'config', function($resource, config) {

        return $resource(config.api + '/cards/:id', { id: '@_id' }, {
            query: {
                method: 'GET',
                isArray: true,
                transformResponse: function (response) {
                    return angular.fromJson(response).data;
                }
            },
            update: {
              method: 'PUT' 
            }
        }); 
    }]);
})();

