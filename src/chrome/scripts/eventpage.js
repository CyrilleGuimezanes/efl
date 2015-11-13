chrome.browserAction.onClicked.addListener(function(activeTab)
{
    var newURL = "https://secure.efl.fr/casefl/login?service=efl.fr";
    chrome.tabs.create({ url: newURL });
});
