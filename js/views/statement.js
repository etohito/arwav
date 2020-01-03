define([
  'backbone',
  'util/color',
  'models/hover',
  'views/escape',
  'views/menu',
], function(
  Backbone,
  Color,
  HoverModel,
  EscapeView,
  MenuView
) {

  // Common view of about us and curatorial statement
  var StatementView = Backbone.View.extend({
    el: '#statement',
    events: {
      'click .link': 'select'
    },
    items: [],

    // Initialization
    initialize: function(options) {
      StatementView.__super__.initialize.call(this, options);
      this.statement = options.statement;
      this.themeColor = options.themeColor;
      this.template = _.template($('#statement_template').html());
    },

    // Rendering the view
    render: function() {
      this.$el.html(this.template(_.extend(this.statement, dic)))
          .css({'background-color': this.themeColor});
      return this; 
    },

    // Create child views
    createItems: function() {
      this.items = [];
      var menuView = new MenuView({
        hover: {
          path: {fill: this.themeColor, stroke: Color.WHITE},
          text: {fill: Color.WHITE, stroke: 'none'},
        },
        out: {
          path: {fill: Color.WHITE, stroke: Color.WHITE},
          text: {fill: this.themeColor, stroke: 'none'}
        }
      });
      var escapeView = new EscapeView({color: {
        hover: {
          path: {fill: Color.WHITE, stroke: Color.WHITE},
          text: {fill: this.themeColor, stroke: 'none'}
        },
        out: {
          path: {fill: 'none', stroke: Color.WHITE},
          text: {fill: Color.WHITE, stroke: 'none'}
        }
      }});
      this.items.push(menuView);
      this.items.push(escapeView);
      this.listenTo(menuView, 'close', this.close);
      this.listenTo(escapeView, 'close', this.close);
    },

    // Select a work
    select: function(event) {
      event.preventDefault();
      this.close(event.target.hash);
    },

    // Move to another screen
    close: function(hash) {
      if (hash) {
        Backbone.history.navigate(hash, {trigger: true});
      } else {
        history.back();
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
  return StatementView;
});
