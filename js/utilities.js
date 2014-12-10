function stripHTML(text) {
	return text.substring(0, text.indexOf('<'));
}

function getHtmlFeedID(feedID) {
	return "feed_" + feedID;
}