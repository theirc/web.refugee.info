angular.module('refugeeApp').directive('locationButtons', function () {
    return {
        restrict: 'E',
        scope: {
            slug: '='
        },
        templateUrl: 'partials/directives/location-buttons.html',
        controller: function($scope, $state) {
            let vm = this;
            vm.goToHome = () => {
                if ($scope.slug) {
                    $state.go('locationDetails.index', {slug: $scope.slug});
                }
                else {
                    $state.go('location');
                }
            };

            vm.goToServices = () => {
                if ($scope.slug) {
                    $state.go('locationDetails.services', {slug: $scope.slug, mapView: false});
                }
                else {
                    $state.go('location');
                }
            };

            vm.checkActiveState = (checkState) => {
                return $state.includes(checkState);
            };
        },
        controllerAs: 'ctrl'
    };
});
