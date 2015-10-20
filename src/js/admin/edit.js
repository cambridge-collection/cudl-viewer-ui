import { getPageContext } from '../context';

/**
 * Dynamically load the in-page editing environment if the current user is an
 * admin, and there are editable regions in the page.
 */
export function possiblyEnableEditing() {
    let context = getPageContext();

    // Add editing functionality
    if(context.isAdmin && context.editableAreas &&
        context.editableAreas.length) {

        // Asynchronously load and run the editing functionality
        require.ensure([], () => require('./enable-edit'));
    }
}
