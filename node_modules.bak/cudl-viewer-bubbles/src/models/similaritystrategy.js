import pipe from 'lodash/fp/pipe';
import map from 'lodash/fp/map';
import filter from 'lodash/fp/filter';
import orderBy from 'lodash/fp/orderBy';
import first from 'lodash/fp/first';
import range from 'lodash/fp/range';
import zip from 'lodash/fp/zip';

import { ValueError } from '../util/exceptions';


/**
 * Get the similarity identifier for the specified page in an item's metadata.
 *
 * This implementation is based on identifying the logical structure with the
 * smallest range (end - start) that includes the specified page. Ties are
 * broken firstly by depth (deepest wins) and secondarilly by structure
 * position (earlier wins).
 *
 * @param page The 0-based page index
 */
export function getSimilarityIdentifier(metadata, page) {
    if(page < 0 || page >= metadata.pages.length)
        throw new ValueError(`page number out of range. pages: ` +
                             `${metadata.pages.length}, page: ${page}`);

    // Use 1-based indexing for page numbers
    let p = page + 1;

    // Note that some items have odd logical structure metadata:
    // end postion before start position and children with wider start/end range
    // then their parents. If/when that gets fixed we can binary search here,
    // but for robustness I'm just scanning the whole structure tree (which is
    // a few hundred nodes at most).

    let id = pipe(
        // Add the depth and position of the structure node
        map(([i, [structure, parents]]) => [structure, parents.length, i]),
        // Some logical structures have broken start/end positions
        // (end < start). Ignore these.
        filter(([struc,,]) => struc.startPagePosition <= struc.endPagePosition),
        // Exclude structures which our page isn't in
        filter(([struc,,]) => struc.startPagePosition <= p &&
                              struc.endPagePosition >= p),
        orderBy([
            ([struc,,]) => struc.endPagePosition - struc.startPagePosition,
            ([,depth]) => depth,
            ([,,position]) => position],
            ['asc', 'desc', 'asc']),
        map(([,,position]) => position),
        first
    )(enumerate(metadata.getFlattenedLogicalStructures()));

    if(id == undefined) {
        throw new ValueError(
            'metadata contained no valid logical structure nodes');
    }

    return String(id);
}

function enumerate(items) {
    return zip(range(0, items.length), items);
}
