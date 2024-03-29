import EventEmitter from 'events';

import $ from 'jquery';

// A message bus for global CUDL events
export const msgBus = new EventEmitter();

export function toggleDiv (divid) {
    if (document.getElementById(divid).style.display == 'none') {
        document.getElementById(divid).style.display = 'block';
    } else {
        document.getElementById(divid).style.display = 'none';
    }
}

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
    if(getCookie('cudlcookies')) {
        return;
    }

    $('.cookienotice')
        .show()
        .on('click', 'button', () => {
            acceptCookies();
            return false;
        })
        .on('click', 'a', () => {
            acceptCookies();
            // Continue to follow the link
            return true;
        })
}

export function acceptCookies() {
    setCookie("cudlcookies", "true", 183);
    $('.cookienotice').hide();
}
