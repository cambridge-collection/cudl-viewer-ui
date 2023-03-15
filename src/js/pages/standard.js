/**
 * This is the entry point for standard pages with no custom javascript or
 * css. For example, the about, news and help pages.
 */

import $ from 'jquery';

// Bootstrap styles
// import '../../less/bootstrap/cudl-bootstrap.less';

// Use the normal CUDL style
import '../../css/style.css';
import '../base.js';
import { possiblyEnableEditing } from '../admin/edit';


$(function() {
    possiblyEnableEditing();
});
