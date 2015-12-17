window.parsers = window.parsers || {};
/**
* Parse data received for services
* @param  {Text} data HTML/JSON
* @return {Array}      List of parsed elements
*/
window.parsers["dalloz"] = function(params, params){
  var defer = new Promise();
  $.ajax(params)
  .success(function(data){

    var provider = getProvider();
    var noNewLine = data.replace(/\r?\n|\r/g, '');
    var noDoctype = /<body.*?>(.*)<\/body>/.exec(noNewLine) || noNewLine;
    var body = document.createElement( 'div' );
    body.innerHTML = typeof noDoctype == "object"? noDoctype[1] : noDoctype;


    var filters = body.querySelectorAll(".items > li") || [];
    var createFilter = function(list){
      if (!list.length)
      return [];
      var ret = [];
      for (var i = 0; i < list.length; i++){
        var text = list[i].querySelector("a").innerHTML.trim();
        var parts = /(.*)\(([0-9]+)\)/.exec(text);
        var subFilters = list[i].querySelectorAll("li") || [];

        var item = new Filter({
          id: list[i].id.trim(),
          name: parts[1].trim(),
          nb: parseInt(parts[2].trim()),
          subs : createFilter(subFilters)
        });


        ret.push(item);
      }
      return ret;
    }


    var results = body.querySelectorAll(".result");
    if(!resuts.length){
        defer.resolve({
          results: [],
          credential: {},
          filters: []
        });
        return;
    }
    var ret = [];
    for (var i = 0; i < results.length; i++){
      var result = results[i];

      var titleNode = result.querySelector(".titre") || result.querySelector("#titre") || result.querySelector(".titre-ur");
      var descNode = result.querySelector("#context");
      var sourceNode = result.querySelector(".source");
      var dateNode = result.querySelector(".source-date");
      var idents = /javascript:connectPlugin\.openConnectTab\('(.*)','(.*)'\);/.exec(titleNode.firstChild.href);
      /*var skey = result.querySelector(".openDocumentLink");
      var key = skey && skey.attributes["key"]? skey.attributes["key"].value : "";
      var id = skey && skey.attributes["id"]? skey.attributes["id"].value : "";*/
      var parsedDate = /([0-9]+)\s([a-zA-Z]+)\s([0-9]+)/.exec(dateNode? dateNode.innerHTML : "");
      var month = {
        janvier: 1,
        fevrier: 2,
        mars: 3,
        avril: 4,
        mai: 5,
        juin: 6,
        juillet: 7,
        aout: 8,
        septembre: 9,
        octobre: 10,
        novembre: 11,
        decembre: 12,
      }
      var item = new Result({
        title: titleNode? titleNode.firstChild.innerHTML : "",
        brief: descNode? descNode.innerHTML: "",
        source:  sourceNode ? sourceNode.innerHTML : "",
        serie:  "",
        category:   "",
        revelance: results.length - i,//le serveur nous retourne les résultats par ordre de pertinence donc la pertinence est croissante => i
        url: "http://test.validation.dalloz-avocats.fr/documentation/Document?id="+idents[1]+"&ctxt="+idents[2]+"&contextId=&CONNECT=689e43fc44ad245f9bdc76ec29e140a1&pwt=connect",//provider.urls.base + "EFL2/app/connect/documentView?documentCode="+key+"&refId="+id+"&contextId="+contextId+"&CONNECT=d6e4b64f7b2e949ab35fc46e4063f89d",
        date:  parsedDate && parsedDate.length? new Date(parsedDate[3], month[parsedDate[2]], parsedDate[1]) : null,
        fdate: dateNode? dateNode.innerHTML : ""
      })
      ret.push(item);

    }
    defer.resolve({
      results: ret,
      credential: {},
      filters: createFilter(filters)
    });

  }).fail(defer.reject)

  return defer;
}
