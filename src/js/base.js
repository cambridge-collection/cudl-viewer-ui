//import './polyfill.js.old';
import './cookie-banner-config';
import $ from 'jquery';
window.jQuery = $; // this is needed for paginationjs lib

import './dynamic-public-path';
import './configure-jquery-migrate';

// import { enableLightboxes } from './lightbox';
import { setup as setupQuickSearch } from './quicksearch';
import { displayCookieNotice } from './cudl';
// import { resizeLogoColumn } from './footer';
import { registerCsrfPrefilter } from './ajax-csrf';
import { showSlides } from './mySlides-carousel';
import { setupDropdownMenu } from "./dropdownMenu";

function init() {

    $(() => {
        registerCsrfPrefilter();

//    //     enableLightboxes();
         setupQuickSearch();
         displayCookieNotice();
//         resizeLogoColumn();
         showSlides();
         setupDropdownMenu();
     });
 }

init();
