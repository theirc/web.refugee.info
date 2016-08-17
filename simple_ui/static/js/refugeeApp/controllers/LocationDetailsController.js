angular.module('refugeeApp').controller('LocationDetailsController', function ($scope, $stateParams, $state, djangoRMI, location) {
    var vm = this;
    vm.data = {};
    vm.loaded = false;
    vm.slug = $stateParams.slug;
    vm.location = location;

    vm.openImportantInfo = function (id) {
        var section = $('#info-' + id);
        if (!section.hasClass("hidden")) {
            section.addClass("hidden");
        }
        else {
            $('.important-information-content-container').addClass('hidden');
            section.removeClass('hidden');
        }
    };
});
