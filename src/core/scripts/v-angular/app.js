//"matches": ["*://www.google.*/*"],
var app = angular.module("DallozSearch", []);

//TODO chaque extension va surcharger cette fonction
var getUrl = function(uri){
  return chrome.extension.getURL(uri);
}

//this allow chrome-extension:// to be used in ng-include
app.config(function($compileProvider, $sceDelegateProvider) {
  $sceDelegateProvider.resourceUrlWhitelist([
    'self',
    'chrome-extension**'
  ])
  $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|chrome-extension):|data:image\//);
  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|chrome-extension):/);
});
app.controller("RootController", ['$scope', '$http', '$sce', function($scope, $http, $sce){

  $scope.widgetTitle = "Résultats des Editions Legislatives";
  $scope.logo = getUrl("images/icon-19.png");
  $scope.collapse = true;
  $scope.items = [];
  function escapeHtml(unsafe) {
      return unsafe
           .replace(/&/g, "&amp;")
           .replace(/</g, "&lt;")
           .replace(/>/g, "&gt;")
           .replace(/"/g, "&quot;")
           .replace(/'/g, "&#039;");
   }


  var truncate = function(str, len, html){
      if (html)
        return escapeHtml(str.substring(0, len));
      return str.substring(0, len);
  }


  var getResults = function(term){
    $http({
        url: getUrl("mock/page.html?q="+term),
        method: 'GET',
        dataType: "json"
    }).then(function( data ) {
        var noNewLine = data.data.replace(/\r?\n|\r/g, '');
        var noDoctype = /<body>(.*)<\/body>/.exec(noNewLine);
        var body = document.createElement( 'div' );
        body.innerHTML = noDoctype[1];
        var results = body.querySelectorAll(".resultItem");
        for (var i = 0; i < results.length; i++){
          var result = results[i];
          var parsedMetaData = /(.+)\s-\s(.+)\s\((.+)\)\s-\s([0-9]+)\/([0-9]+)\/([0-9]+)/.exec(result.querySelector(".bookTitle").innerHTML);
          var key = result.querySelector(".openDocumentLink").attributes["key"].value;
          var item = {
            title: $sce.trustAsHtml(result.querySelector(".openDocumentLink").innerHTML),
            brief: $sce.trustAsHtml(result.querySelector(".brief").innerHTML),
            source:  parsedMetaData[1],
            serie:  parsedMetaData[2],
            category:  parsedMetaData[3],
            url: "http://abonnes.efl.fr/EFL2/app/connect/documentView?documentCode="+key+"&CONNECT=9e819f0d668d7b3288a83c54f2fca803",
            date:  new Date(parsedMetaData[6], parsedMetaData[5], parsedMetaData[4]),
            fdate: parsedMetaData[4] + "-" +parsedMetaData[5]+ "-"+parsedMetaData[6]
          }
          $scope.items.push(item);
        }

    }, function (response) {
      console.error(response);
    });
  }
 
  $scope.toggleCollapse = function(){
    $scope.collapse = !$scope.collapse;
  }
  var searchField = angular.element(document.getElementById("lst-ib"));

  searchField.on("change", function(){
    getResults(searchField.val());
  })

  getResults(searchField.val());

}]);

app.run(['$compile', '$rootScope', '$sce', function($compile, $rootScope, $sce){

  var insertPlace = angular.element(document.getElementById("rhs")); //#center_col
  $sce.trustAsResourceUrl(getUrl("views/widget.html"))
  insertPlace.append("<div ng-csp='' id='dalloz'><div ng-include=\"'"+$sce.getTrustedResourceUrl(getUrl("views/widget.html"))+"'\"/></div>");
  $compile(angular.element(document.getElementById("dalloz")).contents())($rootScope);


}])

var init = function(){
  var insertPlace = document.getElementById("rhs"); //#center_col
  angular.bootstrap(insertPlace, ['DallozSearch']);
}


setTimeout(init, 1000)//chercher comment chaque extenion peut appeller cette fonction ASAP
