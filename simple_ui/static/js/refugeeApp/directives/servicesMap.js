angular.module('refugeeApp').directive('servicesMap', function(leafletData, $state) {

    return {
        restrict: 'E',
        scope: {
            region: '=',
            services: '='
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
            },
            post: function(scope) {
                var ctrl = scope.$parent.ctrl;
                var markers = new L.markerClusterGroup({
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
                    services.forEach(function(service) {
                        var lat = service.location.coordinates[1];
                        var lng = service.location.coordinates[0];
                        var icon = L.divIcon({
                            className: 'service-list-item-icon-container',
                            html: '<span class="fa ' + ctrl.getServiceIcon(service.type) + ' fa-2x service-icon"></span>',
                            iconSize: null,
                            labelAnchor: [6, 0]
                        });
                        var marker = L.marker([lat, lng], {
                            icon: icon,
                            service: service,
                            riseOnHover: true
                        }).bindLabel(service.name + '<br>' + service.description, {
                            direction: 'auto',
                            className: 'leaflet-service-label'
                        });
                        marker.on('click', markerClick);
                        markers.addLayer(marker);
                    });
                    if (services.length > 0) {
                        map.addLayer(markers);
                        map.fitBounds(markers.getBounds());
                    }
                };

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
                        drawServices(map, scope.services);
                    });
                }, true);
            }
        },
        template: '<leaflet geojson="geojson" layers="layers" defaults="defaults" style="height: 400px"></leaflet>'
    };
});
