import '../../css/advancedsearch.css';

import $ from 'jquery';
import 'paging'; // jquery paging plugin
import Spinner from 'spin.js';

import '../base.js';
import { getPageContext } from '../context';


var viewPage = function(pageNum) {
     if (window.history.replaceState) {
         window.history.replaceState(pageNum, "Cambridge Digital Library", "#"+pageNum);
     } else if (window.location){
         window.location.hash = pageNum;
     }
     return false;
};

// query duration
var requestStartTime = 0, requestTime = 0;
$(document).ajaxStart(function() {
    requestStartTime = new Date().getTime();
});

function init() {

    let context = getPageContext();

    var pageLimit = 20;
    var numResults = context.resultCount;

    // Setup spinner.
    var opts = {
            length: 7, // The length of each line
            width: 4, // The line thickness
            radius: 10, // The radius of the inner circle
    };

    var target = document.getElementById('content');

    var spinner = new Spinner(opts);

    // Setup pagination
    var Paging = $(".pagination").paging(
            numResults,
            {
                format : "< (q-) ncnnnnnn (-p) >",  //[< (q-) ncnnnnnn (-p) >]
                perpage : pageLimit,
                lapping : 0,
                page : 1,
                onSelect : function(page) {

                    spinner.spin(target);

                    $.ajax({
                        "url": `/search/JSON?start=${this.slice[0]}&end=${this.slice[1]}&${context.queryString}`,
                        "success" : function(data) {

                            // query duration
                            requestTime = new Date().getTime() - requestStartTime;
                            $("#reqtime").text(requestTime / 1000 + ' seconds');

                            spinner.stop();

                            // content replace
                            var container = document.getElementById("collections_carousel");

                            // Remove all children
                            container.innerHTML = '';

                            // add in the results
                            for (var i = 0; i < data.length; i++) {
                                var result = data[i];
                                var item = result.item;
                                var imageDimensions = "";
                                if (item.thumbnailOrientation == "portrait") {
                                    imageDimensions = " style='height:100%' ";
                                } else if (item.thumbnailOrientation == "landscape") {
                                    imageDimensions = " style='width:100%' ";
                                }
                                var title = item.title;
                                if (result.itemType == "essay") {
                                    title = "Essay: "
                                            + title;
                                }

                                var itemDiv = document.createElement('div');
                                itemDiv.setAttribute("class", "collections_carousel_item");
                                var itemText = "<div class='collections_carousel_image_box campl-column4'>"
                                    + "<div class='collections_carousel_image'>"
                                    + "<a href='/view/" +item.id+ "/"+result.startPage+"'><img src='" +result.pageThumbnailURL+ "' alt='" +item.id+ "' "+ imageDimensions+ " > </a></div></div> "
                                    //+ "<div class='collections_carousel_text campl-column8'><h5>"
                                    + "<div class='collections_carousel_text campl-column8'><h3>"
                                    //+ "# " + (currentPage * pageLimit + i + 1) + " "
                                    //+ title
                                    + "<a href='/view/" +item.id+ "/"+result.startPage+"'>" + title + "</a>" //+ " </h3>"
                                    //+ " <font style='color:#999'>(" + item.shelfLocator + " Page: " + result.startPageLabel
                                    + " <font style='color:#999;font-weight:normal;font-size:14px;'>(" + "<span title='Shelf locator'>" +item.shelfLocator + "</span>" + (item.shelfLocator[0].length <= 0 ? "" : " ") + "Page: " + result.startPageLabel + ")</font>"
                                    //+ ")</font></h5> "
                                    + "</h3> "
                                    + item.abstractShort
                                    + " ... <br/><br/><ul>";

                                for (var j = 0; j < result.snippets.length; j++) {
                                    var snippet = result.snippets[j];
                                    if (snippet != "" && snippet != "undefined") {
                                        var snippetLabel = "";
                                        itemText += "<li><span>" + styleSnippet(snippet) + "</span></li>";
                                    }
                                }

                                itemText += "</ul></div><div class='clear'></div>";
                                itemDiv.innerHTML = itemText;
                                container.appendChild(itemDiv);
                            }

                            /*
                            $('.collections_carousel_text').truncate({
                                max_length: 260,
                                 more: "view more",
                                 less: "hide"
                             });
                             */
                        }
                });

                return false;
            },
            onFormat : function(type) {

                switch (type) {

                    case 'block':
                        if (!this.active)
                            return '<span class="disabled">' + this.value + '</span>';
                        else if (this.value != this.page)
                            return '<em><a href="" onclick="viewPage(' + this.value + '); return false;">' + this.value + '</a></em>';
                        return '<span class="current">' + this.value + '</span>';

                    case 'right':

                    case 'left':
                        if (!this.active) {
                            return '';
                        }
                        return '<a href="" onclick="viewPage(' + this.value + '); return false;">' + this.value + '</a>';

                    case 'next':
                        if (this.active)
                            return '<a href="" onclick="viewPage(' + this.value
                                    + '); return false;" class="next"><img src="/img/interface/icon-fwd-btn-larger.png" class="pagination-fwd"/></a>';
                        return '<span class="disabled"><img src="/img/interface/icon-fwd-btn-larger.png" class="pagination-fwd"/></span>';

                    case 'prev':
                        if (this.active)
                            return '<a href="" onclick="viewPage(' + this.value
                                    + '); return false;" class="prev"><img src="/img/interface/icon-back-btn-larger.png" class="pagination-back"/></a>';
                        return '<span class="disabled"><img src="/img/interface/icon-back-btn-larger.png" class="pagination-back"/></span>';

                    case 'first':
                        if (this.active)
                            return '<a href="" onclick="viewPage(' + this.value + '); return false;" class="first">|<</a>';
                        return '<span class="disabled">|<</span>';

                    case 'last':
                        if (this.active)
                            return '<a href="" onclick="viewPage(' + this.value + '); return false;" class="last">>|</a>';
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
        });

    // Handle updating the Page selected from the hash part of the URL
    var hashChange = function() {
        if (window.location.hash)
            Paging.setPage(window.location.hash.substr(1));
        else
            Paging.setPage(1); // we dropped the initial page selection and need to run it manually
    };

    $(window).bind('hashchange', hashChange);
    hashChange();

    // Show the pagination toolbars if enough elements are present
    $(".toppagination").toggle((numResults / pageLimit) > 1);
}

const DOWN_ARROW = '▾',
      RIGHT_ARROW = '▸';

function collapseListItems() {
    // collapsible list
    $("#tree > li > strong").on("click", function(e) {
        if($(this).parent().find("span").html().match(`^${DOWN_ARROW}`)) {
            $(this).parent().find("span").html(`${RIGHT_ARROW} `);
        }
        else {
            $(this).parent().find("span").html(`${DOWN_ARROW} `);
        }
        $(this).parent().find("ul").toggleClass("hide");
    });
}

function styleSnippet(s) {
    s = s.replace(/<b>/g, "<span class=\"campl-search-term\">");
    s = s.replace(/<\/b>/g, "</span>");
    return s;
}

$(() => {
    init();
    collapseListItems();
});
