angular.module('refugeeApp').directive('collapseOnAnchorScroll', function ($document, $stateParams, $location, $timeout, $anchorScroll) {
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
                    $modal.find('.modal-body').html(scope.item.section);
                    $modal.modal('show');
                    if (angular.isDefined(FB) && FB !== null) {
                        FB.XFBML.parse();
                    }
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
                        $anchorScroll();
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
