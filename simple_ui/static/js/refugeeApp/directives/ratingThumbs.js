angular.module('refugeeApp').directive('ratingThumbs', function (LocationService, $localStorage) {
    return {
        restrict: 'E',
        bindToController: true,
        scope: {
            index: '=',
            slug: '='
        },
        templateUrl: '/partials/directives/rating-thumbs.html',
        controller: function ($scope) {
            var vm = this;
            var location = $scope.$root.location;
            $scope.$storage = $localStorage;
            vm.thumbs_up = 0;
            vm.thumbs_down = 0;
            LocationService.getRating(location, vm.index, vm.slug).then(function (response) {
                vm.thumbs_up = response.data.thumbs_up;
                vm.thumbs_down = response.data.thumbs_down;
            });

            vm.rate = function (rating) {
                var ratingId = 'rating_' + location.slug + '_' + vm.slug ? vm.slug : vm.index;
                var result = $scope.$storage[ratingId];
                if (!result) {
                    LocationService.setRating($scope.$root.location, vm.index, vm.slug, rating).then(function (response) {
                        vm.thumbs_up = response.data.thumbs_up;
                        vm.thumbs_down = response.data.thumbs_down;
                    });
                    $scope.$storage[ratingId] = rating;
                }
                if (result && (result != rating)) {
                    LocationService.setRating(location, vm.index, vm.slug, rating).then(function () {
                        var removeRating = rating == 'up' ? 'down' : 'up';
                        LocationService.removeRating(location, vm.index, vm.slug, removeRating).then(function (response) {
                            vm.thumbs_up = response.data.thumbs_up;
                            vm.thumbs_down = response.data.thumbs_down;
                        });
                    });
                    $scope.$storage[ratingId] = rating;
                }
            };
        },
        controllerAs: 'ctrl'
    };
});
