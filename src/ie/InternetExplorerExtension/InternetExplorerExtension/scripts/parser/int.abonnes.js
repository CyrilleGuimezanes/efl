window.parsers = window.parsers || {};
/**
* Parse data received from service
* @param  {Object} params request params
* @param  {Object} credential current credential
* @return {Promise}      Promise resolve when request is finished
*/
window.parsers["intabonnes"] = function(params, credential){
  var defer = new Promise();
  $.ajax(params)
  .success(function(data){
    data = data.replace(/\r?\n|\r/g, '');
    var provider = getProvider();
    var target = /(?:.*)name="TARGET" value="(.*)"(?:.*)/.exec(data);
    var saml = /(?:.*)name="SAMLResponse" value="(.*?)"\/>(?:.*)/.exec(data);
    $.post(provider.urls.base + "Shibboleth.sso/SAML/POST",{
      "TARGET": target && target[1],
      "SAMLResponse": saml && saml[1],
      "providerId": "http://int.abonnes.efl.fr/EFL2/app/connect/searchResults?searchTerms=tva&CONNECT=9e819f0d668d7b3288a83c54f2fca803"
    })
    .success(function(data){

        var provider = getProvider();
        var noNewLine = data.replace(/\r?\n|\r/g, '');
        var noDoctype = /<body.*?>(.*)<\/body>/.exec(noNewLine) || noNewLine;
        var body = document.createElement( 'div' );
        body.innerHTML = typeof noDoctype == "object"? noDoctype[1] : noDoctype;
        var results = body.querySelectorAll(".resultItem");
        var contextIdBrut = /'contextid'\s?,\s?([0-9]+)/i.exec(noNewLine);
        var contextId = null;
        //on récupére le contextId dans le code de la page
        if(contextIdBrut && contextIdBrut.length)
        contextId = parseInt(contextIdBrut[1]);

        var createFilter = function(list){
          if (!list.length)
          return [];
          var ret = [];
          for (var i = 0; i < list.length; i++){
            var text = $(list[i].firstChild).text();
            var parts = /(.*)\(([0-9]+)\)/.exec(text);
            var subFilters = list[i].querySelectorAll(".connectSubFacet") || [];

            var item = new Filter({
              id: $(list[i]).attr("id"),
              name: parts[1].trim(),
              nb: parseInt(parts[2].trim()),
              subs : createFilter(subFilters)
            });


            ret.push(item);
          }
          return ret;
        }


        if (!results.length){
          defer.resolve({
            results: [],
            credential: {},
            filters: []
          });
          return;
        }
        else{
          var filters = body.querySelectorAll(".connectFacet") || [];

          var parseDate = function(input){
            var res = /([0-9]+)?\/?([0-9]+)?\/?([0-9]+)/.exec(input.trim());
            if (res && res[1])
            return {day: parseInt(res[1]), month: parseInt(res[2]), year: parseInt(res[3])};
            return null;
          }
          var parseSerie = function(input){
            var res = /([a-zA-Z\s0-9\u00C0-\u017F]+)\s\(([a-zA-Z\s0-9\u00C0-\u017F\s]+)\)/.exec(input.trim());
            if (res && res[1] && res[2])
            return {serie: res[1], category: res[2]};
            return null;
          }
          var parseSource = function(input){
            var res = /([a-zA-Z\s0-9\u00C0-\u017F]+)/.exec(input.trim());
            if (res[1] != null)
            return {source: res[1]};
            return null;
          }


          var ret = [];
          for (var i = 0; i < results.length; i++){
            var result = results[i];
            var parsedMetaData = {};
            if (result.querySelector(".bookTitle")){
              var metadatas = result.querySelector(".bookTitle").innerHTML.split("-");
              for (var y = 0; y < metadatas.length; y++)
              {
                var metadata = metadatas[y];
                var d =  parseSerie(metadata) || parseDate(metadata) || parseSource(metadata);
                if (d)
                $.extend(parsedMetaData, d);
              }
            }
            //JUST FOR DEBUG SORTS
            //parsedMetaData.day = Math.abs(parsedMetaData.day - (i * i));

            var skey = result.querySelector(".openDocumentLink");
            var key = skey && skey.attributes["key"]? skey.attributes["key"].value : "";
            var id = skey && skey.attributes["id"]? skey.attributes["id"].value : "";
            var item = new Result({
              title: result.querySelector(".openDocumentLink")? result.querySelector(".openDocumentLink").innerHTML : "",
              brief: result.querySelector(".brief")? result.querySelector(".brief").innerHTML: "",
              source:  parsedMetaData.source || "",
              serie:  parsedMetaData.serie || "",
              category:  parsedMetaData.category || "",
              revelance: results.length - i,//le serveur nous retourne les résultats par ordre de pertinence donc la pertinence est croissante => i
              url: provider.urls.base + "EFL2/app/connect/documentView?documentCode="+key+"&refId="+id+"&contextId="+contextId+"&CONNECT=d6e4b64f7b2e949ab35fc46e4063f89d",
              date:  parsedMetaData && parsedMetaData.day? new Date(parsedMetaData.year, parsedMetaData.month, parsedMetaData.day) : null,
              fdate: parsedMetaData && parsedMetaData.day?  parsedMetaData.day + "-" +parsedMetaData.month+ "-"+parsedMetaData.year: ""
            })
            ret.push(item);

          }
          defer.resolve({
            results: ret,
            credential: {},
            filters: createFilter(filters)
          });
        }
    });

  }).fail(function(){
    defer.reject();
  })

  return defer;

}
