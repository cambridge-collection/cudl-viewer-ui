import '../../css/advancedsearch.css';

import $ from 'jquery';
import 'jquery-paging';
import defer from 'lodash/function/defer';
import Spinner from 'spin.js';
import 'bootstrap-slider';

import '../base.js';
import { getPageContext } from '../context';
import searchResults from '../../templates/search-results.jade';


function updateBrowserLocation(pageNum) {
     if (window.history.replaceState) {
         window.history.replaceState(pageNum, "Cambridge Digital Library", "#"+pageNum);
     } else if (window.location){
         window.location.hash = pageNum;
     }
}

function init() {

    let context = getPageContext();

    var pageLimit = 20;
    var numResults = context.resultCount;

    // Setup spinner.
    var opts = {
            length: 7, // The length of each line
            width: 4, // The line thickness
            radius: 10, // The radius of the inner circle,
            position: 'fixed'
    };

    var target = document.getElementById('content');

    var spinner = new Spinner(opts);

    // Setup pagination
    var Paging = $(".pagination").paging(numResults, {
        format : "< (q-) ncnnnnnn (-p) >",  //[< (q-) ncnnnnnn (-p) >]
        perpage : pageLimit,
        lapping : 0,
        page : 1,
        onSelect : function(page) {

            spinner.spin(target);

            let requestStartTime = Date.now();

            $.ajax({
                url: `/search/JSON?start=${this.slice[0]}&end=${this.slice[1]}&${context.queryString}`,
                success: function(data) {

                    // query duration
                    $("#reqtime").text((Date.now() - requestStartTime) / 1000 + ' seconds');

                    spinner.stop();

                    // Render results
                    $('#collections_carousel').html(searchResults({
                        results: data,
                        styleSnippet: styleSnippet
                    }));
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
                        return '<em><a href="#">' + this.value + '</a></em>';
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
                        return "&hellip;";
                    return "";

                case 'fill':
                    if (this.active)
                        return "&hellip;";
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

function createVariableRecallSlider() {
    // Use bootstrap slider to create a slider bar
    $('#recall-slider-input').slider();
}

$(() => {
    init();
    collapseListItems();
    defer(createVariableRecallSlider);
});
