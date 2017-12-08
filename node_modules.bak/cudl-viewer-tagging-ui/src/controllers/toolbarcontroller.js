import $ from 'jquery';

/** controllers */
import Controller from './common/controller';

/** models */
import Annotation from '../models/annotation';

/** constants */
import { TTARGETS } from '../models/consts';
import { TOOLBAR } from '../models/consts';


export default class ToolbarController extends Controller {
    constructor(options) {
        super(options);
        this.toolbar = options.toolbar;
        this.ajax_c  = options.ajax_c;
        this.viewerModel = options.viewerModel;

        // constants
        this.TOOLBAR  = TOOLBAR;
        this.TTARGETS = TTARGETS;
    }

    setControllers(dialog_c, osd_c) {
        this.dialog_c = dialog_c;
        this.osd_c    = osd_c;
    }

    init() {
        this.addEventHandlers();
        return this;
    }

    addEventHandlers() {

        var self = this;

        // primary toolbar
        $( this.toolbar.el ).on('click', this.toolbar.primary.btns, function() {
            self.actionOnPrimaryTb( this );
        });

        // secondary toolbar
        $( this.toolbar.el ).on('click', this.toolbar.secondary.btns, function() {
            self.actionOnSecondaryTb( this );
        });
    }

    /*************
     * action bit
     *************/

    actionOnPrimaryTb(el) {

        var idx = $(el).index();

        if (idx >= this.TOOLBAR.PRIMARY.DOC && idx <= this.TOOLBAR.PRIMARY.REGION) {
            this.actionOnPrimaryTbItem(el);
        } else if (idx == this.TOOLBAR.PRIMARY.TOGGLE) {
            this.actionOnToggle(el);
        }
    }

    actionOnPrimaryTbItem(el) {
        // toggle secondary toolbar
        this.toggleSecondaryToolbar(el);

        // clear any overlays on osd
        if ( this.toolbar.secondary.shown ) {
            this.closeDialogs();
            this.clearGuides();
        }
    }

    actionOnToggle(el) {
        // toggle color indicator, toggle btn
        this.toggleColorIndicator();
        this.toggleSwitch();
        // hide secondary toolbar
        this.hideSecondaryToolbar();

        if ( this.toolbar.colorIndicator.shown ) {
            // fetch and draw annotation markers
            this.drawMarkersAction();
        } else {
            // clear markers
            this.clearMarkers();
        }
    }

    actionOnSecondaryTb(el) {
        // wait clicked toolbar item to change its state
        // or the dialog (doc tagging) does not shown at the first time
        setTimeout(e => {
            this.openDialog();
        }, 0);
    }

    drawMarkersAction() {
        // fetch annotations
        this.fetchAnnotations(annos => { // callback
            // draw markers
            this.drawMarkers(annos);
        });
    }

    /**************
     * toolbar bit
     **************/

    togglePrimaryToolbar() {
        var primary = this.toolbar.primary.el;

        $(primary).hasClass('show')
                ? $(primary).removeClass('show')
                : $(primary).addClass('show');
    }

    /** @el  selected item element on primary toolbar */
    toggleSecondaryToolbar(el) {
        var i = $(el).index(),
            secondary = this.toolbar.secondary.el;

        $( this.toolbar.secondary.btns ).removeClass('active');

        if ($(el).hasClass('active')) { // click on itself
            $(secondary).hasClass('show')
                    ? $(secondary).removeClass('show')
                    : $(secondary).addClass('show').css({top: i*50});
        } else { // click on others
            $(el).siblings().removeClass('active');
            $( this.toolbar.secondary.btns ).removeClass('active');
            $(secondary).addClass('show').css({top: i*50});
        }
    }

    toggleColorIndicator() {
        var indicator = this.toolbar.colorIndicator.el;

        $(indicator).hasClass('show')
                ? $(indicator).removeClass('show')
                : $(indicator).addClass('show');
    }

    toggleSwitch() {
        $( this.toolbar.primary.toggle ).find('i').toggleClass('fa-toggle-on fa-toggle-off');
    }

    hidePrimaryToolbar() {
        $(this.toolbar.primary.el).removeClass('show');
        $(this.toolbar.primary.el).find('.btn').removeClass('active');
    }

    hideSecondaryToolbar() {
        $(this.toolbar.secondary.el).removeClass('show');
        $(this.toolbar.secondary.el).find('.btn').removeClass('active');
    }

    hideColorIndicator() {
        $(this.toolbar.colorIndicator.el).removeClass('show');
        $(this.toolbar.primary.el).find('.indicator i').removeClass('fa-toggle-on').addClass('fa-toggle-off');
    }

    hideToggle() {
        $( this.toolbar.primary.toggle ).find('i').removeClass('fa-toggle-on').addClass('fa-toggle-off');
    }

    /*************
     * dialog big
     *************/

    openDialog() {

        var idx = this.getActiveTbId();

        if (idx[0] == this.TOOLBAR.PRIMARY.DOC) {

            this.dialog_c.openDialog({
                target: idx[0],
                type: idx[1],
                of: this.toolbar.el
            });
        }
    }

    closeDialogs() {
        this.dialog_c.closeDialogs();
    }

    /*************
     * marker bit
     *************/

    drawMarkers(annos) {
        if (annos.length <= 0)
            return;

        for (var i = 0; i < annos.length; i++) {
            var anno = annos[i];

            // skip if not for the current page
            if (anno.page != this.viewerModel.getPageNumber())
                continue;
            // skip if for document
            if (anno.type == this.TTARGETS.DOC)
                continue;

            this.osd_c.drawMarker(i, new Annotation({annotation: anno}));
        }
    }

    clearMarkers() {
        this.osd_c.clearMarkers();
    }

    /***********
     * ajax bit
     ***********/

    fetchAnnotations(callback) {
        //
        // ajax call to fetch annotations
        //
        this.ajax_c.getAnnotations(this.metadata.getItemId(),
                                   this.viewerModel.getPageNumber(), callback);
    }

    /**
     *
     */

    /** get selected toolbar item ids, both primary and secondary toolbars */
    getActiveTbId() {
        return [$(this.toolbar.primary.el).find('.btn.active').index(),
                $(this.toolbar.secondary.el).find('.btn.active').index()];
    }

    clearGuides() {
        this.osd_c.clearGuides();
    }

    /**
     *
     */

    openToolbar() {
        this.togglePrimaryToolbar();
    }

    closeToolbar() {
        // hide primary toolbar
        this.hidePrimaryToolbar();
        // hide secondary toolbar
        this.hideSecondaryToolbar();
        // hide color indicator
        this.hideColorIndicator();
        // switch off toggle
        this.hideToggle();
    }

}
