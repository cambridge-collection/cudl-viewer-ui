/**
 * Filtering, and a map view for map collections, on a collection page. Shared
 * by the organisation (paginated) and virtual (lazily extended) layouts; each
 * supplies its own way of reloading its item list.
 */
import $ from 'jquery';

import {
    createCollectionFilter, filterParams, filterQueryString, isFiltered, readFilterState
} from './collectionFilter';
import { createCollectionMap } from './collectionMap';
import { escapeHtml } from './html';
import { mapCollection } from './map-collections';
import { hasLocation } from './search-map';

/**
 * HTML for an item tile's map control on a map collection: a "Show on map"
 * button when the item has a location, otherwise a note saying it has none.
 * Empty for other collections.
 */
export function mapControlHtml(item, collectionTitle) {
    if (!mapCollection(collectionTitle)) { return ''; }
    if (hasLocation(item)) {
        return '<button type="button" class="collection-show-on-map" data-item-id="' +
            escapeHtml(item.id) + '">Show on map</button>';
    }
    return '<div class="collection-not-on-map" title="This item has no location recorded in its catalogue entry">' +
        'Not on map · no location recorded</div>';
}

/**
 * Add the filter bar (and map view) above a collection's item list.
 *
 *   before      element the filter bar and map are inserted before
 *   listView    selector for the elements that make up the list (hidden in map
 *               view); looked up each time, as lists replace some of them
 *   reload(params, withFacets)
 *               reload the list from its start with these filter parameters,
 *               asking for facet counts when withFacets is true
 *   path()      the URL path for the list's current position (e.g. its page)
 *
 * Returns {state(), onResults(data, withFacets), updateUrl()}. The list calls
 * onResults with each itemJSON response, and updateUrl when its position changes.
 */
export function initCollectionPage(context, {before, listView, reload, path}) {
    const collectionTitle = context.collectionTitle;
    const collection = mapCollection(collectionTitle);
    let state = readFilterState(window.location.search);
    if (!collection) { state.view = 'list'; }
    let unfilteredTotal = null;
    let lastTotal = null;

    const filterBox = $('<div>').insertBefore(before);
    const mapBox = $('<div>').addClass('collection-map').hide().insertBefore(before);
    const emptyNote = $('<p>').addClass('collection-filter-empty').hide()
        .text('No items match these filters.').insertBefore(before);

    const filter = createCollectionFilter(filterBox[0], {
        initial: state,
        mapAvailable: !!collection,
        onChange(newState, {viewOnly}) {
            state = newState;
            applyView();
            if (!viewOnly) {
                reload(filterParams(state), true);
            }
            updateUrl();
        },
    });

    const mapView = collection ? createCollectionMap(mapBox[0], {
        collectionTitle,
        collection,
        onSearchArea: (bbox) => filter.setBbox(bbox),
        onClearArea: () => filter.setBbox(''),
    }) : null;

    function applyView() {
        const map = state.view === 'map';
        $(listView).toggle(!map);
        mapBox.toggle(map);
        if (map) { mapView.load(state); }
    }

    function updateUrl() {
        if (window.history.replaceState) {
            window.history.replaceState(null, document.title, path() + filterQueryString(state));
        }
    }

    // A filtered page can't tell the collection's size from its own results
    if (isFiltered(state)) {
        $.getJSON(context.collectionUrl + '/itemJSON', {start: 0, end: 8}).done((data) => {
            unfilteredTotal = data.total;
            if (lastTotal !== null) {
                filter.showResults({total: lastTotal, unfilteredTotal});
            }
        });
    }

    $(document).on('click', '.collection-show-on-map', function() {
        const itemId = $(this).attr('data-item-id');
        filter.setView('map');
        mapBox[0].scrollIntoView({behavior: 'smooth', block: 'nearest'});
        mapView.highlight(itemId, state);
    });

    applyView();

    return {
        state: () => state,
        filterParams: () => filterParams(state),
        updateUrl,
        onResults(data, withFacets) {
            if (!isFiltered(state)) { unfilteredTotal = data.total; }
            lastTotal = data.total;
            emptyNote.toggle(data.total === 0 && isFiltered(state));
            filter.showResults({
                total: data.total,
                unfilteredTotal,
                facets: withFacets ? (data.facets || []) : undefined,
            });
        },
    };
}
