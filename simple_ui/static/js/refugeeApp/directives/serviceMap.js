angular.module('refugeeApp').directive('serviceMap', function () {
    return {
        restrict: 'E',
        scope: {
            service: '=',
            theme: '=?'
        },
        controller: function ($scope) {
            $scope.center = {
                lat: 0,
                lng: 0,
                zoom: 1
            };
        },
        link: {
            pre: function (scope) {
                angular.extend(scope, {
                    defaults: {
                        scrollWheelZoom: false
                    },
                    tiles: {
                        dark: {
                            url: "http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
                            options: {
                                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            }
                        },
                        light: {
                            url: "http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
                            options: {
                                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            }
                        }
                    }
                });

                if (!scope.theme) {
                    scope.theme = 'dark';
                }
                scope.tile = scope.tiles[scope.theme];
            },
            post: function (scope) {
                var refreshMap = function () {
                    angular.extend(scope, {
                        markers: {
                            service: {
                                lat: scope.service.location.coordinates[1],
                                lng: scope.service.location.coordinates[0]
                            }
                        },
                        center: {
                            lat: scope.service.location.coordinates[1],
                            lng: scope.service.location.coordinates[0],
                            zoom: 16
                        }
                    });

                };

                scope.$watch('service', function (newValue, oldValue) {
                    if (oldValue === newValue) {
                        return;
                    }
                    scope.service = newValue;
                    refreshMap();
                }, true);

                scope.$watch('theme', function (newValue, oldValue) {
                    if (oldValue === newValue) {
                        return;
                    }

                    scope.theme = newValue;
                    scope.tile = scope.tiles[scope.theme];
                    refreshMap();
                }, true);
            }
        },
        template: '<leaflet markers="markers" lf-center="center" defaults="defaults" tiles="tile" style="height: 400px"></leaflet>'
    };
});
