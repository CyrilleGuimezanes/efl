// View for all people
var WidgetView = Backbone.View.extend({
	tagName: 'div',
	className: 'main-widget',
	loading: function(){

			$(".widget-container .content > *").hide();
			$(".widget-container .filters-parent").hide();
			$(".widget-container .loader").show();


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
		var provider = getProvider();
		var encode = provider.params.encodeFunction || function(x){return x};
		var credential = this.model.get("credential");
		credential.login = $("#ident").val();
		credential.password = encode($("#password").val());
		this.model.set("credential", credential);

		this.getResults();
	},

	filterView: function(ev){
		var el = $(ev.currentTarget);
		this.model.set("filterBy", el);

		this.getResults({filter: true});
	},
	filterReset: function(){
		$(".filter-name").hide();
		$('.filter-name[data-parent="none"]').show();
		this.model.set("filterBy", null);
		this.getResults();
	},
	toggleOpen: function(ev){
		var value = parseInt($(ev.currentTarget).data('compress'));

		this.model.set("compress", value);
		this.render();
		if (value == 0){
			$(".filters-parent").hide();
		}
		else {
			$(".filters-parent").show();
		}
	},
	sortByDate: function(){
		this.model.get("results").sortByDate();
		this.model.set("sortBy", "date");
		this.render();
	},
	sortByRevelance: function(){
		this.model.get("results").sortByRevelance();
		this.model.set("sortBy", "revelance");
		this.render();
	},
	setError: function(error){
		var errors = this.model.get("error");
		errors.logged = error == "LOGGIN_FAILED";
		errors.no_result = error == "NO_RESULT";
		errors.request_failed = error == "REQUEST_FAILLED"
		this.model.set("error", errors);
	},
	getResults: function(params){

		this.loading();

		var _this = this;
		var term = "";
		for (var i = 0; i < engine.field.length; i++){
			var eng = $(engine.field[i]);
			if(eng.length && eng.val().length){
				term = eng.val();
				break;
			}

		}

		var provider = getProvider();
		var connector = getConnector();
		var credential = this.model.get("credential");
		var parser = getParser();
		var isConnected = this.model.get("connected");

		if (!provider.params.secured)//si non sécurisé, nous sommes connecté
			isConnected = true;


		var url = provider.urls.result;
		var filterResult = false;

		var prepareUrl = function(url){
			var credential = _this.model.get("credential");
			var filter = _this.model.get("filterBy");

			for (var cred in credential){
				url = url.replace("{{"+cred+"}}", credential[cred]);
			}
			url = url.replace("{{term}}", term);
			if (filter)
				url = url.replace("{{filter}}", filter.attr("id") || "");
			return url;
		}


		this.model.set("fullResultUrl", prepareUrl(url));
		if(params && params.filter){
			//var url = ;//getUrl("mock/filter.html")
			url = provider.urls.filter;
			filterResult = true;
		}
			//baseUrl = ";//getUrl("mock/page.html?q="+term)

		jQuery.support.cors = true;
		var _getResults = function(url, filterResult){
			try{
				_this.setError(null);
				var params = {
					url: prepareUrl(url),
					crossDomain: true,
					type: "GET",
					dataType: "text"
				}
				if(filterResult)
					params = _.extend(params, provider.params.filter);
				else
					params = _.extend(params, provider.params.result);

				if (params.data){
					for (var i in params.data)
						if(typeof params.data[i] == "string")
							params.data[i] = prepareUrl(params.data[i]);
					params.data = JSON.stringify(params.data);
				}


				$.ajax(params)
				.success(function(data){
					var follow = provider.params.follow302 || true;
					//if header Location == follow call _getResults with follow Location

					var ret = null;
					try{
						ret = parser(data);
					}
					catch(e){
						console.error("An error occured during parsing. Please check that "+provider.parser +" parser is defined an have no error");
						throw "Parsing failed!";
					}
					try{
						filtersCollection.reset(ret.filters);
					}
					catch(e){
						console.error("An error occured during filters setting.");
						throw "Parsing failed!";
					}


					var credential = _this.model.get("credential");
					_this.model.set("credential", $.extend(credential, ret.credential || {}));
					if (ret && ret.results && !ret.results.length)
						_this.setError("NO_RESULT");
					resultsCollection.reset(ret.results);
					_this.render();
				}).fail(function (response) {
					_this.setError("REQUEST_FAILLED");
					_this.render();
				})
			}
			catch(e){
				_this.setError("REQUEST_FAILLED");
				_this.render();
				console.error(e);
			}
		}




		if (isConnected){
			_getResults(url, filterResult);
		}
		else{

			try{
				if (!credential.login)
					throw "Connect Failed";

				connector(prepareUrl(provider.urls.connect), _this.model.get("credential"))
					.success(function(){
						_this.model.set("connected", true);
						_getResults(url, filterResult)
					})
					.fail(function(){
						throw "Failed to connect"}
					);
			}
			catch(e){
				console.error(e);
				_this.setError("LOGGIN_FAILED");
				_this.render();
			}
		}



	},
	scroll: null,
	render: function() {
		this.$el.find(".widget-container").remove();
		this.$el.append( this.template()(this.model.toJSON()) );
		var html = "<ul>";
		this.model.get("filters").each(function(item) {
			var filter = new FilterView({ model: item });
			html += filter.render()
		}, this);
		html += "</ul>"
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
				/*_this.scroll = new IScroll(el[0],{
					mouseWheel: true,
					scrollbars: true
				});
*/
				var lock = false;
				var pos = 0;
				var totalWidth = $(".widget-container").innerWidth() - 10;
				var filters = $(".filter-name[data-parent='none']");
				$(".filters-container").width(totalWidth / 10 * 8);
				$(".filters-wrapper").hover(function(){
					$(".filters-container").height(300);
				},function(){
					$(".filters-container").height(40);
				});
				$(".left-btn").width(totalWidth/10).mousedown(function(){
					if (lock)
						return;
					var container = $(".filters > ul");
					if (pos < 0){
						lock = true;
						pos+= 100;
						container.animate({left: pos}, function(){
							lock = false;
						});
					}

				});
				$(".right-btn").width(totalWidth/10).mousedown(function(){
					if (lock || filters.length < 5)
						return;
					var container = $(".filters > ul");
					var el = $("[data-parent=none]").last();
					var max = -Math.abs(el.offset().left - el.width()) - 200;
					if(pos > max){
						lock = true;
						pos-= 100;
						container.animate({left: pos}, function(){
							lock = false;
						});
					}

				});
				//_this.scroll.refresh();
			}

		}, 200)


		return this;
	}
});
