angular.module('refugeeApp').directive('locationSelected', function () {
    return {
        restrict: 'E',
        scope: {
            region: '='
        },
        templateUrl: '/partials/directives/location-selected.html'
    };
});
