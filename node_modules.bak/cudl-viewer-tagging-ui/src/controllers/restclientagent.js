import $ from 'jquery';
import includes from 'lodash/includes';
import fromPairs from 'lodash/fromPairs';
import isUndefined from 'lodash/isUndefined';

import { ValueError } from '../utils/exceptions';

var path = require('path');


export default class RestClientAgent {

    _notifyAnnotationChanged(op, annotation) {
        if(!includes(['update', 'create', 'delete'], op)) {
            throw new ValueError(' Unknown op: ' + op);
        }

        $(this).trigger('change:annotation', fromPairs([[op, annotation]]));
    }

    /** add or update annotation */
    addOrUpdateAnnotation(anno, callback) {
        var url = path.join(API_ADD_ANNO, anno.getDocumentId(), anno.getPageNum().toString());

        this._ajax({url: url, data: anno}, resp => {
            var op = anno.getUUID() ? 'update' : 'create';
            this._notifyAnnotationChanged(op, anno);
            callback(anno, resp);
        });
    }

    /** remove tag or undo removed tag */
    addOrUpdateRemovedTag(tag, callback) {
        var url = path.join(API_ADD_RTAG, tag.getDocumentId());

        this._ajax({url: url, data: tag}, resp => {
            callback(tag, resp);
        });
    }

    /** remove annotation */
    removeAnnotation(anno, callback) {
        var url = path.join(API_RMV_ANNO, anno.getDocumentId(), anno.getUUID());

        this._ajax({url: url, data: anno, method: 'DELETE'}, resp => {
            this._notifyAnnotationChanged('delete', anno);
            callback(anno, resp);
        });
    }

    /** get annotations by document id */
    getAnnotations(docId, page, callback) {
        var url = path.join(API_GET_ANNO, docId, page.toString());

        this._ajax({url: url}, resp => {
            console.log('anno found: '+resp.result.annotations.length);
            callback(resp.result.annotations);
        });
    }

    /** get tags by document id */
    getTags(docId, callback) {
        var url = path.join(API_GET_TAG, docId);

        this._ajax({url: url}, resp => {
            console.log('tags found: '+resp.result.terms.length);
            callback(resp.result.terms);
        });
    }

    /** get remove tags */
    getRemovedTags(docId, callback) {
        var url = path.join(API_GET_RTAG, docId);

        this._ajax({url: url}, resp => {
            console.log('removed tags found: '+resp.result.tags.length);
            callback(resp.result.tags);
        });
    }

    /**
     * @opts.url    string, required
     * @opts.data   object, optional
     * callback     function, required
     */

    _ajax(opts, callback) {

        console.log(opts.url);
        // console.log('payload: '+opts.data);

        var method  =  opts.method || (isUndefined(opts.data) ? 'GET' : 'POST');
        var payload = isUndefined(opts.data) ? '' : JSON.stringify(opts.data);
        var cntType = isUndefined(opts.data) ? 'text/plain' : 'application/json; charset=utf-8';

        $.ajax({
            url : opts.url,
            type : method,
            data : payload,
            contentType : cntType,
            dataType : 'json', // response data type
            timeout : timeout, // timeout in milliseconds
        }).done(function(data, status) {
            if (data && data.redirect) {
                // user unauthorized, redirect to login page
                window.location.href = data.redirectURL;
            } else {
                callback(data);
            }
        }).fail(function(jqxhr, status, error) {
            console.log('ajax fail: '+status);
        });

    }

}

/**
 * api endpoints
 */

const BASE = '/crowdsourcing';
const API_ADD_ANNO = BASE + '/anno/update';
const API_GET_ANNO = BASE + '/anno/get';
const API_RMV_ANNO = BASE + '/anno/remove';
const API_ADD_RTAG = BASE + '/rmvtag/update';
const API_GET_RTAG = BASE + '/rmvtag/get';
const API_GET_TAG  = BASE + '/tag/get';
const API_AUTH     = BASE + '/auth';

const timeout      = 10000; // milliseconds
