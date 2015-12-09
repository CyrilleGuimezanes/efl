var getUrl = function(uri){
  uri = uri || "";
  return chrome.extension.getURL(uri);
}
var getImage = function(uri, ext){
    return getUrl("")+ "images/"+uri+ "."+ (ext || "png");
}
