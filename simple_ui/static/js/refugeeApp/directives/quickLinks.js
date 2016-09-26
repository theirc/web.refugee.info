angular.module('refugeeApp').directive('quickLinks', function () {
    return {
        restrict: 'E',
        bindToController: true,
        scope: {
            location: '=',
            direction: '='
        },
        templateUrl: '/partials/directives/quick-links.html',
        controller: function(filterFilter){
            var vm = this;
            vm.filteredImportantInfo = filterFilter(vm.location.important_information, {hidden: false});
            vm.openImportantInfo = function (id) {
                if (vm.infoId == id){
                    vm.infoId = null;
                }
                else {
                    vm.infoId = id;
                }
            };
        },
        controllerAs: 'ctrl'
    };
});
