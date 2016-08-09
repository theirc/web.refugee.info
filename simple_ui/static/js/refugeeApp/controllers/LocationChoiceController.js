angular.module('refugeeApp').controller('LocationChoiceController', function($rootScope, djangoRMI) {
    var vm = this;
    vm.data = [];
    vm.loaded = false;

    $rootScope.location = null;
    
    djangoRMI.location_json_view.get_regions({}).success(function(data) {
        vm.data = data;
        vm.loaded = true;
    });
});
