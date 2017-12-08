import $ from 'jquery';
import StateMachine from 'javascript-state-machine';
import isString from 'lodash/isString';
import isNumber from 'lodash/isNumber';
import includes from 'lodash/includes';

import { ValueError, IllegalStateException, NotImplementedError } from '../utils/exceptions';
import Annotation from './annotation';


export class AnnotationListModel {
    constructor() {
        this.loadingXhr = null;
        this.fsm = this.createFsm();
        this.hasItemId = false;
        this.hasPage = false;

        // A function which will abort the delete request when called
        this.abortDeleteOperation = null;
    }

    createFsm() {
        return StateMachine.create({
            initial: 'uninitialised',
            events: [
                {name: 'init', from: 'uninitialised', to: 'unloaded'},
                {name: 'load', from: ['unloaded', 'idle', 'error', 'loading'], to: 'loading'},
                {name: 'loaded', from: 'loading', to: 'idle'},
                {name: 'failed', from: 'loading', to: 'error'},

                {name: 'delete', from: 'idle', to: 'deleting'},
                {name: 'abortDelete', from: 'deleting', to: 'idle'},
                {name: 'deleteFailed', from: 'deleting', to: 'idle'},
                {name: 'deleted', from: 'deleting', to: 'idle'}
            ],
            callbacks: {
                onenterstate: () => $(this).trigger('change:state'),

                onenterloading: (event, from, to) => {
                    this.loadingXhr = $.ajax({
                        url: `/crowdsourcing/anno/get/${encodeURIComponent(this.itemId)}/${encodeURIComponent(this.pageNumber)}`
                    })
                    .fail((xhr) => this.fsm.failed(xhr.status))
                    .done((data) => {
                        this.fsm.loaded(data.result.annotations.map(a => new Annotation(a)));
                    })
                    .done(() => {
                        this.xhr = null;
                    });
                },
                onleaveloading: (event, from, to) => {
                    // Cancel any in-progress XHRs so we never have more than
                    // one in progress.
                    if(this.loadingXhr.readyState !== XMLHttpRequest.DONE) {
                        this.loadingXhr.abort();
                    }
                    this.loadingXhr = null;
                },
                onafterloaded: (event, from, to, annotations) => {
                    this._set('annotations', annotations);
                },
                onentererror: (event, from, to, status) => {
                    this.errorStatus = status;
                },
                onleaveerror: () => {
                    this.errorStatus = undefined;
                },

                onabortDelete: () => {
                    this.abortDeleteOperation();
                },
                onenterdeleting: (event, from, to, annotations) => {
                    var annotationIds = annotations
                        .map(a => ({name: 'uuid', value: a.getUUID()}));
                    var url = `/crowdsourcing/anno/remove/${encodeURIComponent(this.itemId)}`;

                    var jqxhr = $.ajax({
                        url: url,
                        method: 'POST',
                        data: annotationIds
                    })
                    .fail((xhr) => this.fsm.deleteFailed(xhr.status))
                    .done(removedIds => this.fsm.deleted(removedIds));

                    this.abortDeleteOperation = () => jqxhr.abort();
                },
                onleavedeleting: () =>
                    this.abortDeleteOperation = null,
                onafterdeleted: (event, from, to, removedIds) =>
                    this._removeAnnotationsWithIds(removedIds),
                onbeforedeleteFailed: (event, from, to , status) => {
                    $(this).trigger('delete-failed', status);
                }
            }
        });
    }

    getState() {
        return this.fsm.current;
    }

    getErrorStatus() {
        if(!this.fsm.is('error')) {
            throw new IllegalStateException(
                'Annotation list is not in the error state');
        }
        return this.errorStatus;
    }

    _set(name, value, quiet=false) {
        var old = this[name];
        this[name] = value;

        if(!quiet && old !== value)
            this._notifyChange(name);
    }

    _notifyChange(name) {
        $(this).trigger(`change:${name}`);
    }

    initIfUninitialised() {
        if(this.fsm.is('uninitialised') && this.hasItemId && this.hasPage)
            this.fsm.init();
    }

    setItemId(itemId) {
        if(!isString(itemId) || !itemId)
            throw new ValueError('itemId must be a non-empty string, got: ' +
                                 itemId);

        this._set('itemId', itemId);
        this.hasItemId = true;
        this.initIfUninitialised();
    }

    setPage(pageNumber) {
        if(!isNumber(pageNumber))
            throw new ValueError('pageNumber must be a number, got: ' +
                                 pageNumber);

        this.pageNumber = pageNumber;
        this.hasPage = true;

        this._set('pageNumber', pageNumber);
        this.hasPage = true;
        this.initIfUninitialised();
    }

    getPage() {
        return this.pageNumber;
    }

    getAnnotations() {
        if(!(this.fsm.is('idle'))) {
            throw new IllegalStateException('No annotations loaded');
        }

        return this.annotations;
    }

    _removeAnnotationsWithIds(ids) {
        var removed = this.annotations.filter(a => !includes(ids, a.getUUID()));

        if(removed.length < this.annotations.length)
            this._set('annotations', removed);
    }

    load() {
        this.fsm.load();
    }

    deleteAnnotations(annotations) {
        this.fsm.delete(annotations);
    }
}
