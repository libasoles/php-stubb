(function () {

    /**
     * You may pass any of these value:
     * control: {
     *   expanded: boolean,
     *   expandable: boolean,
     *   toggle: fn         // actually, this is here to be called from the outside, not overriden.
     *   hideArrow: boolean // hide original arrows?
     * },
     * showMoreHeight: ...px
     */
    angular.module('app').directive('showMore',
        ['config', function (config) {

            return {
                templateUrl: config.SRC_FOLDER + 'common/templates/showMore.html',
                restrict: 'A',
                transclude: true,
                scope: {
                    'control': '=',
                    'showMoreHeight': '@'
                },
                link: function(scope, element, attrs) {
                   
                    // accessible from the outside
                    scope.public = scope.control || {}; 
                    
                    // if possible, set value from the outside. 
                    scope.public.expanded = scope.public.expanded || false;
                                            
                    // Useful when you cannot measure the height of element at first. Decide this outside.
                    scope.public.expandable = scope.public.expandable || isExpandable();
                                            
                    // Useful when you cannot measure the height of element at first. Decide this outside.
                    scope.public.hideArrow = scope.public.hideArrow || false;
                   
                    /**
                     * Public methods
                     */                    
                    scope.public.toggle = function () {
                        scope.public.expanded = !scope.public.expanded;
                        if (isExpandable() && scope.public.expanded === false) {                               
                            scope.public.expandable = true;
                        }
                    };
                    
                    /**
                     * Private methods
                     */
                    function isExpandable() {
                        return element.height() >= scope.showMoreHeight;
                    }
                    
                    // directive style 
                    scope.showLessStyle = {
                        'max-height': scope.showMoreHeight + 'px',
                        'overflow': 'hidden'
                    };
                }
            };
        }]);
})();