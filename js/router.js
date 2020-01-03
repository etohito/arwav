define([
  'dic/jp',
  'dic/en',
  'util/color',
  'views/home',
  'views/work',
  'views/archives',
  'views/statement',
  'views/constellation',
  'models/author',
  'collections/authors',
  'collections/works'
], function(
  Jp,
  En,
  Color,
  HomeView,
  WorkView,
  ArchivesView,
  StatementView,
  ConstellationView,
  AuthorModel,
  AuthorCollection,
  WorkCollection
) {
  var Router = Backbone.Router.extend({
    FADE_MS: 700,
    device: null,
    currentView: null,
    currentCollection: null,
    archiveCollection: null,

    // Map of hash and functon
    routes: {
      'home(/:focus)':     'home',
      'language':          'language',
      'archives':          'archives',
      'work/current/:id':  'workCurrent',
      'work/archive/:id':  'workArchive',
      'aboutus':           'aboutus',
      'curatorial':        'curatorial',
      'constellation':     'constellation',
      '*path':             'home',
    },

    // Initialization
    initialize: function(options) {
      // Load css depends on the device
      if (window.matchMedia('(max-width: 600px)').matches) {
        this.device = 'mobile';
      } else {
        this.device = 'pc';
      }
      $("<link>", {
        rel: 'stylesheet',
        type: 'text/css',
        href: 'css/style_' + this.device + '.css'
      }).appendTo('head');

      // Load dictionary
      window.dic = Jp;

      // Load work data
      $.when(
        $.getJSON('resources/constellation.json'),
        $.getJSON('resources/archives.json')).done(function(constellation, archives) {
          this.currentCollection = new AuthorCollection();
          _.each(constellation[0], function(data) {
            this.currentCollection.add(new AuthorModel(
                _.extend(data, {works: new WorkCollection(data.works)})));
          }, this);

          this.archiveCollection = new AuthorCollection();
          _.each(archives[0], function(data) {
            this.archiveCollection.add(new AuthorModel(
                _.extend(data, {works: new WorkCollection(data.works)})));
          }, this);

          // Start page navigation
          this.$el = $('#content');
          Backbone.history.start();
      }.bind(this));
    },

    // Home screen
    home: function(focus) {
      if (this.device == 'mobile') {
        this.$el.hide().load('templates/mobile/home.html', function() {
          var homeView = new HomeView().render();
          this.$el.fadeIn(this.FADE_MS, function() {
            homeView.scroll(focus);
          });
        }.bind(this));
      } else {
        this.loadPage('home_' + dic.NAME + '.html', function() {
          return new HomeView();
        }.bind(this));
      }
    },

    // Switch language
    language: function() {
      window.dic = (window.dic == Jp) ? En : Jp;
      history.back();
    },

    // About us screen
    aboutus: function() {
      if (this.device == 'mobile') {
        Backbone.history.navigate('home/aboutus', {trigger: true, replace: true});
      } else {
        var options = {
          statement: {
            title:      dic.ABOUTUS_TITLE,
            summary:    dic.ABOUTUS_SUMMARY,
            description:'',
            href:       '',
            link:       '' 
          },
          themeColor: Color.LIME
        };
        this.loadPage('statement.html', function() {
          return new StatementView(options).render().createItems();
        }.bind(this));
      }
    },

    // Curatorial statement screen
    curatorial: function() {
      if (this.device == 'mobile') {
        Backbone.history.navigate('home/curatorial', {trigger: true, replace: true});
      } else {
        var options = {
          statement: {
            title:      dic.CURATORIAL_TITLE,
            summary:    dic.CURATORIAL_SUMMARY,
            description:dic.CURATORIAL_DESCRIPTION,
            href:       '#constellation',
            link:       dic.CONSTELLATION_LINK
          },
          themeColor: Color.PINK 
        };
        this.loadPage('statement.html', function() {
          return new StatementView(options).render().createItems();
        }.bind(this));
      }
    },

    // Constellation screen
    constellation: function() {
      var options;
      if (this.device == 'mobile') {
        options = {autoScroll: false};
      } else {
        options = {autoScroll: true};
      }
      this.loadPage('constellation.html', function() {
        return new ConstellationView(
            _.extend(options, {collection: this.currentCollection}))
            .render().createItems();
      }.bind(this));
    },

    // Arcihves screen
    archives: function(index) {
      var options;
      if (this.device == 'mobile') {
        options = {columnNum: 1, randomPos: false};
      } else {
        options = {columnNum: 2, randomPos: true};
      }
      this.loadPage('archives.html', function() {
        return new ArchivesView(
            _.extend(options, {collection: this.archiveCollection}))
            .render().createItems();
      }.bind(this));
    },

    // Current work screen
    workCurrent: function(id) {
      this.work(id, this.currentCollection);
    },

    // Archive work screen
    workArchive: function(id) {
      this.work(id, this.archiveCollection);
    },

    // Common function to display work screen
    work: function(id, collection) {
      var index = collection.findIndex({id: id});
      index = (index == -1) ? 0 : index;
      var prev = (index == 0) ? (collection.length - 1) : (index - 1);
      var next = (index == collection.length - 1) ? 0 : (index + 1);
      
      this.loadPage('work.html', function() {
        return new WorkView({collection: new AuthorCollection([
          collection.at(prev), collection.at(index), collection.at(next)
        ])}).render().createItems();
      }.bind(this));
    },

    // Common function loading page
    loadPage: function(html, createView) {
      var htmlPath = 'templates/' + this.device + '/' + html;
      $.get(htmlPath).done(function(result) {
        this.$el.fadeOut(this.FADE_MS, function() {
          this.$el.html(result);
          this.currentView && this.currentView.remove();
          this.currentView = createView();
          this.$el.fadeIn(this.FADE_MS);
        }.bind(this));
      }.bind(this));
    },

  });
  return Router;
});

