angular.module('refugeeApp').controller('BaseController', function ($scope, $rootScope, $cookies, $templateCache, $state, LoadingOverlayService, $translate) {
    var vm = this;
    vm.isDark = $cookies.get('theme') === 'dark';
    vm.isCookiePolicyAccepted = $cookies.get('cookiePolicy');
    vm.language = $translate.proposedLanguage() || $translate.use();
    vm.isRTL = vm.language && vm.language !== 'en';

    $scope.$watch(function () {
        return vm.isDark;
    }, function (newValue, oldValue) {
        if (newValue === oldValue) {
            return;
        }

        if (newValue) {
            $cookies.put('theme', 'dark');
        } else {
            $cookies.put('theme', 'light');
        }
    });

    var deregisterStateChangeStartHandler = $rootScope.$on('$stateChangeStart', function () {
        LoadingOverlayService.start();
    });

    var deregisterStateChangeEndHandler = $rootScope.$on('$stateChangeSuccess', function () {
        LoadingOverlayService.stop();
    });

    $rootScope.$on('$destroy', function () {
        deregisterStateChangeStartHandler();
        deregisterStateChangeEndHandler();
    });

    vm.theme = function () {
        if (vm.isDark) {
            return 'dark';
        } else {
            return 'light';
        }
    };

    vm.direction = function () {
        if (vm.isRTL) {
            return 'rtl';
        } else {
            return 'ltr';
        }
    };

    vm.feedbackUrl = function () {
        switch (vm.language) {
        case 'ar':
            return 'https://docs.google.com/forms/d/16KxtpLbQbdj7ohkpAxws65aZuWfeQa8jjgCBvcptfkk/viewform?entry.1237329743=';
        case 'fa':
            return 'https://docs.google.com/forms/d/1Kn2L3mEEFAGgn1YrRpaA7bHNTrKXrw8-zp0w6xfz5o0/viewform?entry.1237329743=';
        default:
            return 'https://docs.google.com/forms/d/1gc-hN_p5pqC3DoPXxTfCAmlIiCEd1mOIdQMWeAz2n_U/viewform?entry.1237329743=';
        }
    };

    vm.changeLanguage = function (value) {
        vm.isRTL = !(value === 'en');
        vm.language = value;
        $translate.use(value);
        $templateCache.removeAll();
        $state.reload();
    };


    vm.acceptCookiePolicy = function () {
        var now = new Date();
        var exp = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
        vm.isCookiePolicyAccepted = true;
        $cookies.put('cookiePolicy', 'true', {'expires': exp});
    };

    vm.getThemeColor = function () {
        if (vm.isDark) {
            return '#181818';
        } else {
            return '#FFFFFF';
        }
    };

    vm.getDrawerIcon = function () {
        return '\uE5D2';
    };
});
