angular.module('refugeeApp').controller('ServiceDetailsController', function ($scope, $stateParams, service, serviceIcon, location, serviceType, $cookies, $sce) {
    var vm = this;
    vm.slug = $stateParams.slug ? $stateParams.slug : $cookies.get('locationSlug');
    vm.service = service;
    vm.service.description = $sce.trustAsHtml(vm.service.description);
    vm.serviceIcon = serviceIcon;
    vm.location = location;
    vm.serviceType = serviceType;
});
