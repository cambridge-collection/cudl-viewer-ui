import $ from 'jquery';


export function toggleDiv (divid) {
    if (document.getElementById(divid).style.display == 'none') {
        document.getElementById(divid).style.display = 'block';
    } else {
        document.getElementById(divid).style.display = 'none';
    }
}

/* Fancybox setup */
$(document).ready(function() {

    try {
        $(".iframe").fancybox({
            'width' : '75%',
            'height' : '75%',
            'autoSize' : false,
            'transitionIn' : 'none',
            'transitionOut' : 'none',
            'type' : 'iframe',
            'title': null
        });

        $(".fancybox-inline").fancybox({
            'width' : '75%',
            'height' : '75%',
            'autoSize' : false,
            'transitionIn' : 'none',
            'transitionOut' : 'none'
        });
    } catch (exception) {
        /* ignore, fancybox not always present */
    }
});

export function setCookie(name, value, days) {
    let expires;

    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    }
    else expires = "";
    document.cookie = name + "=" + value + expires + "; path=/";
}

export function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while(c.charAt(0) == ' ') c = c.substring(1, c.length);
        if(c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

export function displayCookieNotice() {
    if(!cudl.getCookie("cudlcookies")) {
        document.getElementById("cookienotice").style.display = "inline";
    }
}

export function acceptCookies() {
    cudl.setCookie("cudlcookies", "true", 183);
    document.getElementById("cookienotice").style.display = "none";
    return false;
}
