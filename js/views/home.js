define([
  'backbone',
  'models/hover',
  'views/hover',
  'views/escape',
  'views/menu',
], function(
  Backbone,
  HoverModel,
  HoverView,
  EscapeView,
  MenuView
) {
  var HomeItem = HoverView.extend({
    initialize: function(options) {
      HomeItem.__super__.initialize.call(this, options);

      this.dic = options.dic;
      this.hash = options.hash;
      this.url = options.url;
      this.themeColor = this.$path.css('stroke');

      this.model = new HoverModel({
        hover: {
          path: {fill: this.themeColor, stroke: this.themeColor},
          text: {fill: '#ffffff', stroke: 'none'},
        },
        out: {
          path: {fill: 'none', stroke: this.themeColor},
          text: {fill:  this.themeColor, stroke: 'none'},
        }
      });
    },
    select: function() {
      if (this.hash) {
        Backbone.history.navigate(this.hash, true);
      } else if (this.url) {
        location.href = this.url;
      }
    },
  });
  var HomeView = Backbone.View.extend({
    el: '#home',
    focus: null,
    initialize: function(options) {
      HomeView.__super__.initialize.call(this, options);
      this.$el.find('.title').css({pointerEvents: 'none'})
      this.createItems();
    },
    render: function() {
      var template = _.template($('#home_template').html());
      this.$el.html(template(dic));
      return this;
    },
    scrollTop: function(focus) {
      var $focus = $('.' + focus);
      if (0 < $focus.length) {
        $('body').animate({scrollTop: $focus.offset().top});
      }
    },
    createItems: function() {
      var itemsInfo = [
        {el: '.instagram', url: dic.INSTAGRAM_URL},
        {el: '.aboutus', hash: '#aboutus'},
        {el: '.language', hash: '#language'},
        {el: '.constellation', hash: '#curatorial'},
      ];
      _.each(itemsInfo, function(itemInfo) {
        new HomeItem(itemInfo);
      }, this);
    },
  });
  return HomeView;
});
