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
    const chromeOptionName = "FeedList";

    /**
     * @type {number}
     * @private
     */
    var nextID = 1; // TODO fetch and store this separately

    /**
     * @type {FeedList}
     */
    var feedList = {
        list: [],

        /**
         * Add the given feed to this feed list
         * @param {Feed} feed
         * @method
         */
        add: function(feed) {
            var id = nextID++;
            this.list[id] = feed;
            this.store();
        },

        /**
         * Delete the feed having the given id from this feed list
         * @param {number} id
         * @method
         */
        delete: function(id) {
            console.log(this.list[id]);
            delete this.list[id];
            console.log(this.list[id]);
            this.store();
        }
    };

    feedList.load = function() {
        var ret = $.Deferred();
        load(chromeOptionName)
            .done(function(data) {
                if(data.list !== undefined) {
                    feedList.list = data.list;
                    $.each(feedList.list, setFeedMethods);
                }
                if(data.nextID !== undefined) nextID = data.nextID;
                console.log(chromeOptionName + " load completed");
                console.log(feedList);
                console.log(nextID);
                ret.resolve(feedList);
            })
            .fail(function(message) {
                console.log(message);
                ret.reject(message);
            });
        return ret;
    };

    feedList.store = function() {
        // delete the items from the list, they will be retrieved from the remote source
        var storedList = $.extend(true, {}, feedList.list);
        $.each(storedList, function(i, feed) {
            delete feed.items;
        });

        // store the cleaned feed list
        return store(chromeOptionName, {"list": storedList, "nextID": nextID})
            .done(function() {
                chrome.runtime.sendMessage({method: "refreshFeed"});
                console.log(chromeOptionName + " storage completed");
            })
            .fail(function(message) {
                console.log(message);
            });
    };

    return feedList;
}