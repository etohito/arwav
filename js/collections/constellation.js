define([
  'backbone',
  'models/work',
  'constellation'
], function(
  Backbone,
  WorkModel,
  list,
) {
  var ConstellationCollection = Backbone.Collection.extend({
    initialize: function(options) {
      this.reset();
      _.each(list, function(item) {
        this.add(new WorkModel(item));
      }, this);
    },
  });
  return ConstellationCollection;
});
