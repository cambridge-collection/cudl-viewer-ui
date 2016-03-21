import path from 'path';

import toArray from 'lodash/toArray';


export function resolver(base) {
    return function() {
        return path.resolve.apply(path, [base].concat(toArray(arguments)));
    };
}

export const rootDir = path.resolve(__dirname, '../');

export const rootPath = resolver(rootDir);
