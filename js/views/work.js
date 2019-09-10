define([
  'backbone',
  'util/color',
  'models/hover',
  'views/hover',
  'views/menu',
  'views/escape',
 ], function(
  Backbone,
  Color,
  HoverModel,
  HoverView,
  MenuView,
  EscapeView,
) {

  // Previous or next item
  var PrevNextItem = Backbone.View.extend({
    initialize: function(options) {
      this.template = _.template($(options.selector).html());
      this.render();
      this.addListener();
    },
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    },
    addListener: function() {
      this.$el.on('click', this.close.bind(this));
      this.$el.find('.arrow').on('click', this.close.bind(this));
    },
    removeListener: function() {
      this.$el.off('click');
      this.$el.find('.arrow').off('click');
    },
    close: function() {
      this.trigger('close', "#work/" + this.model.get('id'));
    },
    remove: function() {
      this.removeListener();
      PrevNextItem.__super__.remove.call(this);
    }
  });

  // Previous or next item which does not have thumbnail
  var SvgPrevNextItem = Backbone.View.extend({
    items: [],
    initialize: function(options) {
      SvgPrevNextItem.__super__.initialize.call(this, options);
      this.template = _.template($(options.selector).html());
      this.render().createItems();
      this.addListener();
    },
    render: function() {
      this.$el.append(this.template(this.model.toJSON()));
      return this;
    },
    createItems: function() {
      // Enable svg hover
      var color = {
        hover: {path: {fill: Color.SKY, stroke: Color.SKY}, text: {fill: Color.WHITE, stroke: 'none'}},
        out:   {path: {fill: 'none', stroke: Color.SKY}, text: {fill:  Color.BLACK, stroke: 'none'}}
      };
      var hoverView = new HoverView({
        el: this.$el.find('svg'),
        model: new HoverModel(color)
      });
      hoverView.out();
      this.items.push(hoverView);
      this.listenTo(hoverView, 'close', this.close);
    },
    addListener: function() {
      this.$el.find('.arrow').on('click', this.close.bind(this));
    },
    removeListener: function() {
      this.$el.find('.arrow').off('click');
    },
    close: function() {
      this.trigger('close', "#work/" + this.model.get('id'));
    },
    remove: function() {
      _.each(this.items, function(item) {
        item.remove();
      });
      this.items = [];
      this.removeListener();
      SvgPrevNextItem.__super__.remove.call(this);
    }
  });

  // Work main item
  var MainItem = Backbone.View.extend({
    initialize: function(options) {
      MainItem.__super__.initialize.call(this, options);
      this.render();
    },
    render: function() {
      var template;
      switch (this.model.get('type')) {
      case 'video':
        template = _.template($('#video_template').html());
        break;
      case 'audio':
        template = _.template($('#audio_template').html());
        break;
      case 'image':
        template = _.template($('#image_template').html());
        break;
      case 'text':
      default:
        template = _.template($('#text_template').html());
        break;
      }
      this.$el.html(template(this.model.toJSON()));
      return this;
    }
  });

  // Work screen
  var WorkView = Backbone.View.extend({
    el: '#work',
    items: [],
    initialize: function(options) {
      WorkView.__super__.initialize.call(this, options);
    },
    render: function() {
      var template = _.template($('#work_template').html());
      this.$el.html(template(dic));
      return this;
    },
    createItems: function() {
      var model, options, item;

      // previous work
      model = this.collection.shift();
      options = {el: this.$el.find('.prev'), model: model}
      if (model.get('thumbnail')) {
        options.selector = '#prev_template';
        item = new PrevNextItem(options);
      } else {
        options.selector = '#svg_prev_template';
        item = new SvgPrevNextItem(options);
      }
      this.items.push(item);
      this.listenTo(item, 'close', this.close);

      // main work
      model = this.collection.shift();
      options = {el: this.$el.find('.main'), model: model};
      item = new MainItem(options);
      this.items.push(item);
      this.listenTo(item, 'close', this.close);

      // next work
      model = this.collection.shift();
      options = {el: this.$el.find('.next'), model: model};
      if (model.get('thumbnail')) {
        options.selector = '#next_template';
        item = new PrevNextItem(options);
      } else {
        options.selector = '#svg_next_template';
        item = new SvgPrevNextItem(options);
      }
      this.items.push(item);
      this.listenTo(item, 'close', this.close);

      // Menu link
      options = {
        hover: {path: {fill: Color.WHITE, stroke: Color.LIME}, text: {fill: Color.LIME, stroke: 'none'}},
        out:   {path: {fill: Color.LIME, stroke: Color.LIME}, text: {fill: Color.WHITE, stroke: 'none'}}
      };
      var menuView = new MenuView(options);
      this.items.push(menuView);
      this.listenTo(menuView, 'close', this.close);

      // Curatorial statement link for pc
      if (this.$el.find('.curatorial')) {
        options = {
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
      }
      // Back link for mobile
      if (this.$el.find('.back')) {
        options = {
          el: '.back',
          color: {
            hover: {path: {fill: Color.GREEN, stroke: Color.GREEN}, text: {fill: Color.WHITE, stroke: 'none'}},
            out:   {path: {fill: 'none', stroke: Color.GREEN}, text: {fill: Color.BLACK, stroke: 'none'}}
          }
        };
        var escapeView = new EscapeView(options);
        this.items.push(escapeView);
        this.listenTo(escapeView, 'close', function() {
          this.close(null);
          history.back();
        });
      }
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
  return WorkView;
});
