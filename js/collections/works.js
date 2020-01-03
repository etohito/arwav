define([
  'backbone',
  'models/work',
], function(
  Backbone,
  WorkModel,
) {
  // Work data collection
  var WorkCollection = Backbone.Collection.extend({
    model: WorkModel,

    // Initialization
    initialize: function(models, options) {
    },

    // Parse data
    parse: function(res, options) {
      return res;
    },

    // Load text files
    loadText: function() {
      var dfd = $.Deferred();
      var asyncFuncs = this.map(function(model) {
        return model.loadText.call(model);
      });
      $.when.apply(this, asyncFuncs).always(dfd.resolve);
      return dfd.promise();
    },

  });
  return WorkCollection;
});
