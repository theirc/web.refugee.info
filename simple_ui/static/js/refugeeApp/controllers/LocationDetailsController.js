angular.module('refugeeApp').controller('LocationDetailsController', function($scope, $stateParams, $state, djangoRMI, leafletData) {
    var vm = this;
    vm.data = {};
    vm.loaded = false;

    angular.extend(vm, {
        defaults: {
            scrollWheelZoom: false
        }
    });

    djangoRMI.location_json_view.get_details({slug: $stateParams.slug}).success(function(data) {
        vm.data = data;
        vm.loaded = true;
        angular.extend(vm, {
            geojson: {
                data: data.location.envelope,
                style: {
                    fillColor: "green",
                    weight: 2,
                    opacity: 1,
                    color: 'white',
                    dashArray: '3',
                    fillOpacity: 0.7
                }
            }
        });
        var polygon = L.geoJson(vm.geojson.data);
        leafletData.getMap().then(function(map) {
            map.fitBounds(polygon.getBounds());
        });
    });

    vm.navigateTo = function(state) {
        $state.go(state, {slug: $stateParams.slug});
    };
});
