angular.module('refugeeApp').controller('ServiceDetailsController', function ($scope, $stateParams, service, serviceIcon, sameCoordinatesServices, location, serviceType, $cookies) {
    var vm = this;
    vm.slug = $stateParams.slug ? $stateParams.slug : $cookies.get('locationSlug');
    vm.service = service;
    vm.serviceIcon = serviceIcon;
    vm.location = location;
    vm.serviceType = serviceType;
    vm.maxOtherServicesNumber = 10;

    vm.$onInit = () => {
        let displayedServices = sameCoordinatesServices.slice(0, vm.maxOtherServicesNumber);
        vm.chunkedSameCoordinatesServices = vm.chunk(displayedServices, 3);
    };

    vm.chunk = (arr, size) => {
        var newArr = [];
        for (var i = 0; i < arr.length; i += size) {
            newArr.push(arr.slice(i, i + size));
        }
        return newArr;
    };

    vm.getServiceIcon = (type) => {
        if (!type) {
            return;
        }
        else {
            return type.vector_icon;
        }
    };

    vm.getServiceColor = (type) => {
        if (!type || !type.color) {
            return '#00BA50';
        }
        else {
            if (type.color.substring(0,1) == '#') {
                return type.color;
            }
            else {
                return `#${type.color}`;
            }
        }
    };
});
