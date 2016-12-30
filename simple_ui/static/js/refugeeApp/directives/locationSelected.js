angular.module('refugeeApp').directive('locationSelected', function () {
    return {
        restrict: 'E',
        scope: false,
        templateUrl: 'partials/directives/location-selected.html'
    };
});
