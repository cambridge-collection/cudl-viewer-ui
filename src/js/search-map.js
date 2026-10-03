// Map panel for search results that carry a location.
//
// A result's place shown (result.coverage, [west, south, east, north])
// is drawn as a rectangle, and its place of origin (result.origin, [lat, lon])
// as a dot, in different colours. The user chooses how results are shown:
//   Points    every location as a point; nearby points cluster into counts
//   Areas     places represented as their full rectangles; origins as points
//   Map only  no results, just the background map
// The user can restrict the search to the visible area; bbox strings are
// west,south,east,north in decimal degrees.

import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import '../css/search-map.css';

import $ from 'jquery';
import L from 'leaflet';
import 'leaflet.markercluster';

const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_ATTRIBUTION =
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

// Blue and orange stay distinct for most kinds of colour blindness
const REPRESENTED_COLOUR = '#0050c8';
const ORIGIN_COLOUR = '#e66100';
const REPRESENTED_STYLE = {color: REPRESENTED_COLOUR, weight: 2, opacity: 0.9, fillColor: REPRESENTED_COLOUR, fillOpacity: 0.25};
// Applied on top of the rectangle style, so the fill keeps its colour
const HOVER_STYLE = {color: '#000', weight: 3, fillOpacity: 0.5};
// Outline drawn around an item's area by "Show on map"
const HIGHLIGHT_OUTLINE_STYLE = {color: '#000', weight: 3, fill: false, interactive: false};
// How long a "Show on map" highlight lasts
const HIGHLIGHT_MS = 4000;
// Pixel radius within which locations are clustered
const CLUSTER_RADIUS = 40;
// Titles listed in the tooltip of a location shared by several results
const TOOLTIP_TITLES = 5;
const SEARCH_AREA_STYLE = {color: '#333', weight: 2, dashArray: '6 4', fill: false, interactive: false};

const DISPLAY_MODES = [
    {key: 'points', label: 'Points', icon: '●',
        title: 'Show each location as a point, grouped into counts when close together'},
    {key: 'areas', label: 'Areas', icon: '▭',
        title: 'Show the full area each item represents'},
    {key: 'none', label: 'Map only', icon: '',
        title: 'Hide the results and show only the background map'},
];
const DEFAULT_DISPLAY_MODE = 'points';
// A viewing preference rather than part of the search, so kept in the browser
// instead of the URL
const DISPLAY_MODE_STORAGE_KEY = 'cudl.searchMap.displayMode';

function loadDisplayMode() {
    try {
        const mode = window.localStorage.getItem(DISPLAY_MODE_STORAGE_KEY);
        return DISPLAY_MODES.some((d) => d.key === mode) ? mode : DEFAULT_DISPLAY_MODE;
    } catch (e) {
        // Storage can be unavailable, e.g. in private browsing
        return DEFAULT_DISPLAY_MODE;
    }
}

function saveDisplayMode(mode) {
    try {
        window.localStorage.setItem(DISPLAY_MODE_STORAGE_KEY, mode);
    } catch (e) {
        // Not remembered; the choice still applies to this page
    }
}

/** Wrap a longitude into -180..180. */
function wrapLng(lng) {
    return ((lng + 180) % 360 + 360) % 360 - 180;
}

function round(n) {
    return Math.round(n * 1e4) / 1e4;
}

/**
 * The visible map area as a bbox string, wrapped to valid coordinates. A view
 * that spans the antimeridian gives west > east, which the search API accepts.
 */
export function boundsToBbox(bounds) {
    let west = bounds.getWest(), east = bounds.getEast();
    if (east - west >= 360) {
        west = -180;
        east = 180;
    } else {
        west = wrapLng(west);
        east = wrapLng(east);
    }
    const south = Math.max(-90, bounds.getSouth());
    const north = Math.min(90, bounds.getNorth());
    return [west, south, east, north].map(round).join(',');
}

/** Leaflet bounds for a [west, south, east, north] area. */
function areaToLatLngBounds(area) {
    let [west, south, east, north] = area;
    if (west > east) {
        // Crosses the antimeridian: draw it continuously east of the west edge.
        east += 360;
    }
    return L.latLngBounds([south, west], [north, east]);
}

/**
 * Group results whose `field` (coverage or origin) is the same location, so a
 * shared location is drawn once. Each item appears once per group, even when
 * several of its pages matched.
 */
export function groupByLocation(results, field) {
    const groups = new Map();
    results.filter((r) => r[field]).forEach((r) => {
        const key = r[field].map((n) => n.toFixed(5)).join(',');
        const group = groups.get(key) || [];
        const id = (r.item || {}).id;
        if (!group.some((other) => (other.item || {}).id === id)) {
            group.push(r);
        }
        groups.set(key, group);
    });
    return Array.from(groups.values());
}

/** Cluster group whose badges add up the items in each location marker. */
function clusterGroup(kindClass) {
    return L.markerClusterGroup({
        maxClusterRadius: CLUSTER_RADIUS,
        showCoverageOnHover: false,
        spiderfyOnMaxZoom: true,
        iconCreateFunction: (cluster) => {
            const count = cluster.getAllChildMarkers()
                .reduce((sum, marker) => sum + (marker.itemCount || 1), 0);
            const size = count < 100 ? 30 : count < 1000 ? 36 : 44;
            return L.divIcon({
                className: 'search-map-cluster ' + kindClass,
                html: String(count),
                iconSize: [size, size]
            });
        }
    });
}

export function parseBbox(bbox) {
    const parts = (bbox || '').split(',').map(Number);
    return parts.length === 4 && parts.every(Number.isFinite) ? parts : null;
}

/**
 * Create the map inside `container`.
 *
 * onSearchArea(bbox) is called when the user asks to search the visible area,
 * and onClearArea() when they remove the area restriction.
 */
export function createSearchMap(container, {onSearchArea, onClearArea}) {
    const map = L.map(container, {worldCopyJump: true, minZoom: 1})
        .setView([30, 0], 1);
    L.tileLayer(TILE_URL, {
        maxZoom: 18,
        attribution: TILE_ATTRIBUTION,
        className: 'search-map-tiles'
    }).addTo(map);

    // Result layers; which of these are on the map depends on the display mode
    const areaLayer = L.featureGroup();
    const representedClusters = clusterGroup('search-map-represented');
    const originClusters = clusterGroup('search-map-origin');
    // "Show on map" outline and pulse, shown in every mode
    const highlightLayer = L.featureGroup().addTo(map);

    let displayMode = loadDisplayMode();
    // Item id -> {title, places: [{bounds?, latLng}]} for "Show on map"
    let itemLocations = new Map();
    let representedCount = 0;
    let originCount = 0;
    let currentNote = '';
    let highlightTimer = null;
    let searchAreaLayer = null;
    let currentBbox = null;
    // Programmatic moves (fitting to results) must not offer "search this area".
    let movingProgrammatically = false;

    const controls = $('<div>').addClass('search-map-controls leaflet-bar');
    const searchButton = $('<button type="button">')
        .addClass('search-map-search-area')
        .text('Search this area')
        .hide()
        .on('click', () => {
            searchButton.hide();
            onSearchArea(boundsToBbox(map.getBounds()));
        });
    const clearButton = $('<button type="button">')
        .addClass('search-map-clear-area')
        .text('Clear map area')
        .hide()
        .on('click', () => onClearArea());
    controls.append(searchButton, clearButton);

    const ControlBox = L.Control.extend({
        options: {position: 'topright'},
        onAdd: () => {
            L.DomEvent.disableClickPropagation(controls[0]);
            return controls[0];
        }
    });

    // Display mode switch, top right above the search area buttons
    const displaySwitch = $('<div>')
        .addClass('search-map-display leaflet-bar')
        .attr({role: 'group', 'aria-label': 'Show results as'});
    const displayButtons = DISPLAY_MODES.map((mode) => $('<button type="button">')
        .attr({title: mode.title, 'data-mode': mode.key})
        .append(mode.icon ? $('<span aria-hidden="true">').addClass('search-map-display-icon').text(mode.icon) : '',
            mode.label)
        .on('click', () => setDisplayMode(mode.key)));
    displaySwitch.append(displayButtons);
    const DisplayBox = L.Control.extend({
        options: {position: 'topright'},
        onAdd: () => {
            L.DomEvent.disableClickPropagation(displaySwitch[0]);
            return displaySwitch[0];
        }
    });
    // Controls in a corner stack in the order added, so the switch, which is
    // always shown, stays put above the buttons that come and go
    map.addControl(new DisplayBox());
    map.addControl(new ControlBox());

    const legend = $('<div>').addClass('search-map-legend').hide();
    const legendEntry = (colour, label) => $('<div>').append(
        $('<span>').addClass('search-map-legend-swatch').css('background', colour), label);
    const representedEntry = legendEntry(REPRESENTED_COLOUR, 'Place shown');
    const originEntry = legendEntry(ORIGIN_COLOUR, 'Place of origin');
    const legendNote = $('<div>').addClass('search-map-legend-note');
    legend.append(representedEntry, originEntry, legendNote);
    const LegendBox = L.Control.extend({
        options: {position: 'bottomleft'},
        onAdd: () => legend[0]
    });
    map.addControl(new LegendBox());

    map.on('moveend', () => {
        if (movingProgrammatically) {
            return;
        }
        const bbox = boundsToBbox(map.getBounds());
        searchButton.toggle(bbox !== currentBbox);
    });

    /** Run f() without its map moves counting as the user panning. */
    function moveProgrammatically(f) {
        // Unanimated moves fire moveend synchronously, so the flag covers them.
        movingProgrammatically = true;
        try {
            f();
        } finally {
            movingProgrammatically = false;
        }
    }

    function fit(bounds, maxZoom) {
        moveProgrammatically(() =>
            map.fitBounds(bounds, {padding: [10, 10], maxZoom: maxZoom || 15, animate: false}));
    }

    function setLayerShown(layer, shown) {
        if (shown && !map.hasLayer(layer)) {
            map.addLayer(layer);
        } else if (!shown && map.hasLayer(layer)) {
            map.removeLayer(layer);
        }
    }

    /** Show the layers for the current display mode and update the switch and legend. */
    function applyDisplayMode() {
        setLayerShown(representedClusters, displayMode === 'points');
        setLayerShown(areaLayer, displayMode === 'areas');
        setLayerShown(originClusters, displayMode !== 'none');
        // Keep the "Show on map" highlight above the results
        highlightLayer.bringToFront();
        displayButtons.forEach((button) => {
            const active = button.attr('data-mode') === displayMode;
            button.attr('aria-pressed', String(active)).toggleClass('active', active);
        });
        updateLegend();
    }

    function setDisplayMode(mode) {
        displayMode = mode;
        saveDisplayMode(mode);
        map.closePopup();
        applyDisplayMode();
    }

    function updateLegend() {
        const showing = displayMode !== 'none';
        representedEntry.toggle(showing && representedCount > 0);
        originEntry.toggle(showing && originCount > 0);
        const notes = [currentNote, showing ? '' : 'Results hidden'].filter(Boolean);
        legendNote.text(notes.join('. ')).toggle(notes.length > 0);
        legend.toggle(representedCount + originCount > 0 || notes.length > 0);
    }

    function resultHref(result) {
        const item = result.item || {};
        return '/view/' + encodeURIComponent(item.id) + '/' + encodeURIComponent(result.startPage);
    }

    function resultTitle(result) {
        const item = result.item || {};
        // Titles can carry TEI markup; show them as plain text.
        return $('<div>').html(item.title || item.id).text();
    }

    /** Tooltip naming the results at one location, up to TOOLTIP_TITLES of them. */
    function groupTooltip(group, kind) {
        const tip = $('<div>');
        if (group.length === 1) {
            return tip.text(resultTitle(group[0]) + ' (' + kind + ')')[0];
        }
        tip.append($('<strong>').text(group.length + ' items here (' + kind + ')'));
        group.slice(0, TOOLTIP_TITLES).forEach((r) => tip.append($('<div>').text(resultTitle(r))));
        if (group.length > TOOLTIP_TITLES) {
            tip.append($('<div>').text('and ' + (group.length - TOOLTIP_TITLES) + ' more. Click to list them.'));
        }
        return tip[0];
    }

    /** Clicking a single result opens it; clicking a shared location lists them. */
    function openGroup(group, latLng) {
        if (group.length === 1) {
            window.location.href = resultHref(group[0]);
            return;
        }
        const list = $('<ul>').addClass('search-map-popup-list').append(group.map((r) =>
            $('<li>').append($('<a>').attr('href', resultHref(r)).text(resultTitle(r)))));
        L.popup({maxHeight: 250, minWidth: 220})
            .setLatLng(latLng)
            .setContent($('<div>').append(
                $('<strong>').text(group.length + ' items at this location'), list)[0])
            .openOn(map);
    }

    /**
     * Marker for one location: a dot for a single item, or a badge with the
     * number of items that share it.
     */
    function locationMarker(latLng, count, kindClass) {
        const single = count === 1;
        const marker = L.marker(latLng, {
            icon: L.divIcon({
                className: (single ? 'search-map-dot ' : 'search-map-count ') + kindClass,
                html: single ? '' : String(count),
                iconSize: single ? [14, 14] : [24, 24]
            }),
            riseOnHover: true
        });
        // Clusters add these up, so a cluster shows items rather than locations
        marker.itemCount = count;
        return marker;
    }

    /** Tooltip and click for one location's layer. */
    function bindGroup(layer, group, kind, latLng) {
        return layer
            .bindTooltip(groupTooltip(group, kind), {sticky: true})
            .on('click', () => openGroup(group, latLng));
    }

    /**
     * A place shown: a centre marker for Points mode and a rectangle for
     * Areas mode. Returns the rectangle and its area, for drawing order.
     */
    function addRepresented(group) {
        const bounds = areaToLatLngBounds(group[0].coverage);
        const centre = bounds.getCenter();
        representedClusters.addLayer(bindGroup(
            locationMarker(centre, group.length, 'search-map-represented'),
            group, 'place shown', centre));
        const rect = bindGroup(L.rectangle(bounds, REPRESENTED_STYLE), group, 'place shown', centre)
            .on('mouseover', () => rect.setStyle(HOVER_STYLE))
            .on('mouseout', () => rect.setStyle(REPRESENTED_STYLE));
        indexGroup(group, {bounds, latLng: centre});
        const [west, south, east, north] = group[0].coverage;
        return {rect, size: Math.abs((east - west) * (north - south))};
    }

    /** A place of origin: a clusterable dot, or badge if shared. */
    function addOrigin(group) {
        const latLng = L.latLng(group[0].origin);
        originClusters.addLayer(bindGroup(
            locationMarker(latLng, group.length, 'search-map-origin'),
            group, 'place of origin', latLng));
        indexGroup(group, {bounds: null, latLng});
        return latLng;
    }

    /** Record where each item in group is, for highlight(). */
    function indexGroup(group, place) {
        group.forEach((result) => {
            const id = (result.item || {}).id;
            const entry = itemLocations.get(id) || {title: resultTitle(result), places: []};
            entry.places.push(place);
            itemLocations.set(id, entry);
        });
    }

    function clearHighlight() {
        clearTimeout(highlightTimer);
        highlightLayer.clearLayers();
    }

    /**
     * Zoom to an item's location(s) and mark them for a few seconds: an outline
     * for each area and a pulsing ring at each point. This works in every
     * display mode. Returns false if the item has no location on the map.
     */
    function highlight(itemId) {
        clearHighlight();
        map.closePopup();
        const entry = itemLocations.get(itemId);
        if (!entry) {
            return false;
        }
        const extent = L.latLngBounds([]);
        entry.places.forEach(({bounds, latLng}) => {
            if (bounds) {
                highlightLayer.addLayer(L.rectangle(bounds, HIGHLIGHT_OUTLINE_STYLE));
                extent.extend(bounds);
            }
            highlightLayer.addLayer(L.marker(latLng, {
                icon: L.divIcon({className: 'search-map-pulse', iconSize: [30, 30]}),
                interactive: false,
                zIndexOffset: 1000
            }));
            extent.extend(latLng);
        });
        // A lone point gets a street-level view rather than maximum zoom
        fit(extent.pad(0.2), 14);
        L.tooltip({direction: 'top', offset: [0, -16]})
            .setLatLng(entry.places[0].latLng)
            .setContent($('<div>').text(entry.title)[0])
            .addTo(highlightLayer);
        highlightTimer = setTimeout(clearHighlight, HIGHLIGHT_MS);
        return true;
    }

    /**
     * Show the given results. Each result may have result.coverage and/or
     * result.origin. bbox is the current search area string, or empty when the
     * search is unrestricted. note is optional text shown under the legend.
     */
    function update(results, bbox, note) {
        currentBbox = bbox || null;
        currentNote = note || '';
        areaLayer.clearLayers();
        representedClusters.clearLayers();
        originClusters.clearLayers();
        clearHighlight();
        itemLocations = new Map();
        map.closePopup();
        // The container may have been hidden, or resized, since the last update.
        moveProgrammatically(() => map.invalidateSize({pan: false}));

        const represented = groupByLocation(results, 'coverage');
        const origins = groupByLocation(results, 'origin');
        const extent = L.latLngBounds([]);
        represented.map(addRepresented)
            // Largest first, so smaller areas are drawn on top and stay clickable
            .sort((a, b) => b.size - a.size)
            .forEach(({rect}) => {
                areaLayer.addLayer(rect);
                extent.extend(rect.getBounds());
            });
        origins.forEach((group) => extent.extend(addOrigin(group)));
        representedCount = represented.length;
        originCount = origins.length;
        applyDisplayMode();

        if (searchAreaLayer) {
            map.removeLayer(searchAreaLayer);
            searchAreaLayer = null;
        }
        const area = parseBbox(bbox);
        if (area) {
            searchAreaLayer = L.rectangle(areaToLatLngBounds(area), SEARCH_AREA_STYLE).addTo(map);
            fit(searchAreaLayer.getBounds());
        } else if (extent.isValid()) {
            fit(extent);
        }

        searchButton.hide();
        clearButton.toggle(!!area);
    }

    /** Whether an item has a location on the map. */
    function hasItem(itemId) {
        return itemLocations.has(itemId);
    }

    applyDisplayMode();
    return {update, highlight, hasItem};
}
