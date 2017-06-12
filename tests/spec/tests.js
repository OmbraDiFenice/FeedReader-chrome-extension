/**
 * Created by Stefano on 13/03/2017.
 */
describe("Feed", function() {
    var feed = Feed("Rossa", "http://ilnerostabenesututto.blogspot.com/feeds/posts/default");

    it("creates empty Feed", function(){
        expect(feed.name).toBe("Rossa");
        expect(feed.url).toBe("http://ilnerostabenesututto.blogspot.com/feeds/posts/default");
        expect(feed.unreadItems).toEqual([]);
        expect(feed.items).toEqual([]);
        expect(feed.firstRun).toBe(true);
    });

    it("fetches some items", function(done){
        feed.fetch()
            .done(function(fetchedItems){
                expect(fetchedItems.length).not.toBe(0);
                expect(feed.firstRun).toBe(true);
                done();
            })
            .fail(function(f, msg) {
                done.fail(msg);
            });
    });

    it("updates items", function(done) {
        feed.update()
            .done(function(){
                expect(feed.items.length).not.toBe(0);
                expect(feed.firstRun).toBe(false);
                done();
            })
            .fail(function(f, msg) {
                done.fail(msg);
            });
    });

    describe("Set item read status", function() {
        it("set first item as read/unread", function() {
            var item = feed.items[0];
            var id = getItemId(item);

            expect(item.state).toBe(UNREAD);
            expect(feed.unreadItems.indexOf(id)).toBeGreaterThan(-1);

            feed.setAsRead(item, true);
            expect(item.state).toBe(READ);
            expect(feed.unreadItems.indexOf(id)).toBeLessThan(0);

            feed.setAsRead(item, false);
            expect(item.state).toBe(UNREAD);
            expect(feed.unreadItems.indexOf(id)).toBeGreaterThan(-1);
        });

        it("updates again", function(done) {
            feed.update()
                .done(function(){
                    expect(feed.items.length).not.toBe(0);
                    expect(feed.firstRun).toBe(false);
                    done();
                })
                .fail(function(f, msg) {
                    done.fail(msg);
                });
        });

        it("set second item as read/unread", function() {
            var item = feed.items[1];
            var id = getItemId(item);

            expect(item.state).toBe(UNREAD);
            expect(feed.unreadItems.indexOf(id)).toBeGreaterThan(-1);

            feed.setAsRead(item, true);
            expect(item.state).toBe(READ);
            expect(feed.unreadItems.indexOf(id)).toBeLessThan(0);

            feed.setAsRead(item, false);
            expect(item.state).toBe(UNREAD);
            expect(feed.unreadItems.indexOf(id)).toBeGreaterThan(-1);
        });
    });
});

describe("FeedList", function() {
    var feedList = FeedList();
    var feed = Feed("Rossa", "http://ilnerostabenesututto.blogspot.com/feeds/posts/default");
    
    it("creates empty FeedList", function() {
        expect(feedList.length).toBe(0);
    });
    
    it("add a Feed", function() {
        feedList.add(feed);
        expect(feedList.length).toBe(1);
    });

    it("remove a Feed", function() {
        feedList.remove("http://ilnerostabenesututto.blogspot.com/feeds/posts/default");
        expect(feedList.length).toBe(0);
    });

    it("does not add the same feed twice", function() {
        var one = feedList.add(feed);
        expect(one).toBe(true);
        expect(feedList.length).toBe(1);

        var two = feedList.add(feed);
        expect(two).toBe(false);
        expect(feedList.length).toBe(1);
    });
});