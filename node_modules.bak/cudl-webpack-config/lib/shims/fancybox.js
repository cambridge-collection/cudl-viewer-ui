'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _util = require('../util');

exports.default = (0, _util.loader)({
    test: /\/jquery.fancybox.js$/,
    include: /\/bower_components\/fancybox\/source\//,
    loader: 'imports?' + 'window=>global,document=>window.document,jQuery=jquery'
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zaGltcy9mYW5jeWJveC5qcyJdLCJuYW1lcyI6WyJ0ZXN0IiwiaW5jbHVkZSIsImxvYWRlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7O2tCQUdlLGtCQUNYO0FBQ0lBLFVBQU0sdUJBRFY7QUFFSUMsYUFBUyx3Q0FGYjtBQUdJQyxZQUFRLGFBQ0o7QUFKUixDQURXLEMiLCJmaWxlIjoiZmFuY3lib3guanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBsb2FkZXIgfSBmcm9tICcuLi91dGlsJztcblxuXG5leHBvcnQgZGVmYXVsdCBsb2FkZXIoXG4gICAge1xuICAgICAgICB0ZXN0OiAvXFwvanF1ZXJ5LmZhbmN5Ym94LmpzJC8sXG4gICAgICAgIGluY2x1ZGU6IC9cXC9ib3dlcl9jb21wb25lbnRzXFwvZmFuY3lib3hcXC9zb3VyY2VcXC8vLFxuICAgICAgICBsb2FkZXI6ICdpbXBvcnRzPycgK1xuICAgICAgICAgICAgJ3dpbmRvdz0+Z2xvYmFsLGRvY3VtZW50PT53aW5kb3cuZG9jdW1lbnQsalF1ZXJ5PWpxdWVyeSdcbiAgICB9XG4pO1xuIl19