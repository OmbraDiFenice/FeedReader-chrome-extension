chrome.alarms.onAlarm.addListener(function(alarm) {
	if(alarm.name == "action.updateFeeds"){
		updateFeeds();
	}
});