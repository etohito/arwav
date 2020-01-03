define([
  'backbone',
  'models/author',
], function(
  Backbone,
  AuthorModel,
) {
  // Author data collection
  var AuthorCollection = Backbone.Collection.extend({
    model: AuthorModel,

    // Initialization
    initialize: function(models, options) {
    },

    // Parse data
    parse: function(res, options) {
      return res;
    }
  });
  return AuthorCollection;
});
