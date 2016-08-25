angular.module('refugeeApp').controller('LocationChoiceController', function($rootScope, $state, $stateParams, $cookies, locationData, countriesJson) {
    var vm = this;
    vm.countries = countriesJson;
    vm.data = locationData;
    vm.data.regions = vm.data.regions.filter(function (region) {
        return (region.children.length > 0 || !region.hidden);
    });
    $rootScope.location = null;

    vm.locationSlug = $cookies.get('locationSlug');
    if (vm.locationSlug) {
        $rootScope.$broadcast('$stateChangeSuccess');
        $state.go('locationDetails.index', {slug: vm.locationSlug});
    }

    vm.navigateTo = function(slug) {
        $cookies.put('locationSlug', slug);
        $state.go('locationDetails.index', {slug: slug});
    };
});
