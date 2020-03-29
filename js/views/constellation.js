define([
  'backbone',
  'util/color',
  'util/util',
  'models/hover',
  'views/hover',
  'views/escape',
  'views/menu',
], function(
  Backbone,
  Color,
  Util,
  HoverModel,
  HoverView,
  EscapeView,
  MenuView
) {

  // Thumbnail item
  var ThumbnailItem = Backbone.View.extend({
    // Initialization
    initialize: function(options) {
      ThumbnailItem.__super__.initialize.call(this, options);
      this.$el = $('<li></li>');
      this.addListener();
    },

    // Register listener
    addListener: function() {
      this.$el.on('pointerover', this.hover.bind(this));
      this.$el.on('pointerout', this.out.bind(this));
      this.$el.on('click', this.click.bind(this));
    },

    // Clear listener
    removeListener: function() {
      this.$el.off('pointerover');
      this.$el.off('pointerout');
      this.$el.off('click');
    },

    // Rendering the view
    render: function() {
      var template= _.template($('#thumbnail_template').html());
      this.$el.html(template(this.model.toJSON()));
      return this;
    },

    // Create child views
    createItems: function() {
    },

    // Move to another screen
    click: function() {
      this.trigger('close', "#work/current/" + this.model.get('id'));
    },

    // Pass hover event to pause auto scroll
    hover: function() {
      this.trigger('hover');
    },

    // Pass hover out event to resume auto scroll
    out: function() {
      this.trigger('out');
    },

    // Remove the view
    remove: function() {
      this.removeListener();
      ThumbnailItem.__super__.remove.call(this);
    }
  });

  // Svg item which does not have thumbnail
  var SvgItem = Backbone.View.extend({
    items: [],

    // Initialization
    initialize: function(options) {
      SvgItem.__super__.initialize.call(this, options);
      this.themeColor = options.themeColor;
      this.$el = $('<li></li>');
      this.template = _.template($('#svg_template').html());
    },

    // Rendering the view
    render: function() {
      var project = this.model.toJSON().project;
      var splitTitle = Util.split(project, 12, 2);

      this.$el.html(this.template({
        author: Util.substring(this.model.toJSON().author, 18),
        title1: splitTitle[0],
        title2: splitTitle[1]
      }));
      return this;
    },

    // Create child views
    createItems: function() {
      this.items = [];

      // Enable svg hover
      var hoverView = new HoverView({
        el: this.$el.find('svg'),
        model: new HoverModel({
          hover: {
            path: {fill: this.themeColor, stroke: this.themeColor},
            text: {fill: Color.WHITE, stroke: 'none'}
          },
          out: {
            path: {fill: 'none', stroke: this.themeColor},
            text: {fill:  Color.BLACK, stroke: 'none'}
          }
        })
      });
      hoverView.out();
      this.items.push(hoverView);
      this.listenTo(hoverView, 'hover', this.hover);
      this.listenTo(hoverView, 'out', this.out);
      this.listenTo(hoverView, 'close', this.close);
    },

    // Pass hover event to pause auto scroll
    hover: function() {
      this.trigger('hover');
    },

    // Pass hover out event to resume auto scroll
    out: function() {
      this.trigger('out');
    },

    // Move to another screen
    close: function() {
      this.trigger('close', "#work/current/" + this.model.get('id'));
    },

    // Remove the view
    remove: function() {
      _.each(this.items, function(item) {
        item.remove();
      });
      this.items = [];
      SvgItem.__super__.remove.call(this);
    }
  });

  // Column view
  var ColumnView = Backbone.View.extend({
    items: [],
    isScrolling: false,

    // Initialization
    initialize: function(options) {
      ColumnView.__super__.initialize.call(this, options);
      this.parentHeight = options.parentHeight;
      this.$el.css(options.style);
    },

    // Add work to the column
    add: function(model) {
      var item;
      if (model.get('thumbnail')){
        item = new ThumbnailItem({model: model});
      } else {
        // Set svg color depeneds on the index
        var colors = [Color.SKY, Color.PINK, Color.CREAM]
        var colorIndex = parseInt(model.collection.indexOf(model), 10) % colors.length;
        item = new SvgItem({model: model, themeColor: colors[colorIndex]});
      }
      this.items.push(item);
      this.listenTo(item, 'hover', this.pause);
      this.listenTo(item, 'out', this.resume);
      this.listenTo(item, 'close', this.close);

      this.$el.find('ul').append(item.render().$el);
      item.createItems();
    },

    // Reset scroll position
    resetTopPos: function() {
      this.isScrolling = false;
      this.$el.fadeOut(1000, function() {
        this.$el.css({top: 0}).fadeIn(1000);
      }.bind(this));
    },

    // Pause auto scroll
    pause: function() {
      if (this.isScrolling) {
        this.$el.pause();
      }
    },

    // Resume auto scroll
    resume: function() {
      if (this.isScrolling) {
        this.$el.resume();
      }
    },

    // Start auto scroll
    setScroll: function() {
      var baseSpeed = 80; // speed = px / sec
      var scrollHeight = parseFloat(this.$el.css('height'), 10) - this.parentHeight;
      if (scrollHeight < 0) {
        // No  need to scroll
        return; 
      }
      this.$el.animate(
        {top: -scrollHeight + 'px'},
        Math.round(scrollHeight / baseSpeed + this.random(10)) * 1000,
        'linear', this.transitionEnd.bind(this));
      this.isScrolling = true;
    },

    // Function called on auto scroll end
    transitionEnd: function() {
      this.resetTopPos();
    },

    // Get ramdam number
    random(max) {
      return Math.floor(Math.random() * max + 1);
    },

    // Trigger close event
    close: function(hash) {
      this.trigger('close', hash);
    },

    // 
    remove: function() {
      _.each(this.items, function(item) {
        item.remove();
      });
      this.items = [];
      ColumnView.__super__.remove.call(this);
    }
  });

  // Current constellation works
  var TableView = Backbone.View.extend({
    el: '#works',
    items: [],

    // Initialization
    initialize: function(options) {
      TableView.__super__.initialize.call(this, options);
      this.autoScroll = options.autoScroll;
      this.createItems();
    },

    // Create child views
    createItems: function() {
      var $columns = this.$el.find('.column');
      var parentHeight = parseFloat(this.$el.css('height'), 10);
      var columnWidth= (parseInt(this.$el.css('width'), 10) -
              parseInt(this.$el.css('padding-left'), 10)) / $columns.length;
      var leftBase = parseInt(this.$el.css('left'), 10);

      // Create each culumn
      this.items = [];
      _.each($columns, function(column, index) {
        this.items.push(new ColumnView({
          el: column, parentHeight: parentHeight,
          style: {width: columnWidth, left: leftBase + columnWidth * index}
        }));
        this.listenTo(this.items[index], 'close', this.close);
      }, this);

      // Add works to each column
      var columnIndex = 0;
      this.collection.each(function(model) {
        this.items[columnIndex].add(model);
        if (this.items.length <= ++columnIndex) {
          columnIndex = 0;
        }
      }, this);

      if (this.autoScroll) {
        this.scrollTimerId = setTimeout(function() {
          _.each(this.items, function(item) {
            item.setScroll();
          });
        }.bind(this), 3000);
      }
    },
    close: function(hash) {
      this.trigger('close', hash);
    },
    remove: function() {
      _.each(this.items, function(item) {
        item.remove();
      });
      this.items = [];
      TableView.__super__.remove.call(this);
    }
  });

  // Constellation view
  var ConstellationView = Backbone.View.extend({
    el: '#constellation',
    items: [],

    // Initialization
    initialize: function(options) {
      ConstellationView.__super__.initialize.call(this, options);
      this.autoScroll = options.autoScroll;
    },

    // Rendering the view
    render: function() {
      var template = _.template($('#constellation_template').html());
      this.$el.html(template(dic));
      return this;
    },

    // Create child views
    createItems: function() {
      this.items = [];

      // Menu link
      var menuView = new MenuView({
        hover: {
          path: {fill: Color.WHITE, stroke: Color.LIME},
          text: {fill: Color.LIME, stroke: 'none'}
        },
        out: {
          path: {fill: Color.LIME, stroke: Color.LIME},
          text: {fill: Color.WHITE, stroke: 'none'}
        }
      });
      this.items.push(menuView);
      this.listenTo(menuView, 'close', this.close);

      // Curatorial statement link
      var escapeView = new EscapeView({
        el: '.curatorial',
        color: {
          hover: {
            path: {fill: Color.GREEN, stroke: Color.GREEN},
            text: {fill: Color.WHITE, stroke: 'none'}
          },
          out: {
            path: {fill: 'none', stroke: Color.GREEN},
            text: {fill: Color.BLACK, stroke: 'none'}
          }
        }
      });
      this.items.push(escapeView);
      this.listenTo(escapeView, 'close', function() {
        this.close('curatorial');
      });

      // Works
      var tableView = new TableView({
        autoScroll: this.autoScroll, collection: this.collection});
      this.items.push(tableView);
      this.listenTo(tableView, 'close', this.close);
    },

    // Move to another screen
    close: function(hash) {
      if (hash) {
        Backbone.history.navigate(hash, {trigger: true});
      }
    },

    // Remove the view
    remove: function() {
      _.each(this.items, function(item) {
        item.remove();
      });
      this.items = [];
      StatementView.__super__.remove.call(this);
    }
  });
  return ConstellationView;
});
