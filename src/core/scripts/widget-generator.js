
var widgetModel = new Widget({
	results: resultsCollection,
	filters: filtersCollection
});
var widgetView = null;


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
function waitForElement(elementPath, callBack){
  window.setTimeout(function(){
    if($(elementPath).length){
      callBack();
    }else{
      waitForElement(elementPath, callBack);
    }
  },200)
}
$("body").prepend($("<div class='widget-templates'/>").load(getUrl("views/widget.html"), function(a, b,c,d){
	try{
		defineEnv(document.location.host);
		if(engine){
			waitForElement(engine.results, function(){
				waitForElement(engine.field[0], function(){
					//debugger;
					console.log("ELS: engine choosen: "+ !!engine);

					$(engine.results).prepend("<"+engine.tag+" class='connect-widget-inserter'><div></div></div>");
					widgetView =  new WidgetView({model: widgetModel, el: $(".connect-widget-inserter > div")});
					widgetView.render()

					renderWidget();
					for (var i = 0; i < engine.field.length; i++)
						$(engine.field[i]).change(renderWidget);
				})

			});

		}

	}
	catch(e){
		console.error(e);
	}

}));

});
