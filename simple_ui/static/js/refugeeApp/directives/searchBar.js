angular.module('refugeeApp').directive('searchBar', function() {
    return {
        restrict: 'E',
        scope: false,
        templateUrl: 'partials/directives/search-bar.html',
        controller: function ($scope, $location) {
            $scope.setSelectedType = function () {
                var type = this.type.number;
                var index = $scope.ctrl.filterTypes.indexOf(type);
                if (index > -1) {
                    $scope.ctrl.filterTypes.splice(index, 1);
                } else {
                    $scope.ctrl.filterTypes.push(type);
                }
                $location.search('type', $scope.ctrl.filterTypes);
            };
            $scope.isChecked = function (id) {
                return $scope.ctrl.filterTypes.indexOf(id) !== -1;
            };
        }
    };
});
