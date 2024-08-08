require('cookieconsent');

window.addEventListener('load', function(){
    window.cookieconsent.initialise({
        revokeBtn: '<div class="cc-revoke"></div>',
        type: "opt-in",
        position: "bottom",
        theme: "classic",
        palette: {
            popup: {
                background: "#151515",
                text: "#fcfcfc"
            },
            button: {
                background: "#fcfcfc",
                text: "#151515"
            }
        },
        content: {
            message: "<div class=\"cookie-text-container\"><p class=\"cookie-head\">This website uses cookies.</p><p>Cookies are little files that we save on your device to remember your preferences. We use <b>necessary</b> cookies to make our site work. We use <b>site usage measurement</b> cookies to analyse anonymised usage patterns, to make our websites better for you.</p></div>",
            link: "Privacy Statement",
            href: "/help#cookies"
        },
        onInitialise: function(status) {
            if(status == cookieconsent.status.allow) site_cookies();
        },
        onStatusChange: function(status) {
            if (this.hasConsented()) site_cookies();
        }
    })
});

function site_cookies() {
    window.dataLayer = window.dataLayer || [];
    function gtag() {
        dataLayer.push(arguments);
    }
    gtag('js', new Date());
    gtag('config', process.env.GA4);
}
