(function () {
    angular.module('app.tags').directive('currentTags', ['config', 
        function (config) {
            return {
                restrict: 'EA',
                replace: true,
                templateUrl: config.SRC_FOLDER + 'tags/templates/current-tags.html',
                scope: true,
                controller: ['$scope', 'queryFactory', 'currentTagFiltersService', function ($scope, queryFactory, currentTagFiltersService) {
                        
                    $scope.events = {};
                        
                    /**
                     * Current tags filters
                     */
                    $scope.events.printCurrentTags = function () {
                        let current_tags = currentTagFiltersService.getCurrentTags();
                        if (typeof (current_tags) !== 'undefined') {
                            $scope.context.tag_filters = current_tags;
                        }
                    }

                    // Add one
                    $scope.events.addTagFilter = function(tag) {
                        
                        // get current tags
                        let current_tags = currentTagFiltersService.getCurrentTags();
                                
                        // add new tag filter
                        if( typeof(current_tags) === 'undefined' || current_tags === null) {
                            // first one
                            current_tags = [tag];
                        } else {
                            // not the first one. 
                            current_tags = angular.fromJson(current_tags);
                          
                            // Avoid duplicates
                            if( current_tags && current_tags.map(function(e) { return e.id; }).indexOf(tag.id) === -1 ) {
                                
                                // add tag to current tags list
                                current_tags.push(tag);
                                currentTagFiltersService.setCurrentTags(current_tags);
                        
                                // add it to view
                                if ($scope.context.tag_filters && $scope.context.tag_filters.length !== 0) {

                                    $scope.context.tag_filters.unshift(tag);
                                } else {
                                    $scope.context.tag_filters = [tag];
                                }
                            }
                        }
                        
                        
                    }                    

                    // add one more
                    $scope.$on('tag-filter-added', function (evt, tag) {

                        // visually add the tag
                        $scope.events.addTagFilter(tag);

                        // filter cards list
                        queryFactory.byTags();                        
                    });

                   // Draw tag filters on page load
                   $scope.events.printCurrentTags(); 

                   $scope.events.removeTagFilter = function(event, index, tag) {

                       // remove from view
                       $(event.currentTarget).closest('li').removeClass('animated'); // no hide animation
                       $scope.context.tag_filters.splice(index, 1);

                       // remove tag from cookies
                       let current_tags = currentTagFiltersService.getCurrentTags();
                       let cookie_index = $.inArray( tag, current_tags );
                       current_tags.splice(cookie_index, 1);
                       currentTagFiltersService.setCurrentTags(current_tags);

                       // query
                       queryFactory.byTags();
                   }     
                }]
            };
        }
    ]);
})();