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
