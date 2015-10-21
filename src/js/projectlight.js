import $ from 'jquery';

const CAM_HOST = 'cam.ac.uk';


function markExternalLinksSensible() {
    let host = window.location.host;

    $('#content a').not(".campl-carousel a").filter((_, a) => {
        return !isLocalDomain(a.host);
    }).addClass("campl-external").attr({
        "title": $(this).attr("title") + " (Link to an external website)"
    });
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
