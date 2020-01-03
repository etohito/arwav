define([
  'backbone',
  'util/color',
  'util/util',
  'models/hover',
  'views/hover',
  'views/menu',
], function(
  Backbone,
  Color,
  Util,
  HoverModel,
  HoverView,
  MenuView
) {

  // Text item like title, author, etc
  var TextItem = Backbone.View.extend({

    // Initialization
    initialize: function(options) {
      TextItem.__super__.initialize.call(this, options);
      this.columnNum = options.columnNum;
      var style = '';
      if (options.randomPos) {
        style = ' align=' + options.align + ' valign=' +
                options.valign + ' class="text"';
      } else {
        style = ' class="text"';
      }
      this.$el = $('<td' + style + '></td>');
      this.template= _.template($('#text_template').html());
    },

    // Rendering the view
    render: function() {
      this.$el.append(this.template({
        author: this.model.toJSON().author,
        title: this.model.get('works').first().toJSON().title
      }));
      return this;
    },

    // Create child views
    createItems: function() {
    }
  });

  // Thumbnail item
  var ThumbnailItem = Backbone.View.extend({

    // Initialization
    initialize: function(options) {
      ThumbnailItem.__super__.initialize.call(this, options);
      var style = '';
      if (options.randomPos) {
        style = ' align=' + options.align + ' valign=' + options.valign;
      }
      this.$el = $('<td' + style + '></td>');
      this.addListener();
    },

    // Register listener
    addListener: function() {
      this.$el.on('click', this.close.bind(this));
    },

    // Clear listener
    removeListener: function() {
      this.$el.off('click');
    },

    // Rendering the view
    render: function() {
      var template= _.template($('#thumbnail_template').html());
      this.$el.append(template(this.model.toJSON()));
      return this;
    },

    // Create child views
    createItems: function() {
    },

    // Move to another screen
    close: function() {
      this.trigger('close', "#work/archive/" + this.model.get('id'));
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
      this.themeColor = options.themeColor
      var style = '';
      if (options.randomPos) {
        style = ' align=' + options.align + ' valign=' + options.valign;
      }
      this.$el = $('<td' + style + '></td>');
      this.template = _.template($('#svg_template').html());
    },

    // Rendering the view
    render: function() {
      var title = this.model.get('works').first().toJSON().title;
      var splitTitle = Util.split(title, 12, 2);

      this.$el.append(this.template({
        author: Util.substring(this.model.toJSON().author, 18),
        title1: splitTitle[0],
        title2: splitTitle[1]
      }));
      return this;
    },

    // Create child views
    createItems: function() {
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
      this.listenTo(hoverView, 'close', this.close);
    },

    // Move to another screen
    close: function() {
      this.trigger('close', "#work/archive/" + this.model.get('id'));
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

  // Previous constellation works
  var TableView = Backbone.View.extend({
    el: 'table',
    items: [],

    // Initialization
    initialize: function(options) {
      TableView.__super__.initialize.call(this, options);
      this.columnNum = options.columnNum;
      this.randomPos = options.randomPos;
    },

    // Rendering the view
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
          item = new TextItem(_.extend({model: model, columnNum: this.columnNum}, style));
          this.items.push(item);
          $tr.append(item.render().$el);

          // Add thumbnail or svg
          style = {randomPos: this.randomPos, align: aligns[i % valigns.length],
                  valign: valigns[i % valigns.length]};
          if (model.get('thumbnail')){
            item = new ThumbnailItem(_.extend({model: model}, style));
          } else {
            // Set svg color depeneds on its index 
            var colors = [Color.SKY, Color.PINK, Color.CREAM]
            var colorIndex = parseInt(model.collection.indexOf(model), 10) % colors.length;
            item = new SvgItem(_.extend({model: model, themeColor: colors[colorIndex]}, style));
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

    // Create child views
    createItems: function() {
      _.each(this.items, function(item) {
        item.createItems();
      });
    },

    // Move to another screen
    close: function(hash) {
      this.trigger('close', hash);
    },

    // Remove the view
    remove: function() {
      _.each(this.items, function(item) {
        item.remove();
      });
      this.items = [];
      TableView.__super__.remove.call(this);
    }
  });

  // Archives screen
  var ArchivesView = Backbone.View.extend({
    el: '#archives',
    items: [],

    // Initialization
    initialize: function(options) {
      ArchivesView.__super__.initialize.call(this, options);
      this.columnNum = options.columnNum;
      this.randomPos = options.randomPos;
    },

    // Rendering the view
    render: function() {
      var template = _.template($('#archives_template').html());
      this.$el.html(template(dic))
      return this;
    },

    // Create child views
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
      ArchivesView.__super__.remove.call(this);
    }
  });
  return ArchivesView;
});
