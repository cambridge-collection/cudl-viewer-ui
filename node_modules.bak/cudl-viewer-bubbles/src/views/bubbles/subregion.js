import assert from 'assert';

import { Rect } from './tiledimage';
import { ValueError } from '../../util/exceptions';
import { getRectangle } from './bubblelayout';

const CROP_PERC = 0.15;

export function randomSubregion(srcWidth, srcHeight, destWidth, destHeight, rng) {
    if(destWidth > srcWidth)
        throw new ValueError(
            `destWidth > srcWidth. destWidth: ${destWidth}, srcWidth: ${srcWidth}`);
    if(destHeight > srcHeight)
        throw new ValueError(
            `destHeight > srcHeight. destHeight: ${destHeight}, srcHeight: ${srcHeight}`);

    if(!rng)
        rng = Math.random;

    // crop the borders off the src image as they typically contain black
    // nothingness.
    let src = new Rect(srcWidth * CROP_PERC, srcHeight * CROP_PERC,
                       srcWidth - (srcWidth * CROP_PERC) * 2,
                       srcHeight - (srcHeight * CROP_PERC) * 2);

    let aspectRatio = destWidth / destHeight;

    let minArea = destWidth * destHeight;
    let maxArea = area(maxRect(aspectRatio, src.width, src.height));
    assert(minArea < maxArea)
    let randomArea = getRandomArea(minArea, maxArea, rng);

    let [w, h] = getRectangle(aspectRatio, randomArea);

    let x = lerp(src.left, src.right - w, rng());
    let y = lerp(src.top, src.bottom - h, rng());

    return new Rect(x, y, w, h);
}

function maxRect(aspect, width, height) {
    let whAspect = width / height;

    // target wider than source
    if(aspect > whAspect) {
        return [width, width / aspect];
    }
    return [height * aspect, height];
}

function area([width, height]) {
    return width * height;
}

function lerp(x, y, t) {
    return x + (y - x) * t;
}

function getRandomArea(min, max, rng) {
    assert(min < max);
    assert(min >= 0);

    // The min area continuously varies with the window size, whereas the max
    // area is fixed for a given image. Therefore, we aim to keep a continuous
    // output for a given (max, rng) pair, regardless of the min. Only when the
    // selected area is less than min do we select another which is in range.
    // This avoids having the bubble content continuously scroll as the window
    // resizes. E.g. the bubble content makes sudden large changes rather than
    // continuous small changes.
    let desired = max * rng();
    let available = max - min;
    let selected = max - (desired % available);

    assert(selected >= min);
    assert(selected <= max);

    return selected;
}
