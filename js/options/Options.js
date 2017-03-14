/*
	Global options
{
	"RefreshInterval": number of minutes,
	"MaxItems": number (0 for unlimited),

	"UI": {

		"Text": {
			"Unseen ": {
				"Color": hex color code (color picker),
				"Bold": boolean,
				"Italic": boolean
			},
			"Unread": same as Unseen,
			"Read": same as Unseen,
			"Error": same as Unseen
		}

		 "Popup": {
			 "MaxPopupWidth": number,
			 "MaxPopupHeight": number
		 },

		"Notification": {
			"Sound": number (mapped to filename),
			"AudioNotification": boolean,
			"IconAnimation": boolean,
			"ShowUpdateCounter": boolean
		}
	}

}

*/

/**
 * Constructor for the Options object
 * @returns {{}} an empty Options object, call load() on it to get the options from the Chrome cloud storage
 * @constructor
 */
function Options() {
    const chromeOptionName = "Options";

	var defaultOptions = {
		"RefreshInterval": 0.2,
		"MaxItems": 5,

		"UI": {
			"Text": {
				"Unread": {
					"Color": 0xFF0000,
					"Bold": true,
					"Italic": false
				},
				"Read": {
					"Color": 0x000000,
					"Bold": false,
					"Italic": false
				},
				"Error": {
					"Color": 0x0000FF,
					"Bold": true,
					"Italic": true
				}
			},

            "Popup": {
                "MaxPopupWidth": 500,
                "MaxPopupHeight": 360
            },

            "Notification": {
                "Sound": "sounds/bike-bell.wav", // TODO map numbers to predefined filenames
                "AudioNotification": true,
                "IconAnimation": true,
                "ShowUpdateCounter": true
            }
	    }
	};

    var options = {};

    options.load = function() {
        var ret = $.Deferred();
        load(chromeOptionName)
            .done(function(data) {
                $.extend(options, data, defaultOptions);
                console.log(chromeOptionName + " load completed");
                console.log(options);
                ret.resolve(options);
            })
            .fail(function(message) {
                console.log(message);
                ret.reject(message);
            });
        return ret;
    };

    options.store = function() {
        return store(chromeOptionName, options)
            .done(function() {
                chrome.runtime.sendMessage({method: "refreshOptions"});
                console.log(chromeOptionName + " storage completed");
            })
            .fail(function(message) {
                console.log(message);
            });
    };

    return options.load();
}