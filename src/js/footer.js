import $ from 'jquery';
import Modernizr from 'modernizr';
import pipe from 'lodash/fp/pipe';
import map from 'lodash/fp/map';
import max from 'lodash/fp/max';


/**
 * Keep the project light local footer's logo column the same height as the
 * others. PL does this by default for footer columns of width 3, but not for
 * other sizes. The logo column is 6 wide.
 */
export function resizeLogoColumn() {

    let logo, container, height;

    function setLogoContainerHeight() {
        if(logo === undefined || container === undefined) {
            logo = $('.campl-local-footer .library-logo');
            container = logo.parents('.campl-footer-navigation');
        }

        if(Modernizr.mq('only screen and (max-width: 767px)')) {
            container.height('');
        }
        else {
            if(height === undefined) {
                let columns = container.siblings('.campl-footer-navigation')
                                       .toArray();
                height = pipe(map(e => $(e).height()), max)(columns);
            }
            container.height(height);
        }
    }

    $(window).resize(setLogoContainerHeight);
    $(setLogoContainerHeight);
}
