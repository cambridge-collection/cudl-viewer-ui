/**
 * This is the entry point for the document page. This page displays a single
 * CUDL item with the zooming image viewer.
 */

// Page styles
import '../../css/style-document.css';
import 'jquery-ui/themes/base/slider.css';
import 'jquery-ui/dist/themes/base/jquery-ui.min.css';
import 'jquery-ui/dist/themes/base/theme.css';
import '@fortawesome/fontawesome-free/css/fontawesome.min.css'
import 'font-awesome/css/font-awesome.min.css';

import $ from 'jquery';
import 'jquery-ui/ui/widgets/slider';
import OpenSeadragon from 'openseadragon';
import * as Overlay from '../openseadragon-svg-overlay';
import * as d3 from 'd3';
import range from 'lodash/range';

//import '../cudl';
//import { msgBus } from '../cudl';
import { getPageContext } from '../context';
import paginationTemplate from './document-thumbnail-pagination.jade';
import { ViewerModel } from '../viewer/models';
import '../cookie-banner-config';

const bootstrap = require('bootstrap/dist/js/bootstrap.bundle.min.js');
/*
    We have the following attributes set by the Java in the context JSON.

    jsonURL
    jsonThumbURL
    pageNum
    docId
    docURL - not used
    imageServer
    rtiImageServer
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
    servicesURL
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

const IIIF_COPY_SIZE = 2000;
let copyIiifUrlButton;

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
        // hide rti
        document.getElementById("rti").style.display = "none";
        document.getElementById("seadragon").style.display = "";
        viewer.open(iiifPath + "/info.json");
    }
    function openRTI(docId, pageNum) {
        document.getElementById("seadragon").style.display = "none";
        document.getElementById("rti").style.display = "";
        document.getElementById("rti").innerHTML = `
            <iframe
        src="/view/rti/${docId}/${pageNum}"
        width="100%"
        height="100%"
        style="border:none;">
            </iframe>
                `;
    }

    // open Main Image
    let mainDisplay = "iiif"
    if (typeof(data.pages[pagenumber-1].mainDisplay) != "undefined" ) {
        mainDisplay = data.pages[pagenumber-1].mainDisplay;
    }

    if (imageavailable && mainDisplay === "rti") {

        openRTI(context.docId, pagenumber);
    } else {
        let iiifURL =  data.pages[pagenumber - 1].IIIFImageURL;
        // override default iiif image server if specified
        if (!iiifURL.startsWith("http")) {
            iiifURL = context.iiifImageServer+iiifURL;
        }
        openIIIF(iiifURL);
    }

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

    context.pageNum = pagenumber;
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

}

// Viewport navigator is a mini viewer that appears inside the main OpenSeadragon viewer
function showViewportNavigator() {
    return !!context.viewportNavigatorEnabled;
}

function setupRTI(data, pageNum) {
    const container = document.getElementById("rti");
    if (container) {
        container.innerHTML = `
      <iframe        
        src=""
        width="100%"
        height="100%"
        style="border:none;">
      </iframe>
    `;
    } else {
        console.warn("Element with id='doc' not found.");
    }
}
function setupSeaDragon(data) {
    OpenSeadragon.setString("Tooltips.Home", "Reset zoom");
    let showNav = showViewportNavigator();
    viewer = new OpenSeadragon.Viewer({
        id : "seadragon",
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

    let breadcrumbHTML = "<ol class=\"breadcrumb notBreadcrumb\">"
            + "<li class=\"breadcrumb-item\"><a href='/'>Home</a></li>"
            + "<li class=\"breadcrumb-item\"><a href=\"/collections/\">Browse</a></li>"
            /*+ "<li class=\"breadcrumb-item\"><a href=\""
            + context.collectionURL
            + "\">"
            + context.collectionTitle
            + "</a></li>" */
            + "<li class='breadcrumb-item active'>"+data.descriptiveMetadata[0].shelfLocator.displayForm+"</li></ol>";
    if (context.parentCollectionTitle) {
        breadcrumbHTML = "<ol class=\"breadcrumb notBreadcrumb\"><li class=\"breadcrumb-item\"><a href='/'>Home</a></li>"
                + "<li class=\"breadcrumb-item\"><a href=\"/collections/\">Browse</a></li>"
                /*+ "<li class=\"breadcrumb-item\"><a href=\""
                + context.parentCollectionURL
                + "\">"
                + context.parentCollectionTitle
                + "</a></li><li class=\"breadcrumb-item\"><a href=\""
                + context.collectionURL
                + "\">"
                + context.collectionTitle + "</a></li>" */
                + "<li class='active breadcrumb-item'>"+data.descriptiveMetadata[0].shelfLocator.displayForm+"</li></ol>";
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
        $('#transcriptiondiplotab').addClass("disabled");
        $('#transcriptiondiplotab').click(function(e){return false;}); // disable link;
    }

    if (typeof data.useTranslations == 'undefined' || !data.useTranslations) {
        $('#translationtab').addClass("disabled");
        $('#translationtab').click(function(e){return false;}); // disable link;
    }

    if (!data.logicalStructures[0].children) {
        $('#rightTabs a[href="#contentstab"]').addClass("disabled");
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

    const triggerEl = document.querySelector('a[href="'+panelHREF+'"]');
    bootstrap.Tab.getOrCreateInstance(triggerEl).show();

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
    var iiifImageURL = data.pages[pageNum-1].IIIFImageURL;
    if (typeof downloadImageURL != "undefined") {
        if (!downloadImageURL.startsWith("http")) {
            downloadImageURL = context.imageServer+"/content/images/"+downloadImageURL+".jpg";
        } else {
            // If starts with http, build IIIF URL.
            downloadImageURL = iiifImageURL+"/full/full/0/default.jpg";
        }
        window.open(downloadImageURL);
    } else {
        alert ("No image available to download.");
    }
}

function forceDownloadBlob(url, filename) {
    fetch(url, { mode: 'cors' })
        .then(response => response.blob())
        .then(blob => {
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = filename || 'download';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(blobUrl);
        });
}

function downloadImage(size) {
    let pageNum = viewerModel.getPageNumber(),
        data = viewerModel.getMetadata(),
        servicesURL = context.services;

    if (isNaN(size)) {
        throw new Error("Invalid Input");
    }

    // If full download link in metadata (e.g. external IIIF) use this.
    let downloadImagePath = data.pages[pageNum-1].IIIFImageURL;
    let filename = data.pages[pageNum-1].downloadImageURL;

    if (typeof downloadImagePath != "undefined" && downloadImagePath.startsWith("http")) {
        // If starts with http, build IIIF URL.
        let downloadImageLink = downloadImagePath + '/full/!' + size + ',' + size + '/0/default.jpg';
        forceDownloadBlob(downloadImageLink, `${filename}.jpg`);
    } else {
        // Use internal image download (through services)
        let servicesDownloadPath = servicesURL + "/v1/images/download/";
        let downloadImageLink = servicesDownloadPath + context.docId + "/" + pageNum;
        forceDownloadBlob(downloadImageLink, `${filename}.jpg`);
    }
}

function buildIiifImageUrlForCopy(size = IIIF_COPY_SIZE) {
    let iiifUrl = null;
    const hasViewer = !!viewerModel;

    if (hasViewer) {
        const metadata = viewerModel.getMetadata();
        const pages = metadata?.pages;
        const hasPages = Array.isArray(pages) && pages.length > 0;

        if (hasPages) {
            const pageIndex = viewerModel.getPageNumber() - 1;
            const withinBounds = pageIndex >= 0 && pageIndex < pages.length;

            if (withinBounds) {
                const page = pages[pageIndex] || {};
                let iiifBase = page.IIIFImageURL || null;

                if (iiifBase) {
                    iiifBase = iiifBase.replace(/\/$/, '').replace(/\/info\.json$/i, '');

                    if (!iiifBase.startsWith('http')) {
                        const hasServer = !!context?.iiifImageServer;

                        if (hasServer) {
                            const server = context.iiifImageServer.replace(/\/$/, '');
                            const identifier = iiifBase.replace(/^\//, '');
                            iiifBase = `${server}/${identifier}`;
                        } else {
                            iiifBase = null;
                        }
                    }

                    if (iiifBase) {
                        if (!/\.jp2(?:$|\/)/i.test(iiifBase)) {
                            iiifBase = `${iiifBase}.jp2`;
                        }

                        if (iiifBase) {
                            iiifUrl = `${iiifBase}/full/,${size}/0/default.jpg`;
                        }
                    }
                }
            }
        }
    }

    return iiifUrl;
}

function copyIiifUrlToClipboard(text) {
    let resultPromise;
    const clipboardApiAvailable = !!navigator?.clipboard?.writeText;

    if (clipboardApiAvailable) {
        resultPromise = navigator.clipboard.writeText(text);
    } else {
        resultPromise = new Promise((resolve, reject) => {
            const textarea = document.createElement('textarea');
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();

            try {
                const successful = document.execCommand('copy');
                document.body.removeChild(textarea);
                if (successful) {
                    resolve();
                } else {
                    reject(new Error('Copy command unsuccessful'));
                }
            } catch (error) {
                document.body.removeChild(textarea);
                reject(error);
            }
        });
    }

    return resultPromise;
}

function updateCopyIiifButtonState(button = copyIiifUrlButton) {
    const buttonRef = button && button.length ? button : null;

    if (buttonRef) {
        const queuedReset = buttonRef.data('resetTimeout');
        if (queuedReset) {
            return;
        }

        buttonRef.removeClass('btn-secondary').addClass('btn-secondary-outline');
        buttonRef.data('originalClassList', buttonRef.attr('class'));

        const url = buildIiifImageUrlForCopy();
        const hasUrl = !!url;
        buttonRef.prop('disabled', !hasUrl);
        buttonRef.data('iiifUrl', url || '');
        buttonRef.toggle(hasUrl);
    }
}

function showCopyIiifButtonFeedback(button, delay = 200) {
    const buttonRef = button && button.length ? button : null;

    if (buttonRef) {
        const originalClasses = buttonRef.data('originalClassList') || buttonRef.attr('class');
        buttonRef.data('originalClassList', originalClasses);

        buttonRef.removeClass('btn-secondary-outline').addClass('btn-secondary');

        const previousTimeout = buttonRef.data('resetTimeout');
        if (previousTimeout) {
            clearTimeout(previousTimeout);
        }

        const timeoutId = setTimeout(() => {
            const original = buttonRef.data('originalClassList');
            if (original) {
                buttonRef.attr('class', original);
            }
            buttonRef.removeData('resetTimeout');
        }, delay);

        buttonRef.data('resetTimeout', timeoutId);
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
            let thumbnailURL = data.pages[i].IIIFImageURL;
            if (!thumbnailURL.startsWith("http")){
                thumbnailURL = context.iiifImageServer+thumbnailURL;
            }
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
            html = html.concat("<ul>"+getHTMLForDescriptiveMetadata(meta));
            const collectionObjs = data.collection?.filter(o => !!o['name-short']?.trim()).sort((a, b) =>
    a['name-short'].trim().localeCompare(b['name-short'].trim(), undefined, { sensitivity: "base" }));
            if (level == 0 && collectionObjs?.length > 0 ) {
                html = html.concat('<li><b>');
                html = html.concat('Collection' + ((collectionObjs.length > 1) ? 's' : ''));
                html = html.concat(':</b> ');
                html = html.concat('<ul class="collections">');
                for (const c of collectionObjs) {
                    html = html.concat('<li><a href="/collections/' +encodeURI(c['url-slug'].trim()) +'/1">' + c['name-short'].trim() + '</a></li>');
                }
                html = html.concat('</ul>');
                html = html.concat('</li>');
            }
            html = html.concat("</ul>");
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
                    metadataArray[i] = addSearchLink(singleMetadataItem, title);
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
                item = addSearchLink(metadataItem, title);
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
        return addSearchLink(text, null);
    }

    function addSearchLink (text, title) {

        var linkText = text;

        // manually escape the special search characters ? and *.
        if (linkText.indexOf("?")!=-1){
            linkText = linkText.replace("?", "\\?");
            }
        if (linkText.indexOf("*")!=-1){
            linkText = linkText.replace("*", "\\*");
            }

        linkText = encodeURIComponent(linkText);

        // Check for Subject links
        if (title && title.toString().toLowerCase().includes("subject")) {
            return "<a class=\"cudlLink\" href='/search?facets=Subject%3A%3A"+linkText
                + "'>" + text + "</a>";
        }

        // Default to keyword search
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

    // Setup polygons for display
    setupTranscriptionCoords();

    let diploFrame = $("#transcriptiondiploframe")[0];
    diploFrame.onload = function() { resetPolygons(); }

}

function writeBlankPage(pagenum, message = "") {
    return '<!DOCTYPE html><html>'
        + '<head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8">'
        + '<title>Image #'+pagenum+'</title>'
        + '<link href="https://services.cudl.lib.cam.ac.uk/v1/transcription/tei/resources/html/cudl-resources/stylesheets/texts.css" rel="stylesheet" type="text/css">'
        + '</head>'
        + '<body class="junicode"><div class="transcription">'
        + message
        + '</div></body></html>'
}

function setupViewMoreOptions() {
    $('#downloadOption a').on('click', e => {
        updateCopyIiifButtonState(copyIiifUrlButton);
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
    confirmation.find('.close,button:not(.btn-success):not(.js-copy-iiif-url)').on('click', event => {
        event.preventDefault();
        confirmation.hide();
    });

    const existingNamespace = confirmation.data('outsideClickNamespace');
    if (existingNamespace) {
        $(document).off(existingNamespace);
    }

    const namespaceSuffix = confirmation.attr('id') || `confirmation-${Date.now()}`;
    const eventNamespace = `click.confirmationOutside-${namespaceSuffix}`;

    const outsideClickHandler = event => {
        if (!confirmation.is(':visible')) {
            return;
        }

        const target = $(event.target);
        if (!target.closest(confirmation).length) {
            confirmation.hide();
        }
    };

    confirmation.data('outsideClickNamespace', eventNamespace);
    $(document).on(eventNamespace, outsideClickHandler);
}

function setupDownloadConfirmation() {
    let confirmation = $('#downloadConfirmation');

    setupConfirmation(confirmation);

    if (!copyIiifUrlButton || !copyIiifUrlButton.length) {
        copyIiifUrlButton = $(`<button type="button" class="btn btn-secondary-outline js-copy-iiif-url" aria-label="Copy IIIF URL" title="Copy IIIF URL"><i class="fa fa-copy" aria-hidden="true"></i></button>`);
    }

    let successButton = confirmation.find('button.btn-success');
    if (successButton.length) {
        let buttonContainer = successButton.parent();
        if (buttonContainer.length) {
            copyIiifUrlButton.appendTo(buttonContainer);
        } else {
            successButton.after(copyIiifUrlButton);
        }
    } else {
        confirmation.append(copyIiifUrlButton);
    }

    copyIiifUrlButton.off('click').on('click', event => {
        event.preventDefault();
        const url = copyIiifUrlButton.data('iiifUrl');

        if (!url) {
            showCopyIiifButtonFeedback(copyIiifUrlButton);
        } else {
            copyIiifUrlToClipboard(url)
                .then(() => {
                    showCopyIiifButtonFeedback(copyIiifUrlButton);
                })
                .catch(() => {
                    showCopyIiifButtonFeedback(copyIiifUrlButton);
                })
                .then(() => {
                    updateCopyIiifButtonState(copyIiifUrlButton);
                });
        }
    });

    updateCopyIiifButtonState(copyIiifUrlButton);

    confirmation.find('button.btn-success').on('click', event => {
        event.preventDefault();
        confirmation.hide();
        // TODO switch back to sized download for images when watermarking/rights sorted.
        let imageSize = confirmation.find('#downloadSizes option:selected' ).val();
        downloadImage(imageSize);
        //downloadPregeneratedImage();
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

    // Check sender origin to be trusted.  Remove final slash if present.
    if (event.origin !== context.services.replace(/\/$/, "")) return;

    var data = event.data;

    if (typeof(window[data.func]) == "function") {
        window[data.func].call(null, data.message);
    }
}

function setupTranscriptionCoords() {

    setupMessaging();
}

function resetPolygons() {

    d3.selectAll('polygon').remove();
    overlay = null;
}


let overlay = null;
function showPolygon(points) {

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
        .style("opacity", 0.4);

    overlay.onClick(d3Poly.node(), function() {
        console.log('click', arguments);
    });

    $(window).resize(function() {
        overlay.resize();
    });
}

function hasRTIDisplay(data) {
    if (!data || !Array.isArray(data.pages)) {
        console.warn("Invalid JSON input.");
        return false;
    }
    return data.pages.some(page => page.mainDisplay === "rti");
}

function setupMainDisplay(data, pageNum) {
    if (hasRTIDisplay(data)) {
        setupRTI(data, pageNum);
    }
    setupSeaDragon(data);
}

$(document).ready(function() {
    //registerCsrfPrefilter();

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

        setupMainDisplay(data, pageNum);
        setupInfoPanel(data);
        setupThumbnails(data);
        setupMetadata(data);
        setupViewMoreOptions();
        setupKnowMoreLinks();

        loadPage(pageNum);
        showThumbnailPage(currentThumbnailPage);
    });
});
