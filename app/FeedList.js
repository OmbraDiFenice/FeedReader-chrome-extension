angular.module('app')
    .factory("FeedList", function ($q) {
        var chromeOptionName = "feedList";

        var feedList = [];

        /**
         * Add the given feed to this feed list
         * @param {Feed} feed
         * @method
         */
        feedList.add = function(feed) {
            for(var i = 0; i < feedList.length; i++) {
                if(feedList[i].url == feed.url) {
                    return false;
                }
            }
            feedList.push(feed);
            this.store();
            return true;
        };

        /**
         * Remove the feed having the given id from this feed list
         * @param {Feed} toBeRemoved
         * @method
         */
        feedList.remove = function (toBeRemoved) {
            chrome.storage.sync.remove(toBeRemoved.url);
            for(var i = 0; i < feedList.length; i++) {
                var feed = feedList[i];
                if(feed.url == toBeRemoved.url) {
                    feedList.splice(i,1);
                    this.store().then(feedList.update);
                }
            }
        };

        feedList.update = function() {
            var ds = [];
            $.each(feedList, function(i, feed) {
                ds.push($q.when(feed.update()));
            });
            return $q.all(ds);
        };

        function loadFeed(key) {
            var d = $q.defer();
            g_load(key).done(function(storedInfo) {
                var feed = Feed(storedInfo.name, storedInfo.url);
                feed.firstRun = storedInfo.firstRun;
                feed.unreadItems = storedInfo.unreadItems;
                feed.readItems = storedInfo.readItems;
                var u = feed.update();
                u.always(function() {
                    d.resolve(feed);
                });
            });
            return d.promise;
        }

        feedList.load = function() {
            var d = $q.defer();
            g_load(chromeOptionName)
                .done(function(feedIds) {
                    var ds = [];
                    $.each(feedIds, function(i, id) {
                        var p = loadFeed(id);
                        ds.push(p);
                        p.then(function(feed) {
                            feedList.push(feed);
                        });
                    });

                    $q.all(ds).then(function(data) {
                        console.log(chromeOptionName + " load completed");
                        console.log(feedList);
                        d.resolve(data);
                    });
                });
            return d.promise;
        };

        feedList.store = function() {
            var feedIds = [];
            var ds = [];
            $.each(feedList, function(i, feed) {
                feedIds.push(feed.url);
                ds.push($q.when(feed.store()));
            });

            ds.push($q.when(g_store(chromeOptionName, feedIds)));
            return $q.all(ds);
        };

        return feedList;
    });