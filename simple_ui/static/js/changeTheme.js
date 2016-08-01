$('document').ready(function () {
    if (theme == 'light') {
        $('#theme-checkbox').prop('checked', false);
    }
    else {
        $('#theme-checkbox').prop('checked', true);
    }
    $('#theme-checkbox').on('change', function () {
        if (this.checked) {
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