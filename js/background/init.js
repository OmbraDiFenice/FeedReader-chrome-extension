/* Option object */
var options;
var optionsReady = $.Deferred();
var googleApiReady = $.Deferred();

$(function loadOptions() {
	options = new Options();
	optionsReady = load.call(options);
	optionsReady.done(function() {console.log(options);});
});

google.load("feeds", "1", {callback: function() {
	googleApiReady.resolve();
}});

chrome.runtime.onInstalled.addListener(function() {
	chrome.alarms.clearAll(function() {
		chrome.alarms.create("action.updateFeeds", {
			delayInMinutes: 0,
			periodInMinutes: 0.2
		});
	});
});