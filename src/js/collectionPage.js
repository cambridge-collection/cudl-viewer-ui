/**
 * Filtering on a collection page. Shared by the organisation (paginated) and
 * virtual (lazily extended) layouts; each supplies its own way of reloading its
 * item list.
 */
import $ from 'jquery';

import {
    createCollectionFilter, filterParams, filterQueryString, isFiltered, readFilterState
} from './collectionFilter';

/**
 * Add the filter bar above a collection's item list.
 *
 *   before      element the filter bar is inserted before
 *   reload(params, withFacets)
 *               reload the list from its start with these filter parameters,
 *               asking for facet counts when withFacets is true
 *   path()      the URL path for the list's current position (e.g. its page)
 *
 * Returns {state(), filterParams(), onResults(data, withFacets), updateUrl()}. The list calls
 * onResults with each itemJSON response, and updateUrl when its position changes.
 */
export function initCollectionPage(context, {before, reload, path}) {
    let state = readFilterState(window.location.search);
    let unfilteredTotal = null;
    let lastTotal = null;

    const filterBox = $('<div>').insertBefore(before);
    const emptyNote = $('<p>').addClass('collection-filter-empty').hide()
        .text('No items match these filters.').insertBefore(before);

    const filter = createCollectionFilter(filterBox[0], {
        initial: state,
        onChange(newState) {
            state = newState;
            reload(filterParams(state), true);
            updateUrl();
        },
    });

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
