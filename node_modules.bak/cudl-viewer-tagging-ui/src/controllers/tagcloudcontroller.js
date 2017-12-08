import $ from 'jquery';

/** controllers */
import Controller from './common/controller';

/** models */
import Tag from '../models/tag';

/** impls */
import { cloudImpl } from '../impls/cloudImpl';


export default class TagCloudController extends Controller {
    constructor(options) {
        super(options);
        this.tagcloud = options.tagcloud;
        this.ajax_c   = options.ajax_c;

        // impl
        this.cloudImpl = cloudImpl;
    }

    init() {
        this.addEventHandlers();
        return this;
    }

    addEventHandlers() {

        // refresh cloud button
        $( this.tagcloud.cloud.refresh ).on('click', e => {
            this.actionOnRefresh();
        });

        // text click event
        $( this.tagcloud.cloud.el ).on('click', this.tagcloud.cloud.text, e => {
            this.actionOnCloudText( e.target );
        });
    }

    /*************
     * action bit
     *************/

    actionOnRefresh() {
        this.refreshCloud();
    }

    actionOnCloudText(el) {
        var style = $(el).css('text-decoration');
        if (style != 'line-through') {
            $(el).css('text-decoration', 'line-through');
            // remove word
            this.addRemovedTag(el);
        } else {
            $(el).css('text-decoration', 'none');
            // undo removed word
            this.undoRemovedTag(el);
        }
    }

    /************
     * cloud bit
     ************/

    refreshCloud() {
        // re-setup cloud size in case any changes
        var cloudEl = this.tagcloud.cloud.el;

        var w = $(cloudEl).width(),
            h = $(cloudEl).height();

        // console.log('cloud size: '+w+', '+h);

        this.cloudImpl.setup({
            cloudEl: cloudEl,
            statusEl: this.tagcloud.cloud.status,
            width: w,
            height: h
        });

        // fetch and show words
        this.fetchTags(words => { // callback
            // clear cloud
            this.clearCloud();

            // no tag found
            if (words.length <= 0) {
                $( this.tagcloud.cloud.label ).show();
                return;
            }

            $( this.tagcloud.cloud.label ).hide();

            // get removed tags
            this.fetchRemovedTags(words, rwords => {
                // render cloud
                this.loadCloud(words, rwords);
            });
        });
    }

    clearCloud() {
        this.cloudImpl.clear();
    }

    loadCloud(words, rwords) {
        this.cloudImpl.load(words, rwords);
    }

    /***********
     * ajax bit
     ***********/

    fetchTags(callback) {
        //
        // ajax call to get tags
        //
        this.ajax_c.getTags(this.metadata.getItemId(), callback);
    }

    fetchRemovedTags(words, callback) {
        //
        // ajax call to get removed tags
        //
        this.ajax_c.getRemovedTags(this.metadata.getItemId(), callback);
    }

    addRemovedTag(el) {
        //
        // ajax call to remove word
        //
        this.ajax_c.addOrUpdateRemovedTag(
            new Tag({
                docId: this.metadata.getItemId(),
                name: $(el).text(),
                raw: -1
            }), function(resp) {
                console.log('word removed');
            }
        );
    }

    undoRemovedTag(el) {
        //
        // ajax call to undo removed word
        //
        this.ajax_c.addOrUpdateRemovedTag(
            new Tag({
                docId: this.metadata.getItemId(),
                name: $(el).text(),
                raw: 1
            }), function(resp) {
                console.log('removed word reverted');
            }
        );
    }

    /**
     *
     */

    openCloud() {
        //
        // cloudImpl width or height cannot be zero, or it causes 100% cpu usage.
        // the width (auto in css) becomes available only if the tagging panel is visible.
        // there is a racing condition. A workaround is to set timeout to 0 to make sure that
        // that width() return a valid value. it is only required for the first load of cloud.
        //
        setTimeout(e => {
            this.refreshCloud();
        }, 0);
    }

    closeCloud() {
        this.clearCloud();
    }

}
