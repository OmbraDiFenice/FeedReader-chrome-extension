/**
 * For the complete definition of an Item see https://rss2json.com/docs
 * @typedef {Object} Item
 * @property {string} pubDate
 * @property {string} link
 */

/**
 * @typedef {Object} Feed
 * @property {string} Name
 * @property {string} URL
 * @property {Object.<string, string>} unreadItems
 * @property {Item[]} items
 */

/**
 * Constructor for Feed object
 * @param {string} name - the name of the feed
 * @param {string} URL  - the URL of the feed
 * @returns {Feed} a new Feed object
 * @constructor
 */
function Feed(name, URL) {

    // Feed object

    /**
     * @type {Feed}
     */
    var feed = {
        "name": name,
        "URL": URL,
        "unreadItems": {},
        "items": [],

        /**
         * Return true if the given item must be considered unread.
         * It returns true even if the given item has already been marked as read but the pubDate of the argument is more
         * recent than the date when the item has been marked as read
         * @param {Item} item
         * @returns {boolean}
         * @method
         */
         isNewItem: function (item) {
            return typeof this.unreadItems[item.link] !== 'undefined' || dates.compare(new Date(this.unreadItems[item.link]), new Date(item.pubDate)) > 0;
        },

        /**
         * Compute the number of unread item for this feed
         * @returns {Item[]} the stored unread items
         * @method
         */
        getReadItems: function () {
            var _this = this;
            var list = [];
            $.each(this.items, function (i, item) {
                if (_this.isNewItem(item)) {
                    list.push(item);
                }
            });
            return list;
        },

        /**
         * Set the read/unread status of the give item
         * @param {Item} item
         * @param {boolean} setRead
         * @method
         */
        setItemState: function (item, setRead) {
            if (setRead) {
                delete this.unreadItems[item.link];
            } else {
                this.unreadItems[item.link] = $.now();
            }
        },

        /**
         * Fetch last items from remote
         * @param {function} fetchCompleted - function called when the fetch completed successfully. It gets the fetched feed as argument
         * @param {function} fetchFailed - function called when the fetch fails. It gets the feed as first argument and the error message as second argument
         * @returns {JQueryXHR}
         */
        fetch: function (fetchCompleted, fetchFailed) {
            var _this = this;
            return $.getJSON("http://rss2json.com/api.json", {rss_url: this.URL}, function(result) {
                // TODO save most recent values in cache
                if(result.status === "ok") {
                    _this.items = result.items.slice(0, 5); // TODO: use options.MaxItems in place of constant 5

                    $.each(_this.items, function(i, item) {
                        _this.setItemState(item, !_this.isNewItem(item));
                    });

                    if($.isFunction(fetchCompleted)) fetchCompleted(_this);
                } else if($.isFunction(fetchFailed)) fetchFailed(_this, result.errorMessage);
            });
        }
    };
    
    return feed;
}