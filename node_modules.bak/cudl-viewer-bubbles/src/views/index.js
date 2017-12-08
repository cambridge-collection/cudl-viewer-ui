import assert from 'assert';

import $ from 'jquery';
import assign from 'lodash/assign';
import Spinner from 'spin.js';

import View from './view';
import BubbleView from './bubbles';

import failedTemplate from '../../templates/failed.jade';


/**
 * The root View controlling the similarity tab. It's responsible for switching
 * between the top level views showing loading, error and idle (loaded) states.
 */
export class RootSimilarityView extends View {
    constructor(options) {
        super(options);
        this.model = options.similarityModel;
        this.loadingModel = options.loadingModel;
        this.viewportModel = options.viewportModel;
        this.imageServerBaseUrl = options.imageServerBaseUrl;

        $(this.model).on('change:state', this.render.bind(this));

        this._isVisible = options.isVisible || false;
        this.loadingView = null;
    }

    setVisible(isVisible) {
        if((!!isVisible) !== this._isVisible) {
            this._isVisible = !!isVisible;
            $(this).trigger('change:visibility');
        }
    }

    isVisible() {
        return this._isVisible;
    }

    renderLoadingView() {
        if(this.loadingView === null) {
            this.loadingView = new LoadingView({
                el: this.el, // Share our el
                model: this.loadingModel
            });
        }
    }

    render() {
        this.renderLoadingView();

        var state = this.model.getState();
        var view = null;

        if(state === 'idle') {
            view = new BubbleView({
                similarity: this.model.similarity,
                similarityIdentifier: this.model.similarityIdentifier,
                viewportModel: this.viewportModel,
                imageServerBaseUrl: this.imageServerBaseUrl
            })
        }
        else if(state === 'loading') {
        }
        else if(state === 'failed') {
            view = new FailedStateView({
                model: this.model
            });
        }
        else {
            assert.equal(state, 'uninitialised');
        }

        this.$el.empty();
        if(view) {
            this.$el.append(view.el);
            view.render();
        }
        return this;
    }
}


class FailedStateView extends View {
    render() {
        this.$el.html(failedTemplate());
        return this;
    }
}


class LoadingView extends View {
    constructor(options) {
        super(options);

        this.model = options.model;

        this.spinOpts = options.spinOpts || {
            scale: 2,
            opacity: 0.1,
            shadow: true,
            top: '50%',
            left: '50%',
            className: 'blah-spinner'
        };
        this.spinner = new Spinner(this.spinOpts);

        $(this.model).on('change:loading', this.render.bind(this));
    }

    render() {
        if(this.model.isLoading())
            this.spinner.spin(this.el);
        else
            this.spinner.stop();

        return this;
    }
}
assign(LoadingView.prototype, {
    className: 'loading'
});
