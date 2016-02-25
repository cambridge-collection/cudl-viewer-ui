import '../../css/advancedsearch.css';

import $ from 'jquery';
import 'jquery-paging';
import defer from 'lodash/function/defer';
import Spinner from 'spin.js';
import 'bootstrap-slider';

import '../base.js';
import { getPageContext } from '../context';
// import searchResults from '../../templates/search-results.jade';

function styleSnippet(s) {
    s = s.replace(/<b>/g, "<span class=\"campl-search-term\">");
    s = s.replace(/<\/b>/g, "</span>");
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

function parseQuery(q) {
    return q.replace(/^\?/, '')
        .split('&')
        .map(function(s) {
            var i = s.indexOf('=');
            return i == -1 ? [_decodeURIComponent(s), '']
                           : [_decodeURIComponent(s.substr(0, i)),
                              _decodeURIComponent(s.substr(i + 1))];
        })
        .reduce(objAddKeyValuePair, {});
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
    return '?' + keyValuePairs
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

/**
 * Prevent breaks inside text at spaces by replacing spaces with
 * non-breaking spaces.
 */
function noBreak(text) {
    return text.replace(/ /g, "\u00A0");
}

function renderResult(result) {
    var item = result.item;
    var imageStyle = {};
    if (item.thumbnailOrientation == "portrait") {
        imageStyle["height"] = "100%";
    } else if (item.thumbnailOrientation == "landscape") {
        imageStyle["width"] = "100%";
    }
    var title = item.title.join(", ");
    if (result.itemType == "essay") {
        title = "Essay: "
                + title;
    }

    var itemDiv = $("<div>")
        .attr("class", "collections_carousel_item")
        .append(
            $("<div>")
                .addClass("collections_carousel_image_box campl-column4")
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
                ),
            $("<div>")
                .addClass("collections_carousel_text campl-column8")
                .append(
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
                                        .text(item.shelfLocator.map(noBreak).join(", ")),
                                    String(item.shelfLocator) ? " " : "",
                                    "Page: ", document.createTextNode(result.startPageLabel), ")"
                                )
                        ),
                    document.createTextNode(item.abstractShort),
                    $("<br><br>"),
                    $("<ul>")
                        .append(
                            result.snippets.filter(Boolean).map(function(snippet) {
                                return $("<li>")
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
    return 'facet' + facetField.substr(0, 1).toUpperCase()
            + facetField.substr(1);
}

function renderFacet(state, group, facet) {
    var facetState = Object.assign({}, state);
    facetState[getFacetParam(group.field)] = facet.value;

    var url = serialiseQuery(facetState);

    return $('<li>')
        .append(
            $('<a>')
                .attr('href', url)
                .data('state', facetState)
                .text(facet.value),
            document.createTextNode(' (' + facet.occurrences + ')')
        )[0];
}

function renderFacetTree(state, facets) {
    return $(facets.map(function(facetGroup) {
        return $('<li>')
            .append(
                $('<strong>')
                    .append(
                        $('<span>').html('&#9662 '),
                        document.createTextNode(facetGroup.label)
                    ),
                $('<ul>')
                    .addClass('campl-unstyled-list')
                    .append(
                        facetGroup.facets.map(renderFacet.bind(undefined, state, facetGroup))
                    )
            )[0];
    }));
}

function renderSelectedFacet(state, selectedFacet) {
    var facetState = Object.assign({}, state);
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
                    ' (', document.createTextNode(selectedFacet.field), ') ❌'
                )
        )[0];
}

function renderSelectedFacets(state, selectedFacets) {
    return selectedFacets.map(renderSelectedFacet.bind(undefined, state));
}

function renderChangeQueryUrl(state) {
    var query = serialiseQueryPairs(
        Object.keys(state)
            .filter(function(k) {
                return k !== 'page';
            })
            .map(function(k) { return [k, state[k]]; })
    );

    return './query' + query;
}

function loadPage(state) {
    setBusy(true);

    if(activeXhr)
        activeXhr.abort();

    var startTime = Date.now();

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

        paging.setPage(parseInt(state.page));

        // query duration
        $("#reqtime").text((Date.now() - startTime) / 1000 + ' seconds');


        $('#collections_carousel')
            .empty()
            .append(renderResults(data));
    });

    return false;
}

function requery(state) {

    if(typeof state.page != 'number')
        throw new Error('state.page not a number');

    var startTime = Date.now();

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
        // Reset the pagination for the new data
        paging.setNumber(data.info.hits);
        paging.setPage(parseInt(state.page));

        // query duration
        var requestTime = Date.now() - startTime;
        $("#reqtime").text(requestTime / 1000 + ' seconds');

        $('#collections_carousel')
            .empty()
            .append(renderResults(data.items));

        $('.resultcount')
            .empty()
            .append(renderResultInfo(data.info.hits, requestTime));

        $('.searchexample').toggleClass('hidden', data.info.hits > 0);

        $('#tree')
            .empty()
            .append(renderFacetTree(state, data.facets.available));

        $('#selected_facets')
            .empty()
            .append(renderSelectedFacets(state, data.facets.selected))

        $('.query-actions .change-query')
            .attr('href', renderChangeQueryUrl(state));
    });
}

function getSpinner() {
    // Setup spinner.
    var opts = {
      lines: 13 // The number of lines to draw
    , length: 0 // The length of each line
    , width: 27 // The line thickness
    , radius: 63 // The radius of the inner circle
    , scale: 1 // Scales overall size of the spinner
    , corners: 1 // Corner roundness (0..1)
    , color: '#000' // #rgb or #rrggbb or array of colors
    , opacity: 0.1 // Opacity of the lines
    , rotate: 0 // The rotation offset
    , direction: 1 // 1: clockwise, -1: counterclockwise
    , speed: 1.5 // Rounds per second
    , trail: 44 // Afterglow percentage
    , fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
    , zIndex: 2e9 // The z-index (defaults to 2000000000)
    , className: 'spinner' // The CSS class to assign to the spinner
    , top: '50%' // Top position relative to parent
    , left: '50%' // Left position relative to parent
    , shadow: true // Whether to render a shadow
    , hwaccel: true // Whether to use hardware acceleration
    , position: 'fixed' // Element positioning
    }

    return new Spinner(opts);
}

function formatPagination(type) {
    switch (type) {

        case 'block':
            if (!this.active)
                return '<span class="disabled">' + this.value + '</span>';
            else if (this.value != this.page)
                return '<em><a href="">' + this.value + '</a></em>';
            return '<span class="current">' + this.value + '</span>';

        case 'right':

        case 'left':
            if (!this.active) {
                return '';
            }
            return '<a href="">' + this.value + '</a>';

        case 'next':
            if (this.active)
                return '<a href="" class="next"><img src="/img/interface/icon-fwd-btn-larger.png" class="pagination-fwd"/></a>';
            return '<span class="disabled"><img src="/img/interface/icon-fwd-btn-larger.png" class="pagination-fwd"/></span>';

        case 'prev':
            if (this.active)
                return '<a href="" class="prev"><img src="/img/interface/icon-back-btn-larger.png" class="pagination-back"/></a>';
            return '<span class="disabled"><img src="/img/interface/icon-back-btn-larger.png" class="pagination-back"/></span>';

        case 'first':
            if (this.active)
                return '<a href="" class="first">|<</a>';
            return '<span class="disabled">|<</span>';

        case 'last':
            if (this.active)
                return '<a href="" class="last">>|</a>';
            return '<span class="disabled">>|</span>';

        case "leap":
            if (this.active)
                return "...";
            return "";

        case 'fill':
            if (this.active)
                return "...";
            return "";
    }
}

function setStatePage(page) {
    // This gets called by jQuery paging as the paginator is being created.
    // There's no need to do anything at this point.
    if(paging === undefined) {
        return;
    }
    requestState(Object.assign({}, currentState, {page: '' + page}));
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
let numResults, paging, spinner, currentState;

function init() {
    let context = getPageContext();

    numResults = context.resultCount;

    // Setup pagination
    paging = $(".pagination").paging(numResults, {
        format : "< (q-) ncnnnnnn (-p) >",  //[< (q-) ncnnnnnn (-p) >]
        perpage : pageLimit,
        lapping : 0,
        page : 1,
        onSelect: setStatePage,
        onFormat : formatPagination
    });

    spinner = getSpinner();
    currentState = parseState(window.location.search);

    // The page is rendered w/out results, so we have to always fetch them
    // initially. Deleting the current page means it always changes initially.
    let initialPage = currentState.page;
    delete currentState.page;

    // Ensure we get a non-null state when returning to the first page. Also
    // load the first page of data.
    requestState(Object.assign({}, currentState, {page: initialPage}), 'replace');

    // Show the stored state when browser history is accessed.
    $(window).on('popstate', function(e) {
        var state = e.originalEvent.state;
        showState(state);
    });

    $("#recall-slider-input")
        .on("change", function(e) {
            var recallScale = e.value.newValue;
            requestState(Object.assign({}, currentState, {
                recallScale: recallScale,
                page: 1 // Reset page as it's a new query
            }));
        })

    // Handle facet activation and deactivation
    $('#tree,#selected_facets').on('click', 'a', function(e) {
        var state = $(e.currentTarget).data('state') ||
                parseState(e.currentTarget.search);

        requestState(state);
        return false;
    });
}

function createVariableRecallSlider() {
    // Use bootstrap slider to create a slider bar
    $('#recall-slider-input').slider();
}

$(() => {
    init();
    defer(createVariableRecallSlider);
});
