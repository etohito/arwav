define([
  'backbone',
  'models/hover',
  'views/hover',
], function(
  Backbone,
  HoverModel,
  HoverView,
) {
  var EscapeView = HoverView.extend({
    el: '.escape',
    initialize: function(options) {
      EscapeView.__super__.initialize.call(this, options);
      this.model = new HoverModel(options.color);
      this.out();
    },
    select: function() {
      this.trigger('close');
    }
  });
  return EscapeView;
});
