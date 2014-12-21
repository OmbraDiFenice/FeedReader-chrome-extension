function initSettings() {
	initUI();

	// populate feed list
	var feedList = $("#feed-list")
		.on("click", function(event) {
			feedList.find(".list-item-selected").removeClass("list-item-selected");
			$("#editFeedButton, #deleteFeedButton").button("disable");
		});
	$.each(options.Feeds, function(i, feed) {
		$("<p>")
			.text(feed.Name)
			.data("feedID", feed.ID)
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
			.appendTo(feedList);
	});
}

function initUI() {
	$("#feed-list").sortable({
		containment: "parent",
		items: "> .list-item",
		placeholder: "ui-state-highlight",
		revert: true
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
					// TODO: save new feed info
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
			$("#feedName, #feedURL").val("");
			$("#feedMaxItems").spinner("value", options.DefaultFeedOptions.MaxItems);
			$("#feedDialog").dialog("option", "title", chrome.i18n.getMessage("newFeedDialogTitle")).dialog("open");
		});
	$("#editFeedButton")
		.attr("value", chrome.i18n.getMessage("editFeedButton"))
		.button("disable")
		.on("click", function(event) {
			var id = $(".list-item-selected").data("feedID");
			var feed = getFeedByID.call(options, id);
		
			$("#feedName").val(feed.Name);
			$("#feedURL").val(feed.URL);
			$("#feedMaxItems").spinner("value", options.DefaultFeedOptions.MaxItems);
			$("#feedDialog").dialog("option", "title", chrome.i18n.getMessage("editFeedDialogTitle")).dialog("open");
		});
	$("#deleteFeedButton")
		.attr("value", chrome.i18n.getMessage("deleteFeedButton"))
		.button("disable");
}

chrome.runtime.sendMessage({ method: "getOptions" }, function(response) {
	options = response;
	initSettings();
});