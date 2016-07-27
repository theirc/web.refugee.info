angular.module('refugeeApp').directive('regionName', function() {
    return {
        restrict: 'E',
        scope: {
            region: '='
        },
        template: '{$ region.title || region.metadata.page_title || region.name || "" $}'
    };
});
