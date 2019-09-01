define([
  'backbone',
  'models/hover',
  'views/escape',
  'views/menu',
], function(
  Backbone,
  HoverModel,
  EscapeView,
  MenuView
) {
  var StatementView = Backbone.View.extend({
    el: '#statement',
    events: {
      'click .link': 'click'
    },
    items: [],
    initialize: function(options) {
      StatementView.__super__.initialize.call(this, options);
      this.statement = options.statement;
      this.themeColor = options.themeColor;
      this.template = _.template($('#statement_template').html());
    },
    render: function() {
      this.$el.html(this.template(_.extend({}, this.statement, dic)))
          .css({'background-color': this.themeColor})
          .fadeIn(500);
      return this; 
    },
    createItems: function() {
      var menuView = new MenuView({
        hover: {
          path: {fill: this.themeColor, stroke: '#ffffff'},
          text: {fill: '#ffffff', stroke: 'none'},
        },
        out: {
          path: {fill: '#ffffff', stroke: '#ffffff'},
          text: {fill: this.themeColor, stroke: 'none'}
        }
      });
      var escapeView = new EscapeView({color: {
        hover: {
          path: {fill: '#ffffff', stroke: '#ffffff'},
          text: {fill: this.themeColor, stroke: 'none'}
        },
        out: {
          path: {fill: 'none', stroke: '#ffffff'},
          text: {fill: '#ffffff', stroke: 'none'}
        }
      }});
      this.items.push(menuView);
      this.items.push(escapeView);
      this.listenTo(menuView, 'close', this.close);
      this.listenTo(escapeView, 'close', this.close);
    },
    click: function(event) {
      event.preventDefault();
      this.close(event.target.hash);
    },
    close: function(hash) {
      this.$el.fadeOut(500, function() {
        _.each(this.items, function(item) {
          item.remove();
          this.stopListening(item);
        }, this);
        this.$el.html('');
        this.items = [];
        if (hash) {
          Backbone.history.navigate(hash, {trigger: true});
        } else {
          history.back();
        }
      }.bind(this));
    }
  });
  return StatementView;
});
