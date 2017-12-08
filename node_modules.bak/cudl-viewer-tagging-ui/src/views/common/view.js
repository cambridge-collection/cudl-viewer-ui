import assert from 'assert';

import $ from 'jquery';

/**
 * A minimal view class based on those created for cudl-embedded
 */
export default class View {
    constructor(options) {
        this.className = options.className || this.className || null;
        this.id = options.id || this.id || null;
        this.tag = options.tag || this.tag || null;

        var el = options.el || this.createElement();
        var of = options.of || this.createElement();

        assert(el instanceof Element, "el must be an Element", el);
        assert(of instanceof Element, "of must be an Element", of);
        this.setEl(el);
        this.setOf(of);

        this._bindEvents();
    }

    remove() {
        $(this.el).remove();
        this._unbindEvents();
    }

    _bindEvents() { }
    _unbindEvents() { }

    createElement() {
        var tagName = this.tag || 'div';
        return $(document.createElement(tagName))
            .addClass(this.className)
            .attr('id', this.id)
            .get(0);
    }

    setEl(el) {
        this.$el = $(el).first();
        this.el = this.$el[0];
    }

    setOf(of) {
        this.$of = $(of).first();
        this.of = this.$of[0];
    }
}
