import assert from 'assert';

import $ from 'jquery';
import defer from 'lodash/defer';
import isFunction from 'lodash/isFunction';
import StateMachine from 'javascript-state-machine';

import CudlService from '../cudlservice';
import { ValueError, IllegalStateException } from '../util/exceptions';
import Metadata from './metadata';
import { getSimilarityIdentifier } from './similaritystrategy';


const SIMILARITY_COUNT = 10;

function makeStateMachine() {
    return StateMachine.create({
        initial: 'uninitialised',
        // - uninitialised
        // - idle
        // - loading
        events: [
            { name: 'startLoading',
              from: ['uninitialised', 'idle', 'failed', 'loading'],
              to: 'loading' },
            { name: 'finishLoading', from: 'loading', to: 'idle' },
            { name: 'fail', from: 'loading', to: 'failed' }
        ]
    });
}

export default class SimilarityModel {
    constructor(itemMetadata, cudlService, loadingModel) {
        if(!(itemMetadata instanceof Metadata))
            throw new ValueError(`itemMetadata should be a Metadata instance,` +
                                 ` got: ${itemMetadata}`);

        if(!itemMetadata.hasItemId())
            throw new ValueError(
                `itemMetadata does not have an item ID: ${itemMetadata}`);

        if(!cudlService instanceof CudlService)
            throw new ValueError(`cudlService should be a CudlService ` +
                                 `instance, got: ${cudlService}`);

        this.itemMetadata = itemMetadata;
        this.cudlService = cudlService;
        this.loadingModel = loadingModel;
        this.fsm = makeStateMachine();
        this.similarity = null;
        this.similarityPromise = null;
        this.similarityIdentifier = null;
        this.abortCurrentReq = null;

        this.fsm.onenterstate = this.onenterstate.bind(this);
    }

    onenterstate(event, from, to) {
        // Defer the event trigger to prevent errors in event handlers
        // affecting us.
        defer(() => $(this).trigger('change:state'));
    }

    /**
     * Change the model's state to represent similarity data for the specified
     * page number.
     *
     * Changing the page number may (or may not) change the similarity data as
     * more than one page can map to the same similarity id.
     */
    setPage(number) {
        assert(this.fsm.can('startLoading'));

        let simId = getSimilarityIdentifier(this.itemMetadata, number);

        if(simId === this.similarityIdentifier &&
            (this.fsm.is('idle') || this.fsm.is('loading')))
            return;

        this.loadSimilarity(simId);
    }

    loadSimilarity(simId) {
        assert(this.fsm.can('startLoading'));

        if(this.fsm.is('loading')) {
            assert(isFunction(this.abortCurrentReq));
            this.abortCurrentReq();
            this.abortCurrentReq = null;
        }

        this.fsm.startLoading();

        let {similarity: similarityPromise, abort} = this.cudlService
            .getSimilarItems({
                itemId: this.itemMetadata.getItemId(),
                similarityId: simId,
                embedMeta: 'partial',
                count: SIMILARITY_COUNT
            });
        let loadingToken = this.loadingModel.startLoading();

        this.similarityIdentifier = simId;
        this.similarityPromise = similarityPromise;
        this.similarity = null;
        this.abortCurrentReq = abort;

        // Defer to avoid unrelated errors in code listening for state change
        // failing our promise.
        similarityPromise.then((similarity) => {
            if(this.similarityPromise === similarityPromise) {
                this.similarity = similarity;
                assert(this.fsm.is('loading'));
                this.fsm.finishLoading();
            }
            // Defer marking loading as finished to allow those dependant on our
            // defered event triggers to start loading before we stop.
            defer(() => loadingToken.markStopped());
        }).fail(() => {
            if(this.similarityPromise === similarityPromise) {
                assert(this.fsm.is('loading'));
                this.fsm.fail();
            }
            defer(() => loadingToken.markStopped());
        }).done();
    }

    /**
     * Get a promise of the similarity data for the current page.
     */
    getSimilarity() {
        if(!(this.fsm.is('idle') || this.fsm.is('loading')))
            throw new IllegalStateException(util.format(
                'getSimilarity() can only be called from the idle or loading' +
                ' state. state: %s', this.getState()));

        assert(this.similarity !== null);
        return this.similarity;
    }

    getState() {
        return this.fsm.current;
    }
}
