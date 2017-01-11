angular.module('refugeeApp').directive('ratingThumbs', function (LocationService, $localStorage, $location) {
    return {
        restrict: 'E',
        bindToController: true,
        scope: {
            item: '='
        },
        templateUrl: 'partials/directives/rating-thumbs.html',
        controller: function ($scope) {
            var vm = this;
            $scope.$storage = $localStorage;
            this.$onInit = function() {
                var pageSlug;
                if (vm.item) {
                    pageSlug = vm.item.slug;
                    vm.thumbs_up = vm.item.thumbs_up;
                    vm.thumbs_down = vm.item.thumbs_down;
                } else {
                    pageSlug = $location.hash();
                    LocationService.getRating(pageSlug).then(function (response) {
                        vm.thumbs_up = response.data.thumbs_up;
                        vm.thumbs_down = response.data.thumbs_down;
                    });
                }
                var ratingId = 'rating_' + pageSlug;

                var r = $scope.$storage[ratingId];
                if (r && 'rate' in r) {
                    vm.rating = r['rate'];
                }

                vm.rate = function (rating) {
                    var result = $scope.$storage[ratingId];
                    vm.rating = rating;
                    if (!result) {
                        LocationService.setRating(pageSlug, rating).then(function (response) {
                            vm.thumbs_up = response.data.thumbs_up;
                            vm.thumbs_down = response.data.thumbs_down;
                            $scope.$storage[ratingId] = {
                                'rating_id': response.data.rating_id,
                                'rate': rating
                            };
                        });
                    }
                    if (result && (result['rate'] != rating)) {
                        LocationService.setRating(pageSlug, rating, result['rating_id']).then(function (response) {
                            vm.thumbs_up = response.data.thumbs_up;
                            vm.thumbs_down = response.data.thumbs_down;
                            $scope.$storage[ratingId] = {
                                'rating_id': response.data.rating_id,
                                'rate': rating
                            };
                        });
                    }
                };
            };
        },
        controllerAs: 'ctrl'
    };
});
