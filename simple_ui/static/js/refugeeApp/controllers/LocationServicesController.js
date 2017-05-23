function chunk(arr, size) {
    var newArr = [];
    for (var i = 0; i < arr.length; i += size) {
        newArr.push(arr.slice(i, i + size));
    }
    return newArr;
}

angular.module('refugeeApp').controller('LocationServicesController', function ($scope, $state, $stateParams, LocationService, location, $location, $rootScope) {
    var vm = this;
    vm.filters = true;
    vm.busy = false;
    vm.noMoreData = false;
    vm.chunkedServicesList = [];
    vm.services = [];
    vm.serviceTypes = {};
    vm.serviceTypesMobile = {
        0: {'name': 'All Types'}
    };
    vm.slug = $stateParams.slug;
    vm.location = location;
    vm.mapView = $stateParams.mapView;
    $rootScope.mapView = vm.mapView;
    vm.search = $stateParams.query;
    var getFilterTypesArr = function () {
        if ($location.search().type) {
            if (angular.isArray($location.search().type)) {
                return $location.search().type.map(function (x) {
                    return parseInt(x, 10);
                });
            }
            else {
                return [parseInt($location.search().type, 10)];
            }
        }
        else {
            return [];
        }
    };
    vm.filterTypes = getFilterTypesArr();
    LocationService.getServiceTypes().then(function (response) {
        response.data.forEach(function (serviceType) {
            vm.serviceTypes[serviceType.id] = serviceType;
        });
        vm.loaded = true;
    });

    LocationService.getServiceTypesMobile(vm.location).then(function (response) {
        response.data.forEach(function (service) {
            vm.serviceTypesMobile[service.type.id] = service.type;
        });
    });
    var page = 1;

    $scope.$watch(function () {
        return vm.search;
    }, function (newValue) {
        if (angular.isDefined(newValue)) {
            if (newValue) {
                $location.search('query', newValue);
            }
            else {
                $location.search('query', null);
            }
        }
        vm.services = [];
        vm.chunkedServicesList = [];
        vm.noMoreData = false;
        page = 1;
        vm.search = newValue;
        vm.getNextPage();
    });

    $scope.$watchCollection(function () {
        return $location.search().type;
    }, function () {
        vm.filterTypes = getFilterTypesArr();
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
        }
        else {
            return serviceType.vector_icon;
        }
    };

    vm.getServiceColor = (url) => {
        let serviceType = vm.serviceTypes[url];
        if (!serviceType || !serviceType.color) {
            return '#00BA50';
        }
        else {
            if (serviceType.color.substring(0,1) == '#') {
                return serviceType.color;
            }
            else {
                return `#${serviceType.color}`;
            }
        }
    };

    vm.getNextPage = function () {
        if (vm.busy || vm.noMoreData) {
            return;
        }
        vm.busy = true;
        LocationService.getServices(vm.location, page, vm.search, vm.filterTypes).then(function (response) {
            response.data.results.forEach(function (service) {
                service.hideFromList = false;
                vm.services.push(service);
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
        vm.mapView = true;
        $rootScope.mapView = true;
        vm.filters = false;
    };

    vm.filtersView = function() {
        vm.filters = !vm.filters;
    };

    vm.listView = function() {
        vm.filters = false;
        vm.mapView = false;
        $rootScope.mapView = false;
    };

    vm.setSelectedTypeMobile = function(type) {
        if (type.id) {
            $location.search('type', type.id);
        }
        else {
            $location.search('type', '');
        }
        vm.mapView = false;
        vm.filters = false;
    };
});
