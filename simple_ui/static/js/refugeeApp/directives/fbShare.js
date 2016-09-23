angular.module('refugeeApp').directive('fbShare', function () {
    return {
        restrict: 'E',
        scope:{
            href: '='
        },
        template: '<div id="fb-root"></div>\
        <div class="fb-share-button"\
            data-href="{$ href $}"\
            data-layout="button">'
    };
});
