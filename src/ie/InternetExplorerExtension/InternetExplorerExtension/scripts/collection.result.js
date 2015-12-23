/**
 * Backbone collection to handle results
 */
var ResultsCollection = Backbone.Collection.extend({
	model: Result,
	strategies: {
		/**
		 * Function used to sort by Date
		 * @param  {Object} res Result to compare
		 * @return {Integer}     -1, +1 or 0 to sort results
		 */
		date: function (res) {
			var date = res.get("date");
			if (!date)
			return -1;
			return -date.getTime();
		},
		/**
		 * Function used to sort result by revelance
		 * @param  {Object} res Result to compare
		 * @return {Integer}     -1, +1 or 0 to sort results
		 */
		revelance: function (res) {
			 return -res.get("revelance");
		},
	},
	/**
	 * Change sort strategy to sort by date
	 */
	sortByDate: function () {
		this.comparator = this.strategies["date"];
		this.sort();
	},
	/**
	 * Change sort strategy to sort by revelance
	 */
	sortByRevelance: function () {
		this.comparator = this.strategies["revelance"];
		this.sort();
	},
	/**
	 * Init collection by sorting result by revelance
	 */
	initialize: function () {
		this.sortByRevelance();
	},

});
var resultsCollection = new ResultsCollection([]);
