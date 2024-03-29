# CHANGELOG


## 6.2.15

* DragSlider: Make GSAP optional


## 6.2.14

* Remove Modernizr


## 6.2.13

* Autocomplete: Add method ajax call option


## 6.2.12

* Fix import name


## 6.2.11

* Fix onTransitionEnd import


## 6.2.10

* Fix file import name


## 6.2.9

* Add transition helper


## 6.2.8

* Transition and animation end: Handle properties filter and pseudo elements


## 6.2.7

* Custom Events: Add target element as param of the callback function on delegated event


## 6.2.6

* Slider: add a function to get all slides of a page + Add the pageIndex in slide's properties


## 6.2.5

* Slider: expose list of slide objects + expose page number for each slide


## 6.2.4

* Accordion: add an option to avoid closing all tabs


## 6.2.3

* Update DragSlider module


## 6.2.2

* Add DragSlider module
* Update touchdevice detection method
* Slider:
    * Add function to start and stop auto slide
    * Fix display when no loop and several slides per page


## 6.2.1

* Add a scope to the package name for NPM publish
* Update doc
* Add CSS custom variable Modernizr test


## 6.1.3

* Add CSS property setter/getter function


## 6.1.2

* Fix event propagation on select skin button


## 6.1.1

* Handle idle state in "wait" function: `wait('idle').then(...)`


## 6.1.0

* General:
    * Refactor
    * Minor updates
    * Cleanup
    * Update Tweenlite 2.x to GSAP 3.x

* MediaQueriesEvents:
    * Add `getValue` function

* ScrollSnap:
    * Update Tweenlite 2.x to GSAP 3.x
    * Move GSAP functions in options to override them and be able to use another library

* Slider:
    * Update Tweenlite 2.x to GSAP 3.x
    * Move GSAP functions in options to override them and be able to use another library

* Add new WegGL category
    * Add GLImageTransition


## 6.0.16

* Autocomplete:
    * Add resetField, resetResults and reset functions


## 6.0.15

* Helpers:
    * Update debounce function


## 6.0.14

* SkinSelect:
    * Fix item focus and scroll


## 6.0.13

* Autocomplete:
    * Fix repeated query parameter


## 6.0.12

* Select skin
    * Fix focus on load


## 6.0.11

* Autocomplete:
    * Add `enable` and `disable` functions


## 6.0.10

* Validator:
    * Change the default live validation event name on input text from 'change' to 'input'
* DOM:
    * Minor updates
    * The `wrap` function now can handle an HTMLElement as second parameters
* Autocomplete:
    * Add a `showAll` function to display all items of the list in source mode.
* SkinSelect:
    * Add keyboard feature


## 6.0.9

* Validator:
    * Update email validation Regular Expression
    * Add a loose one: Add data-loose on the input to use it


## 6.0.8

* DOM/Class:
    * Handle array of css classes
    * Add sClass function to replace a class by another
* Update extend and copy functions
* Update UrlParser


## 6.0.7

* Slider: Fix init options bug on `moveByPage` property


## 6.0.6

* Validator: Fix live validation on input hidden


## 6.0.5

* Add new Accordion module
* Add new Tabs module
* Select element skin
    * Update the updateOptions function
    * Add setValid/setInvalid function
* Add function to compute the distance between 2 coordinates
* Rename history to HistoryController
* Update input file skin
* Add quick template module
* ScrollSnap: Fix bug which occurs when you just tap into the element without moving


## 6.0.4

* Select element skin
    * Improve init when skin elements already exist in the DOM


## 6.0.3

* Popin
    * Add function to programmatically open and close the loading layer


## 6.0.2

* Validator
    * Add live validation system
    * Add getQueryFromForm function
    * Update validator scaffolding. Split everything that was in `import { validatorTools } from '@creative-web-solution/front-library/Modules/Validator';` in the `@creative-web-solution/front-library/Modules/Validator/Tools` folder.


## 6.0.1

* Add notification module


## 6.0.0

**Not compatible with 5.x.x version**

* Remove builder
* Remove dependencies system to use classic JS `import` instead
* Add function to export in `front-library` project hosted on GitHub
* General files and folders renaming

### ScrollSnap

* Add new refresh options

### Mediaqueries events

* Add `on` and `off` function to bind specific breakpoint

### EventsManager

* Fix the auto unbind of the `one` function


## 5.2.14

* Fix SnapScroll bug


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
