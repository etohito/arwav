define([
  'backbone',
  'models/hover',
  'views/hover',
], function(
  Backbone,
  HoverModel,
  HoverView,
) {
  // Menu list item
  var MenuItem = Backbone.View.extend({
    events: {
      'click': 'click'
    },

    // Initialization
    initialize: function(options) {
      MenuItem.__super__.initialize.call(this, options);
    },

    // Function called on menu item selected
    click: function(event) {
      event.preventDefault();
      if (this.isSamePage(event.target.href) || !event.target.href) {
        if (location.hash != event.target.hash) {
          this.stopListening();
        }
        this.trigger('close', event.target.hash);
      } else  {
        location.href = event.target.href;
      }
    },

    // Check the url is same as current screen
    isSamePage: function(url) {
      var baseUrl = location.href.substring(0, location.href.indexOf('#'));
      return _.isString(url) && (url.indexOf(baseUrl) == 0);
    }
  });

  // Menu list view
  var MenuList = Backbone.View.extend({
    el: '#menulist',
    items: [],

    // Initialization
    initialize: function(options) {
      MenuList.__super__.initialize.call(this, options);
      this.color = options;
    },

    // Rendering the view
    render: function() {
      this.$el.load('templates/menu.html', function() {
        var template= _.template($('#menu_template').html());
        this.$el.html(template(dic))
                .css({background: this.color.background})
                .find('a').css({color: this.color.text});
        this.createItems();
      }.bind(this));
      return this;
    },

    // Create child views
    createItems: function() {
      var item = null;
      _.each(this.$el.find('li'), function(item) {
        item = new MenuItem({el: item});
        this.items.push(item);
        this.listenTo(item, 'close', this.close);
      }, this);
    },

    // Show menu list
    show: function() {
      this.$el.addClass('show').hover(null, this.hide.bind(this));
    },

    // Hide menu list
    hide: function() {
      this.$el.removeClass('show');
    },

    // Move to another screen
    close: function(hash) {
      this.hide();
      if (hash && location.hash != hash) {
        this.trigger('close', hash);
      }
    },

    // Remove the view
    remove: function() {
      _.each(this.items, function(item) {
        item.remove();
      });
      this.items = [];
      MenuList.__super__.remove.call(this);
    }
  });

  // Menu view
  var MenuView = HoverView.extend({
    el: '.menu',

    // Initialization
    initialize: function(options) {
      MenuView.__super__.initialize.call(this, options);
      this.model = new HoverModel(options);
      this.menuList = new MenuList({
        background: options.hover.text.fill,
        text: options.hover.path.fill
      }).render();
      this.listenTo(this.menuList, 'close', this.close);
      this.out();
    },

    // Function called on selected menu
    select: function() {
      this.menuList.show();
    },

    // Move to another screen
    close: function(hash) {
      this.trigger('close', hash);
    }
  });
  return MenuView;
});
