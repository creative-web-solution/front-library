# CHANGELOG


## 7.1.20

* Remove legacy Modernizr addons
* Add CSSTween feature
* [DragSlider] Refacto GSAP


## 7.1.19

* [DragSlider] Fix variable init in goToItem


## 7.1.18

* [DragSlider] Expose some properties + allow item index in goToItem function


## 7.1.17

* [DragSlider] Rework + add refresh function


## 7.1.16

* Fix doc
* [DragSlider] Fix "first item reach start position" condition


## 7.1.15

* Fix type in `wait()` helper


## 7.1.14

* EventManager: Fix bug on array
* SkinSelect: Update title on select when dispatch event is off


## 7.1.13

* SkinSelect: Update fire event on select


## 7.1.12

* Validator: Use dayjs library to validate date


## 7.1.11

* Validator: Update `date` validator


## 7.1.10

* SelectSkin: Change selection feature, add:
    * select( param: number | string | HTMLElement )
    * selectByIndex( index: number )
    * selectByOption( optionOrItem: HTMLElement )
    * selectByValue( value: string | number )


## 7.1.9

* SelectSkin: Fix templating


## 7.1.7

* Typescript: Fix some type


## 7.1.6

* Minor fix


## 7.1.5

* Typescript: Fix some type


## 7.1.4

* Typescript: Fix tsify and browserify compatibility
* HistoryController: Remove UrlParser for window.URL


## 7.1.3

* Typescript: Fix some type


## 7.1.2

* Typescript: Fix some type


## 7.1.1

* Validator: Fix error message generation


## 7.1.0

* Typescript cleanup
* Remove micro templating modules
* Fix Validator missing files

**Compatibility warning:**

* SkinSelect: Change templating system
* Popin: Change templating system
* onImageLoad and onAllImagesLoad:
    * Update function signature
    * Update callback param from array to hash


## 7.0.7

* Add transition helpers function : `transitionWatcher`, `animationWatcher` and `killWatcher`


## 7.0.6

* onTransitionEnd: handle pseudo element and specific css property
* onAnimationEnd: handle pseudo element and specific animation name
* Popin: Fix typescript error


## 7.0.5

* ImageLoad: Fix bug


## 7.0.4

* Slider: Fix typescript error


## 7.0.3

* Add modules


## 7.0.2

* EventsManager: Fix event delegation


## 7.0.1

Move to TypeScript

