angular.module('refugeeApp').directive('servicesMap', function(leafletData, $state, $filter) {

    return {
        restrict: 'E',
        scope: {
            region: '=',
            services: '=',
            mapView: '=',
            isMobile: '=',
            chunkedServicesList: '=',
            loading: '=',
            isRtl: '=',
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
                        this._div.innerHTML = '<b>' + service.name + '</b><br/>' + service.description;
                    }
                    this._div.className = 'service-info-control';
                };

                function showInfo(e) {
                    if (!scope.isMobile) {
                        infoDiv.update(e ? e.target.options.service : null);
                    }
                }

                function hideDiv() {
                    infoDiv._div.className = 'hidden';
                }

                var displayServiceInfo = function(e) {
                    scope.regionSlug = ctrl.slug;
                    scope.serviceInfo = e ? e.options.service : null;
                    scope.serviceInfo.icons = scope.serviceInfo.types;
                    scope.showServiceInfo = true;
                    leafletData.getMap().then(function (map) {
                        map.sleep.sleepNote.hidden = true;
                    });
                };

                function chunk(arr, size) {
                    var newArr = [];
                    for (var i = 0; i < arr.length; i += size) {
                        newArr.push(arr.slice(i, i + size));
                    }
                    return newArr;
                }

                let checkOverlappingServices = (map) => {
                    let locs = Object.values(map._layers).map( (m) => {return m._latlng;} );
                    for (let marker in map._layers) {
                        if (map._layers[marker]._latlng && map._layers[marker].options.service) {
                            let locsFiltered = locs.filter( (l) => { return l && l.lng !== map._layers[marker]._latlng.lng && l.lat !== map._layers[marker]._latlng.lat; });
                            let closestLayer = L.GeometryUtil.closest(map, locsFiltered, map._layers[marker]._latlng, true);
                            let iconDict = {
                                className: 'service-list-item-icon-container-map',
                                html: '',
                                iconSize: null
                            };
                            if (closestLayer && closestLayer.distance < 2) {
                                let iconHtml = '';
                                if (scope.isRtl) {
                                    iconHtml = `<span class="fa fa-map-marker fa-3x service-icon-map" style="color: ${ctrl.getServiceColor(map._layers[marker].options.service.types[0].id)}"></span>
                                                <span class="fa fa-plus service-plus-icon-map-rtl" style="color: white; background-color: ${ctrl.getServiceColor(map._layers[marker].options.service.types[0].id)}"></span>`;
                                }
                                else {
                                    iconHtml = `<span class="fa fa-map-marker fa-3x service-icon-map" style="color: ${ctrl.getServiceColor(map._layers[marker].options.service.types[0].id)}"></span>
                                                <span class="fa fa-plus service-plus-icon-map" style="color: white; background-color: ${ctrl.getServiceColor(map._layers[marker].options.service.types[0].id)}"></span>`;
                                }
                                iconDict['html'] = iconHtml;
                            }
                            else {
                                iconDict['html'] = `<span class="fa fa-map-marker fa-3x service-icon-map" style="color: ${ctrl.getServiceColor(map._layers[marker].options.service.types[0].id)}"></span>`;
                            }
                            let icon = L.divIcon(iconDict);
                            map._layers[marker].setIcon(icon);
                        }
                    }
                };

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
                                if (service.location) {
                                    let position = L.latLng(service.location.coordinates[1], service.location.coordinates[0]);
                                    service.hideFromList = !map.getBounds().contains(position);
                                }
                            }
                            scope.chunkedServicesList = chunk(scope.services.filter( (s) => s.hideFromList == false ), 3);
                            checkOverlappingServices(map);
                        },
                        moveend: () => {
                            for (let service of scope.services) {
                                if (service.location) {
                                    let position = L.latLng(service.location.coordinates[1], service.location.coordinates[0]);
                                    service.hideFromList = !map.getBounds().contains(position);
                                }
                            }
                            scope.chunkedServicesList = chunk(scope.services.filter( (s) => s.hideFromList == false ), 3);
                        }
                    });
                    infoDiv.addTo(map);
                });

                var markers = new L.LayerGroup();
                var markerClick = function onClick(e) {
                    $state.go('locationDetails.services.details', {slug: ctrl.slug, serviceId: e.options.service.id});
                };

                var drawServices = function(map, services, isMobile, oms) {
                    markers.clearLayers();
                    map.fireEvent('click');
                    services && services.forEach(function(service) {
                        if (service.location) {
                            var lat = service.location.coordinates[1];
                            var lng = service.location.coordinates[0];
                            var icon = L.divIcon({
                                className: 'service-list-item-icon-container-map',
                                html: `<span class="fa fa-map-marker fa-3x service-icon-map" style="color: ${ctrl.getServiceColor(service.types[0].id)}"></span>`,
                                iconSize: null
                            });
                            var marker = L.marker([lat, lng], {
                                icon: icon,
                                service: service,
                                riseOnHover: true
                            });
                            marker.on({
                                mouseover: showInfo,
                                mouseout: hideDiv
                            });
                            let position = L.latLng(lat, lng);
                            service.hideFromList = !map.getBounds().contains(position);
                            markers.addLayer(marker);
                            oms.addMarker(marker);
                        }
                    });
                    if (services && services.length > 0) {
                        let locs = oms.markers.map((m) => {return m._latlng;});
                        for (let marker in markers._layers) {
                            let locsFiltered = locs.filter( (l) => { return l.lng !== markers._layers[marker]._latlng && l.lat !== markers._layers[marker]._latlng.lat; });
                            let closestLayer = L.GeometryUtil.closest(map, locsFiltered, markers._layers[marker]._latlng, true);
                            if (closestLayer && closestLayer.distance < 2) {
                                let iconHtml = '';
                                if (scope.isRtl) {
                                    iconHtml = `<span class="fa fa-map-marker fa-3x service-icon-map" style="color: ${ctrl.getServiceColor(markers._layers[marker].options.service.types[0].id)}"></span>
                                                <span class="fa fa-plus service-plus-icon-map-rtl" style="color: white; background-color: ${ctrl.getServiceColor(markers._layers[marker].options.service.types[0].id)}"></span>`;
                                }
                                else {
                                    iconHtml = `<span class="fa fa-map-marker fa-3x service-icon-map" style="color: ${ctrl.getServiceColor(markers._layers[marker].options.service.types[0].id)}"></span>
                                                <span class="fa fa-plus service-plus-icon-map" style="color: white; background-color: ${ctrl.getServiceColor(markers._layers[marker].options.service.types[0].id)}"></span>`;
                                }
                                let icon = L.divIcon({
                                    className: 'service-list-item-icon-container-map',
                                    html: iconHtml,
                                    iconSize: null
                                });
                                markers._layers[marker].setIcon(icon);
                            }
                        }
                        map.addLayer(markers);
                        scope.chunkedServicesList = chunk(scope.services.filter( (s) => s.hideFromList == false ), 3);
                    }

                };

                var refreshMap = function(){
                    leafletData.getMap().then(function (map) {
                        map.sleep.sleepNote.hidden = true;
                        /* global OverlappingMarkerSpiderfier */
                        /* eslint no-undef: "error" */
                        let oms = new OverlappingMarkerSpiderfier(map, {keepSpiderfied: true, markersWontMove: true, markersWontHide: true});
                        oms.addListener('click', function(marker) {
                            if (marker) {
                                if (scope.isMobile) {
                                    displayServiceInfo(marker);
                                } else {
                                    markerClick(marker);
                                }
                            }
                        });
                        oms.addListener('spiderfy', function(markers) {
                            for (var i = 0, len = markers.length; i < len; i ++) {
                                var icon = L.divIcon({
                                    className: 'service-list-item-icon-container-map',
                                    html: `<span class="fa fa-map-marker fa-3x service-icon-map" style="color: ${ctrl.getServiceColor(markers[i].options.service.types[0].id)}"></span>`,
                                    iconSize: null
                                });
                                markers[i].setIcon(icon);
                            }
                        });
                        oms.addListener('unspiderfy', function(markers) {
                            for (var i = 0, len = markers.length; i < len; i ++) {
                                let iconHtml = '';
                                if (scope.isRtl) {
                                    iconHtml = `<span class="fa fa-map-marker fa-3x service-icon-map" style="color: ${ctrl.getServiceColor(markers[i].options.service.types[0].id)}"></span>
                                                <span class="fa fa-plus service-plus-icon-map-rtl" style="color: white; background-color: ${ctrl.getServiceColor(markers[i].options.service.types[0].id)}"></span>`;
                                }
                                else {
                                    iconHtml = `<span class="fa fa-map-marker fa-3x service-icon-map" style="color: ${ctrl.getServiceColor(markers[i].options.service.types[0].id)}"></span>
                                                <span class="fa fa-plus service-plus-icon-map" style="color: white; background-color: ${ctrl.getServiceColor(markers[i].options.service.types[0].id)}"></span>`;
                                }
                                var icon = L.divIcon({
                                    className: 'service-list-item-icon-container-map',
                                    html: iconHtml,
                                    iconSize: null
                                });
                                markers[i].setIcon(icon);
                            }
                        });
                        drawServices(map, scope.services, scope.isMobile, oms);
                    });
                };

                scope.$watch('services', function (newValue, oldValue) {
                    if (angular.isDefined(newValue) && newValue.length != oldValue.length) {
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

                scope.$watch('loading', function(newValue) {
                    if (angular.isDefined(newValue)) {
                        scope.loading = newValue;
                        if (!scope.services.length) {
                            showInfo();
                        }
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
