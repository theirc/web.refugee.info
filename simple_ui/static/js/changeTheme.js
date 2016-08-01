$('document').ready(function () {
    var theme = getCookie('theme');
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

function getCookie(name) {
  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length == 2) return parts.pop().split(";").shift();
}
