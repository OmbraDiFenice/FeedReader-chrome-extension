/* Option object */
var options;
var optionsReady = $.Deferred();
var googleApiReady = $.Deferred();

function loadOptions() {
	options = new Options();
	optionsReady = load.call(options);
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
			updateFeeds(); // TODO: return cached results if requested by "popup opening" event
		});
	} else if (message.method == "updateOptions") {
		options = message.options;
		store.call(options);
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