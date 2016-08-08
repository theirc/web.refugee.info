angular.module('refugeeApp').directive('serviceDetails', function () {
    return {
        restrict: 'E',
        templateUrl: '/partials/directives/service-details.html',
        bindToController: true,
        scope: {
            service: '='
        },
        controller: function ($window) {
            var vm = this;
            vm.service = {};

            vm.getDirections = function () {
                $window.open('https://maps.google.com?daddr=' + vm.service.address, '_blank');
            };
        },
        controllerAs: 'ctrl'
    };
});
