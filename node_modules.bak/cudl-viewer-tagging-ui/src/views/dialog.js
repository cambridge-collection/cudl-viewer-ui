import $ from 'jquery';

import View from './common/view';


export default class DialogView extends View {
    constructor(options) {
        super(options);
    }

    render() {
        //
        // four tag types that user can create: person, about, date and place.
        // The tag info dialog is to show the content of the selected
        // tag-marker on osd.
        //

        $( this.of ).append(

            '<div class="dialog-tagging">'
                // person dialog
                + '<div class="dialog-person" title="Person">'
                    + '<input type="text" name="fullname" value="" placeholder="Full name" id="tagName" >'
                + '</div>'
                // about dialog
                + '<div class="dialog-about" title="About">'
                    + '<input type="text" name="about" value="" placeholder="Description" id="tagAbout" >'
                + '</div>'
                // date dialog
                + '<div class="dialog-date" title="Date">'
                    + '<div class="date-from">'
                        + '<label for="from">From (AD)</label>'
                        + '<input type="text" name="from" value="" id="tagDateFrom">'
                    + '</div>'
                    + '<div class="date-to">'
                        + '<label for="to">To (AD)</label>'
                        + '<input type="text" name="to" value="" id="tagDateTo">'
                    + '</div>'
                    + '<div id="datepicker">'
                        + '<label>Select date by clicking and dragging</label>'
                    + '</div>'
                + '</div>'
                // place dialog
                + '<div class="dialog-place" title="Place">'
                    + '<div id="map"></div>'
                    + '<input type="text" name="place" value="" placeholder="City or Country" id="tagPlace" >'
                + '</div>'
                // tag info dialog
                + '<div class="dialog-info" title="Tag Info"></div>'
            + '</div>');

        // set el
        this.setEl( '.dialog-tagging' );

        return this;
    }

    renderDeleteCnfm() {
        $( this.info.el ).after(

            '<div class="dlg-delete">'
                + '<span class="title">Are you sure to remove this annotation?</span>'
                + '<div class="ui-dialog-buttonset">'
                    + '<button type="button" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-icon-primary confirm-btn" role="button" id="delAnno">'
                        + '<span class="ui-button-icon-primary ui-icon fa fa-check"></span> <span class="ui-button-text">Confirm</span>'
                    + '</button>'
                    + '<button type="button" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-icon-primary cancel-btn" role="button" id="cancelDel">'
                        + '<span class="ui-button-icon-primary ui-icon fa fa-close"></span> <span class="ui-button-text">Cancel</span>'
                    + '</button>'
                + '</div>'
            + '</div>');
    }

    renderConfirmationMsg(el, msg) {
        $(el).after(

            '<div class="dlg-confirmation">'
                + '<span class="helper"></span>'
                + '<span class="title">' + msg + '</span>'
            + '</div>');
    }

    /**
     * element/component getter
     */

    get person() {
        return {
            el:         $('.dialog-person')[0],
            input:      $('#tagName')[0]
        };
    }

    get about() {
        return {
            el:         $('.dialog-about')[0],
            input:      $('#tagAbout')[0]
        };
    }

    get place() {
        return {
            el:         $('.dialog-place')[0],
            map:        $('#map')[0],
            input:      $('#tagPlace')[0]
        };
    }

    get date() {
        return {
            el:         $('.dialog-date')[0],
            datepicker: $('#datepicker')[0],
            input1:     $('#tagDateFrom')[0],
            input2:     $('#tagDateTo')[0]
        };
    }

    get info() {
        return {
            el:         $('.dialog-info')[0]
        };
    }

    get deletecnfm() {
        return {
            el:         $('.dlg-delete')[0],
            btn1:       '#delAnno',
            btn2:       '#cancelDel'
        };
    }

    get confirmation() {
        return {
            el:         $('.dlg-confirmation')[0]
        };
    }

}
