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
                    layers: {
                        baselayers: {
                            googleRoadmap: {
                                name: 'Google Streets',
                                layerType: 'ROADMAP',
                                type: 'google',
                            }
                        }
                    }
                });
                if (!scope.theme) {
                    scope.theme = 'dark';
                }
            },
            post: function (scope) {
                scope.$watch('theme', function (newValue, oldValue) {
                    if (oldValue === newValue) {
                        return;
                    }
                    scope.theme = newValue;
                }, true);
            }
        },
        template: '<leaflet lf-center="center" layers="layers" defaults="defaults" class="map-container"></leaflet>'
    };
});
