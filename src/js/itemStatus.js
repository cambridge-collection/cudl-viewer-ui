/** Badges rendered here have to match the ones release-status.tag renders in the viewer. */

import { getPageContext } from './context';
import { escapeHtml } from './html';

const DEFAULT_STATUS = 'draft';

/** Requires the caller's image box to be positioned. */
const OVERLAY_STYLE = 'position:absolute;top:4px;left:4px;z-index:1';

export function unreleasedBadge(item, { overlay = false } = {}) {
    if (!getPageContext().showReleaseStatus || !item.unreleased) {
        return '';
    }

    const status = item.itemStatus || DEFAULT_STATUS;
    const label = status.charAt(0).toUpperCase() + status.slice(1);
    const statusClass = 'item-status-' + status.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    return '<span class="badge bg-warning text-dark ' + statusClass + '"' +
        (overlay ? ' style="' + OVERLAY_STYLE + '"' : '') + '>' + escapeHtml(label) + '</span>';
}
