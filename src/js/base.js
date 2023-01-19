import './polyfill';

import $ from 'jquery';

import './dynamic-public-path';
import './configure-jquery-migrate';
//import { patchProjectLight, loadProjectLight } from './projectlight';
import { ga } from './analytics';
import { enableLightboxes } from './lightbox';
import { setup as setupQuickSearch } from './quicksearch';
import { displayCookieNotice } from './cudl';
import { resizeLogoColumn } from './footer';
import { registerCsrfPrefilter } from './ajax-csrf';
import { showSlides } from './mySlides-carousel'

function init() {
    // 3rd party libs included for their side-effects
    require('bootstrap');

    //patchProjectLight();

    $(() => {
        registerCsrfPrefilter();
        //loadProjectLight();

        ga('send', 'pageview');

        enableLightboxes();
        setupQuickSearch();
        displayCookieNotice();
        resizeLogoColumn();
        showSlides();
    });
}

init();
