import util from 'util';

import isObject from 'lodash/isObject';
import concat from 'lodash/fp/concat';

import { ValueError } from '../util/exceptions';

/**
 * Metadata wraps cudl JSON metadata objects to provide accessor methods and
 * error handling.
 */
export default class Metadata {
    constructor(metadata, itemId) {
        if(!isObject(metadata))
            throw new ValueError(util.format('metadata must be an object, got: %s', metadata))
        this.metadata = metadata;
        this.itemId = itemId;
    }

    /** @return true if the classmark/file ID of this metadata is known. */
    hasItemId() {
        return this.itemId !== undefined;
    }

    /** Get the classmark/file ID of this metadata item. */
    getItemId() {
        return this.itemId;
    }

    /**
     * Enumerate the logical structures as flat sequence.
     */
     getFlattenedLogicalStructures() {
        // Even though we have es6 generators, not much supports them, so we
        // kinda have to use arrays....
        let entries = [];
        for(let entry of this._getFlattenedLogicalStructures(
            this.metadata.logicalStructures, [])) {
            entries.push(entry);
        }
        return entries;
     }

    *_getFlattenedLogicalStructures(children, parents) {
        for(let structure of children) {
            yield [structure, parents];

            if(structure.children && structure.children.length) {
                for(let subStructure of this._getFlattenedLogicalStructures(
                        structure.children, concat(parents, [structure]))) {
                    yield subStructure;
                }
            }
        }
    }

    get pages() {
        return this.metadata.pages
    }
}
