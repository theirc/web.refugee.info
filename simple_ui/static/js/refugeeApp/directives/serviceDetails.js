angular.module('refugeeApp').directive('serviceDetails', function () {
    return {
        restrict: 'E',
        templateUrl: 'partials/directives/service-details.html',
        bindToController: true,
        scope: {
            service: '='
        },
        controller: function ($window, $location) {
            var vm = this;
            vm.days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            vm.open = [];
            vm.close = [];
            vm.serviceUrl = $location.absUrl();

            vm.getDirections = function () {
                $window.open('https://maps.google.com?daddr=' + vm.service.address, '_blank');
            };

            vm.showOpeningHours = function () {
                for (var i = 0; i <= vm.days.length; i++) {
                    if (vm.service[vm.days[i] + '_open']) {
                        vm.open[i] = vm.service[vm.days[i] + '_open'].slice(0, -3);
                    }
                    if (vm.service[vm.days[i] + '_open']) {
                        vm.close[i] = vm.service[vm.days[i] + '_close'].slice(0, -3);
                    }
                }
                if (vm.open.length || vm.close.length ) {
                    return true;
                }
            };

            /*
            *   In case if url does not have protocol provided url would be concatenated with refugee.info url
            */
            vm.openUrl = function(url) {
                let fixedUrl = '';
                if (url.indexOf('http://') !== -1 || url.indexOf('https://') !== -1) {
                    fixedUrl = url;
                }
                else {
                    fixedUrl = `http:\/\/${url}`;
                }
                let newTab = $window.open(fixedUrl, '_blank');
                newTab.focus();
            };
        },
        controllerAs: 'ctrl'
    };
});
