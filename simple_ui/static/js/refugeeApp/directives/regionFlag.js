angular.module('refugeeApp').directive('regionFlag', function() {
    return {
        restrict: 'E',
        scope: {
            region: '='
        },
        template: '<img class="region-flag" src="{$ staticUrl $}images/flags/{$ region.code $}.png" />',

        controller: function ($scope, staticUrl) {
            $scope.staticUrl = staticUrl;
        }
    };
});
