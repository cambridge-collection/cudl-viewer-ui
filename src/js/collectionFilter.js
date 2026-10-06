/**
 * Filter bar for a collection page's item list: free text, facet dropdowns
 * (only for facets that can narrow this collection) and a count of matching items.
 *
 * Filter state lives in the page URL (?q=…&facets=Name::value||…)
 * so a filtered view can be bookmarked and shared.
 */
import $ from 'jquery';

import '../css/collection-filter.css';

// Facets the bar can show, in order, with their labels
const FACETS = [
    {name: 'Date', label: 'Date', all: 'All dates'},
    {name: 'Subject', label: 'Subject', all: 'All subjects'},
    {name: 'Languages', label: 'Language', all: 'All languages'},
];
// Pause in typing before the list is filtered
const TEXT_DELAY_MS = 350;

function formatCount(n) {
    return Number(n).toLocaleString('en-GB');
}

function facetsToString(facets) {
    return Object.keys(facets)
        .filter((name) => facets[name])
        .map((name) => name + '::' + facets[name])
        .join('||');
}

/** Filter state from a URL query string. */
export function readFilterState(search) {
    const params = new URLSearchParams(search);
    const facets = {};
    (params.get('facets') || '').split('||').forEach((pair) => {
        const i = pair.indexOf('::');
        if (i > 0 && pair.length > i + 2) {
            facets[pair.slice(0, i)] = pair.slice(i + 2);
        }
    });
    return {
        q: params.get('q') || '',
        facets,
    };
}

/** The item-list request parameters for a filter state. */
export function filterParams(state) {
    const params = {};
    if (state.q) { params.q = state.q; }
    const facets = facetsToString(state.facets);
    if (facets) { params.facets = facets; }
    return params;
}

export function isFiltered(state) {
    return Object.keys(filterParams(state)).length > 0;
}

/** The URL query string for a filter state, or ''. */
export function filterQueryString(state) {
    const query = new URLSearchParams(filterParams(state)).toString();
    return query ? '?' + query : '';
}

function copyState(state) {
    return Object.assign({}, state, {facets: Object.assign({}, state.facets)});
}

/**
 * Render the filter bar into container.
 *
 * onChange(state) is called after any change.
 */
export function createCollectionFilter(container, {initial, onChange}) {
    let state = copyState(initial);
    let textTimer = null;
    let lastFacets = [];
    let lastResults = null;

    const input = $('<input type="search">')
        .attr({id: 'collection-filter-text', placeholder: 'Filter this collection', autocomplete: 'off'})
        .val(state.q);
    const form = $('<form>')
        .addClass('collection-filter-text')
        .attr('role', 'search')
        .append(
            $('<label>').addClass('visually-hidden').attr('for', 'collection-filter-text')
                .text('Filter this collection'),
            input)
        .on('submit', (e) => {
            e.preventDefault();
            setText(input.val());
        });
    input.on('input', () => {
        clearTimeout(textTimer);
        textTimer = setTimeout(() => setText(input.val()), TEXT_DELAY_MS);
    });

    const facetsBox = $('<div>').addClass('collection-filter-facets');
    const status = $('<div>').addClass('collection-filter-status').attr({role: 'status', 'aria-live': 'polite'});

    $(container)
        .addClass('collection-filter')
        .empty()
        .append(form, facetsBox, status);

    function changed() {
        onChange(copyState(state));
    }

    function setText(text) {
        clearTimeout(textTimer);
        const q = (text || '').trim();
        if (q === state.q) { return; }
        state.q = q;
        changed();
    }

    function clearFilters() {
        clearTimeout(textTimer);
        input.val('');
        state = {q: '', facets: {}};
        changed();
    }

    function renderFacets() {
        facetsBox.empty();
        FACETS.forEach((def) => {
            const facet = lastFacets.find((f) => f.name === def.name);
            const selected = state.facets[def.name] || '';
            if (!facet && !selected) { return; }
            const values = (facet && facet.values) || [];
            const id = 'collection-filter-' + def.name.toLowerCase();
            const select = $('<select>').attr('id', id)
                .append($('<option value="">').text(def.all))
                .append(values.map((v) => $('<option>').val(v.value)
                    .text(v.value + ' (' + formatCount(v.count) + ')')));
            if (selected && !values.some((v) => v.value === selected)) {
                select.append($('<option>').val(selected).text(selected));
            }
            select.val(selected).on('change', () => {
                if (select.val()) {
                    state.facets[def.name] = select.val();
                } else {
                    delete state.facets[def.name];
                }
                changed();
            });
            facetsBox.append($('<div>').addClass('collection-filter-facet').append(
                $('<label>').attr('for', id).text(def.label), select));
        });
    }

    function renderStatus() {
        status.empty();
        if (!lastResults) { return; }
        const {total, unfilteredTotal} = lastResults;
        if (!isFiltered(state)) {
            status.text(formatCount(total) + (total === 1 ? ' item' : ' items'));
            return;
        }
        status.append(
            unfilteredTotal != null
                ? 'Showing ' + formatCount(total) + ' of ' + formatCount(unfilteredTotal) + ' items'
                : formatCount(total) + (total === 1 ? ' item matches' : ' items match'),
            ' · ',
            $('<button type="button">').addClass('collection-filter-clear').text('Clear filters')
                .on('click', clearFilters));
    }

    return {
        getState: () => copyState(state),
        /** Show the result count, and the facet choices from a response that has them. */
        showResults({total, unfilteredTotal, facets}) {
            if (facets) {
                lastFacets = facets;
                renderFacets();
            }
            lastResults = {total, unfilteredTotal};
            renderStatus();
        },
    };
}
