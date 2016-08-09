angular.module('refugeeApp').directive('regionFlag', function() {
    return {
        restrict: 'E',
        scope: {
            region: '='
        },
        template: '<img class="region-flag" src="{$ imageSrc $}" />',

        controller: function ($scope, staticUrl) {
            $scope.imageSrc = staticUrl + 'images/flags/' + $scope.region.code.toLowerCase() + '.png';
        }
    };
});
