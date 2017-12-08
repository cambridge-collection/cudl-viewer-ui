import $ from 'jquery';

import { IllegalStateException } from '../util/exceptions';


/**
 * A model which tracks the loading state of one or more things to allow
 * loading indicators to have a single point of access to the loading state of
 * the app.
 */
export default class LoadingModel {
    constructor() {
        this._tokens = new Set();
    }

    startLoading() {
        let token = new LoadingToken(this);
        this._tokens.add(token);
        $(this).trigger('change:loading', this.isLoading());
        return token;
    }

    stopLoading(token) {
        if(!this._tokens.delete(token)) {
            throw new IllegalStateException('token is already stopped');
        }
        $(this).trigger('change:loading', this.isLoading());
    }

    isStopped(token) {
        return !this._tokens.has(token);
    }

    isLoading() {
        return this._tokens.size > 0;
    }
}


class LoadingToken {
    constructor(loadingModel) {
        this.loadingModel = loadingModel;
        // Can be used in the case of LoadingToken leaks to track down where
        // a leaked token was created from (via the .stack property).
        this.debugSource = new Error();
    }

    markStopped() {
        this.loadingModel.stopLoading(this);
    }

    isStopped() {
        return this.loadingModel.isDone(this);
    }
}
