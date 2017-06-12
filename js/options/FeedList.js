/**
 * @external Feed
 */

/**
 * @typedef FeedList
 * @property {Feed[]} list
 */

/**
 * Constructor for FeedList object
 * @returns {FeedList} an empty FeedList object, call load() on it to get the list from the Chrome cloud storage
 * @constructor
 */
function FeedList() {
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
     * @param {string} id
     * @method
     */
    feedList.remove = function (id) {
        for(var i = 0; i < feedList.length; i++) {
            var feed = feedList[i];
            if(feed.url == id) {
                feedList.splice(i,1);
                this.store();
            }
        }
    };

    feedList.update = function() {
        var ds = [];
        $.each(feedList, function(i, feed) {
            ds.push(feed.update());
        });
        return $.when.apply(feedList, ds);
    };

    function loadFeed(key) {
        var d = $.Deferred();
        g_load(key).done(function(storedInfo) {
            var feed = Feed(storedInfo.name, storedInfo.url, storedInfo.firstRun);
            feed.update().done(function() {
                d.resolve(feed);
            });
        });
        return d;
    }

    feedList.load = function() {
        var d = $.Deferred();
        g_load(chromeOptionName)
            .done(function(feedIds) {
                var ds = [];
                $.each(feedIds, function(i, id) {
                    ds.push(loadFeed(id).done(function(feed) {
                        feedList.push(feed);
                    }));
                });

                $.when(ds).done(function() {
                    console.log(chromeOptionName + " load completed");
                    console.log(feedList);
                    d.resolve(feedList);
                });
            });
        return d;
    };

    feedList.store = function() {
        var feedIds = [];
        var ds = [];
        $.each(feedList, function(i, feed) {
            feedIds.push(feed.url);
            ds.push(feed.store());
        });

        ds.push(g_store(chromeOptionName, feedIds));
        return $.when.apply(feedList, ds);
    };

    return feedList;
}