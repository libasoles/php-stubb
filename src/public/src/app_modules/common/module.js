'use strict';

angular.module('app', ['ng', 'ngCookies', 'ngRoute', 'app.config', 'app.home', 'angularModalService', 'pascalprecht.translate', 'angular-growl']);
  
/**
 * Rest of the global config can be found in app-config module
 */  
angular.module('app').config(['$httpProvider', '$logProvider', '$translateProvider', 'growlProvider', 'config', 
    function ($httpProvider, $logProvider, $translateProvider, growlProvider, config) {
        
        /**
         * Ajax calls
         */ 
        $httpProvider.defaults.headers.common = { 
            'Content-Type': 'application/json',
            'Accept': 'application/json;odata=verbose',
            'X-Login-Ajax-call': 'true',
            'X-Requested-With': "XMLHttpRequest",
            'X-CSRF-TOKEN': Laravel.csrfToken
          };
          
        /**
         * Growl messages
         */
        growlProvider.onlyUniqueMessages(false);
        growlProvider.globalReversedOrder(true);
        growlProvider.globalTimeToLive({success: 1000, error: 112000, warning: 3000, info: 4000});
        growlProvider.globalDisableCountDown(true);
        growlProvider.globalDisableIcons(true);
        growlProvider.globalPosition('bottom-left');

        /**
         * Debugging
         */ 
        $logProvider.debugEnabled(config.debug);
        
        /**
         * Translations
         */     
        $translateProvider.useStaticFilesLoader({
            prefix: '/i18n/locale-',
            suffix: '.json'
        });

        $translateProvider.useLocalStorage();
        $translateProvider.preferredLanguage('en_US');
        $translateProvider.fallbackLanguage('en_US');
        $translateProvider.useSanitizeValueStrategy('escape');
}]);
 
angular.module('app').run([function () {
 
}]);
