window.connectors = window.connectors || {};
/**
 * Connector for elderecho
 * @return {Promise} Jquery Promise for Parser
 */
window.connectors["intabonnes"] = function(url, credential, callback){
  return $.ajax({
    url: url,
    dataType: "text",
    crossDomain: true,
    success: function(data){
      alert("OK");

    },
    fail: function(){
      console.log(arguments[2].getAllResponseHeaders())
    }
  });
}
