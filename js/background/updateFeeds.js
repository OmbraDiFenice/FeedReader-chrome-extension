function updateFeeds() {
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
					
					// TODO browser action notifications
					chrome.runtime.sendMessage({
						method: "updateFeed",
						feed: feed,
						items: result.feed.entries
					});
				});
			});
		});
}