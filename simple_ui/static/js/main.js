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

        $('body').on('shown.bs.collapse', function (e) {
            $('img', e.target).each(function (i, o) {
                $(o).attr('src', $(o).attr('data-src'));
            });
        });
    });


})(jQuery);

/**
 * jQuery Unveil
 * A very lightweight jQuery plugin to lazy load images
 * http://luis-almeida.github.com/unveil
 *
 * Licensed under the MIT license.
 * Copyright 2013 Luís Almeida
 * https://github.com/luis-almeida
 */

;(function ($) {

    $.fn.unveil = function (threshold, callback) {

        var $w = $(window),
            th = threshold || 0,
            retina = window.devicePixelRatio > 1,
            attrib = retina ? "data-src-retina" : "data-src",
            images = this,
            loaded;

        this.one("unveil", function () {
            var source = this.getAttribute(attrib);
            source = source || this.getAttribute("data-src");
            if (source) {
                this.setAttribute("src", source);
                if (typeof callback === "function") callback.call(this);
            }
        });

        function unveil() {
            var inview = images.filter(function () {
                var $e = $(this);
                if ($e.is(":hidden")) return;

                var wt = $w.scrollTop(),
                    wb = wt + $w.height(),
                    et = $e.offset().top,
                    eb = et + $e.height();

                return eb >= wt - th && et <= wb + th;
            });

            loaded = inview.trigger("unveil");
            images = images.not(loaded);
        }

        $w.on("scroll.unveil resize.unveil lookup.unveil", unveil);

        unveil();

        return this;

    };

})(window.jQuery || window.Zepto);
