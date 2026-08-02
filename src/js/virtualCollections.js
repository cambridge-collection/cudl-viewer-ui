/**
 * Lazy loading for virtual collection item lists.
 *
 * Virtual collections show one continuous list rather than paginating, so the
 * server renders the first batch of tiles and this appends the rest from the
 * same /collections/{slug}/itemJSON endpoint the organisation carousel uses,
 * a batch at a time, as the end of the list comes into view.
 */
import $ from 'jquery';

import { escapeHtml } from './html';
import { unreleasedBadge } from './itemStatus';

const LIST_ID = 'virtual_collections_carousel';
const SENTINEL_ID = 'virtual_collections_sentinel';

/** How close to the end of the list to get before loading the next batch. */
const TRIGGER_MARGIN = '400px';

/** Consecutive failed batch requests before giving up on the rest of the list. */
const MAX_FAILURES = 3;

/**
 * Builds one tile. This mirrors the markup collection-virtual.jsp renders for
 * the first batch: appended tiles have to be indistinguishable from those.
 */
function buildTile(item, position) {
    const imageDimensions = item.thumbnailOrientation === 'portrait'
        ? 'height: 100%' : 'width: 100%';

    const mainDisplayIndicator = item.mainDisplay === 'rti'
        ? '<span class="virtual_collections_carousel-lightbulb-icon">' +
          '<img alt="RTI Item" height="30px" src="/document-views/rti/rti-light-bulb.png"/>' +
          '</span>'
        : '';

    const itemUrl = '/view/' + encodeURIComponent(item.id) + '/1';
    const li = document.createElement('li');
    li.setAttribute('class', 'campl-column5');
    li.innerHTML =
        '<div class="virtual_collections_carousel_item">' +
        '<div class="virtual_collections_carousel_image_box campl-column6">' +
        '<div class="virtual_collections_carousel_image" ' +
        'id="virtual_collections_carousel_item' + position + '">' +
        '<a href="' + itemUrl + '">' +
        '<img src="' + escapeHtml(item.thumbnailURL) + '" ' +
        'alt="' + escapeHtml(item.id) + '" style="' + imageDimensions + '">' +
        '</a>' + mainDisplayIndicator + unreleasedBadge(item) +
        '</div>' +
        '</div>' +
        '<div class="virtual_collections_carousel_text campl-column6">' +
        '<h5>' + escapeHtml(item.title + ' (' + item.shelfLocator + ')') + '</h5>' +
        escapeHtml(item.abstractShort) + ' … ' +
        '<a href="' + itemUrl + '">more</a>' +
        '</div>' +
        '<div class="clear"></div>' +
        '</div>';
    return li;
}

/**
 * Starts lazy loading if this is a virtual collection page with more items than
 * are already on it. Does nothing on any other page.
 *
 * @return true if this is a virtual collection page, so callers know not to
 *         apply their own collection handling.
 */
export function initVirtualCollection(context) {
    const list = document.getElementById(LIST_ID);
    const sentinel = document.getElementById(SENTINEL_ID);
    if (!list || !sentinel) { return false; }

    const total = parseInt(context.collectionTotal, 10) || 0;
    const batchSize = parseInt(context.collectionBatchSize, 10) || 20;
    let loaded = list.children.length;

    // Everything is already on the page, or IntersectionObserver is unavailable —
    // either way the server-rendered tiles stand on their own.
    if (loaded >= total || typeof IntersectionObserver === 'undefined') {
        sentinel.remove();
        return true;
    }

    let observer;
    let loading = false;
    let failures = 0;

    function finish() {
        if (observer) { observer.disconnect(); }
        sentinel.remove();
    }

    /**
     * Asks for a fresh intersection notification. An observer only reports
     * *changes* in visibility, so a sentinel that is still on screen after a batch
     * is appended produces no further callback and the list would stop growing
     * until the next scroll happened to move it. Re-observing keeps batches coming
     * until the sentinel is genuinely out of view.
     */
    function recheck() {
        observer.unobserve(sentinel);
        observer.observe(sentinel);
    }

    function loadNextBatch() {
        if (loading || loaded >= total) { return; }
        loading = true;

        $.getJSON(context.collectionUrl + '/itemJSON',
            { start: loaded, end: loaded + batchSize })
            .done(function(data) {
                const items = (data && data.items) || [];
                loading = false;

                // No items when more were expected: asking again would repeat the
                // same empty request, so treat the list as complete.
                if (items.length === 0) { finish(); return; }

                const fragment = document.createDocumentFragment();
                items.forEach(function(item, index) {
                    fragment.appendChild(buildTile(item, loaded + index + 1));
                });
                list.appendChild(fragment);
                loaded += items.length;
                failures = 0;

                if (loaded >= total) { finish(); return; }
                recheck();
            })
            .fail(function() {
                // Keep what is already on the page and let a later scroll retry, but
                // stop after repeated failures rather than retrying indefinitely.
                loading = false;
                failures += 1;
                if (failures >= MAX_FAILURES) { finish(); }
            });
    }

    observer = new IntersectionObserver(function(entries) {
        if (entries.some(entry => entry.isIntersecting)) { loadNextBatch(); }
    }, { rootMargin: TRIGGER_MARGIN });

    observer.observe(sentinel);
    return true;
}
