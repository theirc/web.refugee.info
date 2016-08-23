angular.module('refugeeApp').directive('locationMap', function (leafletData) {
    var lightStyle = {
        color: "#969393",
        fillColor: "#c7c7c7",
        fillOpacity: 1,
        opacity: 1,
        weight: 0.6
    };
    var darkStyle = {
        color: "#252525",
        fillColor: "#424242",
        fillOpacity: 1,
        opacity: 1,
        weight: 0.6
    };
    var closestCountryStyle = {
        color: "#000",
        fillColor: "#00BA50",
        fillOpacity: 1,
        opacity: 1,
        weight: 0.3
    };
    return {
        restrict: 'E',
        scope: {
            theme: '=?',
            closest: '=?',
            regions: '=?',
            countries: '=?'
        },
        controller: function ($scope, $filter, $state) {
            $scope.countryNames = {};
            $scope.regions.forEach(function(region){
                $scope.countryNames[region.code] = region.title || region.name;
            });
            $scope.closestCountry = $filter('filter')($scope.regions, {id: $scope.closest.parent || $scope.closest.id})[0];
            $scope.navigateTo = function(slug) {
                $state.go('locationDetails.index', {slug: slug});
            };
        },
        link: {
            pre: function (scope) {
                angular.extend(scope, {
                    defaults: {
                        scrollWheelZoom: true
                    },
                    tiles: {
                        dark: {
                            url: "http://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png",
                            options: {
                                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            }
                        },
                        light: {
                            url: "http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png",
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
            post: function (scope) {
                var markers = new L.layerGroup();

                function onMarkerClick(e) {
                    scope.navigateTo(e.target.options.location.slug);
                }

                function clickFeature(e) {
                    markers.clearLayers();
                    var layer = e.target;
                    leafletData.getMap().then(function (map) {
                        var featureCode = layer.feature.properties.iso_a2;
                        var country = scope.regions.filter(function (region) {
                            return region.code == featureCode;
                        })[0];
                        var cities = country.children;
                        if (cities.length > 0) {
                            cities.forEach(function (city) {
                                buildMarker(city);
                            });
                        }
                        else {
                            buildMarker(country);
                        }
                        markers.addTo(map);
                        map.fitBounds(layer.getBounds());
                    });
                }

                var buildMarker = function (location) {
                    var polygon = L.geoJson(location.envelope);
                    var latLng = polygon.getBounds().getCenter();
                    L.marker(latLng, {location: location})
                        .addTo(markers)
                        .on('click', onMarkerClick)
                        .bindLabel(location.title || location.name);
                };

                var refreshMap = function () {
                    angular.extend(scope, {
                        geojson: {
                            data: scope.countries,
                            filter: function (feature) {
                                var featureCode = feature.properties.iso_a2;
                                if (scope.regions.filter(function (region) {
                                    return region.code == featureCode;
                                }).length > 0) {
                                    return feature;
                                }
                            },
                            theme: scope.theme,
                            style: function (feature) {
                                if (scope.closestCountry) {
                                    var featureCode = feature.properties.iso_a2;
                                    if (featureCode == scope.closestCountry.code) {
                                        return closestCountryStyle;
                                    }
                                }
                                if (scope.theme == 'dark') {
                                    return darkStyle;
                                }
                                else {
                                    return lightStyle;
                                }
                            },
                            onEachFeature: function (feature, layer) {
                                layer.on({
                                    click: clickFeature
                                });
                                layer.bindLabel(scope.countryNames[feature.properties.iso_a2]);
                            }
                        }
                    });
                };
                refreshMap();
                leafletData.getMap().then(function (map) {
                    var polygon = L.geoJson(scope.geojson.data);
                    map.fitBounds(polygon.getBounds());
                });
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
        template: '<leaflet geojson="geojson" tiles="tile" defaults="defaults" class="map-container"></leaflet>'
    };
});
