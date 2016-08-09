angular.module('refugeeApp').controller('NavigationController', function ($state, $cookies, $templateCache) {
    var vm = this;
    vm.changeLanguage = function (value) {
        $cookies.put('django_language', value);
        $templateCache.removeAll();
        $state.reload();
    };
});
