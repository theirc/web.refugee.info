angular.module('refugeeApp').directive('regionMap', function(leafletData) {
    return {
        restrict: 'E',
        scope: {
            region: '=',
            theme: '=?'
        },
        link: {
            pre: function(scope) {
                angular.extend(scope, {
                    defaults: {
                        scrollWheelZoom: false
                    },
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
                        geojson: {
                            data: scope.region,
                            style: {
                                fillColor: "#48b04f",
                                weight: 2,
                                opacity: 1,
                                color: 'white',
                                fillOpacity: 0.3
                            }
                        }
                    });
                    var polygon = L.geoJson(scope.geojson.data);
                    leafletData.getMap().then(function(map) {
                        map.fitBounds(polygon.getBounds());
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
        template: '<leaflet geojson="geojson" defaults="defaults" layers="layers" style="height: 400px"></leaflet>'
    };
});
