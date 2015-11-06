// TODO: Move this module out into shared library, along with base models,
// views etc.

export class BaseError extends Error {
    get name() {
        return Object.getPrototypeOf(this).constructor.name;
    }

    constructor(message) {
        super(message);
        this.message = message;

        if(Error.captureStackTrace) {
            Error.captureStackTrace(this, BaseError);
        } else {
            this.stack = new Error().stack;
        }
    }
}

export class KeyError extends BaseError { }

export class NotImplementedError extends BaseError { }

export class ValueError extends BaseError { }

export class IllegalStateException extends BaseError { }
