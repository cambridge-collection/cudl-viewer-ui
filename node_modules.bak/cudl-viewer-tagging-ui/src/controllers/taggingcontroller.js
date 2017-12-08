import isObject from 'lodash/isObject';

import $ from 'jquery';

import { ValueError } from '../utils/exceptions';

/** views */
import PanelView from '../views/panel';
import ToolbarView from '../views/toolbar';
import DialogView from '../views/dialog';
import AnnotationListView from '../views/annotationlist';

/** controllers */
import Controller from './common/controller';
import PanelController from './panelcontroller';
import ToolbarController from './toolbarcontroller';
import DialogController from './dialogcontroller';
import OSDController from './osdcontroller';
import TagCloudController from './tagcloudcontroller';

/* models */
import { AnnotationListModel } from '../models/annotationlist';


export default class TaggingController extends Controller {
    /**
     * @param options.viewer An OpenSeadragon Viewer object.
     */
    constructor(options) {
        super(options);

        if(!isObject(options.viewer)) {
            throw new ValueError(
                `Expected an OpenSeadragon Viewer instance for options.viewer` +
                ` but got: ${JSON.stringify(options.viewer)}`);
        }

        this.ajax_c = options.ajax_c;
        this.viewer = options.viewer
        this.viewerModel = options.viewerModel;

        this.annotationList = new AnnotationListModel();
        this.annotationList.setItemId(this.viewerModel.getDocId());
        this.setPageNumber(this.viewerModel.getPageNumber());

        this.viewerModel.events.on('change:pageNumber', () => {
            this.setPageNumber(this.viewerModel.getPageNumber())
        });
        $(this.ajax_c).on('change:annotation', this.onAnnotationAjaxChange.bind(this));
    }

    onAnnotationAjaxChange() {
        this.annotationList.load();
    }

    init() {

        //
        // render views
        //

        var panel = new PanelView({
            el: $('#tagging')[0],
            annotationList: new AnnotationListView({
                annotationList: this.annotationList
            })
        }).render();

        var toolbar = new ToolbarView({
            of: this.viewer.element
        }).render();

        var dialog = new DialogView({
            of: this.viewer.element
        }).render();

        //
        // controllers
        //

        this.panel_c = new PanelController({
            metadata:   this.metadata,
            // page:        this.page,
            panel:      panel
        });

        this.tagcloud_c = new TagCloudController({
            metadata:   this.metadata,
            // page:        this.page,
            tagcloud:   panel.tagcloud,
            ajax_c:     this.ajax_c
        });

        this.dialog_c = new DialogController({
            metadata:   this.metadata,
            // page:        this.page,
            dialog:     dialog,
            ajax_c:     this.ajax_c,
            viewerModel: this.viewerModel
        });

        this.toolbar_c = new ToolbarController({
            metadata:   this.metadata,
            // page:        this.page,
            toolbar:    toolbar,
            ajax_c:     this.ajax_c,
            viewerModel: this.viewerModel
        });

        this.osd_c = new OSDController({
            metadata:   this.metadata,
            // page:        this.page,
            osd:        this.viewer
        });

        //
        // set controllers
        //

        this.dialog_c.setControllers(this.toolbar_c, this.osd_c);

        this.osd_c.setControllers(this.dialog_c, this.toolbar_c);

        this.toolbar_c.setControllers(this.dialog_c, this.osd_c);

        //
        // init controllers
        //

        this.panel_c.init();

        this.tagcloud_c.init();

        this.dialog_c.init();

        this.toolbar_c.init();

        this.osd_c.init();

        //
        // on page turn ensure markers are shown if toggle enabled.
        //

        this.showMarkersOnPageTurn({
            toolbar_c: this.toolbar_c
        });

        return this;
    }

    setPageNumber(pageNumber) {
        this.annotationList.setPage(pageNumber);
        this.annotationList.load();
    }

    startTagging() {
        // show tagging toolbar
        this.toolbar_c.openToolbar();
        // show wordcloud
        this.tagcloud_c.openCloud();
        // store the previous zoomPerClick value and prevent zooming with value 1.
        this.osd_c.osd.previousZoomPerClick=this.osd_c.osd.zoomPerClick;
        this.osd_c.osd.zoomPerClick=1;
    }

    endTagging() {
        // close toolbar
        this.toolbar_c.closeToolbar();
        // close dialog
        this.dialog_c.closeDialogs();
        // clear markers
        this.osd_c.clearMarkers();
        // remove wordcloud from dom
        this.tagcloud_c.closeCloud();
        // restore the zooming when clicking
        this.osd_c.osd.zoomPerClick=this.osd_c.osd.previousZoomPerClick;
        delete this.osd_c.osd.previousZoomPerClick;
    }

    /**
     * Ensure the toggle remains on if it is on when the page is turned.
     */
    showMarkersOnPageTurn(opts) {

        this.viewerModel.events.on('change:pageNumber', function () {
            // draw annotation markers if toggle is on
            if (opts.toolbar_c.toolbar.colorIndicator.shown) {
              opts.toolbar_c.drawMarkersAction();
            }
        });

    }

}
