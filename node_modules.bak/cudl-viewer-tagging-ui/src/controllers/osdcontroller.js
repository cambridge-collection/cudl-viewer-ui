import $ from 'jquery';
import OpenSeadragon from 'openseadragon';

/** controllers */
import Controller from './common/controller';

/** constants */
import { TOOLBAR } from '../models/consts';
import { PTYPES } from '../models/consts';
import { ICONS } from '../utils/base64icons';


export default class OSDController extends Controller {
    constructor(options) {
        super(options);
        this.osd = options.osd;

        // constants
        this.TOOLBAR = TOOLBAR;
        this.PTYPES  = PTYPES;
        this.ICONS   = ICONS;
    }

    setControllers(dialog_c, toolbar_c) {
        this.dialog_c  = dialog_c;
        this.toolbar_c = toolbar_c;
    }

    init() {
        this.addEventHandlers();
        return this;
    }

    addEventHandlers() {
        this.addCanvasHandler();
        this.addZoomPanHandler();
        this.addAnimationHandler();
        this.addMarkerHandler();
    }

    addCanvasHandler() {

        this.osd.addHandler('canvas-click', (target, info) => {

            if (target.quick == true) { // single click
                var position = target.position;
                this.actionOnCanvasClick( position );
            } else { // drag click

            }

            // // viewer element coordinates (pixel), origin point is top left corner of the container element
            // var elCoords = target.position; // e.g., a.Point {x: 150, y: 70}
            // // viewport coordinates (vector)
            // var viewportCoords = this.osd.viewport.pointFromPixel(elCoords); // e.g., a.Point {x: 0.014114694965758678, y: 0.10612159548329783}
            // // image coordinates (pixel)
            // var imgCoords = this.osd.viewport.viewportToImageCoordinates(viewportCoords.x, viewportCoords.y); //e.g., a.Point {x: 58.378378378377896, y; 438.9189189189198}
        });

    }

    addZoomPanHandler() {
        this.osd.addHandler('zoom', (target) => {
            this.actionOnZoomPanAnimation();
        });

        this.osd.addHandler('pan', (target) => {
            this.actionOnZoomPanAnimation();
        });
    }

    addAnimationHandler() {
        this.osd.addHandler('animation', (target) => {
            this.actionOnZoomPanAnimation();
        });

        this.osd.addHandler('animation-finish', (target) => {
            this.actionOnZoomPanAnimation();
        });

        this.osd.addHandler('animation-start', (target) => {
            this.actionOnZoomPanAnimation();
        });
    }

    addMarkerHandler() {

        $(this.osd.container).on('click', 'div[id^=osd-anno-marker]', e => {
            this.actionOnMarkerClick( e );
        });
    }

    /*************
     * action bit
     *************/

    actionOnCanvasClick(position) {

        var idx = this.toolbar_c.getActiveTbId();

        // clear guides
        this.clearGuides();

        var idx = this.toolbar_c.getActiveTbId();

        if ((idx[0] == this.TOOLBAR.PRIMARY.POINT || idx[0] == this.TOOLBAR.PRIMARY.REGION) && idx[1] >= 0) {
            // draw guides
            this.drawGuides(position, idx);

            // show dialog
            this.openDialog({
                target: idx[0],
                type: idx[1],
                position: position
            });
        }
    }

    actionOnZoomPanAnimation() {

        var idx = this.toolbar_c.getActiveTbId();

        if (idx[1] >= this.TOOLBAR.SECONDARY.PERSON) {

            // sync box helper and box overlay
            if (idx[0] == this.TOOLBAR.PRIMARY.REGION) {
                this.moveGuideBox();
            }
        }
    }

    actionOnMarkerClick(e) {

        // prevent event from bubbling
        e.preventDefault();
        e.stopPropagation();

        var el = e.target;

        // show info dialog
        this.openDialog({
            of: el,
            anno: {
                uuid:    $(el).data('uuid'),
                id:      $(el).data('id'),
                content: $(el).data('content')
            }
        });
    }

    /*************
     * dialog bit
     *************/

    openDialog(opts) {
        this.dialog_c.openDialog(opts);
    }

    /************
     * guide bit
     ************/

    drawGuides(position, idx) {

        // var idx = this.toolbar_c.getActiveTbId();

        if (idx[0] == this.TOOLBAR.PRIMARY.POINT) {
            var point = this.osd.viewport.pointFromPixel(position);

            // draw guide icon and line
            this.drawGuideIcon(point, idx[1]);
            this.drawGuideLine(point);
        } else if (idx[0] == this.TOOLBAR.PRIMARY.REGION) {
            // draw box and box helper
            this.drawGuideBox(position);
            setTimeout(e => {
                this.drawGuideBoxHelper();
            }, 100);
        }
    }

    /** show guide icon for point tagging */
    drawGuideIcon(point, type) {
        var icon = document.createElement("img");
        icon.id = 'osd-guide-icon';
        icon.className = 'osd-guide-icon';
        icon.src = this.getIconSrc( type );

        this.osd.addOverlay(icon, new OpenSeadragon.Point(point.x, point.y));
    }

    /** show guide line for point tagging */
    drawGuideLine(point) {
        var line = document.createElement("div");
        line.id = "osd-guide-line";
        line.className = 'osd-guide-line';

        this.osd.addOverlay(line, new OpenSeadragon.Point(point.x, point.y));
    }

    /** show guide box (invisible) for region tagging */
    drawGuideBox(point) {
        var box = document.createElement("div");
        box.id = "osd-guide-box";
        box.className = "osd-guide-box";

        var rect = this.getRectViewportCoords(point, 60, 60),
            OSDrect = new OpenSeadragon.Rect(rect[0], rect[1], rect[2], rect[3]);

        this.osd.addOverlay(box, OSDrect, OpenSeadragon.OverlayPlacement.CENTER);
    }

    /** show guide boxhelper (visible, draggable and resizable) for region tagging */
    drawGuideBoxHelper() {
        //
        // render guide box helper.
        //
        // the guide box should be draggable and resizable. converting (osd) box overlay to jquery dialog is possible,
        // but dragging and resizing action of dialog will conflict with osd overlay. the workaround is to render a
        // box helper which has the same size and centre position as the guide box overlay.
        //
        $( this.osd.element ).append(
            '<div id="osd-guide-boxhelper">' +
                '<div id="osd-guide-boxhelper-centre-handle">' +
                    '<div draggable="false"></div>' +
                '</div>' +
            '</div>');

        // make box helper draggable and resizable
        $('#osd-guide-boxhelper').draggable({ handle: '#osd-guide-boxhelper-centre-handle' });
        $('#osd-guide-boxhelper').resizable({ handles: 'n, e, s, w, ne, se, nw, sw' });

        // add event handler
        $('#osd-guide-boxhelper').on('drag start stop resize', (e, ui) => {
            this.moveGuideBoxHelper();
        });

        this.moveGuideBox();
    }

    moveGuideBox() {
        var box = $( '#osd-guide-box' );
        if (box.length > 0) {
            var p = box.position(), wo = box.outerWidth(), ho = box.outerHeight(),
                w = box.width(), h = box.height();

            // update box helper
            $( '#osd-guide-boxhelper' ).width(w);
            $( '#osd-guide-boxhelper' ).height(h);
            $( '#osd-guide-boxhelper' ).position({
                my: 'center center',
                at: 'left+' + (p.left + wo/2) + ' top+' + (p.top + ho/2),
                of: this.osd.element,
                collision: 'none'
            });
        }
    }

    moveGuideBoxHelper() {
        var boxhelper = $('#osd-guide-boxhelper');
        if (boxhelper.length > 0) {
            var p = boxhelper.position(), wo = boxhelper.outerWidth(), ho = boxhelper.outerHeight(),
                w = boxhelper.width(), h = boxhelper.height();

            // update box overlay
            var c  = this.osd.viewport.viewerElementToImageCoordinates( new OpenSeadragon.Point(p.left+w/2, p.top+h/2) ),
                tl = this.osd.viewport.viewerElementToImageCoordinates( new OpenSeadragon.Point(p.left, p.top) ),
                tr = this.osd.viewport.viewerElementToImageCoordinates( new OpenSeadragon.Point(p.left+w, p.top) ),
                bl = this.osd.viewport.viewerElementToImageCoordinates( new OpenSeadragon.Point(p.left, p.top+h) );
            var w = tr.x - tl.x,
                h = bl.y - tl.y,
                OSDrect = this.osd.viewport.imageToViewportRectangle(c.x-w/2, c.y-h/2, w, h);

            this.osd.updateOverlay( 'osd-guide-box', OSDrect, OpenSeadragon.OverlayPlacement.CENTER );
        }
    }

    clearGuides() {
        // remove guide line, icon and box
        $('[class^=osd-guide]').each((i, el) => {
            this.osd.removeOverlay( el ); // this.osd.removeOverlay($(el).attr('id'));
        });

        // remove guide boxhelper
        $('#osd-guide-boxhelper').remove();
    }

    /*************
     * marker bit
     *************/

    /**
     * @id    annotations count
     * @anno  annotation class object
     */

    drawMarker(id, anno) {

        var self = this;

        var target = anno.getTarget(), type = anno.getType(),
            posType = anno.getPositionType(), coordinates = anno.getCoordinates(),
            uuid = anno.getUUID(), name = anno.getName();

        // create marker element
        var el = document.createElement('div');
        el.id = 'osd-anno-marker' + id;
        el.className = 'osd-anno-marker ' + posType + ' ' + type;

        $(el).data('uuid', uuid);
        $(el).data('content', name);
        $(el).data('id', id);

        //
        // draw marker on osd
        //

        if (posType == this.PTYPES.POINT) {
            var viewportCoords = this.osd.viewport.imageToViewportCoordinates(coordinates[0].x, coordinates[0].y);
            this.osd.addOverlay({
                element : $(el)[0],
                location : new OpenSeadragon.Rect(viewportCoords.x - 0.02, viewportCoords.y - 0.02, 0.04, 0.04)
            });
        } else if (posType == this.PTYPES.POLYGON) {
            var viewpointCoords = this.getGuideBoxRectViewpointCoords( coordinates );
            this.osd.addOverlay({
                element : $(el)[0],
                location : new OpenSeadragon.Rect( viewpointCoords[0], viewpointCoords[1], viewpointCoords[2], viewpointCoords[3] )
            });
        }

    }

    drawMarkers(annos) {
        for (var i = 0; i < annos.length; i++) {
            var anno = annos[i];
            this.drawMarker(i, anno);
        }
    }

    clearMarker(id) {
        this.osd.removeOverlay( 'osd-anno-marker' + id );
    }

    clearMarkers() {
        $('div[id^=osd-anno-marker]').each((i, el) => {
            this.osd.removeOverlay( el );
        });
    }

    /******************
     * conversion bit
     ******************/

    /** get corner and center coordinates of guide boxhelper */
    getGuideBoxHelperImageCoords(elCoordsOriginX, elCoordsOriginY, elCoordsWidth, elCoordsHeight) {
        return [ // Center, NW, NE, SE, SW
            this.osd.viewport.viewerElementToImageCoordinates( new OpenSeadragon.Point( elCoordsOriginX + elCoordsWidth/2, elCoordsOriginY + elCoordsHeight/2 ) ),
            this.osd.viewport.viewerElementToImageCoordinates( new OpenSeadragon.Point( elCoordsOriginX, elCoordsOriginY ) ),
            this.osd.viewport.viewerElementToImageCoordinates( new OpenSeadragon.Point( elCoordsOriginX + elCoordsWidth, elCoordsOriginY ) ),
            this.osd.viewport.viewerElementToImageCoordinates( new OpenSeadragon.Point( elCoordsOriginX + elCoordsWidth, elCoordsOriginY + elCoordsHeight ) ),
            this.osd.viewport.viewerElementToImageCoordinates( new OpenSeadragon.Point( elCoordsOriginX, elCoordsOriginY + elCoordsHeight ) )
        ];
    }

    /** get center coordinates of guide icon */
    getGuideIconImageCoords(elCoordsOriginX, elCoordsOriginY, elCoordsWidth, elCoordsHeight) {
        return this.osd.viewport.viewerElementToImageCoordinates( new OpenSeadragon.Point( elCoordsOriginX + elCoordsWidth/2, elCoordsOriginY + elCoordsHeight/2 ) );
    }

    /** get guide box's viewport coordinates */
    getGuideBoxRectViewpointCoords(imageCoords) {
        var center = this.osd.viewport.imageToViewportCoordinates(imageCoords[0].x, imageCoords[0].y);
        var nw = this.osd.viewport.imageToViewportCoordinates(imageCoords[1].x, imageCoords[1].y),
            ne = this.osd.viewport.imageToViewportCoordinates(imageCoords[2].x, imageCoords[2].y),
            sw = this.osd.viewport.imageToViewportCoordinates(imageCoords[4].x, imageCoords[4].y);
        var w  = ne.x - nw.x,
            h  = sw.y - nw.y;
        return [center.x - w/2, center.y - h/2, w, h];
    }

    /** get guide box's vector coordinates of rect overlay */
    getRectViewportCoords(point, boxWidth, boxHeight) {
        var c  = this.osd.viewport.viewerElementToViewportCoordinates( point ),
            tl = this.osd.viewport.viewerElementToViewportCoordinates( new OpenSeadragon.Point(point.x - boxWidth/2, point.y - boxHeight/2) ),
            tr = this.osd.viewport.viewerElementToViewportCoordinates( new OpenSeadragon.Point(point.x + boxWidth/2, point.y - boxHeight/2) ),
            bl = this.osd.viewport.viewerElementToViewportCoordinates( new OpenSeadragon.Point(point.x - boxWidth/2, point.y + boxHeight/2) ),
            br = this.osd.viewport.viewerElementToViewportCoordinates( new OpenSeadragon.Point(point.x + boxWidth/2, point.y + boxHeight/2) );
        var w = tr.x - tl.x,
            h = bl.y - tl.y;
        return [tl.x, tl.y, w, h];
    }

    /**
     * get icon src
     */
    getIconSrc(type) {
        switch(type) {
            case this.TOOLBAR.SECONDARY.PERSON: return this.ICONS.PERSON;
            case this.TOOLBAR.SECONDARY.ABOUT:  return this.ICONS.ABOUT;
            case this.TOOLBAR.SECONDARY.DATE:   return this.ICONS.DATE;
            case this.TOOLBAR.SECONDARY.PLACE:  return this.ICONS.PLACE;
            default: return '';
        }
    }

    /**
     * element getter. osd has no corresponding view
     */
    get boxhelper() {
        return $('#osd-guide-boxhelper')[0];
    }

    get guideicon() {
        return $('#osd-guide-icon')[0];
    }

}
