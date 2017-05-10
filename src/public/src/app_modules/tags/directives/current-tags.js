(function () {
    angular.module('app.tags').directive('currentTags', ['config',
        function (config) {
            return {
                restrict: 'EA',
                replace: true,
                templateUrl: config.SRC_FOLDER + 'tags/templates/current-tags.html',
                scope: true,
                controller: ['$scope', '$cookies', 'queryFactory', function ($scope, $cookies, queryFactory) {
                        
                    $scope.events = {};
                        
                    /**
                     * Current tags filters
                     */
                    $scope.events.printCurrentTags = function () {
                        let current_cookies = $cookies.getObject('tags[]');
                        if (typeof (current_cookies) !== 'undefined') {
                            $scope.context.tag_filters = current_cookies;
                        }
                    }

                    // add one more
                    $scope.$on('tag-filter-added', function (evt, tag) {

                        queryFactory.byTags();

                        if (typeof ($scope.context.tag_filters) !== 'undefined') {

                            $scope.context.tag_filters.unshift(tag);
                        } else {
                            $scope.context.tag_filters = [tag];
                        }
                    });

                   // Draw tag filters on page load
                   $scope.events.printCurrentTags(); 

                   $scope.events.removeTagFilter = function(event, index, tag) {

                       // remove from view
                       $(event.currentTarget).closest('li').removeClass('animated'); // no hide animation
                       $scope.context.tag_filters.splice(index, 1);

                       // remove tag from cookies
                       let current_cookies = $cookies.getObject('tags[]');
                       let cookie_index = $.inArray( tag, current_cookies );
                       current_cookies.splice(cookie_index, 1);
                       $cookies.putObject('tags[]', current_cookies);

                       // query
                       queryFactory.byTags();
                   }     
                }]
            };
        }
    ]);
})();