define(['backbone'], function(Backbone) {
  var WorkModel = Backbone.Model.extend({
    defaults: function() {
      return {
        id:           null,
        type:         null,
        date:         null,
        title: {
          en: null,
          jp: null
        },
        author: {
          en: null,
          jp: null
        },
        resource:     null,
        thumbnail:    null,
        description:  {
          en: null,
          jp: null
        },
      };
    },
    parse: function(response, options) {
      return JSON.parse(response);
    },
    toJSON: function() {
      var json = WorkModel.__super__.toJSON.call(this);
      json.title = json.title[dic.NAME];
      json.author = json.author[dic.NAME];
      json.description = json.description[dic.NAME];
      return json;
    }
  });
  return WorkModel;
});
