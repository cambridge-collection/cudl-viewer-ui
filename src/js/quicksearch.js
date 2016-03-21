import $ from 'jquery';
import 'bootstrap-slider';
import defer from 'lodash/defer';

import { ValueError } from './exceptions';


/**
 * Create a quick search box, optionally with the tagging variable-recall
 * slider, and filtered to a specific collection.
 *
 * Example markup:
 * <div class="quick-search quick-search-tagging"
 *      data-collection-facet="Cairo Genizah">
 *     <h3>Search the collection</h3>
 *     <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur urna velit, scelerisque nec nibh sit amet, interdum consectetur leo. Suspendisse et nibh elit.</p>
 *     <div class="search-placeholder"></div>
 * </div>
 *
 * Omit the quick-search-tagging class to remove the slider. Remove the
 * data-collection-facet attr to not pre-filter the search.
 */
export function quickSearch(placeholderEl) {
    var $this = $(placeholderEl);

    if(!($this.is('.search-placeholder') &&
         $this.closest('.quick-search').length > 0)) {
        throw new ValueError('The element passed to quickSearch() must be a ' +
                        '.search-placeholder with an ancestor .quick-search');
    }

    var enableTagging = $this.closest('.quick-search')
                               .is('.quick-search-tagging');

    var recallSlider =
        '<div class="recall-slider">' +
            '<input class="recall-slider-input" type="text" name="recallScale"' +
                    'data-slider-value="0.1"' +
                    'data-slider-min="0"' +
                    'data-slider-max="1"' +
                    'data-slider-step="0.1"' +
                    'data-slider-ticks="[0, 0.5, 1]"' +
                    'data-slider-ticks-labels=\'["Curated<br>metadata", "Secondary<br>literature", "Crowd-<br>sourced"]\'' +
                    'data-slider-tooltip="hide">' +
            '<input type="hidden" name="tagging" value="1">' +
        '</div>';

    var keywordInput = $(
        '<div class="campl-column9">' +
            '<div class="campl-control-group">' +
                '<div class="campl-controls">' +
                    '<input placeholder="Keywords" class="campl-input-block-level" type="text" value="" name="keyword">' +
                '</div>' +
                (enableTagging ? recallSlider : '') +
            '</div>' +
        '</div>' +
        '<div class="campl-column2">' +
            '<div class="campl-controls">' +
                '<button type="submit" class="campl-btn campl-primary-cta">Submit</button>' +
            '</div>' +
        '</div>'
    );

    var form = $('<form action="/search/advanced/results" class="clearfix">')
        .append(keywordInput);

    // Allow pre-selecting a collection facet
    var collectionFacet = $this.closest('.quick-search').data('collection-facet');
    if(collectionFacet) {
        form.append(
            $('<input>')
                .attr({
                    type: 'hidden',
                    name: 'facetCollection',
                    value: collectionFacet
                })
        );
    }

    // Replace the placeholder with the search form
    form.replaceAll(placeholderEl);

    defer(() => {
        // Enable the bootstrap slider
        form.find('.recall-slider-input').slider();
    })
}

export function setup() {
    // Automatically setup quick search boxes in page markup
    $(() => {
        $('.quick-search .search-placeholder').each((i, e) => {
            quickSearch(e);
        });
    });
}
