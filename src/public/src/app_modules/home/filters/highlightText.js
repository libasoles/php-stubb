(function () {
    angular.module('app.home')
        .filter('highlightText', function($sce) {
            return function (text, phrase) {
                let highlighted = phrase
                        ? text.replace(new RegExp('(' + phrase + ')', 'gi'), '<kbd>$1</kbd>')
                        : text;
                        
                return $sce.trustAsHtml(highlighted);
            };            
        });
})();

