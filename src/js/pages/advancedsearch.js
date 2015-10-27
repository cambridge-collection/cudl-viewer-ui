/**
 * This is the entry point for the advanced search pages.
 *
 * It extends the standard page with additional styles.
 */

import '../../css/advancedsearch.css';

import $ from 'jquery';
import debounce from 'lodash/function/debounce'

import '../base.js';


function changeHintDirection() {
    console.log('changeHintDirection()');
    // change hint direction
    if ($(window).width() > 767) {
        $('span.hint--bottom').addClass('hint--right')
                              .removeClass('hint--bottom');
    } else {
        $('span.hint--right').addClass('hint--bottom')
                             .removeClass('hint--right');
    }
}

$(document).ready(changeHintDirection);
$(window).resize(debounce(changeHintDirection, 50));
