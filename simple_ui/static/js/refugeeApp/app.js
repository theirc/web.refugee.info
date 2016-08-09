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
                abstract: true,
                url: '/location/:slug',
                template: '<ui-view/>',
                resolve: {
                    location: function($stateParams, djangoRMI) {
                        return djangoRMI.location_json_view.get_details({slug: $stateParams.slug}).then(function(response) {
                            return response.data.location;
                        });
                    }
                },
                controller: function($rootScope, location) {
                    $rootScope.location = location;
                },
                controllerAs: 'ctrl'
            })
            .state('locationDetails.index', {
                url: '/',
                templateUrl: 'partials/location.details.html',
                controller: 'LocationDetailsController as ctrl'
            })
            .state('locationDetails.importantInformation', {
                url: '/information',
                templateUrl: 'partials/location.important-information.html',
                controller: 'LocationDetailsController as ctrl'
            })
            .state('locationDetails.services', {
                url: '/services',
                templateUrl: 'partials/location.services.html',
                controller: 'LocationServicesController as ctrl'
            })
            .state('locationDetails.serviceDetails', {
                url: '/services/:serviceId',
                templateUrl: 'partials/location.service-details.html',
                controller: 'ServiceDetailsController as ctrl',
                resolve: {
                    service: function(LocationService, $stateParams) {
                        return LocationService.getService($stateParams.serviceId).then(function (response) {
                            return response.data.results[0];
                        });
                    },
                    serviceIcon: function(LocationService, service) {
                        return LocationService.getServiceType(service).then(function (response) {
                            return response.data.vector_icon;
                        });
                    }
                }
            })
            .state('locationDetails.aboutUs', {
                url:'/about/',
                template: '<div ng-bind-html="ctrl.about"></div>',
                controller: function(location) {
                    // TODO: finish this when general info details will be done
                    var vm = this;
                    vm.about = location.important_information.filter(function(x) {
                        return x.slug === 'about-us';
                    })[0].content[0].section;
                },
                controllerAs: 'ctrl'
            })
        ;
    });
