/**
 * This is the entry point for the document page. This page displays a single
 * CUDL item with the zooming image viewer.
 */

// Page styles
import '../../css/style-document.css';
import 'jquery-ui/themes/base/slider.css';

import $ from 'jquery';
import 'jquery-ui/ui/widgets/slider';
import OpenSeadragon from 'openseadragon';
import range from 'lodash/range';

import '../cudl';
//import { msgBus } from '../cudl';
import { getPageContext } from '../context';
import paginationTemplate from './document-thumbnail-pagination.jade';
import { ViewerModel } from '../viewer/models';
//import { ga } from '../analytics';
import { registerCsrfPrefilter } from '../ajax-csrf';

/*
    We have the following attributes set by the Java in the context JSON.

    jsonURL
    jsonThumbURL
    pageNum
    docId
    docURL - not used
    imageServer
    iiifImageServer
    services

    // Read in Attributes
    collectionURL
    collectionTitle
    parentCollectionURL
    parentCollectionTitle
    itemTitle
    iiifEnabled
    iiifManifestURL
    iiifMiradorURL
    itemAuthors - not used
    itemAuthorsFullForm - not used

    viewportNavigatorEnabled
 */

let context;
let viewerModel;

// The OpenSeadragon viewer
let viewer;

// This is used when changing pages from links in the text.
window.store = {
    loadPage: function(pageNumber) {
        loadPage(pageNumber);
    }
};
let currentThumbnailPage = 1;

let thumbnailProps = {
    MAX_THUMBNAIL_ITEMS_ON_PAGE: 42,
    MAX_THUMBNAIL_ITEMS_ON_ROW: 3
};

$(window).on("popstate", function (event) {
    if ((history.state !== null && history.state.hasOwnProperty('pagenumber')) && Number(history.state.pagenumber).toString() === history.state.pagenumber.toString()) {
        loadPage(history.state.pagenumber, true);
    }
});

function isLoggedIn() {
    return !!context.isUser;
}

function loadPage(pagenumber, isReload = false) {
    let data = viewerModel.getMetadata();

    // validation
    if (isNaN(pagenumber)) { alert ("Please enter a number."); return; }
    else if (pagenumber < 0 ) { pagenumber = 0; }
    else if (pagenumber > data.numberOfPages ) {
        pagenumber = data.numberOfPages;
    }

    // test for images
    var imageavailable = true;
    if (typeof(data.pages[pagenumber-1].IIIFImageURL) == "undefined") {
        viewer._showMessage("No image available for page: "+data.pages[pagenumber-1].label);
        imageavailable = false;
    }

    function openIIIF(iiifPath) {
        viewer.open(context.iiifImageServer + iiifPath + "/info.json");
    }

    // open Image
    if (imageavailable) { openIIIF(data.pages[pagenumber - 1].IIIFImageURL); }

    // update current page
    viewerModel.setPageNumber(pagenumber);
    $("#pageInput").val(pagenumber);
    $("#maxPage").html(data.numberOfPages);

    // Open a tab identified by the URL hash
    // let defaultTabId = window.location.hash;
    // $('#rightTabs .nav-tabs li a[href]')
    //     .filter((i, e) =>  $(e).attr('href') === defaultTabId)
    //     .tab('show');

    // update transcription data
    setTranscriptionPage(data, pagenumber);

    // update metadata
    updatePageMetadata(data, pagenumber, isReload);

    // Record each page turn as a page view with Google analytics
    ga('send', 'pageview');

    setupTranscriptionCoords();
}

// Update the metadata that changes on page change
function updatePageMetadata(data, pagenumber, isReload = false) {
   var newURL = "/view/" + context.docId + "/" + pagenumber;

   // Set download image statement
   if (data.descriptiveMetadata[0].downloadImageRights==null || data.descriptiveMetadata[0].downloadImageRights.trim()==="") {
       $('#downloadOption').css("display", "none");
   } else {
       let downloadRightsStatement = data.descriptiveMetadata[0].downloadImageRights;
       $('#downloadCopyright').html(downloadRightsStatement);
   }

   // Set pdf statement
   if (data.descriptiveMetadata[0].pdfRights==null || data.descriptiveMetadata[0].pdfRights.trim()==="") {
       $('#fullDocumentPdfDownloadOption').css("display", "none");
       $('#singlePagePdfDownloadOption').css("display", "none");
   } else {
       let pdfRights = data.descriptiveMetadata[0].pdfRights;
       $('#pdfFullDocumentDownloadCopyright').html(pdfRights);
       $('#pdfSinglePageDownloadCopyright').html(pdfRights);
   }

   // Set download metadata option
   if(data.descriptiveMetadata[0].metadataRights==null || data.descriptiveMetadata[0].metadataRights.trim()==="") {
       $('#downloadMetadataOption').css("display", "none");
   } else {
       $('#downloadMetadataCopyright').html(data.descriptiveMetadata[0].metadataRights);
   }

   // Set embeddable option
   if (data.embeddable==null || data.embeddable===false) {
       $('#embedOption').css("display", "none");
   }

   $('#currentURL').text("http://cudl.lib.cam.ac.uk"+newURL);
   $('#embedCode').text("<div style='position: relative; width: 100%; padding-bottom: 80%;'><iframe type='text/html' width='600' height='410' style='position: absolute; width: 100%; height: 100%;' src='https://cudl.lib.cam.ac.uk/embed/#item=" + encodeURIComponent(context.docId) + "&page=" + encodeURIComponent(pagenumber) + "&hide-info=true' frameborder='0' allowfullscreen='' onmousewheel=''></iframe></div>")
   $('#about-metadata').empty();
   highlightMetadataForPageViewed(pagenumber, data.logicalStructures);
   $('#pageLabel').html("Page: "+data.pages[pagenumber-1].label);
   $('#pdfSinglePage a').attr("href", "/pdf/"+context.docId+"/"+pagenumber);
   $('#pdfSinglePage a').attr("download", context.docId+"-"+pagenumber+".pdf");
   updateCanonicalUrl();

   // update URL bar, does not work in ie9.
    if (isReload !== true) {
        window.history.pushState({
            "message": context.docId + " page:" + pagenumber,
            "pagenumber": pagenumber
        }, "Cambridge Digital Library", newURL);
    }
};

function getCanonicalUrl(model = viewerModel) {
    let url = `${model.getRootURL()}/view/${encodeURIComponent(model.getDocId())}`;

    if(model.getPageNumber() < 2) {
        return url;
    }
    return `${url}/${encodeURIComponent(model.getPageNumber())}`;
}

function updateCanonicalUrl(url = getCanonicalUrl()) {
    $('html meta[property="schema:url"]')
        .add('html meta[property="og:url"]')
        .attr('content', url);

    $('head link[rel=canonical]').attr('href', url);

    updateAddThisShareUrl();
}

function updateAddThisShareUrl(url = getCanonicalUrl()) {
    if(typeof addthis !== 'undefined') {
        addthis.update('share', 'url', url);
    }
}

// Viewport navigator is a mini viewer that appears inside the main OpenSeadragon viewer
function showViewportNavigator() {
    return !!context.viewportNavigatorEnabled;
}

function setupSeaDragon(data) {
    OpenSeadragon.setString("Tooltips.Home", "Reset zoom");
    let showNav = showViewportNavigator();
    viewer = new OpenSeadragon.Viewer({
        id : "doc",
        debugMode : false,
        prefixUrl : "/img/",
        showRotationControl : true,
        zoomInButton : "zoomIn",
        zoomOutButton : "zoomOut",
        homeButton : "zoomHome", // Optional button set in viewer properties
        rotateLeftButton : "rotateLeft",
        rotateRightButton : "rotateRight",
        fullPageButton: "fullscreen",
        maxZoomPixelRatio: 1,
        gestureSettingsTouch: {
            pinchRotate: false
        },
        showNavigator: showNav,
        navigatorPosition: "TOP_LEFT"
    });

    // Rotation slider using jQuery UI slider
    $("#rotationSlider").slider({
        min: -180,
        max: 180,
        classes: {
            "ui-slider": "cudl-btn",
            "ui-slider-handle": "cudl-btn"
        },
        slide: function(event, ui) {
            viewer.viewport.setRotation(ui.value);
        },
    });

    // Setup forward and backward buttons
    function nextPage() {

        let pageNum = viewerModel.getPageNumber();

        if (pageNum < data.pages.length) {
            pageNum++;
            loadPage(pageNum);
        }
        return false;
    }

    function prevPage() {
        let pageNum = viewerModel.getPageNumber();

        if (pageNum > 1) {
            pageNum--;
            loadPage(pageNum);
        }
        return false;
    }

    $("#nextPage").click(function() {
        return nextPage();
    });
    $("#prevPage").click(function() {
        return prevPage();
    });
    $("#pageInput").change(function(input) {
        loadPage(parseInt(input.target.value));
    });

    // move the pagination controls to the image when going fullscreen
    // then back to the header bar when full screen is exited.
    // Also update transcriptions / metadata etc elements when
    // going back to normal view as page may have changed.
    viewer.addHandler("pre-full-screen", function(event) {
        if(event.fullScreen) {
            $(".cudl-viewer-buttons-pagination").appendTo("#doc");
        }
    });
    viewer.addHandler("full-screen", function(event) {
        if(event.fullScreen) {
            $('#doc').css("top", "0px");
        }
        else {
            let pageNum = viewerModel.getPageNumber();
            let data = viewerModel.getMetadata();

            $(".cudl-viewer-buttons-pagination").appendTo(".navbar-header");
            setTranscriptionPage(data, pageNum);
            updatePageMetadata(data, pageNum);
            $('#doc').css("top", "68px");
        }
    });
    // Show the image zoom percentage
    viewer.addHandler('viewport-change', function(event) {
        let viewPort = viewer.viewport.getZoom(false);

        let imageZoom = viewer.viewport.viewportToImageZoom(viewPort);
        let imageZoomPercentage = (imageZoom * 100).toFixed(0)

        // Show the results.
        $("#zoomFactor").html('Zoom: ' + imageZoomPercentage.toString() + ' %');
    });
    // Keep rotation slider in sync with the image rotation
    viewer.addHandler('rotate', function(event) {
        let currentRotation = viewer.viewport.getRotation();
        let newSliderPosition = currentRotation > 180 ? currentRotation - 360 : currentRotation;
        $( "#rotationSlider" ).slider( "value", newSliderPosition );
    });
    // Reset rotation when home button is pressed
    viewer.addHandler('home', function(event) {
        viewer.viewport.setRotation( 0 );
    });

    // setup keyboard shortcuts.  Same as the embedded viewer.
    /*$(window).keypress(function(e) {

            switch (e.charCode) {
                case 118:  // v
                    pageNum++;
                    store.loadPage(pageNum);
                    return false;
                case 99: // c
                    pageNum--;
                    store.loadPage(pageNum);
                    return false;
                case 113: case 43: // q or + zoom in
                    viewer.viewport.zoomBy(2);
                    return false;
                case 101: case 45: // e or - zoom out
                    viewer.viewport.zoomBy(0.5);
                    return false;
                case 122: // z rotate left 90
                    viewer.viewport.setRotation(viewer.viewport.getRotation()-90);
                    return false;
                case 120: // x rotate right 90
                    viewer.viewport.setRotation(viewer.viewport.getRotation()+90);
                    return false;
                case 90: // Z rotate left
                    viewer.viewport.setRotation(viewer.viewport.getRotation()-10);
                    return false;
                case 88: // X rotate right
                    viewer.viewport.setRotation(viewer.viewport.getRotation()+10);
                    return false;    f
                case 102: // f fullscreen toggle
                    if (viewer.isFullPage()) {
                      viewer.setFullScreen(false);
                    } else {
                      viewer.setFullScreen(true);
                    }
                   return false;
                case 114: // r toggle right panel
                    cudl.toggleRightPanel();
                    return false;

            }

    }); */

    $('.openseadragon-canvas').focus();

};

function setupInfoPanel(data) {

    let breadcrumbHTML = "<ol class=\"breadcrumb\"><li><a href='/'>Home</a></li>"
            + "<li><a href=\"/collections/\">Browse</a></li>"
            + "<li><a href=\""
            + context.collectionURL
            + "\">"
            + context.collectionTitle
            + "</a></li><li class='active'>"+data.descriptiveMetadata[0].shelfLocator.displayForm+"</li></ol>";
    if (context.parentCollectionTitle) {
        breadcrumbHTML = "<ol class=\"breadcrumb\"><li><a href='/'>Home</a></li>"
                + "<li><a href=\"/collections/\">Browse</a></li>"
                + "<li><a href=\""
                + context.parentCollectionURL
                + "\">"
                + context.parentCollectionTitle
                + "</a></li><li><a href=\""
                + context.collectionURL
                + "\">"
                + context.collectionTitle + "</a></li><li class='active'>"+data.descriptiveMetadata[0].shelfLocator.displayForm+"</li></ol>";
    }
    $('#doc-breadcrumb').html(breadcrumbHTML);

    $('#about-header').html(context.itemTitle+ " ("+data.descriptiveMetadata[0].shelfLocator.displayForm+")");
    $('#about-imagerights').html(data.descriptiveMetadata[0].displayImageRights);
    try {
        $('#about-abstract').html(data.descriptiveMetadata[0].abstract.displayForm);
    } catch (ex) { /* ignore, not all items have value */}
    if (data.descriptiveMetadata[0].docAuthority) {
        $('#about-docAuthority').html("<p class='about-docAuthority'>"+data.descriptiveMetadata[0].docAuthority+"</p>");
    }
    if (data.completeness) {
        $('#about-completeness').html("<p>"+data.completeness+"</p>");
    }

    try {
        // Set contents panel
        function addTreeNodes(array, edgeSpacing) {
            let list = "";
            for (var i = 0; i < array.length; i++) {
                list = list.concat("<a href='' onclick='store.loadPage("
                        + (array[i].startPagePosition)
                        + ");return false;' class='list-group-item'>"+edgeSpacing
                        + array[i].label
                        +" <span class='about-content-page'>"
                        +"(image "+ array[i].startPagePosition
                        +", page "+ array[i].startPageLabel+")</span>"
                        +" </a> ");
                if (array[i].children) {
                    list = list.concat(addTreeNodes(array[i].children, edgeSpacing.concat(" &nbsp;&nbsp;&nbsp; ")));
                }
            }
            return list;
        }
        var contents = "<div class=\"list-group\">"
                + addTreeNodes(data.logicalStructures[0].children, "") + "</div>";
        $('#contentstab').html(contents);
    } catch (ex) { /* ignore, no contents list */
    }

    // Enable / disable menus
    // Note not all pages may have a transcription/translation however
    // We are enabling the menu if any are available.

    if (typeof data.useDiplomaticTranscriptions == 'undefined' || !data.useDiplomaticTranscriptions) {
        $('#transcriptiondiplotab').parent().addClass("disabled");
        $('#transcriptiondiplotab').click(function(e){return false;}); // disable link;
    }

    if (typeof data.useTranslations == 'undefined' || !data.useTranslations) {
        $('#translationtab').parent().addClass("disabled");
        $('#translationtab').click(function(e){return false;}); // disable link;
    }

    if (!data.logicalStructures[0].children) {
        $('#rightTabs a[href="#contentstab"]').parent().addClass("disabled");
        $('#rightTabs a[href="#contentstab"]').click(function(e){return false;}); // disable link;
    }

    // NB: This will disable thumbnails if the first page has no image. This assumes that
    // the there are documents either with a complete set of thumbnails or no thumbnails.
    if (typeof data.pages[0].IIIFImageURL == 'undefined') {
        $('#rightTabs a[href="#thumbnailstab"]').parent().addClass("disabled");
        $('#rightTabs a[href="#thumbnailstab"]').click(function(e){return false;}); // disable link;
    }

    function setPanelState(open) {
        $(document.body).toggleClass('panel-open', open)
                        .toggleClass('panel-closed', !open);
    }

    // setup toggle behaviour
    var infoPanelExpanded = $(window).width() >= 760;

    // ensure the clases are present
    setPanelState(infoPanelExpanded);

    function toggleRightPanel() {
        infoPanelExpanded = !infoPanelExpanded;
        setPanelState(infoPanelExpanded);
    }
    $('.right-panel .toggle-btn').click(toggleRightPanel);

    // tab content needs fixed height for scrolling
    function resizeRightPanel() {
    if (!$('.fullpage').length) {
            let height = $(window).height() -
                $('.navbar-header').outerHeight() -
                $('#doc-breadcrumb').outerHeight() -
                $('#rightTabs .nav-tabs').outerHeight() -
                $('#use').outerHeight();
            $('#tab-content').height(height);
        }
    };

    $(window).resize(resizeRightPanel);

    resizeRightPanel();
};

/* Allows you to link to a tab panel */
function showPanel(panelHREF) {

    $('a[href="' + panelHREF + '"]').tab('show');

};

function addBookmark() {
    let pageNum = viewerModel.getPageNumber(),
        data = viewerModel.getMetadata();

    // Generate bookmarkPath
    // thumbnailImage should be e.g."MS-ADD-03996-000-00001.jp2" as we
    // cannot always generate this from the itemid and pagenum.
    var thumbnailImage = data.pages[pageNum-1].IIIFImageURL;
    var bookmarkPath = "/mylibrary/addbookmark/?itemId="+context.docId+"&page="+pageNum+"&thumbnailImage="+encodeURIComponent(thumbnailImage);

    // ajax call to make the bookmark:
    $.post(bookmarkPath).done(function(xml) {

        // parse JSON response.
        if (xml.bookmarkcreated==true) {

            //created bookmark successfully.
            $('#bookmarkConfirmation').hide();
            window.confirm('Added Bookmark Successfully.');
            return true;
        } else {
            //failed to create bookmark so manually redirect to login page
            $('#bookmarkConfirmation').hide();
            window.location.href = bookmarkPath+"&redirect=true";
        }

    });

    // failed to create bookmark.
    return false;

}

function downloadPregeneratedImage() {
    let pageNum = viewerModel.getPageNumber(),
        data = viewerModel.getMetadata();

    var downloadImageURL = data.pages[pageNum-1].downloadImageURL;
    if (typeof downloadImageURL != "undefined") {
        window.open(context.imageServer+downloadImageURL);
    } else {
        alert ("No image available to download.");
    }
}

function downloadImage(size) {
    let pageNum = viewerModel.getPageNumber(),
        data = viewerModel.getMetadata(),
        iiifImageServer = context.iiifImageServer;

    if(!context.iiifEnabled==true)
        alert ("No IIIF image available to download.");

    else {
        let downloadImagePath = data.pages[pageNum-1].IIIFImageURL;

        if (typeof downloadImagePath != "undefined") {
            let downloadImageUrl = iiifImageServer+downloadImagePath+'/full/!'+size+','+size+'/0/default.jpg';

            window.open(downloadImageUrl);
        } else {
            alert ("No image available to download.");
        }
    }

}


function downloadMetadata() {
    let downloadMetadataURL = viewerModel.getMetadata().sourceData;

    if(downloadMetadataURL)
        window.open(context.services + downloadMetadataURL);
    else
        alert("No metadata available to download.");
}

function fullDocumentPdf() {
    let fullDocumentPdfURL = "/pdf/"+viewerModel.getDocId();
    window.open(fullDocumentPdfURL);
}

function setupThumbnails(data) {

    var props = thumbnailProps;
    props.NUM_THUMBNAIL_PAGES = 1;

    if (data.numberOfPages > props.MAX_THUMBNAIL_ITEMS_ON_PAGE) {
        props.NUM_THUMBNAIL_PAGES = Math.ceil(data.numberOfPages /
            props.MAX_THUMBNAIL_ITEMS_ON_PAGE);
    }
    // create the pagination

    let pagination = paginationTemplate({
        pages: range(1, props.NUM_THUMBNAIL_PAGES + 1)
    });

    $('#thumbnailpaginationtop,#thumbnailpaginationbottom')
        .html(pagination)
        .on('click', 'li', e => {
            let li = $(e.currentTarget);
            let page;

            if(li.is('.thumbnailpaginationstart'))
                page = currentThumbnailPage - 1;
            else if(li.is('.thumbnailpaginationend'))
                page = currentThumbnailPage + 1;
            else
                page = parseInt(li.data('page'));

            showThumbnailPage(page);
        });
};


function showThumbnailPage(pagenum) {

    /**
     * PageNum should be between 1 and NUM_THUMBNAIL_PAGES
     */
    function showThumbnailPageImages(props, pageNum, data) {

        // find the startIndex and endIndex for the data items we want to display
        // thumbnails of.
        var startIndex = props.MAX_THUMBNAIL_ITEMS_ON_PAGE * (pageNum - 1);
        var endIndex = Math.min((props.MAX_THUMBNAIL_ITEMS_ON_PAGE * pageNum) - 1,
            data.pages.length - 1);
        var thumbnailhtml = "";

        for (let i = startIndex; i <= endIndex; i++) {

            // start
            if (i === startIndex) {
                thumbnailhtml = thumbnailhtml
                    .concat("<div class='thumbnail-pane' id='thumbnail"
                        + pageNum + "'>");
            }
           

            // Setup text direction
            if (i === startIndex || ((i) % props.MAX_THUMBNAIL_ITEMS_ON_ROW) === 0) {
                if (typeof data.textDirection !== 'undefined' && data.textDirection === 'R') {
                    thumbnailhtml = thumbnailhtml.concat("<div class='row row-right-to-left'>");
                } else {
                    thumbnailhtml = thumbnailhtml.concat("<div class='row'>");
                }
            }

            // Setup orientation
            let thumbnailURL = context.iiifImageServer + data.pages[i].IIIFImageURL;
            if (data.pages[i].thumbnailImageOrientation === "portrait") {
                thumbnailURL = thumbnailURL.concat("/full/,150/0/default.jpg' style='height:150px");
            } else {
                thumbnailURL = thumbnailURL.concat("/full/150,/0/default.jpg' style='width:150px");
            }

            thumbnailhtml = thumbnailhtml
                .concat("<div class='col-md-4'><a href='' onclick='store.loadPage("
                    + (data.pages[i].sequence) + ");return false;' class='thumbnail'>" +
                    "<img src='" + thumbnailURL + "'> "
                    + "<div class='caption'>" + data.pages[i].label + "</div></a></div>");

            // finish
            if (i === endIndex
                || ((i) % props.MAX_THUMBNAIL_ITEMS_ON_ROW) === props.MAX_THUMBNAIL_ITEMS_ON_ROW - 1) {
                thumbnailhtml = thumbnailhtml.concat("</div>");
            }
            if (i === endIndex) {
                thumbnailhtml = thumbnailhtml.concat("</div>");
            }
        }

        $('#thumbnailimages').html(thumbnailhtml);
    }

    if (pagenum > 0 && pagenum <= thumbnailProps.NUM_THUMBNAIL_PAGES) {
        currentThumbnailPage = pagenum;
        showThumbnailPageImages(
            thumbnailProps, currentThumbnailPage, viewerModel.getMetadata());

        // Update pagination page selected
        $("#thumbnails-content ul.pagination li.active").removeClass('active');
        $(`#thumbnails-content ul.pagination .thumbnailpaginationitem[data-page=${pagenum}]`)
            .addClass("active");

    }
};

function setupMetadata(data) {

    // set content of more info tab.
    $('#metadatacontent').html("<ul>"+ getHTMLForLogicalStructure(data.logicalStructures, 0, Number.MAX_VALUE)+"</ul>");


    function getHTMLForLogicalStructure(array, level, maxlevel) {

        var html = "";

        for (var i=0; i<array.length; i++) {

            var meta = findDescriptiveMetadata(array[i].descriptiveMetadataID, data);
            html = html.concat("<div class=\"panel-group\" id=\"accordion\"><div class=\"panel panel-default\" id=\"panel"+escape(array[i].descriptiveMetadataID).replace(/%/g, "")+"\">");
            html = html.concat("<div class=\"panel-heading\"><h4 class=\"panel-title\">");
            //html = html.concat("<a data-toggle=\"collapse\" data-target=\"#collapse"+array[i].descriptiveMetadataID+"\" href=\"#collapse"+array[i].descriptiveMetadataID+"\">");
            if (level==0) {
                html = html.concat("Information about this document"); // title for full document metadata
            } else {
                html = html.concat("Section shown in images "+array[i].startPagePosition+" to "+array[i].endPagePosition);
            }
            //html = html.concat("</a>");
            html = html.concat("</h4></div><div id=\"collapse"+array[i].descriptiveMetadataID+"\" class=\"panel-collapse collapse in\"><div class=\"panel-body\">");
            html = html.concat("<ul>"+getHTMLForDescriptiveMetadata(meta)+"</ul>");
            html = html.concat("</div></div></div></div>");

            if (array[i].children && level<maxlevel) {
                level = level+1;
                html = html.concat(getHTMLForLogicalStructure(array[i].children, level, maxlevel));
            }
        }
        return html;
    }

    function findDescriptiveMetadata (id, data) {

        for ( var i = 0; i < data.descriptiveMetadata.length; i++) {
            if (data.descriptiveMetadata[i].ID == id) {
                return data.descriptiveMetadata[i];
            }
        }
    }

    function getHTMLForDescriptiveMetadata(descriptiveMetadata) {
        var metadata = "";

        var metadataArray = getArrayFromDescriptiveMetadata(descriptiveMetadata);
        metadataArray = metadataArray.sort(function (a,b) {if (a.seq && b.seq) {return a.seq-b.seq;}});

        for (var i=0; i<metadataArray.length; i++) {
            var jsonObject = metadataArray[i];

                if (jsonObject.display == true && jsonObject.label) {

                    // prioritise displayForm at top level.
                    if (jsonObject.displayForm) {

                        metadata += getMetadataHTML(jsonObject.label, jsonObject.displayForm);

                    // then display value (if an array)
                    } else if (jsonObject.value
                            && jsonObject.value instanceof Array) {

                        metadata += getMetadataHTML(jsonObject.label, jsonObject.value, "; ");
                    }

                }
        }

        return metadata;
        //return "<li>"+descriptiveMetadata.title.displayForm+"</li>";
    }

    /**
     * Converts the metadata item into HTML representation.
     *
     * @param title -
     *            Text for the label
     * @param metadataItem -
     *            Metadata item to display
     * @param arraySeparator -
     *            for arrays this is the text that will separate items.
     * @returns
     */
    function getMetadataHTML(title, metadataItem, arraySeparator) {

        var item = metadataItem;

        if (metadataItem instanceof Array) {

            var metadataArray = new Array();
            for ( var i = 0; i < metadataItem.length; i++) {

                var singleMetadataItem = metadataItem[i].displayForm;
                var searchLink = (metadataItem[i].linktype == "keyword search");
                if (searchLink) {
                    metadataArray[i] = addSearchLink(singleMetadataItem);
                } else {
                    metadataArray[i] = singleMetadataItem;
                }
            }

            if (metadataArray.length > 0) {
                item = metadataArray.join(arraySeparator);
            }

            // Not an array, a single item.
        } else {
            var searchLink = (metadataItem.linktype == "keyword search");
            if (searchLink) {
                item = addSearchLink(metadataItem);
            } else {
                item = metadataItem;
            }
        }

        if (item != "") {
            return "<li><div><b>" + title + ": </b>" + item
                    + "</div></li>\n";
        }

        return "";
    }

    function addSearchLink (text) {

        var linkText = text;

        // manually escape the special search characters ? and *.
        if (linkText.indexOf("?")!=-1){
            linkText = linkText.replace("?", "\\?");
            }
        if (linkText.indexOf("*")!=-1){
            linkText = linkText.replace("*", "\\*");
            }

        linkText = encodeURIComponent(linkText);

        return "<a class=\"cudlLink\" href='/search?keyword=" + linkText
                + "'>" + text + "</a>";
    }


    /**
     * Used to go through each element in a single descriptiveMetadata item and look for
     * suitable candidates to display.  These are put into an array for sorting.
     * Suitable json objects have - display=true, seq and label fields.
     * Returns an array of json objects.
     */
    function getArrayFromDescriptiveMetadata(descriptiveMetadata) {

        var metadataArray = new Array();
        for ( var key in descriptiveMetadata) {
            if (descriptiveMetadata.hasOwnProperty(key) ) {
                var jsonObject = descriptiveMetadata[key];

                // Handle case where there is no label at the top level, but there exists an
                // array of objects under value that may have labels, display values or arrays of
                // value strings to display.
                if (!jsonObject.label && jsonObject.value && jsonObject.value instanceof Array) {
                  for (var i=0; i<jsonObject.value.length; i++) {
                    var value = jsonObject.value[0];
                    metadataArray = metadataArray.concat(getArrayFromDescriptiveMetadata(jsonObject.value[i]));
                  }
                }


                if (jsonObject.display==true && jsonObject.label && jsonObject.seq) {
                     metadataArray.push(jsonObject);
                }
            }
        }
        return metadataArray;
    }
}

/**
 * Takes in an array of logical structures and a page number.
 * Applies the panel-info style to logicalStructures that are relevant to the specified page.
 * Note special characters are removed from the descriptiveMetadataID used to identify the logical structure
 * as these are not supported by jquery functions used.
 */
function highlightMetadataForPageViewed(pageNumber, logicalStructures) {
    var lsArray = new Array();
    for ( var i = 0; i < logicalStructures.length; i++) {
        var ls = logicalStructures[i];

        if (ls.startPagePosition <= pageNumber
                && ls.endPagePosition >= pageNumber) {

            $('#panel'+escape(ls.descriptiveMetadataID).replace(/%/g, "")).addClass("panel-info");
            $('#panel'+escape(ls.descriptiveMetadataID).replace(/%/g, "")).clone().appendTo('#about-metadata');

        } else {

            if ($('#panel'+escape(ls.descriptiveMetadataID).replace(/%/g, "")).hasClass("panel-info")) {
              $('#panel'+escape(ls.descriptiveMetadataID).replace(/%/g, "")).removeClass("panel-info");
            }
        }

        if (ls.children) {
            highlightMetadataForPageViewed(pageNumber, ls.children);
        }

    }
}

function setTranscriptionPage(data, pagenum) {

    // check for existance of transcription frame, if not,
    // then in fullscreen mode so do nothing.
    if (!document.getElementById('transcriptiondiploframe')) {
        return;
    }

    // Define defaults for pages without transcriptions/text
    let iframeData = {
        "transcription": {
            "id": "transcriptiondiploframe",
            "src": "data:text/html;charset=utf-8," + encodeURIComponent(writeBlankPage(pagenum, 'No transcription available for this image'))
        },
        "translation": {
            "id": "translationframe",
            "src": "data:text/html;charset=utf-8," + encodeURIComponent(writeBlankPage(pagenum, 'No translation available for this image'))
        }
    };
    // diplomatic transcriptions
    var url = data.pages[pagenum - 1].transcriptionDiplomaticURL;
    if (typeof url != 'undefined' && typeof data.allTranscriptionDiplomaticURL == 'undefined') {
        iframeData.transcription.src = new URL(url, context.services)
    }

    // translation
    var url = data.pages[pagenum - 1].translationURL;
    if (typeof url != 'undefined') {
        iframeData.translation.src = new URL(url, context.services)
    }

    // set all diplomatic transcriptions (all transcriptions on one page)
    var url = data.allTranscriptionDiplomaticURL;
    if (typeof url != 'undefined') {
        iframeData.transcription.src = new URL(url, context.services);
    }

    // Generate iframes using hash
    for (let key in iframeData) {
        let targetIframe = $('#' + iframeData[key].id);
        let newIframe = targetIframe.clone();
        newIframe.attr('src', iframeData[key].src);
        targetIframe.replaceWith(newIframe);
    }

    let diploFrame = $("#transcriptiondiploframe")[0];
    diploFrame.onload = function() { setupTranscriptionCoords(); }

}

function writeBlankPage(pagenum, message = "") {
    return '<!DOCTYPE html><html>'
        + '<head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8">'
        + '<title>Image #'+pagenum+'</title>'
        + '<link href="https://services.prod.env.cudl.link/v1/transcription/tei/resources/cudl-resources/stylesheets/texts.css" rel="stylesheet" type="text/css">'
        + '</head>'
        + '<body class="junicode"><div class="transcription">'
        + message
        + '</div></body></html>'
}

function setupViewMoreOptions() {
    $('#downloadOption a').on('click', e => {
        $('#downloadConfirmation').show();
        return false;
    });
    setupDownloadConfirmation();

    $('#singlePagePdfDownloadOption a').on('click', e => {
        $('#singlePagePdfConfirmation').show();
        return false;
    });
    setupSinglePagePdfDownloadConfirmation();

    $('#fullDocumentPdfDownloadOption a').on('click', e => {
        $('#fullDocumentPdfConfirmation').show();
        return false;
    });
    setupFullDocumentPdfDownloadConfirmation();

    if(!isLoggedIn()) {
        $('#bookmarkOption').hide();
    }

    $('#bookmarkOption a').on('click', e => {
        $('#bookmarkConfirmation').show();
        return false;
    });
    setupBookmarkConfirmation();

    $('#downloadMetadataOption a').on('click', e => {
        $('#downloadMetadataConfirmation').show();
        return false;
    });
    setupDownloadMetadataConfirmation();

    if (!context.iiifEnabled==true) {
        $('#iiifOption').hide();
    } else {
        $('#iiifOption a').on('click', e => {
            window.open(context.iiifManifestURL);
            return false;
        });
    }

    if (!context.iiifEnabled==true) {
        $('#miradorOption').hide();
    } else {
        $('#miradorOption a').on('click', e => {
            window.open(context.iiifMiradorURL);
            return false;
        });
    }
}

function setupConfirmation(confirmation) {
    confirmation.find('.close,button:not(.btn-success)').on('click', () => {
        confirmation.hide();
        return false;
    });
}

function setupDownloadConfirmation() {
    let confirmation = $('#downloadConfirmation');

    setupConfirmation(confirmation);

    confirmation.find('button.btn-success').on('click', () => {
        confirmation.hide();
        // TODO switch back to sized download for images when watermarking/rights sorted.
        //let imageSize = confirmation.find('#downloadSizes option:selected' ).val();
        //downloadImage(imageSize);
        downloadPregeneratedImage();
        return false;
    });
}

function setupSinglePagePdfDownloadConfirmation() {
    let confirmation = $('#singlePagePdfConfirmation');
    setupConfirmation(confirmation);

    confirmation.find('button.btn-success').on('click', () => {
        confirmation.hide();
        let singlePagePdfURL = "/pdf/"+viewerModel.docId+"/"+viewerModel.getPageNumber();
        window.open(singlePagePdfURL);
    });
}

function setupFullDocumentPdfDownloadConfirmation() {
    let confirmation = $('#fullDocumentPdfConfirmation');
    setupConfirmation(confirmation);

    confirmation.find('button.btn-success').on('click', () => {
        confirmation.hide();
        fullDocumentPdf();
        return false;
    });
}

function setupBookmarkConfirmation() {
    let confirmation = $('#bookmarkConfirmation');

    setupConfirmation(confirmation);

    confirmation.find('button.btn-success').on('click', () => {
        confirmation.hide();
        addBookmark();
        return false;
    });
}

function setupDownloadMetadataConfirmation() {
    let confirmation = $('#downloadMetadataConfirmation');

    setupConfirmation(confirmation);

    confirmation.find('button.btn-success').on('click', () => {
        confirmation.hide();
        downloadMetadata();
        return false;
    });
}

function setupKnowMoreLinks() {
    $('#know-more a.show-metadata').on('click', () => {
        showPanel('#metadata');
        return false;
    });

    $('#know-more a.show-download').on('click', () => {
        showPanel('#download');
        return false;
    });
}

window.showPoints = function showPoints(points)
{
    showPolygon(points);
}

function setupMessaging() {
    if (window.addEventListener) {
        window.addEventListener("message", onMessage, false);
    } else if (window.attachEvent) {
        window.attachEvent("onmessage", onMessage, false);
    }
}

function onMessage(event) {
    // Check sender origin to be trusted
    if (event.origin !== "http://localhost:3000") return;

    var data = event.data;

    if (typeof(window[data.func]) == "function") {
        window[data.func].call(null, data.message);
    }
}

function setupTranscriptionCoords() {

    setupMessaging();
    d3.selectAll('polygon').remove();
    overlay = null;

}


let overlay = null;
function showPolygon(points) {

    console.log(viewer);
    let data = viewerModel.getMetadata();
    let pagenumber = context.pageNum;
    let imageHeight = data.pages[pagenumber-1].imageHeight/1.66;
    let imageWidth = data.pages[pagenumber-1].imageWidth;

    // Translate Coords
    let coords = points.split(" ");
    let viewerPoints = "";
    for (let i=0; i<coords.length; i++) {
        let coord = coords[i];
        let point = coord.split(",")
        viewerPoints += Number(point[0])/imageHeight+","+(Number(point[1])/imageWidth);
        if (i+1<coords.length) {
            viewerPoints += " ";
        }
    }

    // Remove any existing polygons
    if (overlay == null) {
        overlay = viewer.svgOverlay();
    } else {
        d3.selectAll('polygon').remove();
    }

    let d3Poly = d3.select(overlay.node()).append("polygon")
        .style('fill', '#6eadcc')
        .attr("points",viewerPoints)
        .style("opacity", 0.3);

    overlay.onClick(d3Poly.node(), function() {
        console.log('click', arguments);
    });

    $(window).resize(function() {
        overlay.resize();
    });
}

$(document).ready(function() {
    registerCsrfPrefilter();

    context = getPageContext();
    let pageNum = context.pageNum;

    // Read in the JSON
    $.getJSON(context.jsonURL).done(function(data) {

        // set seadragon options and load in image.
        if(pageNum === 0) { pageNum = 1; } // page 0 returns item level metadata.

        viewerModel = new ViewerModel({
            rootURL: context.rootURL,
            docId: context.docId,
            pageNumber: pageNum,
            metadata: data,
            taggingEnabled: context.taggingEnabled
        });

        setupSeaDragon(data);
        setupInfoPanel(data);
        setupThumbnails(data);
        setupMetadata(data);
        setupViewMoreOptions();
        setupKnowMoreLinks();

        // // FIXME: load on demand when similarity tab is first opened
        // setupSimilarityTab({
        //     viewerModel: viewerModel,
        //     docId: context.docId,
        //     servicesBaseUrl: context.services,
        //     imageServerBaseUrl: context.imageServer
        // });

        // // FIXME: load on demand if tagging is enabled.
        // setupTaggingTab({
        //     docId: context.docId,
        //     viewer: viewer,
        //     viewerModel: viewerModel
        // });

        loadPage(pageNum);
        showThumbnailPage(currentThumbnailPage);
    });
});
