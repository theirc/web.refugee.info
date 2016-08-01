angular.module('refugeeApp').controller('LocationChoiceController', function($scope, djangoRMI) {
    var vm = this;
    vm.data = [];
    vm.loaded = false;
    
    djangoRMI.location_json_view.get_regions({}).success(function(data) {
        vm.data = data;
        vm.loaded = true;
    });
});
