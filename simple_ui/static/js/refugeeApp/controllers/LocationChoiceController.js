angular.module('refugeeApp').controller('LocationChoiceController', function($rootScope, $state, locationData) {
    var vm = this;
    vm.data = locationData;

    $rootScope.location = null;

    vm.navigateTo = function(slug) {
        $state.go('locationDetails.index', {slug: slug});
    };
});
