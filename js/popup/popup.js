var _options, _feedList; // TODO debug only
chrome.runtime.sendMessage({ method: "getOptions" }, function(options) {
    console.log(options);
	chrome.runtime.sendMessage({ method: "getFeedList" }, function(feedList) {
        _options = options;
        _feedList = feedList;
        console.log(feedList);
        
        function initPopup() {
            // apply popup UI options
            $("html").css("max-width", options.UI.Popup.MaxWidth+"px").css("max-height", options.UI.Popup.MaxHeight+"px");

            // initialize accordion
            $("#feedContainer").accordion({
                header: "div.feed-title",
                collapsible: true,
                active: false,
                heightStyle: "content",
                activate: function () { // reset the size of the popup to the minimum requested by its content TODO: find a smoother animation solution?
                    var height = $("#feedContainer").height();
                    $("body, html").height(height);
                }
            });
        }

        function createFeedEntry(id, feed) {
            var title = $("<div>")
                .addClass("feed-title")
                .text(feed.Name)
                .appendTo("#feedContainer");
            var content = $("<div>")
                .attr("id", getHtmlFeedID(id))
                .addClass("feed-content")
                .appendTo("#feedContainer");
            if(typeof feed.items !== 'undefined') {
                $.each(feed.items, function (i, item) {
                    var link = createItem(item, id);
                    if(isNewItem(feed, item)) {
                        title.addClass("contains-unread");
                        link.addClass("unread");
                    }
                    content.append(link);
                });
            }
            $("#feedContainer").accordion("refresh");
        }

        /* build the popup content to show the registered feedList
         * (only titles, no actual feed items are added)
         */

        function createItem(item, feedID, highlight) {
            return $("<a>")
                .addClass("feed-item")
                .attr("data-feed-link", item.link)
                .attr("data-feed-id", feedID)
                .text(item.title)
                .attr("title", item.content)
                .on("click", {'feedID': feedID, 'itemLink': item.link}, openFeedItem);
        }

        function refreshFeed(id, feed) {
            var feedContent = $("#" + getHtmlFeedID(id));
            if(feedContent.length == 0) {
                createFeedEntry(id, feed);
            } else {
                if (typeof feed.items !== 'undefined') {
                    feedContent.find('.feed-item').removeClass("unread");
                    chrome.runtime.sendMessage({method: "getUnreadItems", feedID: id}, function(unreadItems) {
                        $.each(unreadItems, function(i, item) {
                            var oldItem = feedContent.find('.feed-item[data-feed-link="' + item.link + '"]');
                            if (oldItem.length != 0) {
                                oldItem.addClass("unread");
                            } else {
                                createItem(item, id).addClass("unread").appendTo(feedContent);
                            }
                        });

                        if (unreadItems.length != 0) {
                            feedContent.prev().addClass("contains-unread");
                        }
                    });
                }
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
                chrome.runtime.sendMessage({ method: "setReadItem", feedID: event.data.feedID, itemLink: event.data.itemLink });
            }
        }

        chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
            switch(message.method) {
                case "refreshFeed":
                    feedList.list[message.id] = message.feed; // keep feedList consistent with the changes TODO is it necessary? putting an if(!feedexists) createFeedEntry() in refreshFeed() should be enough to display feeds correctly and the popup wouldn't need feedList at all (even though the list would be empty at first and populate as new data arrive)
                    refreshFeed(message.id, message.feed);
                    break;
            }
        });

        initPopup();
        $.each(feedList.list, function(id, feed) {
            refreshFeed(id, feed);
        });
    });
});