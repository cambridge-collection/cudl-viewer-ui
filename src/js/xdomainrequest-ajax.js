// FIXME: This is also used by the embedded viewer, factor out into shared lib.

import $ from 'jquery';
//import Modernizr from 'modernizr';


/**
 * A jQuery ajax transport method which uses IE 8/9's XDomainRequest to provide
 * CORS-like functionality on IE 8/9.
 */
export class XDomainRequestAjaxTransport {
    constructor(options, jqXHR) {
        this.options = options;
        this.jqXHR = jqXHR;
        this.xdr = new XDomainRequest();
        this.completeCallback = null;
    }

    onLoad() {
        this.completeCallback(
            200, "success", this.getResponses(), this.getResponseHeaders());
    }

    onError(message) {
        this.completeCallback(0, message, this.getResponses(),
                              this.getResponseHeaders());
    }

    getResponses() {
        return {text: this.xdr.responseText};
    }

    getResponseHeaders() {
        return `Content-Type: ${this.xdr.contentType}`;
    }

    send(headers, completeCallback) {
        this.completeCallback = completeCallback;

        this.xdr.onload = $.proxy(this.onLoad, this);
        this.xdr.onerror = $.proxy(this.onError, this, "error");
        this.xdr.ontimeout = $.proxy(this.onError, this, "timeout");
        // Workaround IE9 bug, see http://stackoverflow.com/questions/8058446/ie-xdomainrequest-not-always-work
        this.xdr.onprogress = () => {};

        this.xdr.open(this.options.type, this.options.url);
        this.xdr.send(this.options.data);
    }

    abort() {
        this.xdr.abort();
    }

    static canHandle(options) {
        // Handle cross origin requests if the browser does not support
        // CORS and XDomainRequest exists (e.g. IE 8 and 9)
        // || Modernizr.cors
        if(isSameOrigin(options.url) || !window.XDomainRequest) {
            return false;
        }

        // Also, XDomainRequest only supports get and post
        if(!(options.type === "GET" || options.type === "POST")) {
            return false;
        }

        // And it has to be async
        if(!options.async) {
            return false;
        }

        return true;
    }

    static handler(options, originalOptions, jqXHR) {
        if(XDomainRequestAjaxTransport.canHandle(options)) {
            return new XDomainRequestAjaxTransport(options, jqXHR);
        }
    }

    static registerTransport(jQuery) {
        jQuery = jQuery || $;
        // +* prepends our handler to the chain for the * (wildcard)
        // datatype.
        jQuery.ajaxTransport("+*", XDomainRequestAjaxTransport.handler);
    }
}

export function register() {
    // Add XDomainRequest support to jquery.ajax as an ajax transport method.
    XDomainRequestAjaxTransport.registerTransport();
}

function normaliseAnchorOriginFields(anchor) {
    // IE doesn't populate implicit fields of relative URLs
    if(anchor.protocol === ":" || !anchor.protocol) {
        anchor.protocol = window.location.protocol;
    }
    if(!anchor.hostname) {
        anchor.hostname = window.location.hostname;
    }
    if(!anchor.port) {
        anchor.port = window.location.port;
    }
}

function parseUrl(url) {
    if($.type(url) !== "string") {
        throw new Error("Invalid url: " + url);
    }

    var anchor = document.createElement("a");
    anchor.href = url;
    normaliseAnchorOriginFields(anchor);
    return anchor;
}

function origin(parsedUrl) {
    return parsedUrl.protocol + "//" + parsedUrl.hostname + ":" +
        parsedUrl.port;
}

/**
 * Check if url is the same origin as base. If not specified, base is
 * the current page's url.
 */
function isSameOrigin(url, base) {
    if(!base) {
        base = "" + window.location;
    }

    return origin(parseUrl(url)) === origin(parseUrl(base));
};
