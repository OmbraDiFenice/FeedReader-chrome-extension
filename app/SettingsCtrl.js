angular.module('app')
    .controller('SettingsCtrl', function ($scope, FeedList) {

        chrome.management.getSelf(function(extensionInfo) {
            $scope.debug = extensionInfo.installType != 'normal';
        });

        $scope.feedList = FeedList;
        $scope.feedList.load();
        
        $scope.select = function(feed) {
            if($scope.selected === feed) {
                $scope.selected = undefined;
            } else {
                $scope.selected = feed;
            }
        };
        
        $scope.saveFeed = function() {
            if($scope.edit) {
                $scope.feedList.store();
            } else {
                var feed = Feed($scope.selected.name, $scope.selected.url);
                $scope.feedList.add(feed);
                $scope.selected = undefined;
            }
        };

        $scope.remove = function() {
            $scope.feedList.remove($scope.selected);
            $scope.selected = undefined;
        };

    });