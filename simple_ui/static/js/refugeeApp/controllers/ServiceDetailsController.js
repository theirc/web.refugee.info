angular.module('refugeeApp').controller('ServiceDetailsController', function ($scope, $stateParams, service, serviceIcon, location, serviceType) {
    var vm = this;
    vm.slug = $stateParams.slug;
    vm.service = service;
    vm.serviceIcon = serviceIcon;
    vm.location = location;
    vm.serviceType = serviceType;
});
