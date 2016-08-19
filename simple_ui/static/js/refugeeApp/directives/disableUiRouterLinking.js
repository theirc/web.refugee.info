angular.module('refugeeApp').directive('disableUiRouterLinking', function($document, $location, $anchorScroll) {
    return {
        restrict: 'A',
        link: function(scope, element) {
            element.on('click', 'a', function(event) {
                var url = $document[0].createElement('a');
                url.href = event.target.href || '';
                var hash = url.hash;
                if (hash.length > 0) {
                    event.preventDefault();
                    $location.hash(hash.substring(1));
                    $anchorScroll();
                }
            });
        }
    };
});
