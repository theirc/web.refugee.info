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
                if (scope.item) {
                    $modal.find('.modal-title').text(scope.item.title);
                    $modal.find('.modal-body').html($compile(scope.item.html)(scope));
                    $modal.modal('show');
                    if($window.FB) { // For AD Block fans
                        $window.FB.XFBML.parse();
                    }
                } else {
                    $(scope.target).collapse('show');
                }
            };
            if (scope.item && $location.hash()) {
                if (scope.item.slug === $location.hash()) {
                    if(scope.item.pop_up || !('pop_up' in scope.item)) {
                        openModal();
                    }
                    else {
                        anchorInfo = scope.item;
                    }
                }
                if (scope.item.slug === $location.hash()) {
                    anchorInfo = scope.item;
                }
            }
            if (scope.item) {
                if (scope.item.important && scope.item.pop_up && $location.path().indexOf('/info/' + scope.item.slug) !== -1) {
                    openModal();
                }
            }
            if (scope.$parent.$last) {
                $timeout(function () {
                    if (anchorInfo && $location.hash() && anchorInfo.slug === $location.hash()) {
                        var el = $('#' + anchorInfo.slug);
                        el.collapse('show');
                        $uiViewScroll(el);
                    }
                });
            }
            $($document[0].body).on('click', 'a[href="#' + scope.item.slug + '"]', function () {
                if(scope.item.pop_up || !('pop_up' in scope.item)) {
                    openModal();
                }
                else {
                        var el = $('#' + scope.item.slug);
                        if (el) {
                            el.collapse('show');
                            $uiViewScroll(el);
                        }
                }
            });

            scope.$on('$stateChangeStart', function () {
                $('body').removeClass('modal-open');
                $('.modal-backdrop').remove();
            });

            $('#contentModal').on('shown.bs.modal', function () {
                $(".modal-content").scrollTop(0);
            });
        }
    };
});
