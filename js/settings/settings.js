function initSettings() {
	initUI();

	// populate feed list
	var feedList = $("#feed-list")
		.on("click", function(event) {
			feedList.find(".list-item-selected").removeClass("list-item-selected");
			$("#editFeedButton, #deleteFeedButton").button("disable");
		});
	updateFeedList();
}

function updateFeedList() {
	var feedList = $("#feed-list");
	

	$.each(options.Feeds, function(i, feed) {
		var feedInList = feedList.find(".list-item").filter(function() {
			return $(this).data("feedID") == feed.ID;
		});
		
		if(feedInList.length == 0) { // create new list-item
			feedInList = $("<p>")
				.addClass("list-item")
				.on("click", function(event) {
					event.stopPropagation();
					if($(this).hasClass("list-item-selected")) {
						$(this).removeClass("list-item-selected");
						$("#editFeedButton, #deleteFeedButton").button("disable");
					} else {
						feedList.find(".list-item-selected").removeClass("list-item-selected");
						$(this).addClass("list-item-selected");
						$("#editFeedButton, #deleteFeedButton").button("enable");
					}
				})
				.appendTo(feedList);;
		}
		
		// update the list-item, either the new one or the one already present
		feedInList
			.text(feed.Name)
			.data("feedID", feed.ID)
			.data("flagged", true); // flag the list item as "present in optionsFeed"
	});
	
	// remove any non-flagged element from the list and remove the flag from the others
	$.each(feedList.find(".list-item"), function(i, element) {
		var $element = $(element);
		if($element.data("flagged")) {
			$element.removeData("flagged");
		} else {
			$element.remove();
		}
	});
}

function initUI() {
	$(".list").sortable({
		//containment: "parent",
		items: "> .list-item",
		placeholder: "ui-state-highlight",
		forcePlaceholderSize: true,
		revert: true,
		update: function(event, ui) { // reorder the options.Feeds array to reflect the new order in the list
			var movedID = ui.item.data("feedID");
			var newPos = $(this).closest(".list").find(".list-item").index(ui.item);
			var oldPos = options.Feeds.indexOf(getFeedByID.call(options, movedID)); // TODO: inefficient, read the array twice. Possibly implement a getFeedIndexByID method
			var movedFeed = options.Feeds.splice(oldPos, 1)[0];
			options.Feeds.splice(newPos, 0, movedFeed);
			
			chrome.runtime.sendMessage({ method: "updateOptions", options: options });
		}
	});

	$("label[for=\"feedName\"]").text(chrome.i18n.getMessage("feedNameDialog"));
	$("label[for=\"feedURL\"]").text(chrome.i18n.getMessage("feedURLDialog"));
	$("label[for=\"feedMaxItems\"]").text(chrome.i18n.getMessage("feedMaxItemsDialog"))
	$("#feedMaxItems").spinner({
		culture: chrome.i18n.getUILanguage(),
		max: 20,
		min: 1,
		numberFormat: "n",
		page: 5
	});
	
	$("#feedDialog").dialog({
		autoOpen: false,
		closeText: chrome.i18n.getMessage("dialogClose"),
		buttons: [
			{
				text: chrome.i18n.getMessage("dialogConfirm"),
				click: function(event) {
					// TODO: validate input
					
					var feedID = $("#feedID").val();
					var feedName = $("#feedName").val();
					var feedURL = $("#feedURL").val();
					var feedMaxItems = $("#feedMaxItems").val();
					
					if(feedID == "") { // "add new feed" dialog
						var newFeed = new Feed(feedName, feedURL, feedMaxItems); // TODO: add new values as fields are added
						addFeed.call(options, newFeed);
					} else { // "edit feed" dialog
						var oldFeed = getFeedByID.call(options, feedID);
						oldFeed.Name = feedName;
						oldFeed.URL = feedURL;
						oldFeed.MaxItems = feedMaxItems;
					}
					chrome.runtime.sendMessage({ method: "updateOptions", options: options });
					updateFeedList();
					$("#feedDialog").dialog("close");
				}
			},
			{
				text: chrome.i18n.getMessage("dialogCancel"),
				click: function(event) {
					$("#feedDialog").dialog("close");
				}
			}
		],
		hide: true,
		modal: true,
		show: true,
		width: "auto"
	});
	
	$("#feedManagementButtons").buttonset();
	$("#addNewFeedButton")
		.attr("value", chrome.i18n.getMessage("addNewFeedButton"))
		.on("click", function() {
			$("#feedID, #feedName, #feedURL").val("");
			$("#feedMaxItems").spinner("value", options.DefaultFeedOptions.MaxItems);
			
			$("#feedDialog").dialog("option", "title", chrome.i18n.getMessage("newFeedDialogTitle")).dialog("open");
		});
	$("#editFeedButton")
		.attr("value", chrome.i18n.getMessage("editFeedButton"))
		.button("disable")
		.on("click", function(event) {
			var id = $(".list-item-selected").data("feedID");
			var feed = getFeedByID.call(options, id);
		
			$("#feedID").val(id);
			$("#feedName").val(feed.Name);
			$("#feedURL").val(feed.URL);
			$("#feedMaxItems").spinner("value", options.DefaultFeedOptions.MaxItems);
			
			$("#feedDialog").dialog("option", "title", chrome.i18n.getMessage("editFeedDialogTitle")).dialog("open");
		});
	$("#deleteFeedButton")
		.attr("value", chrome.i18n.getMessage("deleteFeedButton"))
		.button("disable")
		.on("click", function(event) {
			var id = $(".list-item-selected").data("feedID");
			var feed = getFeedByID.call(options, id);
			var index = options.Feeds.indexOf(feed);
			options.Feeds.splice(index, 1);
			chrome.runtime.sendMessage({ method: "updateOptions", options: options });
			updateFeedList();
			$("#editFeedButton, #deleteFeedButton").button("disable");
		});
}

chrome.runtime.sendMessage({ method: "getOptions" }, function(response) {
	options = response;
	initSettings();
});