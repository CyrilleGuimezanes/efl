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
		var html = this.template()({
			item: this.model.toJSON(),
			attr: slug(this.model.get("name")),
			parent: "none",
			fid: this.model.get("id")
		});
		var subs = this.model.get("subs");
		html += "<ul>";
		for (var i = 0; i < subs.length; i++)
			html +=  this.template()({
				item: subs[i].toJSON(),
				attr: slug(subs[i].get("name")),
				fid: subs[i].get("id"),
				parent: slug(this.model.get("name"))
			})
		html += "</li></ul>"

		return html;
	}
});
