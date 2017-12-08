import assert from 'assert';
import $ from 'jquery';

/**
 * A minimal view class based on those created for cudl-embedded
 */
export default class View {
    constructor(options) {
        this.className = options.className || this.className || null;
        this.id = options.id || this.id || null;

        var el = options.el || this.createElement();
        assert(el instanceof Element, "el must be an Element", el);
        this.setEl(el);
    }

    createElement() {
        return $('<div>').addClass(this.className).attr('id', this.id)[0];
    }

    setEl(el) {
        this.$el = $(el).first();
        this.el = this.$el[0];
    }
}
