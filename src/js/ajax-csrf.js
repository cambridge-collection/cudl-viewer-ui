
import $ from 'jquery';
import assign from 'lodash/assign';
import { ValueError } from './exceptions';

import {getPageContext} from './context';

/**
 * Register a jQuery AJAX prefilter which adds the CSRF token in the page
 * context to non-get requests to the local domain.
 */
export function registerCsrfPrefilter(jQuery = $) {
    let context = getPageContext();

    let token = context.csrf && context.csrf.token;
    let headerName = context.csrf && context.csrf.header;

    if(!token)
        throw new ValueError('csrf.token missing from context');
    if(!headerName)
        throw new ValueError('csrf.header missing from context');

    jQuery.ajaxPrefilter(createCsrfAjaxPrefilter(token, headerName));
}

function createCsrfAjaxPrefilter(csrfToken, csrfHeaderName) {
    return function csrfPrefilter(options, origionalOptions, jqXHR) {

        if(!options.crossDomain &&
           !['GET', 'OPTIONS'].includes(options.type)) {

            options.headers = assign({}, options.headers, {
                [csrfHeaderName]: csrfToken
            });
        }
    };
}
