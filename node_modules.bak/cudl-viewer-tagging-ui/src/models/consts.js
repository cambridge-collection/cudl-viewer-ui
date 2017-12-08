/** tagging target */
export var TTARGETS = Object.freeze({
    DOC     : 'doc',
    POINT   : 'point',
    REGION  : 'region'
});

/** tagging types */
export var TTYPES = Object.freeze({
    PERSON  : 'person',
    ABOUT   : 'about',
    DATE    : 'date',
    PLACE   : 'place',
    INFO    : 'info'
});

/** position types */
export var PTYPES = Object.freeze({
    POINT   : 'point',
    POLYGON : 'polygon'
});

/** toolbar */
export var TOOLBAR = Object.freeze({
    PRIMARY: {
        TITLE     : 0,
        DOC       : 1,
        POINT     : 2,
        REGION    : 3,
        TOGGLE    : 4
    },
    SECONDARY: {
        PERSON    : 0,
        ABOUT     : 1,
        DATE      : 2,
        PLACE     : 3,
    }
});
