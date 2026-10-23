/**
 * Map view for a collection page: every item in the (filtered) collection that
 * has a location, drawn with the search page's map. Locations come from the
 * search page's /search/locationsJSON, scoped to the collection.
 */
import $ from 'jquery';

import { createSearchMap } from './search-map';
import { isPartialMapCollection } from './map-collections';

/** Search parameters for the collection's locations under a filter state. */
function locationParams(collectionTitle, state) {
    const facets = ['Collection::' + collectionTitle].concat(
        Object.keys(state.facets).filter((name) => state.facets[name])
            .map((name) => name + '::' + state.facets[name]));
    const params = {facets: facets.join('||')};
    if (state.q) { params.keyword = state.q; }
    if (state.bbox) { params.bbox = state.bbox; }
    return params;
}

/**
 * onSearchArea(bbox) and onClearArea() are called when the user restricts the
 * collection to the visible map area, or removes that restriction.
 */
export function createCollectionMap(container, {collectionTitle, collection, onSearchArea, onClearArea}) {
    let searchMap = null;
    let loadedKey = null;
    let xhr = null;
    let pendingHighlight = null;

    const note = isPartialMapCollection(collection)
        ? 'Many items in this collection have no recorded location, so are not on the map'
        : '';

    function ensureMap() {
        if (!searchMap) {
            searchMap = createSearchMap(container, {
                onSearchArea,
                onClearArea,
                searchAreaLabel: 'Filter to this area',
                clearAreaLabel: 'Clear map area',
            });
        }
    }

    function isLoaded(state) {
        return loadedKey === JSON.stringify(locationParams(collectionTitle, state)) && !xhr;
    }

    /** Fetch and draw the locations for state, unless they are already shown. */
    function load(state) {
        ensureMap();
        const params = locationParams(collectionTitle, state);
        const key = JSON.stringify(params);
        if (key === loadedKey) { return; }
        if (xhr) { xhr.abort(); }
        loadedKey = key;

        const request = xhr = $.getJSON('/search/locationsJSON', params)
            .always(() => {
                if (xhr === request) { xhr = null; }
            })
            .done((data) => {
                const results = data.locations.map((location) => ({
                    item: {id: location.id, title: location.title},
                    startPage: location.startPage,
                    coverage: location.coverage,
                    origin: location.origin,
                }));
                searchMap.update(results, state.bbox,
                    data.error ? 'Locations could not be loaded.' : note);
                if (pendingHighlight) {
                    searchMap.highlight(pendingHighlight);
                    pendingHighlight = null;
                }
            })
            .fail((jqXhr, textStatus) => {
                if (textStatus !== 'abort') {
                    loadedKey = null;
                    searchMap.update([], state.bbox, 'Locations could not be loaded.');
                }
            });
    }

    return {
        load,
        /** Zoom to and highlight an item, once the map for state has loaded. */
        highlight(itemId, state) {
            if (isLoaded(state)) {
                searchMap.highlight(itemId);
            } else {
                pendingHighlight = itemId;
                load(state);
            }
        },
    };
}
