angular.module('app').service('ChromeStorage', function ($q) {
    /**
     * Asynchronously load an object from Chrome cloud storage.
     * @param key the name used to store the object in the cloud
     * @returns {JQueryDeferred<T>} a deferred resolved when the load completes. If rejected, the callback receives the error message
     */
    this.load = function (key) {
        var d = $q.defer();
        chrome.storage.sync.get(key, function(items) {
            if(chrome.runtime.lastError) {
                d.reject("error loading " + key + ", message: " + chrome.runtime.lastError.message);
            } else {
                if(items[key] !== undefined)
                    d.resolve(items[key]);
                else
                    d.resolve({});
            }
        });
        return d.promise;
    };

    /**
     * Asynchronously stor ean object in Chrome cloud storage.
     * @param key the name used to retrieve the object with load()
     * @param object the object to store
     * @returns {JQueryDeferred<T>} a deferred resolved when the store completes. If rejected, the callback receives the error message
     */
    this.store = function (key, object) {
        var d = $q.defer();
        var temp = {};
        temp[key] = object;
        chrome.storage.sync.set(temp, function() {
            if(chrome.runtime.lastError) {
                d.reject("error storing " + key + ", message: " + chrome.runtime.lastError.message);
            } else {
                d.resolve();
            }
        });
        return d.promise;
    };

});