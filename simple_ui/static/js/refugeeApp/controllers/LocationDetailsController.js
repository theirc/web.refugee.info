angular.module('refugeeApp').controller('LocationDetailsController', function($scope, $stateParams, $state, djangoRMI) {
    var vm = this;
    vm.data = {};
    vm.loaded = false;
    vm.region = {};

    angular.extend(vm, {
        defaults: {
            scrollWheelZoom: false
        }
    });

    djangoRMI.location_json_view.get_details({slug: $stateParams.slug}).success(function(data) {
        vm.data = data;
        vm.loaded = true;
        angular.extend(vm, {
            region: {
                lat: data.location.centroid.coordinates[1],
                lng: data.location.centroid.coordinates[0],
                zoom: 10
            },
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
    });

    vm.navigateTo = function(state) {
        $state.go(state, {slug: $stateParams.slug});
    };
});
