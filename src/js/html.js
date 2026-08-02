import $ from 'jquery';

export function escapeHtml(value) {
    return $('<div/>').text(value === undefined || value === null ? '' : value).html();
}
