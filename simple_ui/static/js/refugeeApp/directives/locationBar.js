angular.module('refugeeApp').directive('locationBar', function () {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: '/partials/directives/location-bar.html',
        controller: function($scope, $state, $cookies) {
            $scope.changeLocation = function() {
                $cookies.remove('locationSlug');
                $state.go('location');
            };
        }
    };
});
