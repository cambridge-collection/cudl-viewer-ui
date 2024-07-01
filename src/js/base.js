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
import { showSlides } from './mySlides-carousel';
import { setupDropdownMenu } from "./dropdownMenu";
import 'bootstrap';

function init() {

    $(() => {
//    //     enableLightboxes();
         setupQuickSearch();
         displayCookieNotice();
//         resizeLogoColumn();
         showSlides();
         setupDropdownMenu();
     });
 }

init();
