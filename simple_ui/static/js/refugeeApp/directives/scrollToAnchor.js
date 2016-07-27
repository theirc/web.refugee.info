angular.module('refugeeApp').directive('scrollToAnchor', function($anchorScroll, $location) {
    return {
        restrict: 'A',
        link: function(scope, el) {
            el.bind("click", function(event){
                event.preventDefault();
                var href = angular.element(el).attr('href');
                $location.hash(href.substring(1));
                $anchorScroll();
            });
        }
    };
});
