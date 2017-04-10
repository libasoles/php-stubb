(function(){
    
    angular.module('app.home').controller('FormController', ['$scope', 'cardsFactory', 'HomeContextService', FormController]);
    
    function FormController($scope, cardsFactory, HomeContextService) {
        
        $scope.translations.write_something = "Write something and hash it...";
        
        /**
         * Way to keep siblings connected and sharing scope
         */
        $scope.context = HomeContextService.context;
        
        /**
         * Autoexpand form
         * @param event e
         * @returns void
         */
        $scope.autoExpand = function(e) {
            var element = typeof e === 'object' ? e.target : document.getElementById(e);
                    var scrollHeight = element.scrollHeight 
            element.style.height =  scrollHeight + "px";    
        };
        
        /**
         * Submit form
         * @returns void
         */
        $scope.createCard = function () {

            if ($scope.content) {

                let data = {
                    content: $scope.content
                };

                cardsFactory.save(data).then(function (response) {
                    $scope.context.cards.push(data);
                }, function (response) {
                    console.log(response);
                })

                $scope.content = '';
            }
        };
    }
})();