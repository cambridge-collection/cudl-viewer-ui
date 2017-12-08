import $ from 'jquery';
import 'jquery-ui/ui/widgets/dialog';
import isUndefined from 'lodash/isUndefined';

/** controllers */
import Controller from './common/controller';

/** models */
import Annotation from '../models/annotation';

/** constants */
import { TOOLBAR } from '../models/consts';

/** impls */
import { gmapImpl } from '../impls/gmapImpl';
import { datepickerImpl } from '../impls/datepickerImpl';


export default class DialogController extends Controller {
    constructor(options) {
        super(options);
        this.dialog = options.dialog;
        this.ajax_c = options.ajax_c;
        this.viewerModel = options.viewerModel;

        // constants
        this.TOOLBAR = TOOLBAR;

        // impl
        this.gmapImpl       = gmapImpl;
        this.datepickerImpl = datepickerImpl;

        // animation
        // this.animation = {
        //  effect: 'fade',
        //  duration: 300
        // };
    }

    setControllers(toolbar_c, osd_c) {
        this.toolbar_c = toolbar_c;
        this.osd_c     = osd_c;
    }

    init() {
        this.initDialogs();

        this.addEventHandler();

        // init map component
        this.gmapImpl.init({
            el: this.dialog.place.map,
            input: this.dialog.place.input
        });

        // init datepicker component
        this.datepickerImpl.init({
            el: this.dialog.date.datepicker,
            input: [this.dialog.date.input1, this.dialog.date.input2]
        });

        return this;
    }

    initDialogs() {

        var person = this.dialog.person.el,
            about  = this.dialog.about.el,
            date   = this.dialog.date.el,
            place  = this.dialog.place.el,
            info   = this.dialog.info.el;

        var dialogs = [ person, about, date, place, info ];

        var self = this;

        $.each(dialogs, function(i, v) {
            $(v).dialog({
                appendTo: self.dialog.el,
                // show : self.animation,
                // hide : self.animation,
                autoOpen : false,
                resizable : false,
                dialogClass : 'dialog-style',
                create : function(e, ui) {
                    // replace close icon
                    var widget = $(this).dialog("widget");
                    $(".ui-dialog-titlebar-close span:first-child", widget)
                        .removeClass("ui-icon-closethick")
                        .addClass("fa fa-close");
                },
                open : function(e, ui) {

                    // fix: refresh map
                    self.refreshMap();

                },
                beforeClose : function(e, ui) {
                    // $(this).dialog({hide : self.animation});
                },
                close : function() {

                    // close dialog
                    self.actionOnClose(this);

                },
                buttons : [{
                    text : self._setSubmitText(i),
                    icons : {
                        primary : 'fa fa-check'
                    },
                    click : function() {

                        // add or remove annotation
                        self.actionOnSubmit(this);

                    }
                }, {
                    text : "Cancel",
                    icons : {
                        primary : "fa fa-close"
                    },
                    click : function() {

                        // close dialog
                        self.actionOnClose(this);

                    }
                }],
                width : self._setWidth(i),
                title : self._setTitle(i)
            });
        });

    }

    _setTitle(idx) {
        switch(idx) {
            case 0: return 'Person';
            case 1: return 'About';
            case 2: return 'Date';
            case 3: return 'Place';
            case 4: return 'Info';
            default: return 0;
        }
    }

    _setWidth(idx) {
        switch(idx) {
            case 0: return '14em'; // person
            case 1: return '14em'; // about
            case 2: return '26em'; // date
            case 3: return '14em'; // place
            case 4: return '14em'; // info
            default: return 0;
        }
    }

    _setSubmitText(idx) {
        switch(idx) {
            case 0: return 'Submit'; // person
            case 1: return 'Submit'; // about
            case 2: return 'Submit'; // date
            case 3: return 'Submit'; // place
            case 4: return 'Delete'; // info
            default: return 0;
        }
    }

    addEventHandler() {

        // delete dialog submit event handlers
        $( this.dialog.el ).on('click', this.dialog.deletecnfm.btn1, e => {
            this.actionOnDelete( this.dialog.info.el );
        });

        // // delete dialog cancel event handlers
        $( this.dialog.el ).on('click', this.dialog.deletecnfm.btn2, e => {
            this.actionOnClose( this.dialog.info.el );
        });
    }

    /*************
     * action bit
     *************/

    actionOnSubmit(el) {
        // add annotation if any tagging dialog
        if (el != this.dialog.info.el) {

            // add annotation
            this.addAnnotation( (anno, resp) => { // callback
                // show confirmation message
                this.showConfirmationMsg(el, 'add');
                // draw marker if toggle is on
                if ( this.toolbar_c.toolbar.colorIndicator.shown ) {
                    // draw new added marker
                    this.drawMarker(anno);
                }
            });

        }
        // remove annotation if info dialog
        else {
            // show delete confirmation
            this.showDeleteDlg();
        }
    }

    actionOnClose(el) {
        // close dialog
        this.closeDialog(el);
        // remove osd guide stuffs
        this.clearGuides();
        // remove markers
        // this.clearMarkers();
    }

    actionOnDelete(el) {

        // remove annotation
        this.removeAnnotation( (anno, resp) => { // callback
            // remove confirmation
            this.hideDeleteDlg();
            // show result message
            this.showConfirmationMsg(el, 'del');

            // clear corresponding marker
            this.clearMarker( $(el).data('id') );
        });

    }

    /*************
     * dialog bit
     *************/

    /**
     * @opts.target     the selected idx of primary toolbar
     * @opts.type       the selected idx of secondary toolbar
     * @opts.position   if it's not null, it is the center coordinates of element
     * @opts.of         which element to position against
     */
    openDialog(opts) {
        // try to close any opened dialogs
        this.closeDialogs();

        var dlg, my, at;

        // tagging dialogs
        if (!isUndefined(opts.target)) {
            switch(opts.type) {
                case this.TOOLBAR.SECONDARY.PERSON: dlg = this.dialog.person.el; break;
                case this.TOOLBAR.SECONDARY.ABOUT:  dlg = this.dialog.about.el;  break;
                case this.TOOLBAR.SECONDARY.DATE:   dlg = this.dialog.date.el;   break;
                case this.TOOLBAR.SECONDARY.PLACE:  dlg = this.dialog.place.el;  break;
            }
            switch (opts.target) {
                case this.TOOLBAR.PRIMARY.DOC:    my = 'left+25 top+125'; at = 'right top'; break;
                case this.TOOLBAR.PRIMARY.POINT:  my = 'center top+40'; at = 'left+' + opts.position.x + ' top+' + opts.position.y; break;
                case this.TOOLBAR.PRIMARY.REGION: my = 'center top+40'; at = 'left+' + opts.position.x + ' top+' + opts.position.y; break;
            }
        }
        // info dialog
        else {
            dlg = this.dialog.info.el;
            my = 'center top+20', at = 'center bottom';

            if (!isUndefined(opts.anno)) {
                $(dlg).data('uuid', opts.anno.uuid);
                $(dlg).data('id', opts.anno.id);
                $(dlg).html(opts.anno.content);
            }
        }

        // open dialog
        $(dlg).dialog({
            position : {
                my: my,
                at: at,
                of: opts.of || this.dialog.of,
                collision: 'fit'
            },
            hide: false // disable animation
        });
        $(dlg).dialog('open');
    }

    closeDialog(el) {
        // close
        $(el).dialog('close');

        // remove confirmation and result message
        this.hideDeleteDlg();
        this.hideConfirmationMsg();

        // clear inputs
        this.clearInputs();
    }

    closeDialogs() {
        $( this.dialog.el ).find('div[class^=dialog]').each(function() {
            $(this).dialog('close');
        });
    }

    /********************
     * delete-dialog bit
     ********************/

    showDeleteDlg() {
        this.dialog.renderDeleteCnfm();
    }

    hideDeleteDlg() {
        $( this.dialog.deletecnfm.el ).remove();
    }

    /***************************
     * confirmation-message bit
     ***************************/

    showConfirmationMsg(of, type) {
        var msg = '';
        switch (type) {
            case 'add': msg = 'New annotation added'; break;
            case 'del': msg = 'Annotation removed';   break;
        }

        // show confirmation message
        this.dialog.renderConfirmationMsg(of, msg);

        // set close animation, only for confirmation message
        $(of).dialog({
            hide: {
                effect : 'fade',
                delay : 900,
                duration : 300
            }
        });
        $(of).dialog('close');
    }

    hideConfirmationMsg() {
        $( this.dialog.confirmation.el ).remove();
    }

    /***********
     * ajax bit
     ***********/

    addAnnotation(callback) {
        var anno = this.createAnnotation();

        if (anno == null) {
            alert('Input cannot be empty');
            return;
        }

        //
        // ajax call to add annotation
        //
        this.ajax_c.addOrUpdateAnnotation(anno, callback);
    }

    removeAnnotation(callback) {
        var el = $( this.dialog.info.el );
        var uuid = $(el).data('uuid');;
        var anno = new Annotation({docId: this.metadata.getItemId(), uuid: uuid});

        //
        // ajax call to remove annotation
        //
        this.ajax_c.removeAnnotation(anno, callback);
    }

    /**
     *
     */

    createAnnotation() {

        var idx = this.toolbar_c.getActiveTbId();

        // get content
        var name = '';
        switch (idx[1]) {
            case this.TOOLBAR.SECONDARY.PERSON: name = $(this.dialog.person.input).val(); break;
            case this.TOOLBAR.SECONDARY.ABOUT:  name = $(this.dialog.about.input).val();  break;
            case this.TOOLBAR.SECONDARY.DATE:   name = $(this.dialog.date.input1).val() + '-' + $(this.dialog.date.input2).val(); break;
            case this.TOOLBAR.SECONDARY.PLACE:  name = $(this.dialog.place.input).val();  break;
        }

        if (name.length <= 0 || name === '-') return null;

        // get target, e.g., doc or tag
        var target = '';
        switch (idx[0]) {
            case this.TOOLBAR.PRIMARY.DOC:    target = 'doc'; break;
            case this.TOOLBAR.PRIMARY.POINT:  target = 'tag'; break;
            case this.TOOLBAR.PRIMARY.REGION: target = 'tag'; break;
        }

        // get tagging type, e.g., person, about, date or place
        var type = '';
        switch (idx[1]) {
            case this.TOOLBAR.SECONDARY.PERSON: type = 'person'; break;
            case this.TOOLBAR.SECONDARY.ABOUT:  type = 'about';  break;
            case this.TOOLBAR.SECONDARY.DATE:   type = 'date';   break;
            case this.TOOLBAR.SECONDARY.PLACE:  type = 'place';  break;
        }

        // get position
        var position = {};
        switch (idx[0]) {
            case this.TOOLBAR.PRIMARY.POINT:
                var el = this.osd_c.guideicon, p = $(el).position(), ow = $(el).outerWidth(), oh = $(el).outerHeight();
                position = {
                    type: 'point',
                    coordinates: [this.osd_c.getGuideIconImageCoords(p.left, p.top, ow, oh)]
                };
                break;
            case this.TOOLBAR.PRIMARY.REGION:
                var el = this.osd_c.boxhelper, p = $(el).position(), ow = $(el).outerWidth(), oh = $(el).outerHeight();
                position = {
                    type: 'polygon',
                    coordinates: this.osd_c.getGuideBoxHelperImageCoords(p.left, p.top, ow, oh)
                };
                break;
        }

        return new Annotation({
            docId : this.metadata.getItemId(),
            page : this.viewerModel.getPageNumber(),
            target : target,
            type : type,
            name : name,
            position : position,
            raw: 1
        });
    }

    refreshMap() {

        var idx = this.toolbar_c.getActiveTbId();

        if (idx[1] == this.TOOLBAR.SECONDARY.PLACE)
            this.gmapImpl.refresh();
    }

    clearInputs() {
        $(this.dialog.el).find('input').val('');
    }

    clearGuides() {
        this.osd_c.clearGuides();
    }

    clearMarkers() {
        this.osd_c.clearMarkers();
    }

    clearMarker(id) {
        this.osd_c.clearMarker(id);
    }

    /** draw new added annotation */
    drawMarker(anno) {
        this.toolbar_c.fetchAnnotations(annos => {
            var size = annos.length;
            this.osd_c.drawMarker(size, new Annotation(anno));
        });
    }

}
