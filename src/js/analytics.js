import isString from 'lodash/lang/isString';

import ga from './google-analytics';
import { getPageContext } from './context';

export function setupGa(gaFunc) {
    if(gaFunc === undefined) {
        gaFunc = ga;
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
