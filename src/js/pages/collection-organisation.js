// Use the normal CUDL style
import $ from 'jquery';

import '../../css/style.css';
import '../base.js';

//import * as cudl from '../cudl';
import { getPageContext } from '../context';
import { escapeHtml } from '../html';
import { unreleasedBadge } from '../itemStatus';
import { initVirtualCollection } from '../virtualCollections';
import ('paginationjs');

$(function() {

    let context = getPageContext();

    // Virtual collections share this chunk but show one continuous lazily-extended
    // list instead of paginating, so they have their own handling and none of the
    // pagination setup below applies to them.
    if (initVirtualCollection(context)) { return; }

    let pageLimit = 8;
    let pageNumber = context.collectionPage || 1;

    const paginationConfig = {
        dataSource: context.collectionUrl + '/itemJSON',
        locator: 'items',
        // The collection total comes back on the same response as the items, so the
        // page doesn't have to be told the size up front — which used to cost a
        // separate Solr count query on every collection page render.
        totalNumberLocator: function (response) { return response.total; },
        pageNumber: pageNumber,
        pageSize: pageLimit,
        // Seeds the total so a deep link to /collections/x/12 isn't clamped back to
        // page 1: paginationjs limits the first request to the pages it knows about,
        // and it knows none until that first response lands.
        totalNumber: pageNumber * pageLimit,
        resetPageNumberOnInit: false,
        ajax: {
            // As our ajax function expects "start" and "end" parameters
            // we're going to do a quick conversion from the given pageSize and
            // pageNumber.
            beforeSend: function () {
                const urlParams = new URLSearchParams(this.url.split("?")[1]);
                const pageNumber = urlParams.get('pageNumber');
                const pageSize = urlParams.get('pageSize');
                const start =  (pageNumber*pageSize)-pageSize;
                const end = pageNumber*pageSize;
                this.url += "&start="+start+"&end="+end;
            }
        },
        hideOnlyOnePage:true,
        callback: function(data, pagination) {

            // content replace
            let container = document.getElementById("collections_carousel");

            // Remove all children
            container.innerHTML = '';

            // add in the results
            for(let i=0; i<data.length; i++) {
                let item = data[i];
                let imageDimensions = "";
                if(item.thumbnailOrientation==="portrait") {
                    imageDimensions = " style='height:180px'";
                }
                else if(item.thumbnailOrientation==="landscape") {
                    imageDimensions = " style='width:180px'";
                }
                let shelfLocator = "";
                if(item.shelfLocator) {
                    shelfLocator = " (" +escapeHtml(item.shelfLocator)+ ") ";
                }

                let mainDisplayIndicator = ""
                if ("rti" === item.mainDisplay) {
                    mainDisplayIndicator = "<span class='collections_carousel-lightbulb-icon'>" +
                        "<img alt='RTI Item' height=\"30px\" src=\"/document-views/rti/rti-light-bulb.png\"/>" +
                        "</span>";
                }

                // Most items have no abstract, so only lead into the "more" link
                // when there is actually something to trail off from.
                let abstractText = "";
                if(item.abstractShort) {
                    abstractText = escapeHtml(item.abstractShort) + " ... ";
                }

                const badge = unreleasedBadge(item, {overlay: true});
                const imageBoxStyle = badge === "" ? "" : " style='position:relative'";

                const itemUrl = "/view/" + encodeURIComponent(item.id);
                const itemDiv = document.createElement('div');
                itemDiv.setAttribute("class", "collections_carousel_item");
                itemDiv.innerHTML =
                    "<div class='collections_carousel_image_box'" + imageBoxStyle + ">" +
                    badge +
                    "<div class='collections_carousel_image'>" +
                    "<a href='" + itemUrl + "'>" +
                    "<img src='" + escapeHtml(item.thumbnailURL) + "' alt='" +
                    escapeHtml(item.id) + "'" + imageDimensions + ">" +
                    "</a>" + mainDisplayIndicator +
                    "</div>" +
                    "</div>" +
                    "<div class='collections_carousel_text word-wrap-200'>" +
                    "<h4>" + escapeHtml(item.title) + shelfLocator + "</h4>" +
                    "<div class='collection_abstract'>" + abstractText +
                    "<a href='" + itemUrl + "'>more</a>" +
                    "</div>" +
                    "<div class='clear'></div>" +
                    "</div>";
                container.appendChild(itemDiv);
            }

            pageNumber = pagination.pageNumber;
            updatePageHistory(pageNumber);

            // Update bottom Pagination
            const paginationFirst = $('#topPagination');
            const paginationLast = $('#bottomPagination');
            paginationLast.replaceWith(paginationFirst.clone(true,true).attr("id", "bottomPagination"));
        }
    };

    $('#topPagination').pagination(paginationConfig);

    // style pagination
    $('.paginationjs').addClass("paginationjs-small");

    function updatePageHistory(page){
        var historyStateObject = context.collectionTitle + " page: "+ page;
        var historyTitle = context.collectionTitle + " page: "+ page;
        var historyUrl = location.protocol + '//' + location.host + context.collectionUrl + "/" + page;
        if(window.history.replaceState) window.history.replaceState(historyStateObject, historyTitle, historyUrl);
        context.collectionPage = page;
        $(document.body).attr('data-context', JSON.stringify(context));
    }

    $( document ).ready(function() {
        $('*[data-toggle="collapse"]').on( "click", function() {
            let href_attr = $(this).attr('href');
            $(href_attr).toggle("slow");
        } );
    });

});
