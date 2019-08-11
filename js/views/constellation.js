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
  var ThumbnailItem = Backbone.View.extend({
    initialize: function(options) {
      ThumbnailItem.__super__.initialize.call(this, options);
      this.$el = $('<li></li>');
    },
    render: function() {
      var template= _.template($('#thumbnail_template').html());
      this.$el.html(template(this.model.toJSON()));
      return this;
    },
    createItems: function() {
    }
  });
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
      var hoverView = new HoverView({
        el: this.$el.find('svg'),
        model: this.getHoverModel()
      });
      var id = this.model.get(id);
      hoverView.__proto__.select = function() {
        Backbone.history.navigate("#work/" + id, true);
        this.trigger('close');
      };
      hoverView.out();
      this.items.push(hoverView);
    },
    getHoverModel: function() {
      return new HoverModel({
        hover: {
          path: {fill: this.themeColor, stroke: this.themeColor},
          text: {fill: '#fff', stroke: 'none'},
        },
        out: {
          path: {fill: 'none', stroke: this.themeColor},
          text: {fill:  '#000', stroke: 'none'},
        }
      });
    },
    remove: function() {
      _.each(this.items, function(item) {
        item.remove();
      });
      this.items = [];
      SvgItem.__super__.remove.call(this);
    }
  });
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
      if (model.get('thumbnail').uri) {
        item = new ThumbnailItem({model: model});
      } else {
        var values = _.values(Color);
        var colorIndex = parseInt(model.get('id'), 10) % _.values(Color).length;
        item = new SvgItem({model: model, themeColor: values[colorIndex]});
      }
      this.items.push(item);
      this.$el.append(item.render().$el);
      item.createItems();
    },
    resetTopPos: function() {
      this.$el.fadeOut(500, function() {
        this.$el.css({
          transitionDuration: '0s',
          transitionTimingFunction: 'linear',
          transform: 'none',
        });
        this.$el.fadeIn();
      }.bind(this));
    },
    setScroll: function() {
      var scrollHeight = parseFloat(this.$el.css('height'), 10) - this.parentHeight;
      this.$el.css({
        transitionDuration: 10 + this.random(10) + 's',
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
    remove: function() {
      _.each(this.items, function(item) {
        item.remove();
      });
      this.items = [];
      ColumnView.__super__.remove.call(this);
    }
  });
  var TableView = Backbone.View.extend({
    el: '#works',
    items: [],
    initialize: function(options) {
      TableView.__super__.initialize.call(this, options);
      this.autoScroll = options.autoScroll;
      this.createItems();
    },
    createItems: function() {
      this.items = [];
      var $columns = this.$el.find('.column>ul');
      $columns.css({width: parseInt(this.$el.css('width'), 10) / $columns.length});
      var parentHeight = parseFloat(this.$el.css('height'), 10);

      _.each($columns, function(column) {
        this.items.push(new ColumnView({
          el: column, parentHeight: parentHeight}));
      }, this);
      var columnIndex = 0;
      var minHeight = 0;
      var itemHeight = 0;

      // create each culumn
      var repeatCount = 3;
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

      if (this.autoScroll) {
        this.scrollTimerId = setTimeout(function() {
          _.each(this.items, function(item) {
            item.setScroll();
          });
        }.bind(this), 1500);
      }
    },
    remove: function() {
      _.each(this.items, function(item) {
        item.remove();
      });
      this.items = [];
      TableView.__super__.remove.call(this);
    }
  });
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
      var menuView = new MenuView({
        hover: {
          path: {fill: '#ffffff', stroke: Color.GREEN},
          text: {fill: Color.GREEN, stroke: 'none'},
        },
        out: {
          path: {fill: Color.GREEN, stroke: Color.GREEN},
          text: {fill: '#ffffff', stroke: 'none'},
        }
      });
      this.items.push(menuView);
      this.listenTo(menuView, 'close', this.close);

      var escapeColor = '#60b767'; // @todo get color from style
      var escapeView = new EscapeView({el: '.curatorial', color: {
        hover: {
          path: {fill: escapeColor, stroke: escapeColor},
          text: {fill: '#ffffff', stroke: 'none'}
        },
        out: {
          path: {fill: 'none', stroke: escapeColor},
          text: {fill: '#000000', stroke: 'none'}
        }
      }});
      this.items.push(escapeView);
      this.listenTo(escapeView, 'close', this.close);

      var tableView = new TableView({
        autoScroll: this.autoScroll, collection: this.collection});
      this.items.push(tableView);
      this.listenTo(tableView, 'close', this.close);
    },
    close: function(hash) {
      _.each(this.items, function(item) {
        item.remove();
        this.stopListening(item);
      }, this);
      this.$el.html('');
      this.items = [];
      if (hash) {
        Backbone.history.navigate(hash, {trigger: true});
      } else {
        Backbone.history.navigate('curatorial', true);
      }
    }
  });
  return ConstellationView;
});
