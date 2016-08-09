angular.module('refugeeApp').controller('LocationChoiceController', function($rootScope, locationData) {
    var vm = this;
    vm.data = locationData;

    $rootScope.location = null;
});
