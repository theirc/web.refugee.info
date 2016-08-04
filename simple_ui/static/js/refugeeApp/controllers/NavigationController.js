angular.module('refugeeApp').controller('NavigationController', function ($state, $scope, $cookies, $templateCache) {
    var vm = this;
    vm.changeLanguage = function (value) {
        $cookies.put('django_language', value);
        $templateCache.removeAll();
        $state.reload();
    };
});
