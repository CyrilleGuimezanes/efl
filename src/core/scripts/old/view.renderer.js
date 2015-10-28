window.PrerenderedView = Backbone.View.extend({
  render: function() {
    this.$el.load(this.options.ajax_template_path, _.bind(this.onRender, this));
    return this;
  },
  onRender: function() {
    //getResult;
  }
});
$(function() {
  new window.PrerenderedView({
    el: $('#ph'),
    model: new Backbone.Model({some_value: 'It was'}),
    ajax_template_path: 'frag.html'
  }).render();
});
