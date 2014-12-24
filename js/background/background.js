// update on timer alert
chrome.alarms.onAlarm.addListener(function(alarm) {
	if(alarm.name == "action.updateFeeds"){
		updateFeeds(true);
	}
});

// send response message to requests
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
	var response = { status: "OK" };
	if(message.method == "getOptions") {
		optionsReady.done(function() {
			response = options;
		});
	} else if (message.method == "updateRequested") {
		message = $.extend({ forceRemote: false }, message);
	
		optionsReady.done(function() {
			updateFeeds(message.forceRemote); // TODO: return cached results if requested by "popup opening" event
		});
	} else if (message.method == "updateOptions") {
		var reUpdateFeeds = message.options.Feeds.length != options.Feeds.length;
		options = message.options;
		store.call(options);
		
		if(reUpdateFeeds) { // update feeds from remote sources if the feed list has been modified
			updateFeeds(true);
		}
	}
	
	sendResponse(response);
});