define([
  'backbone',
  'util/color',
  'models/hover',
  'views/hover',
  'views/menu',
], function(
  Backbone,
  Color,
  HoverModel,
  HoverView,
  MenuView
) {
  var TextItem = Backbone.View.extend({
    el: 'li',
    initialize: function(options) {
      TextItem.__super__.initialize.call(this, options);
      this.template= _.template($('#text_template').html());
      var style = '';
      if (options.randomPos) {
        style = ' align=' + options.align +
                ' valign=' + options.valign + ' class="text"';
      } else {
        style = ' class="text"';
      }
      this.$el = $('<td' + style + '></td>');
    },
    render: function() {
      this.$el.append(this.template(this.model.toJSON()));
      return this;
    },
    createItems: function() {
    }
  });
  var ThumbnailItem = Backbone.View.extend({
    initialize: function(options) {
      ThumbnailItem.__super__.initialize.call(this, options);
      this.template= _.template($('#thumbnail_template').html());
      var style = '';
      if (options.randomPos) {
        style = ' align=' + options.align + ' valign=' + options.valign;
      }
      this.$el = $('<td' + style + '></td>');
    },
    render: function() {
      this.$el.append(this.template(this.model.toJSON()));
      return this;
    },
    createItems: function() {
    }
  });
  var SvgItem = Backbone.View.extend({
    el: 'li',
    items: [],
    initialize: function(options) {
      SvgItem.__super__.initialize.call(this, options);
      this.template = _.template($('#svg_template').html());
      this.themeColor = options.themeColor
      var style = '';
      if (options.randomPos) {
        style = ' align=' + options.align + ' valign=' + options.valign;
      }
      this.$el = $('<td' + style + '></td>');
    },
    render: function() {
      this.$el.append(this.template(this.model.toJSON()));
      return this;
    },
    createItems: function() {
      var hoverView = new HoverView({
        el: this.$el.find('svg'),
        model: new HoverModel({
          hover: {
            path: {fill: this.themeColor, stroke: this.themeColor},
            text: {fill: '#fff', stroke: 'none'},
          },
          out: {
            path: {fill: 'none', stroke: this.themeColor},
            text: {fill:  '#000', stroke: 'none'},
          }
        })
      });
      var id = this.model.get('id');
      hoverView.__proto__.select = function() {
        Backbone.history.navigate("#work/" + id, true);
        this.trigger('close');
      };
      hoverView.out();
      this.items.push(hoverView);
    },
  });
  var TableView = Backbone.View.extend({
    el: 'table',
    items: [],
    initialize: function(options) {
      TableView.__super__.initialize.call(this, options);
      this.columnNum = options.columnNum;
      this.randomPos = options.randomPos;
    },
    render: function() {
      var $tr, style, model  = null;
      var aligns = ['left', 'center', 'right']
      var valigns = ['top', 'middle', 'bottom']

      // create each row
      for (var i = 0; i < this.collection.length;) {
        $tr = $('<tr></tr>');
        for (var j = 0; j < this.columnNum; j++) {
          model = this.collection.at(i);
          if (!model) {
            break;
          }
          style = {randomPos: this.randomPos, align: aligns[1],
                  valign: valigns[(i + 1) % valigns.length]};
          item = new TextItem(_.extend({model: model}, style));
          this.items.push(item);
          $tr.append(item.render().$el);

          style = {randomPos: this.randomPos, align: aligns[i % valigns.length],
                  valign: valigns[i % valigns.length]};
          if (model.get('thumbnail').uri) {
            item = new ThumbnailItem(_.extend({model: model}, style));
          } else {
            var values = _.values(Color);
            var colorIndex = parseInt(model.get('id'), 10) % _.values(Color).length;
            item = new SvgItem(_.extend({
              model: model, themeColor: values[colorIndex]}, style));
          }
          this.items.push(item);
          $tr.append(item.render().$el);
          i++;
        }
        this.$el.append($tr);
      }
      return this;
    },
    createItems: function() {
      _.each(this.items, function(item) {
        item.createItems();
      });
    }
  });
  var ArchivesView = Backbone.View.extend({
    el: '#archives',
    items: [],
    initialize: function(options) {
      ArchivesView.__super__.initialize.call(this, options);
      this.template = _.template($('#archives_template').html());
      this.columnNum = options.columnNum;
      this.randomPos = options.randomPos;
    },
    render: function() {
      this.$el.html(this.template(dic))
      this.items.push(new TableView({
        columnNum: this.columnNum,
        collection: this.collection,
        randomPos: this.randomPos
      }).render());
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
      _.each(this.items, function(item) {
        if (_.isFunction(item.createItems)) {
          item.createItems();
        }
      });
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
      }
    }
  });
  return ArchivesView;
});
