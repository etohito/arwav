define([
  'backbone',
  'models/hover',
  'views/hover',
], function(
  Backbone,
  HoverModel,
  HoverView,
) {
  var MenuItem = Backbone.View.extend({
    events: {
      'click': 'click'
    },
    initialize: function(options) {
      MenuItem.__super__.initialize.call(this, options);
    },
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
    isSamePage: function(url) {
      var baseUrl = location.href.substring(0, location.href.indexOf('#'));
      return _.isString(url) && (url.indexOf(baseUrl) == 0);
    }
  });
  var MenuList = Backbone.View.extend({
    el: '#menulist',
    items: [],
    initialize: function(options) {
      MenuList.__super__.initialize.call(this, options);
      this.color = options;
    },
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
    createItems: function() {
      var item = null;
      _.each(this.$el.find('li'), function(item) {
        item = new MenuItem({el: item});
        this.items.push(item);
        this.listenTo(item, 'close', this.close);
      }, this);
    },
    show: function() {
      this.$el.addClass('show').hover(null, this.hide.bind(this));
    },
    hide: function() {
      this.$el.removeClass('show');
    },
    close: function(hash) {
      this.hide();
      if (hash && location.hash != hash) {
        this.stopListening();
        this.trigger('close', hash);
      }
    }
  });
  var MenuView = HoverView.extend({
    el: '.menu',
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
    select: function() {
      this.menuList.show();
    },
    close: function(hash) {
      this.trigger('close', hash);
    }
  });
  return MenuView;
});
