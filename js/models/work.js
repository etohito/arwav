define(['backbone'], function(Backbone) {
  var WorkModel = Backbone.Model.extend({
    defaults: function() {
      return {
        id:           null,
        type:         null,
        date:         null,
        title:        null,
        author:       null,
        resource:     null,
        thumbnail: {
          uri:        null,
          height:     0,
          width:      0,
        },
        description:  null,
      };
    },
    parse: function(response, options) {
      return JSON.parse(response);
    },
  });
  return WorkModel;
});
