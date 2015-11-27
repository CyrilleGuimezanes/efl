
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

$("body").prepend($("<div class='widget-templates'/>").load(getUrl("views/widget.html"), function(a, b,c,d){
	try{
		            //fr ou www   word 'search' on yahoo   domain   TLD
		var purl = /([a-zA-Z]+)\.(?:search)?\.?([a-zA-Z]+)\.([a-zA-Z\.]+)/.exec(document.location.host);
		if (purl){
			engine = engines[purl[2]];
			if(engine && $(engine.results).length){
				var lng = purl[1] != "www"? purl[1] : purl[3];
				$(engine.results).prepend("<"+engine.tag+" class='connect-widget-inserter'/>")
				$(".connect-widget-inserter").html(widgetView.render().el);
				renderWidget();
				$(engine.field).change(renderWidget);
			}

		}

	}
	catch(e){
		console.error(e);
	}

}));

});
