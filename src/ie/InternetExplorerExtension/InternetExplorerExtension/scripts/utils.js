var getUrl = function(uri){
  return "res://ELSConnect.dll/"+ uri;
}
var getImage = function(uri, ext){
    return "data:image/png;base64,"+ window.ELS.images[uri];
}
