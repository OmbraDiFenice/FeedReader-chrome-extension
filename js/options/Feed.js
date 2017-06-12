/**
 * For the complete definition of an Item see https://rss2json.com/docs
 * @typedef {Object} Item
 * @property {string} pubDate
 * @property {string} link
 */

var UNREAD = 0;
var READ = 1;

function getItemId(item) {
    var parser = document.createElement('a');
    parser.href = item.link;
    return parser.pathname + parser.search + parser.hash;
    //return item.link.match("^" + feed.url + "(.+)$")[1];
}

/**
 * @typedef {Object} Feed
 * @property {string} Name
 * @property {string} url
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

    /**
     * @type {Feed}
     */
    var feed = {
        name: name,
        url: URL,
        items: [],
        unreadItems: [],
        firstRun: true,
        errorMessage: undefined
    };

    function open(item) {
        chrome.tabs.create({url: item.link, active: false});
        feed.setAsRead(item, true);
        feed.store();
    }

    function setAsRead(item, setRead) {
        var id = getItemId(item);
        var i = this.unreadItems.indexOf(id);
        if (setRead) {
            if (i >= 0) {
                this.unreadItems.splice(i, 1);
            }
            item.state = READ;
        } else {
            if (i < 0) {
                this.unreadItems.push(id);
            }
            item.state = UNREAD;
        }
    }

    function update() {
        var d = $.Deferred();
        var _this = this;
        this.fetch()
            .then(function (fetchedItems) {
                $.each(fetchedItems, function (i, item) {
                    if (_this.firstRun)
                        _this.setAsRead(item, false);
                    else {
                        _this.setAsRead(item, _this.unreadItems.indexOf(getItemId(item)) < 0);
                    }
                });
                _this.firstRun = false;
                _this.items = fetchedItems;
                d.resolve();
            }, function (message) {
                _this.errorMessage = message;
                d.reject(message);
            });
        return d;
    }

    function store() {
        var storedInfo = $.extend({}, feed);
        delete storedInfo.items;

        console.log(storedInfo);
        g_store(this.url, storedInfo);

        return this;
    }

    function fetch() {
        var d = $.Deferred();
        feed.errorMessage = undefined;
        $.getJSON("http://api.rss2json.com/v1/api.json", {rss_url: feed.url}, function (result) {
            if (result.status === "ok") {
                result.items.splice(2);
                d.resolve(result.items);
            } else {
                console.log(result.message);
                d.reject(result.message);
            }
        }).fail(function (data) {
            d.reject(data);
        });
        return d;
    }

    feed.store = store.bind(feed);
    feed.update = update.bind(feed);
    feed.fetch = fetch.bind(feed);
    feed.setAsRead = setAsRead.bind(feed);
    feed.open = open.bind(feed);

    return feed;
}