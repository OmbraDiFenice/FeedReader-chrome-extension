/* Option object */
var options;
var optionsReady;
var googleApiReady = $.Deferred();

function loadOptions() {
	options = new Options();
	optionsReady = options.load();
	optionsReady.done(function() {console.log(options);});
}
loadOptions();

google.load("feeds", "1", {callback: function() {
	googleApiReady.resolve();
}});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
	if(message.method == "getOptions") {
		optionsReady.done(function() {
			sendResponse(options);
		});
	} else if (message.method == "updateRequested") {
		optionsReady.done(function() {
			updateFeeds();
		});
	}
});

chrome.runtime.onInstalled.addListener(function() {
	chrome.alarms.clearAll(function() {
		chrome.alarms.create("action.updateFeeds", {
			delayInMinutes: 0,
			periodInMinutes: 0.2
		});
	});
});