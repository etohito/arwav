define([
  'backbone',
  'util/color',
  'models/hover',
  'views/hover'
], function(
  Backbone,
  Color,
  HoverModel,
  HoverView
) {

  // Home item view
  var HomeItem = HoverView.extend({
    // Initialization
    initialize: function(options) {
      HomeItem.__super__.initialize.call(this, options);

      // Set hash or url where to move on selected the item
      this.hash = options.hash;
      this.url = options.url;

      // Set hover data
      var color = this.$path.css('stroke');
      this.model = new HoverModel({
        hover: {
          path: {fill: color, stroke: color},
          text: {fill: Color.WHITE, stroke: 'none'},
        },
        out: {
          path: {fill: 'none', stroke: color},
          text: {fill: color, stroke: 'none'},
        }
      });
    },

    // Function called on selected the item
    select: function() {
      if (this.hash) {
        Backbone.history.navigate(this.hash, true);
      } else if (this.url) {
        location.href = this.url;
      }
    },
  });

  // Home screen
  var HomeView = Backbone.View.extend({
    el: '#home',
    items: [],

    // Initialization
    initialize: function(options) {
      HomeView.__super__.initialize.call(this, options);
      this.$el.find('.title').css({pointerEvents: 'none'})
      this.createItems();
    },

    // For mobile layout, set text to the view
    render: function() {
      var template = _.template($('#home_template').html());
      this.$el.html(template(dic));
      return this;
    },

    // For mobile layout, adjust scroll position
    // to about us or curatorial statement
    scroll: function(focus) {
      var $focus = $('.' + focus);
      if (0 < $focus.length) {
        $('body').animate({scrollTop: $focus.offset().top});
      }
    },

    // Create child views
    createItems: function() {
      this.items = [];
      var itemsInfo = [
        {el: '.instagram', url: dic.INSTAGRAM_URL},
        {el: '.aboutus', hash: '#aboutus'},
        {el: '.language', hash: '#language'},
        {el: '.constellation', hash: '#curatorial'},
      ];
      _.each(itemsInfo, function(itemInfo) {
        this.items.push(new HomeItem(itemInfo));
      }, this);
    },

    // Remove the view
    remove: function() {
      _.each(this.items, function(item) {
        item.remove();
      });
      this.items = [];
      HomeView.__super__.remove.call(this);
    }
  });
  return HomeView;
});
