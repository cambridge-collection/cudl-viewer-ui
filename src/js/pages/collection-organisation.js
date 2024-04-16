// Use the normal CUDL style
import $ from 'jquery';

import '../../css/style.css';
import '../base.js';

//import * as cudl from '../cudl';
import { getPageContext } from '../context';
import ('paginationjs');

$(function() {

    let context = getPageContext();

    let pageLimit = 8;
    let numResults = context.collectionSize;
    let pageNumber = context.collectionPage || 1;

    const paginationConfig = {
        dataSource: context.collectionUrl + '/itemJSON',
        locator: 'items',
        pageNumber: pageNumber,
        pageSize: pageLimit,
        totalNumber: numResults,
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
                    imageDimensions = " style='height:100%' ";
                }
                else if(item.thumbnailOrientation==="landscape") {
                    imageDimensions = " style='width:100%' ";
                }
                let shelfLocator = "";
                if(item.shelfLocator !== "") {
                    shelfLocator = " (" +item.shelfLocator+ ") ";
                }

                const itemDiv = document.createElement('div');
                itemDiv.setAttribute("class", "collections_carousel_item");
                itemDiv.innerHTML = "<div class='collections_carousel_image_box'>" +
                    "<div class='collections_carousel_image'>" +
                    "<a href='/view/" + item.id + "'><img src='" + item.thumbnailURL + "' alt='" + item.id + "' " +
                    imageDimensions + " > </a></div></div> " +
                    "<div class=\"collections_carousel_text word-wrap-200\"><h4>" + item.title + shelfLocator + "</h4> <div class=\"collection_abstract\">" + item.abstractShort +
                    " ... <a href=\"/view/" + item.id + "\">more</a></div><div class=\"clear\"></div></div>";
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
