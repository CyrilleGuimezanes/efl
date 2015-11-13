var engines = {
	google: {
		field: "#lst-ib",
		results: "#center_col",
		tag: "div"
	},
	bing: {
		field: "#sb_form_q",
		results: "#b_results",
		tag: "li"
	},
	yahoo: {
		field: "#yschsp",
		results: "#left",
		tag: "div"
	}
}

// Person Model
var Widget = Backbone.Model.extend({
	defaults: {
		title: "Editions Lefebvre Sarrut",
		logoUrl: getUrl("images/icon-38.png"),
		loaderUrl: getUrl("images/loader.gif"),
		compress: 1,//0 = fermé, 1=semi ouvert, 2=ouvert + desc
		sort: "revelance",
		error: {
			logged: false,
			https: false
		},
		results: null,
		filters: null,
		filterBy: null
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

// The View for a Person
var FilterView = Backbone.View.extend({
	className: 'filter-item',
	template: function(){
		return _.template($('#filterTemplate').html() )
	},
	render: function(parent) {
		var slug = function(name){
			return name
        .toLowerCase()
        .replace(/[^\w ]+/g,'')
        .replace(/ +/g,'-')
        ;
		}
		var el = $(this.template()({
			item: this.model.toJSON(),
			attr: slug(this.model.get("name")),
			parent: "none",
			fid: this.model.get("id")
		}));
		var subs = this.model.get("subs");
		var html = "";
		for (var i = 0; i < subs.length; i++)
			html += this.template()({
				item: subs[i].toJSON(),
				attr: slug(subs[i].get("name")),
				fid: subs[i].get("id"),
				parent: slug(this.model.get("name"))
			})
		el.append(html);
		return el.html();
	}
});
// The View for a Person
var ResultView = Backbone.View.extend({
	className: 'result-item',
	template: function(){
		return _.template($('#resultTemplate').html() )
	},

	render: function(parent) {
		return this.template()({
			item: this.model.toJSON(),
			parent: parent
		});
	}
});
// View for all people
var WidgetView = Backbone.View.extend({
	tagName: 'div',
	className: 'main-widget',
	loading: false,
	toggleLoading: function(){
		if (!this.loading){
			$(".results").hide();
			$(".loader").show();
		}
		else{
			$(".results").show();
			$(".loader").hide();
		}
		this.loading = !this.loading;

	},
	template: function(){
		return _.template($('#widgetTemplate').html() )
	},
	initialize: function() {
	},
	events: {
		"click .collapse-btn":     "toggleOpen",
		"click .sort-date":        "sortByDate",
		"click .sort-revelance":   "sortByRevelance",
		"click .send-connect":     "connect",
		"click .filter-name":     "filterView",
		"click .filter-reset":     "filterReset"
	},
	connect: function(){
		var ident = $("#ident").val();
		var password = $("#password").val();

		var url = "http://abonnestest.efl.fr/EFLPublicGoodies/bypass.do?username="+ident+"&password="+sha256(password)+"&service=<SERVICE>&origin=googleSearch"
		this.getResults({login: url});
	},

	filterView: function(ev){
		var el = $(ev.currentTarget);
		var url = "http://abonnes.efl.fr/EFL2/app/connect/refine?checked="+el.attr("id")+"&contextId=3105527"//getUrl("mock/filter.html")
		this.model.set("filterBy", el);
		this.getResults({filter: url});
	},
	filterReset: function(){
		$(".filter-name").hide();
		$('.filter-name[data-parent="none"]').show();
		this.model.set("filterBy", null);
		this.getResults();
	},
	toggleOpen: function(ev){
		var value = $(ev.currentTarget).data('compress');
		this.model.set("compress", parseInt(value));
		this.render();
	},
	sortByDate: function(){
		this.model.get("results").sortByDate();
		this.model.get("results").sort = 'date';
		this.render();
	},
	sortByRevelance: function(){
		this.model.get("results").sortByRevelance();
		this.model.get("results").sort = 'revelance';
		this.render();
	},

	getResults: function(urls){
		this.toggleLoading();
		var _this = this;
		var term = $("#lst-ib").val();
		var url = "http://int.abonnes.efl.fr/EFL2/app/connect/searchResults?searchTerms="+term+"&CONNECT=9e819f0d668d7b3288a83c54f2fca803&matiere";//getUrl("mock/page.html?q="+term)
		if(urls){
			if(urls.login){
				url = urls.login.replace("<SERVICE>", encodeURIComponent(url));
			}
			else if(urls.filter){
				url = urls.filter;
			}
		}


		$.ajax({
			url: url,
			method: 'GET'
		}).success(function( data ) {
			var noNewLine = data.replace(/\r?\n|\r/g, '');
			var noDoctype = /<body.*?>(.*)<\/body>/.exec(noNewLine);
			var body = document.createElement( 'div' );
			body.innerHTML = noDoctype[1];
			var results = body.querySelectorAll(".resultItem");

			if (!results.length){
				_this.model.attributes.error.logged = true;
			}
			else{
				var filters = body.querySelectorAll(".connectFacet") || [];
				var createFilter = function(list){
					if (!list.length)
						return [];
					var ret = [];
					for (var i = 0; i < list.length; i++){
						var parts = /(.*)\(([0-9]+)\)/.exec(list[i].firstChild.innerText);
						var subFilters = list[i].querySelectorAll(".connectSubFacet") || [];

						var item = new Filter({
							id: list[i].id,
							name: parts[1].trim(),
							nb: parseInt(parts[2].trim()),
							subs : createFilter(subFilters)
						});


						ret.push(item);
					}
					return ret;
				}

				var parseDate = function(input){
					var res = /([0-9]+)?\/?([0-9]+)?\/?([0-9]+)/.exec(input.trim());
					if (res && res[1])
						return {day: parseInt(res[1]), month: parseInt(res[2]), year: parseInt(res[3])};
					return null;
				}
				var parseSerie = function(input){
					var res = /([a-zA-Z\s0-9\u00C0-\u017F]+)\s\(([a-zA-Z\s0-9\u00C0-\u017F\s]+)\)/.exec(input.trim());
					if (res && res[1] && res[2])
						return {serie: res[1], category: res[2]};
					return null;
				}
				var parseSource = function(input){
					var res = /([a-zA-Z\s0-9\u00C0-\u017F]+)/.exec(input.trim());
					if (res[1] != null)
						return {source: res[1]};
					return null;
				}
				if(!urls || !urls.filter){//si on est en train de filtrer, on garde nos filtre existants
					var ffilters = createFilter(filters);
					filtersCollection.reset(ffilters);
				}


				var ret = [];
				for (var i = 0; i < results.length; i++){
					var result = results[i];
					var parsedMetaData = {};
					if (result.querySelector(".bookTitle")){
						var metadatas = result.querySelector(".bookTitle").innerHTML.split("-");
						for (var y = 0; y < metadatas.length; y++)
						{
							var metadata = metadatas[y];
							var d =  parseSerie(metadata) || parseDate(metadata) || parseSource(metadata);
							if (d)
								$.extend(parsedMetaData, d);
						}
					}
					//JUST FOR DEBUG SORTS
					parsedMetaData.day = Math.abs(parsedMetaData.day - (i * i));

					var skey = result.querySelector(".openDocumentLink");
					var key = skey && skey.attributes["key"]? skey.attributes["key"].value : "";
					var id = skey && skey.attributes["id"]? skey.attributes["id"].value : "";
					var item = new Result({
						title: result.querySelector(".openDocumentLink")? result.querySelector(".openDocumentLink").innerHTML : "",
						brief: result.querySelector(".brief")? result.querySelector(".brief").innerHTML: "",
						source:  parsedMetaData.source || "",
						serie:  parsedMetaData.serie || "",
						category:  parsedMetaData.category || "",
						revelance: results.length - i,//le serveur nous retourne les résultats par ordre de pertinence donc la pertinence est croissante => i
						url: "http://abonnes.efl.fr/EFL2/app/connect/documentView?documentCode="+key+"&refId="+id+"&contextId=1&CONNECT=d6e4b64f7b2e949ab35fc46e4063f89d",
						date:  parsedMetaData && parsedMetaData.day? new Date(parsedMetaData.year, parsedMetaData.month, parsedMetaData.day) : null,
						fdate: parsedMetaData && parsedMetaData.day?  parsedMetaData.day + "-" +parsedMetaData.month+ "-"+parsedMetaData.year: ""
					})
					ret.push(item);

				}
				resultsCollection.reset(ret);
			}
			//setTimeout(function(){
				_this.render();
				_this.toggleLoading();
			//}, 3000)

		}).fail(function (response) {
			_this.model.get("error").logged = true;
			_this.render();
			_this.toggleLoading();
		})
	},
	scroll: null,
	render: function() {
		this.$el.find(".widget-container").remove();
		this.$el.append( this.template()(this.model.toJSON()) );
		var html = "";
		this.model.get("filters").each(function(item) {
			var filter = new FilterView({ model: item });
			html += filter.render()
		}, this);
		this.$el.find(".filters").html(html);
		html = "";
		this.model.get("results").each(function(item) {
			var result = new ResultView({ model: item });
			html += result.render(this.model.toJSON());
		}, this);

		this.$el.find(".results").html(html);

		var _this = this;
		document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
		setTimeout(function(){
			var el = _this.$el.find("#wrapper");
			if (el.length){
				_this.scroll = new IScroll(el[0],{
					mouseWheel: true,
					scrollbars: true
				});
				_this.scroll.refresh();
			}

		}, 200)

		/////////////////////////////// SHOW/HIDE FILTERS ////////////////////////////////////////
		if (this.model.get("filterBy") != null){
			var el = this.model.get("filterBy");
			var children = $('.filter-name[data-parent="'+el.data("name")+'"]');

			$(".filter-name").not("#"+el.attr("id")).hide();

			if (children.length){//si on a encore des niveau de filtres on les affiches
				children.show();
			}
			else {
				var parent = $('.filter-name[data-name="'+el.data("parent")+'"]').first();
				parent.show();
				$('.filter-name[data-parent="'+parent.data("name")+'"]').show();
			}
		}
		else {
			$('.filter-name[data-parent!="none"]').hide();
		}

		return this;
	}
});
var widgetModel = new Widget({
	results: resultsCollection,
	filters: filtersCollection
});
var widgetView = new WidgetView({model: widgetModel});



$(function() {
	/*var tmout = setTimeout(function(){
	widgetModel.attributes.error.https = true;
	/*$("#rhs") //col de droite
	$("#center_col").prepend(widgetView.render().el);
}, 10000)*/
var renderWidget = function(){
	widgetView.model.set("filterBy", null);
	widgetView.getResults();
}
$("body").prepend($("<div class='widget-templates'/>").load(getUrl("views/widget.html"), function(){
	try{
		            //fr ou www   word 'search' on yahoo   domain   TLD
		var purl = /([a-zA-Z]+)\.(?:search)?\.?([a-zA-Z]+)\.([a-zA-Z\.]+)/.exec(document.location.host);
		var engine = engines[purl[2]];
		var lng = purl[1] != "www"? purl[1] : purl[3];
		$(engine.results).prepend("<"+engine.tag+" class='connect-widget-inserter'/>")
		$(".connect-widget-inserter").html(widgetView.render().el);
		renderWidget();
		$(engine.field).change(renderWidget);
	}
	catch(e){
		console.error(e);
	}

}));

});
