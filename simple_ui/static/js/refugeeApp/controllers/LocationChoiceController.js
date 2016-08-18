angular.module('refugeeApp').controller('LocationChoiceController', function($rootScope, $state, $cookies, locationData, countriesJson) {
    var vm = this;
    vm.countries = countriesJson;
    vm.data = locationData;
    vm.data.regions = vm.data.regions.filter(function (region) {
        return (region.children.length > 0 || !region.hidden);
    });
    $rootScope.location = null;

    vm.navigateTo = function(slug) {
        $cookies.put('locationSlug', slug);
        $state.go('locationDetails.index', {slug: slug});
    };
});
