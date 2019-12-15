define(['backbone'], function(Backbone) {
  var AuthorModel = Backbone.Model.extend({
    defaults: function() {
      return {
        author: {
          en:     null,
          jp:     null
        },
        introduction: {
          en:     null,
          jp:     null
        },
        works: null
      };
    },
    parse: function(response, options) {
      return JSON.parse(response);
    },
    toJSON: function() {
      var json = AuthorModel.__super__.toJSON.call(this);
      json.author = json.author[dic.NAME];
      json.introduction = json.introduction[dic.NAME];
      return json;
    }
  });
  return AuthorModel;
});
