define(['backbone'], function(Backbone) {
  var WorkModel = Backbone.Model.extend({
    defaults: function() {
      return {
        id:       null,
        type:     null,
        title: {
          en:     null,
          jp:     null
        },
        thumbnail:null,
        work: {
          en:     null,
          jp:     null
        }
      };
    },
    parse: function(response, options) {
      return JSON.parse(response);
    },
    toJSON: function() {
      var json = WorkModel.__super__.toJSON.call(this);
      json.title = json.title[dic.NAME];
      json.work = json.work[dic.NAME];
      return json;
    }
  });
  return WorkModel;
});
