$(function () {
    var $scope = angular.element("body").scope();

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
                update: function (event, ui) { // reorder the feed in the options to reflect the new order in the list
                    var movedID = ui.item.data("feedID");
                    var newPos = $(this).closest(".list").find(".list-item").index(ui.item);
                    //moveFeed(movedID, newPos, feedList);
                }
            })/*
            .selectable({
                filter: ".list-item",
                stop: function () {
                    var numSelected = $(this).find(".ui-selected").length;
                    switch(numSelected) {
                        case 0:
                            $("#editFeedButton").button("disable");
                            $("#deleteFeedButton").button("disable");
                            break;
                        case 1:
                            $("#editFeedButton").button("enable");
                            $("#deleteFeedButton").button("enable");
                            break;
                        default:
                            $("#editFeedButton").button("disable");
                            $("#deleteFeedButton").button("enable");
                    }
                }
            });*/
         

        //$("label[for=\"feedName\"]").text(chrome.i18n.getMessage("feedNameDialog"));
        //$("label[for=\"feedURL\"]").text(chrome.i18n.getMessage("feedURLDialog"));

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
                    click: function () {
                        $scope.saveFeed();
                        $scope.$apply();

                        $(this).dialog("close");
                    }
                },
                {
                    text: chrome.i18n.getMessage("dialogCancel"),
                    click: function () {
                        $scope.edit = false;
                        $(this).dialog("close");
                    }
                }
            ]
        });

        // init buttons
        $("#dialogConfirm, #dialogCancel").button();
        $("#dialogCancel").click(function () {
            $("#feedDialog").dialog("close");
        });

        //$("#feedManagementButtons").buttonset();
        $("#addNewFeedButton")
            .on("click", function () {
                $scope.edit = false;
                $scope.select();
                $scope.$apply();
                $("#feedDialog").dialog("option", "title", chrome.i18n.getMessage("newFeedDialogTitle")).dialog("open");
            });
        $("#editFeedButton")
            //.button("disable")
            .on("click", function () {
                $scope.edit = true;
                $("#feedDialog").dialog("option", "title", chrome.i18n.getMessage("editFeedDialogTitle")).dialog("open");
            });
    }

    initUI();
});