define([
  'dic/jp',
  'dic/en',
  'views/home',
  'views/work',
  'views/archives',
  'views/statement',
  'views/constellation',
  'collections/works'
], function(
  Jp,
  En,
  HomeView,
  WorkView,
  ArchivesView,
  StatementView,
  ConstellationView,
  WorkCollection
) {
  var Router = Backbone.Router.extend({
    FADE_MS: 1000,
    device: null,
    routes: {
      'home(/:focus)':  'home',
      'language':       'language',
      'archives':       'archives',
      'work/:id':       'work',
      'aboutus':        'aboutus',
      'curatorial':     'curatorial',
      'constellation':  'constellation',
      '*default':       'constellation',
    },
    initialize: function(options) {
      // Load css
      if (window.matchMedia('(max-width: 767px)').matches) {
        this.device = 'mobile';
      } else {
        this.device = 'pc';
      }
      $("<link>", {
        rel: 'stylesheet',
        type: 'text/css',
        href: 'css/style_' + this.device + '.css'
      }).appendTo('head');

      // Load dictionary and work list
      window.dic = Jp;
      $.getJSON('resources/works.json', function(json) {
        this.workList= json;
        Backbone.history.start();
      }.bind(this));
      this.$content = $('#content');
    },
    home: function(focus) {
      if (this.device == 'mobile') {
        this.$content.hide().load('templates/mobile/home.html', function() {
          var homeView = new HomeView().render();
          this.$content.fadeIn(this.FADE_MS, function() {
            homeView.scrollTop(focus);
          });
        }.bind(this));
      } else {
        this.$content.hide().load('templates/pc/home_' + dic.NAME + '.html', function() {
          new HomeView();
          this.$content.fadeIn(this.FADE_MS);
        }.bind(this));
      }
    },
    language: function() {
      window.dic = (window.dic == Jp) ? En : Jp;
      history.back();
    },
    aboutus: function() {
      if (this.device == 'mobile') {
        Backbone.history.navigate('home/aboutus', {trigger: true, replace: true});
      } else {
        var options = {
          statement: {
            title: dic.ABOUTUS_TITLE,
            summary: dic.ABOUTUS_SUMMARY,
            description: ''
          },
          themeColor: '#abd5af'
        };
        $('#statement').load('templates/pc/statement.html', function() {
          new StatementView(options).render().createItems();
          this.$content.fadeIn(this.FADE_MS);
        }.bind(this));
      }
    },
    curatorial: function() {
      if (this.device == 'mobile') {
        Backbone.history.navigate('home/curatorial', {trigger: true, replace: true});
      } else {
        var options = {
          statement: {
            title: dic.CURATORIAL_TITLE,
            summary: dic.CURATORIAL_SUMMARY,
            description: dic.CURATORIAL_DESCRIPTION
          },
          themeColor: '#f5dad5'
        };
        $('#statement').load('templates/pc/statement.html', function() {
          new StatementView(options).render().createItems();
          this.$content.fadeIn(this.FADE_MS);
        }.bind(this));
      }
    },
    constellation: function() {
      var html = 'templates/' + this.device + '/constellation.html';
      var options;
      if (this.device == 'mobile') {
        options = {autoScroll: false};
      } else {
        options = {autoScroll: true};
      }

      $.when(
        $.getJSON('resources/constellation.json'),
        $.get(html)).done(function(json, html) {
          var list = [];
          _.each(json[0], function(workId, index) {
            list.push(_.findWhere(this.workList, workId));
          }, this);

          this.$content.html(html[0]);
          new ConstellationView(
              _.extend(options, {collection: new WorkCollection(list)}))
              .render().createItems();
          this.$content.fadeIn(this.FADE_MS);
        }.bind(this));
    },
    archives: function(index) {
      var html = 'templates/' + this.device + '/archives.html';
      var options;
      if (this.device == 'mobile') {
        options = {columnNum: 1, randomPos: false};
      } else {
        options = {columnNum: 2, randomPos: true};
      }
      $.when(
        $.getJSON('resources/archives.json'),
        $.get(html)).done(function(json, html) {
          var list = [];
          _.each(json[0], function(archive) {
            list.push(_.findWhere(this.workList, archive));
          }, this);

          this.$content.html(html[0]);
          new ArchivesView(_.extend(options, {
            collection: new WorkCollection(list)
          })).render().createItems();
          this.$content.fadeIn(this.FADE_MS);
        }.bind(this));
    },
    work: function(id) {
      var html = 'templates/' + this.device + '/work.html';
      var index = _.findIndex(this.workList, {id: id});
      index = (index == -1) ? 0 : index;
      var last = this.workList.length - 1;
      var prev = (0 < index) ? (index - 1) : last;
      var next = (index < last) ? (index + 1) : 0;

      this.$content.load(html, function() {
        new WorkView({collection: new WorkCollection(
          [this.workList[prev], this.workList[index], this.workList[next]]
        )}).render().createItems();
      }.bind(this));
    },
  });
  return Router;
});

