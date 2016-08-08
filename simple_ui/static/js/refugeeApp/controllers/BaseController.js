angular.module('refugeeApp').controller('BaseController', function($scope, $cookies) {
    var vm = this;
    vm.isDark = $cookies.get('theme') === 'dark';

    $scope.$watch(function() {
        return vm.isDark;
    }, function(newValue, oldValue) {
        if (newValue === oldValue) {
            return;
        }

        if (newValue) {
            $cookies.put('theme', 'dark');
        } else {
            $cookies.put('theme', 'light');
        }
    });

    vm.theme = function() {
        if (vm.isDark) {
            return 'dark';
        } else {
            return 'light';
        }
    };
});
