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
	this.DefaultFeedOptions = new FeedOptions('', 0.2, 5); // default values for feeds which don't specify them
	this.UI = { // UI settings
		Popup: new PopupOptions(500, 360, '', false)
	};
	
	/* **** private **** */
	var that = this;
	var nextID = 1;
	

	/* **** privileged **** */
	
	/* add a new feed to the feed list */
	this.addFeed = function(newFeed) {
		newFeed.ID = nextID++;
		this.Feeds.push(newFeed);
	}
	
	/* store this option object in the cloud */
	this.store = function() {
		chrome.storage.sync.set({'options': this}, function() {
			if(chrome.runtime.lastError) {
				console.log("error on option store, message: " + lastError.message);
			}
		});
	}
	/* load the options from the cloud, or use the defaults set in the constructor.
	 * Return a deferred object which is resolve or rejected on completion.
	 */
	this.load = function() {
		var deferred = $.Deferred();
		chrome.storage.sync.get('options', function(items) {
			if(chrome.runtime.lastError) {
				console.log("error on option load, message: " + lastError.message);
				deferred.reject(chrome.runtime.lastError.message);
				return;
			}
			
			$.extend(that, items.options);
			
			deferred.resolve();
		});
		
		return deferred;
	}
}