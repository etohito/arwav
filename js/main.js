require.config({
  paths: {
    'jquery'    : 'libs/jquery-3.4.1.min',
    'underscore': 'libs/underscore-min',
    'backbone'  : 'libs/backbone-min'
  },
  shim: {
    'jquery': {
      exports: '$'
    },
    'underscore': {
      exports: '_'
    },
    'backbone': {
      deps: ['jquery', 'underscore'],
      exports: 'Backbone'
    }
  }
});

require(['router'], function(Router) {
  var router = new Router();
});
