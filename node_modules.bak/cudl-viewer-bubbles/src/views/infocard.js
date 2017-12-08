import assert from 'assert';

import pipe from 'lodash/fp/pipe';
import map from 'lodash/fp/map';
import filter from 'lodash/fp/filter';
import identity from 'lodash/fp/identity';
import sortBy from 'lodash/fp/sortBy';
import first from 'lodash/fp/first';
import slice from 'lodash/fp/slice';
import join from 'lodash/fp/join';
import assign from 'lodash/assign';
import $ from 'jquery';

import View from './view';
import { ValueError } from '../util/exceptions';
import { SimilarityItemModel } from '../models/similarityitemmodel';
import * as cudlurls from '../util/urls';
import infoCardTemplate from '../../templates/infocard.jade';
import { Rect } from './bubbles/tiledimage'


const MOUSE_LEAVE_GRACE_PERIOD = 150;


export class InfoCardView extends View {

    constructor(options) {
        super(options);

        if(!(options.model instanceof SimilarityItemModel))
            throw new ValueError('Expected a SimilarityItemModel as ' +
                                 `items.model, got: ${options.model}`);

        this.model = options.model;
        this.isUnderMouse = false;
        this.dismissOnFocusLost = !!options.dismissOnFocusLost;

        this.dismiss = this.dismiss.bind(this);
        this.onBubbleUnderMouseChange = this.onBubbleUnderMouseChange.bind(this);
        this.onUsUnderMouseChange = this.onUsUnderMouseChange.bind(this);
        this.onFocusLost = this.onFocusLost.bind(this);

        this.bindEvents();

        // Need to be focusable so that we can track losing focus from taps
        // outside
        if(this.dismissOnFocusLost)
            this.$el.attr('tabindex', -1);
    }

    bindEvents() {
        $(this.model).on('change:isUnderMouse', this.onBubbleUnderMouseChange);
        this.$el.on('mouseenter mouseleave', this.onUsUnderMouseChange);
        this.$el.on('blur', '*', this.onFocusLost);
        this.$el.on('blur', this.onFocusLost);
    }

    unbindEvents() {
        // unbind mouse listener
        $(this.model).off('change:isUnderMouse', this.onBubbleUnderMouseChange);
        this.$el.off('mouseenter mouseleave', this.onUsUnderMouseChange);
        this.$el.off('blur', '*', this.onFocusLost);
        this.$el.off('blur', this.onFocusLost);
    }

    onFocusLost(e) {
        if(this.dismissOnFocusLost) {
            // Ignore losing focus to elements under us
            if(this.$el.has(e.relatedTarget).length)
                return;

            this.dismiss();  // No delay
        }
    }

    onBubbleUnderMouseChange() {
        if(!this.shouldBeVisible())
            this.scheduleDismiss();
        else
            this.cancelDismiss();
    }

    onUsUnderMouseChange(e) {
        this.isUnderMouse = e.type === 'mouseenter';

        if(!this.shouldBeVisible())
            this.scheduleDismiss();
        else
            this.cancelDismiss();
    }

    shouldBeVisible() {
        return this.isUnderMouse || this.model.isUnderMouse;
    }

    scheduleDismiss() {
        if(!this._scheduledDismiss) {
            this._scheduledDismiss = setTimeout(this.dismiss,
                                                MOUSE_LEAVE_GRACE_PERIOD);
        }
    }

    cancelDismiss() {
        if(this._scheduledDismiss) {
            clearTimeout(this._scheduledDismiss);
            this._scheduledDismiss = undefined;
        }
    }

    // TODO: define weighted importance values to dmd items to pick useful
    // subset to show.

    dismiss() {
        this.unbindEvents();

        $(this).trigger('dismissed');

        // TODO: transition/animate removal
        this.$el.remove();
    }

    render() {
        if(!this.$el.children().length) {
            this.$el.html(infoCardTemplate({
                title: this.getTitle(),
                subtitles: this.getSubTitles(),
                abstract: this.getAbstractExcerpt(),
                url: this.getItemUrl()
            }));
        }

        this.renderPosition();
    }

    renderPosition() {
        let svg = $(this.model.svgElement).closest('svg');
        let svgOffset = svg.offset();

        let bubble = {
            x: svgOffset.left + this.model.position.x,
            y: svgOffset.top + this.model.position.y,
            r: this.model.position.r
        };

        let screen = {width: $(window).width(), height: $(window).height()};

        let card = {
            width: this.$el.outerWidth(),
            height: this.$el.outerHeight()
        };

        let layout = this.getBestLayout(screen, card, bubble);
        this.$el.css(layout.css);
    }

    getBestLayout(screen, card, bubble) {
        return pipe(
            // Calculate each layout for the given conditions
            map(layout => layout(screen, card, bubble)),
            // Rank layouts by 'badness' - currently the proportion of the card
            // that falls outside the screen
            sortBy(l => this.layoutBadness(screen, bubble, l)),
            first
        )(this.layouts);
    }

    getDmdHierachy() {
        let hit = this.getHit();
        let dmds = hit.descriptiveMetadata;
        return map(s => dmds[s.descriptiveMetadataID])
                  (this.getHit().structurePath);
    }

    getHit() {
        assert(this.model.hit);
        return this.model.hit;
    }

    getRootDmd() {
        return this.getDmdHierachy()[0];
    }

    getTitle() {
        let dmd = this.getRootDmd();
        return dmd.title && dmd.title.displayForm || null;
    }

    getSubTitles() {
        return pipe(
            slice(1),
            map(dmd => dmd.title && dmd.title.displayForm),
            filter(identity),
            join(' › ')
        )(this.getDmdHierachy());
    }

    getAbstractExcerpt(dmd) {
        dmd = dmd || this.getRootDmd();

        if(!dmd.abstract)
            return null;

        let html = $($.parseHTML(dmd.abstract.displayForm));
        return html.find('p').addBack('p').first().text() || null;
    }

    getItemUrl() {
        let hit = this.getHit();
        return cudlurls.cudlItem(hit.ID, hit.firstPage.sequence);
    }
}
assign(InfoCardView.prototype, {
    className: 'infocard',
    layouts: [
        topLeftCornerLayout, topRightCornerLayout,
        bottomLeftCornerLayout, bottomRightCornerLayout
    ],
    layoutBadness: proportionOutsideScreenBadNess
});


class Layout {
    constructor(rect) {
        this._rect = rect;
    }

    get rect() {
        return this._rect;
    }

    get css() {
        return {
            left: this.rect.left,
            top: this.rect.top
        }
    }
}

function topRightCornerLayout(screen, card, bubble) {
    let x = bubble.x - card.width;
    let y = bubble.y;

    return new Layout(new Rect(x, y, card.width, card.height));;
}

function bottomRightCornerLayout(screen, card, bubble) {
    let x = bubble.x - card.width;
    let y = bubble.y - card.height;

    return new Layout(new Rect(x, y, card.width, card.height));;
}

function topLeftCornerLayout(screen, card, bubble) {
    let x = bubble.x;
    let y = bubble.y - card.height;

    return new Layout(new Rect(x, y, card.width, card.height));;
}

function bottomLeftCornerLayout(screen, card, bubble) {
    let x = bubble.x;
    let y = bubble.y;

    return new Layout(new Rect(x, y, card.width, card.height));;
}

function proportionOutsideScreenBadNess(screen, bubble, layout) {
    let r = layout.rect;

    let w, h;
    if(r.right <= 0)
        return 1;
    else if(r.left >= screen.width)
        return 1;
    else
        w = Math.min(screen.width, r.right) - Math.max(0, r.left);

    if(r.bottom <= 0)
        return 1;
    else if(r.top >= screen.height)
        return 1;
    else
        h = Math.min(screen.height, r.bottom) - Math.max(0, r.top);

    return 1 - ((w * h) / (r.width * r.height))
}
