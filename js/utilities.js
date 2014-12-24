function stripHTML(text) {
	return text.substring(0, text.indexOf('<'));
}

function getHtmlFeedID(feedID) {
	return "feed_" + feedID;
}

function getFeedIDFromHtml(htmlFeedID) {
	return htmlFeedID.substring(5);
}

// Source: http://stackoverflow.com/questions/497790
var dates = {
    convert:function(d) {
        // Converts the date in d to a date-object. The input can be:
        //   a date object: returned without modification
        //  an array      : Interpreted as [year,month,day]. NOTE: month is 0-11.
        //   a number     : Interpreted as number of milliseconds
        //                  since 1 Jan 1970 (a timestamp) 
        //   a string     : Any format supported by the javascript engine, like
        //                  "YYYY/MM/DD", "MM/DD/YYYY", "Jan 31 2009" etc.
        //  an object     : Interpreted as an object with year, month and date
        //                  attributes.  **NOTE** month is 0-11.
        return (
            d.constructor === Date ? d :
            d.constructor === Array ? new Date(d[0],d[1],d[2]) :
            d.constructor === Number ? new Date(d) :
            d.constructor === String ? new Date(d) :
            typeof d === "object" ? new Date(d.year,d.month,d.date) :
            NaN
        );
    },
    compare:function(a,b) {
        // Compare two dates (could be of any type supported by the convert
        // function above) and returns:
        //  -1 : if a < b
        //   0 : if a = b
        //   1 : if a > b
        // NaN : if a or b is an illegal date
        // NOTE: The code inside isFinite does an assignment (=).
        return (
            isFinite(a=this.convert(a).valueOf()) &&
            isFinite(b=this.convert(b).valueOf()) ?
            (a>b)-(a<b) :
            NaN
        );
    },
    inRange:function(d,start,end) {
        // Checks if date in d is between dates in start and end.
        // Returns a boolean or NaN:
        //    true  : if d is between start and end (inclusive)
        //    false : if d is before start or after end
        //    NaN   : if one or more of the dates is illegal.
        // NOTE: The code inside isFinite does an assignment (=).
       return (
            isFinite(d=this.convert(d).valueOf()) &&
            isFinite(start=this.convert(start).valueOf()) &&
            isFinite(end=this.convert(end).valueOf()) ?
            start <= d && d <= end :
            NaN
        );
    }
}

/* return an object containing only the differences between the two objects,
 * that is containing only the values of obj2 that are not present or equal
 * in obj1.
 * If the two objects are equal return the empty object
 */
function objectDifference(obj1, obj2) {
	var diff = {}
	$.each(obj2, function(key, value) {
		if(!obj1.key || value !== obj1.key) {
			diff.key = value;
		}
	});
	return diff;
}

/* Set the badge of the browser action to display the number of feeds containing
 * unread items. The badge disappears if there are no such feeds.
 */
function setBadge() {
	chrome.storage.local.get("feedCache", function(result) {
		var feedCache = result.feedCache;
		
		var count = 0;
		$.each(options.Feeds, function(i, feed) {
			if(typeof feedCache[feed.ID] != "undefined") {
				var increment = 0;
				$.each(feedCache[feed.ID], function(i, item) {
					if(typeof feed.readItems[item.link] === 'undefined' || dates.compare(new Date(feed.readItems[item.link]), new Date(item.publishedDate)) < 0) {
						increment = 1;
					}
				});
				count += increment;
			}
		});
		
		count = (count == 0) ? "" : count + "";
		
		var currentBadge = "";
		chrome.browserAction.getBadgeText({}, function(badgeText) {
			currentBadge = badgeText;
			if(currentBadge != count) {
				chrome.browserAction.setBadgeText({ text : count });
			}
		});
	});
}