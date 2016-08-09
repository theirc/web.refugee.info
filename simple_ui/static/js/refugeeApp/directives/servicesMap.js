angular.module('refugeeApp').directive('servicesMap', function(leafletData) {

    return {
        restrict: 'E',
        scope: {
            region: '=',
            theme: '=?',
            services: '='
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
                var ctrl = scope.$parent.ctrl;
                var markers = new L.layerGroup();
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
                var markerClick = function onClick(e) {
                    ctrl.navigateToDetails(e.target.options.service);
                };
                var drawServices = function(map, services) {
                    services.forEach(function(service){
                        var lat = service.location.coordinates[1];
                        var lng = service.location.coordinates[0];
                        var icon = L.VectorMarkers.icon({
                            prefix: 'fa',
                            icon: ctrl.getServiceIcon(service.type),
                            iconColor: 'white',
                            markerColor: '#39b610',
                            spin: false,
                            shadowSize: [0, 0]
                        });
                        var marker = L.marker([lat, lng], {
                            icon: icon,
                            service: service
                        });
                        marker.on('click', markerClick);
                        markers.addLayer(marker);
                    });
                    markers.addTo(map);

                };

                scope.$watch('region', function (newValue, oldValue) {
                    if (oldValue === newValue) {
                        return;
                    }
                    scope.region = newValue;
                    refreshMap();
                    leafletData.getMap().then(function(map) {
                        drawServices(map, scope.services);
                    });
                }, true);

                scope.$watch('theme', function (newValue, oldValue) {
                    if (oldValue === newValue) {
                        return;
                    }
                    scope.theme = newValue;
                    scope.tile = scope.tiles[scope.theme];
                    refreshMap();
                }, true);

                scope.$watch('services', function (newValue, oldValue) {
                    if (oldValue === newValue) {
                        return;
                    }
                    leafletData.getMap().then(function(map) {
                        markers.clearLayers();
                        drawServices(map, scope.services);
                    });
                }, true);
                refreshMap();
            }
        },
        template: '<leaflet geojson="geojson" tiles="tile" defaults="defaults" style="height: 400px"></leaflet>'
    };
});
