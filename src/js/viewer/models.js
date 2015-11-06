import assign from 'lodash/object/assign';
import isObject from 'lodash/lang/isObject';

import { Model } from '../models';
import { ValueError } from '../exceptions';


export class ViewerModel extends Model {
    static get DEFAULT_OPTIONS() {
        return {
            pageNumber: 1
        }
    }

    constructor(options) {
        super();
        let {pageNumber, metadata, taggingEnabled} = assign({}, options,
                                        this.constructor.DEFAULT_OPTIONS);

        this.validatePageNumber(pageNumber);
        this.validateMetadata(metadata);

        this.pageNumber = pageNumber;
        this.metadata = metadata;
        this.taggingEnabled = !!taggingEnabled;
    }

    getPageNumber() {
        return this.pageNumber;
    }

    validatePageNumber(pageNumber) {
        if(!Number.isInteger(pageNumber))
            throw new ValueError(
                `pageNumber was not an integer: ${pageNumber}`);
    }

    validateMetadata(metadata) {
        if(!isObject(metadata))
            throw new ValueError(`metadata was not an Object: ${metadata}`);
    }

    setPageNumber(pageNumber) {
        if(this.pageNumber === pageNumber)
            return;
        this.validatePageNumber(pageNumber);

        this.pageNumber = pageNumber;
        this.events.emit('change:pageNumber');
    }

    getMetadata() {
        return this.metadata;
    }

    isTaggingEnabled() {
        return this.taggingEnabled;
    }
}
