import isString from 'lodash/isString';

import './google-analytics';
import { getPageContext } from './context';

let isSetup = false;

export function setupGa(gaFunc) {
    if(gaFunc === undefined) {
        gaFunc = window.ga;
    }

    if(document.readyState === 'loading') {
        throw new Error('setupGa() called while DOM is loading');
    }

    let trackingCode = getPageContext().gaTrackingId;

    if(!isString(trackingCode) || trackingCode.length === 0) {
        console.warn('No Google Analytics tracking code set in ' +
                     '\'gaTrackingId\' prop of page JSON');
    }
    else {
        gaFunc('create', trackingCode);
    }
}

/**
 * Call the ga() tracking function, ensuring it's been set up before making
 * the call.
 */
export function ga(...args) {
    if(!isSetup) {
        setupGa();
    }

    window.ga(...args);
}
