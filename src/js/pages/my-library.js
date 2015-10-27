import $ from 'jquery';

import '../../css/style.css';
import '../base.js';


function checkRemove() {
    return confirm(
        'Are you sure you want to remove this item from your bookmarks?');
}

$(document).on('click', '.bookmark-removelink', checkRemove);
