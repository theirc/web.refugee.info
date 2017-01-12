angular.module('refugeeApp').controller('BaseController', function ($scope, $rootScope, $cookies, $templateCache,
                                                                    $state, LoadingOverlayService, $translate, $window,
                                                                    $location, isAlkhadamat) {
    var vm = this;
    vm.isCookiePolicyAccepted = $cookies.get('cookiePolicy');
    vm.language = $location.search().language || $translate.proposedLanguage() || $translate.use();
    vm.isRTL = vm.language && (vm.language == 'ar' || vm.language == 'fa');
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
        return 'light';
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
        vm.isRTL = !!(value == 'ar' || value == 'fa');
        vm.language = value;
        $translate.use(value);
        addLanguageToUrl(value);
        refreshSiteName();
        if ($state.current.name != 'location') {
            $templateCache.removeAll();
            $state.reload();
        }
    };

    vm.acceptCookiePolicy = function () {
        var now = new Date();
        var exp = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
        vm.isCookiePolicyAccepted = true;
        $cookies.put('cookiePolicy', 'true', {'expires': exp});
    };

    vm.getThemeColor = function () {
        return '#FFFFFF';
    };

    vm.getDrawerIcon = function () {
        return '\uE5D2';
    };

    vm.changeLocation = function () {
        $cookies.remove('locationSlug');
        $state.go('location');
    };

    vm.navigationRedirect = function () {
        var slug = $rootScope.location ? $rootScope.location.slug : null;
        if (slug) {
            $state.go('locationDetails.index', {slug: slug});
        }
        else {
            $state.go('location', {}, {reload: true});
        }
    };

    $scope.$on('$stateChangeSuccess', function () {
        refreshFacebookSdk();
        addLanguageToUrl(vm.language);
    });

    $scope.$on('$stateChangeStart', function () {
        if ($location.search().language != $translate.proposedLanguage()) {
            $translate.use($location.search().language);
        }
    });

    var addLanguageToUrl = function (language) {
        if (language != 'en') {
            $location.search('language', language);
        }
        else {
            $location.search('language', null);
        }
    };

    var refreshFacebookSdk = function () {
        $window.FB = null;
        (function (d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            var lang;
            switch (vm.language) {
            case 'ar':
                lang = 'ar_AR';
                break;
            case 'fa':
                lang = 'fa_IR';
                break;
            default:
                lang = 'en_US';
            }
            js = d.createElement(s);
            js.id = id;
            js.src = "//connect.facebook.net/" + lang + "/sdk.js#xfbml=1&version=v2.7";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
    };

    var refreshSiteName = function () {
        vm.getTranslatedSiteName().then(function (data) {
            $rootScope.translatedSiteName = data;
        });
    };

    vm.isAlkhadamat = function () {
        return isAlkhadamat == 'True';
    };

    vm.getTranslatedSiteName = function () {
        if (vm.isAlkhadamat()){
            return $translate('ALKHADAMAT_INFO').then(function (anotherOne) {
                return anotherOne;
            });
        } else {
            return $translate('REFUGEE_INFO').then(function (anotherOne) {
                return anotherOne;
            });
        }
    };


});
