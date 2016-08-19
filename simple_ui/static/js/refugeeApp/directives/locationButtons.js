angular.module('refugeeApp').directive('locationButtons', function () {
    return {
        restrict: 'E',
        scope: false,
        templateUrl: '/partials/directives/location-buttons.html'
    };
});
