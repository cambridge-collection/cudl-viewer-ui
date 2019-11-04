import {Config} from 'webpack-config';


export default new Config().merge({
    devServer: {
        headers: {"Access-Control-Allow-Origin": "*"}
    }
});
