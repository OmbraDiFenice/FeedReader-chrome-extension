// update on timer alert
chrome.alarms.onAlarm.addListener(function(alarm) {
	if(alarm.name == "action.updateFeeds"){
		updateFeeds();
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
		optionsReady.done(function() {
			updateFeeds(); // TODO: return cached results if requested by "popup opening" event
		});
	} else if (message.method == "updateOptions") {
		options = message.options;
		store.call(options);
	}
	
	sendResponse(response);
});