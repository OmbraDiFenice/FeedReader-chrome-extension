/*
	Structure of the json option object
	
	Fixed values:
{
	"Sorting": [
				{
					"Name": display name,
					"Id": unique string id used as value in <option> tag
				},
				{
					...
				}
			],
	
	"PopupDensity": [
					{
						"Name": display name,
						"Id": unique string id used as value in <option> tag and as class name for feeds lines in the popup
					},
					{
						...
					}
				],
	
	"FontSize": [
				{
					"Name": display name,
					"Id": unique string id used as value in <option> tag and as value in the css
				}
			],
	
	"FontFamily": [
					{
						same as FontSize
					}
				],
		
	"FontWeight": [
				{
					same as FontSize
				}
			]
}

	Customizable option values:
{
	"Feeds": [
				{
					"Name": display name,
					"ID": nuber, unique id for the feed,
					"URL": feed url,
					"Group": qualified (sub)group name or none,
					"Sorting": enumerated choice or default,
					"RefreshInterval": number of minutes or default,
					"MaxItems": number or default
				},
				{
					...
				}
		],
		
	"Groups": [
				{
					"Name": display name,
					"QualifiedName": qualified name, in java-package style for subgroups hierarchy,
					"Id": unique numeric id used as value in <option> tag
				},
				{
					...
				}
			],
	
	"DefaultFeedOptions": {
				"Sorting": enumerated choice,
				"RefreshInterval": number of minutes,
				"MaxItems": number (0 for unlimited)
			},
	
	"UI": {
			"Popup": {
						"MaxPopupWidth": number,
						"MaxPopupHeight": number,
						"Density": enumerated choice,
						"ShowGroups": boolean
					},
			"FeedFont": {
					"Family": enumerated choice (css defaults),
					"Size": number (px) or enumerated choice (css defaults),
					"Unseen ": {
								"Color": hex color code (color picker),
								"Weight": enumerated choice (css defaults),
								"Italic": boolean
							},
					"Unread": {
								same as Unseen
							},
					"Read": {
								same as Unseen
							},
					"Error": {
								same as Unseen
							}
					},
			"ItemFont": {
						same as ItemFont, excluding Error
					},
			"Notification": {
							"Sound": enumerated choice (based on the available sounds),
							"AudioNotification": boolean,
							"IconAnimation": boolean,
							"ShowUpdateCounter": boolean
						}
		}
}
*/

/* Constructor for the Options object */
function Options() {
	/* **** public **** */

	/* build the structure of the option file using default values */
	this.Feeds = []; // feed list
	this.Groups = []; // feed group list
	this.DefaultFeedOptions = getDefaultFeedOptions() // default values for feeds which don't specify them
	this.UI = { // UI settings
		Popup: new PopupOptions(500, 360, '', false)
	};
	
	// counter for id assignment to new feeds
	this.nextID = 1;
}

/* add a new feed to the feed list */
function addFeed(newFeed) {
	newFeed.ID = this.nextID++;
	this.Feeds.push(newFeed);
}

/* store this option object in the cloud */
function store() {
	function storeOption(optionName, object) {
		var temp = {};
		temp[optionName] = object;
		chrome.storage.sync.set(temp, function() {
			if(chrome.runtime.lastError) {
				console.log("error on option store, message: " + chrome.runtime.lastError.message);
			}
		});
	}
	
	storeOption("nextID", this.nextID);

	// store feeds separately using the html id as key
	var feedKeys = [];
	$.each(this.Feeds, function(i, feed) {
		var key = getHtmlFeedID(feed.ID);
		storeOption(key, feed);
		feedKeys.push(key);
	});
	storeOption("feedKeys", feedKeys);

	// TODO: store groups like feeds
	
	// store the DefaultFeedOptions field only if there are differences with the default
	var defaultFeedOptionsDiff = objectDifference(getDefaultFeedOptions(), this.DefaultFeedOptions);
	if($.isEmptyObject(defaultFeedOptionsDiff)) {
		storeOption("defaultFeedOptions", defaultFeedOptionsDiff);
	}
	
	// TODO: store the UI components the same way as the defaultFeedOptions
	
}

/* load the options from the cloud, or use the defaults set in the constructor.
 * Return a deferred object which is resolve or rejected on completion.
 */
function load() {
	var deferred = $.Deferred();
	
	function loadOption(optionName) {
		var temp = $.Deferred();
		chrome.storage.sync.get(optionName, function(items) {
			if(chrome.runtime.lastError) {
				console.log("error on option load, message: " + lastError.message);
				deferred.reject(chrome.runtime.lastError.message);
				return;
			}
			if($.isEmptyObject(items)) { // NOTE: this check has to be placed after the chrome.runtime.lastError check
				console.log("property " + optionName + " not stored in remote options. Skipping")
				temp.reject();
				return;
			}
			temp.resolve(items);
		});
		
		return temp;
	}
	
	var options = this;

	var nextIDDef = loadOption("nextID").done(function(data) {
		options.nextID = data.nextID;
	});
	
	// load the feed list
	var feedsDef = loadOption("feedKeys").done(function(data) {
		var feedKeys = data.feedKeys;
		$.each(feedKeys, function(i, feedKey) {
			loadOption(feedKey).done(function(data) { options.Feeds.push(data[feedKey]) });
		});
	});
	
	// load the default feed options
	var defaultFeedOptionsDef = loadOption("defaultFeedOptions").done(function(data) {
		this.DefaultFeedOptions = $.extend(true, options.defaultFeedOptions, data.defaultFeedOptions)
	});

	$.when(feedsDef, defaultFeedOptionsDef)
		.always(function() {
			console.log("loading completed");
			deferred.resolve();
		});
	
	return deferred;
}

function getFeedByID(id) {
	var options = this;
	for(var i=0; i < options.Feeds.length; i++){
		if(options.Feeds[i].ID === id) {
			return options.Feeds[i];
		}
	}
	return null;
}