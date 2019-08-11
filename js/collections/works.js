define([
  'backbone',
  'models/work',
], function(
  Backbone,
  WorkModel,
) {
  var WorkCollection = Backbone.Collection.extend({
    model: WorkModel,
    initialize: function(models, options) {
      if (options && options.url) {
        this.url = options.url;
      }
    },
    parse: function(res, options) {
      return res;
    }
  });
  return WorkCollection;
});
