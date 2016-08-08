function chunk(arr, size) {
    var newArr = [];
    for (var i = 0; i < arr.length; i += size) {
        newArr.push(arr.slice(i, i + size));
    }
    return newArr;
}

angular.module('refugeeApp').directive('servicesList', function($state) {
    return {
        restrict: 'E',
        templateUrl: '/partials/directives/services-list.html',
        bindToController: true,
        scope: {
            locationSlug: '=',
            filter: '=?'
        },
        controller: function($scope, LocationService) {
            var vm = this;

            vm.busy = false;
            vm.noMoreData = false;
            vm.chunkedServicesList = [];
            vm.services = [];
            vm.serviceTypes = {};
            vm.location = {};

            var page = 1;

            $scope.$watch(function() {
                return vm.filter;
            }, function(newValue) {
                vm.services = [];
                vm.chunkedServicesList = [];
                vm.noMoreData = false;
                page = 1;
                vm.filter = newValue;
                vm.getNextPage();
            });

            LocationService.getServiceTypes().then(function(response) {
                response.data.forEach(function(serviceType) {
                    vm.serviceTypes[serviceType.url] = serviceType;
                });
                vm.loaded = true;
            });

            LocationService.getLocationBySlug(vm.locationSlug).then(function(response) {
                if (response.data.length > 0) {
                    vm.location = response.data[0];
                }
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
                LocationService.getServices(vm.locationSlug, page, vm.filter).then(function(response) {
                    response.data.results.forEach(function(service) {
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
                $state.go('serviceDetails', {slug: $state.params.slug, serviceId: service.id});
            };
        },
        controllerAs: 'ctrl'
    };
});
