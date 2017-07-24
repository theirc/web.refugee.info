angular.module('refugeeApp').controller('ServiceDetailsController', function ($scope, $stateParams, service, serviceIcon, location, serviceType, $cookies) {
    var vm = this;
    vm.slug = $stateParams.slug ? $stateParams.slug : $cookies.get('locationSlug');
    vm.service = service;
    vm.serviceIcon = serviceIcon;
    vm.location = location;
    vm.serviceType = serviceType;
});
