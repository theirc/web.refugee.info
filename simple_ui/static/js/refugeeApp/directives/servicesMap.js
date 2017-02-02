angular.module('refugeeApp').directive('servicesMap', function(leafletData, $state, $filter) {

    return {
        restrict: 'E',
        scope: {
            region: '=',
            services: '=',
            mapView: '=',
            isMobile: '='
        },
        link: {
            pre: function (scope) {
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
            post: function (scope) {
                var ctrl = scope.$parent.ctrl;
                var infoDiv = L.control();
                infoDiv.onAdd = function () {
                    this._div = L.DomUtil.create('div', 'hidden');
                    return this._div;
                };

                infoDiv.update = function (service) {
                    if (!service) {
                        this._div.innerHTML = ('<b>' + $filter('translate')('NO_SERVICES_INFO', { siteName: scope.$root.translatedSiteName }) + '</b>');
                    } else {
                        this._div.innerHTML = '<b>' + service.name + '</b><br/>' + $filter('limitTo')(service.description, 250);
                    }
                    this._div.className = 'service-info-control';
                };

                function showInfo(e) {
                    infoDiv.update(e ? e.target.options.service : null);
                }

                function hideDiv() {
                    infoDiv._div.className = 'hidden';
                }

                leafletData.getMap().then(function (map) {
                    var polygon = L.geoJson(scope.region);
                    map.fitBounds(polygon.getBounds());
                    map.sleep.disable();
                    if (scope.isMobile) {
                        map.sleep.disable();
                    }
                    infoDiv.addTo(map);
                });

                var markers = new L.LayerGroup();
                var markerClick = function onClick(e) {
                    $state.go('locationDetails.services.details', {slug: ctrl.slug, serviceId: e.target.options.service.id});
                };

                var drawServices = function(map, services) {
                    markers.clearLayers();
                    services.forEach(function(service) {
                        var lat = service.location.coordinates[1];
                        var lng = service.location.coordinates[0];
                        var icon = L.divIcon({
                            className: 'service-list-item-icon-container-map',
                            html: '<span class="fa fa-map-marker fa-3x service-icon-map"></span>',
                            iconSize: null
                        });
                        var marker = L.marker([lat, lng], {
                            icon: icon,
                            service: service,
                            riseOnHover: true
                        });
                        marker.on({
                            mouseover: showInfo,
                            mouseout: hideDiv,
                            click: markerClick
                        });
                        markers.addLayer(marker);
                    });
                    if (services.length > 0) {
                        map.addLayer(markers);
                    }
                };

                var refreshMap = function(){
                    leafletData.getMap().then(function (map) {
                        map.sleep.sleepNote.hidden = true;
                        drawServices(map, scope.services);
                    });
                };

                scope.$watch('services', function (newValue) {
                    if (angular.isDefined(newValue)) {
                        scope.services = newValue;
                        if (!scope.services.length) {
                            showInfo();
                        }
                        else {
                            hideDiv();
                        }
                        refreshMap();
                    }
                }, true);

                scope.$watch('mapView', function (newValue, oldValue) {
                    if (oldValue === newValue) {
                        return;
                    }
                    leafletData.getMap();

                }, true);

                refreshMap();
            }
        },
        template: '<leaflet geojson="geojson" layers="layers" class="services-map"></leaflet>'
    };
});
