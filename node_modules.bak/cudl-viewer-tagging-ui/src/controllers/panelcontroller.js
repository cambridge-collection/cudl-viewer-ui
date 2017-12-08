import $ from 'jquery';

/** controllers */
import Controller from './common/controller';

var path = require('path');


export default class PanelController extends Controller {
    constructor(options) {
        super(options);
        this.panel = options.panel;
    }

    init() {
        this.setExportUrls();
        return this;
    }

    setExportUrls() {
        var $exportdoc_url = $(this.panel.tagexport.exportDoc.el).find('a');
        var url = $exportdoc_url.attr('href');
        $exportdoc_url.attr('href', url + this.metadata.getItemId());
    }

}
