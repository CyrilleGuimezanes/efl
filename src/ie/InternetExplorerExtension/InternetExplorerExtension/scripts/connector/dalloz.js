window.connectors = window.connectors || {};

/**
 * Connector for elderecho
 * @return {Promise} Jquery Promise for Parser
 */
window.connectors["elderecho"] = function(url, credential, callback){
  return $.ajax({
    url: url,
    dataType: "xml",
    success: function(data){
      try{
        credential.jsessionid = data.getElementsByTagName("IdSesion")[0].childNodes[0].nodeValue;
      }
      catch(e){

      }

    }
  });
}
