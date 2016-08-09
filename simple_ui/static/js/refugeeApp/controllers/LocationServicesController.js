function chunk(arr, size) {
    var newArr = [];
    for (var i = 0; i < arr.length; i += size) {
        newArr.push(arr.slice(i, i + size));
    }
    return newArr;
}
angular.module('refugeeApp').controller('LocationServicesController', function($scope, $state, $stateParams, djangoRMI, LocationService) {
    var vm = this;
    vm.data = {};
    vm.loaded = false;
    vm.busy = true;
    vm.noMoreData = false;
    vm.chunkedServicesList = [];
    vm.services = [];
    vm.serviceTypes = {};
    vm.location = {};

    djangoRMI.location_json_view.get_details({slug: $stateParams.slug}).success(function(data) {
        vm.data = data;
        vm.loaded = true;
    });

    LocationService.getServiceTypes().then(function(response) {
        response.data.forEach(function(serviceType) {
            vm.serviceTypes[serviceType.url] = serviceType;
        });
        vm.loaded = true;
    });

    LocationService.getLocationBySlug($stateParams.slug).then(function(response) {
        if (response.data.length > 0) {
            vm.location = response.data[0];
        }
        vm.busy = false;
    });

    var page = 1;

    $scope.$watch(function() {
        return vm.search;
    }, function(newValue) {
        vm.services = [];
        vm.chunkedServicesList = [];
        vm.noMoreData = false;
        page = 1;
        vm.search = newValue;
        vm.getNextPage();
    });

    vm.getServiceIcon = function(url) {
        var serviceType = vm.serviceTypes[url];
        if (!serviceType) {
            return;
        } else {
            return serviceType.vector_icon;
        }
    };

    vm.getNextPage = function() {
        if (vm.busy || vm.noMoreData) {
            return;
        }
        vm.busy = true;
        LocationService.getServices(vm.location, page, vm.search).then(function (response) {
            response.data.results.forEach(function (service) {
                vm.services.push(service);
            });
            vm.chunkedServicesList = chunk(vm.services, 3);
            page++;
            if (!response.data.next) {
                vm.noMoreData = true;
            }
            vm.busy = false;
        });
    };

    vm.navigateToDetails = function(service) {
        $state.go('serviceDetails', {slug: $stateParams.slug, serviceId: service.id});
    };
});
