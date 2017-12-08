import $ from 'jquery';

/**
 * Models the state of the viewport dimensions that the bubble view renders
 * into.
 *
 * This is required because our layout algorithm depends on the aspect ratio of
 * our view in the sidebar, and our view is not visible all of the time.
 * Additionally the layout calculation is too expensive to run on every resize,
 * and even if it wasn't we wouldn't want the layout to randomly change as the
 * browser resized!
 */
export default class ViewportModel {
    constructor() {
        this.dimensionsAvailable = false;
        this.width = null;
        this.height = null;
    }

    setDimensions(width, height) {
        if(this.dimensionsAvailable && this.width === width &&
            this.height == height) {
            return;
        }

        this.dimensionsAvailable = true;
        this.width = width;
        this.height = height;
        $(this).trigger('change:dimensions');
    }

    getWidth() { return this.width; }
    getHeight() { return this.height; }

    getAspectRatio() {
        if(!this.dimensionsAvailable)
            throw new IllegalStateException('Dimensions are not yet available');
        return this.width / this.height;
    }

    hasDimensions() {
        return this.dimensionsAvailable;
    }
}
