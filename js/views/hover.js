define([
  'backbone',
], function(
  Backbone,
) {
  // Common SVG hover view
  var HoverView = Backbone.View.extend({

    // Initialization
    initialize: function(options) {
      HoverView.__super__.initialize.call(this, options);
      this.$el.css({pointerEvents: 'none'})
      this.$el.find('path').css({pointerEvents: 'all'})
      this.$path = this.$el.find('path');
      this.$text = this.$el.find('tspan');
      this.addListener();
    },

    // Register listners to eventes
    addListener: function() {
      this.$path.on('pointerover', this.hover.bind(this));
      this.$path.on('pointerout', this.out.bind(this));
      this.$path.on('pointerdown', this.select.bind(this));
    },

    // Clear listners
    removeListener: function() {
      this.$path.off('pointerover');
      this.$path.off('pointerout');
      this.$path.off('pointerdown');
    },

    // Function called on hover the view
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

    // Function called on hover out the view
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

    // Function called on selected the view
    select: function() {
      this.trigger('close');
    },

    // Function called to remove the view
    remove: function() {
      this.removeListener();
      HoverView.__super__.remove.call(this);
    }
  });
  return HoverView;
});
