import $ from 'jquery';

import View from './common/view';
import TagCloudView from './tagcloud';
import TagExportView from './tagexport';
import AnnotationListView from './annotationlist';


export default class Panel extends View {
    constructor(options) {
        super(options);

        if(!options.annotationList instanceof View)
            throw new ValueError(`options.annotationList is not a View ` +
                                 `instance: ${options.annotationList}`);

        this.tagexport = new TagExportView();
        this.annotationList = options.annotationList;
    }

    render() {

        this.tagcloud = new TagCloudView({
            of: $(this.el)[0]
        }).render();

        this.annotationList.render();
        $(this.el).append(this.annotationList.el);

        this.tagexport.render();
        $(this.el).append(this.tagexport.el);

        return this;
    }
}
