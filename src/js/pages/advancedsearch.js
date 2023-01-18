/**
 * This is the entry point for the advanced search pages.
 *
 * It extends the standard page with additional styles.
 */

// Bootstrap styles
// import '../../less/bootstrap/cudl-bootstrap.less';
import '../../css/advancedsearch.css';

import $ from 'jquery';
import debounce from 'lodash/debounce'
import defer from 'lodash/defer';
import 'bootstrap-slider';

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

function createVariableRecallSlider() {
    // Use bootstrap slider to create a slider bar
    $('#recall-slider-input').slider();
}

$(() => {
    $(window).resize(debounce(changeHintDirection, 50));
    changeHintDirection();

    // Initialisation needs to be deferred in dev mode as otherwise the CSS is
    // not in place when the width of the slider is calculated.
    defer(createVariableRecallSlider);
});
