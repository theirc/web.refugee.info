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
                    scope.tile = scope.tiles[scope.theme];
                    refreshMap();
                }, true);
            }
        },
        template: '<leaflet geojson="geojson" tiles="tile" style="height: 400px"></leaflet>'
    };
});
