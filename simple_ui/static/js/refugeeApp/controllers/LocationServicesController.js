angular.module('refugeeApp').controller('LocationServicesController', function($scope, $stateParams, djangoRMI) {
    var vm = this;
    vm.data = {};
    vm.loaded = false;
    vm.slug = $stateParams.slug;

    djangoRMI.location_json_view.get_details({slug: $stateParams.slug}).success(function(data) {
        vm.data = data;
        vm.loaded = true;
    });
});
