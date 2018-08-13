// Bootstrap styles
import '../../less/bootstrap/cudl-bootstrap.less';

// Use the normal CUDL style
import '../../css/style.css';
import '../../css/manchester.css';

import $ from 'jquery';
import 'jquery-paging';

import '../base';
import * as cudl from '../cudl';
import { getPageContext } from '../context';
import { possiblyEnableEditing } from '../admin/edit';

$(function() {
    possiblyEnableEditing();

    let context = getPageContext();

    var currentSlice;
    var pageLimit = 8;
    var numResults = context.collectionSize;
    var pageNumber = context.collectionPage || 1;

    // initalise paging.
    var Paging = $(".pagination").paging(numResults, {

        format : "< (q-) ncnn (-p) >", //[< (q-) ncn (-p) >]
        perpage : pageLimit,
        lapping : 0,
        page : pageNumber,
        onSelect : function(page) {

            currentSlice =  this.slice;

            $.ajax({
                "url": context.collectionUrl + '/itemJSON?start=' + this.slice[0] + '&end=' + this.slice[1],
                "success": function(data) {
                    // This ensures that asynchronous requests don;t mean that you see a different
                    // page to the last one you requested because the order of the ajax response
                    // was different to the order it was requested.
                    if (currentSlice[0]==data.request.start && currentSlice[1]==data.request.end) {

                        // content replace
                        //    var data = this.slice;
                        var container = document.getElementById("collections_carousel");

                        // Remove all children
                        container.innerHTML = '';

                        // add in the results
                        for(var i=0; i<data.items.length; i++) {
                            var item = data.items[i];
                            var thumbnailURL = item.thumbnailURL;
                            var imageDimensions = "";
                            if(item.thumbnailOrientation=="portrait") {
                                imageDimensions = " style='height:100%' ";
                                if (String(thumbnailURL).endsWith(".jp2")) {
                                    thumbnailURL = String(thumbnailURL)+"/full/178,/0/default.jpg";
                                }
                            }
                            else if(item.thumbnailOrientation=="landscape") {
                                imageDimensions = " style='width:100%' ";
                                if (String(thumbnailURL).endsWith(".jp2")) {
                                    thumbnailURL = String(thumbnailURL)+"/full/,178/0/default.jpg";
                                }
                            }
                            var shelfLocator = "";
                            if(item.shelfLocator != "") {
                                shelfLocator = " (" +item.shelfLocator+ ") ";
                            }

                            var itemDiv = document.createElement('div');

                            itemDiv.setAttribute("class", "collections_carousel_item");
                            itemDiv.innerHTML = "<div class='collections_carousel_image_box'>" +
                                "<div class='collections_carousel_image'>" +
                                "<a href='/view/" + item.id + "'><img src='" + thumbnailURL + "' alt='" + item.id + "' " +
                                imageDimensions + " > </a></div></div> " +
                                "<div class='collections_carousel_text word-wrap-200'><h5>" + item.title + shelfLocator + "</h5> " + item.abstractShort +
                                " ... <a href='/view/" + item.id + "'>more</a></div><div class='clear'></div>";
                            container.appendChild(itemDiv);
                        }
                    }

                    updatePageHistory(page);
                }
            })

            return false;
        },

        onFormat : function(type) {

            switch (type) {
                case 'block':

                if(!this.active)
                    return '<span class="disabled">' + this.value + '</span>';
                else if(this.value != this.page)
                    return '<em><a href="#" onclick="return false;">' +
                        this.value + '</a></em>';
                return '<span class="current">' + this.value + '</span>';

                case 'right':
                case 'left':

                    if(!this.active) {
                        return '';
                    }
                    return '<a href="#" onclick="return false;">' + this.value + '</a>';

                case 'next':

                    if(this.active)
                        return '<a href="#" onclick="return false;" class="next"><img src="/img/interface/icon-fwd-btn-larger.png" class="pagination-fwd"/></a>';
                    return '<span class="disabled"><img src="/img/interface/icon-fwd-btn-larger.png" class="pagination-fwd"/></span>';

                case 'prev':

                    if(this.active)
                        return '<a href="#" onclick="return false;" class="prev"><img src="/img/interface/icon-back-btn-larger.png" class="pagination-back"/></a>';
                    return '<span class="disabled"><img src="/img/interface/icon-back-btn-larger.png" class="pagination-back"/></span>';

                case 'first':

                    if(this.active)
                        return '<a href="#" onclick="return false;" class="first">|<</a>';
                    return '<span class="disabled">|<</span>';

                case 'last':

                    if(this.active)
                        return '<a href="#" onclick="return false;" class="last">>|</a>';
                    return '<span class="disabled">>|</span>';

                case "leap":

                    if(this.active)
                        return "...";
                    return "";

                case 'fill':

                    if(this.active)
                        return "...";
                    return "";
            }
        }
    });

    // Show the pagination toolbars if enough elements are present
    if ((numResults/pageLimit)>1) {
        $(".toppagination")[0].style.display="block";
        $(".toppagination")[1].style.display="block";
    }
    else {
        $(".toppagination")[0].style.display="none";
        $(".toppagination")[1].style.display="none";
    }

    function updatePageHistory(page){
        var historyStateObject = context.collectionTitle + " page: "+ page;
        var historyTitle = "Cambridge Digital Library, " + context.collectionTitle + " page: "+ page;
        var historyUrl = location.protocol + '//' + location.host + context.collectionUrl + "/" + page;
        if(window.history.replaceState) window.history.replaceState(historyStateObject, historyTitle, historyUrl);
        context.collectionPage = page;
        $(document.body).attr('data-context', JSON.stringify(context));
    }

});
