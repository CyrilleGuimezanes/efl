'use strict';

/**
 * Enable dubug mode
 * This allow to console.log in a firefox default configuration
 */
require('sdk/preferences/service').set('extensions.sdk.console.logLevel', 'all');

var data = require('sdk/self').data;
var { ToggleButton } = require('sdk/ui/button/toggle');
var { PageMod } = require('sdk/page-mod');
var { Panel } = require('sdk/panel');
var  Tabs = require("sdk/tabs");



var popup = Panel({
    contentURL: data.url('popup.html'),
    onHide: function () {
        button.state('window', {checked: false});
    }
});

// Show the popup when the user clicks the button.
function handleClick(state) {
    /*if (state.checked) {
        popup.show({
            position: button,
            width: 600,
            height: 400
        });
    }*/
    //TODO use provider connnect url instead of constant (find how to include config.js here)
    Tabs.open("http://int.abonnes.efl.fr");
}

// Create a button
var button = ToggleButton({
    id: 'show-popup',
    label: 'ELSConnect',
    icon: {
        '16': './images/icon-16.png',
        '32': './images/icon-32.png',
        '64': './images/icon-64.png'
    },
    onClick: handleClick

});

// Create a content script
var pageMod = PageMod({
    include: /.*(google|yahoo|bing).*/, // all urls
    contentScriptFile: [data.url("scripts/libs/underscore.js"),
                        data.url("scripts/libs/jquery.js"),
                        data.url("scripts/libs/sha256.js"),
                        data.url("scripts/libs/iscroll.js"),
                        data.url("scripts/libs/backbone.js"),
                        data.url("scripts/utils.js"),
                        data.url("scripts/config.js"),
                        data.url("scripts/models.js"),
                        data.url("scripts/collection.result.js"),
                        data.url("scripts/view.filter.js"),
                        data.url("scripts/view.result.js"),
                        data.url("scripts/view.widget.js"),
                        data.url("scripts/widget-generator.js")
],
    contentStyleFile: [data.url('styles/css/app.css')],
    contentScriptWhen: "end",
    contentScriptOptions: {
      baseUrl: data.url("")
    }
});
