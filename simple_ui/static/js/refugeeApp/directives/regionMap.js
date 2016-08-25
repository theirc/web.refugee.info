angular.module('refugeeApp').directive('regionMap', function() {
    return {
        restrict: 'E',
        scope: {
            region: '=',
            theme: '=?'
        },
        controller: function ($scope) {
            var polygon = L.geoJson($scope.region);
            var cityCenter = polygon.getBounds().getCenter();
            $scope.center = {
                lat: cityCenter.lat,
                lng: cityCenter.lng,
                zoom: 8
            };
        },
        link: {
            pre: function(scope) {
                angular.extend(scope, {
                    layers: {
                        baselayers: {
                            googleRoadmap: {
                                name: 'Google Streets',
                                layerType: 'ROADMAP',
                                type: 'google'
                            }
                        }
                    }
                });
                if (!scope.theme) {
                    scope.theme = 'dark';
                }
            },
            post: function(scope) {
                var refreshMap = function() {
                    angular.extend(scope, {
                        markers: {
                            region: {
                                lat: scope.center.lat,
                                lng: scope.center.lng,
                            }
                        },
                    });
                };

                scope.$watch('region', function (newValue, oldValue) {
                    if (oldValue === newValue) {
                        return;
                    }
                    scope.region = newValue;
                    refreshMap();
                }, true);

                scope.$watch('theme', function (newValue, oldValue) {
                    if (oldValue === newValue) {
                        return;
                    }
                    scope.theme = newValue;
                    refreshMap();
                }, true);
                refreshMap();
            }
        },
        template: '<leaflet geojson="geojson" lf-center="center" markers="markers" layers="layers" style="height: 400px"></leaflet>'
    };
});
