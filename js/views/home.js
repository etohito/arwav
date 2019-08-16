define([
  'backbone',
  'models/hover',
  'views/hover',
  'views/escape',
  'views/menu',
  'views/signin',
], function(
  Backbone,
  HoverModel,
  HoverView,
  EscapeView,
  MenuView,
  SigninView
) {
  var HomeItem = HoverView.extend({
    initialize: function(options) {
      HomeItem.__super__.initialize.call(this, options);

      this.dic = options.dic;
      this.link = options.link;
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
      Backbone.history.navigate(this.link, true);
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
      new SigninView();
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
        {el: '.login', link: '#login'},
        {el: '.signup', link: '#signup'},
        {el: '.aboutus', link: '#aboutus'},
        {el: '.language', link: '#language'},
        {el: '.constellation', link: '#constellation'},
      ];
      _.each(itemsInfo, function(itemInfo) {
        new HomeItem(itemInfo);
      }, this);
    },
  });
  return HomeView;
});
