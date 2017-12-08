

export function cudlItem(normalisedClassmark, pageNumber) {
    return [
        '', 'view', encodeURIComponent(normalisedClassmark),
        encodeURIComponent(pageNumber)
    ].join('/');
}
