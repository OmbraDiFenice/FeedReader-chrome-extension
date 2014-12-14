/* Constructor for Feed object */
function Feed(name, url, group, options) {
	this.Name = name;
	this.URL = url;
	this.Group = group;
	this.readItems = {};
	if(typeof options != 'undefined') { // NOTE: the options object WILL be added if an empty object is passed. Just avoid that!
		this.Options = options;
	}	
}

/* Constructor for FeedOptions object */
function FeedOptions(sorting, refreshInterval, maxItems) {
	this.Sorting = sorting;
	this.RefreshInterval = refreshInterval;
	this.MaxItems = maxItems;
}

getDefaultFeedOptions = function() {
	return new FeedOptions('', 0.2, 5);
}