angular.module('refugeeApp').directive('locationInfo', function () {
    return {
        restrict: 'E',
        bindToController: true,
        scope: {
            location: '='
        },
        controller: function(){
            var vm = this;
            vm.$onInit = function() {
                vm.locationName = vm.location.title || vm.location.metadata.page_title || vm.location.name || '';
            };
        },
        templateUrl: '/partials/directives/location-info.html',
        controllerAs: 'ctrl'
    };
});
