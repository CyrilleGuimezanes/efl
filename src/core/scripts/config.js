var _provider = "int.abonnes";
var availableEngines = {
	google: {
		field: ["#lst-ib","#q"],
		results: "#center_col",
		tag: "div"
	},
	bing: {
		field: ["#sb_form_q"],
		results: "#b_results",
		tag: "li"
	},
	yahoo: {
		field: ["#yschsp"],
		results: "#left",
		tag: "div"
	}
}

var availableProvider = {
	"elderecho": {
		parser: "elderecho",
		connector: "elderecho",
		urls: {
			result: "http://online.elderecho.com/ipad/office/resultados.action?jsessionid=E19C03E846E443096C4BDE47AB92C7DF.TC_ONLINE03&criteriosBusqueda.fulltext={{term}}&origen=office&seccion=buscador",
			connect: "http://online.elderecho.com/ipad/ac/login.action?user=ac&pwd=ac2013",
			filter: ""
		},
		params: {
			secured: true,
			dataType: "text"
		}
	},
	"dalloz": {
		parser: "dalloz",
		connector: "dalloz",
		urls: {
			result: "",
			connect: "",
			filter: ""
		},
		params: {
			secured: true,
			dataType: "xml"
		}
	},
	"int.abonnes": {
		parser: "intabonnes",
		connector: "intabonnes",
		urls: {
			base: "http://int.abonnes.efl.fr/",
			result:  "http://int.abonnes.efl.fr/EFL2/app/connect/searchResults?searchTerms={{term}}&CONNECT=9e819f0d668d7b3288a83c54f2fca803",
			connect: "http://int.abonnes.efl.fr/EFLPublicGoodies/bypass.do?testIP=noIP&username={{login}}&password={{password}}&service="+encodeURIComponent("http://int.abonnes.efl.fr/"),
			filter: "http://int.abonnes.efl.fr/EFL2/app/connect/refine?checked={{filter}}&contextId={{contextId}}"
		},
		params: {
			secured: false,
			dataType: "text",
			encodeFunction: window.sha256
		}
	},
	"abonnes": {
		parser: "abonnes",
		connector: "abonnes",
		urls: {
			base: "http://abonnes.efl.fr/",
			result:  "http://abonnes.efl.fr/EFL2/app/connect/searchResults?searchTerms={{term}}&CONNECT=9e819f0d668d7b3288a83c54f2fca803",
			connect: "http://abonnes.efl.fr/EFLPublicGoodies/bypass.do?testIP=noIP&username={{login}}&password={{password}}&service="+encodeURIComponent("http://int.abonnes.efl.fr/"),
			filter: "http://abonnes.efl.fr/EFL2/app/connect/refine?checked={{filter}}&contextId={{contextId}}"
		},
		params: {
			secured: true,
			dataType: "text",
			encodeFunction: window.sha256
		}
	},
	"mock": {

	}

}

//////////////////////////////////////////// INTERNAL /////////////////////////////

var getProvider = function(){
	return availableProvider[_provider];
}
var getConnector = function(){
	return connectors[availableProvider[_provider].connector];
}
var getParser = function(){
	return parsers[availableProvider[_provider].parser];
}
function extractDomain(url) {
    var _domain;
    //find & remove protocol (http, ftp, etc.) and get domain
    if (url.indexOf("://") > -1) {
        _domain = url.split('/')[2];
    }
    else {
        _domain = url.split('/')[0];
    }

    //find & remove port number
    _domain = _domain.split(':')[0];

    return _domain;
}
var engine = null;
var domain = null;
var lng = "fr";
var defineEnv = function(url){
	domain = extractDomain(url);
	console.log("ELS: host"+ domain);
							//fr ou www   word 'search' on yahoo   domain   TLD
	var purl = /([a-zA-Z]+)\.(?:search)?\.?([a-zA-Z]+)\.([a-zA-Z\.]+)/.exec(domain);
	if (purl){
		console.log("ELS: matched url:"+ purl);
		engine = availableEngines[purl[2]];
		lng = purl[1] != "www"? purl[1] : purl[3];
	}
}
