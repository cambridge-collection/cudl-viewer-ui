import assert from 'assert';
import util from 'util';

import d3 from 'd3';
import pipe from 'lodash/fp/pipe';
import map from 'lodash/fp/map';
import sortBy from 'lodash/fp/sortBy';
import sum from 'lodash/fp/sum';
import maximum from 'lodash/fp/max';
import each from 'lodash/each';
import assign from 'lodash/assign';
import isObject from 'lodash/isObject';
import seedrandom from 'seedrandom';


function circleArea(radius) {
    return Math.PI * radius * radius;
}

/**
 * Get the rectangle with the specified aspect ratio (width/height) and area as
 * an array of [width, height].
 *
 * i.e. width/height = aspectRatio, width*height = area
 */
export function getRectangle(aspectRatio, area) {
    let w = aspectRatio;
    let h = 1;

    let scaleFactor = Math.sqrt(area) / Math.sqrt(w*h);

    let rect = [w * scaleFactor, h * scaleFactor];

    assert(Math.abs(rect[0] * rect[1] - area) < area / 1e15);
    assert(Math.abs(rect[0] / rect[1] - aspectRatio) < 1e-14);

    return rect;
}

/**
 * Create a d3 layout function which randomly lays out circles in a rectangle.
 *
 * A random, greedy strategy is used for the layout: The circles are placed
 * in a random location, starting with the largest circle and progressing in
 * order of size until the smallest is placed last.
 */
export function bubbleLayout(options) {
    let layout = new BubbleLayout(options);
    return layout.layout.bind(layout);
}

class BubbleLayout {
    constructor(options) {
        this.options = assign({
            // The aspect ratio of the rectangle to layout the bubbles in.
            // Default is square (1/1)
            aspectRatio: 1,
            // The initial area of the layout rectangle, specified as the
            // ratio of (la - ba) / ba where la = layout area and
            // ba = bubble area
            // i.e. 0 means the layout rectangle has the same area as the sum of
            // the areas of the bubbles to be layed out. 1 means the layout
            // rectangle has twice the area of the circles. 2 means the layout
            // rectangle has three times the area of the circles, etc.
            initialFreeSpaceRatio: 0,

            // Function to produce an easier free space ratio to lay out with
            // when a solution is not found for a ratio. Must return a ratio
            // > than the input. Default gives 10% more free space each attempt.
            ease: (ratio, circlesArea) => {
                let freeSpace = circlesArea * ratio;
                let easedSpace = freeSpace + circlesArea * 0.1;
                return easedSpace / circlesArea;
            },

            // The PRNG to generate randomness
            rng: seedrandom(),
            // The maximum number of times to try to place each circle
            attempts: 100,
            // Accessor function to get the radius of an input value
            radius: data => data.r,

            // The collision detection strategy to use.
            // Default is simple O(n^2) (compare everything to everything)
            // strategy which may well be faster than building a quadtree for
            // small numbers of bubbles.
            collision: NaiveCollisionDetection.create,

            // proportion of the radius of the maximum circle to pad between
            // neighbouring circles
            padding:  0

        }, options);

        if(options.initialFreeSpaceRatio < 0) {
            // Values < 0 mean the layout rect has less area than the circles to
            // lay out, which clearly makes no sense.
            throw new Error(util.format('initialFreeSpaceRatio was < 0: %s',
                                        options.initialFreeSpaceRatio));
        }

        if(options.attempts < 1) {
            throw new Error(util.format(
                'options.attempts must be >= 1, got: %s', options.attempts));
        }

        if(options.padding < 0) {
            throw new Error(util.format(
                'options.padding must be >= 0, got: %s', options.padding));
        }
    }

    _createLayoutCircles(values) {
        // Wrap each circle in our own layout object representing the position of
        // the circle in the layout.
        let circles = pipe(
            map(value => ({
                radius: this.options.radius(value),
                data: value
            })),
            sortBy(circle => -circle.radius)
        )(values);

        // Normalise the radiuses so that the largest radius is 1
        let max = pipe(map(c => c.radius), maximum)(circles);
        each(circles, circle => circle.radius = circle.radius / max);

        return circles;
    }

    layout(values) {
        let freeSpaceRatio = this.options.initialFreeSpaceRatio;

        let circles = this._createLayoutCircles(values);
        let padding = this.options.padding;

        // The area covered by all circles in our layout
        let circlesArea = pipe(
            // Area includes the extra radius for padding. Note that circles
            // are normalised, so the largest circle is radius 1, therefore
            // maxRadius * padding = 1 * padding = padding
            map(circle => circleArea(circle.radius + (padding / 2))),
            sum
        )(circles);

        // As long as our ease() function always generates an easier (larger)
        // layout area, we'll eventually find a solution. (Of course the rng
        // also must produce a reasonable distribution).
        let eases = 0;
        while(true) {
            // The area available to lay out the circles. This increases each
            // loop.
            let layoutArea = circlesArea + circlesArea * freeSpaceRatio;
            // Calculate the rectangle with the layout aspect and area
            let rect = getRectangle(this.options.aspectRatio, layoutArea);
            let w = rect[0], h = rect[1];

            let layout = this._tryLayout(circles, w, h);

            if(layout !== null) {
                assert(isObject(layout));

                // Some incidental metadata on the generated layout
                layout.meta = {
                    freeSpaceRatio: freeSpaceRatio,
                    circlesArea: circlesArea,
                    eases: eases,
                    options: this.options
                };
                return layout;
            }

            // Make the layout area a little bigger (e.g. easier to find a
            // solution) before trying again.
            freeSpaceRatio = this._ease(freeSpaceRatio, circlesArea);
            eases++;
        }
    }

    _ease(freeSpaceRatio, circlesArea) {
        let eased = this.options.ease(freeSpaceRatio, circlesArea);

        if(isNaN(eased)) {
            throw new Error(util.format('options.ease(%s, %s) returned NaN',
                                        freeSpaceRatio, circlesArea));
        }

        // Ensure the ratio increases, otherwise the main loop may never
        // terminate
        if(eased <= freeSpaceRatio) {
            throw new Error(util.format(
                "freeSpaceRatio was not increased. options.ease(%s, %s) = %s",
                freeSpaceRatio, circlesArea, eased));
        }
        return eased;
    }

    _tryLayout(circles, w, h) {
        let collision = this.options.collision(w, h);
        let attempts = this.options.attempts;
        let rng = this.options.rng;
        let padding = this.options.padding;

        assert(attempts > 0);

        for(let i = 0; i < circles.length; i++) {
            let circle = circles[i];
            let radius = circle.radius;

            // Can't lay out if the area isn't long or wide enough
            if(w < radius || h < radius) {
                return null;
            }

            let placed = false;
            for(let j = 0; j < attempts; j++) {
                // Generate a random location for the circle within the layout
                let x = radius + (rng() * (w - radius * 2));
                let y = radius + (rng() * (h - radius * 2));

                if(!collision.collides(x, y, radius + (padding / 2))) {
                    // Record the successful placement location
                    circle.x = x;
                    circle.y = y;
                    placed = true;
                    collision.add(x, y, radius + (padding / 2));
                    break;
                }
            }

            if(!placed) {
                return null;
            }
        }

        // The completed layout
        return {
            width: w,
            height: h,
            circles: circles
        }
    }
}

class NaiveCollisionDetection {
    static create(width, height) {
        return new NaiveCollisionDetection(width, height);
    }

    constructor(width, height) {
        assert(width > 0);
        assert(height > 0);

        this.width = width;
        this.height = height;

        this.circles = [];
    }

    add(cx, cy, radius) {
        this.circles.push([cx, cy, radius]);
    }

    collides(cx, cy, radius) {
        let circles = this.circles;
        for(let i = 0; i < circles.length; i++) {
            let circle = circles[i];
            let ocx = circle[0], ocy = circle[1], oradius = circle[2];
            let distance = Math.sqrt(
                    Math.pow(ocx - cx, 2) + Math.pow(ocy - cy, 2));
            if(distance < radius + oradius)
                return true;
        }
        return false;
    }
}

// render();
// document.querySelector('button').addEventListener('click', () => render());
