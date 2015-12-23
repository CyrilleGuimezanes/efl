/**
 * Selected provider
 * @type {String}
 */
var _provider = "elderecho";
/**
 * Proxy URL
 * @type {String}
 */
var proxyUrl = "http://els.local.com?service="
/**
 * List of available search engine
 * @type {Object}
 */
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
/**
 * Providers config
 * @type {Object}
 */
var availableProvider = {
	//test provider (no mixed content, no authentification, JSON as result)
	"github": {
		title: "Test GitHub",
		logo: getImage("icon-38"),
		className: "github",
		parser: "elderecho",
		connector: "elderecho",
		urls: {
			base: "https://api.github.com/",
			result: "https://api.github.com/repositories?since=364",
			connect: "https://api.github.com/repositories?since=364",
			filter: "https://api.github.com/repositories?since=364"
		},
		params: {

			secured: true,
			//noForm: true,
			result:{
				dataType: "text"
			},
			filter:{
				dataType: "text"
			}

		}
	},
	//Results from ElDerecho
	"elderecho": {
		title: "Editions ElDerecho",
		logo: getImage("icon-38"),
		className: "elderecho",
		parser: "elderecho",
		connector: "elderecho",
		urls: {
			base: "http://online.elderecho.com/",
			result: "http://online.elderecho.com/ipad/office/resultados.action?jsessionid={{jsessionid}}&criteriosBusqueda.fulltext={{term}}&origen=office&seccion=buscador",
			connect: "http://online.elderecho.com/ipad/office/login.action?user={{login}}&pwd={{password}}",
			filter: "http://online.elderecho.com/ipad/office/resultadosOtroTipo.action?tokenConsulta=1&indices={{filter}}&profundidadAcotacion=&jsessionid={{jsessionid}}"
		},
		params: {
			secured: true,
			//noForm: true,
			result:{
				dataType: "text"
			},
			filter:{
				dataType: "text"
			}

		}
	},
	//Results from Dalloz Editions
	"dalloz": {
		title: "Editions Dalloz",
		logo: getImage("icon-38"),
		className: "dalloz",
		parser: "dalloz",
		connector: "dalloz",
		urls: {
			base: "http://test.validation.dalloz-avocats.fr/GA/Login",
			result: "http://test.validation.dalloz-avocats.fr/documentation/Connect/searchResults?searchTerms={{term}}&CONNECT=689e43fc44ad245f9bdc76ec29e140a1&thematique=",
			connect: "",
			filter: "http://test.validation.dalloz-avocats.fr/documentation/ListeHandler.svc/GetResultListGlobal?zapette-refinement-action=add&zapette-refinement-value={{filter}}&ctxt=0_YSR0MT1zb2NpYWzCp3gkc2Y9cGFnZS1yZWNoZXJjaGU=&pwt=connect"
		},
		params: {
			proxy: true,
			secured: false,
			result:{
				dataType: "text"
			},
			filter:{
				type: "POST",
				dataType: "text",
				contentType: "application/json; charset=UTF-8",
				data:{
					"ctxt":"0_YSR0MT1zb2NpYWzCp3gkc2Y9cGFnZS1yZWNoZXJjaGU=",
					"ctxt1": {SortByDate: "false", PageNum: "1", PageSize: "10", OnlyResultsInSubscription: "true", Paging: true,SortByDate: "false", Tab: "DZ/DZFR"},
					"zapette": "{{filter}}"
				}
			}
		}
	},
	//Integration plaform of abonnes.efl.fr
	"intabonnes": {
		title: "Editions Lefebvre Sarrut",
		logo: getImage("icon-38"),
		className: "els",
		parser: "intabonnes",
		connector: "intabonnes",
		urls: {
			base: "http://int.abonnes.efl.fr/",
			result:  "http://int.abonnes.efl.fr/EFL2/app/connect/searchResults?searchTerms={{term}}&CONNECT=9e819f0d668d7b3288a83c54f2fca803",
			connect: "http://int.abonnes.efl.fr/EFLPublicGoodies/bypass.do?testIP=noIP&username={{login}}&password={{password}}&service="+encodeURIComponent("http://int.abonnes.efl.fr/"),
			filter: "http://int.abonnes.efl.fr/EFL2/app/connect/refine?checked={{filter}}&contextId={{contextId}}"
		},
		params: {
			secured: true,
			encodeFunction: window.sha256
		}
	},
	//abonnes.efl.fr
	"abonnes": {
		title: "Editions Lefebvre Sarrut",
		logo: getImage("icon-38"),
		className: "els",
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
			encodeFunction: window.sha256
		}
	}

}

//////////////////////////////////////////// INTERNAL /////////////////////////////
/**
 * Get current selected provider
 * @return {Object} provider options
 */
var getProvider = function(){
	return availableProvider[_provider];
}
/**
 * Get selected connector function
 * @return {Function} function to connect User
 */
var getConnector = function(){
	return connectors[availableProvider[_provider].connector];
}
/**
 * Get selected parser Function
 * @return {Function} Function to parse results
 */
var getParser = function(){
	return parsers[availableProvider[_provider].parser];
}
/**
 * Function to extract domain form any URL.
 * @param  {String} url URL to anaylyse
 * @return {String}     Extracted domain
 */
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
/**
 * Current selected engine
 * @type {String}
 */
var engine = null;
/**
 * Current domain
 * @type {String}
 */
var domain = null;
/**
 * Current language (not used )
 * @type {String}
 */
var lng = "fr";
/**
 * Extact domain and define selected search engine.
 * @param  {String} url Page URL
 */
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
