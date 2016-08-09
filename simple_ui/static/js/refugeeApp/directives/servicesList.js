angular.module('refugeeApp').directive('servicesList', function() {
    return {
        restrict: 'E',
        templateUrl: '/partials/directives/services-list.html',
        scope: false
    };
});
