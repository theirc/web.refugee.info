angular.module('refugeeApp').directive('serviceMap', function (leafletData) {
    return {
        restrict: 'E',
        scope: {
            service: '=',
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
                                type: 'google'
                            }
                        }
                    }
                });
            },
            post: function (scope) {
                var refreshMap = function () {
                    var lat = scope.service.location.coordinates[1];
                    var lng = scope.service.location.coordinates[0];
                    angular.extend(scope, {
                        markers: {
                            service: {
                                lat: lat,
                                lng: lng
                            }
                        }
                    });
                    leafletData.getMap().then(function(map) {
                        var zoom = 16;
                        map._onResize();
                        map.setView([lat, lng], zoom);
                    });
                };

                scope.$watch('service', function (newValue, oldValue) {
                    if (oldValue === newValue) {
                        return;
                    }
                    scope.service = newValue;
                    refreshMap();
                }, true);

                refreshMap();
            }
        },
        template: '<leaflet markers="markers" defaults="defaults" layers="layers" style="height: 400px"></leaflet>'
    };
});
