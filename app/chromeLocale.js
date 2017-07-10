angular.module('app').directive('chromeLocale', function () {
    return {
        restrict: 'A',
        link: function(scope, element, attributes) {
            element.text(chrome.i18n.getMessage(attributes.chromeLocale));
        }
    }
});