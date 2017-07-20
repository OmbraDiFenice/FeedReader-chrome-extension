/**
 * Created by Stefano on 19/07/2017.
 */
// Listen for messages
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    console.log(msg);
    console.log(sender);
    console.log(sendResponse);
    // If the received message has the expected format...
    if (msg.text === 'get_feed_source') {
        var links = document.querySelectorAll("link[type='application/rss+xml']");
        var feeds = [];
        for(var i = 0; i < links.length; i++) {
            feeds.push({
                title: links[i].title,
                link: links[i].href
            });
        }

        console.log("detected feed:");
        console.log(feeds);

        sendResponse(feeds);
    }
});