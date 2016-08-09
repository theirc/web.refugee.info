angular.module('refugeeApp').controller('ServiceDetailsController', function ($scope, $stateParams, service, serviceIcon) {
    var vm = this;
    vm.slug = $stateParams.slug;
    vm.service = service;
    vm.serviceIcon = serviceIcon;
});
