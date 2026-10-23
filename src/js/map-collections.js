// Collections whose items can be shown on a map, shared by the search results
// page and the collection pages.
//
// The viewer sets these from "map" in cudl.ui.json5 and passes them in the page
// context as mapCollections, keyed by collection title: {collapsed}. A
// Collection facet path ("Parent::Child") is matched by its last segment. The
// search results page lists every map collection; a collection page lists only
// its own collection, if it has a map.
import { getPageContext } from './context';

export const FACET_PATH_SEPARATOR = '::';

function mapCollections() {
    return getPageContext().mapCollections || {};
}

/** The map collection for this collection title or facet path ("Parent::Child"), or undefined. */
export function mapCollection(name) {
    const collections = mapCollections();
    const title = typeof name === 'string' ? name.split(FACET_PATH_SEPARATOR).pop() : name;
    return Object.prototype.hasOwnProperty.call(collections, title)
        ? collections[title] : undefined;
}

/**
 * Whether a map collection's map starts closed, because many of its items have
 * no location.
 */
export function isPartialMapCollection(collection) {
    return !!collection && !!collection.collapsed;
}
