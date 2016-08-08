angular.module('refugeeApp').controller('ServiceDetailsController', function ($scope, $stateParams, $state, djangoRMI, LocationService) {
    var vm = this;
    vm.data = {};
    vm.loaded = false;
    vm.slug = $stateParams.slug;
    vm.service = {};
    vm.serviceIcon = '';

    djangoRMI.location_json_view.get_details({slug: $stateParams.slug}).success(function (data) {
        vm.data = data;
        vm.loaded = true;
    });
    LocationService.getService($stateParams.serviceId).then(function (response) {
        vm.service = response.data.results[0];
        LocationService.getServiceType(vm.service).then(function (response) {
            vm.serviceIcon = response.data.vector_icon;
        });
    });
});
