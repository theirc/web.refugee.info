angular.module('refugeeApp').directive('regionChoice', function($state, $cookies) {
    return {
        restrict: 'E',
        scope: {
            region: '=',
            direction: '@'
        },
        templateUrl: 'partials/directives/region-choice.html',
        link: function(scope) {
            scope.navigateToDetails = function(region) {
                $cookies.put('locationSlug', region.slug);
                $state.go('locationDetails.index', {slug: region.slug});
            };
        }
    };
});
