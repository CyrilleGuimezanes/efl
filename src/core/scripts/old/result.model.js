var Result = Backbone.Model.extend({
  defaults: {
    title: "",
    brief: "",
    source:  "",
    serie:  "",
    category:  "",
    url: "",
    date:  new Date(),
    fdate: ""
  }
});
var results = Backbone.Collection.extend({
	model: Result
});
