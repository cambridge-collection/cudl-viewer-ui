// Disable jquery-migrate warnings in production build
if(CUDL_PRODUCTION_BUILD) {
    let $ = require('jquery');
    $.migrateMute = true;
}
