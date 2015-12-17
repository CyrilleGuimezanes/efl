window.parsers = window.parsers || {};
/**
* Parse data received for services
* @param  {Text} data HTML/JSON
* @return {Array}      List of parsed elements
*/
window.parsers["elderecho"] = function(params, credential){
  var defer = new Promise();
  $.ajax(params)
  .success(function(data){

    var provider = getProvider();
    var noNewLine = data.replace(/\r?\n|\r/g, '');
    var noDoctype = /<body.*?>(.*)<\/body>/.exec(noNewLine) || noNewLine;
    var body = document.createElement( 'div' );
    body.innerHTML = typeof noDoctype == "object"? noDoctype[1] : noDoctype;


    var filters = body.querySelectorAll("#tabsResultados > a.tab") || [];
    var createFilter = function(list){
      if (!list.length)
      return [];
      var ret = [];
      for (var i = 0; i < list.length; i++){
        var text = list[i].innerHTML.trim();
        var parts = /(.*)\s\(([0-9]+)\)/.exec(text);
        var ident = /(?:.*)indices=([a-zA-Z0-9]+)&(?:.*)/.exec(list[i].href)
        var item = new Filter({
          id: ident[1].trim(),
          name: parts[1].trim(),
          nb: parseInt(parts[2].trim()),
          subs : []
        });


        ret.push(item);
      }
      return ret;
    }


    var results = body.querySelectorAll(".resultado");

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

      var title = result.querySelector(".documento").innerHTML.split("-") || [];
      var desc = title.pop();//on supprime et on retourne le dernier élément
      var title = title.join("-");//on réattache les éléments restants

      var sourceNode = result.querySelector(".termDestacado");
      var dateNode = null;
      var idents = /cargar(?:Memento|Documento)\('(.*)',\s'(.*)',\s'(.*)'\);\sreturn\sfalse;/.exec(result.querySelector(".documento").attributes.onclick.nodeValue);


      var item = new Result({
        title: title,
        brief: desc,
        source:  sourceNode ? sourceNode.innerHTML : "",
        serie:  "",
        category:   "",
        revelance: results.length - i,//le serveur nous retourne les résultats par ordre de pertinence donc la pertinence est croissante => i
        url: "http://online.elderecho.com/ipad/office/fragmentoMemento.action?jsessionid="+credential.jsessionid+"&nref="+idents[1].trim()+"&idFragmento="+idents[2].trim()+"&marginal="+idents[3].trim()+"&mostrarTitulo=mostrarTitulo&origen=office&seccion=memento",
        date:  new Date() ,
        fdate: ""
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
