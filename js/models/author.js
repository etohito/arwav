define(['backbone'], function(Backbone) {
  // Author data
  var AuthorModel = Backbone.Model.extend({
    defaults: function() {
      return {
        id:       null, 
        author: {
          en:     null,
          jp:     null
        },
        introduction: {
          en:     null,
          jp:     null
        },
        text: {
          en:     null,
          jp:     null
        },
        project: {
          en:     null,
          jp:     null
        },
        thumbnail:null,
        works:    null
      };
    },

    // Parse data
    parse: function(response, options) {
      return JSON.parse(response);
    },

    // Load text files
    loadText: function(callback) {
      var dfd = $.Deferred();

      if (this.get('introduction').en) {
        $.when(
          $.get(this.get('introduction').en),
          $.get(this.get('introduction').jp),
          this.get('works').loadText()
        ).done(function(en, jp) {
          this.set('text', {
            en: en[0].replace(/\r?\n/g, '</br>'),
            jp: jp[0].replace(/\r?\n/g, '</br>')
          });
        }.bind(this)).always(dfd.resolve);
      } else {
        $.when(this.get('works').loadText()).always(dfd.resolve);
      }
      return dfd.promise();
    },

    // Convert to json
    toJSON: function() {
      var json = AuthorModel.__super__.toJSON.call(this);
      json.author = json.author[dic.NAME];
      json.text = json.text[dic.NAME];
      json.introduction = json.introduction[dic.NAME];
      json.project = json.project[dic.NAME];
      return json;
    }
  });
  return AuthorModel;
});
