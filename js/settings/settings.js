chrome.runtime.sendMessage({ method: "getOptions" }, function(options) {
    chrome.runtime.sendMessage({ method: "getFeedList"}, function(feedList) {

        function createFeedEntry(id, feed) {
            var handle = $("<div>").addClass("handle ui-icon ui-icon-arrow-4").css("visibility", "hidden");
            var text = $("<p>").addClass("feedName").text(feed.Name);

            return $("<div>")
                .addClass("list-item")
                .data("feedID", id)
                .hover(function() {
                    handle.css("visibility", "visible");
                }, function() {
                    handle.css("visibility", "hidden");
                })
                .append(handle, text);
        }

        function refreshFeedList(feedList) {
            var HtmlFeedList = $("#feed-list");

            HtmlFeedList.empty();

            $.each(feedList.list, function(id, feed) {
                console.log(feed.Name);
                createFeedEntry(id, feed)
                    .appendTo(HtmlFeedList);
            });

            HtmlFeedList.selectable("refresh");
        }

        function resetFeedDialog() {
            $("#feedID, #feedName, #feedURL").val("");
        }

        function moveFeed(movedID, newPos) {
            /*
            var oldPos = options.Feeds.indexOf(getFeedByID.call(options, movedID)); // TODO: inefficient, read the array twice. Possibly implement a getFeedIndexByID method
            var movedFeed = options.Feeds.splice(oldPos, 1)[0];
            options.Feeds.splice(newPos, 0, movedFeed);
            */
            // TODO chrome.runtime.sendMessage(...);

            refreshFeedList(feedList);
        }

        function addFeed(name, url) {
            chrome.runtime.sendMessage({method: "addFeed", name: name, url: url}, function(newFeedList) {
                refreshFeedList(newFeedList);
            });
        }

        function editFeed(id, name, url) {
            chrome.runtime.sendMessage({method: "editFeed", id: id, name: name, url: url}, function(newFeedList) {
                feedList = newFeedList;
                refreshFeedList(newFeedList);
            });
        }
        
        function deleteFeed(id) {
            chrome.runtime.sendMessage({ method: "deleteFeed", id: id}, function(newFeedList) {
                refreshFeedList(newFeedList);
            });
        }

        function getSelectedFeedID() {
            return $(".ui-selected").data("feedID");
        }

        function initUI() {
            // init list
            $("#feed-list")
                .sortable({
                    //containment: "parent",
                    items: "> .list-item",
                    handle: ".handle",
                    placeholder: "ui-state-highlight",
                    forcePlaceholderSize: true,
                    revert: true,
                    update: function(event, ui) { // reorder the feed in the options to reflect the new order in the list
                        var movedID = ui.item.data("feedID");
                        var newPos = $(this).closest(".list").find(".list-item").index(ui.item);
                        moveFeed(movedID, newPos, feedList);
                    }
                })
                .selectable({
                    filter: ".list-item",
                    stop: function() {
                        var numSelected = $(this).find(".ui-selected").length;
                        if(numSelected != 0) {
                            $("#deleteFeedButton").button("enable");
                            if(numSelected == 1) {
                                $("#editFeedButton").button("enable");
                            } else {
                                $("#editFeedButton").button("disable");
                            }
                        } else {
                            $("#editFeedButton, #deleteFeedButton").button("disable");
                        }
                    }
                });

            $("label[for=\"feedName\"]").text(chrome.i18n.getMessage("feedNameDialog"));
            $("label[for=\"feedURL\"]").text(chrome.i18n.getMessage("feedURLDialog"));

            // init insert/edit feed dialog
            $("#feedDialog").dialog({
                autoOpen: false,
                closeText: chrome.i18n.getMessage("dialogClose"),
                hide: true,
                modal: true,
                show: true,
                width: "auto",
                buttons: [
                    {
                        text: chrome.i18n.getMessage("dialogConfirm"),
                        click: function() {
                            // TODO: validate input

                            var feedID = $("#feedID").val();
                            var feedName = $("#feedName").val();
                            var feedURL = $("#feedURL").val();

                            if(feedID == "") { // "add new feed" dialog
                                addFeed(feedName, feedURL);
                            } else { // "edit feed" dialog
                                editFeed(feedID, feedName, feedURL);
                            }

                            $(this).dialog("close");
                        }
                    },
                    {
                        text: chrome.i18n.getMessage("dialogCancel"),
                        click: function() {
                            $(this).dialog("close");
                        }
                    }
                ]
            });

            // init buttons
            $("#feedManagementButtons").buttonset();
            $("#addNewFeedButton")
                .attr("value", chrome.i18n.getMessage("addNewFeedButton"))
                .on("click", function() {
                    resetFeedDialog();
                    $("#feedDialog").dialog("option", "title", chrome.i18n.getMessage("newFeedDialogTitle")).dialog("open");
                });
            $("#editFeedButton")
                .attr("value", chrome.i18n.getMessage("editFeedButton"))
                .button("disable")
                .on("click", function() {
                    resetFeedDialog();

                    var id = getSelectedFeedID();
                    var feed = feedList.list[id];

                    $("#feedID").val(id);
                    $("#feedName").val(feed.Name);
                    $("#feedURL").val(feed.URL);

                    $("#feedDialog").dialog("option", "title", chrome.i18n.getMessage("editFeedDialogTitle")).dialog("open");
                });
            $("#deleteFeedButton")
                .attr("value", chrome.i18n.getMessage("deleteFeedButton"))
                .button("disable")
                .on("click", function() {
                    var id = getSelectedFeedID();
                    deleteFeed(id);
                });
        }


        initUI();

        // populate feed list
        refreshFeedList(feedList);
    });
});