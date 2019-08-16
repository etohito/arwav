define([
  'backbone',
  'models/hover',
  'views/hover',
  'views/escape',
  'views/menu',
], function(
  Backbone,
  HoverModel,
  HoverView,
  EscapeView,
  MenuView
) {
  var Google = Backbone.View.extend({
    focus: null,
    initialize: function(options) {
      Google.__super__.initialize.call(this, options);
    },
    render: function() {
      gapi.signin2.render('google_signin', {
        'longtitle': true,
        'theme': 'dark',
        'onsuccess': this.success,
        'onfailure': this.failure
      });
      return this;
    },
    success: function() {
      console.warn('success');
    },
    failure: function() {
      console.warn('failure');
    }
  });
  return Google;
});
