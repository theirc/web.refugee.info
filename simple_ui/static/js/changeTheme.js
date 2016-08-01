$('document').ready(function () {
    var $body = $('body');
    if (theme == 'light') {
        $body.addClass('light-theme');
        $('#theme-checkbox').prop('checked', false);
    }
    else {
        $body.addClass('dark-theme');
        $('#theme-checkbox').prop('checked', true);
    }
    $('#theme-checkbox').on('change', function () {
        if (this.checked) {
            $body.removeClass('light-theme');
            $body.addClass('dark-theme');
            document.cookie = "theme=dark";
            $('.theme').each(function () {
                if (this.href) {
                    var lnk = this.href;
                    this.href = lnk.replace("light", "dark");
                }
                if (this.src) {
                    var src = this.src;
                    this.src = src.replace("light", "dark");
                }
            });
        }
        else {
            $body.removeClass('dark-theme');
            $body.addClass('light-theme');
            document.cookie = "theme=light";
            $('.theme').each(function () {
                if (this.href) {
                    var lnk = this.href;
                    this.href = lnk.replace("dark", "light");
                }
                if (this.src) {
                    var src = this.src;
                    this.src = src.replace("dark", "light");
                }
            });
        }
    });
});