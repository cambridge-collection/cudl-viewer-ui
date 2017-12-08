//------------------------------------------------------------------------------
// Imports for side-effects:

// The polyfill has to be imported before the rest of the code.
import 'babel-polyfill';
// Ensure we can use console.xxx() on IE without breaking
import 'console-polyfill';

// Apply similarity styles
import '../style/similarity.less';
//------------------------------------------------------------------------------

import url from 'url';

import $ from 'jquery';

import Metadata from './models/metadata';
import CudlService from './cudlservice';
import SimilarityModel from './models/similaritymodel';
import LoadingModel from './models/loadingmodel';
import ViewportModel from './models/viewportmodel';
import { RootSimilarityView } from './views';


export function setupSimilarityTab({viewerModel, docId, servicesBaseUrl,
                                    imageServerBaseUrl}) {
    let metadata = new Metadata(viewerModel.getMetadata(), docId);
    let cudlService = new CudlService(url.resolve(servicesBaseUrl, '/v1/'));
    let loadingModel = new LoadingModel();
    let similarityModel = new SimilarityModel(metadata, cudlService, loadingModel);
    let viewportModel = new ViewportModel();

    viewerModel.events.on('change:pageNumber', () =>
        similarityModel.setPage(viewerModel.getPageNumber() - 1));

    // Load the first/current page. -1 as we use 0-based page indexes
    similarityModel.setPage(viewerModel.getPageNumber() - 1);

    var view = new RootSimilarityView({
        el: $('#similaritems .similarity-container')[0],
        similarityModel: similarityModel,
        loadingModel: loadingModel,
        viewportModel: viewportModel,
        imageServerBaseUrl: imageServerBaseUrl
    }).render();

    // Watch for our tab being shown/hidden
    $('#similaritemstab').on('shown.bs.tab', e => {
        viewportModel.setDimensions(view.$el.width(), view.$el.height());
    });

    $(window).on('resize', function() {
        if(view.$el.is(':visible')) {
            viewportModel.setDimensions(view.$el.width(), view.$el.height());
        }
    });
}
