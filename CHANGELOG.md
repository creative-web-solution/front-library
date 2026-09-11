# CHANGELOG

## 7.1.58

- [Popin]: Fix trap focus bug

## 7.1.57

- [KeyboardHandler]: Handle onHome and onEnd callbak. Set onNext as RIGHT or DOWN and onPrevious as LEFT or UP.

## 7.1.56

- [Popin]: Handle modal tabulation with iframe

## 7.1.55

- [Popin]: Rework accessibility

## 7.1.54

- [Autocomplete]: Remove shouldMarkValue configuration

## 7.1.53

- Add AriaAnnouncementHelper

## 7.1.52

- [Popin]: Fix tabulation inside popin

## 7.1.51

- [Validator]: Update error message selection

## 7.1.50

- [Autocomplete]: Rework module
- [DOM]: Update Index function
- [DOM]: Add type to strToDOM
- [QuickTemplate]: Add params for opening and closing tag

## 7.1.49

- [Accordion]: Fix bug when a tab is opened at start

## 7.1.48

- [MediaQueriesEvents]: Add position check function

## 7.1.47

- [Slider]: Fix bullet pager

## 7.1.46

- [Slider]: Fix bullet pager

## 7.1.45

- [Slider]: Fix type
- [DragSlider]: The feature that make slide outside viewport inert is tied to an option

## 7.1.44

- [SkinSelect]: Fix click handler on full skinned select

## 7.1.43

- [Validator]: Add max file size validation

## 7.1.42

- [Popin]: Add popin element in callback function param

## 7.1.41

- [Validator]: Add feature to cancel validation on a field. Do not validate a disabled field.

## 7.1.40

- [Slider]: Improve auto slide function

## 7.1.39

- [DragSlider]: Fix end positioning

## 7.1.38

- [Slider]: Handle popin inside the background layer

## 7.1.37

- [Validator]: Add specific event handling in live validation for input file.

## 7.1.36

- [DragSlider]: Fix end positioning when margin right and left are not equals

## 7.1.35

- [Accordion]: Rework

## 7.1.34

- [DragSlider]: Add new params to onChangeState callback

## 7.1.33

- [DragSlider]: Update delta computing

## 7.1.32

- [Autocomplete]: Fix Typescript type

## 7.1.31

- [DragSlider]: Fix the move range when using api

## 7.1.30

- [DragSlider]: Fix link cancellation

## 7.1.29

- [DragSlider]: Fix callback issue

## 7.1.28

- [YouTubePlayer]: Update types + use ready event to handle end of loading

## 7.1.27

- [Slider]: Remove gsap
- [DragSlider]
    - Remove gsap
    - Add accessibility feature
    - Take last item margin in account
    - Improvements
- [YouTubePlayer]: Update parameters doc
- [Popin]:
    - Fix focus issue
    - Handle background to be inside the popin

## 7.1.26

- Remove unused types
- Fix insert function
- Use $target instead of e.target in EventManager callbacks

## 7.1.25

- [Defer] Fix type

## 7.1.24

- [Gesture] Fix currentTarget
- [EventsManager] Callback signature harmonization

## 7.1.23

- [TransitionHelpers] Fix delay issue

## 7.1.22

- [Validator] Fix MultiRequired validator

## 7.1.21

- [Validator] Avoid registering the same validator several times
- [Validator] Add a function to remove a validator

## 7.1.20

- Remove legacy Modernizr addons
- Add CSSTween feature
- [DragSlider] Refacto GSAP

## 7.1.19

- [DragSlider] Fix variable init in goToItem

## 7.1.18

- [DragSlider] Expose some properties + allow item index in goToItem function

## 7.1.17

- [DragSlider] Rework + add refresh function

## 7.1.16

- Fix doc
- [DragSlider] Fix "first item reach start position" condition

## 7.1.15

- Fix type in `wait()` helper

## 7.1.14

- EventManager: Fix bug on array
- SkinSelect: Update title on select when dispatch event is off

## 7.1.13

- SkinSelect: Update fire event on select

## 7.1.12

- Validator: Use dayjs library to validate date

## 7.1.11

- Validator: Update `date` validator

## 7.1.10

- SelectSkin: Change selection feature, add:
    - select( param: number | string | HTMLElement )
    - selectByIndex( index: number )
    - selectByOption( optionOrItem: HTMLElement )
    - selectByValue( value: string | number )

## 7.1.9

- SelectSkin: Fix templating

## 7.1.7

- Typescript: Fix some type

## 7.1.6

- Minor fix

## 7.1.5

- Typescript: Fix some type

## 7.1.4

- Typescript: Fix tsify and browserify compatibility
- HistoryController: Remove UrlParser for window.URL

## 7.1.3

- Typescript: Fix some type

## 7.1.2

- Typescript: Fix some type

## 7.1.1

- Validator: Fix error message generation

## 7.1.0

- Typescript cleanup
- Remove micro templating modules
- Fix Validator missing files

**Compatibility warning:**

- SkinSelect: Change templating system
- Popin: Change templating system
- onImageLoad and onAllImagesLoad:
    - Update function signature
    - Update callback param from array to hash

## 7.0.7

- Add transition helpers function : `transitionWatcher`, `animationWatcher` and `killWatcher`

## 7.0.6

- onTransitionEnd: handle pseudo element and specific css property
- onAnimationEnd: handle pseudo element and specific animation name
- Popin: Fix typescript error

## 7.0.5

- ImageLoad: Fix bug

## 7.0.4

- Slider: Fix typescript error

## 7.0.3

- Add modules

## 7.0.2

- EventsManager: Fix event delegation

## 7.0.1

Move to TypeScript
