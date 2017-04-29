(function(){
    
    angular.module('app.home').controller('ListController', ['$scope', '$log', '$cookies', '$element', 'queryFactory', 'HomeContextService', ListController]);
    
    function ListController($scope, $log, $cookies, $element, queryFactory, HomeContextService){
        
        /**
         * Way to keep siblings connected and sharing scope
         */
        $scope.context = HomeContextService.context;
        
        /**
         * Get cards list
         */
        $scope.load = function(params) {
            
            // get data from server
            queryFactory
                .all(params).$promise.then(function (response) {
                             
                }, function(err) {
                    $log.error(err);
                });  
        };
        
        $scope.load(); // run at page load
        
        $scope.$on('cards-loaded', function(evt, response) {
            $scope.context.cards = response.data; // cards list
            $scope.context.pages = response; // pages data   
        });
        
        /**
         * Handle list order
         */
        $scope.$on('order-changed', function(evt, params) {   
            $scope.load({order: params}); // reload cards
        });
        
        /**
         * Handle pagination
         */
        $scope.$on('cards-page-changed', function(evt, params) {
            $scope.load(params); // reload cards
        });
        
        /**
         * Create card
         */
        $scope.$on('new-card', function(evt, item) {
            $scope.context.cards.unshift(item);
        });
        
        /**
         * Pin card
         */
        $scope.$on('pin-card', function(evt, item) {
           
            if(item.sticky) {
                // not sticky anymore
                item.sticky = false;
                item.class = item.class ? item.class.replace("sticky", "") : "";
            } else {
                // sticky. Put it first
                item.sticky = true;
                item.class = item.class ? item.class + " sticky" : "sticky";                
                let index = $scope.context.cards.indexOf(item);
                $scope.context.cards.splice(index, 1);
                $scope.context.cards.unshift(item);
            } 
        });
    
        /**
         * Delete card
         */
        $scope.$on('delete-card', function(evt, item) {
            let index = $scope.context.cards.indexOf(item);
            $scope.context.cards.splice(index, 1);
        });
        
        /**
         * Update card
         */
        $scope.$on('update-card', function(evt, original, newCard) {
            let index = $scope.context.cards.indexOf(original);
            angular.extend($scope.context.cards[index], newCard);
        });
        
        /**
         * Filter by stack
         */
        $scope.$on('stack-selected', function(evt, stack) {
            
            // query results
            queryFactory.byStack({stack_id: stack.id});
          
            // provide info to view
            $scope.context.stack = stack;
            
            // refresh animation (when element already visible)
            $element.find('.stack-description').addClass('flipInX');
        });    
        
        /**
         * Clear stack description animation class when finished
         */
        $element.on('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', '.stack-description', function() {
            $(this).removeClass("flipInX");
        });
        
        if($cookies.get("stack")) {
            
            // provide info to view
            $scope.context.stack = $cookies.get("stack");
        }
        
        /**
         * Current tags filters
         */
        $scope.printCurrentTags = function() {
            
            let current_cookies = $cookies.get('tags[]');
            if( typeof(current_cookies) !== 'undefined' ) {
                $scope.tag_filters = angular.fromJson(current_cookies);
            }
        }
        
        // add one more
        $scope.$on('tag-filter-added', function(evt, tag) {
            
            queryFactory.byTags();
            
            $scope.tag_filters.unshift(tag);
        });
        
        // Draw tag filters on page load
        $scope.printCurrentTags(); 
        
        $scope.removeTagFilter = function(event, index, tag) {
            
            // remove from view
            $(event.currentTarget).closest('li').removeClass('animated'); // no hide animation
            $scope.tag_filters.splice(index, 1);
            
            // remove tag from cookies
            let current_cookies = angular.fromJson($cookies.get('tags[]'));
            let cookie_index = $.inArray( tag, current_cookies );
            current_cookies.splice(cookie_index, 1);
            $cookies.putObject('tags[]', current_cookies);
            
            // query
            queryFactory.byTags();
        }       
    }
})();