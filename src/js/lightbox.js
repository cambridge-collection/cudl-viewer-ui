import 'fancybox/source/jquery.fancybox.css';

import $ from 'jquery';
import 'fancybox/source/jquery.fancybox.js';


export function enableLightboxes() {
    $(".iframe").fancybox({
        'width' : '75%',
        'height' : '75%',
        'autoSize' : false,
        'transitionIn' : 'none',
        'transitionOut' : 'none',
        'type' : 'iframe',
        'title': null
    });

    $(".fancybox-inline").fancybox({
        'width' : '75%',
        'height' : '75%',
        'autoSize' : false,
        'transitionIn' : 'none',
        'transitionOut' : 'none'
    });
}
