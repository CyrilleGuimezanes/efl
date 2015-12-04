var config = null;
/*myURL="about:blank"; //A default url just in case below code doesn't work
chrome.tabs.onUpdated.addListener(function(tabId,changeInfo,tab){ //onUpdated should fire when the selected tab is changed or a link is clicked
    chrome.tabs.getSelected(null,function(tab){

    });
});*/

chrome.tabs.getSelected(null,function(tab){
  defineEnv(tab.url);
  chrome.browserAction.onClicked.addListener(function(activeTab)
  {
      var newURL = getProvider().urls.base;
      chrome.tabs.create({ url: newURL });
  });

});
