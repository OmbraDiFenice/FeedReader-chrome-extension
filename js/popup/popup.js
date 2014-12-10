var contentReady = $.Deferred();

function fillPopup() {
	if(typeof options != 'undefined') { // options available
		console.log(options);
		
		// apply popup UI options
		$("html").css("max-width", options.UI.Popup.MaxWidth+"px").css("max-height", options.UI.Popup.MaxHeight+"px");
		
		// create entries for the feeds
		createFeedEntries();
	}
}

/* build the popup content to show the registered feeds
 * (only titles, no actual feed items are added)
 */
function createFeedEntries() {
	var container = $("#feedContainer");
	$.each(options.Feeds, function(i, feed) {
		var title = $("<div>")
			.addClass("feed-title")
			.text(feed.Name);
		var content = $("<div>")
			.attr("id", getHtmlFeedID(feed.ID))
			.addClass("feed-content")
		
		container.append(title).append(content);
	});
	
	container.accordion({
		header: "div.feed-title",
		collapsible: true,
		active: false,
		heightStyle: "content",
		activate: function(){ // reset the size of the popup to the minimum requested by its content TODO: find a smoother animation solution?
			var height = $("#feedContainer").height()
			$("body, html").height(height);
		}
	});
	
	contentReady.resolve();
}

/* This supposes that any item received is a new or updated item
 * and therefore the link should be updated and highlighted
 */
function updateFeed(feed, items) {
	var feedContent = $("#" + getHtmlFeedID(feed.ID));
	
	$.each(items, function(i, item) {
		var link = $("<a>")
			.addClass("feed-item")
			// TODO add highlight class
			.attr("href", "javascript:void(0)")
			.attr("data-feed-link", item.link) // used as identifier below
			.text(item.title)
			.attr("title", item.contentSnippet)
			.on("click", function() {
				chrome.tabs.create({url: item.link, active: false});
			});
		
		// just highlight the link if already exists, or insert it to the top of the list if it didn't
		var oldItem = feedContent.find('a[data-feed-link="' + item.link + '"]');
		if(oldItem.length != 0) {
			// TODO highlight oldItem
		} else {
			feedContent.prepend(link);
		}
	});
}

chrome.runtime.sendMessage({ method: "getOptions" }, function(response) {
	options = response;
	fillPopup();
});

chrome.runtime.sendMessage({ method: "updateRequested" });

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	if(message.method == "updateFeed") {
		contentReady.done(function() {
			updateFeed(message.feed, message.items);
		});
	}
});