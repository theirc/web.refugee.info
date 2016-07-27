angular.module('refugeeApp', ['ui.router', 'ngCookies', 'ngSanitize', 'djng.rmi'])
    .config(function($stateProvider, $urlRouterProvider, $interpolateProvider, $httpProvider) {
        $interpolateProvider.startSymbol('{$');
        $interpolateProvider.endSymbol('$}');

        $httpProvider.defaults.xsrfCookieName = 'csrftoken';
        $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';

        $urlRouterProvider.otherwise('/location');

        $stateProvider
            .state('location', {
                url: '/location',
                templateUrl: 'partials/location.html',
                controller: 'LocationChoiceController as ctrl'
            })
            .state('locationDetails', {
                url: '/location/:slug',
                templateUrl: 'partials/location.details.html',
                controller: 'LocationDetailsController as ctrl'
            });
    });
