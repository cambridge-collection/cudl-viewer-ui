/**
 * Filter bar for a collection page's item list: free text, facet dropdowns
 * (only for facets that can narrow this collection), a count of matching items,
 * and a List | Map switch for collections with a map.
 *
 * Filter state lives in the page URL (?q=…&facets=Name::value||…&bbox=…&view=map)
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
        bbox: params.get('bbox') || '',
        view: params.get('view') === 'map' ? 'map' : 'list',
    };
}

/** The item-list request parameters for a filter state (no view). */
export function filterParams(state) {
    const params = {};
    if (state.q) { params.q = state.q; }
    const facets = facetsToString(state.facets);
    if (facets) { params.facets = facets; }
    if (state.bbox) { params.bbox = state.bbox; }
    return params;
}

export function isFiltered(state) {
    return Object.keys(filterParams(state)).length > 0;
}

/** The URL query string for a filter state, including the view, or ''. */
export function filterQueryString(state) {
    const params = new URLSearchParams(filterParams(state));
    if (state.view === 'map') { params.set('view', 'map'); }
    const query = params.toString();
    return query ? '?' + query : '';
}

function copyState(state) {
    return Object.assign({}, state, {facets: Object.assign({}, state.facets)});
}

/**
 * Render the filter bar into container.
 *
 * onChange(state, {viewOnly}) is called after any change; viewOnly is true when
 * only the List | Map choice changed, so the list need not be reloaded.
 */
export function createCollectionFilter(container, {initial, mapAvailable, onChange}) {
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

    const viewSwitch = $('<div>')
        .addClass('collection-filter-views')
        .attr({role: 'group', 'aria-label': 'Show items as'});
    const viewButtons = ['list', 'map'].map((view) => $('<button type="button">')
        .attr('data-view', view)
        .text(view === 'list' ? 'List' : 'Map')
        .on('click', () => setView(view)));
    viewSwitch.append(viewButtons);

    $(container)
        .addClass('collection-filter')
        .empty()
        .append(form, facetsBox, mapAvailable ? viewSwitch : '', status);

    function changed(viewOnly) {
        onChange(copyState(state), {viewOnly});
    }

    function setText(text) {
        clearTimeout(textTimer);
        const q = (text || '').trim();
        if (q === state.q) { return; }
        state.q = q;
        changed(false);
    }

    function clearFilters() {
        clearTimeout(textTimer);
        input.val('');
        state = Object.assign(copyState(state), {q: '', facets: {}, bbox: ''});
        changed(false);
    }

    function setView(view) {
        if (view === state.view) { return; }
        state.view = view;
        renderViewSwitch();
        changed(true);
    }

    function renderViewSwitch() {
        viewButtons.forEach((button) => {
            const active = button.attr('data-view') === state.view;
            button.attr('aria-pressed', String(active)).toggleClass('active', active);
        });
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
                changed(false);
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
            state.bbox ? $('<span>').addClass('collection-filter-area').append(
                ' within map area ',
                $('<button type="button">').addClass('collection-filter-remove')
                    .attr('aria-label', 'Remove map area').text('✕')
                    .on('click', () => setBbox(''))) : '',
            ' · ',
            $('<button type="button">').addClass('collection-filter-clear').text('Clear filters')
                .on('click', clearFilters));
    }

    function setBbox(bbox) {
        if ((bbox || '') === state.bbox) { return; }
        state.bbox = bbox || '';
        changed(false);
    }

    renderViewSwitch();

    return {
        getState: () => copyState(state),
        setView,
        setBbox,
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
