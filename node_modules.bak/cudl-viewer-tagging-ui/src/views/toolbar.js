import $ from 'jquery';

import View from './common/view';


export default class ToolbarView extends View {
    constructor(options) {
        super(options);
    }

    render() {

        // toolbar container
        $(this.of).append('<div class="btn-toolbar toolbar-tagging"></div>');

        // set el
        this.setEl( '.toolbar-tagging' );

        // primary toolbar
        $(this.el).append(

            '<div class="btn-group-vertical toolbar-primary" role="toolbar" data-toggle="buttons" aria-label="toolbar-primary">'
                + '<div class="btn btn-primary">'
                    + '<i class="fa fa-tags fa-lg"/><div class="tb-label">Annotation Toolbar</div>'
                + '</div>'
                + '<label class="btn btn-primary">'
                    + '<input type="radio" name="options" id="option1" autocomplete="off">'
                    + '<i class="fa fa-file-text-o fa-lg"/><div class="tb-label">Page</div>'
                + '</label>'
                + '<label class="btn btn-primary">'
                    + '<input type="radio" name="options" id="option2" autocomplete="off">'
                    + '<i class="fa fa-thumb-tack fa-lg"/><div class="tb-label">Point</div>'
                + '</label>'
                + '<label class="btn btn-primary">'
                    + '<input type="radio" name="options" id="option3" autocomplete="off">'
                    + '<i class="fa fa-square-o fa-lg"/><div class="tb-label">Region</div>'
                + '</label>'
                + '<label class="btn btn-primary indicator">'
                    + '<input type="radio" name="options" id="option4" autocomplete="off">'
                    + '<i class="fa fa-toggle-off fa-lg"/><div class="tb-label">Toggle</div>'
                + '</label>'
            + '</div>');

        // secondary toolbar
        $(this.el).append(

            '<div class="btn-group-vertical toolbar-secondary" role="toolbar" data-toggle="buttons" aria-label="toolbar-secondary">'
                + '<label class="btn btn-primary" title="Person">'
                    + '<input type="radio" name="options" id="option1" autocomplete="off"><i class="fa fa-user fa-lg"/>'
                + '</label>'
                + '<label class="btn btn-primary" title="About">'
                    + '<input type="radio" name="options" id="option2" autocomplete="off"><i class="fa fa-info-circle fa-lg"/>'
                + '</label>'
                + '<label class="btn btn-primary" title="Date">'
                    + '<input type="radio" name="options" id="option3" autocomplete="off"><i class="fa fa-clock-o fa-lg"/>'
                + '</label>'
                + '<label class="btn btn-primary" title="Place">'
                    + '<input type="radio" name="options" id="option4" autocomplete="off"><i class="fa fa-map-marker fa-lg"/>'
                + '</label>'
            + '</div>');

        // color indicator
        this.indicator = new ColorIndicator({of:this.of}).render();

        return this;
    }

    /**
     * element/component getter
     */

    get primary() {
        return {
            el:     $('.toolbar-primary')[0],
            toggle: $('.toolbar-primary').find('.indicator')[0],
            shown:  $('.toolbar-primary').hasClass('show'),
            btns:   '.toolbar-primary .btn'
        };
    }

    get secondary() {
        return {
            el:     $('.toolbar-secondary')[0],
            shown:  $('.toolbar-secondary').hasClass('show'),
            btns:   '.toolbar-secondary .btn',
        };
    }

    get colorIndicator() {
        return {
            el:     $('.color-indicator')[0],
            shown:  $('.color-indicator').hasClass('show')
        };
    }

}

/**
 * Color indicator
 */

class ColorIndicator extends View {
    constructor(options) {
        super(options);
    }

    render() {

        $(this.of).append(

            '<div class="color-indicator">'
                + '<span class="label">COLOURS</span>'
                + '<div class="person"><span></span><label>Person</label></div>'
                + '<div class="about"><span></span><label>About</label></div>'
                + '<div class="date"><span></span><label>Date</label></div>'
                + '<div class="place"><span></span><label>Place</label></div>'
            + '</div>');

        // set el
        this.setEl('.color-indicator');

        return this;
    }

}
