angular.module('refugeeApp').directive('servicesMap', function(leafletData, $state, $filter) {

    return {
        restrict: 'E',
        scope: {
            region: '=',
            services: '=',
            mapView: '='
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
            },
            post: function(scope) {
                var ctrl = scope.$parent.ctrl;
                var infoDiv = L.control();

                infoDiv.onAdd = function () {
                    this._div = L.DomUtil.create('div', 'hidden');
                    return this._div;
                };

                infoDiv.update = function (service) {
                    this._div.innerHTML = ('<b>' + service.name + '</b><br/>' +  $filter('limitTo')(service.description, 250));
                    this._div.className = 'service-info-control';
                };

                function showDetails(e) {
                    infoDiv.update(e.target.options.service);
                }

                function hideDiv() {
                    infoDiv._div.className = 'hidden';
                }

                leafletData.getMap().then(function (map) {
                    var polygon = L.geoJson(scope.region);
                    map.fitBounds(polygon.getBounds());
                    infoDiv.addTo(map);
                });

                var markers = new L.markerClusterGroup({
                    zoomToBoundsOnClick: false,
                    iconCreateFunction: function(cluster) {
                        return L.divIcon({
                            className: 'service-list-item-icon-container',
                            html: '<span class="service-icon">' + cluster.getChildCount() + '</span>',
                            iconSize:null
                        });
                    }
                });
                var markerClick = function onClick(e) {
                    $state.go('locationDetails.services.details',{slug: ctrl.slug, serviceId: e.target.options.service.id});
                };

                var drawServices = function(map, services) {
                    markers.clearLayers();
                    markers.on('clusterclick', function (a) {
                        var bounds = a.layer.getBounds().pad(0.1);
                        map.fitBounds(bounds);
                    });
                    services.forEach(function(service) {
                        var lat = service.location.coordinates[1];
                        var lng = service.location.coordinates[0];
                        var icon = L.divIcon({
                            className: 'service-list-item-icon-container',
                            html: '<span class="fa ' + ctrl.getServiceIcon(service.type) + ' fa-2x service-icon"></span>',
                            iconSize: null,
                        });
                        var marker = L.marker([lat, lng], {
                            icon: icon,
                            service: service,
                            riseOnHover: true
                        });
                        marker.on({
                            mouseover: showDetails,
                            mouseout: hideDiv,
                            click: markerClick
                        });
                        markers.addLayer(marker);
                    });
                    if (services.length > 0) {
                        map.addLayer(markers);
                        map.fitBounds(markers.getBounds(), {padding: [25, 25]});
                    }
                };

                scope.$watch('mapView', function (newValue, oldValue) {
                    if (oldValue === newValue) {
                        return;
                    }
                    leafletData.getMap().then(function(map) {
                        if (scope.services.length > 0) {
                            map.fitBounds(markers.getBounds());
                        }
                    });

                }, true);

                scope.$watch('region', function (newValue, oldValue) {
                    if (oldValue === newValue) {
                        return;
                    }
                    scope.region = newValue;
                }, true);

                scope.$watch('services', function (newValue, oldValue) {
                    if (oldValue === newValue) {
                        return;
                    }
                    scope.services = newValue;
                    leafletData.getMap().then(function(map) {
                        map.sleep.sleepNote.hidden = true;
                        drawServices(map, scope.services);
                    });
                }, true);

                scope.$watch('$stateChangeSuccess', function () {
                    if (scope.services){
                        leafletData.getMap().then(function(map) {
                            map.sleep.sleepNote.hidden = true;
                            drawServices(map, scope.services);
                        });
                    }
                });
            }
        },
        template: '<leaflet geojson="geojson" layers="layers" class="services-map"></leaflet>'
    };
});
