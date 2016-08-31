angular.module('refugeeApp').directive('changeLocationButton', function () {
    return {
        restrict: 'E',
        scope: false,
        templateUrl: '/partials/directives/change-location-button.html'
    };
});
