angular.module('refugeeApp').directive('collapseOnAnchorScroll', function ($document, $stateParams, $location, $timeout, $uiViewScroll, $window, $compile) {
    var anchorInfo;
    return {
        restrict: 'A',
        scope: {
            name: '@',
            target: '@',
            item: '='
        },
        link: function (scope) {
            var openModal = function () {
                var $modal = $('#contentModal');
                if (scope.item.hide_from_toc) {
                    $modal.find('.modal-title').text(scope.item.title);
                    $modal.find('.modal-body').html($compile(scope.item.section)(scope));
                    $modal.modal('show');
                    $window.FB.XFBML.parse();
                } else {
                    $(scope.target).collapse('show');
                }
            };
            if (scope.item && $location.hash()) {
                if (scope.item.anchor_name === $location.hash()) {
                    openModal();
                }
                if ('info' + scope.item.index === $location.hash()) {
                    anchorInfo = scope.item;
                }
            }
            if (scope.$parent.$last) {
                $timeout(function () {
                    if (anchorInfo && $location.hash() && 'info' + anchorInfo.index === $location.hash()) {
                        var el = $('#info' + anchorInfo.index);
                        el.collapse('show');
                        $uiViewScroll(el);
                    }
                });
            }
            $($document[0].body).on('click', 'a[href="#' + scope.name + '"]', function () {
                openModal();
            });

            scope.$on('$stateChangeStart', function () {
                $('body').removeClass('modal-open');
                $('.modal-backdrop').remove();
            });
        }
    };
});
