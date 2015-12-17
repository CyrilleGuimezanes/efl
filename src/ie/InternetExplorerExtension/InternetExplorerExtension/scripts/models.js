// Person Model
var Widget = Backbone.Model.extend({
	defaults: {
		title: "",
		logo: "",
		className: "",
		baseUrl: getUrl(""),
		compress: 1,//0 = fermé, 1=semi ouvert, 2=ouvert + desc
		sortBy: "revelance",
		connected: false,
		credential: {
			login: window.localStorage ? localStorage.getItem(_provider + "_login") : "",
			password: window.localStorage ? localStorage.getItem(_provider + "_pass") : "",
		},
		error: {},
		results: null,
		filters: null,
		filterBy: null,
		fullResultUrl: "",
		getImageUrl: getImage
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
