define([
  'backbone',
], function(
  Backbone,
) {
  var HoverView = Backbone.View.extend({
    initialize: function(options) {
      HoverView.__super__.initialize.call(this, options);
      this.$el.css({pointerEvents: 'none'})
      this.$el.find('path').css({pointerEvents: 'all'})
      this.$path = this.$el.find('path');
      this.$text = this.$el.find('tspan');
      this.addListener();
    },
    addListener: function() {
      this.$path.on('pointerover', this.hover.bind(this));
      this.$path.on('pointerout', this.out.bind(this));
      this.$path.on('pointerdown', this.select.bind(this));
    },
    removeListener: function() {
      this.$path.off('pointerover');
      this.$path.off('pointerout');
      this.$path.off('pointerdown');
    },
    hover: function() {
      this.$path.css({
        fill:   this.model.get('hover').path.fill,
        stroke: this.model.get('hover').path.stroke
      });
      this.$text.css({
        fill:   this.model.get('hover').text.fill,
        stroke: this.model.get('hover').text.stroke
      });
      this.trigger('hover');
    },
    out: function() {
      this.$path.css({
        fill:   this.model.get('out').path.fill,
        stroke: this.model.get('out').path.stroke
      });
      this.$text.css({
        fill:   this.model.get('out').text.fill,
        stroke: this.model.get('out').text.stroke
      });
      this.trigger('out');
    },
    select: function() {
      this.trigger('close');
    },
    remove: function() {
      this.removeListener();
      HoverView.__super__.remove.call(this);
    }
  });
  return HoverView;
});
