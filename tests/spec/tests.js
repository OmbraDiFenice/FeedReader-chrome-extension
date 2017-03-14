/**
 * Created by Stefano on 13/03/2017.
 */
describe("Feed", function() {
    var feed = Feed("Rossa", "http://ilnerostabenesututto.blogspot.com/feeds/posts/default");

    it("creates empty Feed", function(){
        expect(feed.name).toBe("Rossa");
        expect(feed.URL).toBe("http://ilnerostabenesututto.blogspot.com/feeds/posts/default");
        expect(feed.unreadItems).toEqual({});
        expect(feed.items).toEqual([]);
    });

    it("fetches some items", function(done){
        feed.fetch(function(f){
            expect(f.items.length).not.toBe(0);
            expect(feed.items.length).not.toBe(0);
            done();
        }, function(f, msg) {
            done.fail(msg);
        });
    });
});