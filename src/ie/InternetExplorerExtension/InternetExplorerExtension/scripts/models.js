// Person Model
var Widget = Backbone.Model.extend({
	defaults: {
		title: "Editions Lefebvre Sarrut",
		baseUrl: getUrl(""),
		compress: 1,//0 = fermé, 1=semi ouvert, 2=ouvert + desc
		sort: "revelance",
		error: {
			logged: false,
			https: false
		},
		results: null,
		filters: null,
		filterBy: null,
		fullResultUrl: ""
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
