define([
  'backbone',
  'models/author',
], function(
  Backbone,
  AuthorModel,
) {
  var AuthorCollection = Backbone.Collection.extend({
    model: AuthorModel,
    initialize: function(models, options) {
      if (options && options.url) {
        this.url = options.url;
      }
    },
    parse: function(res, options) {
      return res;
    }
  });
  return AuthorCollection;
});
