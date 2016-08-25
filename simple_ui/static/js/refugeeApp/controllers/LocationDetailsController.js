angular.module('refugeeApp').controller('LocationDetailsController', function ($scope, $stateParams, $state, djangoRMI, location) {
    var vm = this;
    vm.data = {};
    vm.loaded = false;
    vm.slug = $stateParams.slug;
    vm.location = location;
});
