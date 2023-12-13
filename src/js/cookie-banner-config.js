require('cookieconsent');

window.addEventListener('load', function(){
    window.cookieconsent.initialise({
        revokeBtn: '<div class="cc-revoke"></div>',
        type: "opt-in",
        position: "top",
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
            message: "This website uses cookies.",
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