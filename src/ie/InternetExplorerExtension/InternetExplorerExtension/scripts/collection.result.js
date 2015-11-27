// A List of People
var ResultsCollection = Backbone.Collection.extend({
	model: Result,
	strategies: {
		date: function (res) {
			var date = res.get("date");
			if (!date)
			return -1;
			return -date.getTime();
		},
		revelance: function (res) { return -res.get("revelance"); },
	},
	sortByDate: function () {
		this.comparator = this.strategies["date"];
		this.models.sort();
	},
	sortByRevelance: function () {
		this.comparator = this.strategies["revelance"];
		this.models.sort();
	},
	initialize: function () {
		this.sortByRevelance();
	},

});
var resultsCollection = new ResultsCollection([]);
