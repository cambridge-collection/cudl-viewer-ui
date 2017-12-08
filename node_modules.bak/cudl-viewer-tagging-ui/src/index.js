// Imported for side-effects:
import '../styles/tagging.less';
import 'babel-polyfill';

import $ from 'jquery';

import { getPageContext } from 'cudl-viewer-ui/src/js/context';

/** controllers */
import RestClientAgent from './controllers/restclientagent';
import TaggingController from './controllers/taggingcontroller';

/** models */
import Metadata from './models/metadata';


export function setupTaggingTab(options) {
    let {docId, viewer, viewerModel} = options;

    let context = getPageContext();

    if (!viewerModel.isTaggingEnabled()) {
        console.log('Tagging is disabled');
        // remove tagging tab and panel
        $('#taggingtab').parent().remove();
        $('#tagging').remove();
        return false;
    }

    var metadata = new Metadata(viewerModel.getMetadata(), docId);

    var ajax_c = new RestClientAgent();

    var tagging_c = new TaggingController({
        metadata: metadata,
        // page: page,
        ajax_c: ajax_c,
        viewer: viewer,
        viewerModel: viewerModel
    }).init();

    //
    // bootstrap tab event handlers
    //
    $('#taggingtab').on('show.bs.tab', e => {
        // check authentication
        if(!context.isUser) {
            // prevent tab panel from showing before
            // redirecting user to login page
            e.preventDefault();
            e.stopPropagation();

            // Redirect to login page, redirecting back after login
            window.location.href = '/auth/login?next=' +
                    encodeURIComponent(window.location.pathname + '#tagging');

        } else {
            // start tagging
            tagging_c.startTagging();
        }
    });

    $('#taggingtab').on('hide.bs.tab', function(e) {
        // end tagging
        tagging_c.endTagging();
    });

}

//
// this tagging library assumes the presence of cudl, cudl.viewer and cudl.pagnum
//
// user attribute is passed from session to js variable 'global_user' in document.jsp page, which is
// used to check if user has been authenticated. this is just a temporary solution. in practice, should
// use cookie - server sends a small piece of cookie indicating user authentication status back to
// client broser. the cookie should have the same expiry date.
//
