// Bootstrap styles
// import '../../less/bootstrap/cudl-bootstrap.less';

// Use the normal CUDL style
import $ from 'jquery';
import 'bootstrap';
import '../../css/style.css';


import '../base';
//import * as cudl from '../cudl';
import { getPageContext } from '../context';
window.jQuery = $; // this is needed for paginationjs lib
import ('paginationjs');

$(function() {

    let context = getPageContext();

    let pageLimit = 8;
    let numResults = context.collectionSize;
    let pageNumber = context.collectionPage || 1;

    const paginationConfig = {
        dataSource: context.collectionUrl + '/itemJSON',
        locator: 'items',
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

            // This ensures that asynchronous requests don;t mean that you see a different
            // page to the last one you requested because the order of the ajax response
            // was different to the order it was requested.
           // if (currentSlice[0]==data.request.start && currentSlice[1]==data.request.end) {

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
          //  }

               // updatePageHistory(page);
        }
    };

    $('.pagination:first').pagination(paginationConfig);
    //$('.pagination:last').replaceWith($('.pagination:first').clone(true,true));
    //$('.pagination:last').pagination(paginationConfig);

    $('.pagination').pagination('go', pageNumber);

    // style pagination
    $('.paginationjs').addClass("paginationjs-small");

    function updatePageHistory(page){
        var historyStateObject = context.collectionTitle + " page: "+ page;
        var historyTitle = "Cambridge Digital Library, " + context.collectionTitle + " page: "+ page;
        var historyUrl = location.protocol + '//' + location.host + context.collectionUrl + "/" + page;
        if(window.history.replaceState) window.history.replaceState(historyStateObject, historyTitle, historyUrl);
        context.collectionPage = page;
        $(document.body).attr('data-context', JSON.stringify(context));
    }

});
