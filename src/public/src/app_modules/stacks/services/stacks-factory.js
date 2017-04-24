(function(){
    angular.module('app.stacks').factory('stacksFactory', ['$resource', 'config', function ($resource, config) {
        return $resource(config.api + '/stacks/:id', { id: '@_id' }, {
            update: {
              method: 'PUT' 
            }
        }); 
    }]);
})();

