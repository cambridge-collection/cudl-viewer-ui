// Bootstrap styles

import '../../css/advancedsearch.css';

import $ from 'jquery';
import defer from 'lodash/defer';
import {Spinner} from 'spin.js';
import 'bootstrap-slider';

import '../base.js';
import { unreleasedBadge } from '../itemStatus';
import 'paginationjs';
import {toggleDiv} from "../cudl";
import {createSearchMap, hasLocation} from '../search-map';
import {mapCollection, isPartialMapCollection} from '../map-collections';

function styleSnippet(s) {
    s = s.replace(/(^[^<>]+>|<[^>]+$)/g, "");
    return s;
}


function objAddKeyValuePair(obj, pair) {
    obj[pair[0]] = pair[1];
    return obj;
}

function unionKeys(objA, objB) {
    return Object.keys(
        Object.keys(objA).concat(Object.keys(objB))
            .reduce(function(unique, k) {
                unique[k] = undefined;
                return unique;
            }, {}));
}

/** The advanced search form submits FacetCollection=, not facetCollection=. */
function canonicaliseParamName(k) {
    return k.replace(/^Facet/, 'facet');
}

function parseQuery(q) {

    var keyValuePairs =  q.replace(/^\?/, '')
        .split('&')
        .map(function(s) {
            var i = s.indexOf('=');
            return i == -1 ? [canonicaliseParamName(_decodeURIComponent(s)), '']
                           : [canonicaliseParamName(_decodeURIComponent(s.substr(0, i))),
                              _decodeURIComponent(s.substr(i + 1))];
        })
        .reduce(objAddKeyValuePair, {});

    // Split facets param into separate key values
    if ("facets" in keyValuePairs) {
        var facets = keyValuePairs.facets
            .split('||')
            .map(function (s) {
                var i = s.indexOf('::');
                return i == -1 ? [_decodeURIComponent("facet"+s), '']
                    : [_decodeURIComponent("facet"+s.substr(0, i)),
                        _decodeURIComponent(s.substr(i + 2))];
            })
            .reduce(objAddKeyValuePair, {});

        delete keyValuePairs.facets;
    }
    return {...keyValuePairs, ...facets};

}

/** As decodeURIComponent() but interprets + as space. */
function _decodeURIComponent(s) {
    return decodeURIComponent(s.replace(/\+/g, ' '))
}

function serialiseQuery(params) {
    var keys = Object.keys(params);
    keys.sort();

    return serialiseQueryPairs(
            keys.map(function(k) { return [k, params[k]]; }));
}

function serialiseQueryPairs(keyValuePairs) {

    var facet_strings = [];
    var encodedKVP = [];

    for(var i = 0; i < keyValuePairs.length; i++){
        var entry = keyValuePairs[i];
        var k = entry[0];
        var v= entry[1];
        // The form always submits its collection dropdown, and facets=Collection::
        // is not parseable.
        if (k.startsWith("facet") && k !== "facets") {
            k = k.substring(5); // strip out word 'facet'
            if (v) {
                facet_strings.push(k+"::"+v);
            }
        } else if (k=="facets") {
            if (v) {
                facet_strings.push(v);
            }
        } else {
            encodedKVP.push([k,v]);
        }
    }
    if (facet_strings.length>0) {
        encodedKVP.push(["facets",facet_strings.join('||')]);
    }

    return '?' + encodedKVP
        .map(function(kvp) {
            return encodeURIComponent(kvp[0]) + '=' + encodeURIComponent(kvp[1]);
        })
        .join('&');
}

/** Get the values that are not the same in a and b. */
function diffState(a, b) {
    return unionKeys(a, b)
        .filter(function(key) {
            return a.hasOwnProperty(key) !== b.hasOwnProperty(key) ||
                a[key] !== b[key];
        })
        .map(function(key) {
            var diff = {};

            if(a.hasOwnProperty(key))
                diff.left = a[key];
            if(b.hasOwnProperty(key))
                diff.right = b[key];

            return [key, diff];
        })
        .reduce(objAddKeyValuePair, {});
}

function getSearchQueryString(state) {

    var page = parseInt(state.page);

    // The search endpoint uses start and end rather than page.
    var queryParams = Object.assign({}, state, {
        start: (page - 1) * pageLimit,
        end: page * pageLimit
    });
    delete queryParams.page;
    delete queryParams.tagging;

    return serialiseQuery(queryParams);
}


function setupFacets(init) {

    $('[id^="facetToggle"]').click(function (el) {

        // Add click to facet icon and name
        toggleFacet(this);
    });

}

function toggleFacet(linkEl) {

    const panelEl = $("#div"+linkEl.id);

    // First switch the icons
    if (linkEl.innerHTML) {
        // Setup icon
        if (panelEl.hasClass('show')) {
            linkEl.innerHTML = linkEl.innerHTML.replace("▾", "▸");
        } else {
            linkEl.innerHTML = linkEl.innerHTML.replace("▸", "▾");
        }
    }

    // The toggle collapse
    panelEl.collapse('toggle');
}

/**
 * Prevent breaks inside text at spaces by replacing spaces with
 * non-breaking spaces.
 */
function noBreak(text) {
    return text.replace(/ /g, "\u00A0");
}

function renderResult(result) {
    var item = result.item || {};
    var imageStyle = {};
    var title = item.title;
    if (result.itemType === "essay") {
        title = "Essay: "
                + title;
    }

    var mainDisplayIcon =  "";

    if ("rti"===item.mainDisplay) {
        mainDisplayIcon = $("<span>")
            .addClass("search_collections_carousel-lightbulb-icon")
            .append(
                $("<img>")
                    .attr({
                        src: "/document-views/rti/rti-light-bulb.png",
                        alt: "RTI Item",
                        height: "30px"
                    })
            );
    }

    var itemDiv = $("<div>")
        .attr("class", "collections_carousel_item")
        .append(
            $("<div>")
                .addClass("collections_carousel_image_box col-md-4")
                .css("position", "relative")
                .append(
                    $("<div>")
                        .addClass("collections_carousel_image")
                        .append(
                            $("<a>")
                                .attr("href", "/view/" + encodeURIComponent(item.id) + "/" + encodeURIComponent(result.startPage))
                                .append(
                                    $("<img>")
                                        .attr({
                                            src: result.pageThumbnailURL,
                                            alt: item.id
                                        }).css(imageStyle)
                                )
                        )
                )
                .append(mainDisplayIcon)
                .append(unreleasedBadge(item, {overlay: true})),
            $("<div>")
                .addClass("collections_carousel_text col-md-8")
                .append(
                    // Titles, shelf locators and abstracts carry TEI markup (<i>,
                    // <br/>) that nothing strips, so they go in as HTML: jQuery
                    // parses appended strings, unlike text nodes.
                    $("<h3>")
                        .append(
                            $("<a>")
                                .attr("href", "/view/" + encodeURIComponent(item.id) + "/" + encodeURIComponent(result.startPage))
                                .append(title),
                            $("<span>")
                                .css({
                                    color: "#999",
                                    "font-weight": "normal",
                                    "font-size": "14px"
                                })
                                .append(
                                    " (",
                                    $("<span>")
                                        .attr("title", "Shelf locator")
                                        .append(noBreak(item.shelfLocator || '')),
                                    item.shelfLocator ? " " : "",
                                    "Page: ", result.startPageLabel || '', ")"
                                )
                        ),
                    renderShowOnMapButton(result),
                    item.abstractShort ? $("<div>").html(item.abstractShort) : "",
                    $("<ul class=\"snippets\">")
                        .append(
                            result.snippets.filter(Boolean).map(function(snippet) {
                                return $("<li class=\"snippet\">")
                                    .append(
                                        $("<span>").html(styleSnippet(snippet))
                                    )[0];
                            })
                        )
                ),
            $("<div>").addClass("clear")
        );

    return itemDiv[0];
}

/**
 * When the map is shown: a "Show on map" button for results with a location,
 * and a note for those without one, so their absence from the map is explained.
 */
function renderShowOnMapButton(result) {
    if(!shouldShowMap(currentState))
        return "";

    if(!hasLocation(result)) {
        return $('<div>')
            .addClass('search-map-not-shown')
            .attr('title', 'This item has no location recorded in its catalogue entry')
            .text('Not on map · no location recorded');
    }

    var itemId = (result.item || {}).id;
    return $('<button type="button">')
        .addClass('search-map-show-button')
        .text('Show on map')
        .on('click', function() { showOnMap(itemId); });
}

function showOnMap(itemId) {
    var panel = document.getElementById('search-map-panel');
    if(!panel)
        return;

    if(isMapLoaded() && !searchMap.hasItem(itemId))
        return;

    if(mapCollapsed) {
        mapCollapsedChoice = false;
        setMapCollapsed(false);
    }

    var rect = panel.getBoundingClientRect();
    if(rect.top < 0 || rect.bottom > window.innerHeight)
        panel.scrollIntoView({behavior: 'smooth', block: 'nearest'});

    // Highlight now, or once the locations being loaded arrive
    if(isMapLoaded())
        searchMap.highlight(itemId);
    else
        pendingHighlight = itemId;
}

function renderResults(results) {
    return results.map(renderResult);
}

function pad(s, len, char) {
    return Array(Math.max(0, len - s.length) + 1).join(char) + s;
}

function formatNumber(n) {
    var negative = n < 0;
    n = Math.abs(n);
    var fraction = n - Math.floor(n);
    n = Math.floor(n);
    var result = [];

    while(true) {
        if(n < 1000) {
            result.unshift(n);
            break;
        }

        result.unshift(pad('' + (n - (Math.floor(n / 1000) * 1000)), 3, '0'));
        n = Math.floor(n / 1000)
    }

    return (negative ? '-' : '') + result.join(',') + ('' + fraction).substr(1);
}
window.formatNumber = formatNumber;

function renderResultInfo(count, time) {
    return [
        document.createTextNode('About ' + formatNumber(count) + ' results ('),
        $('<span>')
            .attr('id', 'reqtime')
            .text(time / 1000 + ' seconds')[0],
        document.createTextNode(')')
    ];
}

function getFacetParam(facetField) {
    return 'facet'+facetField.substr(0, 1).toUpperCase()
            + facetField.substr(1);
}

function renderFacet(state, group, facet) {
    var facetState = Object.assign({}, state, {page: 1});
    facetState[getFacetParam(group.field)] = facet.value;

    var url = serialiseQuery(facetState);

    return $('<li>')
        .append(
            $('<a>')
                .attr('href', url)
                .data('state', facetState)
                .text(facet.value),
            document.createTextNode(' (' + facet.occurrences + ')'),
            group.field === 'Collection' && mapCollection(facet.value)
                ? renderMapCollectionIcon(mapCollection(facet.value)) : ''
        )[0];
}

// A folded map, drawn inline so the page needs no icon font
const MAP_ICON_SVG =
    '<svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true" focusable="false">' +
    '<path d="M1 3.5 5.5 2l5 1.5L15 2v10.5L10.5 14l-5-1.5L1 14z M5.5 2v10.5 M10.5 3.5V14" ' +
    'fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>';

/** Marks a collection facet whose results can be shown on the map. */
function renderMapCollectionIcon(collection) {
    return $('<span>')
        .addClass('search-map-collection-icon')
        .attr('title', isPartialMapCollection(collection)
            ? 'Some results can be shown on a map' : 'Results can be shown on a map')
        .append(MAP_ICON_SVG, $('<span>').addClass('visually-hidden').text('(map available)'));
}

/**
 * Transforms the Uppercase_Undercored_Version of the facet name into
 * something suitable for display
 * @param facetName
 */
function renderFacetName(facetName) {
    var displayFacetName =  facetName.toLowerCase().replaceAll("_", " ");
    return displayFacetName.charAt(0).toUpperCase() + displayFacetName.slice(1);
}

function renderFacetList(state, facetGroup) {
    return $('<ul>')
        .addClass('campl-unstyled-list')
        .append(
            facetGroup.facets.map(renderFacet.bind(undefined, state, facetGroup))
        );
}

function renderFacetTree(state, facets) {
    const tree =  $(facets.map(function(facetGroup) {
        return $('<li>')
            .append(
                $('<strong>')
                    .append(
                        $('<div>')
                            .attr("id", "facetToggle"+facetGroup.label)
                            .attr("data-toggle", "collapse")
                            .append(
                                $('<span>').html('▸ '),
                                document.createTextNode(renderFacetName(facetGroup.label))
                            ),
                    ),
                $('<div>')
                    .attr("id", "divfacetToggle"+facetGroup.label)
                    .addClass("collapse")
                    .append(
                        renderFacetList(state, facetGroup),
                        facetGroup.hasMore ? renderMoreFacetButton(state, facetGroup) : undefined
                    ),
            )[0];
    }));

    return tree;
}

function renderMoreFacetButton(state, facetGroup) {
    return $('<div>')
        .addClass('search-facet-expansion')
        .append(
            $('<button>')
                .attr('type', 'button')
                .addClass('search-facet-more')
                .attr('aria-expanded', 'false')
                .data({state: state, field: facetGroup.field, shown: facetGroup.facets.length})
                .text('more')
        );
}

function setFacetButtonExpanded(button, expanded) {
    button.attr('aria-expanded', String(expanded)).text(expanded ? 'less' : 'more');
}

function keepInPlace(el, viewportTop) {
    window.scrollBy({top: el.getBoundingClientRect().top - viewportTop, behavior: 'instant'});
}

function focusFirstRevealedFacet(list, shown, buttonTop) {
    const link = list.children('li').eq(shown).children('a')[0];
    if (!link)
        return;

    link.classList.add('search-facet-revealed');
    link.focus({preventScroll: true});
    keepInPlace(link, buttonTop);
}

/**
 * The first "more" fetches the group's full list. After that, "less" and
 * "more" only hide and show the values after those first shown.
 */
function toggleMoreFacets(button) {
    const list = button.closest('.collapse').children('ul');
    const values = list.children('li');
    const shown = button.data('shown');
    const buttonTop = button[0].getBoundingClientRect().top;

    if (button.attr('aria-expanded') === 'true') {
        values.slice(shown).prop('hidden', true);
        setFacetButtonExpanded(button, false);
        button[0].focus({preventScroll: true});
        keepInPlace(button[0], buttonTop);
    }
    else if (values.length > shown) {
        values.prop('hidden', false);
        setFacetButtonExpanded(button, true);
        focusFirstRevealedFacet(list, shown, buttonTop);
    }
    else {
        loadAllFacetValues(button, list);
    }
}

function loadAllFacetValues(button, list) {
    const state = button.data('state');
    const field = button.data('field');
    const treeVersion = facetTreeVersion;

    button.prop('disabled', true);

    $.ajax({
        "url": '/search/JSONFacets' +
            getSearchQueryString(Object.assign({}, state, {expandFacet: field}))
    })
    .done(function(data) {
        if (treeVersion !== facetTreeVersion)
            return;

        // Not isFailedResponse(): showSearchError() would empty the results
        const group = !data.info.error &&
            data.facets.available.find(function(g) { return g.field === field; });
        button.prop('disabled', false);
        if (!group)
            return;

        const fullList = renderFacetList(state, group);
        const buttonTop = button[0].getBoundingClientRect().top;
        list.replaceWith(fullList);
        setFacetButtonExpanded(button, true);
        focusFirstRevealedFacet(fullList, button.data('shown'), buttonTop);
    })
    .fail(function() {
        button.prop('disabled', false);
    });
}

function renderSelectedFacet(state, selectedFacet) {
    var facetState = Object.assign({}, state, {page: 1});
    delete facetState[getFacetParam(selectedFacet.field)];

    var url = serialiseQuery(facetState);

    return $('<div>')
        .addClass('search-facet-selected')
        .append(
            $('<a>')
                .addClass('search-close')
                .attr('href', url)
                .attr('title', 'Remove')
                .data('state', facetState)
                .append(
                    'in ',
                    $('<b>')
                        .append($('<span>').text(selectedFacet.value)[0]),
                    ' (', document.createTextNode(renderFacetName(selectedFacet.field)), ') ❌'
                )
        )[0];
}

function renderSelectedFacets(state, selectedFacets) {
    var selected = selectedFacets.map(renderSelectedFacet.bind(undefined, state));
    if(state.bbox) {
        selected.push(renderSelectedMapArea(state));
    }
    return selected;
}

/** The map area restriction is shown and removed like a selected facet. */
function renderSelectedMapArea(state) {
    var areaState = Object.assign({}, state, {page: 1});
    delete areaState.bbox;

    return $('<div>')
        .addClass('search-facet-selected')
        .append(
            $('<a>')
                .addClass('search-close')
                .attr('href', serialiseQuery(areaState))
                .attr('title', 'Remove')
                .data('state', areaState)
                .append('within ', $('<b>').text('map area'), ' ❌')
        )[0];
}

/** Only some collections have locations, so show the map just for them. */
function shouldShowMap(state) {
    return !!mapCollection(state.facetCollection) || !!state.bbox;
}

/** The map panel: a toggle and summary, a note for partial collections, and the map. */
function ensureMapPanel() {
    if($('#search-map-panel').length)
        return;

    var toggle = $('<button type="button">')
        .addClass('search-map-toggle')
        .attr({'aria-controls': 'search-map', 'aria-expanded': 'true'})
        .append($('<span aria-hidden="true">').addClass('search-map-toggle-arrow'), 'Map')
        .on('click', function() {
            mapCollapsedChoice = !mapCollapsed;
            setMapCollapsed(mapCollapsedChoice);
        });

    $('<div>').attr('id', 'search-map-panel')
        .append(
            $('<div>').addClass('search-map-header').append(
                toggle, $('<span>').addClass('search-map-summary')),
            $('<p>').addClass('search-map-partial-note'),
            $('<div>').attr('id', 'search-map'))
        .insertBefore('#collections_carousel');
}

/** Identifies a search for the map: the page of results makes no difference to it. */
function mapSearchKey(state) {
    var search = Object.assign({}, state);
    delete search.page;
    return serialiseQuery(search);
}

/** Whether the map shows the current search's locations, fully loaded. */
function isMapLoaded() {
    return mapLoadedKey === mapSearchKey(currentState) && !locationsXhr;
}

/** Open or close the map; opening loads the current search's locations if needed. */
function setMapCollapsed(collapsed) {
    mapCollapsed = collapsed;
    $('.search-map-toggle').attr('aria-expanded', String(!collapsed));
    $('#search-map-panel').toggleClass('collapsed', collapsed);
    $('#search-map').toggle(!collapsed);

    if(!collapsed && mapLoadedKey !== mapSearchKey(currentState))
        loadMapLocations(currentState);
}

/**
 * Show the map panel for searches that can have locations. The map shows
 * every matching item with a location, not just the current page of results,
 * so this runs on a new search but not on a page change.
 */
function updateSearchMap(state) {
    if(locationsXhr)
        locationsXhr.abort();
    mapLoadedKey = null;

    if(!shouldShowMap(state)) {
        $('#search-map-panel').hide();
        return;
    }

    ensureMapPanel();
    $('#search-map-panel').show();
    $('.search-map-summary').text('');

    var collection = mapCollection(state.facetCollection);
    var partial = isPartialMapCollection(collection);
    $('.search-map-partial-note')
        .toggle(partial)
        .text(partial ? 'Many items in ' + state.facetCollection + ' have no recorded location, ' +
            'so many results will not appear on the map.' : '');

    // Partial collections start closed, unless the user has chosen otherwise.
    setMapCollapsed(mapCollapsedChoice !== null ? mapCollapsedChoice : partial);
}

/** Fetch and draw every matching item with a location for state. */
function loadMapLocations(state) {
    if(!searchMap) {
        searchMap = createSearchMap(document.getElementById('search-map'), {
            onSearchArea: function(bbox) {
                requestState(Object.assign({}, currentState, {bbox: bbox, page: 1}));
            },
            onClearArea: function() {
                var areaState = Object.assign({}, currentState, {page: 1});
                delete areaState.bbox;
                requestState(areaState);
            }
        });
    }
    if(locationsXhr)
        locationsXhr.abort();
    mapLoadedKey = mapSearchKey(state);

    var xhr;
    locationsXhr = xhr = $.ajax({
        "url": '/search/locationsJSON' + getSearchQueryString(state)
    })
    .always(function() {
        if(locationsXhr === xhr)
            locationsXhr = null;
    })
    .done(function(data) {
        // Same shape as a search result, which the map already draws
        var results = data.locations.map(function(location) {
            return {
                item: {id: location.id, title: location.title},
                startPage: location.startPage,
                coverage: location.coverage,
                origin: location.origin
            };
        });
        var note = data.error ? 'Locations could not be loaded.' :
            data.total > results.length ?
                'Showing ' + formatNumber(results.length) + ' of ' + formatNumber(data.total) + ' items' : '';
        searchMap.update(results, state.bbox, note);
        $('.search-map-summary').text(data.error ? '' :
            formatNumber(data.total) + (data.total === 1 ? ' item' : ' items') + ' on the map');

        if(pendingHighlight) {
            searchMap.highlight(pendingHighlight);
            pendingHighlight = null;
        }
    })
    .fail(function(jqXhr, textStatus) {
        if(textStatus !== 'abort') {
            mapLoadedKey = null;
            searchMap.update([], state.bbox, 'Locations could not be loaded.');
        }
    });
}

function renderChangeQueryUrl(state) {
    var query = serialiseQueryPairs(
        Object.keys(state)
            .filter(function(k) {
                return k !== 'page';
            })
            .map(function(k) { return [k, state[k]]; })
    );

    return '/search/query' + query;
}

const RESULT_STATES = 'searching has-results no-results search-failed';

const NO_RESULTS_MESSAGE = 'No items found for your query.';
const SEARCH_ERROR_MESSAGE = 'Sorry, your search could not be completed. Please try again.';

function searchMessage(text) {
    return $('<p>').addClass('box h5').text(text);
}

function setResultsState(state) {
    $('#content').removeClass(RESULT_STATES).addClass(state);
}

function showSearchError() {
    paging = undefined;
    $('.pagination').empty();
    $('#collections_carousel').empty();
    $('.resultcount').empty();

    $('.search-error')
        .empty()
        .append(searchMessage(SEARCH_ERROR_MESSAGE));

    $('#content').removeClass('has-facets');
    setResultsState('search-failed');
}

/** Replacing an in-flight query fires .fail() on the request it aborts. */
function handleSearchFailure(textStatus) {
    if(textStatus === 'abort')
        return;

    showSearchError();
}

/** An unreachable Solr answers 200 with no results and an error, never .fail(). */
function isFailedResponse(data) {
    if(!data.info.error)
        return false;

    showSearchError();
    return true;
}

/**
 * This function is called when no facets have been used.
 * @param state
 * @returns {boolean}
 */
function loadPage(state) {
    setBusy(true);

    if(activeXhr)
        activeXhr.abort();

    var xhr;
    activeXhr = xhr = $.ajax({
        "url": '/search/JSON' + getSearchQueryString(state)
    })
    .always(function() {
        setBusy(false);
        if(activeXhr === xhr)
            activeXhr = null;
    })
    .done(function(data) {
        if(isFailedResponse(data))
            return;

        withoutUserInteraction(() => paging.pagination(parseInt(state.page)));

        $('#collections_carousel')
            .empty()
            .append(renderResults(data.items));

        $('.resultcount')
            .empty()
            .append(renderResultInfo(data.info.hits, data.info.queryTime));
    })
    .fail(function(jqXhr, textStatus) {
        handleSearchFailure(textStatus);
    });

    return false;
}

function renderQueryResults(state, data) {
    if(isFailedResponse(data))
        return;

    // Reset the pagination for the new data. paginationjs invokes the
    // callback while constructing the paginator, so clear `paging` first to
    // make setStatePage a no-op as it is at init; otherwise it requests
    // page 1 as a state change and fires a second, identical query.
    paging = undefined;
    setupPagination(data.info.hits, pageLimit, state.page);

    $('#collections_carousel')
        .empty()
        .append(renderResults(data.items));

    $('.resultcount')
        .empty()
        .append(renderResultInfo(data.info.hits, data.info.queryTime));

    updateSearchMap(state);

    facetTreeVersion++;
    $('#tree')
        .empty()
        .append(renderFacetTree(state, data.facets.available));

    $('#selected_facets')
        .empty()
        .append(renderSelectedFacets(state, data.facets.selected))

    $('.query-actions .change-query')
        .attr('href', renderChangeQueryUrl(state));

    $('.search-no-results').empty();
    if(data.info.hits === 0) {
        $('.search-no-results').append(searchMessage(NO_RESULTS_MESSAGE));
    }

    $('#content').toggleClass('has-facets', data.facets.available.length > 0);
    setResultsState(data.info.hits > 0 ? 'has-results' : 'no-results');

    setupFacets(false);
}

/**
 * Run a new search (search terms, facets or map area changed). This does not
 * scroll: the user stays where they were, e.g. on the map or the facet list.
 */
function requery(state) {

    if(typeof state.page != 'number')
        throw new Error('state.page not a number');

    setResultsState('searching');
    setBusy(true);

    if(activeXhr)
        activeXhr.abort();

    var xhr;
    activeXhr = xhr = $.ajax({
        "url": '/search/JSONAdvanced' + getSearchQueryString(state)
    })
    .always(function() {
        setBusy(false);
        if(activeXhr === xhr)
            activeXhr = null;
    })
    .done(function(data) {
        renderQueryResults(state, data);
    })
    .fail(function(jqXhr, textStatus) {
        handleSearchFailure(textStatus);
    });
}

function getSpinner() {
    // Setup spinner.
    var opts = {
        lines: 13, // The number of lines to draw
        length: 0, // The length of each line
        width: 27, // The line thickness
        radius: 63, // The radius of the inner circle
        scale: 1, // Scales overall size of the spinner
        corners: 1, // Corner roundness (0..1)
        color: '#000', // CSS color or array of colors
        fadeColor: 'transparent', // CSS color or array of colors
        speed: 1.5, // Rounds per second
        rotate: 0, // The rotation offset
        animation: 'spinner-line-fade-quick', // The CSS animation name for the lines
        direction: 1, // 1: clockwise, -1: counterclockwise
        zIndex: 2e9, // The z-index (defaults to 2000000000)
        className: 'spinner', // The CSS class to assign to the spinner
        top: '50%', // Top position relative to parent
        left: '50%', // Left position relative to parent
        shadow: '0 0 1px transparent', // Box-shadow for the lines
        position: 'fixed' // Element positioning
    };

    return new Spinner(opts);
}

// function formatPagination(type) {
//     switch (type) {
//
//         case 'block':
//             if (!this.active)
//                 return '<span class="disabled">' + this.value + '</span>';
//             else if (this.value != this.page)
//                 return '<em><a href="">' + this.value + '</a></em>';
//             return '<span class="current">' + this.value + '</span>';
//
//         case 'right':
//
//         case 'left':
//             if (!this.active) {
//                 return '';
//             }
//             return '<a href="">' + this.value + '</a>';
//
//         case 'next':
//             if (this.active)
//                 return '<a href="" class="next"><img src="/img/interface/icon-fwd-btn-larger.png" class="pagination-fwd"/></a>';
//             return '<span class="disabled"><img src="/img/interface/icon-fwd-btn-larger.png" class="pagination-fwd"/></span>';
//
//         case 'prev':
//             if (this.active)
//                 return '<a href="" class="prev"><img src="/img/interface/icon-back-btn-larger.png" class="pagination-back"/></a>';
//             return '<span class="disabled"><img src="/img/interface/icon-back-btn-larger.png" class="pagination-back"/></span>';
//
//         case 'first':
//             if (this.active)
//                 return '<a href="" class="first">|<</a>';
//             return '<span class="disabled">|<</span>';
//
//         case 'last':
//             if (this.active)
//                 return '<a href="" class="last">>|</a>';
//             return '<span class="disabled">>|</span>';
//
//         case "leap":
//             if (this.active)
//                 return "...";
//             return "";
//
//         case 'fill':
//             if (this.active)
//                 return "...";
//             return "";
//     }
// }

function setStatePage(page) {
    // This gets called by jQuery paging as the paginator is being created.
    // There's no need to do anything at this point.
    if(paging === undefined) {
        return;
    }

    // Scroll to the top only if the page change was initiated directly by a
    // user interaction (rather than restoring a history state or initialising
    // the page)
    if(userInteracting) {
        scrollToTopOfResults();
    }

    requestState(Object.assign({}, currentState, {page: '' + page}));
}

function scrollToTopOfResults() {
    document.body.scrollTop = document.documentElement.scrollTop = $("#collections_carousel").offset().top - 50;
}

/**
 * Update query state of the page to match the specified state.
 */
function showState(state) {
    var change = diffState(currentState, state);

    if(Object.keys(change).length === 0) {
        return;
    }

    // Just page changed
    if(Object.keys(change).length === 1 && change.page) {
        //alert("loading");
        loadPage(state);
    }
    // Facets/recallScale changed, perform new query
    else {
        requery(state);
    }
    currentState = state;
}

function requestState(state, mode) {
    mode = mode || 'push';

    if(!(mode === 'push' || mode === 'replace')) {
        throw new Error('Unknown mode: ' + mode);
    }

    // Don't add browser history for identical states
    if(Object.keys(diffState(currentState, state)).length === 0) {
        return;
    }

    var url = serialiseQuery(state);

    (mode === 'replace' ? history.replaceState : history.pushState)
        .call(history, state, '', url);
    showState(state);
}

function parseState(query, defaults) {
    defaults = defaults || {};
    var state = Object.assign({page: 1}, defaults, parseQuery(query));
    state.page = parseInt(state.page);
    return state;
}

// The active ajax request for search results (if any)
let activeXhr = undefined;
// The active ajax request for map locations (if any)
let locationsXhr = undefined;

// Bumped on every facet tree rebuild, so a "more" response for an old tree is ignored
let facetTreeVersion = 0;

let busyCount = 0;

function setBusy(busy) {
    var prevCount = busyCount;
    busyCount = Math.max(0, busyCount + (busy ? 1 : -1));

    if(prevCount === 0 && busyCount) {
        var body = $('body');
        spinner.spin(body[0]);
        body.addClass('loading');
    }
    else if(prevCount && busyCount === 0) {
        var body = $('body');
        spinner.stop();
        body.removeClass('loading');
    }
}

let pageLimit = 20;
let paging, spinner, currentState, searchMap;

// The user's explicit open/closed choice for the map, kept across searches on
// this page; null until they use the toggle, so collection defaults apply.
let mapCollapsedChoice = null;
// Whether the map is currently collapsed
let mapCollapsed = false;
// The search whose locations the map currently shows (see mapSearchKey)
let mapLoadedKey = null;
// Item to highlight once the map has loaded, from "Show on map"
let pendingHighlight = null;

let userInteracting = true;
/**
 * Execute f() without user interaction marked as enabled.
 *
 * Currently this is used to disable resetting the scroll position when the
 * user has not initiated a page change.
 */
function withoutUserInteraction(f) {
    userInteracting = false;
    try {
        f();
    }
    finally {
        userInteracting = true;
    }
}

function setupPagination (numResults, pageLimit, pageNumber) {
    const paginationConfig = {
        dataSource: new Array(numResults).fill(0), //'dummy' data as the existing code handles the ajax calls
        locator: 'items',
        pageNumber: pageNumber,
        pageSize: pageLimit,
        totalNumber: numResults,
        hideOnlyOnePage:true,
        callback: function (data, pagination) {
            setStatePage(pagination.pageNumber);
        }
    };
    paging = $('.pagination:first').pagination(paginationConfig);
}

function init() {
    spinner = getSpinner();
    currentState = parseState(window.location.search);

    // Ensure we get a non-null state when returning to the first page.
    history.replaceState(currentState, '', serialiseQuery(currentState));

    // Show the stored state when browser history is accessed.
    // $(window).on('popstate', function(e) {
    //     var state = e.originalEvent.state;
    //
    //     // Safari fires a popstate event on page load with null state
    //     if(state !== null) {
    //         showState(state);
    //     }
    // });

    // $("#recall-slider-input")
    //     .on("change", function(e) {
    //         var recallScale = e.value.newValue;
    //         requestState(Object.assign({}, currentState, {
    //             recallScale: recallScale,
    //             page: 1 // Reset page as it's a new query
    //         }));
    //     })

    // Handle facet activation and deactivation
    $('#tree,#selected_facets').on('click', 'a', function(e) {
        var state = $(e.currentTarget).data('state') ||
                parseState(e.currentTarget.search);

        requestState(state);
        return false;
    });

    $('#tree').on('click', 'button.search-facet-more', function(e) {
        toggleMoreFacets($(e.currentTarget));
    });

    // Not via requestState: it returns early on an empty diff.
    requery(currentState);
}

// function createVariableRecallSlider() {
//     // Use bootstrap slider to create a slider bar
//     $('#recall-slider-input').slider();
// }

$(() => {
    init();

  //  defer(createVariableRecallSlider);
});
