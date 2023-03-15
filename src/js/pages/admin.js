// Bootstrap styles
// import '../../less/bootstrap/cudl-bootstrap.less';
import '../../css/style.css';

import $ from 'jquery';

import '../base.js';


$(document).on('click', '.confirm[data-confirmation]', (e) => {
    let el = $(e.currentTarget);
    let confirmation = el.data('confirmation') || 'Are you sure?';

    return confirm(confirmation);
});
