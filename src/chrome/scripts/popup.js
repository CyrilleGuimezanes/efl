
$(function() {
  $.ajax({
    url: "../mock/matiere.json",
    dataType: "jsonp"
  }).success(function(data){
    if(data.length){
      $(".matieres").empty();
      for (var matiere in data){
        $(".matieres").append("<li class='matiere'>"+matiere.label+"</li>");
      }
    }

  }).fail(function(){
    //not connected
  });

});
