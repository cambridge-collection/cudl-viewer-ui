import $ from 'jquery';

import View from './common/view';


export default class TagExport extends View {
    constructor(options) {
        super(Object.assign({}, {
            className: 'panel panel-default tagexport'
        }, options));
    }

    render() {
        $(this.el).append(`
            <div class="panel-heading">
                <h3 class="panel-title">Export contributions</h3>
            </div>
            <div class="panel-body">
                <div class="button" id="tagExportAll">
                    <a class="btn btn-info left" href="/crowdsourcing/export/">
                        <i class="fa fa-download fa-2x pull-left"></i> Export All <br> Contributions
                    </a>
                </div>
                <div class="btn-tip"><p>Export all my contributions in RDF/XML format</p></div>
                <div class="button" id="tagExport">
                    <a class="btn btn-info left" href="/crowdsourcing/export/">
                        <i class="fa fa-download fa-2x pull-left"></i> Export Document <br> Contributions
                    </a>
                </div>
                <div class="btn-tip"><p>Export the contributions for just the current document in RDF/XML format</p></div>
            </div>
        `);

        return this;
    }

    /**
     * element/component getter
     */

    get exportDoc() {
        return {
            el: $(this.el).find('#tagExport')[0]
        };
    }

}
