var config = {
  CONNECT_URL: "https://int.abonnes.efl.fr"
}
chrome.browserAction.onClicked.addListener(function(activeTab)
{
    var newURL = config.CONNECT_URL /*+ "/casefl/login?service=efl.fr"*/;
    chrome.tabs.create({ url: newURL });
});
