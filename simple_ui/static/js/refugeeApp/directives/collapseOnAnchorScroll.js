angular.module('refugeeApp').directive('collapseOnAnchorScroll', function ($document, $stateParams, $location) {
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
                } else {
                    $(scope.target).collapse('show');
                }
            };
            if (scope.item && $location.hash() && scope.item.anchor_name === $location.hash()) {
                openModal();
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
