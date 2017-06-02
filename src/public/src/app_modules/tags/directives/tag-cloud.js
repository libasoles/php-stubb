(function () {
    angular.module('app.home').directive('tagCloud', ['config', 
        function (config) {

            return {
                restrict: 'EA',
                scope: true,
                replace: true,     
                templateUrl: config.SRC_FOLDER + '/tags/templates/tag-cloud.html',
                controller: ['$scope', '$rootScope', 'reduceByFilter', function ($scope, $rootScope, reduceByFilter) {

                    $scope.events = {};
                
                    /**
                     * Keep track of card list changes
                     */
                    $scope.$on('cards-loaded', function (evt, collection) {

                        if(typeof(collection.data) === 'undefined')
                            return;

                        // exclude card with no tags
                        let cards = collection.data.filter(function (card) {
                            return card.tags ? card.tags.length > 0 : false;
                        });
                      
                        // extract tags from card
                        let tags = cards.map(function (card) {
                            return JSON.parse(angular.toJson(card.tags));
                        });
                     
                        // merge tags in flatten array
                        let merged = [].concat.apply([], tags);
                        // eliminate duplicates and serve array to view
                        $scope.tags = reduceByFilter(merged, 'id');
                    });
                    
                    $scope.events.filter = function(tag) {
                        
                        let current_tags = JSON.parse(localStorage.getItem('tags[]'));
                                 
                        if( typeof(current_tags) === 'undefined' || current_tags === null) {
                            // first one
                            current_tags = [tag];
                        } else {
                            // avoid duplicates
                            current_tags = angular.fromJson(current_tags);
                            console.log(current_tags);
                            if( current_tags && current_tags.map(function(e) { return e.id; }).indexOf(tag.id) === -1 ) {
                                current_tags.push(tag);
                            }
                        }
                        
                        // add tag to current tags list
                        localStorage.setItem('tags[]', JSON.stringify(current_tags));
                        
                        // someone else will make the query
                        $rootScope.$broadcast('tag-filter-added', tag);
                    }
                }]
            };
        }
    ]);
})();