define([
  'backbone',
  'util/color',
  'views/menu',
  'views/escape',
 ], function(
  Backbone,
  Color,
  MenuView,
  EscapeView,
) {
  var MainItem = Backbone.View.extend({
    initialize: function(options) {
      switch (this.model.get('type')) {
      case 'video':
        this.template = _.template($('#video_template').html());
        break;
      case 'audio':
        this.template = _.template($('#audio_template').html());
        break;
      case 'image':
        this.template = _.template($('#image_template').html());
        break;
      case 'text':
        this.template = _.template($('#text_template').html());
        break;
      default:
        break;
      }
    },
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    },
  });
  var PrevItem = Backbone.View.extend({
    initialize: function(options) {
      this.template = _.template($('#prev_template').html());
    },
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    },
  });
  var PrevSvgItem = Backbone.View.extend({
    initialize: function(options) {
      this.template = _.template($('#svg_prev_template').html());
    },
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    },
  });
  var NextItem = Backbone.View.extend({
    initialize: function(options) {
      this.template = _.template($('#next_template').html());
    },
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    },
  });
  var NextSvgItem = Backbone.View.extend({
    initialize: function(options) {
      this.template = _.template($('#svg_next_template').html());
    },
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    },
  });
  var WorkView = Backbone.View.extend({
    el: '#work',
    items: [],
    initialize: function(options) {
      this.template = _.template($('#work_template').html());
    },
    render: function() {
      this.$el.html(this.template(dic));
      return this;
    },
    createItems: function() {
      var model, options, prevItem, nextItem, mainItem;

      // previous work
      model = this.collection.shift();
      options = {el: this.$el.find('.prev'), model: model}
      if (model.get('thumbnail').uri) {
        prevItem = new PrevItem(options).render();
      } else {
        prevItem = new PrevSvgItem(options).render();
      }
      this.items.push(prevItem);
      this.listenTo(mainItem, 'close', this.close);

      // main work
      model = this.collection.shift();
      options = {el: this.$el.find('.main'), model: model};
      mainItem = new MainItem(options).render();
      this.items.push(mainItem);
      this.listenTo(mainItem, 'close', this.close);

      // next work
      model = this.collection.shift();
      options = {el: this.$el.find('.next'), model: model};
      if (model.get('thumbnail').uri) {
        nextItem = new NextItem(options).render();
      } else {
        nextItem = new NextSvgItem(options).render();
      }
      this.items.push(nextItem);
      this.listenTo(nextItem, 'close', this.close);

      var menuView = new MenuView({
        hover: {
          path: {fill: '#fff', stroke: Color.GREEN},
          text: {fill: Color.GREEN, stroke: 'none'},
        },
        out: {
          path: {fill: Color.GREEN, stroke: Color.GREEN},
          text: {fill: '#fff', stroke: 'none'},
        }
      });
      this.items.push(menuView);
      this.listenTo(menuView, 'close', this.close);

      var escapeColor = '#60b767';
      var escapeView = new EscapeView({color: {
        hover: {
          path: {fill: escapeColor, stroke: escapeColor},
          text: {fill: '#fff', stroke: 'none'}
        },
        out: {
          path: {fill: 'none', stroke: escapeColor},
          text: {fill: '#000', stroke: 'none'}
        }
      }});
      this.items.push(escapeView);
      this.listenTo(escapeView, 'close', this.close);
    },
    close: function(hash) {
      Backbone.history.navigate('home', true); // @todo link
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
  return WorkView;
});
