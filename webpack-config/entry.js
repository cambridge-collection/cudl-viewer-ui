import { Config } from 'cudl-webpack-config/lib/config';

import { rootPath, resolver } from './paths';


let p = resolver(rootPath('./src/js/pages/'));

export default new Config().merge({
    entry: {
        'page-standard': p('./standard.js'),
        'page-document': p('./document.js'),
        'page-advancedsearch': p('./advancedsearch.js'),
        'page-transcription': p('./transcription.js'),
        'page-login': p('./login.js'),
        'page-collection-organisation': p('./collection-organisation.js'),
        'page-my-library': p('./my-library.js'),
        'page-advanced-search-results': p('./advanced-search-results.js'),
        'page-error-500': p('./error-500.js'),
        'page-admin': p('./admin.js'),
        'page-feedback': p('./embedded/feedback.js'),
        'page-admin-file-browse': p('./embedded/admin-file-browse.js')
    }
});
