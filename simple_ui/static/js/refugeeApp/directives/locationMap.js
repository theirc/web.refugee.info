angular.module('refugeeApp').directive('locationMap', function () {
    return {
        restrict: 'E',
        scope: {
            theme: '=?'
        },
        controller: function ($scope) {
            $scope.center = {
                lat: 43,
                lng: 23,
                zoom: 5
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
                scope.$watch('theme', function (newValue, oldValue) {
                    if (oldValue === newValue) {
                        return;
                    }
                    scope.theme = newValue;
                    scope.tile = scope.tiles[scope.theme];
                }, true);
            }
        },
        template: '<leaflet lf-center="center" tiles="tile" defaults="defaults" class="map-container"></leaflet>'
    };
});
