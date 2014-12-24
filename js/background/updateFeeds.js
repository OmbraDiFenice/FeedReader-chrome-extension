function updateFeeds(forceRemote) {
	var feedCache = {};

	if(forceRemote) { // retrieve feed items remotely
		$.when(optionsReady, googleApiReady)
			.done(function() {
				$.each(options.Feeds, function(i, feed) {
					var feedOptions = $.extend(true, {}, options.DefaultFeedOptions, feed.Options); // use feed options if defined and default options to fill the missing ones
					
					var googleFeed = new google.feeds.Feed(feed.URL); // create google feed object
					googleFeed.setNumEntries(feedOptions.MaxItems); // set properties from extended options
					
					// load feed informations
					googleFeed.load(function(result) {
						console.log(feed.Name);
						console.log(result.feed.entries);
						
						// save most recent values in cache
						feedCache[feed.ID] = result.feed.entries;
						
						// TODO browser action notifications
						if(i == options.Feeds.length-1) { // update the badge on last iteration, when all the feeds are read
							chrome.storage.local.set({"feedCache": feedCache}, function() {
								setBadge();
							});
						}
						
						chrome.runtime.sendMessage({
							method: "updateFeed",
							feed: feed,
							items: result.feed.entries
						});
					});
				});
			});
	} else { // return cached feed items
		chrome.storage.local.get("feedCache", function(result) {
			var feedCache = result.feedCache;
			$.each(options.Feeds, function(i, feed) {
				chrome.runtime.sendMessage({
					method: "updateFeed",
					feed: feed,
					items: feedCache[feed.ID]
				});
			});
		});
	}
}