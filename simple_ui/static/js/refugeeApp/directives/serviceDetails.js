angular.module('refugeeApp').directive('serviceDetails', function () {
    return {
        restrict: 'E',
        templateUrl: 'partials/directives/service-details.html',
        bindToController: true,
        scope: {
            service: '=',
            location: '='
        },
        controller: function ($window, $location) {
            var vm = this;
            vm.days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            vm.close = [];
            vm.serviceUrl = $location.absUrl();

            vm.getDirections = function () {
                $window.open('https://maps.google.com?daddr=' + vm.service.address, '_blank');
            };

            vm.showOpeningHours = () => {
                vm.opening_time = vm.service.opening_time;
                let changed = false;
                if (vm.opening_time && vm.opening_time['24/7']) {
                    return true;
                }
                else if (vm.opening_time) {
                    for (let day in vm.days) {
                        for (let shift in vm.opening_time[vm.days[day]]) {
                            let o = vm.opening_time[vm.days[day]][shift]['open'];
                            let c = vm.opening_time[vm.days[day]][shift]['close'];
                            if (o && c) {
                                /* Changing from 24 hour format to 12 hour. */
                                if (o.substring(o.length - 1) != 'm') {
                                    /* global moment */
                                    /* eslint no-undef: "error" */
                                    vm.opening_time[vm.days[day]][shift]['open'] = moment(o, 'HH:mm:ss').format('hh:mma');
                                }
                                if (c.substring(c.length - 1) != 'm') {
                                    vm.opening_time[vm.days[day]][shift]['close'] = moment(c, 'HH:mm:ss').format('hh:mma');
                                }
                                changed = true;
                            }
                        }
                    }
                    return changed;
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
