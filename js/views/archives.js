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

  // Text item like title, author, etc
  var TextItem = Backbone.View.extend({
    initialize: function(options) {
      TextItem.__super__.initialize.call(this, options);
      var style = '';
      if (options.randomPos) {
        style = ' align=' + options.align + ' valign=' + options.valign + ' class="text"';
      } else {
        style = ' class="text"';
      }
      this.$el = $('<td' + style + '></td>');
    },
    render: function() {
      var template= _.template($('#text_template').html());
      this.$el.append(template(this.model.toJSON()));
      return this;
    },
    createItems: function() {
    }
  });

  // Thumbnail item
  var ThumbnailItem = Backbone.View.extend({
    initialize: function(options) {
      ThumbnailItem.__super__.initialize.call(this, options);
      var style = '';
      if (options.randomPos) {
        style = ' align=' + options.align + ' valign=' + options.valign;
      }
      this.$el = $('<td' + style + '></td>');
      this.addListener();
    },
    addListener: function() {
      this.$el.on('pointerover', this.hover.bind(this));
      this.$el.on('pointerout', this.out.bind(this));
      this.$el.on('click', this.close.bind(this));
    },
    removeListener: function() {
      this.$el.off('pointerover');
      this.$el.off('pointerout');
      this.$el.off('click');
    },
    render: function() {
      var template= _.template($('#thumbnail_template').html());
      this.$el.append(template(this.model.toJSON()));
      return this;
    },
    createItems: function() {
    },
    hover: function() {
      this.$el.find('img').addClass('focus');
    },
    out: function() {
      this.$el.find('img').removeClass('focus');
    },
    close: function() {
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
      this.themeColor = options.themeColor
      var style = '';
      if (options.randomPos) {
        style = ' align=' + options.align + ' valign=' + options.valign;
      }
      this.$el = $('<td' + style + '></td>');
    },
    render: function() {
      var template = _.template($('#svg_template').html());
      this.$el.append(template(this.model.toJSON()));
      return this;
    },
    createItems: function() {
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
  // Previous constellation works
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
          // Add title
          style = {randomPos: this.randomPos, align: aligns[1],
                  valign: valigns[(i + 1) % valigns.length]};
          item = new TextItem(_.extend({model: model}, style));
          this.items.push(item);
          $tr.append(item.render().$el);

          // Add thumbnail or svg
          style = {randomPos: this.randomPos, align: aligns[i % valigns.length],
                  valign: valigns[i % valigns.length]};
          if (model.get('thumbnail')) {
            item = new ThumbnailItem(_.extend({model: model}, style));
          } else {
            // Set svg color depeneds on its id
            var colors = [Color.SKY, Color.PINK, Color.LIME, Color.CREAM]
            var colorIndex = parseInt(model.get('id'), 10) % colors.length;
            item = new SvgItem(_.extend({
              model: model, themeColor: colors[colorIndex]}, style));
          }
          this.items.push(item);
          this.listenTo(item, 'close', this.close);
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
    },
    close: function(hash) {
      this.trigger('close', hash);
    },
  });
  // Archives screen
  var ArchivesView = Backbone.View.extend({
    el: '#archives',
    items: [],
    initialize: function(options) {
      ArchivesView.__super__.initialize.call(this, options);
      this.columnNum = options.columnNum;
      this.randomPos = options.randomPos;
    },
    render: function() {
      var template = _.template($('#archives_template').html());
      this.$el.html(template(dic))
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

      // Works
      var tableView = new TableView({
        columnNum: this.columnNum,
        collection: this.collection,
        randomPos: this.randomPos
      }).render();

      tableView.createItems();
      this.items.push(tableView);
      this.listenTo(tableView, 'close', this.close);
    },
    close: function(hash) {
      _.each(this.items, function(item) {
        item.remove();
      }, this);
      this.$el.html('');
      this.stopListening();
      this.items = [];
      if (hash) {
        Backbone.history.navigate(hash, {trigger: true});
      }
    }
  });
  return ArchivesView;
});
