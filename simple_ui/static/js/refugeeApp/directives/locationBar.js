angular.module('refugeeApp').directive('locationBar', function () {
    return {
        restrict: 'E',
        scope: false,
        templateUrl: 'partials/directives/location-bar.html'
    };
});
