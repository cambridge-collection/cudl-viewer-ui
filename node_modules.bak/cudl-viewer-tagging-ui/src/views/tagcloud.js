import $ from 'jquery';

import View from './common/view';


export default class TagCloud extends View {
    constructor(options) {
        super(options);
    }

    render() {

        $(this.of).append('<div class="panel panel-default cloud">'
                            + '<div class="panel-heading">'
                                + '<h3 class="panel-title">Keywords from text mining and user annotations</h3>'
                                + '<div class="status"></div>'
                            + '</div>'
                            + '<div class="panel-body">'
                                + '<button type="button" id="refreshCloud" title="Refresh keywords"><i class="fa fa-refresh fa-lg"></i></button>'
                                + '<div id="wordCloud"><label style="display:none;">No keywords are found</label></div>'
                            + '</div>'
                            + '<div class="panel-footer">'
                                + '<div>'
                                    + '<i class="fa fa-info-circle fa-lg"></i>'
                                    + '<h6>If you disagree with  any of these keywords, click on them to let us know.</h6>'
                                + '</div>'
                            + '</div>'
                        + '</div>');

        return this;
    }

    /**
     * element/component getter
     */

    get cloud() {
        return {
            el:      $('#wordCloud')[0],
            label:   $('#wordCloud label')[0],
            refresh: $('#refreshCloud')[0],
            status:  $('.cloud .status')[0],
            text:    'svg text'
        };
    }

}
