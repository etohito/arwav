define(['backbone'], function(Backbone) {
  var HoverModel = Backbone.Model.extend({
    defaults: function() {
      return {
        hover: {
          path: {fill: 'none', stroke: 'none'},
          text: {fill: 'none', stroke: 'none'},
        },
        out: {
          path: {fill: 'none', stroke: 'none'},
          text: {fill: 'none', stroke: 'none'},
        }
      };
    },
  });
  return HoverModel;
});
