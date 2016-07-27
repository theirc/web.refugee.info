/**
 * Created by reyrodrigues on 5/3/16.
 */
(function ($) {
    $(function () {
        window.detectLocation = function () {
            navigator.geolocation.getCurrentPosition(function (position) {
                var latlng = [position.coords.latitude, position.coords.longitude];
                var url = window.apiUrl + (window.apiUrl.endsWith('/') ? '' : '/') + 'v1/region/closest/';

                $.ajax({
                    beforeSend: function (request) {
                        request.setRequestHeader("X-REQUESTED-LOCATION", latlng.join(','));
                    },
                    dataType: "json",
                    url: url,
                    success: function (data) {
                        if (data.length) {
                            location.href = '/' + data[0].slug + '/';
                        } else {
                            alert(window.messages.NO_LOCATION_FOUND);
                        }
                    }
                });

            }, function () {
                alert(window.messages.NO_LOCATION_FOUND);
            });

        };
    });
})(jQuery);