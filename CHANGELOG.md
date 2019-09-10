# CHANGELOG


## 5.2.13

* Add IntersectObserver

### Validator

* Change `getRadioList` second paramater to an object with 2 properties: `selector` and `othersOnly`
* Add the property `$otherRadioOfGroup` to Input object

### Mediaqueries events

* Remove parameter `callbackOnQuit`
* Add the possibility to call function when entering, leaving a mediaquery or on both
* Add 3 static properties: `MediaQueriesEvents.TYPE_ON_ENTER` , `MediaQueriesEvents.TYPE_ON_LEAVE`  and `MediaQueriesEvents.TYPE_ON_BOTH`
* Add a new optional parameter `type` on `register` function wich accept on of the 3 static properties. By default, it's set to `MediaQueriesEvents.TYPE_ON_ENTER`


## 5.2.12

* Add dependencies
* Update documentation

### Validator

* Rename validator tools function: `getAllGroup` ==> `getRadioList`, `isRadioGroupChecked` ==> `isRadioListChecked`
* `getLabel` function now return a string or an array of string
* Add new function `getLabelElement` to return label HTMLElement or an array of HTMLElement

### Window events

* Add new `viewportInfo` property
* Rename property: `scrollPosition` ==> `scrollInfo`, `windowSize` ==> `windowInfo`, `documentSize` ==> `documentInfo`
* Change callback function signature: `(windowSize, documentSize, scrollPosition, eventName) => {}` ==> `({windowInfo, documentInfo, scrollInfo, viewportInfo}, eventName, originalEvent) => {}`

### History controller

* Remove `getState` function and replace it by `state` property.


## 5.2.11

* Fix gesture callback target

### Mediaqueries events

* Add new properties (`currentBreakpoint`, `list`) and deprecate some functions
* Add a new way of initialize breakpoint objects (`min` and `max` instead of `query`)
* Add new `unit` options

### Window events

* Add new properties (scroll, windowSize, documentSize) and deprecate some functions


## 5.2.10

* Custom events: Fix DOM elements handling


## 5.2.9

* Popin: Allow manual handle of http error


## 5.2.8

* fetch: Add X-Requested-With header to fetch calls


## 5.2.7

* Gesture: Fix preventDefault and stopPropagation functions


## 5.2.6

* Update UrlParser: Convert non string value, add `getParam` function.


## 5.2.5

* Add `cssPositionning` option
* Fix Autocomplete variable name in the select function
* Fix click on items


## 5.2.4

* Fix AbortController support test


## 5.2.3

* Improve Scroll Snap


## 5.2.2

* Update Scroll Snap
* Add color helper


## 5.2.1

* Remove native polyfill. Use Symfony polyfill package instead.
* Allow to define gesture options on slider controls


## 5.2.0

* Replace Reqwest dependency with window.fetch
* Replace Bean dependency with custom event manager
* Remove mousewheel event manager. Use the on('wheel', ...) function from the event manager


## 5.1.5

* Fix extend function


## 5.1.4

* Fix options in gesture module
* Fix scroll snap module


## 5.1.2

* Update gesture callbacks name
    * touchstart => start
    * touchmove => move
    * touchend => end
* Update gesture prevent default and stop propagation functions name
    * preventTouchstart => preventStart
    * stopPropagationTouchstart => stopPropagationStart
    * preventTouchmove => preventMove
    * stopPropagationTouchmove => stopPropagationMove
    * preventTouchend => preventEnd
    * stopPropagationTouchend => stopPropagationEnd


## 5.1.1

* Fix google map multiple call + typo


## 5.1.0

* Add new polyfill (Element.append, ...)
* Add JSDoc
* Add has-localstorage helper
