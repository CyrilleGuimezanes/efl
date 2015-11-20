var config = {
	BASE_URL: "http://int.abonnes.efl.fr"
}
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
var engine = null;
