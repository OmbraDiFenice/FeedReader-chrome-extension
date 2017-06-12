var $q = angular.injector(["ng"]).get("$q");

// update on timer alert
chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name == "action.update") {
        var feedList = angular.injector(["ng", "ui.bootstrap", "app"]).get("FeedList");
        feedList.load().then(function () {
            browserActionNotification(feedList);
        });
    }
});

// set periodic alarm
chrome.runtime.onInstalled.addListener(function () {
    chrome.alarms.clearAll(function () {
        chrome.alarms.create("action.update", {
            delayInMinutes: 2 / 60,
            periodInMinutes: 0.2
        });
    });
});