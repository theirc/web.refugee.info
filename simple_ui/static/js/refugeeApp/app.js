angular.module('refugeeApp', ['ui.router', 'ngCookies', 'ngSanitize', 'djng.rmi', 'leaflet-directive',
                              'infinite-scroll', 'pascalprecht.translate', 'snap'])
    .run(function($rootScope, $state) {
        var unregister = $rootScope.$on('$stateChangeSuccess',  function(event, toState, toParams, fromState, fromParams) {
            $rootScope.previousStateName = fromState.name;
            $rootScope.previousStateParams = fromParams;
        });

        $rootScope.$on('$destroy', function() {
            unregister();
        });

        $rootScope.backToPreviousState = function() {
            $state.go($rootScope.previousStateName, $rootScope.previousStateParams);
        };
    })
    .config(function($stateProvider, $urlRouterProvider, $interpolateProvider, $httpProvider, $translateProvider,
                     staticUrl, snapRemoteProvider, $locationProvider) {
        $interpolateProvider.startSymbol('{$');
        $interpolateProvider.endSymbol('$}');
        $httpProvider.defaults.xsrfCookieName = 'csrftoken';
        $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';

        $urlRouterProvider.otherwise('/');

        $translateProvider.useStaticFilesLoader({
            'prefix': staticUrl + 'locale/',
            'suffix': '.json'
        })
        .useCookieStorage()
        .preferredLanguage('en')
        .fallbackLanguage('en');
        $stateProvider
            .state('location', {
                url: '/',
                templateUrl: 'partials/location.html',
                controller: 'LocationChoiceController as ctrl',
                resolve: {
                    locationData: function(djangoRMI, $translate) {
                        return djangoRMI.location_json_view.get_regions({
                            language: $translate.proposedLanguage() || $translate.use()
                        })
                        .then(function(response) {
                            return response.data;
                        });
                    }
                }
            })
            .state('locationDetails', {
                abstract: true,
                url: '/:slug',
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
                templateUrl: 'partials/location.home.html',
                controller: 'LocationDetailsController as ctrl'
            })
            .state('locationDetails.info', {
                url: '/info/:infoSlug',
                templateUrl: 'partials/location.important-information.html',
                controller: 'LocationDetailsController as ctrl'
            })
            .state('locationDetails.notifications', {
                url: '/notifications/',
                templateUrl: 'partials/location.notifications.html',
                controller: 'LocationDetailsController as ctrl'
            })
            .state('locationDetails.services', {
                url: '/services/?query&type',
                templateUrl: 'partials/location.services.html',
                controller: 'LocationServicesController as ctrl',
                reloadOnSearch: false
            })
            .state('locationDetails.services.details', {
                url: ':serviceId',
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
                    },
                    serviceType: function(LocationService, service) {
                        return LocationService.getServiceType(service).then(function (response) {
                            return response.data.name;
                        });
                    }
                }
            })
            .state('locationDetails.aboutUs', {
                url:'/about/',
                template: '<div class="col-xs-12 col-md-10 col-md-offset-1 col-lg-8 col-lg-offset-2 view-container">' +
                          '<h3>{$ \'ABOUT_US\' | translate $}</h3><div ng-bind-html="ctrl.getContent()"></div></div>',
                controller: function(location) {
                    var vm = this;

                    vm.getContent = function() {
                        var aboutUs = location.important_information.filter(function(x) {
                            return x.slug === 'about-us';
                        });
                        if (aboutUs.length > 0) {
                            return aboutUs[0].content[0].section;
                        } else {
                            return '';
                        }
                    };
                },
                controllerAs: 'ctrl'
            })
            .state('locationDetails.generalInfoContent', {
                url: '/:hash',
                templateUrl: 'partials/general-info.html',
                resolve: {
                    content: function($cookies, $q, $stateParams, djangoRMI, $rootScope) {
                        var locationSlug = $rootScope.location.slug || $cookies.get('locationSlug');
                        if (locationSlug) {
                            return djangoRMI.location_json_view.get_details({slug: locationSlug}).then(function(response) {
                                var result = response.data.location.content.filter(function(x) {
                                    return x.anchor_name === $stateParams.hash;
                                });

                                if (result.length > 0) {
                                    return result[0];
                                } else {
                                    return {};
                                }
                            });
                        } else {
                            return $q.defer().resolve({});
                        }
                    }
                },
                controller: function($state, $stateParams, $cookies, content, $rootScope) {
                    var vm = this;
                    var locationSlug = $rootScope.location.slug || $cookies.get('locationSlug');

                    if (!locationSlug) {
                        $state.go('/');
                    }
                    vm.back = $stateParams.backUrl;
                    vm.info = content;
                },
                controllerAs: 'ctrl'
            });
        snapRemoteProvider.globalOptions = {
            disable: 'left'
        };
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });

    });
