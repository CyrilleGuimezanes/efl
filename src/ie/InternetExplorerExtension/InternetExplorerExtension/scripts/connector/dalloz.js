window.connectors = window.connectors || {};

/**
 * Connector for elderecho
 * @return {Promise} Promise for Parser
 */
window.connectors["elderecho"] = function(url, credential){
  var defer = new Promise();

  $.ajax({
    url: url,
    dataType: "xml",
    success: function(data){
        credential.jsessionid = data.getElementsByTagName("IdSesion")[0].childNodes[0].nodeValue;
        defer.resolve();
    },
    fail: function(){
      defer.reject();
    }
  });

  return defer;
}
