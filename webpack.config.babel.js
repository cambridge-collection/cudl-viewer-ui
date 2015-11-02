// Default to production build
if(!process.env.WEBPACK_ENV) {
    process.env.WEBPACK_ENV = 'production';
}

export default require('./webpack-config');
