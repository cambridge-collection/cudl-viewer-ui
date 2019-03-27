import EventEmitter from 'events';

import { IllegalStateException } from './exceptions';


export class Model {
    constructor() {
        this._events = new EventEmitter();
    }

    get events() {
        if(this._events === undefined)
            throw new IllegalStateException(
                'Model constructor() doesn\'t seem to have been called: ' +
                '_events is undefined');
        return this._events;
    }
}
