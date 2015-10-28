import $ from 'jquery';
import defer from 'lodash/function/defer';

const CAM_HOST = 'cam.ac.uk';

function markExternalLinksSensible() {
    let host = window.location.host;

    $('#content a').not(".campl-carousel a").filter((_, a) => {
        return isHttp(a.protocol) && !isLocalDomain(a.host);
    }).addClass("campl-external").attr({
        "title": $(this).attr("title") + " (Link to an external website)"
    });
}

function isHttp(proto) {
    return proto === 'http:' || proto === 'https:';
}

function isLocalDomain(host, localHost) {
    if(localHost === undefined) {
        localHost = window.location.host;
    }

    return localHost === host ||
           isDomainOrSubdomain(CAM_HOST, host);
}

function isDomainOrSubdomain(domain, other) {
    return other.endsWith(domain) &&
        other.charAt(other.length - domain.length - 1) === '.';
}

/**
 * @return a function which when invoked, schedules f to be called on the next
 *         tick of the event loop.
 */
function deferred(f) {
    return () => defer(f);
}

/**
 * The Project Light init code assumes the stylesheet is already loaded.
 * Because our stylesheets get applied in the same event loop tick that the
 * init loop gets called, the stylesheets aren't applied. To work around this
 * we defer the init functions to run on the next tick of the event loop,
 * allowing the stylesheets to be applied.
 */
function deferInitFunctions(projectlight) {
    // This is normally performed by init() but is required before our
    // deferred init is called.
    projectlight.$window = $(window);

    projectlight.init = deferred(projectlight.init);
    projectlight.initTables = deferred(projectlight.initTables);
    projectlight.localNav.init = deferred(projectlight.localNav.init);
    projectlight.markExternalLinks = deferred(projectlight.markExternalLinks);
}

export function patchProjectLight(projectlight) {
    if(projectlight === undefined)
        projectlight = require('project-light/javascripts/custom');

    // Override the default markExternalLinks which only considers cam.ac.uk
    // to be local. This screws everything up when running on say localhost.
    projectlight.markExternalLinks = markExternalLinksSensible;

    // TODO: Could disable this in production as CSS is loaded in separate tick
    deferInitFunctions(projectlight);
}
