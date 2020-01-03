define(['backbone'], function(Backbone) {
  // Work data
  var WorkModel = Backbone.Model.extend({
    defaults: function() {
      return {
        type:     null,
        date:     null,
        title: {
          en:     null,
          jp:     null
        },
        work: {
          en:     null,
          jp:     null
        },
        text: {
          en:     null,
          jp:     null
        }
      };
    },

    // Parse data
    parse: function(response, options) {
      return JSON.parse(response);
    },

    // Load text files
    loadText: function(callback) {
      var dfd = $.Deferred();

      if (this.get('type') != 'text') {
        dfd.resolve();
      } else {
        $.when(
          $.get(this.get('work').en),
          $.get(this.get('work').jp)
        ).done(function(en, jp) {
          this.set('text', {
            en: en[0].replace(/\r?\n/g, '</br>'),
            jp: jp[0].replace(/\r?\n/g, '</br>')
          });
        }.bind(this)).always(dfd.resolve);
      }
      return dfd.promise();
    },

    // Convert to json
    toJSON: function() {
      var json = WorkModel.__super__.toJSON.call(this);
      json.title = json.title[dic.NAME];
      json.work = json.work[dic.NAME];
      json.text = json.text[dic.NAME];
      return json;
    }
  });
  return WorkModel;
});
