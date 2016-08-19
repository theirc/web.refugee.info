angular.module('refugeeApp').directive('collapseOnAnchorScroll', function($document) {
    return {
        restrict: 'A',
        scope: {
            name: '@',
            target: '@'
        },
        link: function(scope) {
            $($document[0].body).on('click', 'a[href="#' + scope.name +'"]', function() {
                $(scope.target).collapse('show');
            });
        }
    };
});
