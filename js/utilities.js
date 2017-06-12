function getHtmlFeedID(feedID) {
    return "feed_" + feedID;
}

/**
 * Asynchronously load an object from Chrome cloud storage.
 * @param key the name used to store the object in the cloud
 * @returns {JQueryDeferred<T>} a deferred resolved when the load completes. If rejected, the callback receives the error message
 */
function g_load(key) {
    var d = $.Deferred();
    chrome.storage.sync.get(key, function (items) {
        if (chrome.runtime.lastError) {
            d.reject("error loading " + key + ", message: " + chrome.runtime.lastError.message);
        } else {
            if (items[key] !== undefined)
                d.resolve(items[key]);
            else
                d.resolve({});
        }
    });
    return d;
}

/**
 * Asynchronously stor ean object in Chrome cloud storage.
 * @param key the name used to retrieve the object with load()
 * @param object the object to store
 * @returns {JQueryDeferred<T>} a deferred resolved when the store completes. If rejected, the callback receives the error message
 */
function g_store(key, object) {
    var d = $.Deferred();
    var temp = {};
    temp[key] = object;
    chrome.storage.sync.set(temp, function () {
        if (chrome.runtime.lastError) {
            d.reject("error storing " + key + ", message: " + chrome.runtime.lastError.message);
        } else {
            d.resolve();
        }
    });
    return d;
}

// Source: http://stackoverflow.com/questions/497790
var dates = {
    /**
     * Converts the date in d to a date-object. The input can be:
     *   a date object: returned without modification
     *  an array      : Interpreted as [year,month,day]. NOTE: month is 0-11.
     *   a number     : Interpreted as number of milliseconds
     *                  since 1 Jan 1970 (a timestamp)
     *   a string     : Any format supported by the javascript engine, like
     *                  "YYYY/MM/DD", "MM/DD/YYYY", "Jan 31 2009" etc.
     *  an object     : Interpreted as an object with year, month and date
     *                  attributes.  **NOTE** month is 0-11.
     * @param d {Date|Number[]|Number|string|Object} see above
     * @param d.year
     * @param d.month
     * @param d.date
     * @returns {Date} the corresponding Date object
     */
    convert: function (d) {
        // Converts the date in d to a date-object. The input can be:
        //   a date object: returned without modification
        //   an array     : Interpreted as [year,month,day]. NOTE: month is 0-11.
        //   a number     : Interpreted as number of milliseconds
        //                  since 1 Jan 1970 (a timestamp) 
        //   a string     : Any format supported by the javascript engine, like
        //                  "YYYY/MM/DD", "MM/DD/YYYY", "Jan 31 2009" etc.
        //  an object     : Interpreted as an object with year, month and date
        //                  attributes.  **NOTE** month is 0-11.
        return (
            d.constructor === Date ? d :
                d.constructor === Array ? new Date(d[0], d[1], d[2]) :
                    d.constructor === Number ? new Date(d) :
                        d.constructor === String ? new Date(d) :
                            typeof d === "object" ? new Date(d.year, d.month, d.date) :
                                NaN
        );
    },
    compare: function (a, b) {
        // Compare two dates (could be of any type supported by the convert
        // function above) and returns:
        //  -1 : if a < b
        //   0 : if a = b
        //   1 : if a > b
        // NaN : if a or b is an illegal date
        // NOTE: The code inside isFinite does an assignment (=).
        return (
            isFinite(a = this.convert(a).valueOf()) &&
            isFinite(b = this.convert(b).valueOf()) ?
            (a > b) - (a < b) :
                NaN
        );
    },
    inRange: function (d, start, end) {
        // Checks if date in d is between dates in start and end.
        // Returns a boolean or NaN:
        //    true  : if d is between start and end (inclusive)
        //    false : if d is before start or after end
        //    NaN   : if one or more of the dates is illegal.
        // NOTE: The code inside isFinite does an assignment (=).
        return (
            isFinite(d = this.convert(d).valueOf()) &&
            isFinite(start = this.convert(start).valueOf()) &&
            isFinite(end = this.convert(end).valueOf()) ?
            start <= d && d <= end :
                NaN
        );
    }
};

/* return an object containing only the differences between the two objects,
 * that is containing only the values of obj2 that are not present or equal
 * in obj1.
 * If the two objects are equal return the empty object
 */
function objectDifference(obj1, obj2) {
    var diff = {};
    $.each(obj2, function (key, value) {
        if (!obj1.key || value !== obj1.key) {
            diff.key = value;
        }
    });
    return diff;
}



function isNewItem(feed, item) {
    return typeof feed.readItems[item.link] === 'undefined' || dates.compare(new Date(feed.readItems[item.link]), new Date(item.pubDate)) < 0;
}

/**
 * Set the badge and play sound to display the number of feedList containing
 * unread items. The badge disappears if there are no unread items.
 */
function browserActionNotification(feedList) {

    var bgColor = "#0000FF";

    var newItems = 0;
    for(var i = 0; i < feedList.length; i++) {
        if(feedList[i].unreadItems.length > 0 || feedList[i].errorMessage) newItems++;
        if(feedList[i].errorMessage) bgColor = "#FF6B72";
    }
    
    chrome.browserAction.getBadgeText({}, function (text) {
        var currVal = parseInt(text);
        if (newItems != 0 && newItems != currVal) {
            var audio = new Audio();
            audio.src = "sounds/bike-bell.wav";
            audio.play();
            chrome.browserAction.setBadgeText({text: "" + newItems});
            chrome.browserAction.setBadgeBackgroundColor({color: bgColor})
        } else if (newItems == 0) {
            console.log("no new items fetched");
            chrome.browserAction.setBadgeText({text: ""});
        }
    })
}