angular.module('refugeeApp').factory('LoadingOverlayService', function () {
    return {
        start: function() {
            $.isLoading({ text: 'Loading...' });
        },
        stop: function() {
            $.isLoading('hide');
        }
    };
});