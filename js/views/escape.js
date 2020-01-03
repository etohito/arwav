define([
  'backbone',
  'models/hover',
  'views/hover',
], function(
  Backbone,
  HoverModel,
  HoverView,
) {
  // Escape view
  var EscapeView = HoverView.extend({
    el: '.escape',

    // Initialization
    initialize: function(options) {
      EscapeView.__super__.initialize.call(this, options);
      this.model = new HoverModel(options.color);
      this.out();
    },

    // Move to another screen
    select: function() {
      this.trigger('close');
    }
  });
  return EscapeView;
});
