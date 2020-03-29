define([
  'backbone',
  'util/color',
  'util/util',
  'models/hover',
  'views/hover',
  'views/menu',
  'views/escape',
 ], function(
  Backbone,
  Color,
  Util,
  HoverModel,
  HoverView,
  MenuView,
  EscapeView,
) {

  // Previous or next item
  var PrevNextItem = Backbone.View.extend({

    // Initialization
    initialize: function(options) {
      this.template = _.template($(options.selector).html());
      this.render();
      this.addListener();
    },

    // Rendering the view
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    },

    // Register listeners
    addListener: function() {
      this.$el.on('click', this.close.bind(this));
      this.$el.find('.arrow').on('click', this.close.bind(this));
    },

    // Clear listeners
    removeListener: function() {
      this.$el.off('click');
      this.$el.find('.arrow').off('click');
    },

    // Move to another screen
    close: function() {
      var hash = location.hash.split('/')
      this.trigger('close', hash[0] + '/' + hash[1] + '/' + this.model.get('id'));
    },

    // Remove the view
    remove: function() {
      this.removeListener();
      PrevNextItem.__super__.remove.call(this);
    }
  });

  // Previous or next item which does not have thumbnail
  var SvgPrevNextItem = Backbone.View.extend({
    items: [],

    // Initialization
    initialize: function(options) {
      SvgPrevNextItem.__super__.initialize.call(this, options);
      this.template = _.template($(options.selector).html());
      this.render().createItems();
      this.addListener();
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
      // Enable svg hover
      var hoverView = new HoverView({
        el: this.$el.find('svg'),
        model: new HoverModel({
            hover: {path: {fill: Color.SKY, stroke: Color.SKY},
            text: {fill: Color.WHITE, stroke: 'none'}
          },
          out: {
            path: {fill: 'none', stroke: Color.SKY},
            text: {fill:  Color.BLACK, stroke: 'none'}
          }
        })
      });
      hoverView.out();
      this.items.push(hoverView);
      this.listenTo(hoverView, 'close', this.close);
    },

    // Register listeners
    addListener: function() {
      this.$el.find('.arrow').on('click', this.close.bind(this));
    },

    // Clear listeners
    removeListener: function() {
      this.$el.find('.arrow').off('click');
    },

    // Move to another screen
    close: function() {
      var hash = location.hash.split('/')
      this.trigger('close', hash[0] + '/' + hash[1] + '/' + this.model.get('id'));
    },

    // Remove the view
    remove: function() {
      _.each(this.items, function(item) {
        item.remove();
      });
      this.items = [];
      SvgPrevNextItem.__super__.remove.call(this);
    }
  });

  // Work main item
  var MainItem = Backbone.View.extend({

    // Initialization
    initialize: function(options) {
      MainItem.__super__.initialize.call(this, options);
      this.model.loadText().done(this.render.bind(this));
    },

    // Rendering the view
    render: function() {
      var html = '';
      var template = _.template($('#author_template').html());
      var html = template(this.model.toJSON());

      this.model.get('works').each(function(model) {
        switch (model.get('type')) {
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
          template = _.template($('#text_template').html());
          break;
        default:
          break;
        }
        html += template(model.toJSON());
      }, this);
      // Show works
      this.$el.html(html);

      // Show introduction
      if (this.model.toJSON().text) {
        template = _.template($('#introduction_template').html());
        this.$el.append(template(_.extend(this.model.toJSON())));
      }
      return this;
    }
  });

  // Work screen
  var WorkView = Backbone.View.extend({
    el: '#work',
    items: [],

    // Initialization
    initialize: function(options) {
      WorkView.__super__.initialize.call(this, options);
    },

    // Rendering the view
    render: function() {
      var template = _.template($('#work_template').html());
      this.$el.html(template(dic));
      return this;
    },

    // Create child views
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
        hover: {
          path: {fill: Color.WHITE, stroke: Color.LIME},
          text: {fill: Color.LIME, stroke: 'none'}
        },
        out: {
          path: {fill: Color.LIME, stroke: Color.LIME},
          text: {fill: Color.WHITE, stroke: 'none'}
        }
      };
      var menuView = new MenuView(options);
      this.items.push(menuView);
      this.listenTo(menuView, 'close', this.close);

      // Curatorial statement link for pc
      if (this.$el.find('.curatorial')) {
        options = {
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
            hover: {
              path: {fill: Color.GREEN, stroke: Color.GREEN},
              text: {fill: Color.WHITE, stroke: 'none'}
            },
            out: {
              path: {fill: 'none', stroke: Color.GREEN},
              text: {fill: Color.BLACK, stroke: 'none'}
            }
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
      WorkView.__super__.remove.call(this);
    }
  });
  return WorkView;
});
