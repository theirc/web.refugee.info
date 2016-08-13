angular.module('refugeeApp').directive('regionChoice', function($state) {
    return {
        restrict: 'E',
        scope: {
            region: '='
        },
        templateUrl: '/partials/directives/region-choice.html',
        link: function(scope) {
            scope.navigateToDetails = function(region) {
                $state.go('locationDetails.index', {slug: region.slug});
            };
        }
    };
});
