import $ from 'jquery';

import { bootstrap as bootstrapProjectLight } from 'project-light/javascripts/custom';

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

export function patchProjectLight(projectlight) {
    if(projectlight === undefined)
        projectlight = require('project-light/javascripts/custom');

    // Override the default markExternalLinks which only considers cam.ac.uk
    // to be local. This screws everything up when running on say localhost.
    projectlight.markExternalLinks = markExternalLinksSensible;
}

export function loadProjectLight() {
    if(CUDL_PRODUCTION_BUILD) {
        bootstrapProjectLight();
    }
    else {
        loadProjectLightDev();
    }
}

function loadProjectLightDev() {
    // Start project light in the next tick to give CSS loaded in Blobs time to
    // apply. The PL CSS must be applied before PL runs, as it shows stuff
    // using $.show() which does nothing if the PL CSS has not made the target
    // invisible.

    let startTime = Date.now();

    let loadedLinks = $('head link[rel=stylesheet][href^="blob:"]')
        .toArray()
        .map(link => new Promise((resolve, reject) => {
            if(isLoaded(link))
                resolve(link);
            else {
                $(link).on('load', () => resolve(link))
                       .on('error', () => reject(link));
            }
        }));

    Promise.all(loadedLinks)
        .then(() => {
            let millis = Date.now() - startTime;
            console.info('All stylesheets loaded, starting projectlight ' +
                         ` (${millis}ms delay)`);
            bootstrapProjectLight();
        })
        .catch(link => {
            console.error('Unable to load projectlight: ' +
                          `stylesheet failed to load: ${link.href}`);
        });
}

function isLoaded(styleLink) {
    return [].slice.apply(window.document.styleSheets)
        .some((sh) => sh.href === styleLink.href);
}
window.isLoaded = isLoaded;
