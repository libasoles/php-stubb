(function () {
   
    angular.module('app').service('currentTagFiltersService', function() {
        
        this.getCurrentTags = function () {
            return JSON.parse(localStorage.getItem('tags[]'));
        }
        
        this.setCurrentTags = function (current_tags) {
            localStorage.setItem('tags[]', JSON.stringify(current_tags));
        }
    });
})();