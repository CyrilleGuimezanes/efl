window.connectors = window.connectors || {};
/**
 * Connector for elderecho
 * @return {Promise}  Promise for Parser
 */
window.connectors["intabonnes"] = function(url, credential, callback){
  var defer = new Promise();

  $.ajax({
    url: url,
    dataType: "text",
    crossDomain: true,
    success: function(data){
      defer.resolve();

    },
    fail: function(){
      defer.reject();
    }
  });

  return defer;
}
