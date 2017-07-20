/**
 * Created by Stefano on 19/07/2017.
 */
angular.module('app')
    .controller('DetectedFeedCtrl', function ($scope, FeedList) {
        $scope.detectedFeeds = [];

        $scope.addDetectedFeed = function(source) {
            FeedList.add(Feed(source.title, source.link));
        };

        chrome.tabs.query({}, function(tabs) {
            angular.forEach(tabs, function(tab) {
                chrome.tabs.sendMessage(tab.id, {text: 'get_feed_source'}, function(feeds) {
                    console.log(feeds);
                    angular.forEach(feeds, function(feed) {
                        if(feed === undefined) {
                            console.log(chrome.runtime.lastError);
                        } else {
                            $scope.detectedFeeds.push(feed);
                            console.log($scope.detectedFeeds);
                        }
                    });
                });
            });
        });
    });