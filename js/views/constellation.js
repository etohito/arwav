define([
  'backbone',
  'util/color',
  'models/hover',
  'views/hover',
  'views/escape',
  'views/menu',
], function(
  Backbone,
  Color,
  HoverModel,
  HoverView,
  EscapeView,
  MenuView
) {

  // Thumbnail item
  var ThumbnailItem = Backbone.View.extend({
    initialize: function(options) {
      ThumbnailItem.__super__.initialize.call(this, options);
      this.$el = $('<li></li>');
      this.addListener();
    },
    addListener: function() {
      this.$el.on('click', this.click.bind(this));
    },
    removeListener: function() {
      this.$el.off('click');
    },
    render: function() {
      var template= _.template($('#thumbnail_template').html());
      this.$el.html(template(this.model.toJSON()));
      return this;
    },
    createItems: function() {
    },
    click: function() {
      this.trigger('close', "#work/" + this.model.get('id'));
    },
    remove: function() {
      this.removeListener();
      ThumbnailItem.__super__.remove.call(this);
    }
  });

  // Svg item which does not have thumbnail
  var SvgItem = Backbone.View.extend({
    items: [],
    initialize: function(options) {
      SvgItem.__super__.initialize.call(this, options);
      this.themeColor = options.themeColor;
      this.$el = $('<li></li>');
    },
    render: function() {
      var template = _.template($('#svg_template').html());
      this.$el.html(template(this.model.toJSON()));
      return this;
    },
    createItems: function() {
      this.items = [];

      // Enable svg hover
      var color = {
        hover: {path: {fill: this.themeColor, stroke: this.themeColor}, text: {fill: Color.WHITE, stroke: 'none'}},
        out:   {path: {fill: 'none', stroke: this.themeColor}, text: {fill:  Color.BLACK, stroke: 'none'}}
      };
      var hoverView = new HoverView({
        el: this.$el.find('svg'),
        model: new HoverModel(color)
      });
      hoverView.out();
      this.items.push(hoverView);
      this.listenTo(hoverView, 'close', this.close);
    },
    close: function() {
      this.trigger('close', "#work/" + this.model.get('id'));
    },
    remove: function() {
      _.each(this.items, function(item) {
        item.remove();
      });
      this.items = [];
      SvgItem.__super__.remove.call(this);
    }
  });

  // Column
  var ColumnView = Backbone.View.extend({
    items: [],
    events : {
      'transitionend': 'transitionEnd'
    },
    initialize: function(options) {
      ColumnView.__super__.initialize.call(this, options);
      this.parentHeight = options.parentHeight;
    },
    add: function(model) {
      var item;
      if (model.get('thumbnail')) {
        item = new ThumbnailItem({model: model});
      } else {
        // Set svg color depeneds on its id
        var colors = [Color.SKY, Color.PINK, Color.LIME, Color.CREAM]
        var colorIndex = parseInt(model.get('id'), 10) % colors.length;
        item = new SvgItem({model: model, themeColor: colors[colorIndex]});
      }
      this.items.push(item);
      this.listenTo(item, 'close', this.close);

      this.$el.append(item.render().$el);
      item.createItems();
    },
    resetTopPos: function() {
      this.$el.fadeOut(1000, function() {
        this.$el.css({
          transitionDuration: '0s',
          transitionTimingFunction: 'linear',
          transform: 'none',
        });
        this.$el.fadeIn(1000);
      }.bind(this));
    },
    setScroll: function() {
      var baseSpeed = 40; // speed = px / sec
      var scrollHeight = parseFloat(this.$el.css('height'), 10) - this.parentHeight;
      this.$el.css({
        transitionDuration: scrollHeight / baseSpeed + this.random(5) + 's',
        transitionTimingFunction: 'linear',
        transform: 'translateY(-' + scrollHeight+ 'px)'
      });
    },
    transitionEnd: function() {
      this.resetTopPos();
    },
    random(max) {
      return Math.floor(Math.random() * max + 1);
    },
    close: function(hash) {
      this.trigger('close', hash);
    },
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
    initialize: function(options) {
      TableView.__super__.initialize.call(this, options);
      this.autoScroll = options.autoScroll;
      this.createItems();
    },
    createItems: function() {
      var $columns = this.$el.find('.column>ul');

      // Adjust column width depends on the device width
      $columns.css({width: parseInt(this.$el.css('width'), 10) / $columns.length});
      var parentHeight = parseFloat(this.$el.css('height'), 10);

      // Create each culumn
      this.items = [];
      _.each($columns, function(column, index) {
        this.items.push(new ColumnView({el: column, parentHeight: parentHeight}));
        this.listenTo(this.items[index], 'close', this.close);
      }, this);

      var columnIndex, minHeight, itemHeight = 0;
      var repeatCount = 3; // @todo Please delete if there are enough items to scroll.

      // @todo confirm requirement about how to create columns
      /*
      for (var cnt = 0; cnt < repeatCount; cnt++) {
        this.collection.each(function(model) {
          minHeight = parseFloat(this.items[0].$el.css('height'), 10);
          columnIndex = 0;
          _.each(this.items, function(item, i) {
            itemHeight = parseFloat(item.$el.css('height'), 10);
            if (itemHeight < minHeight) {
              minHeight = itemHeight;
              columnIndex = i;
            }
          }, this);

          this.items[columnIndex].add(model);
        }, this);
      }
      */
      var model;
      var i = 0;
      for (var cnt = 0; cnt < repeatCount;) {
        for (var j = 0; j < this.items.length; j++) {
          if (this.collection.length <= i) {
            cnt++;
            i = 0;
          }
          this.items[j].add(this.collection.at(i++));
        }
      }

      // @todo improve
      if (this.autoScroll) {
        this.scrollTimerId = setTimeout(function() {
          _.each(this.items, function(item) {
            item.setScroll();
          });
        }.bind(this), 1500);
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

  // View for current constellation screen
  var ConstellationView = Backbone.View.extend({
    el: '#constellation',
    items: [],
    initialize: function(options) {
      ConstellationView.__super__.initialize.call(this, options);
      this.autoScroll = options.autoScroll;
    },
    render: function() {
      var template = _.template($('#constellation_template').html());
      this.$el.html(template(dic));
      return this;
    },
    createItems: function() {
      // Menu link
      var options = {
        hover: {path: {fill: Color.WHITE, stroke: Color.LIME}, text: {fill: Color.LIME, stroke: 'none'}},
        out:   {path: {fill: Color.LIME, stroke: Color.LIME}, text: {fill: Color.WHITE, stroke: 'none'}}
      };
      var menuView = new MenuView(options);
      this.items.push(menuView);
      this.listenTo(menuView, 'close', this.close);

      // Curatorial statement link
      var options = {
        el: '.curatorial',
        color: {
          hover: {path: {fill: Color.GREEN, stroke: Color.GREEN}, text: {fill: Color.WHITE, stroke: 'none'}},
          out:   {path: {fill: 'none', stroke: Color.GREEN}, text: {fill: Color.BLACK, stroke: 'none'}}
        }
      };
      var escapeView = new EscapeView(options);
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
    close: function(hash) {
      _.each(this.items, function(item) {
        item.remove();
      }, this);
      this.$el.html('');
      this.items = [];
      this.stopListening();
      if (hash) {
        Backbone.history.navigate(hash, {trigger: true});
      }
    }
  });
  return ConstellationView;
});
