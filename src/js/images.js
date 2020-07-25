import assert from "assert";
import {ValueError} from "./exceptions";

/**
 * Get an ImageUrlProvider which constructs image URLs according to the
 * capabilities of our Viewer's server deployment. This may result in
 * IIIF//DZI/pre-generated images being used, depending on the environment.
 *
 * @param context The context configuration object provided by the Viewer.
 * @returns an ImageUrlProvider implementation.
 */
export function getImageUrlProvider(context) {
    assert(typeof context === "object");
    assert(typeof context.imageServer === "string");

    // Right now we just use one implementation which uses legacy
    // pre-generated/DZI images if available and IIIF URLs otherwise. However
    // it may be useful to use a IIIF only provider as we fully migrate...
    return new DefaultImageUrlProvider({imageServer: context.imageServer});
}

class DefaultImageUrlProvider {
    constructor(options) {
        assert(options && typeof options.imageServer === "string");
        this.imageServer = options.imageServer;
    }

    /**
     * Get the URL to a thumbnail image for an Item page.
     * @param options.page An Item page object
     * @param options.maxDisplayedDimensions A hint of the maximum size that the thumbnail will be displayed at.
     *   The returned image URL may point to an image not greater than this size if possible(e.g. if a IIIF image
     *   server is available). The value can either be a number, indicating max width and height, or an object with
     *   'width' and 'height' properties.
     * @returns {string} The URL of the image
     * @throws {ValueError} if an image URL cannot be created
     */
    getThumbnailImage(options) {
        assert(typeof options === "object");
        assert(typeof options.page === "object");
        let page = options.page;
        let maxDisplayedDimensions = normaliseDimensions(options.maxDisplayedDimensions, 178);

        // If a fixed thumbnail URL is specified then use it. Note that the
        // maxDisplayedDimensions hint is ignored, as only one size is available.
        if(typeof page.thumbnailImageURL === "string") {
            return `${this.imageServer}${page.thumbnailImageURL}`;
        }
        else if(typeof page.IIIFImageURL === "string") {
            let w = maxDisplayedDimensions.width;
            let h = maxDisplayedDimensions.height;
            return `${this.imageServer}${page.IIIFImageURL}/full/!${w},${h}/0/default.jpg`;
        }

        throw new ValueError("Unable to construct thumbnail image URL from item page");
    }

    getDownloadImage(options) {
        assert(typeof options === "object");
        assert(typeof options.page === "object");
        assert(typeof options.maxDimensions === "object");

        let page = options.page;
        let maxDimensions = normaliseDimensions(options.maxDimensions, 2048);

        if(typeof page.downloadImageURL === "string") {
            return `${this.imageServer}${page.downloadImageURL}`;
        }
        else if(typeof page.IIIFImageURL === "string") {
            let w = maxDimensions.width;
            let h = maxDimensions.height;
            return `${this.imageServer}${page.IIIFImageURL}/full/!${w},${h}/0/default.jpg`;
        }

        throw new ValueError("Unable to construct download image URL from item page");
    }

    /**
     * Get a zoomable image for an Item page which can be displayed in the
     * OpenSeadragon viewer.
     *
     * @param options.page An Item page object
     * @returns an object with 'type' and 'url' properties. The type
     *     is either 'dzi' or 'iiif'. The 'dzi' URLs point to a .dzi file, the
     *     'iiif' URLs point to an info.json file.
     */
    getZoomableImage(options) {
        assert(typeof options === "object");
        if(typeof options.displayImageURL === "string") {
            return {type: "dzi", url: `${this.imageServer}${options.displayImageURL}`};
        }
        else if(typeof options.IIIFImageURL === "string") {
            return {type: "iiif", url: `${this.imageServer}${options.IIIFImageURL}/info.json`};
        }
        throw new ValueError("No zoomable image available for page");
    }
}

function normaliseDimensions(dimensions, defaultDimensions) {
    if(typeof dimensions === "number") {
        dimensions = {width: dimensions, height: dimensions};
    }
    else if(typeof dimensions === "object") {
        assert(typeof dimensions.width === "number");
        assert(typeof dimensions.height === "number");
    }
    else {
        assert(dimensions === undefined);
        dimensions = defaultDimensions === undefined ? undefined : normaliseDimensions(defaultDimensions);
    }
    return dimensions;
}
