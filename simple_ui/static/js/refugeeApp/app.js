angular.module('refugeeApp', ['ui.router', 'ngCookies', 'ngSanitize', 'djng.rmi', 'leaflet-directive', 'infinite-scroll'])
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
            })
            .state('importantInformation', {
                url: '/location/:slug/information',
                templateUrl: 'partials/location.important-information.html',
                controller: 'LocationDetailsController as ctrl'
            })
            .state('services', {
                url: '/location/:slug/services',
                templateUrl: 'partials/location.services.html',
                controller: 'LocationServicesController as ctrl'
            })
            .state('serviceDetails', {
                url: '/location/:slug/services/:serviceId',
                templateUrl: 'partials/location.service-details.html',
                controller: 'ServiceDetailsController as ctrl'
            })
        ;
    });
