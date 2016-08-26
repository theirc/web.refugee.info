function chunk(arr, size) {
    var newArr = [];
    for (var i = 0; i < arr.length; i += size) {
        newArr.push(arr.slice(i, i + size));
    }
    return newArr;
}

angular.module('refugeeApp').controller('LocationServicesController', function ($scope, $state, $stateParams, LocationService, location) {
    var vm = this;
    vm.busy = false;
    vm.noMoreData = false;
    vm.chunkedServicesList = [];
    vm.services = [];
    vm.serviceTypes = {};
    vm.slug = $stateParams.slug;
    vm.location = location;
    vm.filterTypes = [];
    vm.mapView = false;

    LocationService.getServiceTypes().then(function (response) {
        response.data.forEach(function (serviceType) {
            vm.serviceTypes[serviceType.url] = serviceType;
        });
        vm.loaded = true;
    });
    var page = 1;

    $scope.$watch(function () {
        return vm.search;
    }, function (newValue) {
        vm.services = [];
        vm.chunkedServicesList = [];
        vm.noMoreData = false;
        page = 1;
        vm.search = newValue;
        vm.getNextPage();
    });

    $scope.$watchCollection(function () {
        return vm.filterTypes;
    }, function (newValue) {
        vm.filterTypes = newValue;
        vm.services = [];
        vm.chunkedServicesList = [];
        vm.noMoreData = false;
        page = 1;
        vm.getNextPage();
    });

    vm.getServiceIcon = function (url) {
        var serviceType = vm.serviceTypes[url];
        if (!serviceType) {
            return;
        } else {
            return serviceType.vector_icon;
        }
    };

    vm.getNextPage = function () {
        if (vm.busy || vm.noMoreData) {
            return;
        }
        vm.busy = true;
        LocationService.getServices(vm.location, page, vm.search).then(function (response) {
            response.data.results.forEach(function (service) {
                if (vm.filterTypes.length > 0) {
                    if (vm.filterTypes.indexOf(service.type) !== -1) {
                        vm.services.push(service);
                    }
                }
                else {
                    vm.services.push(service);
                }
            });
            vm.chunkedServicesList = chunk(vm.services, 3);
            page++;
            vm.busy = false;
            if (!response.data.next) {
                vm.noMoreData = true;
            }
            else {
                vm.getNextPage();
            }
        });
    };

    vm.switchView = function () {
        vm.mapView = !vm.mapView;
    };
});
