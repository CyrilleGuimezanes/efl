
var getUrl = function(uri){
  return chrome.extension.getURL(uri);
}
// Person Model
var Widget = Backbone.Model.extend({
	defaults: {
		title: "Résultats des Editions Legislatives",
		logoUrl: getUrl("images/icon-19.png"),
		hidden: true,
    sort: "revelance",
    filter: "none"
	}
});
// Person Model
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

// A List of People
var ResultsCollection = Backbone.Collection.extend({
	model: Result,
  strategies: {
      date: function (res) { return -res.get("date").getTime(); },
      revelance: function (res) { return -res.get("revelance"); },
  },
  sortByDate: function () {
      this.comparator = this.strategies["date"];
      this.sort();
  },
  sortByRevelance: function () {
      this.comparator = this.strategies["revelance"];
      this.sort();
  },
  initialize: function () {
      this.sortByRevelance();
  },
  filterBySerie: function(serie){
    if (serie == "none")
      return this;
    return _(this.filter(function(item) {
        return item.get("serie").toLowerCase().indexOf(serie) != -1;
    }));
  }
});

// The View for a Person
var ResultView = Backbone.View.extend({
	tagName: 'result',
	template: function(){
		return _.template($('#resultTemplate').html() )
	},

	render: function() {
		this.$el.append( this.template()(this.model.toJSON()) );
		return this;
	}
});
// View for all people
var WidgetView = Backbone.View.extend({
	tagName: 'div',
	className: 'dalloz-search',
	template: function(){
		return _.template($('#widgetTemplate').html() )
	},
  initialize: function() {
  },
  events: {
    "click .collapse-btn":     "toggleOpen",
    "click .sort-date":        "sortByDate",
    "click .sort-revelance":   "sortByRevelance",
    "click .filter>span":      "filterBycategory"
  },
  toggleOpen: function(){
    this.model.attributes.hidden = !this.model.attributes.hidden;
    this.render();
  },
  sortByDate: function(){
    this.collection.sortByDate();
    this.model.attributes.sort = 'date';
    this.render();
  },
  sortByRevelance: function(){
    this.collection.sortByRevelance();
    this.model.attributes.sort = 'revelance';
    this.render();
  },
  filterBycategory: function(ev){
    var attr = $(ev.currentTarget).data('filter');
    this.model.attributes.filter = attr;
    this.render();
  },
	render: function() {
    this.$el.find(".widget-container").remove();
    this.$el.append( this.template()(this.model.toJSON()) );

		this.collection.filterBySerie(this.model.attributes.filter).each(function(item) {
			var result = new ResultView({ model: item });
			this.$el.find(".results").append(result.render().el);
		}, this);

		return this;
	}
});



var resultsCollection = new ResultsCollection([]);

var widgetView = new WidgetView({ collection: resultsCollection, model: new Widget() });

var getRandomNumber = function(min, max){
    return Math.floor(Math.random() * max) + min;
}
var getResults = function(term, callback){
	$.ajax({
			url: "http://abonnes.efl.fr/EFL2/app/connect/searchResults?searchTerms="+term+"&CONNECT=9e819f0d668d7b3288a83c54f2fca803&matiere"/*getUrl("mock/page.html?q="+term)*/,
			method: 'GET'
	}).success(function( data ) {
			var noNewLine = data.replace(/\r?\n|\r/g, '');
			var noDoctype = /<body>(.*)<\/body>/.exec(noNewLine);
			var body = document.createElement( 'div' );
			body.innerHTML = noDoctype[1];
			var results = body.querySelectorAll(".resultItem");
			var ret = [];
			for (var i = 0; i < results.length; i++){
				var result = results[i];
				var parsedMetaData = /(.+)\s-\s(.+)\s\((.+)\)\s-\s([0-9]+)\/([0-9]+)\/([0-9]+)/.exec(result.querySelector(".bookTitle").innerHTML);
				var key = result.querySelector(".openDocumentLink").attributes["key"].value;
        parsedMetaData[6] = getRandomNumber(00, 15);//pour les besoins du test on génére une date; TODELETE
        parsedMetaData[5] = getRandomNumber(1, 12);//pour les besoins du test on génére une date; TODELETE
        parsedMetaData[4] = getRandomNumber(1, 30);//pour les besoins du test on génére une date; TODELETE
				var item = new Result({
					title: result.querySelector(".openDocumentLink").innerHTML,
					brief: result.querySelector(".brief").innerHTML,
					source:  parsedMetaData[1],
					serie:  parsedMetaData[2],
					category:  parsedMetaData[3],
          revelance: i,//le serveur nous retourne les résultats par ordre de pertinence donc la pertinence est croissante => i
					url: "http://abonnes.efl.fr/EFL2/app/connect/documentView?documentCode="+key+"&CONNECT=9e819f0d668d7b3288a83c54f2fca803",
					date:  new Date(parsedMetaData[6], parsedMetaData[5], parsedMetaData[4]),
					fdate: parsedMetaData[4] + "-" +parsedMetaData[5]+ "-"+parsedMetaData[6]
				})
				ret.push(item);

			}
      callback && callback(ret);
	}).fail(function (response) {
		console.error(response);
	});
}


$(function() {
  $("#rhs").prepend($("<div class='dalloz-search'>").load(getUrl("views/widget.html"), function(){
		getResults("tva", function(results){
			resultsCollection.add(results);
			$("#rhs").append(widgetView.render().el);
		})

	}));


});
