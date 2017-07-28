angular.module('refugeeApp').controller('ServiceDetailsController', function ($scope, $stateParams, service, serviceIcon, location, locationTitleInEnglish, serviceType, $cookies) {
    var vm = this;
    vm.slug = $stateParams.slug ? $stateParams.slug : $cookies.get('locationSlug');
    vm.service = service;
    vm.serviceIcon = serviceIcon;
    vm.location = location;
    vm.locationTitleInEnglish = locationTitleInEnglish;
    vm.serviceType = serviceType;
});
