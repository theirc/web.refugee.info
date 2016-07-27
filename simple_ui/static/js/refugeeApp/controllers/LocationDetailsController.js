angular.module('refugeeApp').controller('LocationDetailsController', function($scope, $stateParams, $anchorScroll, $location, djangoRMI) {
    var vm = this;
    vm.data = {};
    vm.loaded = false;

    djangoRMI.location_json_view.get_details({slug: $stateParams.slug}).success(function(data) {
        vm.data = data;
        vm.loaded = true;
    });
});
