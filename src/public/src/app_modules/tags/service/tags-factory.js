(function(){
    angular.module('app.tags').factory('tagsFactory', ['$resource', 'config', function ($resource, config) {
        return $resource(config.api + '/tags/:id', { id: '@id' }, {
            save: {
                url: config.api + '/cards/:id/tags'                
            },
        }); 
    }]);
})();

