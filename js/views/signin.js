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
    initialize: function(options) {
      Google.__super__.initialize.call(this, options);
      this.id = options.id;
      this.render();
    },
    render: function() {
      gapi.signin2.render(this.id, {
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
  var Facebook = Backbone.View.extend({
    initialize: function(options) {
      Facebook.__super__.initialize.call(this, options);
      this.render();
    },
    render: function() {
      FB.login(this.success.bind(this));
      return this;
    },
    success: function(response) {
      console.warn('success');
    },
  });
  var Signin = Backbone.View.extend({
    initialize: function(options) {
      Signin.__super__.initialize.call(this, options);
      this.render();
    },
    render: function() {
      var googleSignin = new Google({id: 'google_signin'});
      var googleSignup = new Google({id: 'google_signup'});
      var facebook = new Facebook();
      return this;
    },
    success: function() {
      console.warn('success');
    },
    failure: function() {
      console.warn('failure');
    }
  });

  return Signin;
});
