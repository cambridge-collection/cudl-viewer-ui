// TODO: Move this module out into shared library, along with base models,
// views etc.

import ExtendableError from 'es6-error';


export class KeyError extends ExtendableError { }

export class NotImplementedError extends ExtendableError { }

export class ValueError extends ExtendableError { }

export class IllegalStateException extends ExtendableError { }

export class RuntimeException extends ExtendableError { }
