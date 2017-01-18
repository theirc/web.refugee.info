angular.module('refugeeApp').directive('printPage', function (LocationService, $localStorage, $window) {
    return {
        restrict: 'E',
        scope: {
            item: '='
        },
        templateUrl: 'partials/directives/print-page.html',
        controller: function () {
            var vm = this;
            this.$onInit = function() {
                vm.printPage = function() {
                    $window.print();
                };
            };
        },
        controllerAs: 'ctrl'
    };
});
