const ENTITIES = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
};

/** Quotes are escaped too, so this is safe in an attribute value as well as in text. */
export function escapeHtml(value) {
    if (value === undefined || value === null) { return ''; }
    return String(value).replace(/[&<>"']/g, function(c) { return ENTITIES[c]; });
}
