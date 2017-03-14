var _options, _feedList;
$.when(Options(), FeedList()).done(function(options, feedList){
    // TODO debug only
    _options = options;
    _feedList = feedList;

    function fetchFeeds(fromRemote, fetchCompleted, fetchFailed) {
        if(fromRemote) { // retrieve feed items remotely
            var all = []; // list of deferreds relative to individual feed fetches
            var shouldPlay = false;
            $.each(feedList.list, function(id, feed) {
                all.push(
                    $.getJSON("http://rss2json.com/api.json", {rss_url: feed.URL}, function(result) {
                        // TODO save most recent values in cache
                        if(result.status === "ok") {
                            var previousItems = feed.items;
                            feed.items = result.items.slice(0, options.MaxItems);

                            // store information for browser action notifications
                            if(!shouldPlay && (typeof feed.items !== 'undefined' || typeof previousItems !== 'undefined') && JSON.stringify(previousItems) !== JSON.stringify(feed.items)) {
                                $.each(feed.items, function(i, item) {
                                    if(isNewItem(feed, item)) {
                                        shouldPlay = true;
                                        return false;
                                    }
                                });
                            }

                            if($.isFunction(fetchCompleted)) fetchCompleted(id, feed);
                        } else if($.isFunction(fetchFailed)) fetchFailed(id, feed, result.errorMessage);
                    })
                );
            });

            // when all fetches are completed notify the user if some new item was received
            $.when.apply($, all).then(function() {
                browserActionNotification(options, feedList, shouldPlay);
            })
        } else { // TODO return cached feed items

        }
    }

    // send response message to requests
    chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
        switch (message.method) {
            case "getFeedList":
                sendResponse(feedList);
                break;
            case "getOptions":
                sendResponse(options);
                break;
            case "setReadItem":
                var feed = feedList.list[message.feedID];
                feed.setReadItem(message.feedID, message.itemLink);
                feedList.store();
                browserActionNotification(options, feedList, false);
                break;
            case "getUnreadItems":
                var feed = feedList.list[message.feedID];
                sendResponse(feed.getUnreadItems());
                break;
            case "addFeed":
                feedList.add(message.name, message.url);
                sendResponse(feedList);
                fetchFeeds(true);
                break;
            case "editFeed":
                feedList.edit(message.id, message.name, message.url);
                sendResponse(feedList);
                fetchFeeds(true);
                break;
            case "deleteFeed":
                feedList.delete(message.id);
                sendResponse(feedList);
                fetchFeeds(true);
                break;
        }
    });


    // set periodic alarm
    chrome.runtime.onInstalled.addListener(function() {
        chrome.alarms.clearAll(function() {
            chrome.alarms.create("action.updateFeeds", {
                delayInMinutes: 0,
                periodInMinutes: options.RefreshInterval
            });
        });
    });

    // update on timer alert
    chrome.alarms.onAlarm.addListener(function(alarm) {
        if(alarm.name == "action.updateFeeds"){
            fetchFeeds(true, function(id, feed) {
                chrome.runtime.sendMessage({method: "refreshFeed", id: id, feed: feed});
            }, function(id, feed, message) {
                console.log("fetch for feed " + feed.Name + " failed: " + message);
            });
        }
    });
});