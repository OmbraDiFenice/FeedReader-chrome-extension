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
}

function updateFeed(feed, items) {
	var feedContent = $("#" + getHtmlFeedID(feed.ID));
	var highlightContent = false;
	
	$.each(items, function(i, item) {
		var link = $("<a>")
			.addClass("feed-item")
			.attr("data-feed-link", item.link)
			.attr("data-feed-id", feed.ID)
			.text(item.title)
			.attr("title", item.contentSnippet)
			.on("click", {'feedID':feed.ID, 'itemLink':item.link}, openFeedItem);
		
		if(typeof feed.readItems[item.link] === 'undefined' || dates.compare(new Date(feed.readItems[item.link]), new Date(item.publishedDate)) < 0) {
			link.addClass("unread");
			highlightContent = true;
		}
		
		// just highlight the link if already exists, or insert it into the list if it didn't
		var oldItem = feedContent.find('.feed-item[data-feed-link="' + item.link + '"]');
		if(oldItem.length != 0) {
			if(link.hasClass("unread")) oldItem.addClass("unread");
		} else {
			feedContent.append(link);
		}
	});
	
	if(highlightContent) {
		feedContent.prev().addClass("contains-unread");
	}
}

function openFeedItem(event) {
	if(!event.ctrlKey) {
		// open link in a new tab
		// TODO: use options to open it inside the popup (like gmail extension)
		chrome.tabs.create({url: event.data.itemLink, active: false});
	}
	
	// check if this was the last "unread" item
	if($(this).siblings(".unread").length === 0) {
		$(this).parent().prev().removeClass("contains-unread");
		setBadge();
	}
	
	if($(this).hasClass("unread")) {
		$(this).removeClass("unread");
		
		// update the readItems list
		var feed = getFeedByID.call(options, event.data.feedID);
		if(feed !== null) {
			feed.readItems[event.data.itemLink] = $.now();
			
			// sort by date and trim to feed.MaxItems
			var readItemsArray = $.map(feed.readItems, function(date, key) {
				return { URL: key, date: date }
			});
			readItemsArray.sort(function(a, b) {
				return dates.compare(new Date(b.date), new Date(a.date));
			});
			var maxItems = (feed.options) ? feed.options.MaxItems : options.DefaultFeedOptions.MaxItems;
			readItemsArray = readItemsArray.slice(0, maxItems);
			var newReadItems = {};
			$.each(readItemsArray, function(i, val) {
				newReadItems[val.URL] = val.date;
			});
			feed.readItems = newReadItems;
		}
		
		chrome.runtime.sendMessage({ method: "updateOptions", options: options });
	}
}

chrome.runtime.sendMessage({ method: "getOptions" }, function(response) {
	options = response;
	fillPopup();
	contentReady.resolve();
});

chrome.runtime.sendMessage({ method: "updateRequested" });

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	if(message.method == "updateFeed") {
		contentReady.done(function() {
			updateFeed(message.feed, message.items);
		});
	}
});