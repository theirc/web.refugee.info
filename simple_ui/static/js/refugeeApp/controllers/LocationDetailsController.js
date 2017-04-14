angular.module('refugeeApp').controller('LocationDetailsController', function ($scope, $stateParams, $state, djangoRMI, location, $location, $uiViewScroll) {
    var vm = this;
    vm.data = {};
    vm.loaded = false;
    vm.slug = $stateParams.slug;
    vm.infoSlug = $stateParams.infoSlug;
    vm.location = location;

    $scope.$on('$stateChangeStart', function (event, toState, toParams) {
        toParams.slug = vm.slug;
    });

    $scope.$on('$stateChangeSuccess', function (event, toState) {
        if (toState.name == 'locationDetails.info') {
            var path = $location.path().split('/');
            path[1] = vm.slug;
            var newPath = path.join('/');
            if ($location.path() != newPath) {
                $location.path(newPath).replace();
            }
            var el = angular.element('location-selected');
            if (el) {
                $uiViewScroll(el);
            }
        }
    });
});
