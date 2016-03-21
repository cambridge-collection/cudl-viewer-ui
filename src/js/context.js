/**
 * JSP templates pass data to the UI javascript via a JSON object stored in
 * the body element's data-context attribute. This module provides access to
 * that context data via getPageContext().
 */

import $ from 'jquery';
import isObject from 'lodash/isObject';


/**
 * Get the current page's context data.
 *
 * @return An Object containing the context data (possibly empty but always an
 *         object).
 */
export function getPageContext() {
    let context = $(document.body).data('context') || {};

    if(!isObject(context))
        throw new Error(
            `Invalid context data: expected an object but found: ${context}`);

    return context;
}
