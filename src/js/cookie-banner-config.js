require('cookieconsent');

window.addEventListener('load', function(){
    window.cookieconsent.initialise({
        revokeBtn: '<div class="cc-revoke"></div>',
        type: "opt-in",
        position: "top",
        theme: "classic",
        palette: {
            popup: {
                background: "#ccc",
                text: "#444"
            },
            button: {
                background: "#8c6",
                text: "#fff"
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