angular.module('app')
    .controller('RssListCtrl', function ($scope, FeedList) {

        chrome.management.getSelf(function(extensionInfo) {
            $scope.debug = extensionInfo.installType != 'normal';
        });

        $scope.feedList = FeedList;
        
        $scope.openFeed = function(feed, item) {
            feed.open(item);
            browserActionNotification($scope.feedList);
        };

        $scope.feedList.load();

        $scope.check = function () {
            console.log($scope.feedList);
        };

    });