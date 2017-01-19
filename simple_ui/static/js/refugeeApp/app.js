angular.module('refugeeApp', ['ui.router', 'ngCookies', 'ngSanitize', 'djng.rmi', 'leaflet-directive',
    'infinite-scroll', 'pascalprecht.translate', 'snap', 'angular-bind-html-compile', 'ngStorage'])
    .run(function ($rootScope, $state) {
        var unregister = $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            if (fromState) {
                $rootScope.previousStateName = fromState.name;
            } else { $rootScope.previousStateName = 'location'; }
            $rootScope.previousStateParams = fromParams;
        });

        $rootScope.$on('$destroy', function () {
            unregister();
        });

        $rootScope.backToPreviousState = function () {
            $state.go($rootScope.previousStateName, $rootScope.previousStateParams);
        };
    })
    .config(function ($stateProvider, $urlRouterProvider, $interpolateProvider, $httpProvider, $translateProvider,
                      staticUrl, snapRemoteProvider, $locationProvider, $urlMatcherFactoryProvider) {
        $interpolateProvider.startSymbol('{$');
        $interpolateProvider.endSymbol('$}');
        $httpProvider.defaults.xsrfCookieName = 'csrftoken';
        $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
        $urlRouterProvider.otherwise('/');
        $urlMatcherFactoryProvider.strictMode(false);
        $translateProvider.useStaticFilesLoader({
            'prefix': staticUrl + 'locale/',
            'suffix': '.json'
        })
        .registerAvailableLanguageKeys(
            ['en', 'ar', 'fa'],
            {
                'en*': 'en',
                'ar*': 'ar',
                'fa*': 'fa',
                '*': 'en' // must be last!
            }
        )
        .useCookieStorage()
        .determinePreferredLanguage()
        .fallbackLanguage('en');
        $stateProvider
            .state('location', {
                url: '/?language',
                templateUrl: 'partials/location.html',
                controller: 'LocationChoiceController as ctrl',
                resolve: {
                    locationData: function (djangoRMI, $translate) {
                        return djangoRMI.location_json_view.get_regions({
                            language: $translate.proposedLanguage() || $translate.use()
                        }).then(function (response) {
                            return response.data;
                        });
                    }
                }
            })
            .state('aboutUs', {
                url: '/about/',
                resolve: {
                    aboutUs: function ($http, $location, apiUrl, $translate) {
                        var language = $location.search().language || $translate.proposedLanguage() || $translate.use();

                        var getAboutUs = function(language) {
                            return $http({
                                method: 'GET',
                                url: apiUrl + '/v2/about/' + language + '/'
                            });
                        };
                        return getAboutUs(language).then(function (response) {
                            return response.data;
                        });
                    }
                },
                template: '<div class="col-xs-12 col-md-10 col-md-offset-1 col-lg-8 col-lg-offset-2 view-container">' +
                '<h3>{$ \'ABOUT_US\' | translate $}</h3><div ng-bind-html="ctrl.getContent()" class="about-us"></div>',
                controller: function (aboutUs) {
                    var vm = this;
                    vm.getContent = function () {
                        if (aboutUs) {
                            return aboutUs.html;
                        } else {
                            return '';
                        }
                    };
                },
                controllerAs: 'ctrl'
            })
            .state('locationDetails', {
                abstract: true,
                url: '/:slug',
                template: '<ui-view autoscroll="true"/>',
                resolve: {
                    location: function ($stateParams, djangoRMI, $translate) {
                        return djangoRMI.location_json_view.get_details({
                            slug: $stateParams.slug,
                            language: $translate.proposedLanguage() || $translate.use()
                        }).then(function (response) {
                            return response.data.location;
                        });
                    }
                },
                controller: function ($rootScope, location) {
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
                    service: function (LocationService, $stateParams) {
                        return LocationService.getService($stateParams.serviceId).then(function (response) {
                            return response.data.results[0];
                        });
                    },
                    serviceIcon: function (LocationService, service) {
                        return LocationService.getServiceType(service).then(function (response) {
                            return response.data.vector_icon;
                        });
                    },
                    serviceType: function (LocationService, service) {
                        return LocationService.getServiceType(service).then(function (response) {
                            return response.data.name;
                        });
                    }
                }
            });
        snapRemoteProvider.globalOptions = {
            disable: 'left'
        };
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });

    })
    // eslint-disable-next-line angular/di
    .run(['$rootScope', '$location', '$window', function ($rootScope, $location, $window) {
        // eslint-disable-next-line angular/on-watch
        $rootScope
            .$on('$stateChangeSuccess',
                function (event, route, parameters) {

                    if (!$window.ga)
                        return;

                    // Tracking pageviews in SPA
                    $window.ga('send', 'pageview', {page: $location.path()});

                    if (parameters) {
                        if ('infoSlug' in parameters) {
                            $window.ga('send', 'event', 'info-page-view', parameters.infoSlug);
                        } else if ('slug' in parameters) {
                            $window.ga('send', 'event', 'page-view', parameters.slug);
                        } else if ('serviceId' in parameters) {
                            $window.ga('send', 'event', 'service-view', parameters.serviceId);
                        }
                    }
                });
    }]);
