import './dynamic-public-path';
import './configure-jquery-migrate';
import { patchProjectLight } from './projectlight';

// 3rd party libs included for their side-effects
import 'project-light/javascripts/custom.js';
import 'bootstrap';

patchProjectLight();
