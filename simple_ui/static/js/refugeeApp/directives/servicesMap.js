angular.module('refugeeApp').directive('servicesMap', function(leafletData, $state, $filter) {

    return {
        restrict: 'E',
        scope: {
            region: '=',
            services: '=',
            mapView: '=',
            isMobile: '=',
            chunkedServicesList: '=',
            loading: '='
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
                    },
                    showServiceInfo: false,
                    regionSlug: '',
                    serviceInfo: {}
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
                        if (scope.loading) {
                            this._div.innerHTML = ('<b>' + $filter('translate')('LOADING', { siteName: scope.$root.translatedSiteName }) + '</b>');
                        }
                        else {
                            this._div.innerHTML = ('<b>' + $filter('translate')('NO_SERVICES_INFO', { siteName: scope.$root.translatedSiteName }) + '</b>');
                        }
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

                var displayServiceInfo = function(e) {
                    scope.regionSlug = ctrl.slug;
                    scope.serviceInfo = e ? e.target.options.service : null;
                    scope.showServiceInfo = true;
                    scope.serviceInfo.icon = ctrl.getServiceIcon(scope.serviceInfo.type);
                    scope.serviceInfo.description = $filter('limitTo')(scope.serviceInfo.description, 200);
                    refreshMap();
                };

                function chunk(arr, size) {
                    var newArr = [];
                    for (var i = 0; i < arr.length; i += size) {
                        newArr.push(arr.slice(i, i + size));
                    }
                    return newArr;
                }

                leafletData.getMap().then(function (map) {
                    var polygon = L.geoJson(scope.region);
                    map.fitBounds(polygon.getBounds());
                    map.sleep.disable();
                    if (scope.isMobile) {
                        map.sleep.disable();
                    }
                    map.on({
                        click: () => {
                            scope.showServiceInfo = false;
                        },
                        zoomend: () => {
                            for (let service of scope.services) {
                                let position = L.latLng(service.location.coordinates[1], service.location.coordinates[0]);
                                service.hideFromList = !map.getBounds().contains(position);
                            }
                            if (!scope.isMobile) {
                                scope.chunkedServicesList = chunk(scope.services.filter( (s) => s.hideFromList == false ), 3);
                            }
                            else {
                                scope.chunkedServicesList = chunk(scope.services, 3);
                            }
                        },
                        moveend: () => {
                            for (let service of scope.services) {
                                let position = L.latLng(service.location.coordinates[1], service.location.coordinates[0]);
                                service.hideFromList = !map.getBounds().contains(position);
                            }
                            if (!scope.isMobile) {
                                scope.chunkedServicesList = chunk(scope.services.filter( (s) => s.hideFromList == false ), 3);
                            }
                            else {
                                scope.chunkedServicesList = chunk(scope.services, 3);
                            }
                        }
                    });
                    infoDiv.addTo(map);
                });

                var markers = new L.LayerGroup();
                var markerClick = function onClick(e) {
                    $state.go('locationDetails.services.details', {slug: ctrl.slug, serviceId: e.target.options.service.id});
                };

                var drawServices = function(map, services, isMobile) {
                    markers.clearLayers();
                    services && services.forEach(function(service) {
                        var lat = service.location.coordinates[1];
                        var lng = service.location.coordinates[0];
                        var icon = L.divIcon({
                            className: 'service-list-item-icon-container-map',
                            html: '<img src="/static/images/marker.png" class="service-icon-map">',
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
                            click: function (e) {
                                if (isMobile) {
                                    displayServiceInfo(e);
                                } else {
                                    markerClick(e);
                                }
                            }
                        });
                        let position = L.latLng(lat, lng);
                        service.hideFromList = !map.getBounds().contains(position);
                        markers.addLayer(marker);
                    });
                    if (services && services.length > 0) {
                        map.addLayer(markers);
                        if (!scope.isMobile) {
                            scope.chunkedServicesList = chunk(scope.services.filter( (s) => s.hideFromList == false ), 3);
                        }
                        else {
                            scope.chunkedServicesList = chunk(scope.services, 3);
                        }
                    }
                };

                var refreshMap = function(){
                    leafletData.getMap().then(function (map) {
                        map.sleep.sleepNote.hidden = true;
                        drawServices(map, scope.services, scope.isMobile);
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
                    scope.showServiceInfo = false;
                    leafletData.getMap();

                }, true);

                refreshMap();
            }
        },
        templateUrl: 'partials/directives/services-map.html'
    };
});
