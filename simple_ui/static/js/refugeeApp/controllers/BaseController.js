angular.module('refugeeApp').controller('BaseController', function($scope, $rootScope, $cookies, LoadingOverlayService) {
    var vm = this;
    vm.isDark = $cookies.get('theme') === 'dark';
    vm.isCookiePolicyAccepted = $cookies.get('cookiePolicy');

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

    var deregisterStateChangeStartHandler = $rootScope.$on('$stateChangeStart', function() {
        LoadingOverlayService.start();
    });

    var deregisterStateChangeEndHandler = $rootScope.$on('$stateChangeSuccess', function() {
        LoadingOverlayService.stop();
    });

    $rootScope.$on('$destroy', function() {
        deregisterStateChangeStartHandler();
        deregisterStateChangeEndHandler();
    });

    vm.theme = function() {
        if (vm.isDark) {
            return 'dark';
        } else {
            return 'light';
        }
    };

    vm.acceptCookiePolicy = function() {
        var now = new Date();
        var exp = new Date(now.getFullYear()+1, now.getMonth(), now.getDate());
        vm.isCookiePolicyAccepted = true;
        $cookies.put('cookiePolicy', 'true', {'expires': exp});
    };
});
