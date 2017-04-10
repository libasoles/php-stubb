angular.module('app.home').service('HomeContextService', function(){
    this.context = {
        cards: [],
        query: ''
    };
});