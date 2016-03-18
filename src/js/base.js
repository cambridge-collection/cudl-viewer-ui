import './polyfill';

import $ from 'jquery';

import './dynamic-public-path';
import './configure-jquery-migrate';
import { patchProjectLight, loadProjectLight } from './projectlight';
import ga from './google-analytics';
import { setupGa } from './analytics';
import { enableLightboxes } from './lightbox';
import { setup as setupQuickSearch } from './quicksearch';
import { displayCookieNotice } from './cudl';


function init() {
    // 3rd party libs included for their side-effects
    require('bootstrap');

    patchProjectLight();

    $(() => {
        loadProjectLight();

        setupGa();
        ga('send', 'pageview');

        enableLightboxes();
        setupQuickSearch();
        displayCookieNotice();
    });
}

init();
