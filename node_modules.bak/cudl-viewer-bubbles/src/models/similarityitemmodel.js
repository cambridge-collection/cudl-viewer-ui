import isEqual from 'lodash/isEqual';
import assign from 'lodash/assign';
import $ from 'jquery';


export class SimilarityItemModel {
    constructor(similarityHit, svgElement, position, isUnderMouse) {
        this._hit = similarityHit;
        this._svgElement = svgElement;
        this._position = position;
        this._isUnderMouse = isUnderMouse;
    }

    get hit() {
        return this._hit;
    }

    get svgElement() {
        return this._svgElement;
    }

    get position() {
        return this._position;
    }

    set position(pos) {
        if(!isEqual(this._position, pos)) {
            this._position = assign({}, pos);
            $(this).trigger('change');
            $(this).trigger('change:position');
        }
    }

    get isUnderMouse() {
        return this._isUnderMouse;
    }

    set isUnderMouse(val) {
        val = !!val;
        if(this._isUnderMouse !== val) {
            this._isUnderMouse = val;
            $(this).trigger('change');
            $(this).trigger('change:isUnderMouse');
        }
    }

}
