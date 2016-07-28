angular.module('refugeeApp').controller('LocationDetailsController', function($scope, $stateParams, $state, djangoRMI) {
    var vm = this;
    vm.data = {};
    vm.loaded = false;

    djangoRMI.location_json_view.get_details({slug: $stateParams.slug}).success(function(data) {
        vm.data = data;
        vm.loaded = true;
    });

    vm.navigateTo = function(state) {
        $state.go(state, {slug: $stateParams.slug});
    };
});
