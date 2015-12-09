var getUrl = function(url){
  return self.options.baseUrl + url;
}

var getImage = function(uri, ext){
    return getUrl("")+ "images/"+uri+ "."+ (ext || "png");
}
