// Person Model
var Widget = Backbone.Model.extend({
	defaults: {
		title: "Editions Lefebvre Sarrut",
		baseUrl: getUrl(""),
		compress: 1,//0 = fermé, 1=semi ouvert, 2=ouvert + desc
		sortBy: "revelance",
		ident: null,
		password: null,
		error: {
			logged: false,
			https: false,
			loginFailed: false
		},
		results: null,
		filters: null,
		filterBy: null,
		fullResultUrl: "",
		getImageUrl: function(uri){
			return uri;
		}
	}
});
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

// Person Model
var Filter = Backbone.Model.extend({
	defaults: {
		id: "",
		nb: 0,
		subs: [],
		open: false
	}
});


var FiltersCollection = Backbone.Collection.extend({
	model: Filter
});
var filtersCollection = new FiltersCollection([]);
