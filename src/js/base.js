import './polyfill';

import $ from 'jquery';

import './dynamic-public-path';
import './configure-jquery-migrate';
import { patchProjectLight } from './projectlight';
import ga from './google-analytics';
import { setupGa } from './analytics';
import { enableLightboxes } from './lightbox';
import { setup as setupQuickSearch } from './quicksearch';


function init() {
    // 3rd party libs included for their side-effects
    require('project-light/javascripts/custom.js');
    require('bootstrap');

    patchProjectLight();

    $(() => {
        setupGa();
        ga('send', 'pageview');

        enableLightboxes();
        setupQuickSearch();
    });
}

init();
