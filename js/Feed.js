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
        readItems: [],
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
        var i = feed.unreadItems.indexOf(id);
        var j = feed.readItems.indexOf(id);
        if (setRead) {
            if (i >= 0) {
                feed.unreadItems.splice(i, 1);
            }
            if (j < 0) {
                feed.readItems.push(id);
            }
            item.state = READ;
        } else {
            if (i < 0) {
                feed.unreadItems.push(id);
            }
            if (j >= 0) {
                feed.readItems.splice(j, 1);
            }
            item.state = UNREAD;
        }
    }
    
    function readAll() {
        var _this = feed;
        $.each(feed.items, function(i, item) {
            _this.setAsRead(item, true);
        });
        feed.store();
    }

    function update() {
        var d = $.Deferred();
        var _this = feed;
        feed.fetch()
            .then(function (fetchedItems) {
                $.each(fetchedItems, function (i, item) {
                    if (_this.firstRun)
                        _this.setAsRead(item, false);
                    else {
                        _this.setAsRead(item, _this.readItems.indexOf(getItemId(item)) >= 0);
                    }
                });

                // remove old stored items that are no longer fetched
                var dictFetchedItems = {};
                angular.forEach(fetchedItems, function (item) {
                    dictFetchedItems[getItemId(item)] = true;
                });
                angular.forEach(_this.unreadItems, function(item, i) {
                    if(!dictFetchedItems[item]) {
                        _this.unreadItems.splice(i, 1);
                    }
                });
                angular.forEach(_this.readItems, function(item, i) {
                    if(!dictFetchedItems[item]) {
                        _this.readItems.splice(i, 1);
                    }
                });

                _this.firstRun = false;
                _this.items = fetchedItems;
                feed.store();
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
        g_store(feed.url, storedInfo);

        return feed;
    }

    function fetch() {
        var d = $.Deferred();
        feed.errorMessage = undefined;
        $.getJSON("http://api.rss2json.com/v1/api.json", {rss_url: feed.url/*, api_key: "ummegacfozg98eymvfnznivwdia3y6jcmzq4ghvg"*/}, function (result) {
            if (result.status === "ok") {
                //result.items.splice(2);
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
    feed.readAll = readAll.bind(feed);

    return feed;
}